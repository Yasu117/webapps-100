'use client';

import React, { useState, useEffect, useRef } from 'react';

// --- Types ---
type Technique = {
    id: string;
    name: string;
    description: string;
    inhale: number; // seconds
    hold1: number;
    exhale: number;
    hold2: number;
    color: string;
};

const TECHNIQUES: Technique[] = [
    {
        id: 'relax',
        name: '4-7-8 Relax',
        description: 'Deep relaxation & sleep aid',
        inhale: 4,
        hold1: 7,
        exhale: 8,
        hold2: 0,
        color: 'from-blue-400 to-indigo-500'
    },
    {
        id: 'box',
        name: 'Box Breathing',
        description: 'Focus & stress relief',
        inhale: 4,
        hold1: 4,
        exhale: 4,
        hold2: 4,
        color: 'from-emerald-400 to-teal-500'
    },
    {
        id: 'coherent',
        name: 'Coherent',
        description: 'Balance & heart health',
        inhale: 5.5,
        hold1: 0,
        exhale: 5.5,
        hold2: 0,
        color: 'from-rose-300 to-purple-400'
    },
];

type Phase = 'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2';

export default function ZenBreathPage() {
    const [activeTechniqueId, setActiveTechniqueId] = useState('relax');
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<Phase>('idle');
    const [timerDisplay, setTimerDisplay] = useState(0);
    const [showHelp, setShowHelp] = useState(false);

    const technique = TECHNIQUES.find(t => t.id === activeTechniqueId) || TECHNIQUES[0];
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clean up
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
        };
    }, []);

    const stop = () => {
        setIsActive(false);
        setPhase('idle');
        setTimerDisplay(0);
        if (timerRef.current) clearInterval(timerRef.current);
        if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    };

    const startCycle = () => {
        if (!isActive) return;

        const runPhase = (p: Phase, duration: number, next: () => void) => {
            setPhase(p);
            // Count down logic for display if needed? 
            // Or just a progress ring? Let's keep it simple visual first.

            phaseTimeoutRef.current = setTimeout(() => {
                next();
            }, duration * 1000);
        };

        // Cycle Logic
        // Inhale -> Hold1 -> Exhale -> Hold2 -> (Repeat)

        const doInhale = () => {
            if (!isActive) return; // check again inside async
            runPhase('inhale', technique.inhale, doHold1);
        };

        const doHold1 = () => {
            if (!isActive) return;
            if (technique.hold1 > 0) {
                runPhase('hold1', technique.hold1, doExhale);
            } else {
                doExhale();
            }
        };

        const doExhale = () => {
            if (!isActive) return;
            runPhase('exhale', technique.exhale, doHold2);
        };

        const doHold2 = () => {
            if (!isActive) return;
            if (technique.hold2 > 0) {
                runPhase('hold2', technique.hold2, doInhale);
            } else {
                doInhale();
            }
        };

        doInhale();
    };

    // Effect to start/stop loop
    // Note: The recursive functions above capture 'technique', so if technique changes while active, it might be weird.
    // Better to stop when technique changes.
    useEffect(() => {
        if (isActive) {
            startCycle();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]); // Don't re-trigger on technique change automatically, user must restart.

    const toggleActive = () => {
        if (isActive) {
            stop();
        } else {
            setIsActive(true);
        }
    };

    const handleTechniqueChange = (id: string) => {
        stop();
        setActiveTechniqueId(id);
    };

    // Dynamic Styles for Animation
    // We use transition-all for smooth scaling
    const getCircleStyle = () => {
        switch (phase) {
            case 'idle':
                return { transform: 'scale(1)', opacity: 0.5 };
            case 'inhale':
                return { transform: 'scale(1.5)', transition: `transform ${technique.inhale}s ease-in-out` };
            case 'hold1':
                return { transform: 'scale(1.5)', transition: `transform 0.1s` }; // stay 
            case 'exhale':
                return { transform: 'scale(1)', transition: `transform ${technique.exhale}s ease-in-out` };
            case 'hold2':
                return { transform: 'scale(1)', transition: `transform 0.1s` }; // stay
        }
    };

    const getInstructionText = () => {
        switch (phase) {
            case 'idle': return 'Tap to Start';
            case 'inhale': return 'Inhale';
            case 'hold1': return 'Hold';
            case 'exhale': return 'Exhale';
            case 'hold2': return 'Hold';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col items-center justify-between pb-10">
            {/* Header */}
            <header className="px-5 py-6 w-full flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent flex items-center gap-2">
                        <span className="text-slate-600 font-mono text-base mr-1">019</span>
                        Zen Breath
                    </h1>
                </div>
                <button
                    onClick={() => setShowHelp(true)}
                    className="w-8 h-8 rounded-full border border-slate-700 text-slate-500 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Help"
                >
                    ?
                </button>
            </header>

            {/* Main Circle Area */}
            <main className="flex-1 flex flex-col items-center justify-center w-full relative">

                {/* Ambient Glow Background */}
                <div className={`absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br ${technique.color} opacity-10 blur-3xl transition-colors duration-1000 -z-10`}></div>

                {/* Breathing Circle Container */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Ring Guide (Static) */}
                    <div className="absolute inset-0 rounded-full border-2 border-slate-800/50"></div>

                    {/* Animated Circle */}
                    <div
                        className={`absolute w-32 h-32 rounded-full bg-gradient-to-tr ${technique.color} shadow-lg shadow-white/5 opacity-90 backdrop-blur-md flex items-center justify-center transition-all ease-in-out will-change-transform`}
                        style={getCircleStyle()}
                    >
                    </div>

                    {/* Text Overlay */}
                    <div className="z-10 text-center pointer-events-none">
                        <div className={`text-2xl font-bold tracking-widest uppercase transition-opacity duration-300 ${phase === 'idle' ? 'animate-pulse text-white' : 'text-white'}`}>
                            {getInstructionText()}
                        </div>
                        {isActive && (
                            <div className="text-xs font-mono text-white/60 mt-2 tracking-wide uppercase">
                                {technique.name}
                            </div>
                        )}
                    </div>
                </div>

                {/* Start Button Overlay (Invisible but clickable area if desired, or explicit button) */}
                {!isActive && (
                    <button
                        onClick={toggleActive}
                        className="absolute inset-0 z-20 cursor-pointer"
                        aria-label="Start Breathing Guidance"
                    ></button>
                )}

                {/* Stop Button (Visible only when active) */}
                {isActive && (
                    <button
                        onClick={stop}
                        className="mt-16 px-8 py-2 rounded-full border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 hover:text-white transition-colors animate-in fade-in slide-in-from-bottom-4"
                    >
                        Stop Session
                    </button>
                )}

            </main>

            {/* Technique Selector */}
            <section className="w-full max-w-md px-6 mb-8">
                <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-2 flex items-center justify-between border border-slate-800">
                    {TECHNIQUES.map(t => {
                        const isSelected = activeTechniqueId === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => handleTechniqueChange(t.id)}
                                disabled={isActive && isSelected}
                                className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all duration-300 ${isSelected
                                    ? `bg-slate-800 text-white shadow-lg shadow-black/20`
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {t.name.split(' ')[0]} {/* Show short name */}
                            </button>
                        );
                    })}
                </div>

                {/* Technique Description */}
                <div className="mt-4 text-center h-12">
                    <h3 className="text-slate-200 font-bold text-sm mb-1">{technique.name}</h3>
                    <p className="text-slate-500 text-xs">{technique.description}</p>
                </div>
            </section>

            {/* Help Modal */}
            {showHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                            <span className="text-2xl">🌿</span> About & Usage
                        </h3>

                        <div className="space-y-6 text-slate-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                            <section>
                                <h4 className="text-emerald-400 font-bold mb-2 text-xs uppercase tracking-wider">概要</h4>
                                <p>忙しい日常を忘れ、心を落ち着けるための深呼吸ガイドです。視覚的なアニメーションに合わせて呼吸を整えます。</p>
                            </section>

                            <section>
                                <h4 className="text-sky-400 font-bold mb-2 text-xs uppercase tracking-wider">使い方</h4>
                                <ol className="list-decimal list-inside space-y-1 text-slate-400 marker:text-slate-600">
                                    <li>画面中央の円をタップして開始</li>
                                    <li>円の動きに合わせて<strong>吸う・止める・吐く</strong></li>
                                    <li>下のボタンで呼吸法を切り替え</li>
                                </ol>
                            </section>

                            <section>
                                <h4 className="text-purple-400 font-bold mb-2 text-xs uppercase tracking-wider">呼吸法について</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <strong className="text-slate-200 block text-xs">4-7-8 Relax</strong>
                                        <span className="text-xs text-slate-500">副交感神経を優位にし、深いリラックスと睡眠導入を助けます。</span>
                                    </li>
                                    <li>
                                        <strong className="text-slate-200 block text-xs">Box Breathing</strong>
                                        <span className="text-xs text-slate-500">吸う・止める・吐く・止めるを均等に行い、集中力を高めます。米軍でも採用されています。</span>
                                    </li>
                                    <li>
                                        <strong className="text-slate-200 block text-xs">Coherent</strong>
                                        <span className="text-xs text-slate-500">「共鳴呼吸」とも呼ばれ、心拍変動を整えて自律神経のバランスを回復させます。</span>
                                    </li>
                                </ul>
                            </section>
                        </div>

                        <button
                            onClick={() => setShowHelp(false)}
                            className="w-full mt-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl font-bold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
