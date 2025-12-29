
"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, Image as ImageIcon } from "lucide-react";

export default function ImageCompressor() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState(0);
    const [processedSize, setProcessedSize] = useState(0);
    const [quality, setQuality] = useState(0.8);
    const [scale, setScale] = useState(1.0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalSize(file.size);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setOriginalImage(ev.target?.result as string);
                processImage(ev.target?.result as string, quality, scale);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = (src: string, q: number, s: number) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const w = img.width * s;
            const h = img.height * s;
            canvas.width = w;
            canvas.height = h;

            ctx.drawImage(img, 0, 0, w, h);

            // Compress (High Compression JPEG)
            const dataUrl = canvas.toDataURL("image/jpeg", q);
            setProcessedImage(dataUrl);

            // Approximate size calculation
            const head = "data:image/jpeg;base64,";
            const size = Math.round((dataUrl.length - head.length) * 3 / 4);
            setProcessedSize(size);
        };
    };

    const handleQualityChange = (val: number) => {
        setQuality(val);
        if (originalImage) processImage(originalImage, val, scale);
    };

    const handleScaleChange = (val: number) => {
        setScale(val);
        if (originalImage) processImage(originalImage, quality, val);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-4 font-sans">
            <header className="max-w-4xl mx-auto flex items-center gap-4 mb-8">
                <Link href="/apps" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#079 Image Compressor</h1>
            </header>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Upload */}
                {!originalImage && (
                    <div className="h-64 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800 transition">
                        <label className="cursor-pointer flex flex-col items-center gap-4">
                            <div className="p-4 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-500/30">
                                <Upload size={32} />
                            </div>
                            <span className="font-bold text-lg">Select Image</span>
                            <span className="text-sm text-slate-500">JPG, PNG, WebP</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                        </label>
                    </div>
                )}

                {originalImage && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Controls */}
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                                <span className="font-bold">Settings</span>
                                <button onClick={() => setOriginalImage(null)} className="text-xs text-red-400 hover:text-red-300">Reset</button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Quality (JPEG)</span>
                                        <span>{Math.round(quality * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0.1" max="1" step="0.05"
                                        value={quality}
                                        onChange={e => handleQualityChange(Number(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Scale (Resize)</span>
                                        <span>{Math.round(scale * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0.1" max="1" step="0.1"
                                        value={scale}
                                        onChange={e => handleScaleChange(Number(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-900 p-4 rounded-xl space-y-2 text-sm">
                                <div className="flex justify-between text-slate-400">
                                    <span>Original Size</span>
                                    <span>{formatSize(originalSize)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-green-400">
                                    <span>Compressed</span>
                                    <span>{formatSize(processedSize)}</span>
                                </div>
                                <div className="text-right text-xs text-slate-500">
                                    Running client-side (No upload)
                                </div>
                            </div>

                            {processedImage && (
                                <a
                                    href={processedImage}
                                    download="compressed-image.jpg"
                                    className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-center rounded-xl transition shadow-lg"
                                >
                                    <Download className="inline mr-2" size={18} />
                                    Download
                                </a>
                            )}
                        </div>

                        {/* Preview */}
                        <div className="flex flex-col gap-4">
                            <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[300px]">
                                {processedImage ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={processedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <ImageIcon className="text-slate-800" size={48} />
                                )}
                            </div>
                            <div className="text-center text-xs text-slate-500">Preview (Approximation)</div>
                        </div>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
