
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Play } from "lucide-react";

export default function WhackAMole() {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
    const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false)); // 3x3 grid

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const moleTimerRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setGameState("playing");

        // Game Interval
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Mole Spawning loop
        const spawnMole = () => {
            setMoles(ms => {
                // Hide all first? Or allow multiple? Let's do single mole for simplicity or multi.
                // Reset grid
                const newMoles = Array(9).fill(false);
                // Pick random 1 or 2 holes
                const count = Math.random() > 0.8 ? 2 : 1;
                for (let i = 0; i < count; i++) {
                    const idx = Math.floor(Math.random() * 9);
                    newMoles[idx] = true;
                }
                return newMoles;
            });

            // Vary speed based on score?
            const speed = Math.max(500, 1000 - score * 20);
            moleTimerRef.current = setTimeout(spawnMole, speed);
        };
        spawnMole();
    };

    const endGame = () => {
        setGameState("finished");
        if (timerRef.current) clearInterval(timerRef.current);
        if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
        setMoles(Array(9).fill(false)); // Clear board
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
        }
    }, []);

    const handleClick = (index: number) => {
        if (gameState !== "playing") return;

        if (moles[index]) {
            // Hit!
            setScore(s => s + 1);
            // Hide immediately
            setMoles(ms => {
                const newMs = [...ms];
                newMs[index] = false;
                return newMs;
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#61af57] flex flex-col items-center p-4 selection:bg-none">
            <div className="w-full max-w-sm flex justify-between items-center mb-8 pt-4">
                <Link href="/apps" className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40"><ArrowLeft size={24} /></Link>
                <div className="bg-white/30 px-4 py-2 rounded-xl text-white font-bold backdrop-blur-sm shadow-sm">Score: {score}</div>
                <div className="bg-white/30 px-4 py-2 rounded-xl text-white font-bold backdrop-blur-sm shadow-sm">Time: {timeLeft}s</div>
            </div>

            {/* Game Board */}
            <div className="bg-[#8d6e63] p-4 rounded-3xl shadow-2xl border-b-8 border-[#5d4037]">
                <div className="grid grid-cols-3 gap-4">
                    {moles.map((isUp, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            className="w-20 h-20 md:w-24 md:h-24 bg-[#3e2723] rounded-full relative overflow-hidden shadow-inner group active:scale-95 transition-transform"
                        >
                            {/* Mole */}
                            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#a1887f] rounded-t-full transition-transform duration-100 ${isUp ? "translate-y-2" : "translate-y-full"}`}>
                                {/* Eyes */}
                                <div className="flex justify-center gap-2 mt-4">
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                </div>
                                {/* Nose */}
                                <div className="w-3 h-2 bg-black rounded-full mx-auto mt-1"></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Overlay */}
            {gameState !== "playing" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl text-center shadow-xl w-full max-w-sm animate-in zoom-in">
                        <h1 className="text-3xl font-black text-[#5d4037] mb-2">Whack-a-Mole</h1>
                        <p className="text-[#8d6e63] text-xs mb-4 font-bold">#068 光ったモグラを素早くタップ！制限時間内にハイスコアを目指せ</p>
                        {gameState === "finished" && (
                            <div className="mb-6">
                                <p className="text-slate-500 font-bold">Time's Up!</p>
                                <p className="text-4xl font-black text-[#61af57]">Score: {score}</p>
                            </div>
                        )}
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-[#61af57] text-white font-bold rounded-xl shadow-[0_4px_0_#388e3c] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            {gameState === "finished" ? <RefreshCw /> : <Play />}
                            {gameState === "finished" ? "Play Again" : "Start Game"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
