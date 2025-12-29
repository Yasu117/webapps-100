
"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, Download, Sliders } from "lucide-react";
import Link from "next/link";

const FILTERS = [
    { name: "Normal", filter: "none" },
    { name: "Grayscale", filter: "grayscale(100%)" },
    { name: "Sepia", filter: "sepia(100%)" },
    { name: "Invert", filter: "invert(100%)" },
    { name: "Blur", filter: "blur(5px)" },
    { name: "Brightness", filter: "brightness(150%)" },
    { name: "Contrast", filter: "contrast(200%)" },
    { name: "Hue Rotate", filter: "hue-rotate(90deg)" },
];

export default function ImageFilterStudio() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState("none");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (typeof ev.target?.result === "string") {
                    setImageSrc(ev.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imageSrc) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.filter = selectedFilter;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    };

    useEffect(() => {
        draw();
    }, [imageSrc, selectedFilter]);

    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Re-draw to ensure filter is applied in high res context
        draw();
        // Need a small timeout or verify draw completion? 
        // Actually ctx.filter works on drawImage immediately.

        const link = document.createElement("a");
        link.download = "filtered-image.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white pb-24">
            <div className="flex items-center justify-between p-4 bg-neutral-800">
                <Link href="/apps" className="p-2 -ml-2 rounded-full hover:bg-neutral-700">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-bold text-lg">Filter Studio</h1>
                <button
                    onClick={download}
                    disabled={!imageSrc}
                    className="p-2 text-blue-400 hover:bg-neutral-700 rounded-full disabled:opacity-50"
                >
                    <Download size={24} />
                </button>
            </div>

            <div className="p-4 flex flex-col items-center gap-6">
                {/* Preview Area */}
                <div className="w-full aspect-[4/5] bg-neutral-800 rounded-2xl border-2 border-dashed border-neutral-700 flex items-center justify-center overflow-hidden relative">
                    {imageSrc ? (
                        <>
                            {/* CSS Preview for smooth UI, Canvas hidden for processing */}
                            <img src={imageSrc} style={{ filter: selectedFilter }} className="w-full h-full object-contain" />
                            <canvas ref={canvasRef} className="hidden" />
                        </>
                    ) : (
                        <label className="flex flex-col items-center gap-2 text-neutral-500 cursor-pointer w-full h-full justify-center hover:bg-neutral-750 transition-colors">
                            <Upload size={48} />
                            <span className="font-bold">Tap to upload photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                        </label>
                    )}
                </div>

                {/* Filter Selector */}
                {imageSrc && (
                    <div className="w-full overflow-x-auto pb-4">
                        <div className="flex gap-4 px-2">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.name}
                                    onClick={() => setSelectedFilter(f.filter)}
                                    className={`flex flex-col items-center gap-2 min-w-[80px] group`}
                                >
                                    <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedFilter === f.filter ? "border-blue-500 scale-105" : "border-transparent group-hover:border-neutral-600"}`}>
                                        <img src={imageSrc} className="w-full h-full object-cover" style={{ filter: f.filter }} />
                                    </div>
                                    <span className={`text-xs font-bold ${selectedFilter === f.filter ? "text-blue-400" : "text-neutral-400"}`}>
                                        {f.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
