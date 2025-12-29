
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Ear } from "lucide-react";
import { clsx } from "clsx";

const NOTES = [
    { name: "C", freq: 261.63 },
    { name: "D", freq: 293.66 },
    { name: "E", freq: 329.63 },
    { name: "F", freq: 349.23 },
    { name: "G", freq: 392.00 },
    { name: "A", freq: 440.00 },
    { name: "B", freq: 493.88 },
];

export default function PitchTrainer() {
    const [targetNote, setTargetNote] = useState<typeof NOTES[0] | null>(null);
    const [status, setStatus] = useState<"idle" | "playing" | "guessing" | "correct" | "wrong">("idle");
    const [score, setScore] = useState(0);

    const audioCtx = useRef<AudioContext | null>(null);

    const playTone = (freq: number, duration = 0.5) => {
        if (!audioCtx.current) {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            audioCtx.current = new AudioContextClass();
        }
        if (audioCtx.current?.state === "suspended") {
            audioCtx.current.resume();
        }

        const ctx = audioCtx.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    };

    const startRound = () => {
        const note = NOTES[Math.floor(Math.random() * NOTES.length)];
        setTargetNote(note);
        setStatus("playing");
        setTimeout(() => {
            playTone(note.freq, 1);
            setStatus("guessing");
        }, 500);
    };

    const handleGuess = (note: typeof NOTES[0]) => {
        if (status !== "guessing") {
            // Just play sound if not playing
            playTone(note.freq, 0.3);
            return;
        }

        playTone(note.freq, 0.3);

        if (note.name === targetNote?.name) {
            setStatus("correct");
            setScore(s => s + 1);
            setTimeout(startRound, 1500);
        } else {
            setStatus("wrong");
            setScore(s => Math.max(0, s - 1));
            setTimeout(startRound, 1500);
        }
    };

    const replay = () => {
        if (targetNote) playTone(targetNote.freq, 1);
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 flex flex-col items-center justify-center p-4">
            <header className="absolute top-4 left-4 flex items-center gap-4">
                <Link href="/apps" className="p-2 bg-white dark:bg-neutral-800 rounded-full shadow hover:opacity-80 transition"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#092 Pitch Trainer</h1>
            </header>

            <div className="text-center mb-12">
                <div className="text-6xl font-black mb-4 flex items-center justify-center gap-4">
                    {status === "playing" ? <Ear className="animate-pulse text-blue-500" size={64} /> : score}
                </div>
                <div className="h-8 text-lg font-bold">
                    {status === "idle" && "Press Start to begin"}
                    {status === "playing" && "Listen..."}
                    {status === "guessing" && "What note was that?"}
                    {status === "correct" && <span className="text-green-500">Correct! It was {targetNote?.name}</span>}
                    {status === "wrong" && <span className="text-red-500">Wrong! It was {targetNote?.name}</span>}
                </div>
            </div>

            <div className="flex justify-center gap-1 sm:gap-2 mb-12">
                {NOTES.map(n => (
                    <button
                        key={n.name}
                        onClick={() => handleGuess(n)}
                        className="w-10 sm:w-14 h-40 sm:h-56 bg-white border border-neutral-300 rounded-b-lg shadow-lg active:bg-neutral-200 active:scale-95 transition-transform flex items-end justify-center pb-4 text-neutral-400 font-bold hover:bg-neutral-50"
                    >
                        {n.name}
                    </button>
                ))}
            </div>

            <div className="flex gap-4">
                {status === "idle" ? (
                    <button onClick={startRound} className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-500 transition">
                        Start Training
                    </button>
                ) : (
                    <button onClick={replay} className="px-8 py-3 bg-neutral-200 dark:bg-neutral-800 rounded-full font-bold shadow hover:bg-neutral-300 dark:hover:bg-neutral-700 transition flex items-center gap-2">
                        <Play size={18} /> Replay Sound
                    </button>
                )}
            </div>
        </div>
    );
}
