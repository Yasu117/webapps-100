
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RefreshCw, Layers } from "lucide-react";
import { clsx } from "clsx";

const SIZE = 10; // 10x10 grid

export default function GameOfLife3D() {
    const [grid, setGrid] = useState<boolean[][]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [generation, setGeneration] = useState(0);
    const [rotation, setRotation] = useState(45);

    useEffect(() => {
        // Init random
        const g = Array(SIZE).fill(false).map(() => Array(SIZE).fill(false).map(() => Math.random() > 0.7));
        setGrid(g);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setGrid(prev => {
                    const next = prev.map((row, r) => row.map((cell, c) => {
                        let neighbors = 0;
                        for (let i = -1; i <= 1; i++) {
                            for (let j = -1; j <= 1; j++) {
                                if (i === 0 && j === 0) continue;
                                const nr = r + i;
                                const nc = c + j;
                                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && prev[nr][nc]) {
                                    neighbors++;
                                }
                            }
                        }
                        if (cell && (neighbors < 2 || neighbors > 3)) return false;
                        if (!cell && neighbors === 3) return true;
                        return cell;
                    }));
                    setGeneration(g => g + 1);
                    return next;
                });
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const toggleCell = (r: number, c: number) => {
        const next = [...grid];
        next[r][c] = !next[r][c];
        setGrid(next);
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans p-4 perspective-1000 flex flex-col items-center justify-center overflow-hidden">
            <header className="absolute top-4 left-4 z-20 flex items-center gap-4">
                <Link href="/apps" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#096 Game of Life 3D</h1>
            </header>

            <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
                {/* 3D Scene */}
                <div
                    className="relative transition-transform duration-500 transform-style-3d"
                    style={{ transform: `rotateX(60deg) rotateZ(${rotation}deg)` }}
                >
                    <div
                        className="grid gap-1 bg-neutral-800/50 p-2 rounded-xl shadow-2xl border-4 border-neutral-700"
                        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
                    >
                        {grid.map((row, r) => (
                            row.map((active, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => toggleCell(r, c)}
                                    className={clsx(
                                        "w-8 h-8 sm:w-12 sm:h-12 border border-neutral-600/30 transition-all duration-300 transform-style-3d cursor-pointer hover:bg-neutral-600",
                                        active ? "bg-green-500 shadow-[0_0_15px_#22c55e] translate-z-4" : "bg-neutral-800"
                                    )}
                                    style={{
                                        transform: active ? "translateZ(20px)" : "translateZ(0)",
                                    }}
                                >
                                    {/* 3D Sides pseudo-elements simulation via child divs if needed, simplified with translation Z */}
                                    {active && (
                                        <>
                                            <div className="absolute inset-0 bg-green-600 translate-z-[-20px]" /> {/* Bottom */}
                                            {/* We rely on CSS transform to lift the "lid" */}
                                        </>
                                    )}
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 z-20">
                <div className="flex gap-4 bg-neutral-800 p-4 rounded-2xl shadow-xl border border-neutral-700">
                    <button onClick={() => setIsPlaying(!isPlaying)} className={clsx("p-4 rounded-xl transition", isPlaying ? "bg-amber-500 text-white" : "bg-green-600 text-white hover:bg-green-500")}>
                        {isPlaying ? <Pause /> : <Play />}
                    </button>
                    <button onClick={() => setGrid(Array(SIZE).fill(false).map(() => Array(SIZE).fill(false)))} className="p-4 bg-neutral-700 text-neutral-300 rounded-xl hover:bg-neutral-600">
                        <RefreshCw />
                    </button>
                    <div className="flex flex-col justify-center px-4 border-l border-neutral-600">
                        <span className="text-xs text-neutral-400 font-bold uppercase">Gen</span>
                        <span className="text-2xl font-mono font-bold text-green-400">{generation}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-neutral-800 p-4 rounded-2xl shadow-xl border border-neutral-700">
                    <Layers size={18} className="text-neutral-400" />
                    <input
                        type="range" min="0" max="360"
                        value={rotation}
                        onChange={e => setRotation(Number(e.target.value))}
                        className="w-32 accent-green-500"
                    />
                </div>
            </div>

            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
            `}</style>
        </div>
    );
}
