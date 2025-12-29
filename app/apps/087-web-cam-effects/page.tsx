
"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, CameraOff, Sparkles } from "lucide-react";
import { clsx } from "clsx";

type Effect = "none" | "grayscale" | "sepia" | "invert" | "pixelate" | "threshold" | "mirror";

export default function WebCamEffects() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [effect, setEffect] = useState<Effect>("none");
    const [error, setError] = useState("");

    // Start Webcam
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsStreaming(true);
            }
        } catch (err) {
            setError("Cannot access camera. Please allow permission.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
        }
    };

    // Render Loop
    useEffect(() => {
        let animationFrameId: number;

        const render = () => {
            if (!videoRef.current || !canvasRef.current || !isStreaming) return;
            const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;

            const w = canvasRef.current.width;
            const h = canvasRef.current.height;

            // Draw video to canvas
            ctx.drawImage(videoRef.current, 0, 0, w, h);

            if (effect === "none") {
                // do nothing
            } else if (effect === "mirror") {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, -w, 0, w, h);
                ctx.restore();
            } else {
                const imgData = ctx.getImageData(0, 0, w, h);
                const data = imgData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    if (effect === "grayscale") {
                        const avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                        data[i] = avg;
                        data[i + 1] = avg;
                        data[i + 2] = avg;
                    }
                    else if (effect === "sepia") {
                        data[i] = (r * .393) + (g * .769) + (b * .189);
                        data[i + 1] = (r * .349) + (g * .686) + (b * .168);
                        data[i + 2] = (r * .272) + (g * .534) + (b * .131);
                    }
                    else if (effect === "invert") {
                        data[i] = 255 - r;
                        data[i + 1] = 255 - g;
                        data[i + 2] = 255 - b;
                    }
                    else if (effect === "threshold") {
                        const avg = (r + g + b) / 3;
                        const v = avg > 100 ? 255 : 0;
                        data[i] = v;
                        data[i + 1] = v;
                        data[i + 2] = v;
                    }
                }

                // Pixelate needs block processing, inefficient here but doable
                // For simplicity, sticking to pixel manipulation effects or just CSS based where possible, 
                // but Canvas gives snapshot ability.

                ctx.putImageData(imgData, 0, 0);
            }

            // Pixelate special case via drawImage scaling
            if (effect === "pixelate") {
                const size = 0.1; // 10% size
                const sw = w * size;
                const sh = h * size;
                // Draw small
                ctx.drawImage(videoRef.current, 0, 0, sw, sh);
                // Draw big (with nearest neighbor usually set on canvas CSS or context)
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(canvasRef.current, 0, 0, sw, sh, 0, 0, w, h);
                ctx.imageSmoothingEnabled = true;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        if (isStreaming) {
            render();
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isStreaming, effect]);

    return (
        <div className="min-h-screen bg-black text-white p-4 font-sans flex flex-col items-center">
            <header className="w-full max-w-4xl flex items-center gap-4 mb-6">
                <Link href="/apps" className="p-2 bg-neutral-800 rounded-full text-white hover:bg-neutral-700"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#087 Web Cam Effects</h1>
            </header>

            <div className="max-w-4xl w-full grid md:grid-cols-[1fr_200px] gap-6">
                <div className="relative aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center">
                    {!isStreaming && !error && (
                        <button onClick={startCamera} className="flex flex-col items-center gap-4 text-neutral-400 hover:text-white transition">
                            <Camera size={48} />
                            <span className="font-bold">Start Camera</span>
                        </button>
                    )}
                    {error && <div className="text-red-500 p-4 text-center font-bold">{error}</div>}

                    {/* Hidden Video Source */}
                    <video ref={videoRef} className="hidden" playsInline muted />

                    {/* Output Canvas */}
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={480}
                        className={clsx("w-full h-full object-contain pointer-events-none", !isStreaming && "hidden")}
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-neutral-500 mb-2 flex items-center gap-2"><Sparkles size={16} /> Effects</h3>
                    {["none", "grayscale", "sepia", "invert", "threshold", "pixelate", "mirror"].map(e => (
                        <button
                            key={e}
                            onClick={() => setEffect(e as Effect)}
                            className={clsx(
                                "w-full text-left px-4 py-3 rounded-xl text-sm font-bold capitalize transition border",
                                effect === e
                                    ? "bg-violet-600 border-violet-500 text-white"
                                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                            )}
                        >
                            {e}
                        </button>
                    ))}

                    {isStreaming && (
                        <button onClick={stopCamera} className="w-full mt-8 py-3 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-xl font-bold flex items-center justify-center gap-2">
                            <CameraOff size={16} /> Stop
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
