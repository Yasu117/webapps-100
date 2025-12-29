
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { clsx } from "clsx";

export default function SvgPatterns() {
    const [pattern, setPattern] = useState("dots");
    const [color, setColor] = useState("#4f46e5"); // indigo-600
    const [bg, setBg] = useState("#ffffff");
    const [opacity, setOpacity] = useState(0.5);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [copied, setCopied] = useState(false);

    const getSvg = () => {
        const s = 20 * scale;
        let p = "";

        // Define patterns 20x20 viewBox base
        if (pattern === "dots") {
            p = `<circle cx="2" cy="2" r="2" fill="${color}" fill-opacity="${opacity}"/>`;
        } else if (pattern === "grid") {
            p = `<path d="M 20 0 L 0 0 0 20" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="2"/>`;
        } else if (pattern === "lines") {
            p = `<path d="M 0 20 L 20 0" stroke="${color}" stroke-opacity="${opacity}" stroke-width="2"/>`;
        } else if (pattern === "checks") {
            // 10x10 squares in 20x20
            p = `<rect x="0" y="0" width="10" height="10" fill="${color}" fill-opacity="${opacity}"/><rect x="10" y="10" width="10" height="10" fill="${color}" fill-opacity="${opacity}"/>`;
        }

        // SVG Data URI
        // transform rotation on the pattern element? Or on the usage? 
        // SVG patternTransform attribute!
        const svgString = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
<pattern id="p" x="0" y="0" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
${p}
</pattern>
</defs>
<rect width="100%" height="100%" fill="${bg}"/>
<rect width="100%" height="100%" fill="url(#p)" />
</svg>`;
        return svgString;
    };

    const getDataUri = () => {
        return `data:image/svg+xml,${encodeURIComponent(getSvg().replace(/\n/g, ''))}`;
    };

    const cssCode = `background-image: url('${getDataUri()}');`;

    const handleCopy = () => {
        navigator.clipboard.writeText(cssCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen font-sans flex flex-col md:flex-row">
            {/* Sidebar Controls */}
            <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto h-auto md:h-screen z-10 shrink-0 shadow-xl">
                <header className="flex items-center gap-4">
                    <Link href="/apps" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ArrowLeft size={18} /></Link>
                    <h1 className="font-bold">#099 Patterns</h1>
                </header>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Pattern</label>
                        <div className="grid grid-cols-2 gap-2">
                            {["dots", "grid", "lines", "checks"].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPattern(p)}
                                    className={clsx(
                                        "px-4 py-2 text-sm font-bold rounded-lg border-2 capitalize transition",
                                        pattern === p ? "border-indigo-600 text-indigo-600 bg-indigo-50" : "border-slate-100 text-slate-500 hover:border-slate-200"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Colors</label>
                        <div className="flex gap-4">
                            <div>
                                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 block" />
                                <span className="text-[10px] text-slate-400">Foreground</span>
                            </div>
                            <div>
                                <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 block" />
                                <span className="text-[10px] text-slate-400">Background</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Opacity ({Math.round(opacity * 100)}%)</label>
                        <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Scale ({scale}x)</label>
                        <input type="range" min="0.5" max="5" step="0.5" value={scale} onChange={e => setScale(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Rotation ({rotation}°)</label>
                        <input type="range" min="0" max="360" step="15" value={rotation} onChange={e => setRotation(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    <button
                        onClick={handleCopy}
                        className={clsx(
                            "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-white",
                            copied ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-500"
                        )}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? "Copied CSS!" : "Copy CSS"}
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div
                className="flex-1 min-h-[50vh] transition-all"
                style={{ backgroundImage: `url('${getDataUri()}')` }}
            >
                {/* Overlay text for demo */}
                <div className="w-full h-full flex items-center justify-center">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Seamless Patterns</h2>
                        <p className="text-slate-500 text-sm">
                            Generate beautiful SVG backgrounds for your Next.js projects. Fully customizable.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
