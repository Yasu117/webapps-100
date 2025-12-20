"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;

export default function BreakoutPage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [isRunning, setIsRunning] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // ゲームオブジェクト
        let x = CANVAS_WIDTH / 2;
        let y = CANVAS_HEIGHT - 30;
        let dx = 2;
        let dy = -2;
        const ballRadius = 8;

        const paddleHeight = 10;
        const paddleWidth = 75;
        let paddleX = (CANVAS_WIDTH - paddleWidth) / 2;

        let rightPressed = false;
        let leftPressed = false;

        const brickRowCount = 4;
        const brickColumnCount = 8;
        const brickWidth = 48;
        const brickHeight = 16;
        const brickPadding = 8;
        const brickOffsetTop = 40;
        const brickOffsetLeft = 18;

        type Brick = { x: number; y: number; status: number };

        const bricks: Brick[][] = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r] = { x: brickX, y: brickY, status: 1 };
            }
        }

        let animationId = 0;

        const drawBall = () => {
            ctx.beginPath();
            ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        };

        const drawPaddle = () => {
            ctx.fillRect(
                paddleX,
                CANVAS_HEIGHT - paddleHeight - 10,
                paddleWidth,
                paddleHeight
            );
        };

        const drawBricks = () => {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1) {
                        const b = bricks[c][r];
                        ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
                    }
                }
            }
        };

        const resetBallAndPaddle = () => {
            x = CANVAS_WIDTH / 2;
            y = CANVAS_HEIGHT - 30;
            dx = 2;
            dy = -2;
            paddleX = (CANVAS_WIDTH - paddleWidth) / 2;
        };

        const keyDownHandler = (e: KeyboardEvent) => {
            if (e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = true;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = true;
            } else if (e.key === " " && !isRunning) {
                setIsRunning(true);
                setMessage(null);
            }
        };

        const keyUpHandler = (e: KeyboardEvent) => {
            if (e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = false;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = false;
            }
        };

        const mouseMoveHandler = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
                paddleX = relativeX - paddleWidth / 2;
            }
        };

        const touchMoveHandler = (e: TouchEvent) => {
            e.preventDefault(); // Prevent scrolling while playing
            const rect = canvas.getBoundingClientRect();
            const relativeX = e.touches[0].clientX - rect.left;
            // Scale if canvas is resized via CSS
            const scaleX = CANVAS_WIDTH / rect.width;
            const actualX = relativeX * scaleX;

            if (actualX > 0 && actualX < CANVAS_WIDTH) {
                paddleX = actualX - paddleWidth / 2;
            }
        };

        const collisionDetection = () => {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const b = bricks[c][r];
                    if (b.status === 1) {
                        if (
                            x > b.x &&
                            x < b.x + brickWidth &&
                            y > b.y &&
                            y < b.y + brickHeight
                        ) {
                            dy = -dy;
                            b.status = 0;
                            setScore((prev) => prev + 10);

                            const remaining = bricks.flat().filter((br) => br.status === 1)
                                .length;
                            if (remaining === 0) {
                                setMessage("CLEAR! 🎉 Spaceキーで再スタート");
                                setIsRunning(false);
                            }
                        }
                    }
                }
            }
        };

        const draw = () => {
            animationId = window.requestAnimationFrame(draw);
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // 背景
            ctx.fillStyle = "#020617";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // ブロック
            ctx.fillStyle = "#38bdf8";
            drawBricks();

            // パドル
            ctx.fillStyle = "#22c55e";
            drawPaddle();

            // ボール
            ctx.fillStyle = "#f97316";
            drawBall();

            if (!isRunning) return;

            collisionDetection();

            if (x + dx > CANVAS_WIDTH - ballRadius || x + dx < ballRadius) {
                dx = -dx;
            }
            if (y + dy < ballRadius) {
                dy = -dy;
            } else if (y + dy > CANVAS_HEIGHT - ballRadius - 10) {
                // パドルとの当たり判定
                if (
                    x > paddleX &&
                    x < paddleX + paddleWidth &&
                    y + dy > CANVAS_HEIGHT - paddleHeight - 20
                ) {
                    dy = -dy;
                } else if (y + dy > CANVAS_HEIGHT - ballRadius) {
                    // ミス
                    setLives((prev) => {
                        const remaining = prev - 1;
                        if (remaining <= 0) {
                            setMessage("GAME OVER 💀 Spaceキーで再スタート");
                            setIsRunning(false);
                        } else {
                            resetBallAndPaddle();
                        }
                        return remaining <= 0 ? 0 : remaining;
                    });
                }
            }

            if (rightPressed && paddleX < CANVAS_WIDTH - paddleWidth) {
                paddleX += 4;
            } else if (leftPressed && paddleX > 0) {
                paddleX -= 4;
            }

            x += dx;
            y += dy;
        };

        window.addEventListener("keydown", keyDownHandler);
        window.addEventListener("keyup", keyUpHandler);
        window.addEventListener("mousemove", mouseMoveHandler);
        // Passive false for preventing default
        canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });
        canvas.addEventListener("touchstart", touchMoveHandler, { passive: false });

        animationId = window.requestAnimationFrame(draw);

        return () => {
            window.cancelAnimationFrame(animationId);
            window.removeEventListener("keydown", keyDownHandler);
            window.removeEventListener("keyup", keyUpHandler);
            window.removeEventListener("mousemove", mouseMoveHandler);
            canvas.removeEventListener("touchmove", touchMoveHandler);
            canvas.removeEventListener("touchstart", touchMoveHandler);
        };
    }, [isRunning]);

    const handleReset = () => {
        // 状態だけリセットして、useEffect の中のローカル変数は再作成させる
        setScore(0);
        setLives(3);
        setMessage(null);
        setIsRunning(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl shadow-xl p-4 flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        className="bg-slate-900 rounded-lg shadow-inner max-w-full touch-none"
                    />
                </div>

                <div className="w-full md:w-64 bg-slate-950 border border-slate-700 rounded-2xl shadow-xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🧱</span>
                                <h1 className="text-lg font-bold text-slate-50">
                                    004 ブロック崩し（ミニ）
                                </h1>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 mb-3">
                            ← →：パドル移動
                            <br />
                            マウス移動でも操作できます。
                            <br />
                            Space：ゲームオーバー/クリア時の再スタート
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">スコア</span>
                                <span className="font-mono text-emerald-400">{score}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">残りライフ</span>
                                <span className="font-mono text-rose-400">{lives}</span>
                            </div>
                            <div className="mt-2 min-h-[40px]">
                                {message ? (
                                    <span className="inline-block text-xs text-slate-200">
                                        {message}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full border border-emerald-500 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                        {isRunning ? "PLAY中" : "一時停止中"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsRunning((prev) => !prev)}
                            className="flex-1 rounded-full py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition"
                        >
                            {isRunning ? "PAUSE" : "RESUME"}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex-1 rounded-full py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-50 transition"
                        >
                            RESET
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
