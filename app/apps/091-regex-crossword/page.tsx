
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, HelpCircle } from "lucide-react";
import { clsx } from "clsx";

type Puzzle = {
    id: number;
    rows: string[];
    cols: string[];
    solution: string[][]; // For verification or initial empty
};

const PUZZLES: Puzzle[] = [
    {
        id: 1,
        rows: ["H.RE", "S.ME"], // HE, ME (example) - wait regex applies to the whole row string?
        // Let's do standard Regex Crossword style: ".*" matches the row string?
        // Grid 2x2:
        // [A][B]
        // [C][D]
        // Row 1: ^He$ -> H, e
        // Row 2: ^go$ -> g, o
        // Col 1: ^Hg$
        // Col 2: ^eo$

        rows: ["HE", "GO"], // Regexes
        cols: ["HG", "EO"],
        solution: [["H", "E"], ["G", "O"]]
    },
    {
        id: 2,
        rows: ["[A-Z]+", "[0-9]+"],
        cols: ["[A-Z][0-9]", "[A-Z][0-9]"],
        solution: [["A", "1"], ["B", "2"]] // Multiple solutions possible? I will check regex match.
    },
    {
        id: 3,
        rows: ["(A|B)+", "(C|D)+"],
        cols: ["[AC]", "[BD]"],
        solution: [["A", "B"], ["C", "D"]] // Wait solution is just for sizing.
    }
];

// Better Puzzles
const LEVELS = [
    {
        id: 1,
        size: 2,
        rows: ["HE|HI", "LO|GO"],
        cols: ["H.*", "[AEIOU].*"],
        initial: [["", ""], ["", ""]]
    },
    {
        id: 2,
        size: 2,
        rows: ["[0-9]+", "[A-Z]+"],
        cols: ["7A", "7B"],
        initial: [["", ""], ["", ""]]
    },
    {
        id: 3,
        size: 3,
        rows: ["A.*", "B.*", "C.*"],
        cols: ["ABC", "ABC", "ABC"],
        initial: [["", "", ""], ["", "", ""], ["", "", ""]]
    }
];


export default function RegexCrossword() {
    const [levelIndex, setLevelIndex] = useState(0);
    const [grid, setGrid] = useState<string[][]>([["", ""], ["", ""]]);
    const [success, setSuccess] = useState(false);

    const level = LEVELS[levelIndex];

    useEffect(() => {
        setGrid(level.initial.map(r => [...r]));
        setSuccess(false);
    }, [level]);

    const handleChange = (r: number, c: number, val: string) => {
        if (val.length > 1) val = val.slice(-1); // Single char
        const newGrid = [...grid];
        newGrid[r][c] = val.toUpperCase();
        setGrid(newGrid);
        checkWin(newGrid);
    };

    const checkWin = (currentGrid: string[][]) => {
        // Check Rows
        for (let i = 0; i < level.size; i++) {
            const rowStr = currentGrid[i].join("");
            if (!new RegExp(`^(${level.rows[i]})$`).test(rowStr)) return;
        }
        // Check Cols
        for (let j = 0; j < level.size; j++) {
            let colStr = "";
            for (let i = 0; i < level.size; i++) {
                colStr += currentGrid[i][j];
            }
            if (!new RegExp(`^(${level.cols[j]})$`).test(colStr)) return;
        }
        setSuccess(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center justify-center p-4">
            <header className="absolute top-4 left-4 flex items-center gap-4">
                <Link href="/apps" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#091 Regex Crossword</h1>
            </header>

            <div className="max-w-md w-full flex flex-col items-center gap-8">
                <div className="flex justify-between w-full items-center">
                    <button
                        onClick={() => setLevelIndex(Math.max(0, levelIndex - 1))}
                        disabled={levelIndex === 0}
                        className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50"
                    >Prev</button>
                    <span className="font-bold">Level {level.id}</span>
                    <button
                        onClick={() => setLevelIndex(Math.min(LEVELS.length - 1, levelIndex + 1))}
                        disabled={levelIndex === LEVELS.length - 1}
                        className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50"
                    >Next</button>
                </div>

                <div className="relative p-12 bg-slate-800 rounded-xl shadow-2xl">
                    {/* Top Regexes (Cols) */}
                    <div className="absolute top-0 left-12 right-0 h-12 flex">
                        {level.cols.map((r, i) => (
                            <div key={i} className="flex-1 flex items-center justify-center text-xs font-mono text-cyan-400 rotate-[-45deg] origin-bottom-left translate-y-[-20px] whitespace-nowrap">
                                /{r}/
                            </div>
                        ))}
                    </div>

                    {/* Left Regexes (Rows) */}
                    <div className="absolute top-12 bottom-0 left-0 w-12 flex flex-col">
                        {level.rows.map((r, i) => (
                            <div key={i} className="flex-1 flex items-center justify-center text-xs font-mono text-pink-400 -rotate-45 whitespace-nowrap max-w-[40px] overflow-visible text-right pr-2">
                                /{r}/
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div
                        className="grid gap-2 bg-slate-700 p-2 rounded border border-slate-600"
                        style={{ gridTemplateColumns: `repeat(${level.size}, 1fr)` }}
                    >
                        {grid.map((row, r) => (
                            row.map((cell, c) => (
                                <input
                                    key={`${r}-${c}`}
                                    value={cell}
                                    onChange={(e) => handleChange(r, c, e.target.value)}
                                    className={clsx(
                                        "w-12 h-12 text-center text-2xl font-bold bg-slate-900 border border-slate-600 rounded text-white focus:border-blue-500 outline-none uppercase",
                                        success && "bg-green-900/50 border-green-500 text-green-200"
                                    )}
                                />
                            ))
                        ))}
                    </div>
                </div>

                {success && (
                    <div className="text-green-400 font-bold text-xl animate-bounce flex items-center gap-2">
                        <Check /> Correct!
                    </div>
                )}

                <div className="text-sm text-slate-500 max-w-xs text-center">
                    Fill in the grid so that each row and column matches its corresponding Regular Expression.
                </div>
            </div>
        </div>
    );
}
