'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// --- Constants ---
const GRID_SIZE = 16;
const PRESET_COLORS = [
    '#000000', '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57',
    '#ffcd75', '#a7f070', '#38b764', '#257179', '#29366f',
    '#3b5dc9', '#41a6f6', '#73eff7', '#f4f4f4', '#94b0c2',
    '#566c86', '#333c57', '#ffffff'
];

type Tool = 'pencil' | 'eraser' | 'bucket';

export default function PixelArtPage() {
    // State
    const [grid, setGrid] = useState<string[]>(Array(GRID_SIZE * GRID_SIZE).fill('#ffffff'));
    const [selectedColor, setSelectedColor] = useState<string>('#000000');
    const [activeTool, setActiveTool] = useState<Tool>('pencil');
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState<string[][]>([]);
    const [showHelp, setShowHelp] = useState(false);

    // Convert index to/from coordinates
    const getCoord = (index: number) => ({ x: index % GRID_SIZE, y: Math.floor(index / GRID_SIZE) });
    const getIndex = (x: number, y: number) => y * GRID_SIZE + x;

    // --- Actions ---

    // History helper
    const saveToHistory = (newGrid: string[]) => {
        setHistory(prev => {
            const newHistory = [...prev, newGrid];
            if (newHistory.length > 20) newHistory.shift(); // Limit history
            return newHistory;
        });
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setGrid(previous);
        setHistory(prev => prev.slice(0, prev.length - 1));
    };

    // Draw Logic
    const paintPixel = (index: number, overrideTool?: Tool) => {
        const tool = overrideTool || activeTool;
        let newGrid = [...grid];

        if (tool === 'pencil') {
            if (newGrid[index] === selectedColor) return; // No change
            saveToHistory(grid); // Save before change (simplistic undo)
            newGrid[index] = selectedColor;
            setGrid(newGrid);
        } else if (tool === 'eraser') {
            if (newGrid[index] === '#ffffff') return;
            saveToHistory(grid);
            newGrid[index] = '#ffffff';
            setGrid(newGrid);
        } else if (tool === 'bucket') {
            const targetColor = newGrid[index];
            if (targetColor === selectedColor) return;

            saveToHistory(grid);
            const { x: startX, y: startY } = getCoord(index);
            const queue = [[startX, startY]];
            const visited = new Set<number>();

            while (queue.length > 0) {
                const [cx, cy] = queue.shift()!;
                const cIndex = getIndex(cx, cy);

                if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) continue;
                if (visited.has(cIndex)) continue;
                if (newGrid[cIndex] !== targetColor) continue;

                newGrid[cIndex] = selectedColor;
                visited.add(cIndex);

                queue.push([cx + 1, cy]);
                queue.push([cx - 1, cy]);
                queue.push([cx, cy + 1]);
                queue.push([cx, cy - 1]);
            }
            setGrid(newGrid);
        }
    };

    // Pointer Events for Drag Drawing
    // We handle global paint action but update specific pixel
    const handlePointerDown = (index: number) => {
        setIsDrawing(true);
        paintPixel(index);
    };

    const handlePointerEnter = (index: number) => {
        if (isDrawing && activeTool !== 'bucket') {
            // "Continuous" painting only for pencil/eraser
            // We need to avoid saving history on every move for performace/ux in real app,
            // but for this simple version, let's just mutate state.
            // Ideally: Modify temp state, commit on pointerUp. 
            // Here: Just paint directly.

            // To prevent massive history stack, we skip history save inside 'paintPixel' if drawing continuous?
            // Actually, `paintPixel` saves history. That's bad for drag.
            // Let's refactor: separate 'apply' from 'history'.

            const tool = activeTool;
            const color = tool === 'eraser' ? '#ffffff' : selectedColor;

            setGrid(prev => {
                const next = [...prev];
                next[index] = color;
                return next;
            });
        }
    };

    // NOTE: Creating a proper undo for drag-drawing requires tracking start of stroke.
    // For simplicity, this version saves history on every 'click' (PointerDown), 
    // but Dragging (PointerEnter) only updates current state without separate history entries.
    // This means "Undo" will undo the INITIAL pixel of the stroke only... 
    // Fix: We should save history on PointerDown ONCE. 
    // And PointerEnter just updates.

    const handleClear = () => {
        saveToHistory(grid);
        setGrid(Array(GRID_SIZE * GRID_SIZE).fill('#ffffff'));
    };

    // Export
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw current grid to hidden canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // bg

        const scale = canvas.width / GRID_SIZE;

        grid.forEach((color, i) => {
            const { x, y } = getCoord(i);
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
        });

        const link = document.createElement('a');
        link.download = `pixel-art-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-24 sm:pb-10 flex flex-col items-center">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            {/* Header */}
            <header className="px-5 py-4 w-full flex items-center justify-between bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                    <span className="text-slate-600 font-mono text-sm mr-1">020</span>
                    Pixel Art
                </h1>
                <div className="flex gap-2">
                    <button onClick={() => setShowHelp(true)} className="p-2 text-slate-400 hover:text-white" aria-label="Help">
                        <span className="w-5 h-5 flex items-center justify-center border border-current rounded-full text-xs font-bold">?</span>
                    </button>
                    <button onClick={handleUndo} disabled={history.length === 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button onClick={handleDownload} className="p-2 bg-purple-600 rounded-lg text-white font-bold text-xs hover:bg-purple-500">
                        Export
                    </button>
                </div>
            </header>

            {/* Main Canvas Area */}
            <main className="flex-1 w-full flex flex-col items-center justify-center p-4">

                {/* Canvas Container */}
                <div
                    className="relative bg-slate-800 p-2 rounded-lg shadow-2xl border border-slate-700"
                    onPointerUp={() => setIsDrawing(false)}
                    onPointerLeave={() => setIsDrawing(false)}
                >
                    <div
                        className="grid gap-[1px] bg-slate-700 cursor-crosshair touch-none"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            width: 'min(90vw, 400px)',
                            height: 'min(90vw, 400px)'
                        }}
                    >
                        {grid.map((color, i) => (
                            <div
                                key={i}
                                onPointerDown={(e) => {
                                    e.preventDefault(); // prevent scroll
                                    handlePointerDown(i);
                                }}
                                onPointerEnter={(e) => {
                                    e.preventDefault();
                                    handlePointerEnter(i);
                                }}
                                className="w-full h-full bg-white transition-colors duration-75" // 'bg-white' is placeholder fallback
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Hidden Output Canvas */}
                <canvas ref={canvasRef} width={512} height={512} className="hidden" />

            </main>

            {/* Tools & Palette Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 pb-8 sm:pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-20">

                <div className="max-w-md mx-auto space-y-4">
                    {/* Tools Row */}
                    <div className="flex justify-around items-center bg-slate-800 rounded-xl p-2">
                        <ToolButton
                            icon="✏️"
                            label="Draw"
                            isActive={activeTool === 'pencil'}
                            onClick={() => setActiveTool('pencil')}
                        />
                        <ToolButton
                            icon="🪣"
                            label="Fill"
                            isActive={activeTool === 'bucket'}
                            onClick={() => setActiveTool('bucket')}
                        />
                        <ToolButton
                            icon="🧼"
                            label="Erase"
                            isActive={activeTool === 'eraser'}
                            onClick={() => setActiveTool('eraser')}
                        />
                        <div className="w-[1px] h-8 bg-slate-700 mx-2"></div>
                        <button onClick={handleClear} className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[10px] font-bold">Clear</span>
                        </button>
                    </div>

                    {/* Color Palette (Scrollable) */}
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="flex gap-2 w-max">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        setSelectedColor(c);
                                        if (activeTool === 'eraser') setActiveTool('pencil');
                                    }}
                                    className={`w-10 h-10 rounded-full border-2 transition-transform shadow-sm ${selectedColor === c && activeTool !== 'eraser' ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                    aria-label={`Color ${c}`}
                                />
                            ))}
                            {/* Custom Color Native Input */}
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-orange-500">
                                <input
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) => {
                                        setSelectedColor(e.target.value);
                                        if (activeTool === 'eraser') setActiveTool('pencil');
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-[150%] h-[150%] -top-1/4 -left-1/4"
                                />
                                <span className="text-white text-xs font-bold">+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Modal */}
            {showHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                            <span className="text-2xl">🎨</span> Pixel Art Editor
                        </h3>

                        <div className="space-y-6 text-slate-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                            <section>
                                <h4 className="text-purple-400 font-bold mb-2 text-xs uppercase tracking-wider">概要</h4>
                                <p>16x16のグリッドキャンバスで、レトロなドット絵を作成できるエディタです。作成した作品はPNG画像として保存できます。</p>
                            </section>

                            <section>
                                <h4 className="text-pink-400 font-bold mb-2 text-xs uppercase tracking-wider">主な機能</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <span className="text-xl">✏️</span>
                                        <div>
                                            <strong className="text-slate-200 block text-xs">Draw (鉛筆)</strong>
                                            <span className="text-xs text-slate-500">点を打ったり、なぞって線を描きます。</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-xl">🪣</span>
                                        <div>
                                            <strong className="text-slate-200 block text-xs">Fill (塗りつぶし)</strong>
                                            <span className="text-xs text-slate-500">繋がっている同じ色の領域を一括で塗りつぶします。</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-xl">🧼</span>
                                        <div>
                                            <strong className="text-slate-200 block text-xs">Erase (消しゴム)</strong>
                                            <span className="text-xs text-slate-500">色を消して白(背景)に戻します。</span>
                                        </div>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h4 className="text-blue-400 font-bold mb-2 text-xs uppercase tracking-wider">その他の操作</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-400 marker:text-slate-600">
                                    <li><strong>Undo (矢印)</strong>: 直前の操作を取り消します。</li>
                                    <li><strong>Export</strong>: 作品を画像としてダウンロードします。</li>
                                    <li><strong>Palette</strong>: 下部のパレットから色を選択。虹色ボタンで自由な色も選べます。</li>
                                </ul>
                            </section>
                        </div>

                        <button
                            onClick={() => setShowHelp(false)}
                            className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub Component
function ToolButton({ icon, label, isActive, onClick }: { icon: string, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 p-2 px-4 rounded-lg transition-all ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 transform scale-105' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
        >
            <span className="text-lg">{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
        </button>
    );
}
