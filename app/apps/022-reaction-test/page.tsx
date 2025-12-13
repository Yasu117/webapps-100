'use client';

import React, { useState, useRef } from 'react';

type State = 'idle' | 'waiting' | 'ready' | 'result' | 'early';

export default function ReactionTestPage() {
    const [state, setState] = useState<State>('idle');
    const [ms, setMs] = useState(0);
    const [history, setHistory] = useState<number[]>([]);
    const startTimeRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startTest = () => {
        setState('waiting');
        const delay = 2000 + Math.random() * 3000; // 2-5 seconds random delay

        timeoutRef.current = setTimeout(() => {
            setState('ready');
            startTimeRef.current = Date.now();
        }, delay);
    };

    const handleClick = () => {
        if (state === 'idle') {
            startTest();
        } else if (state === 'waiting') {
            // Early click
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setState('early');
        } else if (state === 'ready') {
            // Success
            const endTime = Date.now();
            const time = endTime - startTimeRef.current;
            setMs(time);
            setState('result');
            setHistory(prev => [time, ...prev].slice(0, 5));
        } else if (state === 'result' || state === 'early') {
            startTest();
        }
    };

    // Dynamic Styles
    const getStyles = () => {
        switch (state) {
            case 'idle':
                return 'bg-slate-800 text-white border-slate-700';
            case 'waiting':
                return 'bg-red-600 text-white border-red-500';
            case 'ready':
                return 'bg-emerald-500 text-white border-emerald-400 cursor-pointer active:scale-95';
            case 'result':
                return 'bg-slate-800 text-white border-slate-700';
            case 'early':
                return 'bg-amber-600 text-white border-amber-500';
            default:
                return 'bg-slate-800';
        }
    };

    const getContent = () => {
        switch (state) {
            case 'idle':
                return (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="text-6xl mb-4">⚡️</div>
                        <h2 className="text-2xl font-bold mb-2">Reaction Test</h2>
                        <p className="text-slate-400">Tap anywhere to start.</p>
                        <p className="text-slate-400 text-xs mt-1">Wait for green, then tap fast!</p>
                    </div>
                );
            case 'waiting':
                return (
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-pulse">🔴</div>
                        <h2 className="text-3xl font-bold">Wait for Green...</h2>
                    </div>
                );
            case 'ready':
                return (
                    <div className="text-center scale-110 transition-transform">
                        <div className="text-8xl mb-4">🟢</div>
                        <h2 className="text-4xl font-black uppercase tracking-widest">TAP NOW!</h2>
                    </div>
                );
            case 'result':
                return (
                    <div className="text-center animate-in zoom-in duration-200">
                        <div className="text-6xl mb-4">⏱️</div>
                        <h2 className="text-5xl font-black mb-2 tabular-nums">{ms} <span className="text-2xl font-bold text-slate-400">ms</span></h2>
                        <p className="text-slate-400 font-bold">Tap to try again</p>
                    </div>
                );
            case 'early':
                return (
                    <div className="text-center animate-shake">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold mb-2">Too Soon!</h2>
                        <p className="font-medium opacity-90">Tap to try again</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
            {/* Header */}
            <header className="px-5 py-4 flex items-center justify-between absolute top-0 w-full z-10 pointer-events-none">
                <h1 className="text-xl font-bold text-white/50 flex items-center gap-2">
                    <span className="font-mono text-sm">022</span>
                    Reaction Test
                </h1>
            </header>

            {/* Click Area (Full Screen) */}
            <div
                onPointerDown={handleClick}
                className={`flex-1 flex flex-col items-center justify-center p-6 transition-colors duration-200 select-none touch-manipulation cursor-pointer ${getStyles()}`}
            >
                {getContent()}
            </div>

            {/* History Sheet */}
            {history.length > 0 && (state === 'idle' || state === 'result') && (
                <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-xl max-w-xs w-full animate-in slide-in-from-bottom-5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 text-center">Recent Scores</h3>
                        <div className="flex justify-center gap-2">
                            {history.map((h, i) => (
                                <div key={i} className={`text-center ${i === 0 ? 'text-emerald-400 font-bold' : 'text-slate-400 text-sm'}`}>
                                    {h}<span className="text-[10px] opacity-70">ms</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
