'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2; // Speed up by 2ms every food eaten

// Colors
const COLOR_BG = '#0f172a'; // slate-900
const COLOR_SNAKE_HEAD = '#00ffcc'; // teal-neon
const COLOR_SNAKE_BODY = '#0ea5e9'; // sky-500
const COLOR_FOOD = '#f43f5e'; // rose-500

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

export default function NeonSnakePage() {
    // --- State ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    // Refs for game loop to avoid re-renders impacting logic excessively
    const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
    const foodRef = useRef<Point>({ x: 5, y: 5 });
    const directionRef = useRef<Point>({ x: 0, y: 0 }); // Moving direction
    const nextDirectionRef = useRef<Point>({ x: 0, y: 0 }); // Buffer for next input
    const speedRef = useRef(INITIAL_SPEED);
    const lastRenderTimeRef = useRef(0);
    const particlesRef = useRef<Particle[]>([]);
    const requestRef = useRef<number>(0);
    const gameAreaRef = useRef<HTMLDivElement>(null);

    // --- Logic ---

    const initGame = () => {
        snakeRef.current = [
            { x: 10, y: 10 },
            { x: 10, y: 11 },
            { x: 10, y: 12 },
        ];
        directionRef.current = { x: 0, y: -1 }; // Start moving up
        nextDirectionRef.current = { x: 0, y: -1 };
        spawnFood();
        speedRef.current = INITIAL_SPEED;
        particlesRef.current = [];
        setScore(0);
        setGameState('playing');
    };

    const spawnFood = () => {
        // Simple random spawn (could be improved to avoid snake body)
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        foodRef.current = { x, y };
    };

    const spawnParticles = (x: number, y: number, color: string) => {
        for (let i = 0; i < 8; i++) {
            particlesRef.current.push({
                x: x + 0.5,
                y: y + 0.5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: 1.0,
                color
            });
        }
    };

    const update = (time: number) => {
        const deltaTime = time - lastRenderTimeRef.current;

        // Move Snake
        if (deltaTime > speedRef.current) {
            lastRenderTimeRef.current = time;

            // Update direction from buffer (prevent 180 turn in single frame)
            const currentDir = directionRef.current;
            const nextDir = nextDirectionRef.current;

            // Prevent reversing
            if (currentDir.x !== -nextDir.x && currentDir.y !== -nextDir.y) {
                directionRef.current = nextDir;
            }

            const head = snakeRef.current[0];
            const newHead = {
                x: head.x + directionRef.current.x,
                y: head.y + directionRef.current.y
            };

            // Wall Collision (Wrap around or Game Over? Let's do Game Over for Neon Snake)
            if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                gameOver();
                return;
            }

            // Self Collision
            if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                gameOver();
                return;
            }

            snakeRef.current.unshift(newHead);

            // Eat Food
            if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
                setScore(s => s + 10);
                speedRef.current = Math.max(50, speedRef.current - SPEED_INCREMENT);
                spawnParticles(newHead.x, newHead.y, COLOR_FOOD);
                spawnFood();
                // Don't pop tail, so it grows
            } else {
                snakeRef.current.pop();
            }
        }

        // Draw
        render();
        requestRef.current = requestAnimationFrame(update);
    };

    const gameOver = () => {
        setGameState('gameover');
        if (score > highScore) setHighScore(score);
        cancelAnimationFrame(requestRef.current);
    };

    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate cell size dynamically
        const size = canvas.width / GRID_SIZE;

        // Clear
        ctx.fillStyle = COLOR_BG;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid (Subtle)
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.moveTo(i * size, 0);
            ctx.lineTo(i * size, canvas.height);
            ctx.moveTo(0, i * size);
            ctx.lineTo(canvas.width, i * size);
        }
        ctx.stroke();

        // Draw Food (Glow)
        const fp = foodRef.current;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLOR_FOOD;
        ctx.fillStyle = COLOR_FOOD;
        ctx.beginPath();
        ctx.arc(fp.x * size + size / 2, fp.y * size + size / 2, size / 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Snake
        snakeRef.current.forEach((seg, i) => {
            const isHead = i === 0;
            ctx.fillStyle = isHead ? COLOR_SNAKE_HEAD : COLOR_SNAKE_BODY;
            ctx.shadowBlur = isHead ? 20 : 0;
            ctx.shadowColor = isHead ? COLOR_SNAKE_HEAD : 'transparent';

            ctx.fillRect(seg.x * size + 1, seg.y * size + 1, size - 2, size - 2);
        });
        ctx.shadowBlur = 0;

        // Draw Particles
        particlesRef.current.forEach((p, i) => {
            p.life -= 0.05;
            p.x += p.vx;
            p.y += p.vy;

            if (p.life > 0) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fillRect(p.x * size, p.y * size, size / 3, size / 3);
                ctx.globalAlpha = 1.0;
            } else {
                particlesRef.current.splice(i, 1);
            }
        });
    };

    // --- Input Handling ---

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowUp': nextDirectionRef.current = { x: 0, y: -1 }; break;
            case 'ArrowDown': nextDirectionRef.current = { x: 0, y: 1 }; break;
            case 'ArrowLeft': nextDirectionRef.current = { x: -1, y: 0 }; break;
            case 'ArrowRight': nextDirectionRef.current = { x: 1, y: 0 }; break;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Game Loop Start/Stop
    useEffect(() => {
        if (gameState === 'playing') {
            requestRef.current = requestAnimationFrame(update);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (gameAreaRef.current && canvasRef.current) {
                const width = gameAreaRef.current.clientWidth;
                // Make it square or fit available height, but maintain aspect ratio logic if grid is square
                // Let's stick to square grid for simplicity
                canvasRef.current.width = width;
                canvasRef.current.height = width;
                render(); // Initial render
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    // --- Touch Controls ---
    const handleDirection = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5);
        }

        switch (dir) {
            case 'UP': nextDirectionRef.current = { x: 0, y: -1 }; break;
            case 'DOWN': nextDirectionRef.current = { x: 0, y: 1 }; break;
            case 'LEFT': nextDirectionRef.current = { x: -1, y: 0 }; break;
            case 'RIGHT': nextDirectionRef.current = { x: 1, y: 0 }; break;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col overflow-hidden">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            {/* Header */}
            <header className="px-4 py-3 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur">
                <div>
                    <h1 className="text-xl font-black bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent italic">
                        015 NEON SNAKE
                    </h1>
                </div>
                <div className="flex gap-4 text-xs font-mono">
                    <div className="flex flex-col items-end">
                        <span className="text-slate-500">SCORE</span>
                        <span className="text-xl font-bold text-teal-400">{score.toString().padStart(4, '0')}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-slate-500">HIGH</span>
                        <span className="text-xl font-bold text-slate-200">{highScore.toString().padStart(4, '0')}</span>
                    </div>
                </div>
            </header>

            {/* Game Canvas */}
            <main className="flex-1 flex flex-col justify-center items-center p-4 relative">
                <div ref={gameAreaRef} className="w-full max-w-md aspect-square relative rounded-xl overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.3)] border border-slate-700">
                    <canvas ref={canvasRef} className="block w-full h-full bg-slate-900" />

                    {gameState !== 'playing' && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-10">
                            <h2 className="text-4xl font-black text-white italic tracking-tighter">
                                {gameState === 'start' ? 'READY?' : 'GAME OVER'}
                            </h2>
                            <button
                                onClick={initGame}
                                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-lg skew-x-[-10deg] shadow-[4px_4px_0px_#fff] active:translate-y-1 active:shadow-none transition-all"
                            >
                                {gameState === 'start' ? 'START MISSION' : 'RETRY'}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Controls (Mobile First) */}
            <div className="pb-8 px-4 safe-area-bottom">
                <div className="max-w-md mx-auto grid grid-cols-3 gap-2 h-40">
                    {/* Empty top-left/right */}
                    <div></div>
                    <button
                        className="bg-slate-800/50 rounded-xl flex items-center justify-center active:bg-cyan-500/20 active:scale-95 transition-all outline-none border border-slate-700"
                        onTouchStart={(e) => { e.preventDefault(); handleDirection('UP'); }}
                        onMouseDown={(e) => { e.preventDefault(); handleDirection('UP'); }}
                    >
                        <span className="text-2xl">▲</span>
                    </button>
                    <div></div>

                    <button
                        className="bg-slate-800/50 rounded-xl flex items-center justify-center active:bg-cyan-500/20 active:scale-95 transition-all outline-none border border-slate-700"
                        onTouchStart={(e) => { e.preventDefault(); handleDirection('LEFT'); }}
                        onMouseDown={(e) => { e.preventDefault(); handleDirection('LEFT'); }}
                    >
                        <span className="text-2xl">◀</span>
                    </button>
                    <button
                        className="bg-slate-800/50 rounded-xl flex items-center justify-center active:bg-cyan-500/20 active:scale-95 transition-all outline-none border border-slate-700"
                        onTouchStart={(e) => { e.preventDefault(); handleDirection('DOWN'); }}
                        onMouseDown={(e) => { e.preventDefault(); handleDirection('DOWN'); }}
                    >
                        <span className="text-2xl">▼</span>
                    </button>
                    <button
                        className="bg-slate-800/50 rounded-xl flex items-center justify-center active:bg-cyan-500/20 active:scale-95 transition-all outline-none border border-slate-700"
                        onTouchStart={(e) => { e.preventDefault(); handleDirection('RIGHT'); }}
                        onMouseDown={(e) => { e.preventDefault(); handleDirection('RIGHT'); }}
                    >
                        <span className="text-2xl">▶</span>
                    </button>
                </div>
                <p className="text-center text-[10px] text-slate-500 mt-4">
                    PCは矢印キー、スマホは十字ボタンで操作
                </p>
            </div>
        </div>
    );
}
