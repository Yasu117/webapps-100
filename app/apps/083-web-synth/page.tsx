
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2 } from "lucide-react";
import { clsx } from "clsx";

const NOTES = [
    { note: "C4", freq: 261.63, key: "a" },
    { note: "C#4", freq: 277.18, key: "w" },
    { note: "D4", freq: 293.66, key: "s" },
    { note: "D#4", freq: 311.13, key: "e" },
    { note: "E4", freq: 329.63, key: "d" },
    { note: "F4", freq: 349.23, key: "f" },
    { note: "F#4", freq: 369.99, key: "t" },
    { note: "G4", freq: 392.00, key: "g" },
    { note: "G#4", freq: 415.30, key: "y" },
    { note: "A4", freq: 440.00, key: "h" },
    { note: "A#4", freq: 466.16, key: "u" },
    { note: "B4", freq: 493.88, key: "j" },
    { note: "C5", freq: 523.25, key: "k" },
];

export default function WebSynth() {
    const audioCtx = useRef<AudioContext | null>(null);
    const [activeNotes, setActiveNotes] = useState<Record<string, boolean>>({});
    const oscillators = useRef<Record<string, OscillatorNode>>({});
    const gainNodes = useRef<Record<string, GainNode>>({});
    const [waveform, setWaveform] = useState<OscillatorType>("sine");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const note = NOTES.find(n => n.key === e.key);
            if (note && !activeNotes[note.note]) {
                playNote(note.note, note.freq);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const note = NOTES.find(n => n.key === e.key);
            if (note) {
                stopNote(note.note);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [activeNotes, waveform]); // Re-bind if needed, but actually playNote uses refs mostly.

    const initAudio = () => {
        if (!audioCtx.current) {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            audioCtx.current = new AudioContextClass();
        }
        if (audioCtx.current?.state === "suspended") {
            audioCtx.current.resume();
        }
    };

    const playNote = (note: string, freq: number) => {
        initAudio();
        if (!audioCtx.current) return;
        if (oscillators.current[note]) return; // Already playing

        const ctx = audioCtx.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = waveform;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        gain.gain.setValueAtTime(0.01, ctx.currentTime); // Attack
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.1);

        oscillators.current[note] = osc;
        gainNodes.current[note] = gain;

        setActiveNotes(prev => ({ ...prev, [note]: true }));
    };

    const stopNote = (note: string) => {
        if (!audioCtx.current) return;
        const osc = oscillators.current[note];
        const gain = gainNodes.current[note];
        if (osc && gain) {
            const ctx = audioCtx.current;
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1); // Release
            osc.stop(ctx.currentTime + 0.1);

            delete oscillators.current[note];
            delete gainNodes.current[note];

            // Clean state immediately for UI response, though sound lingers slightly (release)
            setActiveNotes(prev => {
                const next = { ...prev };
                delete next[note];
                return next;
            });
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
            <Link href="/apps" className="absolute top-4 left-4 p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition"><ArrowLeft size={20} /></Link>

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">#083 Web Synth</h1>
                <p className="text-neutral-400 text-sm mt-2">Use Keyboard keys (A, W, S, E...) or Click</p>

                <div className="mt-6 flex justify-center gap-4">
                    {["sine", "square", "sawtooth", "triangle"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setWaveform(type as any)}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm font-bold capitalize transition",
                                waveform === type ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Keyboard Playable Area */}
            <div className="relative flex select-none">
                {NOTES.map((n) => {
                    const isSharp = n.note.includes("#");
                    return (
                        <div
                            key={n.note}
                            onMouseDown={() => playNote(n.note, n.freq)}
                            onMouseUp={() => stopNote(n.note)}
                            onMouseLeave={() => stopNote(n.note)} // Stop of slide off
                            onTouchStart={(e) => { e.preventDefault(); playNote(n.note, n.freq); }}
                            onTouchEnd={(e) => { e.preventDefault(); stopNote(n.note); }}
                            className={clsx(
                                "relative flex items-end justify-center pb-4 rounded-b-lg transition-all transform cursor-pointer border border-neutral-950",
                                isSharp
                                    ? "w-10 h-32 bg-black text-white hover:bg-neutral-800 -mx-5 z-10 shadow-lg"
                                    : "w-14 h-48 bg-white text-neutral-900 hover:bg-neutral-100 z-0",
                                activeNotes[n.note] && (isSharp ? "!bg-violet-600 !scale-[0.98]" : "!bg-violet-200 !scale-[0.98]")
                            )}
                        >
                            <span className="text-xs font-bold opacity-50 mb-4 pointer-events-none">{n.key.toUpperCase()}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
