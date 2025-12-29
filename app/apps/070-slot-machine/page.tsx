
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coins, RotateCcw } from "lucide-react";
import { clsx } from "clsx";

const SYMBOLS = ["🍒", "🍋", "🍇", "💎", "7️⃣", "🔔"];

export default function SlotMachine() {
    const [coins, setCoins] = useState(100);
    const [reels, setReels] = useState(["7️⃣", "7️⃣", "7️⃣"]);
    const [spinning, setSpinning] = useState(false);
    const [win, setWin] = useState(0);

    const spin = async () => {
        if (coins < 10 || spinning) return;
        setCoins(c => c - 10);
        setSpinning(true);
        setWin(0);

        // Animation
        let spins = 0;
        const maxSpins = 20;
        const interval = setInterval(() => {
            setReels([
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
            ]);
            spins++;
            if (spins >= maxSpins) {
                clearInterval(interval);
                finalize();
            }
        }, 100);
    };

    const finalize = () => {
        const finalReels = [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ];
        setReels(finalReels);
        setSpinning(false);

        // Check win
        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
            // Jackpot
            const symbol = finalReels[0];
            let reward = 100;
            if (symbol === "💎") reward = 500;
            if (symbol === "7️⃣") reward = 1000;
            setCoins(c => c + reward);
            setWin(reward);
        } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
            // Small win
            setCoins(c => c + 15);
            setWin(15);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-900 text-white flex flex-col items-center justify-center p-4 font-sans">
            <Link href="/apps" className="absolute top-4 left-4 p-2 bg-indigo-800 rounded-full hover:bg-indigo-700"><ArrowLeft /></Link>

            <div className="bg-indigo-950 p-8 rounded-3xl border-4 border-indigo-800 shadow-2xl max-w-sm w-full relative">
                {/* Lights */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-10 bg-yellow-400/20 blur-xl rounded-full ${win > 0 ? "opacity-100" : "opacity-0"} transition-opacity`}></div>

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-yellow-500 tracking-wider shadow-black drop-shadow-md">CASINO</h1>
                    <div className="text-xs text-indigo-300 mb-2 font-bold mt-1">#070 スロットを回して運試し</div>
                    <div className="flex items-center justify-center gap-2 text-xl font-bold mt-2 bg-black/30 rounded-full py-1 px-4 inline-flex border border-white/10">
                        <Coins className="text-yellow-400" />
                        <span>{coins}</span>
                    </div>
                </div>

                {/* Reels */}
                <div className="bg-white rounded-xl p-4 flex gap-2 mb-6 border-b-8 border-slate-300 relative overflow-hidden">
                    {reels.map((s, i) => (
                        <div key={i} className="flex-1 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-5xl shadow-inner border border-slate-200">
                            {s}
                        </div>
                    ))}
                    {/* Shine */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none"></div>
                    <div className="absolute top-[40%] left-0 w-full h-[1px] bg-red-500/30 pointer-events-none"></div>
                </div>

                {win > 0 && (
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-4xl font-bold text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-bounce whitespace-nowrap z-10">
                        WIN! +{win}
                    </div>
                )}

                <button
                    onClick={spin}
                    disabled={spinning || coins < 10}
                    className={clsx(
                        "w-full py-4 rounded-xl font-black text-xl shadow-[0_6px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all",
                        spinning || coins < 10
                            ? "bg-slate-600 text-slate-400 cursor-not-allowed shadow-none translate-y-1"
                            : "bg-red-600 text-white hover:bg-red-500"
                    )}
                >
                    {spinning ? "SPINNING..." : "SPIN (10)"}
                </button>
            </div>

            {coins < 10 && (
                <button onClick={() => setCoins(100)} className="mt-8 flex items-center gap-2 text-indigo-400 hover:text-white transition">
                    <RotateCcw size={16} /> Reset Money
                </button>
            )}
        </div>
    );
}
