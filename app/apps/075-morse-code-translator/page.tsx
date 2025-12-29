
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Volume2, Copy } from "lucide-react";

const MORSE_CODE: Record<string, string> = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/'
};

const REVERSE_MORSE: Record<string, string> = Object.entries(MORSE_CODE).reduce((acc, [char, code]) => {
    acc[code] = char;
    return acc;
}, {} as Record<string, string>);

export default function MorseTranslator() {
    const [text, setText] = useState("");
    const [morse, setMorse] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const handleTextChange = (val: string) => {
        setText(val);
        const upper = val.toUpperCase();
        const encoded = upper.split("").map(char => MORSE_CODE[char] || "?").join(" ");
        setMorse(encoded);
    };

    const handleMorseChange = (val: string) => {
        setMorse(val);
        const decoded = val.split(" ").map(code => REVERSE_MORSE[code] || "?").join("");
        setText(decoded);
    };

    const playMorse = async () => {
        if (!morse || isPlaying) return;
        setIsPlaying(true);

        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
        const ctx = audioCtxRef.current;

        const dotDuration = 0.1;
        let currentTime = ctx.currentTime + 0.1;

        for (const char of morse) {
            if (char === ".") {
                playTone(ctx, currentTime, dotDuration);
                currentTime += dotDuration;
            } else if (char === "-") {
                playTone(ctx, currentTime, dotDuration * 3);
                currentTime += dotDuration * 3;
            } else if (char === " " || char === "/") {
                currentTime += dotDuration * 3;
            }
            currentTime += dotDuration; // gap between signals
        }

        // Reset playing state after estimated duration (simple timeout)
        setTimeout(() => setIsPlaying(false), (currentTime - ctx.currentTime) * 1000);
    };

    const playTone = (ctx: AudioContext, time: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.01);

        osc.start(time);
        osc.stop(time + duration);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-mono p-4">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/apps" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">Morse Code Translator</h1>
            </header>

            <div className="max-w-xl mx-auto mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
                <span className="text-xs text-green-400 font-bold block mb-1">#075</span>
                <p className="text-xs text-slate-400">テキストとモールス信号を相互変換し、音で再生できます。</p>
            </div>

            <div className="max-w-xl mx-auto space-y-8">
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold">TEXT</label>
                    <textarea
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                        placeholder="TYPE HERE..."
                        value={text}
                        onChange={e => handleTextChange(e.target.value)}
                    />
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={playMorse}
                        disabled={isPlaying || !morse}
                        className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${isPlaying ? "border-green-500 text-green-500 animate-pulse" : "border-slate-600 text-slate-600 hover:border-blue-500 hover:text-blue-500 hover:scale-105"}`}
                    >
                        <Volume2 size={32} />
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-xs text-slate-500 font-bold">MORSE</label>
                        <button onClick={() => navigator.clipboard.writeText(morse)} className="text-xs text-slate-500 hover:text-white flex items-center gap-1">
                            <Copy size={12} /> COPY
                        </button>
                    </div>
                    <textarea
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] tracking-widest text-green-400"
                        placeholder="... --- ..."
                        value={morse}
                        onChange={e => handleMorseChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
