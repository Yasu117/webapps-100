
"use client";

import React, { useState } from "react";
import { ArrowLeft, Atom, HelpCircle, AlertCircle, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

type Question = {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
};

export default function AIQuizGenerator() {
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("普通");
    const [quizData, setQuizData] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // States: 'input' -> 'playing' -> 'result'
    const [status, setStatus] = useState<"input" | "playing" | "result">("input");

    const startQuiz = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        setQuizData([]);

        try {
            const res = await fetch("/api/ai-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, difficulty }),
            });
            const data = await res.json();

            let parsed = [];
            try {
                parsed = JSON.parse(data.result);
            } catch (e) {
                console.error("JSON parse error", e);
                // Fallback or retry logic could go here
            }

            if (Array.isArray(parsed) && parsed.length > 0) {
                setQuizData(parsed);
                setCurrentIndex(0);
                setScore(0);
                setStatus("playing");
                setIsFinished(false);
                setSelectedOption(null);
                setShowExplanation(false);
            } else {
                alert("クイズの生成に失敗しました。別のテーマで試してください。");
            }
        } catch (e) {
            console.error(e);
            alert("エラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswer = (option: string) => {
        if (showExplanation) return;

        setSelectedOption(option);
        setShowExplanation(true);
        if (option === quizData[currentIndex].answer) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < quizData.length - 1) {
            setCurrentIndex(i => i + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setStatus("result");
        }
    };

    const reset = () => {
        setStatus("input");
        setTopic("");
        setQuizData([]);
    };

    return (
        <div className="min-h-screen bg-indigo-50 text-slate-800 font-sans">
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden bg-white shadow-2xl sm:rounded-3xl sm:my-8 sm:min-h-[800px]">
                {/* Header */}
                <div className="bg-indigo-600 p-4 text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
                    <Link href="/apps" className="p-2 -ml-2 hover:bg-indigo-500 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        <Atom size={20} /> AIクイズ
                    </h1>
                    <div className="w-8" />
                </div>

                <div className="flex-1 overflow-y-auto p-6 relative">

                    {/* INPUT SCREEN */}
                    {status === "input" && (
                        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 h-full justify-center">
                            <div className="text-center mb-4">
                                <div className="inline-block p-4 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                                    <HelpCircle size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">クイズを作ろう</h2>
                                <p className="text-slate-500 mt-2">好きなテーマ入力すると、AIが即座にクイズを出題します。</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">テーマ</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="例: 日本の歴史、ポケモン、分子生物学..."
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">難易度</label>
                                <div className="flex gap-2">
                                    {["簡単", "普通", "難しい", "マニアック"].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all
                         ${difficulty === level ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button
                                    onClick={startQuiz}
                                    disabled={isLoading || !topic.trim()}
                                    className="w-full py-4 bg-indigo-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "クイズ開始！"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PLAYING SCREEN */}
                    {status === "playing" && quizData.length > 0 && (
                        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-center mb-6 text-sm font-bold text-slate-400">
                                <span>Q.{currentIndex + 1}</span>
                                <span>{currentIndex + 1} / {quizData.length}</span>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 leading-relaxed">
                                    {quizData[currentIndex].question}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {quizData[currentIndex].options.map((option, idx) => {
                                    let stateStyles = "bg-white border-2 border-slate-200 hover:border-indigo-300";
                                    const isSelected = selectedOption === option;
                                    const isAnswer = option === quizData[currentIndex].answer;

                                    if (showExplanation) {
                                        if (isAnswer) stateStyles = "bg-green-50 border-green-500 text-green-700 font-bold";
                                        else if (isSelected && !isAnswer) stateStyles = "bg-red-50 border-red-500 text-red-700 opacity-60";
                                        else stateStyles = "bg-slate-50 border-slate-100 text-slate-400";
                                    } else if (isSelected) {
                                        stateStyles = "border-indigo-500 bg-indigo-50";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option)}
                                            disabled={showExplanation}
                                            className={`w-full p-4 rounded-xl text-left transition-all relative ${stateStyles}`}
                                        >
                                            {option}
                                            {showExplanation && isAnswer && <CheckCircle className="absolute right-4 top-4 text-green-500" size={20} />}
                                            {showExplanation && isSelected && !isAnswer && <XCircle className="absolute right-4 top-4 text-red-500" size={20} />}
                                        </button>
                                    );
                                })}
                            </div>

                            {showExplanation && (
                                <div className="mt-6 p-4 bg-indigo-50 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                    <p className="font-bold text-indigo-900 mb-1">解説</p>
                                    <p className="text-sm text-indigo-800 leading-relaxed">
                                        {quizData[currentIndex].explanation}
                                    </p>
                                    <button
                                        onClick={nextQuestion}
                                        className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md active:scale-95 transition-all"
                                    >
                                        {currentIndex < quizData.length - 1 ? "次の問題へ" : "結果を見る"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* RESULT SCREEN */}
                    {status === "result" && (
                        <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 duration-500">
                            <div className="mb-6 relative">
                                <div className="w-32 h-32 rounded-full border-8 border-indigo-100 flex items-center justify-center bg-white shadow-xl text-5xl font-bold text-indigo-600">
                                    {score}
                                    <span className="text-lg text-slate-400 mt-4">/{quizData.length}</span>
                                </div>
                                {score === quizData.length && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-2 rounded-full shadow-lg rotate-12">
                                        <Sparkles size={24} />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                {score === quizData.length ? "全問正解！すごい！" : score >= quizData.length / 2 ? "Nice Job!" : "おしい！"}
                            </h2>
                            <p className="text-slate-500 mb-8">テーマ: {topic}</p>

                            <button
                                onClick={reset}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all"
                            >
                                <RefreshCw size={20} /> もう一度遊ぶ
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
