
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

// Simple puzzle for Demo MVP (Full generator is complex)
const SAMPLE_PUZZLE = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];
const SAMPLE_SOLUTION = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

export default function SudokuGame() {
    // board[row][col]
    const [board, setBoard] = useState<number[][]>(JSON.parse(JSON.stringify(SAMPLE_PUZZLE)));
    const [initial, setInitial] = useState<boolean[][]>(
        SAMPLE_PUZZLE.map(row => row.map(cell => cell !== 0))
    );
    const [selected, setSelected] = useState<[number, number] | null>(null);
    const [mistakes, setMistakes] = useState(0);
    const [solved, setSolved] = useState(false);

    // Check win
    useEffect(() => {
        let isFull = true;
        let isCorrect = true;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) isFull = false;
                if (board[r][c] !== SAMPLE_SOLUTION[r][c]) isCorrect = false;
            }
        }
        if (isFull && isCorrect) setSolved(true);
    }, [board]);

    const handleInput = (num: number) => {
        if (!selected || solved) return;
        const [r, c] = selected;
        if (initial[r][c]) return; // Cannot edit initial cells

        if (num !== 0 && num !== SAMPLE_SOLUTION[r][c]) {
            setMistakes(m => m + 1);
            // Optional: Show error visually on grid?
        }

        const newBoard = [...board];
        newBoard[r] = [...newBoard[r]];
        newBoard[r][c] = num;
        setBoard(newBoard);
    };

    const reset = () => {
        setBoard(JSON.parse(JSON.stringify(SAMPLE_PUZZLE)));
        setMistakes(0);
        setSolved(false);
        setSelected(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-12">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b border-slate-200">
                <Link href="/apps" className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-bold text-lg text-slate-800">Sudoku</h1>
                <div className="text-red-500 font-bold text-sm">Miss: {mistakes}/3</div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">

                {/* Board */}
                <div className="bg-slate-800 p-1 rounded-lg shadow-xl select-none">
                    <div className="grid grid-cols-9 gap-[1px] bg-slate-400 border-2 border-slate-800">
                        {board.map((row, r) => (
                            row.map((cell, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => setSelected([r, c])}
                                    className={clsx(
                                        "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg font-bold cursor-pointer transition-colors",
                                        (r % 3 === 2 && r !== 8) ? "border-b-2 border-slate-800" : "", // Doesn't work well in grid-gap setup, removed
                                        initial[r][c] ? "bg-slate-200 text-slate-900" : "bg-white text-blue-600",
                                        selected?.[0] === r && selected?.[1] === c ? "bg-blue-200 ring-2 ring-blue-500 z-10" : "",
                                        // Thick borders for 3x3
                                        (c === 2 || c === 5) ? "mr-[2px]" : "",
                                        (r === 2 || r === 5) ? "mb-[2px]" : ""
                                    )}
                                    style={{
                                        marginRight: (c === 2 || c === 5) ? 2 : 0,
                                        marginBottom: (r === 2 || r === 5) ? 2 : 0
                                    }}
                                >
                                    {cell !== 0 ? cell : ""}
                                </div>
                            ))
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-8 grid grid-cols-5 gap-2 px-4 w-full max-w-md">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleInput(num)}
                            className="bg-white border border-slate-200 h-14 rounded-lg shadow-sm text-2xl font-bold text-slate-700 active:bg-blue-50 active:scale-95 transition-all"
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={() => handleInput(0)} className="bg-slate-200 h-14 rounded-lg font-bold text-slate-600 text-sm">Clear</button>
                </div>

                {solved && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl space-y-6">
                            <Trophy size={64} className="mx-auto text-yellow-500 animate-bounce" />
                            <h2 className="text-3xl font-bold text-slate-800">Solved!</h2>
                            <p className="text-slate-500">You completed the puzzle.</p>
                            <button onClick={reset} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg">
                                Play Again
                            </button>
                        </div>
                    </div>
                )}

                {mistakes >= 3 && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl space-y-6">
                            <div className="text-red-500 text-6xl">💀</div>
                            <h2 className="text-3xl font-bold text-slate-800">Game Over</h2>
                            <button onClick={reset} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg">
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
