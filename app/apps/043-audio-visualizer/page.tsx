
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, MicOff } from "lucide-react";
import Link from "next/link";

export default function AudioVisualizer() {
    const [isListening, setIsListening] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number>(0);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyzerRef.current = audioCtxRef.current.createAnalyser();
            sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);

            sourceRef.current.connect(analyzerRef.current);
            analyzerRef.current.fftSize = 256;

            setIsListening(true);
            draw();
        } catch (err) {
            console.error("Error accessing microphone", err);
            alert("Microphone access denied or error occurred.");
        }
    };

    const stopListening = () => {
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setIsListening(false);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        const analyzer = analyzerRef.current;
        if (!canvas || !analyzer) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            animationRef.current = requestAnimationFrame(render);
            analyzer.getByteFrequencyData(dataArray);

            ctx.fillStyle = "#0f172a"; // bg-slate-900
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];

                const hue = i * 2 + 150; // Blue-ish
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

                // Draw rounded bar?
                ctx.fillRect(x, canvas.height - barHeight * 1.5, barWidth, barHeight * 1.5);

                x += barWidth + 1;
            }
        };
        render();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight * 0.6;

            // Initial Clear
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
        return stopListening;
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <div className="flex items-center justify-between p-4 z-10 absolute w-full top-0">
                <Link href="/apps" className="p-2 -ml-2 rounded-full hover:bg-slate-800 bg-slate-900/50 backdrop-blur">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-bold text-lg bg-slate-900/50 px-3 py-1 rounded-full backdrop-blur">Audio Visualizer</h1>
                <div className="w-8" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative">
                <canvas ref={canvasRef} className="w-full h-full absolute inset-0 mix-blend-screen" />

                <div className="z-10 text-center space-y-4">
                    {!isListening ? (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                            <button
                                onClick={startListening}
                                className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                            >
                                <Mic size={40} />
                            </button>
                            <p className="text-slate-400 font-bold">Tap to Start</p>
                        </div>
                    ) : (
                        <button
                            onClick={stopListening}
                            className="w-16 h-16 rounded-full bg-red-600/80 hover:bg-red-500 flex items-center justify-center transition-all animate-pulse"
                        >
                            <MicOff size={24} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
