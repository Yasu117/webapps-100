
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, RotateCcw, Trash2 } from "lucide-react";

// Simplified Physics Logic (without heavy engine)
// - Ball (gravity)
// - Lines (collision)

type Point = { x: number; y: number };
type Line = { p1: Point; p2: Point };
type Ball = { x: number; y: number; vx: number; vy: number; r: number; active: boolean };

export default function PhysicsDraw() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [lines, setLines] = useState<Line[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentLine, setCurrentLine] = useState<Point[]>([]);
    const [ball, setBall] = useState<Ball>({ x: 50, y: 50, vx: 0, vy: 0, r: 10, active: false });
    const [goal, setGoal] = useState<Point>({ x: 300, y: 500 });
    const [gameState, setGameState] = useState<"editing" | "simulating" | "success">("editing");

    // Loop
    const requestRef = useRef<number>(0);

    const reset = () => {
        setBall({ x: 50, y: 50, vx: 0, vy: 0, r: 10, active: false });
        setGameState("editing");
    };

    const clearLines = () => {
        setLines([]);
        reset();
    };

    const startSimulation = () => {
        setGameState("simulating");
        setBall(b => ({ ...b, active: true }));
        loop();
    };

    const update = () => {
        if (!ball.active) return;

        // Physics
        ball.vy += 0.5; // Gravity
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off walls
        if (ball.x < ball.r || ball.x > window.innerWidth - ball.r) ball.vx *= -0.8;
        if (ball.y > window.innerHeight) {
            // Fallen out
            reset();
            return;
        }

        // Bounce off lines (Simple circle-line collision)
        lines.forEach(line => {
            // Vector line
            const dx = line.p2.x - line.p1.x;
            const dy = line.p2.y - line.p1.y;
            const lenSq = dx * dx + dy * dy;
            if (lenSq === 0) return;

            // Project ball center onto line segment
            const t = ((ball.x - line.p1.x) * dx + (ball.y - line.p1.y) * dy) / lenSq;
            const clampedT = Math.max(0, Math.min(1, t));
            const closestX = line.p1.x + clampedT * dx;
            const closestY = line.p1.y + clampedT * dy;

            const distX = ball.x - closestX;
            const distY = ball.y - closestY;
            const distSq = distX * distX + distY * distY;

            if (distSq < ball.r * ball.r) {
                // Collision!
                // Reflect velocity
                // Normal vector
                const dist = Math.sqrt(distSq);
                const nx = distX / dist;
                const ny = distY / dist;

                // Dot product
                const dot = ball.vx * nx + ball.vy * ny;

                ball.vx = ball.vx - 2 * dot * nx;
                ball.vy = ball.vy - 2 * dot * ny;

                // Push out
                const overlap = ball.r - dist;
                ball.x += nx * overlap;
                ball.y += ny * overlap;

                // Dampen
                ball.vx *= 0.9;
                ball.vy *= 0.9;
            }
        });

        // Check Goal
        const dx = ball.x - goal.x;
        const dy = ball.y - goal.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
            setGameState("success");
            setBall(b => ({ ...b, active: false }));
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Goal
        ctx.beginPath();
        ctx.arc(goal.x, goal.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#4ade80"; // green
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.fillText("GOAL", goal.x - 14, goal.y - 25);

        // Start Pos
        ctx.beginPath();
        ctx.arc(50, 50, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#aaa";
        ctx.fill();

        // Lines
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        lines.forEach(line => {
            ctx.moveTo(line.p1.x, line.p1.y);
            ctx.lineTo(line.p2.x, line.p2.y);
        });
        ctx.stroke();

        // Current Drawing Line
        if (currentLine.length > 0) {
            ctx.strokeStyle = "#aaa";
            ctx.beginPath();
            ctx.moveTo(currentLine[0].x, currentLine[0].y);
            for (let i = 1; i < currentLine.length; i++) {
                ctx.lineTo(currentLine[i].x, currentLine[i].y);
            }
            ctx.stroke();
        }

        // Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = "#facc15"; // yellow
        ctx.fill();
    };

    const loop = () => {
        if (gameState === "simulating") {
            update();
        }
        draw();
        if (gameState === "simulating") {
            requestRef.current = requestAnimationFrame(loop);
        }
    };

    // Run render loop always to show drawings
    useEffect(() => {
        let id: number;
        const tick = () => {
            if (gameState === "simulating") {
                update();
            }
            draw();
            id = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(id);
    }, [gameState, lines, currentLine]); // Dependencies needed for draw to see updates? Actually state is closures, complicated.
    // Better to use ref for ball position in loop, but forcing re-render works for simple app.

    // Handle Input
    const startDraw = (e: React.PointerEvent) => {
        if (gameState !== "editing") return;
        const t = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - t.left;
        const y = e.clientY - t.top;
        setIsDrawing(true);
        setCurrentLine([{ x, y }]);
    };

    const moveDraw = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        const t = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - t.left;
        const y = e.clientY - t.top;
        setCurrentLine(prev => [...prev, { x, y }]);
    };

    const endDraw = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        // Simplify to segments
        if (currentLine.length > 1) {
            const newLines: Line[] = [];
            for (let i = 0; i < currentLine.length - 1; i += 2) { // Simplify resolution
                newLines.push({ p1: currentLine[i], p2: currentLine[Math.min(i + 2, currentLine.length - 1)] });
            }
            setLines(prev => [...prev, ...newLines]);
        }
        setCurrentLine([]);
    };

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            setGoal({ x: window.innerWidth - 50, y: window.innerHeight - 100 });
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900 touch-none">
            <canvas
                ref={canvasRef}
                className="block w-full h-full cursor-crosshair"
                onPointerDown={startDraw}
                onPointerMove={moveDraw}
                onPointerUp={endDraw}
                onPointerLeave={endDraw}
            />

            {/* UI */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                <Link href="/apps" className="p-2 bg-slate-800 rounded-full text-white pointer-events-auto"><ArrowLeft /></Link>

                <div className="flex gap-2 pointer-events-auto">
                    {gameState === "editing" ? (
                        <>
                            <button onClick={clearLines} className="p-3 bg-red-600 rounded-full text-white shadow-lg"><Trash2 /></button>
                            <button onClick={startSimulation} className="p-3 bg-green-600 rounded-full text-white shadow-lg animate-bounce"><Play /></button>
                        </>
                    ) : (
                        <button onClick={reset} className="p-3 bg-blue-600 rounded-full text-white shadow-lg"><RotateCcw /></button>
                    )}
                </div>
            </div>

            {gameState === "success" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                    <div className="bg-white p-6 rounded-2xl text-center shadow-xl animate-in zoom-in pointer-events-auto">
                        <h1 className="text-2xl font-bold mb-4">SUCCESS! 🎉</h1>
                        <button onClick={reset} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Play Again</button>
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 left-0 w-full text-center text-slate-500 text-xs pointer-events-none px-4">
                <span className="font-bold text-slate-400 mr-1">#069</span>
                Draw lines to guide the ball to the goal. - 線を描いてボールをゴールへ導こう
            </div>
        </div>
    );
}
