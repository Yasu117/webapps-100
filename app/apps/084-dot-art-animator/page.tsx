
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, Trash2, Copy, Plus, X, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

const GRID_SIZE = 16;
const PRESET_COLORS = [
    "#000000", "#ffffff", "#ff0000", "#ff7f00", "#ffff00", "#00ff00",
    "#0000ff", "#4b0082", "#9400d3", "#ff69b4", "#00ffff", "#8b4513"
];

export default function DotArtAnimator() {
    const [frames, setFrames] = useState<string[][]>([Array(GRID_SIZE * GRID_SIZE).fill("#ffffff")]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [currentColor, setCurrentColor] = useState("#000000");
    const [isPlaying, setIsPlaying] = useState(false);
    const [fps, setFps] = useState(4);

    // Playback loop
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying) {
            timer = setInterval(() => {
                setCurrentFrameIndex(prev => (prev + 1) % frames.length);
            }, 1000 / fps);
        }
        return () => clearInterval(timer);
    }, [isPlaying, frames.length, fps]);

    const paint = (index: number) => {
        const newFrames = [...frames];
        const newGrid = [...newFrames[currentFrameIndex]];
        newGrid[index] = currentColor;
        newFrames[currentFrameIndex] = newGrid;
        setFrames(newFrames);
    };

    const addFrame = () => {
        // Copy current frame
        const newFrames = [...frames];
        newFrames.splice(currentFrameIndex + 1, 0, [...frames[currentFrameIndex]]);
        setFrames(newFrames);
        setCurrentFrameIndex(currentFrameIndex + 1);
    };

    const deleteFrame = () => {
        if (frames.length <= 1) return;
        const newFrames = frames.filter((_, i) => i !== currentFrameIndex);
        setFrames(newFrames);
        setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1));
    };

    const clearFrame = () => {
        const newFrames = [...frames];
        newFrames[currentFrameIndex] = Array(GRID_SIZE * GRID_SIZE).fill("#ffffff");
        setFrames(newFrames);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 p-4 font-sans flex flex-col items-center">
            <header className="w-full max-w-4xl flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-50"><ArrowLeft size={20} /></Link>
                    <h1 className="text-xl font-bold">#084 Dot Art Animator</h1>
                </div>
            </header>

            <div className="max-w-4xl w-full grid md:grid-cols-[1fr_300px] gap-8">
                {/* Canvas Area */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 flex flex-col items-center">
                    <div
                        className="grid gap-px bg-slate-200 border border-slate-200 cursor-pointer shadow-inner"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            width: "min(320px, 100%)",
                            aspectRatio: "1/1"
                        }}
                        onPointerLeave={() => { /* stop drag paint if implemented */ }}
                    >
                        {frames[currentFrameIndex].map((color, i) => (
                            <div
                                key={i}
                                style={{ backgroundColor: color }}
                                className="w-full h-full hover:opacity-80 transition-opacity"
                                onPointerDown={(e) => {
                                    (e.target as Element).releasePointerCapture(e.pointerId); // Allows drag over multiple elements? No simple drag paint needs more logic. Click for now.
                                    paint(i);
                                }}
                                onPointerEnter={(e) => {
                                    if (e.buttons === 1) paint(i);
                                }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={clsx("w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg transition active:scale-95", isPlaying ? "bg-orange-500" : "bg-green-600")}
                        >
                            {isPlaying ? <Pause /> : <Play className="ml-1" />}
                        </button>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-slate-400">FPS: {fps}</label>
                            <input type="range" min="1" max="20" value={fps} onChange={e => setFps(Number(e.target.value))} className="w-24 accent-green-600" />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    {/* Colors */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-500 text-sm mb-3">Palette</h3>
                        <div className="grid grid-cols-6 gap-2">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    style={{ backgroundColor: c }}
                                    className={clsx("w-8 h-8 rounded-full border-2", currentColor === c ? "border-slate-800 scale-110" : "border-slate-100")}
                                    onClick={() => setCurrentColor(c)}
                                />
                            ))}
                            <input type="color" value={currentColor} onChange={e => setCurrentColor(e.target.value)} className="w-8 h-8 rounded-full overflow-hidden border-0 p-0" />
                        </div>
                    </div>

                    {/* Frames */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-slate-500 text-sm">Frames ({frames.length})</h3>
                            <button onClick={addFrame} className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"><Plus size={16} /></button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {frames.map((frame, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentFrameIndex(i)}
                                    className={clsx(
                                        "min-w-[40px] h-[40px] border-2 rounded flex items-center justify-center text-xs font-bold relative overflow-hidden",
                                        currentFrameIndex === i ? "border-blue-500" : "border-slate-200 text-slate-400"
                                    )}
                                >
                                    {/* Tiny Preview */}
                                    <div className="absolute inset-0 grid grid-cols-16 w-full h-full opacity-50 pointer-events-none" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                                        {frame.map((c, idx) => <div key={idx} style={{ backgroundColor: c }} />)}
                                    </div>
                                    <span className="relative z-10 bg-white/80 px-1 rounded">{i + 1}</span>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button onClick={clearFrame} className="flex items-center justify-center gap-1 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 text-xs font-bold">
                                <RefreshCw size={14} /> Clear
                            </button>
                            <button onClick={deleteFrame} className="flex items-center justify-center gap-1 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold" disabled={frames.length <= 1}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
