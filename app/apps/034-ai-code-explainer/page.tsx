
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Code2, Sparkles, Loader2, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function AICodeExplainer() {
    const [code, setCode] = useState("");
    const [result, setResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async () => {
        if (!code.trim()) return;

        setIsLoading(true);
        setResult("");

        try {
            const res = await fetch("/api/ai-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Simple detection, passing raw code
                body: JSON.stringify({ code, language: "auto" }),
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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-300 pb-20">
            {/* Header */}
            <div className="bg-[#1E293B] border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/apps" className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2 text-white">
                        <Code2 size={20} className="text-cyan-400" />
                        コード解説くん
                    </h1>
                    <div className="w-8" />
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
                {/* Input */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-400 pl-1">
                        解説してほしいコードを貼り付けてください
                    </label>
                    <div className="relative group">
                        <textarea
                            className="w-full h-48 bg-[#1E293B] border border-slate-700 rounded-xl p-4 font-mono text-sm text-cyan-50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-xl resize-none leading-relaxed"
                            placeholder={'function hello() {\n  console.log("Hello World");\n}'}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                        />
                        <div className="absolute right-3 bottom-3 text-xs text-slate-600 bg-slate-800/50 px-2 py-1 rounded pointer-events-none">
                            Auto-detect
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !code.trim()}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2
              ${isLoading ? "bg-slate-700 cursor-wait" : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"}`}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> 解説する</>}
                    </button>
                </div>

                {/* Output */}
                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-2 pl-1">
                            <span className="text-sm font-medium text-slate-400">解説</span>
                            <button onClick={copyToClipboard} className="text-xs flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors">
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700 shadow-xl prose prose-invert prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-sm max-w-none">
                            <ReactMarkdown>
                                {result}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
