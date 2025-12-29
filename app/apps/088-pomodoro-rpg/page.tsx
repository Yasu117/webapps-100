
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw, Coffee } from "lucide-react";

export default function PomodoroRPG() {
    // Game State
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [monsterHp, setMonsterHp] = useState(100);
    const [maxMonsterHp, setMaxMonsterHp] = useState(100);
    const [monsterLevel, setMonsterLevel] = useState(1);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "break">("focus");

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);

                // RPG Logic: Damage monster every second during focus
                if (mode === "focus") {
                    setMonsterHp(hp => {
                        const damage = 1; // 1 HP per second
                        const nextHp = Math.max(0, hp - damage);
                        if (nextHp === 0) {
                            // Monster Defeated!
                            // Handled in effect below to avoid multiple triggers
                        }
                        return nextHp;
                    });
                }
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (mode === "focus") {
                // Focus complete
                const audio = new Audio("/sounds/complete.mp3"); // Would need asset, but assuming visual feedback enough
                alert("Focus Session Complete! Take a break.");
                setMode("break");
                setTimeLeft(5 * 60);
            } else {
                alert("Break is over! Back to work.");
                setMode("focus");
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    // Check monster status
    useEffect(() => {
        if (monsterHp === 0) {
            // Level Up / New Monster
            const gainedXp = monsterLevel * 100;
            setXp(current => {
                const newXp = current + gainedXp;
                if (newXp >= level * 1000) {
                    setLevel(l => l + 1);
                    return newXp - (level * 1000);
                }
                return newXp;
            });

            // Spawn new monster
            const nextLvl = monsterLevel + 1;
            setMonsterLevel(nextLvl);
            setMaxMonsterHp(nextLvl * 100);
            setMonsterHp(nextLvl * 100);
        }
    }, [monsterHp, monsterLevel, level]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans p-4 flex flex-col items-center">
            <header className="w-full max-w-md flex items-center justify-between mb-8">
                <Link href="/apps" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#088 Pomodoro RPG</h1>
                <div className="w-10"></div>
            </header>

            <div className="max-w-md w-full space-y-8">
                {/* Battle Scene */}
                <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border-4 border-slate-700 relative overflow-hidden h-64 flex items-end justify-between px-8">
                    {/* Background */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-slide"></div>

                    {/* Hero */}
                    <div className="relative z-10 flex flex-col items-center mb-4">
                        <div className="text-xs font-bold text-yellow-400 mb-1">Lv.{level} YOU</div>
                        <div className="w-16 h-16 bg-blue-500 rounded-full animate-bounce shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center text-2xl">
                            🧙‍♂️
                        </div>
                        {/* XP Bar */}
                        <div className="w-20 h-2 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-600">
                            <div className="h-full bg-yellow-400" style={{ width: `${(xp / (level * 1000)) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* VS */}
                    {mode === "focus" ? (
                        <div className="mb-10 text-slate-500 font-black italic text-xl animate-pulse">ATTACK!</div>
                    ) : (
                        <div className="mb-10 text-green-400 font-black italic text-xl animate-bounce">RESTING</div>
                    )}

                    {/* Monster */}
                    <div className="relative z-10 flex flex-col items-center mb-4">
                        <div className="text-xs font-bold text-red-400 mb-1">Lv.{monsterLevel} BUG</div>
                        <div className={`w-20 h-20 bg-red-600 rounded-xl flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-transform ${isActive && mode === "focus" ? "animate-shake bg-red-700" : ""}`}>
                            👾
                        </div>
                        {/* HP Bar */}
                        <div className="w-24 h-3 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-600 relative">
                            <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${(monsterHp / maxMonsterHp) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Timer Controls */}
                <div className="bg-slate-800 p-8 rounded-3xl text-center shadow-lg border-t border-slate-700">
                    <div className="text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                        {mode === "focus" ? "Focus Session" : <><Coffee size={18} /> Break Time</>}
                    </div>
                    <div className="text-7xl font-black tabular-nums tracking-tighter mb-8 font-mono">
                        {formatTime(timeLeft)}
                    </div>

                    <div className="flex justify-center gap-6">
                        <button
                            onClick={toggleTimer}
                            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl transition-all active:scale-95 ${isActive ? "bg-amber-500 hover:bg-amber-400" : "bg-emerald-500 hover:bg-emerald-400"}`}
                        >
                            {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="w-20 h-20 bg-slate-700 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-slate-600 hover:text-white shadow-xl transition-all active:scale-95"
                        >
                            <RotateCcw size={32} />
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-500 text-xs">
                    Work to damage the monster. Defeat it to level up!
                </p>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px) rotate(-5deg); filter: brightness(1.5); }
                    75% { transform: translateX(5px) rotate(5deg); }
                }
                .animate-shake {
                    animation: shake 0.5s infinite;
                }
            `}</style>
        </div>
    );
}
