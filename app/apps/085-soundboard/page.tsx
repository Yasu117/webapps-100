
"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type SoundEffect = {
    id: string;
    label: string;
    type: "sine" | "square" | "sawtooth" | "triangle";
    freqStart: number;
    freqEnd: number;
    duration: number;
    vol: number;
    color: string;
};

const SOUNDS: SoundEffect[] = [
    { id: "1", label: "Correct", type: "sine", freqStart: 880, freqEnd: 1760, duration: 0.1, vol: 0.2, color: "bg-green-500" },
    { id: "2", label: "Wrong", type: "sawtooth", freqStart: 150, freqEnd: 100, duration: 0.3, vol: 0.2, color: "bg-red-500" },
    { id: "3", label: "Jump", type: "square", freqStart: 200, freqEnd: 600, duration: 0.15, vol: 0.1, color: "bg-blue-500" },
    { id: "4", label: "Coin", type: "sine", freqStart: 1200, freqEnd: 1800, duration: 0.1, vol: 0.1, color: "bg-yellow-500" },
    { id: "5", label: "Laser", type: "sawtooth", freqStart: 800, freqEnd: 200, duration: 0.2, vol: 0.1, color: "bg-pink-500" },
    { id: "6", label: "Explosion", type: "sawtooth", freqStart: 100, freqEnd: 0, duration: 0.5, vol: 0.3, color: "bg-orange-600" }, // Noise is better but complex
    { id: "7", label: "PowerUp", type: "triangle", freqStart: 300, freqEnd: 800, duration: 0.4, vol: 0.2, color: "bg-cyan-500" },
    { id: "8", label: "Select", type: "square", freqStart: 440, freqEnd: 440, duration: 0.05, vol: 0.1, color: "bg-slate-500" },
    { id: "9", label: "Alert", type: "square", freqStart: 800, freqEnd: 800, duration: 0.5, vol: 0.2, color: "bg-red-600" }, // Needs pulsing ideally
];

export default function SoundBoard() {
    const audioCtx = useRef<AudioContext | null>(null);

    const playSound = (s: SoundEffect) => {
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

        osc.type = s.type;
        osc.frequency.setValueAtTime(s.freqStart, ctx.currentTime);
        if (s.freqStart !== s.freqEnd) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(0.01, s.freqEnd), ctx.currentTime + s.duration);
        }

        // Alert special case (pulsing)
        if (s.label === "Alert") {
            // Just multiple beeps? Simplification: just long beep for now
        }

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        gain.gain.setValueAtTime(s.vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.duration);
        osc.stop(ctx.currentTime + s.duration);
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 font-sans flex flex-col items-center justify-center">
            <header className="max-w-3xl w-full flex items-center justify-between mb-12">
                <Link href="/apps" className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition"><ArrowLeft size={24} /></Link>
                <div className="text-center">
                    <h1 className="text-3xl font-black uppercase tracking-widest text-neutral-500">PON-DASHI</h1>
                    <div className="text-xs text-neutral-700 font-bold">#085 Soundboard</div>
                </div>
                <div className="w-12"></div>
            </header>

            <div className="grid grid-cols-3 gap-6 max-w-3xl w-full">
                {SOUNDS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => playSound(s)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 shadow-2xl transition-transform active:scale-95 hover:brightness-110 ${s.color}`}
                    >
                        <div className="text-2xl font-black drop-shadow-md opacity-90">{s.label}</div>
                        <div className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Tap to Play</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
