
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

type Block = {
    x: number;
    y: number;
    width: number;
    hue: number;
};

export default function TowerStacker() {
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Game State Refs (avoid re-renders during loop)
    const state = useRef({
        blocks: [] as Block[],
        currentWidth: 100,
        currentX: 0,
        direction: 1, // 1 or -1
        speed: 2,
        hue: 0,
        isPlaying: false
    });

    const animationRef = useRef<number>(0);

    const initGame = () => {
        state.current = {
            blocks: [],
            currentWidth: 100,
            currentX: 0,
            direction: 1,
            speed: 2,
            hue: 0,
            isPlaying: true
        };
        // Add base block
        state.current.blocks.push({ x: 100, y: 600, width: 100, hue: 0 }); // Base

        // First moving block
        spawnBlock();

        setScore(0);
        setGameOver(false);
        loop();
    };

    const spawnBlock = () => {
        state.current.hue += 20;
        // Reset position for new block
        state.current.currentX = -200; // Start from left
    };

    const placeBlock = () => {
        if (!state.current.isPlaying) return;

        const { blocks, currentX, currentWidth, hue } = state.current;
        const prevBlock = blocks[blocks.length - 1]; // Current top block on stack

        // Calculate overlap
        const prevLeft = prevBlock.x;
        const prevRight = prevBlock.x + prevBlock.width;

        const currLeft = currentX;
        const currRight = currentX + currentWidth;

        // Intersection
        const overlapLeft = Math.max(prevLeft, currLeft);
        const overlapRight = Math.min(prevRight, currRight);

        const overlapWidth = overlapRight - overlapLeft;

        if (overlapWidth <= 0) {
            // Missed
            endGame();
            return;
        }

        // Success
        // New block becomes the overlap
        state.current.currentWidth = overlapWidth; // Update for next block

        // Add to static blocks
        state.current.blocks.push({
            x: overlapLeft,
            y: prevBlock.y - 30, // Stack up
            width: overlapWidth,
            hue
        });

        setScore(s => s + 1);
        state.current.speed += 0.2;
        spawnBlock();
    };

    const endGame = () => {
        state.current.isPlaying = false;
        cancelAnimationFrame(animationRef.current);
        setGameOver(true);
    };

    const loop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (!state.current.isPlaying) return;

        // Update
        state.current.currentX += state.current.speed * state.current.direction;

        // Bounds check - Reverse
        const maxPos = canvas.width;

        // Use wider bounds to allow it to come from outside
        if (state.current.currentX > canvas.width - 50) state.current.direction = -1;
        if (state.current.currentX < 0) state.current.direction = 1;

        // Draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Camera follow (Move world down if stack is too high)
        const topBlockY = state.current.blocks[state.current.blocks.length - 1].y;
        const offset = Math.max(0, 400 - topBlockY);

        ctx.save();
        ctx.translate(0, offset);

        // Draw Stack
        state.current.blocks.forEach(b => {
            ctx.fillStyle = `hsl(${b.hue}, 70%, 50%)`;
            ctx.fillRect(b.x, b.y, b.width, 30);
        });

        // Draw Current Moving Block
        // Position: One step above top block
        const currentY = state.current.blocks[state.current.blocks.length - 1].y - 30;
        ctx.fillStyle = `hsl(${state.current.hue}, 70%, 50%)`;
        ctx.fillRect(state.current.currentX, currentY, state.current.currentWidth, 30);

        ctx.restore();

        animationRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            // initGame(); // Wait for user start?
        }
        return () => cancelAnimationFrame(animationRef.current);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans touch-none" onPointerDown={placeBlock}>
            <div className="absolute top-4 left-4 z-10 flex gap-4">
                <Link href="/apps" className="p-2 bg-white/10 rounded-full text-white pointer-events-auto">
                    <ArrowLeft size={24} />
                </Link>
                <div className="text-white text-2xl font-bold drop-shadow-md">
                    {score}
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={350}
                height={600}
                className="bg-slate-800 shadow-2xl rounded-xl border border-slate-700"
            />

            {/* Start / Game Over Overlay */}
            {(!state.current.isPlaying || gameOver) && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center pointer-events-none">
                    <div className="bg-white p-6 rounded-2xl text-center shadow-2xl pointer-events-auto animate-in zoom-in">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            {gameOver ? "Game Over" : "Tower Stacker"}
                        </h1>
                        <p className="text-xs text-slate-400 mb-4 font-bold">#049 ブロックを積み上げて高さを競おう！</p>
                        {gameOver && <p className="text-slate-500 mb-4">Score: {score}</p>}
                        <button
                            onClick={(e) => { e.stopPropagation(); initGame(); }}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-500 hover:scale-105 transition-all"
                        >
                            {gameOver ? "Try Again" : "Start Game"}
                        </button>
                    </div>
                </div>
            )}

            <div className="absolute bottom-8 text-slate-500 text-sm animate-pulse pointer-events-none">
                Tap screen to place block
            </div>
        </div>
    );
}
