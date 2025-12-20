"use client";

import React, { useState } from "react";
import {
    MessageSquare,
    Search,
    BarChart2,
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    RefreshCw,
    Hash,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

type AnalysisResult = {
    score: number;
    sentiment: "Positive" | "Neutral" | "Negative";
    summary: string;
    keywords: string[];
    improvements: string[];
};

export default function ReviewAnalyzerPage() {
    const [text, setText] = useState("");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const analyze = async () => {
        if (!text.trim() || text.length < 5) return;

        setIsLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/review-analyzer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `API Error: ${res.status}`);
            }
            const data = await res.json();
            setResult(data);
        } catch (e: any) {
            console.error(e);
            alert(e.message || "分析に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return "text-emerald-400";
        if (score >= 40) return "text-yellow-400";
        return "text-rose-400";
    };

    const getScoreBg = (score: number) => {
        if (score >= 70) return "bg-emerald-500";
        if (score >= 40) return "bg-yellow-500";
        return "bg-rose-500";
    };

    const sampleReviews = [
        "商品のデザインは最高に可愛い！でも届くのが少し遅かったのと、梱包が雑で箱が潰れていました…。カスタマーサポートの対応は丁寧で良かったです。",
        "アプリの使い勝手が悪い。特にログイン画面で毎回エラーが出るのがストレス。機能自体は便利なので改善してほしい。",
        "いつも利用させてもらってます！店員さんの笑顔が素敵で、料理も美味しいので大満足です。これからも通い続けます！"
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex justify-start">
                    <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                <header className="text-center space-y-4">
                    <div>
                        <div className="text-sm font-bold text-cyan-400 mb-1">App 029</div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
                            <Search className="text-blue-400" />
                            口コミ分析AI
                        </h1>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl text-sm text-slate-400 text-left border border-slate-800 max-w-2xl mx-auto">
                        <p className="font-bold text-slate-200 mb-2">このアプリの使い方:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>顧客からのアンケート回答、レビュー、社内チャットなどのテキストを入力してください。</li>
                            <li>AIが<strong>「感情スコア（ポジティブ度）」</strong>を採点し、要約と重要なキーワードを抽出します。</li>
                            <li>ネガティブな要素が含まれる場合、AIが具体的な<strong>改善提案</strong>も行います。</li>
                        </ul>
                    </div>
                </header>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* 左側：入力エリア */}
                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-600 text-sm leading-relaxed"
                                placeholder="ここに分析したいテキストを入力してください...&#13;&#10;例：アンケート回答、レビュー、社内チャットのログなど"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            ></textarea>
                            {/* サンプルボタン */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button
                                    onClick={() => setText(sampleReviews[0])}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700 text-slate-400"
                                >
                                    サンプル1
                                </button>
                                <button
                                    onClick={() => setText(sampleReviews[1])}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700 text-slate-400"
                                >
                                    サンプル2
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={analyze}
                            disabled={isLoading || !text.trim()}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <RefreshCw className="animate-spin" /> : <BarChart2 />}
                            {isLoading ? "分析中..." : "分析を開始"}
                        </button>
                    </div>

                    {/* 右側：結果表示エリア */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[300px] flex flex-col relative overflow-hidden">
                        {result ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* スコア表示 */}
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                    <div>
                                        <div className="text-xs text-slate-400 font-bold mb-1">SENTIMENT SCORE</div>
                                        <div className={`text-5xl font-black ${getScoreColor(result.score)} tracking-tighter`}>
                                            {result.score}
                                            <span className="text-sm font-normal text-slate-500 ml-1">/ 100</span>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1 rounded-full text-xs font-bold bg-slate-800 border ${result.sentiment === "Positive" ? "border-emerald-500 text-emerald-400" : result.sentiment === "Negative" ? "border-rose-500 text-rose-400" : "border-yellow-500 text-yellow-400"}`}>
                                        {result.sentiment.toUpperCase()}
                                    </div>
                                </div>

                                {/* 要約 */}
                                <div>
                                    <div className="text-xs text-slate-400 font-bold mb-2 flex items-center gap-1">
                                        <MessageSquare size={14} /> SUMMARY
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                        {result.summary}
                                    </p>
                                </div>

                                {/* キーワード */}
                                <div>
                                    <div className="text-xs text-slate-400 font-bold mb-2 flex items-center gap-1">
                                        <Hash size={14} /> KEYWORDS
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {result.keywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-cyan-900/30 transition-colors">
                                                #{kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* 改善案 */}
                                {result.improvements && result.improvements.length > 0 && (
                                    <div className="bg-slate-800/30 p-4 rounded-xl border border-dashed border-slate-700">
                                        <div className="text-xs text-yellow-400 font-bold mb-2 flex items-center gap-1">
                                            <Lightbulb size={14} /> SUGGESTED IMPROVEMENTS
                                        </div>
                                        <ul className="space-y-2">
                                            {result.improvements.map((imp, i) => (
                                                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                                    <TrendingUp size={14} className="text-slate-500 shrink-0 mt-0.5" />
                                                    {imp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 space-y-4">
                                <AlertTriangle size={48} className="text-slate-700" />
                                <p className="text-sm">テキストを入力して分析を開始してください</p>
                            </div>
                        )}

                        {/* 装飾 */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                                    <span className="text-xs text-cyan-400 animate-pulse">AI思考中...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
