
"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Eraser } from "lucide-react";

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;
const SCALE = 3;

type ParticleType = "empty" | "sand" | "water" | "stone" | "fire";

export default function GravitySand() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedType, setSelectedType] = useState<ParticleType>("sand");
    const [isPaused, setIsPaused] = useState(false); // To prevent overheat if needed, but simple simulation is fine

    const gridRef = useRef<ParticleType[]>(new Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill("empty"));

    // Simulation Loop
    useEffect(() => {
        let animationId: number;
        const ctx = canvasRef.current?.getContext("2d");

        const update = () => {
            if (isPaused) return;

            const grid = gridRef.current;
            const nextGrid = [...grid]; // Copy for next state? Actually inplace is faster for sand logic often, but double buffer prevents artifacts. Let's try bottom-up scan inplace to save memory/perf.

            // Scan from bottom to top, random horizontal
            for (let y = CANVAS_HEIGHT - 1; y >= 0; y--) {
                for (let x = 0; x < CANVAS_WIDTH; x++) {
                    // Slight randomization of X order to prevent bias?
                    // Simple scan for now.
                    const i = y * CANVAS_WIDTH + x;
                    const type = grid[i];

                    if (type === "empty" || type === "stone") continue;

                    if (type === "sand") {
                        const below = (y + 1) * CANVAS_WIDTH + x;
                        const belowLeft = (y + 1) * CANVAS_WIDTH + (x - 1);
                        const belowRight = (y + 1) * CANVAS_WIDTH + (x + 1);

                        if (y < CANVAS_HEIGHT - 1) {
                            if (nextGrid[below] === "empty" || nextGrid[below] === "water") {
                                // Swap
                                nextGrid[i] = nextGrid[below];
                                nextGrid[below] = "sand";
                            } else if (x > 0 && (nextGrid[belowLeft] === "empty" || nextGrid[belowLeft] === "water")) {
                                nextGrid[i] = nextGrid[belowLeft];
                                nextGrid[belowLeft] = "sand";
                            } else if (x < CANVAS_WIDTH - 1 && (nextGrid[belowRight] === "empty" || nextGrid[belowRight] === "water")) {
                                nextGrid[i] = nextGrid[belowRight];
                                nextGrid[belowRight] = "sand";
                            }
                        }
                    } else if (type === "water") {
                        const below = (y + 1) * CANVAS_WIDTH + x;
                        const left = y * CANVAS_WIDTH + (x - 1);
                        const right = y * CANVAS_WIDTH + (x + 1);

                        if (y < CANVAS_HEIGHT - 1 && nextGrid[below] === "empty") {
                            nextGrid[i] = "empty";
                            nextGrid[below] = "water";
                        } else {
                            // Flow sideways
                            const dir = Math.random() > 0.5 ? 1 : -1;
                            if (dir === 1 && x < CANVAS_WIDTH - 1 && nextGrid[right] === "empty") {
                                nextGrid[i] = "empty";
                                nextGrid[right] = "water";
                            } else if (dir === -1 && x > 0 && nextGrid[left] === "empty") {
                                nextGrid[i] = "empty";
                                nextGrid[left] = "water";
                            }
                        }
                    } else if (type === "fire") {
                        // Moves up and dies
                        const above = (y - 1) * CANVAS_WIDTH + x;
                        if (Math.random() > 0.9) {
                            nextGrid[i] = "empty"; // Die
                        } else if (y > 0 && nextGrid[above] === "empty") {
                            nextGrid[i] = "empty";
                            nextGrid[above] = "fire";
                        }
                    }
                }
            }
            gridRef.current = nextGrid;
            draw(ctx, nextGrid);
            animationId = requestAnimationFrame(update);
        };

        const draw = (ctx: CanvasRenderingContext2D | null | undefined, grid: ParticleType[]) => {
            if (!ctx) return;
            // Clear or overwrite? Overwrite all pixels.
            const imgData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
            const data = imgData.data;

            for (let i = 0; i < grid.length; i++) {
                const type = grid[i];
                const idx = i * 4;
                if (type === "empty") {
                    data[idx] = 20; data[idx + 1] = 20; data[idx + 2] = 25; data[idx + 3] = 255; // Dark BG
                } else if (type === "sand") {
                    data[idx] = 240; data[idx + 1] = 200; data[idx + 2] = 100; data[idx + 3] = 255;
                } else if (type === "water") {
                    data[idx] = 50; data[idx + 1] = 150; data[idx + 2] = 250; data[idx + 3] = 255;
                } else if (type === "stone") {
                    data[idx] = 100; data[idx + 1] = 100; data[idx + 2] = 100; data[idx + 3] = 255;
                } else if (type === "fire") {
                    data[idx] = 255; data[idx + 1] = 50 + Math.random() * 100; data[idx + 2] = 0; data[idx + 3] = 255;
                }
            }
            ctx.putImageData(imgData, 0, 0);
        };

        // Start loop
        animationId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationId);
    }, [isPaused]);

    const handleInteraction = (e: React.PointerEvent) => {
        if (!canvasRef.current || e.buttons === 0) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / SCALE);
        const y = Math.floor((e.clientY - rect.top) / SCALE);

        // Draw brush size 3x3
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const px = x + dx;
                const py = y + dy;
                if (px >= 0 && px < CANVAS_WIDTH && py >= 0 && py < CANVAS_HEIGHT) {
                    // Randomness for natural feel
                    if (Math.random() > 0.5) {
                        gridRef.current[py * CANVAS_WIDTH + px] = selectedType;
                    }
                }
            }
        }
    };

    const clear = () => {
        gridRef.current = new Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill("empty");
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-200 p-4 font-sans select-none touch-none">
            <header className="max-w-xl mx-auto flex items-center gap-4 mb-4">
                <Link href="/apps" className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#089 Gravity Sand</h1>
            </header>

            <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="bg-neutral-900 border border-neutral-700 rounded-lg cursor-crosshair shadow-2xl"
                    style={{ width: CANVAS_WIDTH * SCALE, height: CANVAS_HEIGHT * SCALE, imageRendering: "pixelated" }}
                    onPointerDown={handleInteraction}
                    onPointerMove={handleInteraction}
                />

                <div className="flex flex-wrap justify-center gap-2">
                    {[
                        { id: "sand", label: "Sand", color: "bg-yellow-500" },
                        { id: "water", label: "Water", color: "bg-blue-500" },
                        { id: "stone", label: "Stone", color: "bg-neutral-500" },
                        { id: "fire", label: "Fire", color: "bg-orange-600" },
                        { id: "empty", label: "Eraser", color: "bg-neutral-800 text-neutral-400 border border-neutral-700" },
                    ].map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedType(tool.id as any)}
                            className={`px-4 py-2 rounded-full font-bold text-sm transition ${selectedType === tool.id ? "ring-2 ring-white scale-110 " + tool.color : tool.color + " opacity-80"}`}
                        >
                            {tool.label === "Eraser" ? <Eraser size={16} /> : tool.label}
                        </button>
                    ))}
                    <button onClick={clear} className="px-4 py-2 bg-red-900/50 text-red-200 rounded-full font-bold text-sm hover:bg-red-900 ml-4">
                        <RefreshCw size={16} /> Clear
                    </button>
                </div>
                <p className="text-xs text-neutral-500">Touch/Drag to draw. Simulation runs locally.</p>
            </div>
        </div>
    );
}
