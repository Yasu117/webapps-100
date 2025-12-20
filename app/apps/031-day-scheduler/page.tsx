"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Sparkles, Mic, MicOff } from "lucide-react";

export default function DayScheduler() {
    const [tasks, setTasks] = useState("");
    const [constraints, setConstraints] = useState("");
    const [schedule, setSchedule] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRecording, setIsRecording] = useState(false);

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("お使いのブラウザは音声入力をサポートしていません。Google Chromeなどをご利用ください。");
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTasks((prev) => prev + (prev ? "\n" : "") + transcript);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
                alert("マイクの使用が許可されていません。ブラウザの設定でマイクへのアクセスを許可してください。");
            } else if (event.error === 'no-speech') {
                // 音声が検出されなかった場合は何もしない（停止するだけ）
            } else {
                alert(`音声認識エラーが発生しました: ${event.error}`);
            }
        };

        recognition.start();
    };

    const generateSchedule = async () => {
        if (!tasks.trim()) {
            setError("やりたいこと（タスク）を入力してください。");
            return;
        }
        setLoading(true);
        setError("");
        setSchedule("");

        try {
            const res = await fetch("/api/day-scheduler", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tasks, constraints }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "スケジュールの生成に失敗しました。");
            }

            const data = await res.json();
            setSchedule(data.result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/apps" className="text-slate-400 hover:text-white transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        AI Day Scheduler
                    </h1>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-emerald-400 flex items-center gap-2">
                                    <Sparkles size={16} />
                                    今日やりたいこと (Tasks)
                                </label>
                                <button
                                    onClick={handleVoiceInput}
                                    className={`p-2 rounded-full transition-all ${isRecording
                                        ? "bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/50"
                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-emerald-400"
                                        }`}
                                    title="音声で入力"
                                >
                                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>
                            </div>
                            <textarea
                                className="w-full h-40 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-500 resize-none transition"
                                placeholder={`例：\n- 企画書のドラフト作成 (2時間)\n- 銀行に行く\n- ジムで運動する\n- 夕食の買い物`}
                                value={tasks}
                                onChange={(e) => setTasks(e.target.value)}
                            />
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
                            <label className="block text-sm font-medium text-cyan-400 mb-2 flex items-center gap-2">
                                <Clock size={16} />
                                既存の予定・制約
                            </label>
                            <textarea
                                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder-slate-500 resize-none transition"
                                placeholder={`例：\n10:00 - 11:30 定例MTG\n13:00 - 14:00 ランチ`}
                                value={constraints}
                                onChange={(e) => setConstraints(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={generateSchedule}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-[1.02] active:scale-[0.98] ${loading
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-emerald-500/20"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    AIが計画中...
                                </>
                            ) : (
                                <>
                                    <Calendar size={20} />
                                    スケジュールを作成
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Output Section */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-cyan-500/5 rounded-3xl blur-xl" />
                        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[500px] shadow-2xl overflow-y-auto max-h-[800px]">
                            {schedule ? (
                                <div className="prose prose-invert prose-emerald max-w-none">
                                    <ReactMarkdown>{schedule}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                    <Calendar size={64} className="opacity-20" />
                                    <p className="text-sm">ここに完成したスケジュールが表示されます</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
