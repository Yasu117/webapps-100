
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus, Droplets } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function WaterTracker() {
    const GOAL = 2000;
    const [amount, setAmount] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem("water-tracker");
        if (saved) setAmount(Number(saved));
    }, []);

    useEffect(() => {
        if (isClient) localStorage.setItem("water-tracker", String(amount));
    }, [amount, isClient]);

    const progress = Math.min((amount / GOAL) * 100, 100);

    const add = (val: number) => setAmount(prev => Math.min(prev + val, 3000)); // Cap at 3L logic?

    return (
        <div className="min-h-screen bg-sky-50 overflow-hidden relative font-sans">
            {/* Wave Animation Background */}
            <div className="absolute inset-x-0 bottom-0 bg-sky-400 transition-all duration-700 ease-out z-0"
                style={{ height: `${progress}%` }}>
                <div className="absolute -top-12 left-0 w-[200%] h-24 bg-sky-400 opacity-50 animate-wave rounded-[40%]"></div>
                <div className="absolute -top-16 left-0 w-[200%] h-32 bg-sky-300 opacity-30 animate-wave-slow rounded-[45%]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col pointer-events-none"> {/* passthrough for wave interaction? no need */}
                <div className="p-4 flex items-center justify-between pointer-events-auto">
                    <Link href="/apps" className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors text-slate-700">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-lg text-slate-700">Hydration</h1>
                    <div className="w-8" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto">
                    <div className="text-center p-8 bg-white/30 backdrop-blur-md rounded-full shadow-xl border border-white/50 mb-8 w-64 h-64 flex flex-col items-center justify-center">
                        <Droplets className={clsx("mb-2 transition-colors", progress >= 100 ? "text-sky-600" : "text-sky-500")} size={40} />
                        <span className="text-5xl font-bold text-slate-800">{amount}</span>
                        <span className="text-sm font-bold text-slate-600 uppercase mt-1">ml / {GOAL}ml</span>
                    </div>

                    <div className="flex gap-4">
                        {[150, 250, 500].map(val => (
                            <button
                                key={val}
                                onClick={() => add(val)}
                                className="w-20 h-20 rounded-2xl bg-white shadow-lg flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform hover:bg-sky-50"
                            >
                                <Plus size={20} className="text-sky-500" />
                                <span className="font-bold text-sky-900">{val}ml</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setAmount(0)}
                        className="mt-8 text-sm text-slate-500 hover:text-red-500 transition-colors underline"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <style jsx>{`
         @keyframes wave {
           0% { transform: translateX(0) rotate(0deg); }
           100% { transform: translateX(-50%) rotate(360deg); } // Rotating rounded divs simulates wave
         }
         @keyframes wave-slow {
           0% { transform: translateX(0) rotate(0deg); }
           100% { transform: translateX(-50%) rotate(-360deg); }
         }
         .animate-wave { animation: wave 10s linear infinite; }
         .animate-wave-slow { animation: wave-slow 15s linear infinite; }
       `}</style>
        </div>
    );
}
