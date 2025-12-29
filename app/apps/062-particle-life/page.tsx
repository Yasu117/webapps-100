
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Settings2 } from "lucide-react";

// Particle Life implementation
// Rules:
// - Particles have types (colors)
// - Forces exist between types (attract/repel)
// - F = G * (1 / distance)  (Simplified)

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: number;
};

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308"]; // Red, Green, Blue, Yellow

export default function ParticleLife() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rules, setRules] = useState<number[][]>([]);

    // Randomize rules (Matrix of attraction forces: -1 to 1)
    const randomizeRules = () => {
        const newRules = [];
        for (let i = 0; i < COLORS.length; i++) {
            const row = [];
            for (let j = 0; j < COLORS.length; j++) {
                row.push((Math.random() * 2 - 1)); // -1 ~ 1
            }
            newRules.push(row);
        }
        setRules(newRules);
    };

    useEffect(() => {
        randomizeRules();
    }, []);

    useEffect(() => {
        if (rules.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Create Particles
        let particles: Particle[] = [];
        const count = 600;

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                type: Math.floor(Math.random() * COLORS.length)
            });
        }

        const applyRules = () => {
            for (let i = 0; i < particles.length; i++) {
                let fx = 0;
                let fy = 0;
                const a = particles[i];

                for (let j = 0; j < particles.length; j++) {
                    if (i === j) continue; // Same particle
                    const b = particles[j];

                    let dx = a.x - b.x;
                    let dy = a.y - b.y;

                    // Wrap around distance (Torus topology)
                    if (dx > width * 0.5) dx -= width;
                    if (dx < -width * 0.5) dx += width;
                    if (dy > height * 0.5) dy -= height;
                    if (dy < -height * 0.5) dy += height;

                    const d = Math.sqrt(dx * dx + dy * dy);

                    if (d > 0 && d < 80) { // Interaction radius
                        const F = rules[a.type][b.type] * (1 / d);
                        fx += (F * dx);
                        fy += (F * dy);
                    }
                }

                a.vx = (a.vx + fx) * 0.5; // Friction
                a.vy = (a.vy + fy) * 0.5;

                a.x += a.vx;
                a.y += a.vy;

                // Wrap boundaries
                if (a.x <= 0) a.x += width;
                if (a.x >= width) a.x -= width;
                if (a.y <= 0) a.y += height;
                if (a.y >= height) a.y -= height;
            }
        };

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Trails
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                ctx.fillStyle = COLORS[p.type];
                ctx.fillRect(p.x, p.y, 2, 2);
            });
        };

        let frameId: number;
        const loop = () => {
            applyRules();
            draw();
            frameId = requestAnimationFrame(loop);
        };
        loop();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", handleResize);
        };

    }, [rules]);

    return (
        <div className="fixed inset-0 bg-black">
            <Link href="/apps" className="absolute top-4 left-4 z-10 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition backdrop-blur-md">
                <ArrowLeft size={24} />
            </Link>

            <div className="absolute top-4 left-16 z-10 flex gap-2">
                <button
                    onClick={randomizeRules}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm backdrop-blur-md transition border border-white/10"
                >
                    <RefreshCw size={16} /> Randomize Rules
                </button>
            </div>

            <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
                <div className="bg-black/50 p-4 rounded-xl backdrop-blur-md border border-white/10">
                    <div className="text-white/70 text-[10px] mb-2 max-w-[200px]">
                        <span className="font-bold text-white mr-1">#062</span>
                        4色の粒子が相互作用する人工生命シミュレーション
                    </div>
                    <h3 className="text-white text-xs font-bold mb-2 flex items-center gap-2"><Settings2 size={12} /> Interaction Matrix</h3>
                    <div className="grid grid-cols-4 gap-1">
                        {rules.map((row, i) => (
                            row.map((val, j) => (
                                <div key={`${i}-${j}`} className="w-4 h-4 rounded-sm" style={{
                                    backgroundColor: `rgba(255, 255, 255, ${(val + 1) / 2})`,
                                    border: `1px solid ${COLORS[j]}` // Target
                                }}></div>
                            ))
                        ))}
                    </div>
                </div>
            </div>

            <canvas ref={canvasRef} className="block" />
        </div>
    );
}
