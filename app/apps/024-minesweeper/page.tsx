"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Flag, Bomb, RefreshCw, Trophy, Skull, ArrowLeft } from "lucide-react";
import Link from "next/link";

// 設定
const ROWS = 10;
const COLS = 10;
const MINES = 15;

type CellState = {
    isRevealed: boolean;
    isFlagged: boolean;
    isMine: boolean;
    neighborMines: number;
};

type GameStatus = "playing" | "won" | "lost";

export default function MinesweeperPage() {
    const [grid, setGrid] = useState<CellState[][]>([]);
    const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
    const [mineCount, setMineCount] = useState(MINES); // 残り地雷数（フラグ数に基づく）
    const [isFlagMode, setIsFlagMode] = useState(false); // スマホ用フラグモード

    // ゲーム初期化
    const initializeGame = useCallback(() => {
        // 1. 空のグリッド作成
        const newGrid: CellState[][] = Array(ROWS)
            .fill(null)
            .map(() =>
                Array(COLS).fill({
                    isRevealed: false,
                    isFlagged: false,
                    isMine: false,
                    neighborMines: 0,
                })
            );

        // 2. 地雷配置
        let placedMines = 0;
        while (placedMines < MINES) {
            const r = Math.floor(Math.random() * ROWS);
            const c = Math.floor(Math.random() * COLS);
            if (!newGrid[r][c].isMine) {
                newGrid[r][c] = { ...newGrid[r][c], isMine: true };
                placedMines++;
            }
        }

        // 3. 隣接地雷数の計算
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!newGrid[r][c].isMine) {
                    let count = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (
                                r + i >= 0 &&
                                r + i < ROWS &&
                                c + j >= 0 &&
                                c + j < COLS &&
                                newGrid[r + i][c + j].isMine
                            ) {
                                count++;
                            }
                        }
                    }
                    newGrid[r][c] = { ...newGrid[r][c], neighborMines: count };
                }
            }
        }

        setGrid(newGrid);
        setGameStatus("playing");
        setMineCount(MINES);
        setIsFlagMode(false);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    // セルクリック処理
    const handleCellClick = (r: number, c: number) => {
        if (gameStatus !== "playing") return;
        if (grid[r][c].isRevealed) return;

        // フラグモードまたは右クリック相当の処理
        if (isFlagMode) {
            toggleFlag(r, c);
            return;
        }

        // フラグが立っているセルは開けない
        if (grid[r][c].isFlagged) return;

        // 地雷を踏んだ場合
        if (grid[r][c].isMine) {
            revealAllMines();
            setGameStatus("lost");
            return;
        }

        // セルを開く（0なら再帰的に）
        const newGrid = [...grid];
        revealCell(newGrid, r, c);
        setGrid(newGrid);

        // 勝利判定
        checkWin(newGrid);
    };

    // フラグ切り替え
    const toggleFlag = (r: number, c: number) => {
        if (gameStatus !== "playing" || grid[r][c].isRevealed) return;

        const newGrid = [...grid];
        const cell = { ...newGrid[r][c] };
        cell.isFlagged = !cell.isFlagged;
        newGrid[r][c] = cell;

        setGrid(newGrid);
        setMineCount((prev) => (cell.isFlagged ? prev - 1 : prev + 1));
    };

    // 右クリック制御
    const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
        e.preventDefault();
        toggleFlag(r, c);
    };

    // 再帰的にセルを開く
    const revealCell = (currentGrid: CellState[][], r: number, c: number) => {
        if (
            r < 0 ||
            r >= ROWS ||
            c < 0 ||
            c >= COLS ||
            currentGrid[r][c].isRevealed ||
            currentGrid[r][c].isFlagged
        ) {
            return;
        }

        currentGrid[r][c] = { ...currentGrid[r][c], isRevealed: true };

        if (currentGrid[r][c].neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    revealCell(currentGrid, r + i, c + j);
                }
            }
        }
    };

    // 全地雷を表示（負け時）
    const revealAllMines = () => {
        setGrid((prev) =>
            prev.map((row) =>
                row.map((cell) =>
                    cell.isMine ? { ...cell, isRevealed: true } : cell
                )
            )
        );
    };

    // 勝利判定
    const checkWin = (currentGrid: CellState[][]) => {
        let unrevealedSafeCells = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!currentGrid[r][c].isMine && !currentGrid[r][c].isRevealed) {
                    unrevealedSafeCells++;
                }
            }
        }
        if (unrevealedSafeCells === 0) {
            setGameStatus("won");
        }
    };

    // 数字ごとの色
    const getNumberColor = (num: number) => {
        const colors = [
            "",
            "text-blue-400",
            "text-green-400",
            "text-red-400",
            "text-purple-400",
            "text-orange-400",
            "text-cyan-400",
            "text-yellow-400",
            "text-pink-400",
        ];
        return colors[num] || "text-white";
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-mono select-none">
            <div className="w-full max-w-md space-y-6">
                {/* ヘッダー */}
                <div className="flex flex-col gap-4">
                    {/* タイトル＆スコア */}
                    <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-lg backdrop-blur relative">
                        <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex flex-col">
                            <div className="text-xs font-bold text-emerald-500 mb-1">App 024</div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                NEON SWEEPER
                            </h1>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <Bomb className="w-3 h-3 text-rose-500" />
                                <span>REMAINING:</span>
                                <span className="font-bold text-white text-lg leading-none">{mineCount}</span>
                            </div>
                        </div>

                        <button
                            onClick={initializeGame}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 transition-colors"
                        >
                            <RefreshCw className="w-6 h-6" />
                        </button>
                    </div>

                    {/* 説明 */}
                    <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-800/50 text-xs text-slate-400">
                        <p className="font-bold text-slate-300 mb-1">遊び方:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            <li>隠された地雷を踏まないように、全ての安全なマスを開けてください。</li>
                            <li>数字は「周囲8マスにある地雷の数」を表しています。</li>
                            <li>怪しいマスには<strong>FLAGモード</strong>（PCは右クリック）で旗を立てられます。</li>
                        </ul>
                    </div>
                </div>

                {/* ゲームエリア */}
                <div className="relative">
                    <div
                        className="grid gap-1 p-3 bg-slate-900 rounded-lg border border-slate-800 shadow-2xl mx-auto"
                        style={{
                            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                            width: "fit-content"
                        }}
                    >
                        {grid.map((row, r) =>
                            row.map((cell, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    className={`
                    w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded cursor-pointer transition-all duration-200
                    ${cell.isRevealed
                                            ? cell.isMine
                                                ? "bg-rose-900/50 border border-rose-500/50"
                                                : "bg-slate-800/50 border border-slate-800"
                                            : "bg-slate-700 hover:bg-slate-600 border-b-4 border-r-4 border-slate-800 active:border-0 active:translate-y-1"
                                        }
                    `}
                                    onClick={() => handleCellClick(r, c)}
                                    onContextMenu={(e) => handleContextMenu(e, r, c)}
                                >
                                    {cell.isRevealed ? (
                                        cell.isMine ? (
                                            <Bomb className="w-5 h-5 text-rose-500 animate-pulse" />
                                        ) : (
                                            <span className={`font-bold text-lg ${getNumberColor(cell.neighborMines)} drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]`}>
                                                {cell.neighborMines > 0 ? cell.neighborMines : ""}
                                            </span>
                                        )
                                    ) : cell.isFlagged ? (
                                        <Flag className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                                    ) : null}
                                </div>
                            ))
                        )}
                    </div>

                    {/* ゲームオーバー/クリア オーバーレイ */}
                    {gameStatus !== "playing" && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg animate-in fade-in duration-300">
                            <div className="text-center p-6 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl transform scale-110">
                                {gameStatus === "won" ? (
                                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                                ) : (
                                    <Skull className="w-16 h-16 text-rose-500 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                                )}
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {gameStatus === "won" ? "YOU WON!" : "GAME OVER"}
                                </h2>
                                <button
                                    onClick={initializeGame}
                                    className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg hover:shadow-emerald-500/30 transition-all"
                                >
                                    PLAY AGAIN
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* コントロール（スマホ用） */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setIsFlagMode(false)}
                        className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold ${!isFlagMode
                            ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                            }`}
                    >
                        <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
                        OPEN
                    </button>
                    <button
                        onClick={() => setIsFlagMode(true)}
                        className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold ${isFlagMode
                            ? "bg-yellow-600 border-yellow-500 text-white shadow-[0_0_15px_rgba(202,138,4,0.4)]"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                            }`}
                    >
                        <Flag className="w-5 h-5" />
                        FLAG
                    </button>
                </div>

                <p className="text-center text-xs text-slate-500 mt-4">
                    PC: Click to Open, Right-Click to Flag
                </p>
            </div>
        </div>
    );
}
