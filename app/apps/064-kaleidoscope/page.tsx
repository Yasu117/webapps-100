
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

export default function Kaleidoscope() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    // Create a default pattern
    useEffect(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            // Draw some random stuff
            for (let i = 0; i < 50; i++) {
                ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
                ctx.beginPath();
                ctx.arc(Math.random() * 400, Math.random() * 400, Math.random() * 50, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(Math.random() * 400, Math.random() * 400, Math.random() * 100, Math.random() * 100);
            }
            setImageSrc(canvas.toDataURL());
        }
    }, []);

    useEffect(() => {
        if (!imageSrc) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const img = new Image();
        img.src = imageSrc;

        let offset = 0;
        let renderId: number;

        const render = () => {
            offset += 0.005;
            const cx = width / 2;
            const cy = height / 2;
            const radius = Math.max(width, height) / 1.5;

            // Clear background
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, width, height);

            const slices = 12;
            const step = (Math.PI * 2) / slices;

            ctx.save();
            ctx.translate(cx, cy);

            for (let i = 0; i < slices; i++) {
                ctx.save();
                ctx.rotate(i * step);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, -step / 2 - 0.01, step / 2 + 0.01); // Slight overlap to fix seams
                ctx.lineTo(0, 0);
                ctx.clip();

                // Mirror every other slice for seamless effect
                if (i % 2 === 1) {
                    ctx.scale(1, -1);
                }

                // Draw image moving in a circle
                const size = 600;
                const ox = Math.cos(offset) * 100;
                const oy = Math.sin(offset * 1.5) * 100;

                // Rotate the pattern itself
                ctx.rotate(offset * 2);
                ctx.drawImage(img, -size / 2 + ox, -size / 2 + oy, size, size);

                ctx.restore();
            }
            ctx.restore();

            renderId = requestAnimationFrame(render);
        };

        img.onload = render;

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(renderId);
        }
    }, [imageSrc]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImageSrc(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black overflow-hidden">
            <Link href="/apps" className="absolute top-4 left-4 z-20 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition backdrop-blur-md">
                <ArrowLeft size={24} />
            </Link>

            <div className="absolute top-4 right-4 z-20 text-white/50 text-xs text-right pointer-events-none">
                <span className="font-bold">#064</span> Isomer<br />美しい幾何学模様の世界
            </div>

            <label className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 text-white border border-white/20 shadow-xl transition active:scale-95">
                <ImageIcon size={20} />
                <span className="font-bold text-sm">Change Image</span>
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>

            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}
