
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Gift, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function AiGiftAdvisor() {
    const [target, setTarget] = useState("");
    const [budget, setBudget] = useState("");
    const [likes, setLikes] = useState("");

    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!target || !budget) return;
        setLoading(true);
        setResult("");
        try {
            const res = await fetch("/api/ai-gift", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target, budget, likes }),
            });
            const data = await res.json();
            setResult(data.result);
        } catch (e) {
            console.error(e);
            setResult("エラーが発生しました。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 text-slate-800 font-sans pb-20">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-pink-100">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/apps" className="text-pink-500 font-medium text-sm">← Apps</Link>
                    <h1 className="font-bold text-lg flex items-center gap-2 text-pink-600">
                        <Gift size={20} />
                        Gift Advisor
                    </h1>
                    <div className="w-8" />
                </div>
                <div className="max-w-md mx-auto px-4 pb-4">
                    <div className="bg-pink-100/50 p-3 rounded-lg text-xs text-pink-800">
                        <span className="font-bold mr-2">#052</span>
                        贈る相手や予算を入力してください。AIが最適なプレゼント案をリストアップします。
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-8 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">相手の属性</label>
                        <input
                            type="text"
                            placeholder="例: 30代 女性 同僚"
                            className="w-full bg-pink-50/50 border border-pink-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">予算</label>
                        <input
                            type="text"
                            placeholder="例: 3000円 〜 5000円"
                            className="w-full bg-pink-50/50 border border-pink-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                            value={budget}
                            onChange={e => setBudget(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">好み・趣味（任意）</label>
                        <textarea
                            placeholder="例: コーヒー好き、北欧雑貨、アウトドア..."
                            className="w-full bg-pink-50/50 border border-pink-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[80px]"
                            value={likes}
                            onChange={e => setLikes(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !target || !budget}
                        className={clsx(
                            "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-2",
                            loading
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 active:scale-95 hover:brightness-110"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        プレゼントを探す
                    </button>
                </div>

                {result && (
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-pink-100 animate-in slide-in-from-bottom-4">
                        <div className="prose prose-pink prose-sm max-w-none">
                            <ReactMarkdown>{result}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
