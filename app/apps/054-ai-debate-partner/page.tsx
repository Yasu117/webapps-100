
"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, User, Bot, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function AiDebatePartner() {
    const [topic, setTopic] = useState("");
    const [side, setSide] = useState<"肯定" | "否定">("肯定"); // User's side
    const [started, setStarted] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startDebate = () => {
        if (!topic.trim()) return;
        setStarted(true);
        // Initial greeting from AI
        setMessages([{
            role: "assistant",
            content: `承知しました。テーマ「${topic}」について、私は${side === "肯定" ? "否定" : "肯定"}側の立場から議論します。\nあなたの意見を聞かせてください。`
        }]);
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ai-debate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    side,
                    userMessage: userMsg.content,
                    history: messages
                }),
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: "assistant", content: data.result }]);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: "assistant", content: "すみません、少し考えがまとまりませんでした。もう一度お願いします。" }]);
        } finally {
            setLoading(false);
        }
    };

    if (!started) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 p-4 flex flex-col items-center justify-center max-w-md mx-auto">
                <Link href="/apps" className="absolute top-4 left-4 text-slate-400 hover:text-white">
                    <ArrowLeft />
                </Link>
                <div className="w-full space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                            AI Debate Partner
                        </h1>
                        <p className="text-slate-400 text-sm mb-4">どんなテーマでも論破します（たぶん）</p>
                        <div className="bg-slate-800/80 p-3 rounded-lg text-xs text-slate-300 inline-block border border-slate-700">
                            <span className="font-bold text-blue-400 mr-2">#054</span>
                            テーマと立場を決めてください。AIが反論してくるので、論破を目指して議論しましょう。
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">テーマ</label>
                            <input
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="例: きのこ vs たけのこ"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-2">あなたの立場</label>
                            <div className="flex gap-2">
                                {["肯定", "否定"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSide(s as any)}
                                        className={clsx(
                                            "flex-1 py-3 rounded-lg font-bold border transition-all",
                                            side === s
                                                ? "bg-blue-600 border-blue-500 text-white"
                                                : "bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700"
                                        )}
                                    >
                                        {s}派
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={startDebate}
                            disabled={!topic.trim()}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
                        >
                            討論開始
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
            <header className="flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800 shrink-0">
                <button onClick={() => setStarted(false)} className="text-slate-400 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                    <div className="text-xs text-slate-400">Theme</div>
                    <div className="font-bold text-sm truncate max-w-[200px]">{topic}</div>
                </div>
                <button onClick={startDebate} className="text-slate-400 hover:text-white">
                    <RefreshCw size={18} />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={clsx("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                        <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            msg.role === "user" ? "bg-slate-700" : "bg-blue-600"
                        )}>
                            {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={clsx(
                            "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                            msg.role === "user"
                                ? "bg-slate-800 text-slate-100 rounded-tr-none"
                                : "bg-blue-900/30 border border-blue-800 text-slate-200 rounded-tl-none"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <Bot size={14} />
                        </div>
                        <div className="bg-blue-900/30 border border-blue-800 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex gap-2 max-w-2xl mx-auto"
                >
                    <input
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="反論を入力..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
                    >
                        <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
                    </button>
                </form>
            </footer>
        </div>
    );
}
