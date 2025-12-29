
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, GitCompare } from "lucide-react";
import { diffChars, diffLines } from "diff";

export default function TextDiffChecker() {
    const [oldText, setOldText] = useState("");
    const [newText, setNewText] = useState("");
    const [diffMode, setDiffMode] = useState<"chars" | "lines">("chars");

    const diffResult = diffMode === "chars"
        ? diffChars(oldText, newText)
        : diffLines(oldText, newText);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4">
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/apps" className="text-slate-500 hover:text-slate-800">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <GitCompare size={20} className="text-purple-600" />
                        Text Diff Checker
                    </h1>
                </div>
                <div className="flex bg-slate-200 rounded-lg p-1 text-xs font-medium">
                    <button
                        onClick={() => setDiffMode("chars")}
                        className={`px-3 py-1 rounded ${diffMode === "chars" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
                    >
                        Chars
                    </button>
                    <button
                        onClick={() => setDiffMode("lines")}
                        className={`px-3 py-1 rounded ${diffMode === "lines" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
                    >
                        Lines
                    </button>
                </div>
            </header>

            <div className="mb-4 bg-white p-3 rounded-lg text-xs text-slate-600 shadow-sm border border-slate-200">
                <span className="font-bold mr-2 text-blue-600">#058</span>
                2つのテキストを比較し、違いをハイライト表示します。コードや文章の推敲に使ってください。
            </div>

            <div className="grid md:grid-cols-2 gap-4 h-[40vh] mb-4">
                <div className="flex flex-col">
                    <label className="text-xs text-slate-500 font-bold mb-1">Old Text</label>
                    <textarea
                        className="flex-1 w-full bg-white border border-slate-300 rounded-lg p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                        value={oldText}
                        onChange={e => setOldText(e.target.value)}
                        placeholder="Original text..."
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs text-slate-500 font-bold mb-1">New Text</label>
                    <textarea
                        className="flex-1 w-full bg-white border border-slate-300 rounded-lg p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        placeholder="Modified text..."
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(60vh-100px)]">
                <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 border-b border-slate-200">
                    Result
                </div>
                <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">
                    {diffResult.map((part, index) => {
                        const color = part.added ? "bg-green-100 text-green-800" : part.removed ? "bg-red-100 text-red-800 decoration-red-400/50 line-through" : "text-slate-600";
                        return (
                            <span key={index} className={color}>
                                {part.value}
                            </span>
                        );
                    })}
                    {diffResult.length === 0 && <span className="text-slate-400 italic">No text to compare</span>}
                </div>
            </div>
        </div>
    );
}
