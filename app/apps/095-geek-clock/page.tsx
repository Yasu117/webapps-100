
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Binary, Hexagon, Hash } from "lucide-react";
import { clsx } from "clsx";

export default function GeekClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 50); // High res for millisecond
        return () => clearInterval(timer);
    }, []);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const toBin = (n: number) => n.toString(2).padStart(6, '0');
    const toHex = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');

    // Binary Clock Columns (H H : M M : S S) - usually Binary Coded Decimal or Pure Binary?
    // Let's do BCD (Binary Coded Decimal) - 6 columns: H1 H0 M1 M0 S1 S0
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();

    const h1 = Math.floor(h / 10);
    const h0 = h % 10;
    const m1 = Math.floor(m / 10);
    const m0 = m % 10;
    const s1 = Math.floor(s / 10);
    const s0 = s % 10;

    const bcd = [h1, h0, m1, m0, s1, s0];

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Matrix Rain Background Effect (CSS only for simplicity) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif')] bg-cover"></div>

            <header className="absolute top-4 left-4 flex items-center gap-4 z-10">
                <Link href="/apps" className="p-2 bg-green-900/20 text-green-400 rounded-full border border-green-500/50 hover:bg-green-900/40"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#095 Geek Clock</h1>
            </header>

            <div className="grid gap-12 max-w-4xl w-full z-10">

                {/* 1. Unix Timestamp */}
                <div className="text-center group">
                    <div className="flex items-center justify-center gap-2 text-sm text-green-700 mb-2 uppercase tracking-widest group-hover:text-green-400 transition">
                        <Hash size={14} /> Unix Epoch
                    </div>
                    <div className="text-4xl md:text-6xl font-black tabular-nums tracking-widest text-shadow-glow">
                        {Math.floor(time.getTime() / 1000)}
                        <span className="text-xl opacity-50">.{Math.floor(time.getTime() % 1000).toString().padStart(3, '0')}</span>
                    </div>
                </div>

                {/* 2. Hex Clock */}
                <div className="text-center group">
                    <div className="flex items-center justify-center gap-2 text-sm text-purple-700 mb-2 uppercase tracking-widest group-hover:text-purple-400 transition">
                        <Hexagon size={14} /> Hex Time (Color)
                    </div>
                    <div className="text-5xl md:text-8xl font-black flex justify-center gap-4 text-purple-500 text-shadow-glow">
                        <span>#{toHex(h)}</span>
                        <span>{toHex(m)}</span>
                        <span>{toHex(s)}</span>
                    </div>
                    {/* Live BG preview of hex color */}
                    <div
                        className="h-2 w-full mt-4 rounded-full shadow-[0_0_20px_ currentColor]"
                        style={{ backgroundColor: `#${toHex(h)}${toHex(m)}${toHex(s)}` }}
                    ></div>
                </div>

                {/* 3. Binary Clock (BCD) */}
                <div className="text-center group">
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-700 mb-4 uppercase tracking-widest group-hover:text-blue-400 transition">
                        <Binary size={14} /> Binary (BCD)
                    </div>

                    <div className="flex justify-center gap-4 md:gap-8">
                        {bcd.map((digit, colIndex) => (
                            <div key={colIndex} className="flex flex-col-reverse gap-2">
                                {[1, 2, 4, 8].map((bit) => {
                                    const isActive = (digit & bit) > 0;
                                    return (
                                        <div
                                            key={bit}
                                            className={clsx(
                                                "w-6 h-6 md:w-8 md:h-8 rounded-full border border-blue-900 transition-all duration-300",
                                                isActive ? "bg-blue-500 shadow-[0_0_10px_#3b82f6]" : "bg-blue-900/20"
                                            )}
                                        />
                                    );
                                })}
                                <div className="text-blue-800 font-bold mt-2">{digit}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <style jsx global>{`
                .text-shadow-glow {
                    text-shadow: 0 0 10px currentColor;
                }
            `}</style>
        </div>
    );
}
