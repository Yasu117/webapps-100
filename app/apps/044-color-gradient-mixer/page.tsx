
"use client";

import React, { useState } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function ColorGradientMixer() {
    const [color1, setColor1] = useState("#4f46e5");
    const [color2, setColor2] = useState("#ec4899");
    const [angle, setAngle] = useState(135);
    const [copied, setCopied] = useState(false);

    const gradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

    const cssCode = `background: ${gradient};`;

    const copy = () => {
        navigator.clipboard.writeText(cssCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen transition-colors duration-500 flex flex-col items-center justify-center p-6"
            style={{ background: gradient }}>

            <Link href="/apps" className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition-colors">
                <ArrowLeft size={24} />
            </Link>

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl w-full max-w-md space-y-8 animate-in slide-in-from-bottom-5 duration-500">

                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Gradient Mixer</h1>
                </div>

                {/* Color Pickers */}
                <div className="flex justify-between items-center px-4">
                    <div className="flex flex-col items-center gap-2">
                        <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-16 h-16 rounded-full overflow-hidden cursor-pointer border-4 border-white shadow-lg" />
                        <span className="font-mono text-sm text-slate-500 uppercase">{color1}</span>
                    </div>

                    <div className="h-1 flex-1 mx-4 bg-slate-200 rounded-full relative">
                        {/* Direction Indicator */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300">
                            →
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-16 h-16 rounded-full overflow-hidden cursor-pointer border-4 border-white shadow-lg" />
                        <span className="font-mono text-sm text-slate-500 uppercase">{color2}</span>
                    </div>
                </div>

                {/* Angle Slider */}
                <div>
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                        <span>Angle</span>
                        <span>{angle}°</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                {/* Code Output */}
                <div className="relative group">
                    <div className="bg-slate-800 text-slate-300 p-4 rounded-xl font-mono text-xs break-all pr-12">
                        {cssCode}
                    </div>
                    <button
                        onClick={copy}
                        className="absolute right-2 top-2 p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
                    >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

        </div>
    );
}
