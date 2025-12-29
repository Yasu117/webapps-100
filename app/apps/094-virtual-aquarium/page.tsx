
"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Fish = {
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    vx: number;
    vy: number;
    hue: number;
};

type Food = {
    x: number;
    y: number;
};

export default function VirtualAquarium() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fishes = useRef<Fish[]>([]);
    const foods = useRef<Food[]>([]);

    useEffect(() => {
        // Init fishes
        for (let i = 0; i < 15; i++) {
            fishes.current.push(createRandomFish());
        }

        let animationId: number;
        const ctx = canvasRef.current?.getContext("2d");

        const loop = () => {
            if (!canvasRef.current || !ctx) return;
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;

            // Clear (Background Gradient logic inside draw)
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, "#001133");
            grad.addColorStop(1, "#003366");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Draw Bubbles / Decoration (Static for now or simple random)

            // Update & Draw Food
            ctx.fillStyle = "#8B4513";
            for (let i = foods.current.length - 1; i >= 0; i--) {
                const food = foods.current[i];
                food.y += 1; // Sink
                ctx.beginPath();
                ctx.arc(food.x, food.y, 3, 0, Math.PI * 2);
                ctx.fill();

                if (food.y > h) foods.current.splice(i, 1);
            }

            // Update & Draw Fishes
            fishes.current.forEach(fish => {
                // Seek food
                let targetX = fish.x + fish.vx * 100;
                let targetY = fish.y + fish.vy * 100;

                // Simple food seeking
                let closestFood: Food | null = null;
                let minDist = 200;

                for (const f of foods.current) {
                    const d = Math.hypot(f.x - fish.x, f.y - fish.y);
                    if (d < minDist) {
                        minDist = d;
                        closestFood = f;
                    }
                }

                if (closestFood) {
                    const dx = closestFood.x - fish.x;
                    const dy = closestFood.y - fish.y;
                    const angle = Math.atan2(dy, dx);
                    fish.vx += Math.cos(angle) * 0.1;
                    fish.vy += Math.sin(angle) * 0.1;

                    // Eat
                    if (minDist < 10) {
                        foods.current = foods.current.filter(f => f !== closestFood);
                        fish.size = Math.min(fish.size + 1, 40); // Grow
                    }
                }

                // Random wandering
                fish.vx += (Math.random() - 0.5) * 0.1;
                fish.vy += (Math.random() - 0.5) * 0.1;

                // Friction & Speed Limit
                const speed = Math.hypot(fish.vx, fish.vy);
                if (speed > fish.speed) {
                    fish.vx *= 0.95;
                    fish.vy *= 0.95;
                }

                // Move
                fish.x += fish.vx;
                fish.y += fish.vy;

                // Bounds turn
                const margin = 50;
                if (fish.x < margin) fish.vx += 0.2;
                if (fish.x > w - margin) fish.vx -= 0.2;
                if (fish.y < margin) fish.vy += 0.2;
                if (fish.y > h - margin) fish.vy -= 0.2;

                drawFish(ctx, fish);
            });

            animationId = requestAnimationFrame(loop);
        };
        animationId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(animationId);
    }, []);

    const createRandomFish = (): Fish => ({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: 15 + Math.random() * 15,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        hue: Math.random() * 360,
        speed: 2 + Math.random() * 2,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5
    });

    const drawFish = (ctx: CanvasRenderingContext2D, fish: Fish) => {
        ctx.save();
        ctx.translate(fish.x, fish.y);
        const angle = Math.atan2(fish.vy, fish.vx);
        ctx.rotate(angle);

        if (Math.abs(angle) > Math.PI / 2) {
            ctx.scale(1, -1); // Don't swim upside down effectively
        }

        // Body
        ctx.fillStyle = fish.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size, fish.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail (Animated)
        const tailWag = Math.sin(Date.now() / 100);
        ctx.beginPath();
        ctx.moveTo(-fish.size + 5, 0);
        ctx.lineTo(-fish.size - 10, -5 + tailWag * 5);
        ctx.lineTo(-fish.size - 10, 5 + tailWag * 5);
        ctx.fill();

        // Eye
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(fish.size / 2, -fish.size / 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(fish.size / 2 + 1, -fish.size / 6, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    };

    const handleTap = (e: React.PointerEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            foods.current.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black touch-none">
            <canvas
                ref={canvasRef}
                width={typeof window !== 'undefined' ? window.innerWidth : 800}
                height={typeof window !== 'undefined' ? window.innerHeight : 600}
                className="block w-full h-full cursor-pointer"
                onPointerDown={handleTap}
            />
            <header className="absolute top-4 left-4 z-10 flex gap-4">
                <Link href="/apps" className="p-2 bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/20"><ArrowLeft size={20} /></Link>
                <div>
                    <h1 className="text-white font-bold text-shadow">#094 Virtual Aquarium</h1>
                    <p className="text-white/50 text-xs">Tap to feed current fish</p>
                </div>
            </header>
        </div>
    );
}
