
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChefHat, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function AiRecipeChef() {
    const [ingredients, setIngredients] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const generateRecipe = async () => {
        if (!ingredients.trim()) return;
        setLoading(true);
        setResult("");
        try {
            const res = await fetch("/api/ai-recipe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ingredients }),
            });
            const data = await res.json();
            setResult(data.result);
        } catch (e) {
            console.error(e);
            setResult("エラーが発生しました。もう一度試してください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 text-slate-800 font-sans pb-20">
            {/* Header */}
            <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/apps" className="text-orange-600 font-medium text-sm">
                        ← Apps
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2 text-orange-800">
                        <ChefHat size={20} />
                        AI Recipe Chef
                    </h1>
                    <div className="w-8" />
                </div>
                <div className="max-w-md mx-auto px-4 pb-4">
                    <div className="bg-orange-100/50 p-3 rounded-lg text-xs text-orange-800">
                        <span className="font-bold mr-2">#051</span>
                        冷蔵庫にある食材を入力してください。AIシェフが3つのレシピを提案します。
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-8 space-y-6">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                        冷蔵庫にある食材は？
                    </label>
                    <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent min-h-[100px] mb-4"
                        placeholder="例: 卵、キャベツ、豚バラ肉、使いかけの玉ねぎ..."
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                    />

                    <button
                        onClick={generateRecipe}
                        disabled={loading || !ingredients.trim()}
                        className={clsx(
                            "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                            loading
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-200 active:scale-95 hover:brightness-110"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                シェフが考案中...
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                レシピを提案する
                            </>
                        )}
                    </button>
                </section>

                {result && (
                    <section className="prose prose-orange prose-sm max-w-none bg-white p-6 rounded-2xl shadow-sm border border-orange-100 animate-in fade-in slide-in-from-bottom-4">
                        <ReactMarkdown>{result}</ReactMarkdown>
                    </section>
                )}
            </main>
        </div>
    );
}
