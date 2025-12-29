
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Square, Volume2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

const STEPS = 16;
const INSTRUMENTS = [
    { id: "kick", name: "Kick", color: "bg-rose-500" },
    { id: "snare", name: "Snare", color: "bg-amber-500" },
    { id: "hihat", name: "HiHat", color: "bg-cyan-500" },
    { id: "clap", name: "Clap", color: "bg-purple-500" },
];

export default function BeatMaker() {
    const [grid, setGrid] = useState<boolean[][]>(
        INSTRUMENTS.map(() => Array(STEPS).fill(false))
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [tempo, setTempo] = useState(120);

    const stepRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const contextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext
    useEffect(() => {
        const initAudio = () => {
            if (!contextRef.current) {
                contextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (contextRef.current.state === "suspended") {
                contextRef.current.resume();
            }
        };
        document.addEventListener("click", initAudio, { once: true });
        return () => document.removeEventListener("click", initAudio);
    }, []);

    const playSound = (type: string) => {
        const ctx = contextRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === "kick") {
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
            gain.gain.setValueAtTime(1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === "snare") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(100, now);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            // Noise could be added here for realism
        } else if (type === "hihat") {
            osc.type = "square";
            osc.frequency.setValueAtTime(800, now);
            // High pass would be better but simple tone for now
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === "clap") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(200, now);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            const ms = (60 / tempo) / 4 * 1000;
            timerRef.current = setInterval(() => {
                const step = (stepRef.current + 1) % STEPS;
                stepRef.current = step;
                setCurrentStep(step);

                // Play sounds
                grid.forEach((row, instIdx) => {
                    if (row[step]) playSound(INSTRUMENTS[instIdx].id);
                });

            }, ms);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, grid, tempo]);

    const toggleCell = (instIdx: number, stepIdx: number) => {
        const newGrid = [...grid];
        newGrid[instIdx][stepIdx] = !newGrid[instIdx][stepIdx];
        setGrid(newGrid);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20 select-none">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <Link href="/apps" className="p-2 -ml-2 rounded-full hover:bg-slate-800">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        <Volume2 size={20} className="text-rose-500" /> Beat Maker
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold">BPM</span>
                        <input
                            type="number"
                            value={tempo}
                            onChange={(e) => setTempo(Number(e.target.value))}
                            className="w-12 bg-slate-800 text-center rounded text-sm font-bold focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={clsx(
                            "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95",
                            isPlaying ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        )}
                    >
                        {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="p-4 space-y-6 overflow-x-auto">
                {INSTRUMENTS.map((inst, instIdx) => (
                    <div key={inst.id} className="space-y-1">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{inst.name}</div>
                        <div className="flex gap-1">
                            {Array.from({ length: STEPS }).map((_, stepIdx) => {
                                const active = grid[instIdx][stepIdx];
                                const isCurrent = currentStep === stepIdx;
                                return (
                                    <button
                                        key={stepIdx}
                                        onClick={() => toggleCell(instIdx, stepIdx)}
                                        className={clsx(
                                            "w-8 h-12 rounded-md transition-all border-b-4 relative",
                                            active ? `${inst.color} border-black/20` : "bg-slate-800 border-slate-900 hover:bg-slate-700",
                                            isCurrent ? "brightness-150 ring-2 ring-white z-10" : ""
                                        )}
                                    >
                                        {(stepIdx % 4 === 0) && !active && <div className="absolute top-1 left-1.5 w-1 h-1 bg-slate-600 rounded-full" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-6 py-4 text-center">
                <p className="text-slate-500 text-sm">
                    Tap tiles to create a beat. Press Play to listen.
                </p>
            </div>
        </div>
    );
}
