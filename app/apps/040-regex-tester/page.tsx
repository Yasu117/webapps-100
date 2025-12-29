
"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Search, AlertCircle } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function RegexTester() {
    const [text, setText] = useState("Hello 123 World 456");
    const [pattern, setPattern] = useState("\\d+");
    const [flags, setFlags] = useState("g");

    const { parts, error, matchCount } = useMemo(() => {
        try {
            if (!pattern) return { parts: [{ text, match: false }], error: null, matchCount: 0 };

            const regex = new RegExp(pattern, flags);
            const matches = Array.from(text.matchAll(regex));

            if (matches.length === 0) return { parts: [{ text, match: false }], error: null, matchCount: 0 };

            const res = [];
            let lastIndex = 0;

            matches.forEach((m) => {
                // @ts-ignore
                const start = m.index;
                const end = start + m[0].length;

                // non-match before
                if (start > lastIndex) {
                    res.push({ text: text.slice(lastIndex, start), match: false });
                }
                // match
                res.push({ text: text.slice(start, end), match: true });
                lastIndex = end;
            });
            // remaining
            if (lastIndex < text.length) {
                res.push({ text: text.slice(lastIndex), match: false });
            }

            return { parts: res, error: null, matchCount: matches.length };
        } catch (e: any) {
            return { parts: [{ text, match: false }], error: e.message, matchCount: 0 };
        }
    }, [text, pattern, flags]);

    return (
        <div className="min-h-screen bg-slate-100 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/apps" className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-xl text-slate-800">Regex Tester</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* Pattern Input */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Regex Pattern</label>
                        <div className="flex gap-2 items-center">
                            <span className="text-slate-400 font-mono text-xl">/</span>
                            <input
                                type="text"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                className={clsx(
                                    "flex-1 bg-slate-50 border rounded-lg p-3 font-mono text-lg focus:outline-none focus:ring-2",
                                    error ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-200"
                                )}
                            />
                            <span className="text-slate-400 font-mono text-xl">/</span>
                            <input
                                type="text"
                                value={flags}
                                onChange={(e) => setFlags(e.target.value)}
                                className="w-16 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                placeholder="gims"
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Test Matches */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-slate-700">Test String</label>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            {matchCount} matches
                        </span>
                    </div>

                    {/* Rich Highlight Display */}
                    <div className="relative min-h-[120px] font-mono text-lg bg-slate-50 border border-slate-200 rounded-lg p-4 whitespace-pre-wrap break-all leading-relaxed">
                        {/* This overlay approach keeps layout strictly synced? No, just render parts */}
                        {parts.map((part, i) => (
                            <span
                                key={i}
                                className={part.match ? "bg-indigo-300 text-indigo-900 rounded-[2px]" : "text-slate-700"}
                            >
                                {part.text}
                            </span>
                        ))}
                    </div>

                    {/* Editable Textarea (Hidden but synced? Or separate?) 
                 For simplicity, let's just make the user edit raw text in a textarea below, 
                 and show highlight above. 
             */}
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full mt-4 h-32 p-4 bg-slate-800 text-slate-200 rounded-lg font-mono text-sm focus:outline-none resize-none"
                        placeholder="Paste your test text here..."
                    />
                </div>

            </div>
        </div>
    );
}
