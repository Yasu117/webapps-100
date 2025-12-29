
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Map, Calendar, Heart, Plane, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AITravelPlanner() {
    const [destination, setDestination] = useState("");
    const [days, setDays] = useState(2);
    const [interests, setInterests] = useState("");
    const [result, setResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!destination.trim()) return;

        setIsLoading(true);
        setResult("");

        try {
            const res = await fetch("/api/ai-travel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ destination, days, interests }),
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
        <div className="min-h-screen bg-emerald-50 text-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-emerald-100">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/apps" className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2 text-emerald-800">
                        <Plane size={20} className="text-emerald-600" />
                        AIトラベルプランナー
                    </h1>
                    <div className="w-8" />
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
                {/* Form */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 space-y-5">

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <Map size={16} className="text-emerald-500" /> どこへ行きますか？
                        </label>
                        <input
                            type="text"
                            placeholder="例: 京都、北海道、パリ"
                            className="w-full bg-slate-50 border-0 p-3 rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <Calendar size={16} className="text-emerald-500" /> 日数
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="7"
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                            <span className="text-lg font-bold text-emerald-600 w-12 text-center">{days}日</span>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <Heart size={16} className="text-emerald-500" /> 興味・関心 (任意)
                        </label>
                        <input
                            type="text"
                            placeholder="例: グルメとお寺巡り、ショッピング"
                            className="w-full bg-slate-50 border-0 p-3 rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !destination.trim()}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all
              ${isLoading ? "bg-emerald-400" : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" /> プラン作成中...
                            </span>
                        ) : (
                            "プランを作る"
                        )}
                    </button>
                </div>

                {/* Result */}
                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
                            <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-bold text-emerald-800 text-sm">おすすめプラン</span>
                            </div>
                            <div className="p-6 prose prose-slate prose-sm max-w-none">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-slate-900 border-b-2 border-emerald-100 pb-2 mb-4" {...props} />,
                                        h2: ({ node, ...props }) => <div className="mt-8 mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-emerald-500 rounded-full" /> <h2 className="text-lg font-bold text-slate-800 m-0" {...props} /></div>,
                                        h3: ({ node, ...props }) => <h3 className="text-base font-bold text-teal-700 mt-4 mb-2" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="text-emerald-700 font-bold" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 mb-4 text-slate-600" {...props} />,
                                        li: ({ node, ...props }) => <li className="marker:text-emerald-400" {...props} />,
                                    }}
                                >
                                    {result}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
