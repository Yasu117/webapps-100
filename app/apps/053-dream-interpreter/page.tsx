
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Moon, CloudMoon, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function DreamInterpreter() {
    const [dreamContent, setDreamContent] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const interpret = async () => {
        if (!dreamContent.trim()) return;
        setLoading(true);
        setResult("");
        try {
            const res = await fetch("/api/ai-dream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dreamContent }),
            });
            const data = await res.json();
            setResult(data.result);
        } catch (e) {
            console.error(e);
            setResult("夢の解析に失敗しました。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-indigo-950 text-indigo-50 font-sans pb-20 selection:bg-indigo-500 selection:text-white">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#4338ca,#1e1b4b)] opacity-50"></div>
                {/* Stars could be added here */}
            </div>

            <header className="relative z-10 border-b border-indigo-900/50 bg-indigo-950/50 backdrop-blur-md">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/apps" className="text-indigo-400 hover:text-indigo-300 transition text-sm">← Apps</Link>
                    <h1 className="font-bold text-lg flex items-center gap-2 text-indigo-200">
                        <CloudMoon size={20} />
                        Dream Interpreter
                    </h1>
                    <div className="w-8" />
                </div>
                <div className="max-w-md mx-auto px-4 pb-4">
                    <div className="bg-indigo-900/50 border border-indigo-800 p-3 rounded-lg text-xs text-indigo-300">
                        <span className="font-bold mr-2">#053</span>
                        見た夢の内容を入力してください。深層心理やメッセージをAIが解析します。
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-md mx-auto px-4 py-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-900/50 mb-2 ring-1 ring-indigo-700 shadow-lg shadow-indigo-900/50">
                        <Moon size={32} className="text-yellow-200" />
                    </div>
                    <h2 className="text-xl font-bold text-indigo-100">今日見た夢を教えてください</h2>
                    <p className="text-xs text-indigo-400">深層心理からのメッセージを読み解きます</p>
                </div>

                <div className="space-y-4">
                    <textarea
                        className="w-full bg-indigo-900/30 border border-indigo-800 rounded-xl p-4 text-indigo-100 placeholder:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[150px] resize-none"
                        placeholder="例：空を飛んでいる夢を見ました。でも途中で翼が重くなって..."
                        value={dreamContent}
                        onChange={(e) => setDreamContent(e.target.value)}
                    />

                    <button
                        onClick={interpret}
                        disabled={loading || !dreamContent.trim()}
                        className={clsx(
                            "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                            loading
                                ? "bg-indigo-900/50 text-indigo-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900 active:scale-95 hover:brightness-110"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        夢の意味を解析する
                    </button>
                </div>

                {result && (
                    <div className="bg-indigo-900/40 border border-indigo-800 p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-500">
                        <div className="prose prose-invert prose-indigo prose-sm max-w-none">
                            <ReactMarkdown>{result}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
