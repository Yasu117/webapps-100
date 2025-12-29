
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, RefreshCw } from "lucide-react";

// Words to fall
const WORDS = ["HTML", "CSS", "REACT", "NEXT", "NODE", "JAVA", "PYTHON", "RUBY", "GO", "RUST", "SQL", "GIT", "AWS", "LINUX", "DOCKER", "API", "JSON", "HTTP", "CODE", "BUG"];

type Enemy = {
    id: number;
    word: string;
    x: number;
    y: number;
    speed: number;
};

export default function TypingDefense() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [input, setInput] = useState("");
    const [gameOver, setGameOver] = useState(false);

    const enemiesRef = useRef<Enemy[]>([]);
    const requestRef = useRef<number>(0);
    const spawnRef = useRef<NodeJS.Timeout | null>(null);

    // Canvas for rendering
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setInput("");
        enemiesRef.current = [];

        const spawn = () => {
            if (!isPlaying && enemiesRef.current.length > 0) return; // Stop spawning if stopped (handled by cleanup but safe check)

            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            const enemy: Enemy = {
                id: Date.now(),
                word,
                x: Math.random() * (window.innerWidth - 100) + 50,
                y: -50,
                speed: Math.random() * 1 + 0.5 + (score / 100) // Speed increases slightly
            };
            enemiesRef.current.push(enemy);

            spawnRef.current = setTimeout(spawn, 2000 - Math.min(1500, score * 10)); // Spawn faster
        };
        spawn();

        loop();
    };

    const endGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        if (spawnRef.current) clearTimeout(spawnRef.current);
        cancelAnimationFrame(requestRef.current);
    };

    const loop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update & Draw
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
            const e = enemiesRef.current[i];
            e.y += e.speed;

            // Draw
            ctx.fillStyle = "#fff";
            ctx.font = "bold 20px monospace";
            ctx.fillText(e.word, e.x, e.y);

            // Check collision
            if (e.y > canvas.height) {
                endGame();
                return;
            }
        }

        requestRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
            if (spawnRef.current) clearTimeout(spawnRef.current);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setInput(val);

        // Check for matches
        const matchIndex = enemiesRef.current.findIndex(e => e.word === val);
        if (matchIndex !== -1) {
            // Hit!
            enemiesRef.current.splice(matchIndex, 1);
            setScore(s => s + 10);
            setInput(""); // Clear input
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 overflow-hidden font-mono">
            <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-slate-900/50 backdrop-blur">
                <Link href="/apps" className="text-slate-400 hover:text-white"><ArrowLeft size={24} /></Link>
                <div className="text-white font-bold text-xl">Score: {score}</div>
                <div className="w-8"></div>
            </header>

            <canvas ref={canvasRef} className="block w-full h-full" />

            {/* Input Area */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
                <input
                    autoFocus
                    className="w-full bg-slate-800/80 border border-slate-600 rounded-xl px-4 py-3 text-center text-xl font-bold text-white tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-slate-600"
                    placeholder={isPlaying ? "TYPE HERE" : ""}
                    value={input}
                    onChange={handleInput}
                    disabled={!isPlaying}
                />
            </div>

            {/* Overlays */}
            {(!isPlaying) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center shadow-2xl max-w-sm w-full mx-4">
                        <h1 className="text-3xl font-bold text-green-400 mb-2">Typing Defense</h1>
                        {gameOver && <p className="text-red-400 mb-4 font-bold">GAME OVER! Score: {score}</p>}
                        <div className="bg-slate-700/50 p-2 rounded mb-6 text-xs text-slate-300">
                            <span className="font-bold text-green-400">#066</span><br />
                            迫りくる単語をタイプして撃退せよ！
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            {gameOver ? <RefreshCw size={20} /> : <Play size={20} />}
                            {gameOver ? "Retry" : "Start Game"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
