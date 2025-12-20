'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VoiceMemoPage() {
    // --- State ---
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Result States
    const [summary, setSummary] = useState('');
    const [todos, setTodos] = useState<string[]>([]);
    const [mindmap, setMindmap] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'summary' | 'todo' | 'mindmap'>('summary');

    const recognitionRef = useRef<any>(null);

    // --- Effects ---
    useEffect(() => {
        // Initialize SpeechRecognition
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'ja-JP';

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (finalTranscript) {
                        setTranscript(prev => prev + finalTranscript + ' ');
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    if (event.error === 'not-allowed') {
                        alert('マイクの使用が許可されていません');
                        setIsRecording(false);
                    }
                };

                recognition.onend = () => {
                    // If we want it to stay on until manually stopped, we might need to restart it here,
                    // but usually `continuous = true` handles pauses. 
                    // If it stops unexpectedly, we update state.
                    // However, for better UX, let's keep it simple: stop means stop.
                    if (isRecording) { // If it stopped but state is recording, try to restart only if intended?
                        // For now, let UI reflect it stopped if it really died.
                        // specialized logic often needed here for rock-solid restart.
                    }
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    // --- Handlers ---
    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert('このブラウザは音声認識に対応していません。Google Chromeなどをご利用ください。');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleProcess = async () => {
        if (!transcript.trim()) return;

        setIsProcessing(true);
        try {
            const res = await fetch('/api/voice/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: transcript })
            });

            if (!res.ok) throw new Error('API Error');

            const data = await res.json();
            setSummary(data.summary);
            setTodos(data.todos);
            setMindmap(data.mindmap);
            setActiveTab('summary'); // Switch to summary view

        } catch (e) {
            console.error(e);
            alert('要約に失敗しました');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input value to allow re-uploading the same file if needed
        e.target.value = '';

        if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
            // Text file: Read and set to transcript
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target?.result as string;
                setTranscript(prev => prev + (prev ? '\n' : '') + text);
            };
            reader.readAsText(file);
        } else if (file.type.startsWith('audio/')) {
            // Audio file: Send to API
            if (file.size > 4 * 1024 * 1024) { // Check for rough limit (4MB) due to serverless limits
                alert('ファイルサイズが大きすぎます（目安4MB以下）。短い音声のみ対応しています。');
                return;
            }

            setIsProcessing(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/voice/analyze-file', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('API Error');

                const data = await res.json();

                // Update all states
                setTranscript(data.transcript); // Replace transcript with the accurate one from audio
                setSummary(data.summary);
                setTodos(data.todos);
                setMindmap(data.mindmap);
                setActiveTab('summary');

            } catch (error) {
                console.error(error);
                alert('音声ファイルの解析に失敗しました。');
            } finally {
                setIsProcessing(false);
            }
        } else {
            alert('対応していないファイル形式です（対応: テキスト, 音声）');
        }
    };

    const handleClear = () => {
        if (confirm('内容をクリアしますか？')) {
            setTranscript('');
            setSummary('');
            setTodos([]);
            setMindmap([]);
        }
    };

    // --- Render Components ---
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            {/* Mobile Container */}
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative flex flex-col">

                {/* Header */}
                <header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h1 className="text-lg font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                        012 AI Voice Memo
                    </h1>
                    <div className="flex items-center gap-2">
                        <label className="cursor-pointer p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 rounded-full transition-colors">
                            <input type="file" accept="audio/*, .txt, .md" className="hidden" onChange={handleFileUpload} />
                            <span className="text-lg">📎</span>
                        </label>
                        <button onClick={handleClear} className="text-xs font-bold text-slate-400 hover:text-rose-500 px-2 py-1 rounded-md active:bg-slate-100">
                            クリア
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">

                    {/* Description */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-500 leading-relaxed">
                        <p>
                            <span className="font-bold text-indigo-500">使い方:</span> 下のマイクボタンを押して話すか、テキストを入力してください。AIが自動で<span className="font-bold">「要約・ToDo・マインドマップ」</span>を作成します。
                        </p>
                    </div>

                    {/* Transcript Area */}
                    <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transcript</label>
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="マイクボタンを押して話すか、ここに入力してください..."
                            className="w-full h-full flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all shadow-inner"
                        />
                    </div>

                    {/* Action Area (Processed) */}
                    {(summary || todos.length > 0) && (
                        <div className="bg-indigo-50 rounded-2xl p-1 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Tabs */}
                            <div className="flex p-1 gap-1 mb-2 bg-indigo-100/50 rounded-xl">
                                {(['summary', 'todo', 'mindmap'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-500 hover:text-indigo-500'
                                            }`}
                                    >
                                        {tab === 'summary' && '要約'}
                                        {tab === 'todo' && 'ToDo'}
                                        {tab === 'mindmap' && 'Map'}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-xl p-4 min-h-[200px] shadow-sm border border-indigo-50">
                                {activeTab === 'summary' && (
                                    <div className="prose prose-sm prose-indigo leading-relaxed text-sm text-slate-700 whitespace-pre-wrap">
                                        {summary}
                                    </div>
                                )}
                                {activeTab === 'todo' && (
                                    <ul className="space-y-3">
                                        {todos.map((todo, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <span className="text-indigo-500 font-bold mt-0.5">☐</span>
                                                {todo}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {activeTab === 'mindmap' && (
                                    <div className="pl-2 border-l-2 border-indigo-100 space-y-2">
                                        {mindmap.map((node, i) => (
                                            <div key={i} className={`text-sm text-slate-700 py-1 ${node.startsWith('- ') ? 'pl-4 text-slate-500 text-xs' : 'font-bold'}`}>
                                                {node.replace(/^-\s/, '• ')}
                                            </div>
                                        ))}
                                        {mindmap.length === 0 && <p className="text-xs text-slate-400">マインドマップデータがありません</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer Controls */}
                <div className="sticky bottom-0 bg-white/80 backdrop-blur p-4 border-t border-slate-100 pb-8 safe-area-bottom">
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={toggleRecording}
                            className={`relative group flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isRecording
                                ? 'bg-rose-500 shadow-lg shadow-rose-500/30 scale-110'
                                : 'bg-slate-800 hover:bg-slate-700 shadow-lg shadow-slate-800/20'
                                }`}
                        >
                            {isRecording ? (
                                <>
                                    <span className="absolute w-full h-full rounded-full bg-rose-500 animate-ping opacity-20"></span>
                                    <span className="w-4 h-4 bg-white rounded-sm"></span>
                                </>
                            ) : (
                                <span className="text-2xl">🎙️</span>
                            )}
                        </button>

                        <button
                            onClick={handleProcess}
                            disabled={isProcessing || !transcript}
                            className={`flex-1 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isProcessing || !transcript
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 active:scale-[0.98]'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    解析中...
                                </>
                            ) : (
                                <>
                                    <span>✨ AIで要約・Action化</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
