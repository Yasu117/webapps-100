
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Book, Save, Plus, ArrowLeft, Trash2, Smile, Frown, Meh, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

type DiaryEntry = {
    id: string;
    date: string;
    text: string;
    sentiment?: {
        sentiment: string;
        score: number;
        primary_emotion: string;
        comment: string;
    };
};

export default function SmartDiary() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("app055-smart-diary");
        if (saved) {
            setEntries(JSON.parse(saved));
        }
    }, []);

    const saveEntries = (newEntries: DiaryEntry[]) => {
        setEntries(newEntries);
        localStorage.setItem("app055-smart-diary", JSON.stringify(newEntries));
    };

    const handleSave = async () => {
        if (!currentText.trim()) return;
        setLoading(true);

        try {
            const res = await fetch("/api/ai-sentiment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: currentText }),
            });
            const data = await res.json();
            const analysis = JSON.parse(data.result);

            const newEntry: DiaryEntry = {
                id: Date.now().toString(),
                date: new Date().toLocaleString("ja-JP"),
                text: currentText,
                sentiment: analysis
            };

            saveEntries([newEntry, ...entries]);
            setCurrentText("");
            setIsWriting(false);
        } catch (e) {
            console.error(e);
            alert("感情分析に失敗しましたが、日記は保存します。");
            const newEntry: DiaryEntry = {
                id: Date.now().toString(),
                date: new Date().toLocaleString("ja-JP"),
                text: currentText
            };
            saveEntries([newEntry, ...entries]);
            setCurrentText("");
            setIsWriting(false);
        } finally {
            setLoading(false);
        }
    };

    const deleteEntry = (id: string) => {
        if (confirm("本当に削除しますか？")) {
            saveEntries(entries.filter(e => e.id !== id));
        }
    };

    const getSentimentIcon = (sentiment?: string) => {
        switch (sentiment) {
            case "positive": return <Smile className="text-emerald-500" />;
            case "negative": return <Frown className="text-rose-500" />;
            default: return <Meh className="text-slate-400" />;
        }
    };

    const getSentimentColor = (sentiment?: string) => {
        switch (sentiment) {
            case "positive": return "bg-emerald-50 border-emerald-100";
            case "negative": return "bg-rose-50 border-rose-100";
            default: return "bg-white border-slate-100";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
            <header className="bg-white sticky top-0 z-10 border-b border-slate-200">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/apps" className="text-slate-500 hover:text-slate-800 transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        <Book size={20} className="text-blue-500" />
                        Smart Diary
                    </h1>
                    <button
                        onClick={() => setIsWriting(true)}
                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </header>

            <div className="bg-white border-b border-slate-200 p-4">
                <div className="max-w-md mx-auto bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100">
                    <span className="font-bold mr-2 text-blue-600">#055</span>
                    日記を書くとAIが感情を分析します。日々の記録と共にメンタル状態を可視化できます。
                </div>
            </div>

            <main className="max-w-md mx-auto px-4 py-6 space-y-4">
                {isWriting && (
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-blue-100 animate-in slide-in-from-top-4">
                        <h3 className="text-sm font-bold text-slate-500 mb-2">今日の出来事や気持ちを書いてね</h3>
                        <textarea
                            className="w-full h-32 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
                            placeholder="今日は..."
                            value={currentText}
                            onChange={e => setCurrentText(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-2 mt-3 justify-end">
                            <button
                                onClick={() => setIsWriting(false)}
                                className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading || !currentText.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? "分析中..." : <><Save size={16} /> 保存</>}
                            </button>
                        </div>
                    </div>
                )}

                {entries.length === 0 && !isWriting ? (
                    <div className="text-center py-20 text-slate-400">
                        <Book size={48} className="mx-auto mb-4 opacity-20" />
                        <p>まだ日記がありません</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entries.map(entry => (
                            <div
                                key={entry.id}
                                className={clsx(
                                    "p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md",
                                    getSentimentColor(entry.sentiment?.sentiment)
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs text-slate-400">{entry.date}</div>
                                    <div className="flex items-center gap-2">
                                        {entry.sentiment && (
                                            <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full text-xs font-medium">
                                                {getSentimentIcon(entry.sentiment.sentiment)}
                                                <span className={clsx(
                                                    entry.sentiment.sentiment === "positive" ? "text-emerald-600" :
                                                        entry.sentiment.sentiment === "negative" ? "text-rose-600" : "text-slate-500"
                                                )}>
                                                    {entry.sentiment.primary_emotion} ({entry.sentiment.score}%)
                                                </span>
                                            </div>
                                        )}
                                        <button onClick={() => deleteEntry(entry.id)} className="text-slate-300 hover:text-slate-500 p-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{entry.text}</p>

                                {entry.sentiment && (
                                    <div className="mt-3 pt-3 border-t border-black/5 flex items-start gap-2 text-xs text-slate-500">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-400" />
                                        {entry.sentiment.comment}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
