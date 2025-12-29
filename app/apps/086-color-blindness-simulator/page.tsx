
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Eye } from "lucide-react";
import { clsx } from "clsx";

const FILTERS = [
    { id: "normal", name: "Normal (Trichromat)", matrix: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" },
    { id: "protanopia", name: "Protanopia (No Red)", matrix: "0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" },
    { id: "deuteranopia", name: "Deuteranopia (No Green)", matrix: "0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" },
    { id: "tritanopia", name: "Tritanopia (No Blue)", matrix: "0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" },
    { id: "achromatopsia", name: "Achromatopsia (No Color)", matrix: "0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" },
];

export default function ColorBlindnessSim() {
    const [image, setImage] = useState<string | null>(null);
    const [filter, setFilter] = useState(FILTERS[0]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 p-4 font-sans">
            <header className="max-w-4xl mx-auto flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-50"><ArrowLeft size={20} /></Link>
                    <h1 className="text-xl font-bold">#086 Color Blindness Simulator</h1>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/30">
                    <Upload size={18} />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
            </header>

            {/* SVG Filter Definitions */}
            <svg className="absolute w-0 h-0 pointer-events-none">
                <defs>
                    {FILTERS.map(f => (
                        <filter key={f.id} id={f.id}>
                            <feColorMatrix type="matrix" values={f.matrix} />
                        </filter>
                    ))}
                </defs>
            </svg>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-[300px_1fr] gap-8">
                {/* Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <h3 className="font-bold text-slate-500 mb-4 flex items-center gap-2"><Eye size={16} /> Vision Modes</h3>
                    <div className="space-y-2">
                        {FILTERS.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition",
                                    filter.id === f.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 text-xs text-slate-400">
                        This tool simulates how people with color vision deficiencies perceive images using SVG Color Matrix filters.
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex items-center justify-center min-h-[500px] relative bg-checkered p-4">
                    {!image ? (
                        <div className="text-center text-slate-400">
                            <div className="text-6xl mb-4">🖼️</div>
                            <p>Upload an image to start simulation</p>
                        </div>
                    ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={image}
                            alt="Simulation"
                            className="max-w-full max-h-[80vh] object-contain transition-all duration-500"
                            style={{ filter: `url(#${filter.id})` }}
                        />
                    )}

                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm pointer-events-none">
                        {filter.name}
                    </div>
                </div>
            </div>
        </div>
    );
}
