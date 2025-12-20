'use client';

import React, { useState } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// --- Types & Constants ---

const SITUATIONS = [
    { id: 'meeting', label: '日程調整', icon: '📅' },
    { id: 'sales', label: '営業・提案', icon: '💼' },
    { id: 'thankyou', label: 'お礼', icon: '🙏' },
    { id: 'apology', label: 'お詫び', icon: '🙇' },
    { id: 'request', label: '依頼・相談', icon: '❓' },
    { id: 'reminder', label: '催促', icon: '⏰' },
];

const RECIPIENTS = [
    { id: 'client', label: '取引先 (標準)' },
    { id: 'client_vip', label: '重要顧客 (丁重)' },
    { id: 'superior', label: '上司' },
    { id: 'colleague', label: '同僚' },
    { id: 'external', label: '社外 (初対面)' },
];

const TONES = [
    { id: 'very_polite', label: 'とても丁寧に' },
    { id: 'standard', label: '標準的' },
    { id: 'friendly', label: '少し柔らかく' },
    { id: 'concise', label: '簡潔・端的' },
];

export default function EmailDrafterPage() {
    // --- State ---
    const [situation, setSituation] = useState(SITUATIONS[0].label);
    const [recipient, setRecipient] = useState(RECIPIENTS[0].label);
    const [keyPoints, setKeyPoints] = useState('');
    const [tone, setTone] = useState(TONES[1].label);

    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

    // --- Actions ---
    const handleGenerate = async () => {
        if (!keyPoints.trim()) {
            alert('伝えたい要点（メモ）を少しでも良いので入力してください。');
            return;
        }

        setIsGenerating(true);
        setResult(null); // Reset previous result

        try {
            const res = await fetch('/api/email/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    situation,
                    recipient,
                    keyPoints,
                    tone
                })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
            alert('メール生成に失敗しました。');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('クリップボードにコピーしました！');
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative flex flex-col">

                {/* Header */}
                <header className="bg-white/95 backdrop-blur sticky top-0 z-10 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
                        <span className="text-blue-600 mr-2">013</span>Smart Email
                    </h1>
                </header>

                <main className="flex-1 p-5 space-y-8 overflow-y-auto">

                    {/* Description */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-slate-600 leading-relaxed shadow-sm">
                        <span className="font-bold text-blue-600">使い方:</span> シチュエーションと相手を選んで、要点を箇条書きにするだけ。AIが<span className="font-bold">「失礼のないビジネスメール」</span>を自動執筆します。
                    </div>

                    {/* -- Config Section -- */}
                    <section className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">

                        {/* 1. Situation */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. シチュエーション</label>
                            <div className="grid grid-cols-3 gap-2">
                                {SITUATIONS.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSituation(s.label)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-[0.98] ${situation === s.label
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="text-xl mb-1">{s.icon}</span>
                                        <span className="text-[10px] whitespace-nowrap">{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Recipient */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. 相手</label>
                            <div className="flex flex-wrap gap-2">
                                {RECIPIENTS.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setRecipient(r.label)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${recipient === r.label
                                            ? 'bg-slate-800 text-white border-slate-800'
                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Tone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. 文体の雰囲気</label>
                            <div className="bg-slate-100 p-1 rounded-lg flex">
                                {TONES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTone(t.label)}
                                        className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${tone === t.label
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Points */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. 伝えたい要点 (メモ書きでOK)</label>
                            <textarea
                                value={keyPoints}
                                onChange={(e) => setKeyPoints(e.target.value)}
                                placeholder="例：&#13;&#10;・来週水曜14時〜で会議したい&#13;&#10;・場所はオンライン（Zoom）&#13;&#10;・資料は明日までに送る"
                                className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none placeholder:text-slate-300 transition-shadow shadow-sm"
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !keyPoints.trim()}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isGenerating || !keyPoints.trim()
                                ? 'bg-slate-300 shadow-none cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    AIが執筆中...
                                </>
                            ) : (
                                '✉️ メールを作成'
                            )}
                        </button>
                    </section>

                    {/* -- Result Section -- */}
                    {result && (
                        <section className="pt-4 pb-8 space-y-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
                            <div className="flex items-center gap-2">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-xs font-bold text-slate-300">GENERATED DRAFT</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden ring-1 ring-slate-900/5">
                                {/* Subject Area */}
                                <div className="bg-slate-50 p-4 border-b border-slate-100 flex gap-3 items-center">
                                    <span className="text-xs font-bold text-slate-400 shrink-0">件名</span>
                                    <input
                                        className="flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none"
                                        value={result.subject}
                                        onChange={(e) => setResult({ ...result, subject: e.target.value })}
                                    />
                                    <button
                                        onClick={() => handleCopy(result.subject)}
                                        className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-100 text-slate-500"
                                    >
                                        Copy
                                    </button>
                                </div>

                                {/* Body Area */}
                                <div className="p-4 relative">
                                    <textarea
                                        className="w-full min-h-[300px] text-sm leading-relaxed text-slate-700 outline-none resize-y"
                                        value={result.body}
                                        onChange={(e) => setResult({ ...result, body: e.target.value })}
                                    />

                                    <div className="absolute bottom-4 right-4">
                                        <button
                                            onClick={() => handleCopy(result.body)}
                                            className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-slate-700 hover:scale-105 transition-all flex items-center gap-1"
                                        >
                                            <span>📋</span> 本文をコピー
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-[10px] text-slate-400">
                                ※ 必ず内容を確認・修正してから送信してください
                            </p>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
