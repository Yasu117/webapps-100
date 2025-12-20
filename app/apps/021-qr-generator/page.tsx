'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from 'qrcode.react';

export default function QRGeneratorPage() {
    const [text, setText] = useState('https://example.com');
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [size, setSize] = useState(256);

    // Download logic
    const handleDownload = () => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `qrcode_${Date.now()}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-10 flex flex-col items-center">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            {/* Header */}
            <header className="px-5 py-6 w-full flex items-center justify-between bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
                    <span className="text-slate-600 font-mono text-base mr-1">021</span>
                    QR Generator
                </h1>
            </header>

            <main className="flex-1 w-full max-w-lg p-5 flex flex-col gap-6">

                {/* Preview Card */}
                <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 opacity-50"></div>

                    <div className="relative z-10 p-4 rounded-xl shadow-lg transition-colors duration-200" style={{ backgroundColor: bgColor }}>
                        <QRCodeCanvas
                            value={text}
                            size={size}
                            bgColor={bgColor}
                            fgColor={fgColor}
                            level={"H"}
                            marginSize={1}
                        />
                    </div>

                    <p className="mt-4 text-xs text-slate-500 font-mono break-all text-center max-w-xs opacity-75">
                        {text.length > 50 ? text.substring(0, 50) + '...' : text}
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 space-y-6 backdrop-blur-sm">

                    {/* Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-700"
                            placeholder="Type URL or text here..."
                            rows={3}
                        />
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Foreground</label>
                            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-700">
                                <input
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none p-0"
                                />
                                <span className="text-xs font-mono">{fgColor}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Background</label>
                            <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-700">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none p-0"
                                />
                                <span className="text-xs font-mono">{bgColor}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <button
                        onClick={handleDownload}
                        disabled={!text}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download PNG
                    </button>
                </div>

                {/* Tips */}
                <div className="text-center text-xs text-slate-600">
                    <p>Tip: Ensure good contrast for scannability.</p>
                </div>
            </main>
        </div>
    );
}
