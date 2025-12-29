
"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Simple Fireworks
type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    color: string;
    life: number;
};

export default function FireworksSimulator() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let particles: Particle[] = [];

        const createFirework = (x: number, y: number) => {
            const count = 50 + Math.random() * 50;
            // Random bright color
            const color = `hsl(${Math.random() * 360}, 100%, 60%)`;

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 2;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: color,
                    life: Math.random() * 0.5 + 0.5
                });
            }
        };

        const render = () => {
            // Fade effect
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, width, height);

            // Composite lighter for glow
            ctx.globalCompositeOperation = "lighter";

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // Gravity
                p.vx *= 0.96; // Air resistance
                p.vy *= 0.96;

                p.life -= 0.01;
                p.alpha = Math.max(0, p.life);

                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();

                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }

            // Reset composite
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;

            // Auto fireworks occasionally
            if (Math.random() < 0.03) {
                createFirework(Math.random() * width, Math.random() * height * 0.8);
            }

            requestAnimationFrame(render);
        };

        render();

        const handleClick = (e: MouseEvent) => {
            createFirework(e.clientX, e.clientY);
        };

        // Touch support
        const handleTouch = (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            createFirework(touch.clientX, touch.clientY);
        };

        canvas.addEventListener("click", handleClick);
        canvas.addEventListener("touchstart", handleTouch, { passive: false });

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener("resize", handleResize);

        return () => {
            canvas.removeEventListener("click", handleClick);
            canvas.removeEventListener("touchstart", handleTouch);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black cursor-crosshair">
            <Link href="/apps" className="absolute top-4 left-4 z-10 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition backdrop-blur-md">
                <ArrowLeft size={24} />
            </Link>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none animate-pulse text-center">
                <span className="font-bold text-xs block mb-1">#065 Fireworks</span>
                Tap anywhere
            </div>
            <canvas ref={canvasRef} className="block" />
        </div>
    );
}
