
"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Copy } from "lucide-react";

const ASCII_CHARS = "@%#*+=-:. ";

export default function AsciiGenerator() {
    const [image, setImage] = useState<string | null>(null);
    const [ascii, setAscii] = useState("");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImage(ev.target?.result as string);
                generateAscii(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateAscii = (src: string) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Resize for ASCII (Width ~ 100 chars)
            const width = 100;
            const scale = width / img.width;
            const height = Math.floor(img.height * scale * 0.55); // Adjust aspect ratio for char height

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const pixels = imageData.data;

            let str = "";
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const offset = (y * width + x) * 4;
                    const r = pixels[offset];
                    const g = pixels[offset + 1];
                    const b = pixels[offset + 2];

                    const avg = (r + g + b) / 3;
                    const charIndex = Math.floor((avg / 255) * (ASCII_CHARS.length - 1));
                    str += ASCII_CHARS[charIndex];
                }
                str += "\n";
            }
            setAscii(str);
        };
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4">
            <header className="flex items-center gap-4 mb-6">
                <Link href="/apps" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">ASCII Art Generator</h1>
            </header>

            <div className="max-w-4xl mx-auto mb-6 bg-slate-800 p-3 rounded-lg text-xs text-slate-300 border border-slate-700">
                <span className="font-bold text-green-400 mr-2">#063</span>
                画像をアップロードするとアスキーアートに変換します。コピーしてSNSなどで使えます。
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-center">
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 transition px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg border border-slate-700">
                        <Upload size={20} />
                        <span>Upload Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                    </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4 items-start">
                    {image && (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center">
                            <span className="text-xs text-slate-500 mb-2">Original</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image} alt="Original" className="max-h-64 object-contain rounded" />
                        </div>
                    )}

                    {ascii && (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 relative group">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-500">ASCII Result</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(ascii)}
                                    className="bg-white/10 hover:bg-white/20 p-2 rounded text-xs flex items-center gap-1 transition"
                                >
                                    <Copy size={12} /> Copy
                                </button>
                            </div>
                            <pre className="text-[6px] leading-[6px] font-mono whitespace-pre overflow-x-auto text-green-400 select-all">
                                {ascii}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
