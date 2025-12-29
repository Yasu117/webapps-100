
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, FileText, Briefcase, Loader2, Download } from "lucide-react";
import Link from "next/link";

export default function AIResumeBuilder() {
    const [currentCareer, setCurrentCareer] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [result, setResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!currentCareer.trim()) return;

        setIsLoading(true);
        setResult("");

        try {
            const res = await fetch("/api/ai-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentCareer, targetRole }),
            });
            const data = await res.json();
            if (data.result) {
                setResult(data.result);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/apps" className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" />
                        AI職務経歴書
                    </h1>
                    <div className="w-8" /> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            目指す職種・ポジション (任意)
                        </label>
                        <div className="relative">
                            <Briefcase size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="例: フロントエンドエンジニア"
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            これまでの経歴・実績
                        </label>
                        <textarea
                            className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm leading-relaxed resize-none"
                            placeholder="・株式会社〇〇で営業を3年経験&#13;&#10;・売上目標を120%達成&#13;&#10;・チームリーダーとして5名をマネジメント"
                            value={currentCareer}
                            onChange={(e) => setCurrentCareer(e.target.value)}
                        />
                        <p className="text-xs text-slate-400 mt-2 text-right">
                            箇条書きでOKです
                        </p>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !currentCareer.trim()}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2
              ${isLoading || !currentCareer.trim() ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : "AIで生成する"}
                    </button>
                </div>

                {/* Result Section */}
                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-500">生成結果</span>
                            {/* Future implementation: PDF Download */}
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 prose prose-slate prose-sm max-w-none">
                            <ReactMarkdown
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 mt-2" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-slate-800 mt-6 mb-3 border-l-4 border-blue-500 pl-3" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 mb-4 text-slate-600" {...props} />,
                                    li: ({ node, ...props }) => <li className="" {...props} />,
                                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-slate-600" {...props} />,
                                }}
                            >
                                {result}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
