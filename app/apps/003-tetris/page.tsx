"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

type PieceShape = number[][];

type Piece = {
    shape: PieceShape;
    x: number;
    y: number;
    color: string;
};

const COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#0ea5e9",
    "#6366f1",
    "#ec4899",
];

const SHAPES: PieceShape[] = [
    // I
    [
        [1, 1, 1, 1],
    ],
    // O
    [
        [1, 1],
        [1, 1],
    ],
    // T
    [
        [0, 1, 0],
        [1, 1, 1],
    ],
    // S
    [
        [0, 1, 1],
        [1, 1, 0],
    ],
    // Z
    [
        [1, 1, 0],
        [0, 1, 1],
    ],
    // J
    [
        [1, 0, 0],
        [1, 1, 1],
    ],
    // L
    [
        [0, 0, 1],
        [1, 1, 1],
    ],
];

function createEmptyBoard(): number[][] {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece(): Piece {
    const index = Math.floor(Math.random() * SHAPES.length);
    return {
        shape: SHAPES[index],
        x: Math.floor(COLS / 2) - 2,
        y: 0,
        color: COLORS[index],
    };
}

function rotate(shape: PieceShape): PieceShape {
    const rows = shape.length;
    const cols = shape[0].length;
    const result: PieceShape = Array.from({ length: cols }, () =>
        Array(rows).fill(0)
    );
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            result[x][rows - 1 - y] = shape[y][x];
        }
    }
    return result;
}

// Hook for handling long press (continuous action)
function useRepeatAction(action: () => void, delay = 200, interval = 50) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        // Prevent default to stop scrolling/selection, but allow click propagation if needed
        if (e.cancelable) e.preventDefault();

        action(); // Trigger immediately

        timerRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                action();
            }, interval);
        }, delay);
    }, [action, delay, interval]);

    const stop = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        timerRef.current = null;
        intervalRef.current = null;
    }, []);

    return {
        onTouchStart: start,
        onTouchEnd: stop,
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
    };
}

// Hook for handling single press (no repeat) with throttling
function useSingleAction(action: () => void, throttleMs = 100) {
    const lastRun = useRef(0);

    const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        // Prevent default to stop scrolling/selection and avoid double-firing (touch -> mouse)
        if (e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
        }

        const now = Date.now();
        if (now - lastRun.current < throttleMs) {
            return;
        }
        lastRun.current = now;
        action();
    }, [action, throttleMs]);

    return {
        onTouchStart: start,
        onMouseDown: start,
    };
}

export default function TetrisPage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [gameOver, setGameOver] = useState(false);

    const gameState = useRef({
        board: createEmptyBoard(),
        current: randomPiece(),
        dropInterval: 700,
        lastTime: 0,
        accTime: 0,
    });

    const controlsRef = useRef<{
        moveLeft: () => void;
        moveRight: () => void;
        rotate: () => void;
        softDrop: () => void;
        hardDrop: () => void;
    } | null>(null);

    // Reset game state explicitly
    const handleReset = () => {
        gameState.current = {
            board: createEmptyBoard(),
            current: randomPiece(),
            dropInterval: 700,
            lastTime: 0,
            accTime: 0,
        };
        setScore(0);
        setLines(0);
        setGameOver(false);
        setIsRunning(true);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = COLS * BLOCK_SIZE;
        canvas.height = ROWS * BLOCK_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId = 0;

        const drawBlock = (x: number, y: number, color: string) => {
            ctx.fillStyle = color;
            ctx.fillRect(
                x * BLOCK_SIZE,
                y * BLOCK_SIZE,
                BLOCK_SIZE - 1,
                BLOCK_SIZE - 1
            );
        };

        const drawBoard = () => {
            const { board, current } = gameState.current;

            // Background
            ctx.fillStyle = "#0f172a"; // slate-900
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid lines (subtle)
            ctx.strokeStyle = "#1e293b"; // slate-800
            ctx.lineWidth = 1;
            for (let x = 0; x <= COLS; x++) {
                ctx.beginPath();
                ctx.moveTo(x * BLOCK_SIZE, 0);
                ctx.lineTo(x * BLOCK_SIZE, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= ROWS; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * BLOCK_SIZE);
                ctx.lineTo(canvas.width, y * BLOCK_SIZE);
                ctx.stroke();
            }

            // Placed blocks
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    if (board[y][x]) {
                        drawBlock(x, y, board[y][x] as any);
                    }
                }
            }

            // Current piece
            current.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        drawBlock(current.x + dx, current.y + dy, current.color);
                    }
                });
            });
        };

        const collision = (px: number, py: number, shape: PieceShape) => {
            const { board } = gameState.current;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (!shape[y][x]) continue;
                    const nx = px + x;
                    const ny = py + y;
                    if (
                        nx < 0 ||
                        nx >= COLS ||
                        ny >= ROWS ||
                        (ny >= 0 && board[ny][nx])
                    ) {
                        return true;
                    }
                }
            }
            return false;
        };

        const mergePiece = () => {
            const { board, current } = gameState.current;
            current.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (!value) return;
                    const x = current.x + dx;
                    const y = current.y + dy;
                    if (y >= 0) {
                        (board[y][x] as any) = current.color;
                    }
                });
            });
        };

        const clearLines = () => {
            const { board } = gameState.current;
            let cleared = 0;
            outer: for (let y = ROWS - 1; y >= 0; y--) {
                for (let x = 0; x < COLS; x++) {
                    if (!board[y][x]) continue outer;
                }
                // full line
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(0));
                cleared++;
                y++;
            }
            if (cleared > 0) {
                setLines((prev) => prev + cleared);
                const addScore = cleared === 1 ? 100 : cleared === 2 ? 300 : 500;
                setScore((prev) => prev + addScore);
                gameState.current.dropInterval = Math.max(200, gameState.current.dropInterval - 20);
            }
        };

        const drop = () => {
            const { current } = gameState.current;
            const newY = current.y + 1;
            if (!collision(current.x, newY, current.shape)) {
                current.y = newY;
            } else {
                mergePiece();
                clearLines();
                gameState.current.current = randomPiece();
                const newCurrent = gameState.current.current;
                if (collision(newCurrent.x, newCurrent.y, newCurrent.shape)) {
                    setGameOver(true);
                    setIsRunning(false);
                }
            }
        };

        const update = (time: number) => {
            animationId = window.requestAnimationFrame(update);

            // If paused or game over, just draw the board (static) and return
            // But if we want to stop the loop entirely, we can do that too.
            // Here we keep the loop but skip updates if not running.
            // Actually, if we stop the loop in useEffect cleanup, we don't need this check?
            // But requestAnimationFrame is async.
            if (!isRunning || gameOver) {
                drawBoard();
                return;
            }

            if (!gameState.current.lastTime) gameState.current.lastTime = time;
            const delta = time - gameState.current.lastTime;
            gameState.current.lastTime = time;
            gameState.current.accTime += delta;

            if (gameState.current.accTime > gameState.current.dropInterval) {
                drop();
                gameState.current.accTime = 0;
            }
            drawBoard();
        };

        // Controls
        const moveLeft = () => {
            if (!isRunning || gameOver) return;
            const { current } = gameState.current;
            const nx = current.x - 1;
            if (!collision(nx, current.y, current.shape)) current.x = nx;
            drawBoard();
        };
        const moveRight = () => {
            if (!isRunning || gameOver) return;
            const { current } = gameState.current;
            const nx = current.x + 1;
            if (!collision(nx, current.y, current.shape)) current.x = nx;
            drawBoard();
        };
        const rotatePiece = () => {
            if (!isRunning || gameOver) return;
            const { current } = gameState.current;
            const rotated = rotate(current.shape);

            // Basic rotation
            if (!collision(current.x, current.y, rotated)) {
                current.shape = rotated;
                drawBoard();
                return;
            }

            // Wall kick (simple)
            // Try moving right 1
            if (!collision(current.x + 1, current.y, rotated)) {
                current.x += 1;
                current.shape = rotated;
                drawBoard();
                return;
            }
            // Try moving left 1
            if (!collision(current.x - 1, current.y, rotated)) {
                current.x -= 1;
                current.shape = rotated;
                drawBoard();
                return;
            }

            // Try moving right 2 (useful for I piece)
            if (!collision(current.x + 2, current.y, rotated)) {
                current.x += 2;
                current.shape = rotated;
                drawBoard();
                return;
            }
            // Try moving left 2
            if (!collision(current.x - 2, current.y, rotated)) {
                current.x -= 2;
                current.shape = rotated;
                drawBoard();
                return;
            }
        };
        const softDrop = () => {
            if (!isRunning || gameOver) return;
            drop();
            drawBoard();
        };
        const hardDrop = () => {
            if (!isRunning || gameOver) return;
            const { current } = gameState.current;
            let ny = current.y;
            while (!collision(current.x, ny + 1, current.shape)) {
                ny++;
            }
            current.y = ny;
            drop();
            drawBoard();
        };

        controlsRef.current = { moveLeft, moveRight, rotate: rotatePiece, softDrop, hardDrop };

        const handleKey = (e: KeyboardEvent) => {
            if (gameOver && e.key === "Enter") {
                handleReset();
                return;
            }
            if (!isRunning) return;
            if (e.key === "ArrowLeft") moveLeft();
            else if (e.key === "ArrowRight") moveRight();
            else if (e.key === "ArrowDown") softDrop();
            else if (e.key === "ArrowUp") rotatePiece();
            else if (e.key === " ") hardDrop();
        };

        window.addEventListener("keydown", handleKey);

        if (isRunning && !gameOver) {
            animationId = window.requestAnimationFrame(update);
        } else {
            // Draw once to show state if paused/gameover
            drawBoard();
        }

        return () => {
            window.cancelAnimationFrame(animationId);
            window.removeEventListener("keydown", handleKey);
        };
    }, [gameOver, isRunning]);

    // Action handlers for buttons
    const handleMoveLeft = useRepeatAction(() => controlsRef.current?.moveLeft());
    const handleMoveRight = useRepeatAction(() => controlsRef.current?.moveRight());
    const handleSoftDrop = useRepeatAction(() => controlsRef.current?.softDrop(), 100, 50); // Faster repeat for drop

    // Rotate should not repeat on hold, it's a single action
    const handleRotate = useSingleAction(() => controlsRef.current?.rotate(), 100);

    const handleHardDrop = useSingleAction(() => controlsRef.current?.hardDrop(), 500); // Long throttle to prevent double drop


    return (
        <div className="h-[100dvh] w-full bg-slate-950 flex flex-col items-center overflow-hidden touch-none select-none">

            {/* Header: Score & Status */}
            <div className="w-full max-w-md px-6 pt-4 pb-2 flex flex-col gap-2 shrink-0">
                <h1 className="text-white font-bold text-center">003 テトリス（ミニ）</h1>
                <div className="flex justify-between items-end w-full">
                    <div>
                        <h2 className="text-slate-400 text-xs font-bold tracking-wider mb-1">SCORE</h2>
                        <div className="text-3xl font-mono font-bold text-white leading-none">
                            {score.toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    {gameOver ? (
                        <span className="inline-block px-3 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-full animate-pulse">
                            GAME OVER
                        </span>
                    ) : isRunning ? (
                        <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                            PLAYING
                        </span>
                    ) : (
                        <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
                            PAUSED
                        </span>
                    )}
                </div>
            </div>

            {/* Game Field Area */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 p-2">
                <div className="relative h-full aspect-[1/2] max-w-full bg-slate-900 rounded-lg border-2 border-slate-800 shadow-2xl overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full object-contain block"
                    />

                    {/* Overlay */}
                    {(gameOver || !isRunning) && (
                        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                {gameOver ? "GAME OVER" : "PAUSED"}
                            </h2>
                            <p className="text-slate-400 text-sm mb-6 font-mono">
                                SCORE: {score}
                            </p>
                            <button
                                onClick={() => gameOver ? handleReset() : setIsRunning(true)}
                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                            >
                                {gameOver ? "TRY AGAIN" : "RESUME"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Area */}
            <div className="w-full max-w-md px-4 pb-safe pt-2 shrink-0">

                {/* Row 1: Rotate & Hard Drop */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                        {...handleRotate}
                        className="h-16 bg-slate-800 active:bg-slate-700 rounded-2xl shadow-[0_4px_0_0_rgba(15,23,42,0.5)] active:shadow-none active:translate-y-[4px] flex flex-col items-center justify-center transition-all border border-slate-700"
                    >
                        <span className="text-2xl mb-0.5">↻</span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wide">ROTATE</span>
                    </button>
                    <button
                        {...handleHardDrop}
                        className="h-16 bg-rose-600 active:bg-rose-700 rounded-2xl shadow-[0_4px_0_0_rgba(136,19,55,0.5)] active:shadow-none active:translate-y-[4px] flex flex-col items-center justify-center transition-all border border-rose-500"
                    >
                        <span className="text-2xl mb-0.5">⏬</span>
                        <span className="text-[10px] font-bold text-rose-100 tracking-wide">DROP</span>
                    </button>
                </div>

                {/* Row 2: Directional */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                        {...handleMoveLeft}
                        className="h-20 bg-slate-800 active:bg-slate-700 rounded-2xl shadow-[0_4px_0_0_rgba(15,23,42,0.5)] active:shadow-none active:translate-y-[4px] flex items-center justify-center transition-all border border-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-slate-200">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        {...handleSoftDrop}
                        className="h-20 bg-slate-800 active:bg-slate-700 rounded-2xl shadow-[0_4px_0_0_rgba(15,23,42,0.5)] active:shadow-none active:translate-y-[4px] flex items-center justify-center transition-all border border-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-slate-200">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        {...handleMoveRight}
                        className="h-20 bg-slate-800 active:bg-slate-700 rounded-2xl shadow-[0_4px_0_0_rgba(15,23,42,0.5)] active:shadow-none active:translate-y-[4px] flex items-center justify-center transition-all border border-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-slate-200">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                {/* Utility Buttons */}
                <div className="grid grid-cols-2 gap-4 px-4">
                    <button
                        onClick={() => setIsRunning(prev => !prev)}
                        className="py-3 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold tracking-wider hover:bg-slate-800 transition-colors"
                    >
                        {isRunning ? "PAUSE" : "RESUME"}
                    </button>
                    <button
                        onClick={handleReset}
                        className="py-3 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold tracking-wider hover:bg-slate-800 transition-colors"
                    >
                        RESET
                    </button>
                </div>
            </div>
        </div>
    );
}
