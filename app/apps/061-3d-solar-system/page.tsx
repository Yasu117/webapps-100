
"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Simple Canvas Implementation of Solar System (to avoid heavy Three.js setup for this snippet)
// But implementing it with faux-3D orbital mechanics.

export default function SolarSystem() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const planets = [
            { name: "Mercury", color: "#A5A5A5", size: 4, dist: 60, speed: 0.04 },
            { name: "Venus", color: "#E3BB76", size: 8, dist: 90, speed: 0.02 },
            { name: "Earth", color: "#4F86F7", size: 8.5, dist: 130, speed: 0.015 },
            { name: "Mars", color: "#E05536", size: 6, dist: 170, speed: 0.012 },
            { name: "Jupiter", color: "#D6A56C", size: 20, dist: 240, speed: 0.005 },
            { name: "Saturn", color: "#F4D089", size: 16, dist: 320, speed: 0.003 },
        ];

        // Starry background
        const stars = Array.from({ length: 200 }).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            alpha: Math.random()
        }));

        let t = 0;

        const render = () => {
            ctx.fillStyle = "#02040a";
            ctx.fillRect(0, 0, width, height);

            // Draw stars
            stars.forEach(s => {
                ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            });

            const cx = width / 2;
            const cy = height / 2;

            // Sun
            const sunGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
            sunGradient.addColorStop(0, "#FFFF00");
            sunGradient.addColorStop(0.5, "#FFA500");
            sunGradient.addColorStop(1, "transparent");

            ctx.fillStyle = sunGradient;
            ctx.shadowBlur = 50;
            ctx.shadowColor = "#FFA500";
            ctx.beginPath();
            ctx.arc(cx, cy, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Orbits & Planets
            planets.forEach(p => {
                // Draw orbit path
                ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
                ctx.beginPath();
                ctx.ellipse(cx, cy, p.dist * 1.5, p.dist, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Calculate position
                const angle = t * p.speed;
                const px = cx + Math.cos(angle) * (p.dist * 1.5);
                const py = cy + Math.sin(angle) * p.dist;

                // Draw planet
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                ctx.font = "10px Sans-Serif";
                ctx.fillText(p.name, px + p.size + 4, py);
            });

            t++;
            requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);

    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden bg-black">
            <Link href="/apps" className="absolute top-4 left-4 z-10 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition backdrop-blur-md">
                <ArrowLeft size={24} />
            </Link>
            <div className="absolute bottom-4 left-4 text-white/50 text-xs z-10">
                <span className="font-bold mr-1">#061</span>
                Pseudo-3D Solar System (Not to scale) - 惑星の軌道を眺める癒やしの空間
            </div>
            <canvas ref={canvasRef} className="block" />
        </div>
    );
}
