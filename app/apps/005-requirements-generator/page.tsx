"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RequirementsGeneratorPage() {
    const [idea, setIdea] = useState("");
    const [result, setResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!idea.trim()) return;

        setIsLoading(true);
        setError("");
        setResult("");

        try {
            const res = await fetch("/api/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idea }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to generate requirements");
            }

            const data = await res.json();
            setResult(data.result);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        005 要件定義ジェネレーター
                    </h1>
                    <p className="mt-2 text-slate-600">
                        ビジネスアイデアを1行で入れると、要件定義まで自動生成します
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6 space-y-6">
                    <div>
                        <label
                            htmlFor="idea"
                            className="block text-sm font-medium text-slate-700 mb-2"
                        >
                            ビジネスアイデア (最大500文字)
                        </label>
                        <textarea
                            id="idea"
                            rows={4}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="例：近所のスーパーの特売情報を共有できるSNSアプリ"
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            maxLength={500}
                            disabled={isLoading}
                        />
                        <div className="text-right text-xs text-slate-500 mt-1">
                            {idea.length}/500 文字
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !idea.trim()}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
              ${isLoading || !idea.trim()
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            }`}
                    >
                        {isLoading ? "生成中..." : "要件定義を生成"}
                    </button>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">
                                生成結果
                            </h2>
                            <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-wrap text-black prose-headings:text-black prose-p:text-black prose-strong:text-black prose-li:text-black">
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
