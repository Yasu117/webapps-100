"use client";

import React, { useState } from "react";
import {
    Building2,
    Briefcase,
    Banknote,
    UserPlus,
    Wand2,
    Copy,
    Check,
    RefreshCw,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function JobDescriptionPage() {
    const [formData, setFormData] = useState({
        companyName: "",
        jobType: "",
        salary: "",
        targetPersona: "",
    });
    const [result, setResult] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const generateJobDescription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.targetPersona) {
            alert("求める人物像などを入力してください");
            return;
        }

        setIsLoading(true);
        setResult("");

        try {
            const response = await fetch("/api/job-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("API request failed");

            const data = await response.json();
            setResult(data.text);
        } catch (error) {
            console.error(error);
            alert("生成に失敗しました。もう一度お試しください。");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // サンプルデータ入力
    const fillSample = () => {
        setFormData({
            companyName: "株式会社ネクストイノベーション",
            jobType: "Webエンジニア",
            salary: "年収500〜800万円",
            targetPersona: "React/Next.jsの実務経験がある方。新しい技術が好きで、自社サービスの改善に積極的に関わりたい人。リモートワーク推奨。",
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 左側：入力フォーム */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <header>
                        <div className="text-sm font-bold text-blue-400 mb-1">App 026</div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            求人票メーカー AI
                        </h1>

                        <div className="bg-slate-900/50 p-4 rounded-xl text-sm text-slate-400 border border-slate-800">
                            <h3 className="font-bold text-slate-200 mb-2">使い方</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>会社名、職種、給与、そして<strong>「求める人物像」</strong>のメモを入力してください。</li>
                                <li>AIがターゲットに響く魅力的な文章に整形して出力します。</li>
                                <li>右下のボタンでコピーして、実際の求人媒体などにご利用ください。</li>
                            </ul>
                        </div>
                    </header>

                    <form onSubmit={generateJobDescription} className="space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-lg">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                                <Building2 size={14} /> 会社名
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="例: 株式会社〇〇"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                                    <Briefcase size={14} /> 募集職種
                                </label>
                                <input
                                    type="text"
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleChange}
                                    placeholder="例: Webデザイナー"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                                    <Banknote size={14} /> 給与イメージ
                                </label>
                                <input
                                    type="text"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="例: 月給30万〜"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <UserPlus size={14} /> 求める人物像 / メモ
                                </label>
                                <button
                                    type="button"
                                    onClick={fillSample}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                                >
                                    サンプルを入力
                                </button>
                            </div>
                            <textarea
                                name="targetPersona"
                                value={formData.targetPersona}
                                onChange={handleChange}
                                rows={6}
                                placeholder="・経験3年以上&#13;&#10;・明るく元気な人&#13;&#10;・残業は少なめ&#13;&#10;...など箇条書きでOK"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition leading-relaxed"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold font-lg shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="animate-spin" /> 生成中...
                                </>
                            ) : (
                                <>
                                    <Wand2 /> AIで求人票を作成
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* 右側：生成結果 */}
                <div className="flex flex-col h-full min-h-[50vh]">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-slate-300">プレビュー</h2>
                        {result && (
                            <button
                                onClick={copyToClipboard}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isCopied
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                    }`}
                            >
                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                {isCopied ? "コピーしました" : "コピー"}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 bg-white text-slate-800 rounded-xl p-6 md:p-8 shadow-xl overflow-y-auto border border-slate-200">
                        {result ? (
                            <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-indigo-900 prose-headings:font-bold prose-p:text-slate-700 prose-li:text-slate-700">
                                <ReactMarkdown>{result}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Wand2 size={32} className="text-slate-300" />
                                </div>
                                <p className="text-sm">左側のフォームに入力して作成してください</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
