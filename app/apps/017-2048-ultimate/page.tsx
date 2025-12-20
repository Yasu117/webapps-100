'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// --- Constants ---
const GRID_SIZE = 4;
const ANIMATION_DURATION = 100; // ms

// --- Types ---
type Tile = {
    id: number;
    val: number;
    x: number;
    y: number;
    key: string; // Helper for React keys to ensure stability
    scoreAdded?: number;
};

// --- Helper Functions ---
const getEmptyCells = (tiles: Tile[]) => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (!tiles.find(t => t.x === x && t.y === y)) {
                cells.push({ x, y });
            }
        }
    }
    return cells;
};

const spawnTile = (tiles: Tile[]): Tile[] => {
    const emptyCells = getEmptyCells(tiles);
    if (emptyCells.length === 0) return tiles;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { x, y } = emptyCells[randomIndex];

    // 10% chance of 4, 90% chance of 2
    const val = Math.random() < 0.1 ? 4 : 2;

    const newTile: Tile = {
        id: Date.now() + Math.random(),
        val,
        x,
        y,
        key: `${Date.now()}-${Math.random()}`
    };

    return [...tiles, newTile];
};

export default function Game2048Page() {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [isMoving, setIsMoving] = useState(false); // Lock input during animation?
    const [showHelp, setShowHelp] = useState(false);

    // Toggle Help
    const toggleHelp = () => setShowHelp(!showHelp);

    // Refs for Swipe
    const touchStartRef = useRef<{ x: number, y: number } | null>(null);

    // --- Game Logic ---
    const initGame = useCallback(() => {
        let newTiles: Tile[] = [];
        newTiles = spawnTile(newTiles);
        newTiles = spawnTile(newTiles); // Start with 2 tiles
        setTiles(newTiles);
        setScore(0);
        setGameOver(false);
        setGameWon(false);
    }, []);

    // Initial Load
    useEffect(() => {
        initGame();
        // Load high score? (Mock for now or localStorage)
        const savedHigh = localStorage.getItem('2048-highscore');
        if (savedHigh) setHighScore(parseInt(savedHigh));
    }, [initGame]);

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('2048-highscore', score.toString());
        }
    }, [score, highScore]);


    const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (gameOver || isMoving) return;

        let moved = false;
        let newScore = score;
        let nextTiles = [...tiles];

        if (direction === 'RIGHT') nextTiles.sort((a, b) => b.x - a.x);
        if (direction === 'LEFT') nextTiles.sort((a, b) => a.x - b.x);
        if (direction === 'DOWN') nextTiles.sort((a, b) => b.y - a.y);
        if (direction === 'UP') nextTiles.sort((a, b) => a.y - b.y);

        const mergedIds = new Set<number>();

        const grid: (Tile | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        tiles.forEach(t => {
            grid[t.y][t.x] = t;
        });

        const nextGrid: (Tile | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

        // Helper to get vector
        const vector = { x: 0, y: 0 };
        if (direction === 'UP') vector.y = -1;
        if (direction === 'DOWN') vector.y = 1;
        if (direction === 'LEFT') vector.x = -1;
        if (direction === 'RIGHT') vector.x = 1;

        const traverseX = direction === 'RIGHT' ? [3, 2, 1, 0] : [0, 1, 2, 3];
        const traverseY = direction === 'DOWN' ? [3, 2, 1, 0] : [0, 1, 2, 3];

        let somethingMoved = false;
        let scoreAdd = 0;
        let newTileSet: Tile[] = [];

        // Simplified Logic: 
        // We need to process line by line to handle merges correctly in one pass with "stack" logic,
        // or iterate carefully. The previous explicit "move as far as possible" loop handles "sliding",
        // but handling merges in that loop is tricky.

        // Let's use the robust "Line Processing" logic which I wrote in Step 146 but then deleted 
        // partially. Actually, let's implement the cleaner "process groups" logic.

        const lines: Tile[][] = [];
        if (direction === 'LEFT' || direction === 'RIGHT') {
            for (let i = 0; i < GRID_SIZE; i++) {
                lines.push(tiles.filter(t => t.y === i).sort((a, b) => a.x - b.x));
            }
        } else {
            for (let i = 0; i < GRID_SIZE; i++) {
                lines.push(tiles.filter(t => t.x === i).sort((a, b) => a.y - b.y));
            }
        }

        lines.forEach((line, lineIdx) => {
            let processList = [...line];
            if (direction === 'RIGHT' || direction === 'DOWN') {
                processList.reverse();
            }

            const mergedList: Tile[] = [];
            let skipNext = false;

            for (let i = 0; i < processList.length; i++) {
                if (skipNext) {
                    skipNext = false;
                    continue;
                }

                const current = processList[i];
                const next = processList[i + 1];

                if (next && next.val === current.val) {
                    const newVal = current.val * 2;
                    scoreAdd += newVal;
                    somethingMoved = true;
                    skipNext = true;

                    mergedList.push({
                        ...current,
                        id: Date.now() + Math.random(),
                        val: newVal,
                    });
                } else {
                    mergedList.push(current);
                }
            }

            mergedList.forEach((t, idx) => {
                let finalX = t.x;
                let finalY = t.y;

                if (direction === 'LEFT') {
                    finalX = idx;
                    finalY = lineIdx;
                } else if (direction === 'RIGHT') {
                    finalX = GRID_SIZE - 1 - idx;
                    finalY = lineIdx;
                } else if (direction === 'UP') {
                    finalX = lineIdx;
                    finalY = idx;
                } else if (direction === 'DOWN') {
                    finalX = lineIdx;
                    finalY = GRID_SIZE - 1 - idx;
                }

                if (t.x !== finalX || t.y !== finalY) somethingMoved = true;
                newTileSet.push({ ...t, x: finalX, y: finalY });
            });
        });

        if (somethingMoved) {
            const afterSpawn = spawnTile(newTileSet);
            setTiles(afterSpawn);
            setScore(s => s + scoreAdd);

            if (scoreAdd > 0 && !gameWon) {
                if (afterSpawn.some(t => t.val === 2048)) {
                    setGameWon(true);
                }
            }

            if (getEmptyCells(afterSpawn).length === 0) {
                if (!canMove(afterSpawn)) {
                    setGameOver(true);
                }
            }
        }
    }, [tiles, score, gameOver, isMoving, gameWon]);

    // Check if any move is possible
    const canMove = (currentTiles: Tile[]) => {
        // 1. Empty cells exist?
        if (getEmptyCells(currentTiles).length > 0) return true;

        // 2. Adjacent same values?
        // Build map
        const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        currentTiles.forEach(t => grid[t.y][t.x] = t.val);

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const val = grid[y][x];
                if (!val) return true; // Should be covered by empty check but ok
                // Check right
                if (x < GRID_SIZE - 1 && grid[y][x + 1] === val) return true;
                // Check down
                if (y < GRID_SIZE - 1 && grid[y + 1][x] === val) return true;
            }
        }
        return false;
    };


    // --- Input Handling ---
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowUp': e.preventDefault(); move('UP'); break;
            case 'ArrowDown': e.preventDefault(); move('DOWN'); break;
            case 'ArrowLeft': e.preventDefault(); move('LEFT'); break;
            case 'ArrowRight': e.preventDefault(); move('RIGHT'); break;
        }
    }, [move]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Touch
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
        const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) > 30) { // Threshold
            if (absX > absY) {
                move(deltaX > 0 ? 'RIGHT' : 'LEFT');
            } else {
                move(deltaY > 0 ? 'DOWN' : 'UP');
            }
        }
        touchStartRef.current = null;
    };

    // --- Render Helpers ---
    const getTileColor = (val: number) => {
        switch (val) {
            case 2: return 'bg-slate-200 text-slate-700';
            case 4: return 'bg-orange-100 text-slate-700';
            case 8: return 'bg-orange-400 text-white shadow-orange-400/50';
            case 16: return 'bg-orange-600 text-white shadow-orange-600/50';
            case 32: return 'bg-rose-500 text-white shadow-rose-500/50';
            case 64: return 'bg-rose-600 text-white shadow-rose-600/50';
            case 128: return 'bg-yellow-400 text-white text-3xl shadow-yellow-400/50';
            case 256: return 'bg-yellow-500 text-white text-3xl shadow-yellow-500/50';
            case 512: return 'bg-yellow-600 text-white text-3xl shadow-yellow-600/50';
            case 1024: return 'bg-emerald-500 text-white text-2xl shadow-emerald-500/50';
            case 2048: return 'bg-emerald-600 text-white text-2xl shadow-emerald-600/50';
            default: return 'bg-indigo-600 text-white shadow-indigo-600/50'; // Super high
        }
    };

    return (
        <div
            className="min-h-screen bg-slate-900 font-sans text-slate-100 flex flex-col overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            {/* Header */}
            <header className="px-5 py-4 flex items-center justify-between bg-slate-800 border-b border-slate-700 shadow-md z-10">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black italic tracking-tighter text-yellow-400">
                        2048 <span className="text-sm font-normal text-slate-400 not-italic">Ultimate</span>
                    </h1>
                    <button
                        onClick={toggleHelp}
                        className="w-6 h-6 rounded-full border border-slate-500 text-slate-500 flex items-center justify-center text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors"
                        aria-label="How to play"
                    >
                        ?
                    </button>
                </div>
                <div className="flex gap-3">
                    <div className="bg-slate-700 px-3 py-1 rounded-lg text-center min-w-[70px]">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                        <div className="text-lg font-bold text-white">{score}</div>
                    </div>
                    <div className="bg-slate-700 px-3 py-1 rounded-lg text-center min-w-[70px]">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Best</div>
                        <div className="text-lg font-bold text-yellow-400">{highScore}</div>
                    </div>
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative">

                {/* Game Board */}
                <div className="relative w-full max-w-sm aspect-square bg-slate-800 rounded-xl p-3 shadow-2xl border border-slate-700">
                    {/* Background Grid */}
                    <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-3">
                        {Array(16).fill(0).map((_, i) => (
                            <div key={i} className="bg-slate-700/50 rounded-lg w-full h-full"></div>
                        ))}
                    </div>

                    {/* Tiles Layer */}
                    <div className="absolute inset-0 p-3">


                        {/*
                           Fixing CSS for dynamic grid positioning:
                           A gap-3 grid with 4 cols means:
                           Cell width = (100% - 3 * gap) / 4 ?
                           Actually (100% - 3 gaps inside - 2 pad/margin?)
                           The p-3 padding means edges are handled. Inside has 3 gaps.
                        */}

                        {/* Render specific styles inline for calculation */}
                        {tiles.map((tile) => (
                            <div
                                key={tile.id}
                                className={`tile-render absolute flex items-center justify-center rounded-lg font-bold shadow-lg transition-all duration-100 ${getTileColor(tile.val)} ${tile.id > Date.now() - 200 ? 'animate-pop' : ''}`}
                                style={{
                                    width: 'calc((100% - 36px) / 4)',
                                    height: 'calc((100% - 36px) / 4)',
                                    // Dummy transform for older browsers? No, removing it is cleaner if using top/left.
                                    // Actually, let's just use top/left fully and remove transform to avoid confusion.
                                    left: `calc(12px + ${tile.x} * ((100% - 36px) / 4 + 12px))`,
                                    top: `calc(12px + ${tile.y} * ((100% - 36px) / 4 + 12px))`,
                                    fontSize: tile.val > 1000 ? '1.5rem' : tile.val > 100 ? '2rem' : '2.5rem'
                                }}
                            >
                                {tile.val}
                            </div>
                        ))}
                    </div>

                    {/* Game Over / Win Overlay */}
                    {(gameOver || gameWon) && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in duration-500 rounded-xl">
                            <h2 className="text-5xl font-black text-white italic mb-4">
                                {gameWon ? 'YOU WIN!' : 'GAME OVER'}
                            </h2>
                            <div className="text-xl mb-8 font-bold text-slate-300">
                                Score: <span className="text-white">{score}</span>
                            </div>
                            <button
                                onClick={initGame}
                                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                TRY AGAIN
                            </button>
                            {gameWon && (
                                <button
                                    onClick={() => setGameWon(false)}
                                    className="mt-4 text-sm text-slate-400 underline"
                                >
                                    Continue Playing
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Help Modal */}
                {showHelp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
                            <button
                                onClick={toggleHelp}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>

                            <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                                <span className="text-3xl">🎮</span> 遊び方
                            </h3>

                            <div className="space-y-4 text-slate-200 text-sm leading-relaxed">
                                <div>
                                    <strong className="text-emerald-400 block mb-1">STEP 1: タイルを動かす</strong>
                                    <p>画面を<span className="font-bold text-white">スワイプ</span>（または矢印キー）すると、すべての数字タイルがその方向にスライドします。</p>
                                </div>

                                <div>
                                    <strong className="text-emerald-400 block mb-1">STEP 2: 同じ数字を合体</strong>
                                    <p>「2と2」「4と4」など、同じ数字同士がぶつかると合体して倍の数字になります。<br />
                                        <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded mt-1 inline-block">2 + 2 = 4</span>
                                    </p>
                                </div>

                                <div>
                                    <strong className="text-emerald-400 block mb-1">GOAL: 2048を作る</strong>
                                    <p>合体を繰り返して、<strong className="text-yellow-400">2048</strong> のタイルを作ればクリアです！</p>
                                </div>
                            </div>

                            <button
                                onClick={toggleHelp}
                                className="w-full mt-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-white transition-colors"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center text-slate-500 text-xs">
                    <p className="mb-2">Swipe to move tiles</p>
                    <p>Join the numbers and get to the <strong className="text-emerald-500">2048 tile!</strong></p>
                </div>
            </main>


        </div>
    );
}
