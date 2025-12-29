
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, Square } from "lucide-react";
import { clsx } from "clsx";

export default function MetronomePro() {
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const [signature, setSignature] = useState(4); // 4/4
    const [currentBeat, setCurrentBeat] = useState(0);

    const audioCtx = useRef<AudioContext | null>(null);
    const nextNoteTime = useRef(0);
    const beatRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const lookahead = 25.0; // ms
    const scheduleAheadTime = 0.1; // s

    const playClick = (time: number, beat: number) => {
        if (!audioCtx.current) return;
        const ctx = audioCtx.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const isAccent = beat % signature === 0;

        osc.frequency.value = isAccent ? 1000 : 800;
        osc.type = isAccent ? "triangle" : "sine";

        osc.start(time);
        osc.stop(time + 0.1);

        gain.gain.setValueAtTime(isAccent ? 1 : 0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        // Visual Feedback (Scheduled via simple check in loop or global state? Global state laggy. Let's rely on React state updated roughly)
        // Since React state update is async, visual metronome might be slightly off audio in high load, but acceptable for simple tool.
        // We set a timeout to update state exactly when note plays
        const delay = (time - ctx.currentTime) * 1000;
        setTimeout(() => {
            setCurrentBeat(beat % signature);
        }, delay);
    };

    const scheduler = () => {
        if (!audioCtx.current) return;
        while (nextNoteTime.current < audioCtx.current.currentTime + scheduleAheadTime) {
            playClick(nextNoteTime.current, beatRef.current);
            const secondsPerBeat = 60.0 / bpm;
            nextNoteTime.current += secondsPerBeat;
            beatRef.current++;
        }
    };

    useEffect(() => {
        if (isPlaying) {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            if (!audioCtx.current) audioCtx.current = new AudioContextClass();
            audioCtx.current?.resume();

            nextNoteTime.current = audioCtx.current!.currentTime + 0.1;
            beatRef.current = 0;

            timerRef.current = setInterval(scheduler, lookahead);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setCurrentBeat(-1);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, bpm, signature]);

    return (
        <div className="min-h-screen bg-slate-200 text-slate-800 font-sans flex flex-col items-center justify-center p-4">
            <header className="absolute top-4 left-4 flex items-center gap-4">
                <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100 transition"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#098 Metronome Pro</h1>
            </header>

            <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full text-center">
                {/* Visualizer */}
                <div className="flex justify-center gap-4 mb-12">
                    {Array.from({ length: signature }).map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "w-6 h-20 rounded-full transition-all duration-100",
                                currentBeat === i
                                    ? (i === 0 ? "bg-red-500 scale-110 shadow-[0_0_20px_#ef4444]" : "bg-blue-500 scale-110 shadow-[0_0_15px_#3b82f6]")
                                    : "bg-slate-200"
                            )}
                        />
                    ))}
                </div>

                <div className="text-8xl font-black text-slate-800 mb-8 font-mono tracking-tighter">
                    {bpm}
                    <span className="text-xl text-slate-400 font-normal ml-2">BPM</span>
                </div>

                <div className="space-y-8">
                    <input
                        type="range"
                        min="30" max="300"
                        value={bpm}
                        onChange={e => setBpm(Number(e.target.value))}
                        className="w-full accent-slate-800 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="flex justify-center gap-2">
                        <button onClick={() => setBpm(b => b - 1)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">-</button>
                        <button onClick={() => setBpm(b => b + 1)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200">+</button>
                    </div>

                    <div className="flex justify-center gap-4 py-4 border-t border-slate-100">
                        {[2, 3, 4, 6].map(sig => (
                            <button
                                key={sig}
                                onClick={() => setSignature(sig)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg font-bold transition",
                                    signature === sig ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                            >
                                {sig}/4
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={clsx(
                            "w-full py-6 rounded-2xl text-2xl font-bold transition shadow-lg flex items-center justify-center gap-3",
                            isPlaying ? "bg-white text-red-500 border-2 border-red-500" : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                    >
                        {isPlaying ? <><Square fill="currentColor" size={24} /> Stop</> : <><Play fill="currentColor" size={24} /> Start</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
