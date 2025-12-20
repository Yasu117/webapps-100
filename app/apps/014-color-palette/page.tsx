'use client';

import React, { useState } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Color = {
    hex: string;
    name: string;
    role: string;
};

type Palette = {
    themeName: string;
    description: string;
    colors: Color[];
};

export default function ColorPalettePage() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [palette, setPalette] = useState<Palette | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/color-palette/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setPalette(data);
        } catch (e) {
            console.error(e);
            alert('生成に失敗しました');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        // Could add a toast notification here
        alert(`Copied: ${hex}`);
    };

    // Helper to get color by role or index
    const getColor = (index: number) => palette?.colors[index]?.hex || '#cbd5e1';

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative flex flex-col">

                {/* Header */}
                <header className="bg-white/95 backdrop-blur sticky top-0 z-10 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
                        <span className="text-pink-500 mr-2">014</span>AI Color Palette
                    </h1>
                </header>

                <main className="flex-1 p-5 space-y-8 overflow-y-auto">

                    {/* Description */}
                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 text-xs text-slate-600 leading-relaxed shadow-sm">
                        <span className="font-bold text-pink-600">使い方:</span> 「真夜中のサイバーパンク」「春の桜並木」などのテーマを入力すると、AIが最適な5色パレットを生成します。
                    </div>

                    {/* Input Section */}
                    <section className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="テーマを入力 (例: レトロな喫茶店)..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-pink-100 focus:border-pink-400 outline-none transition-all shadow-inner"
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className={`absolute right-1 top-1 bottom-1 px-5 rounded-full font-bold text-xs text-white transition-all ${isGenerating || !prompt.trim()
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-pink-500 hover:bg-pink-400 shadow-md'
                                    }`}
                            >
                                {isGenerating ? '生成中...' : '生成'}
                            </button>
                        </div>
                    </section>

                    {/* Result Section */}
                    {palette && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {/* Theme Info */}
                            <div className="text-center space-y-1">
                                <h2 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                                    {palette.themeName}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {palette.description}
                                </p>
                            </div>

                            {/* Color Cards */}
                            <div className="grid gap-3">
                                {palette.colors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleCopy(color.hex)}
                                        className="group relative flex items-center justify-between p-2 pr-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-16 h-16 rounded-lg shadow-inner"
                                                style={{ backgroundColor: color.hex }}
                                            ></div>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-700 text-lg font-mono">
                                                    {color.hex}
                                                </div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                    {color.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            COPY
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Live Preview */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                                    UI Preview
                                </h3>
                                <div
                                    className="rounded-2xl p-6 shadow-xl border border-white/20 transition-colors duration-500"
                                    style={{ backgroundColor: getColor(2) }} // Usually background
                                >
                                    <div
                                        className="rounded-xl p-5 shadow-lg backdrop-blur-sm transition-colors duration-500"
                                        style={{ backgroundColor: getColor(3) }} // Usually surface
                                    >
                                        <h4
                                            className="font-bold text-lg mb-2 transition-colors duration-500"
                                            style={{ color: getColor(4) }} // Usually text
                                        >
                                            Card Title
                                        </h4>
                                        <p
                                            className="text-sm mb-4 opacity-80 transition-colors duration-500"
                                            style={{ color: getColor(4) }} // Usually text
                                        >
                                            This is a preview of how these colors might work together in a UI component.
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                className="px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95"
                                                style={{
                                                    backgroundColor: getColor(0), // Primary
                                                    color: '#ffffff' // Assuming primary is dark/saturated logic or could calculate contrast
                                                }}
                                            >
                                                Action
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg text-sm font-bold border border-current opacity-60"
                                                style={{ color: getColor(1) }} // Secondary
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
