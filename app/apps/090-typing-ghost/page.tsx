
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Ghost, Play, RotateCcw } from "lucide-react";
import { clsx } from "clsx";

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do. Simplicity is the soul of efficiency.";

type KeyLog = {
    char: string;
    time: number;
};

export default function TypingGhost() {
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [wpm, setWpm] = useState(0);

    const [ghostLog, setGhostLog] = useState<KeyLog[]>([]); // Best run
    const [ghostInput, setGhostInput] = useState(""); // Replay state
    const [currentLog, setCurrentLog] = useState<KeyLog[]>([]); // Current run

    const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
    const inputRef = useRef<HTMLInputElement>(null);

    // Ghost Replay Logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === "playing" && ghostLog.length > 0) {
            const startReplay = Date.now();
            timer = setInterval(() => {
                const elapsed = Date.now() - startReplay;
                // Find latest char ghost should have typed
                // This is simple replay, imperfect sync but visual enough
                const lastLog = ghostLog.filter(l => l.time <= elapsed);
                const text = lastLog.map(l => l.char).join("");
                setGhostInput(text);

                if (elapsed > ghostLog[ghostLog.length - 1].time + 1000) {
                    // Ghost finished
                }
            }, 50);
        }
        return () => clearInterval(timer);
    }, [gameState, ghostLog]);

    const startGame = () => {
        setInput("");
        setCurrentLog([]);
        setGhostInput("");
        setGameState("playing");
        setStartTime(Date.now());
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (gameState !== "playing") return;

        const val = e.target.value;
        const now = Date.now();
        const elapsed = now - startTime;

        // Check correct prefix
        if (!SAMPLE_TEXT.startsWith(val)) {
            // Error input - block or just allow? Block for strict typing
            return;
        }

        setInput(val);
        // Log keystroke (only added chars)
        if (val.length > input.length) {
            setCurrentLog([...currentLog, { char: val.slice(-1), time: elapsed }]);
        }

        if (val === SAMPLE_TEXT) {
            finishGame(elapsed);
        }
    };

    const finishGame = (elapsed: number) => {
        setGameState("finished");
        const minutes = elapsed / 60000;
        const words = SAMPLE_TEXT.length / 5;
        const currentWpm = Math.round(words / minutes);
        setWpm(currentWpm);

        // Save as ghost if better or first
        // Simple metric: faster time (last log time)
        const myTime = elapsed;
        const ghostTime = ghostLog.length > 0 ? ghostLog[ghostLog.length - 1].time : Infinity;

        if (myTime < ghostTime) {
            setGhostLog(currentLog);
            // Could save to localStorage here
        }
    };

    const progress = (input.length / SAMPLE_TEXT.length) * 100;
    const ghostProgress = (ghostInput.length / SAMPLE_TEXT.length) * 100;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans p-4 flex flex-col items-center justify-center">
            <header className="max-w-2xl w-full flex items-center justify-between mb-12">
                <Link href="/apps" className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition"><ArrowLeft size={24} /></Link>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Ghost className="text-purple-400" /> #090 Typing Ghost</h1>
                <div className="w-12"></div>
            </header>

            <div className="max-w-3xl w-full space-y-8">
                {/* Race Track */}
                <div className="relative h-24 bg-slate-900 rounded-2xl border border-slate-800 flex items-center px-4 overflow-hidden">
                    {/* Goal Line */}
                    <div className="absolute right-8 top-0 bottom-0 w-1 bg-white/20 border-r border-dotted"></div>

                    {/* Ghost */}
                    <div
                        className="absolute top-4 transition-all duration-300 ease-linear flex flex-col items-center"
                        style={{ left: `${ghostProgress * 0.9}%` }}
                    >
                        <Ghost size={32} className="text-purple-500/50" />
                        <span className="text-[10px] text-purple-500/50 uppercase font-bold">Best</span>
                    </div>

                    {/* Player */}
                    <div
                        className="absolute bottom-4 transition-all duration-100 ease-out flex flex-col items-center"
                        style={{ left: `${progress * 0.9}%` }}
                    >
                        <div className="w-8 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_blue] flex items-center justify-center text-xs font-bold">YOU</div>
                    </div>
                </div>

                {/* Text Display */}
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 relative font-mono text-xl leading-relaxed">
                    <div className="text-slate-600 select-none pointer-events-none absolute inset-0 p-8">
                        {SAMPLE_TEXT}
                    </div>
                    <div className="relative z-10 text-cyan-400 pointer-events-none">
                        {input}
                        <span className="animate-pulse bg-white text-black w-2 inline-block h-[1em] align-middle ml-0.5"> </span>
                    </div>
                </div>

                {/* Input (Hidden mostly, but functional) */}
                <input
                    ref={inputRef}
                    className="opacity-0 absolute top-0"
                    value={input}
                    onChange={handleInput}
                    autoFocus
                    disabled={gameState === "finished"}
                />

                {gameState === "idle" && (
                    <div className="text-center">
                        <button onClick={startGame} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xl shadow-lg transition transform hover:scale-105 flex items-center gap-2 mx-auto">
                            <Play fill="currentColor" /> Start Race
                        </button>
                        {ghostLog.length > 0 && <p className="mt-4 text-purple-400">Can you beat your ghost?</p>}
                    </div>
                )}

                {gameState === "finished" && (
                    <div className="text-center bg-slate-800 p-8 rounded-2xl border border-slate-700 animate-in zoom-in">
                        <h2 className="text-3xl font-bold mb-2">Finished!</h2>
                        <div className="text-6xl font-black text-blue-400 mb-4">{wpm} <span className="text-lg text-slate-400 font-normal">WPM</span></div>
                        <button onClick={startGame} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl flex items-center gap-2 mx-auto">
                            <RotateCcw size={20} /> Retry
                        </button>
                    </div>
                )}

                {gameState === "playing" && (
                    <div className="text-center text-slate-500 animate-pulse">Type the text above...</div>
                )}
            </div>
        </div>
    );
}
