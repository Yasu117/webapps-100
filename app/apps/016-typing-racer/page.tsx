'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// --- Types ---
type Mora = string[]; // e.g., ['tsu', 'tu']
type WordDef = {
    display: string;
    moras: Mora[];
};

// --- Constants (Extended Word List) ---
// Using array of possible romanizations for each mora/chunk
const WORD_LIST_SRC: WordDef[] = [
    // Basics
    { display: "変数", moras: [['he'], ['n', 'nn'], ['su'], ['u']] },
    { display: "関数", moras: [['ka'], ['n', 'nn'], ['su'], ['u']] },
    { display: "配列", moras: [['ha'], ['i'], ['re'], ['tsu', 'tu']] },
    { display: "要素", moras: [['yo'], ['u'], ['so']] },
    { display: "引数", moras: [['hi'], ['ki'], ['su'], ['u']] },
    { display: "戻り値", moras: [['mo'], ['do'], ['ri'], ['chi', 'ti']] },
    { display: "整数", moras: [['se'], ['i'], ['su'], ['u']] },
    { display: "文字列", moras: [['mo'], ['ji', 'zi'], ['re'], ['tsu', 'tu']] },

    // Logic
    { display: "条件分岐", moras: [['jo', 'zyo', 'jyo'], ['u'], ['ke'], ['n', 'nn'], ['bu'], ['n', 'nn'], ['ki']] }, // joukenbunki
    { display: "繰り返し", moras: [['ku'], ['ri'], ['ka'], ['e'], ['shi', 'si']] },
    { display: "例外処理", moras: [['re'], ['i'], ['ga'], ['i'], ['sho', 'syo'], ['ri']] },
    { display: "非同期", moras: [['hi'], ['do'], ['u'], ['ki']] }, // hidouki
    { display: "依存関係", moras: [['i'], ['zo'], ['n', 'nn'], ['ka'], ['n', 'nn'], ['ke'], ['i']] }, // izonkankei

    // Architecture & Dev
    { display: "設計", moras: [['se'], ['k', 'ck', 'c'], ['ke'], ['i']] }, // sekkei
    { display: "通信", moras: [['tsu', 'tu'], ['u'], ['shi', 'si'], ['n', 'nn']] }, // tsuushin
    { display: "画面", moras: [['ga'], ['me'], ['n', 'nn']] },
    { display: "開発", moras: [['ka'], ['i'], ['ha'], ['tsu', 'tu']] },
    { display: "技術", moras: [['gi'], ['ju', 'zyu', 'jyu'], ['tsu', 'tu']] },
    { display: "環境", moras: [['ka'], ['n', 'nn'], ['kyo', 'kyou'], ['u']] }, // kankyou
    { display: "初期化", moras: [['sho', 'syo'], ['ki'], ['ka']] },
    { display: "構造体", moras: [['ko'], ['u'], ['zo'], ['u'], ['ta'], ['i']] }, // kouzoutai

    // Advanced
    { display: "可読性", moras: [['ka'], ['do'], ['ku'], ['se'], ['i']] },
    { display: "保守性", moras: [['ho'], ['shu', 'syu'], ['se'], ['i']] },
    { display: "脆弱性", moras: [['ze'], ['i'], ['ja', 'zya', 'jya'], ['ku'], ['se'], ['i']] }, // zeijyakusei
    { display: "暗号化", moras: [['a'], ['n', 'nn'], ['go'], ['u'], ['ka']] }, // angouka
    { display: "認証", moras: [['ni'], ['n', 'nn'], ['sho', 'syo'], ['u']] }, // ninshou
    { display: "継承", moras: [['ke'], ['i'], ['sho', 'syo'], ['u']] }, // keishou
    { display: "多態性", moras: [['ta'], ['ta'], ['i'], ['se'], ['i']] }, // tataisei
    { display: "仮想化", moras: [['ka'], ['so'], ['u'], ['ka']] }, // kasouka
];

// Special handling for sokuon (っ) is complicated in pure mora array.
// Correct approach: define full romanization strings, but that requires parsing "chi" vs "ti".
// Current array approach works well if sokuon is manual.
// e.g. "sekkei" -> [['se'], ['k'], ['ke'], ['i']] is weird because user types 's', 'e', 'k', 'k', 'e', 'i'.
// Sokuon usually means "next consonant".
// For this MVP, let's fix the tricky ones manually.
const FIXED_WORD_LIST: WordDef[] = [
    ...WORD_LIST_SRC,
    { display: "設計", moras: [['se'], ['k'], ['ke'], ['i']] }, // sekkei
    { display: "実行", moras: [['ji', 'zi'], ['k'], ['ko'], ['u']] }, // jikkou
    { display: "接続", moras: [['se'], ['tsu', 'tu'], ['zo'], ['ku']] },
    { display: "圧縮", moras: [['a'], ['s', 'sh'], ['shu', 'syu'], ['ku']] }, // asshuku
    { display: "直感的", moras: [['cho', 'tyo'], ['k'], ['ka'], ['n', 'nn'], ['te'], ['ki']] }, // chokkanteki
];
// Filter out duplicates if any
const WORD_LIST = Array.from(new Map(FIXED_WORD_LIST.map(item => [item.display, item])).values());

const GAME_DURATION = 60; // seconds

export default function TypingRacerPage() {
    // --- State ---
    const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [score, setScore] = useState(0);
    const [wpm, setWpm] = useState(0);

    // Typing Logic
    const [currentWord, setCurrentWord] = useState<WordDef | null>(null);
    const [currentMoraIndex, setCurrentMoraIndex] = useState(0); // Which mora block we are on
    const [typedInCurrentMora, setTypedInCurrentMora] = useState(''); // What has been typed for current mora
    const [resolvedMoras, setResolvedMoras] = useState<string[]>([]); // Strings of completed moras (for display)

    const [shake, setShake] = useState(false);
    const [correctChars, setCorrectChars] = useState(0); // Total chars typed correctly in session
    const startTimeRef = useRef<number>(0);

    // --- Helpers ---
    const getRandomWord = () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

    const startGame = () => {
        setGameState('playing');
        setTimeLeft(GAME_DURATION);
        setScore(0);
        setCorrectChars(0);
        setWpm(0);

        // Reset word state
        const word = getRandomWord();
        setCurrentWord(word);
        setCurrentMoraIndex(0);
        setTypedInCurrentMora('');
        setResolvedMoras([]);

        startTimeRef.current = Date.now();
    };

    const nextWord = () => {
        // Bonus
        const chars = currentWord?.moras.flat().join('').length || 5;
        setScore(s => s + chars * 10 + 50);

        const word = getRandomWord();
        setCurrentWord(word);
        setCurrentMoraIndex(0);
        setTypedInCurrentMora('');
        setResolvedMoras([]);
    };

    // --- Effects ---

    // Timer & WPM
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameState('finished');
                    return 0;
                }
                return prev - 1;
            });

            const elapsedMin = (Date.now() - startTimeRef.current) / 1000 / 60;
            if (elapsedMin > 0) {
                setWpm(Math.floor((correctChars / 5) / elapsedMin));
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, correctChars]);

    // Input Handling
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameState !== 'playing' || !currentWord) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.key.length !== 1) return;

        const char = e.key.toLowerCase();

        // Current possible patterns for the active mora
        const candidates = currentWord.moras[currentMoraIndex];
        const nextTyped = typedInCurrentMora + char;

        // Check if ANY candidate starts with `nextTyped`
        const matches = candidates.filter(c => c.startsWith(nextTyped));

        if (matches.length > 0) {
            // Valid input
            setTypedInCurrentMora(nextTyped);
            setCorrectChars(c => c + 1);

            // Check if strict/exact match found (completed this mora?)
            // Priority: if exact match exists, and it's not a prefix of another longer match?
            // Actually, we usually take the shortest exact match that covers input.
            // But wait, "checking 'n'" vs "checking 'nn'"
            // If user types 'n', matches 'n' and 'nn'.
            // Usually we wait for next char to decide unless 'n' is terminal?
            // "n" handling is special in IME. Here:
            // "ka" (k, a). "nn" (n, n).
            // If matches contains an exact match equal to nextTyped:
            const exactMatch = matches.find(m => m === nextTyped);
            if (exactMatch) {
                // If there are longer matches (e.g. 'n' vs 'nn'), we might need to wait?
                // Simplification for game: if exact match found, take it immediately unless logic requires waiting.
                // For 'n' vs 'nn', usually 'n' is accepted if next char is not 'n'..?
                // Let's implement simple "Greedy Accept". Input 'n' -> Accept 'n'.
                // Exception: 'n' followed by vowel? No, 'n' in word list is handled.
                // Our WORD_LIST has explicit mora breakdown.
                // 'hensuu' -> 'he', 'n', 'su', 'u'.
                // If user types 'n', taking 'n' is fine.
                // If word is 'hanni' ('ha', 'n', 'ni') -> 'n' matches 'n' mora?
                // Wait, 'n' (unn) should be 'nn' usually if not followed by consonant.
                // BUT current WORD_LIST_SRC defines 'n'/'nn' as array.
                // Let's just accept if it matches exactly.

                // Advance Mora
                setResolvedMoras(prev => [...prev, exactMatch]);
                setTypedInCurrentMora('');

                if (currentMoraIndex + 1 >= currentWord.moras.length) {
                    // Word Finished
                    nextWord();
                } else {
                    setCurrentMoraIndex(i => i + 1);
                }
            }
        } else {
            // Error
            setShake(true);
            setTimeout(() => setShake(false), 200);
            setScore(s => Math.max(0, s - 5));
        }

    }, [gameState, currentWord, currentMoraIndex, typedInCurrentMora]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Background Speed
    const bgSpeed = Math.max(0.5, 5 - (wpm / 20));

    // Display rendering helper
    const renderActiveMora = () => {
        if (!currentWord) return null;

        // We want to show the "Target" reading.
        // If user has started typing, we can lock onto the matching candidate to show "what user is typing".
        // Or just show all? Usually typing games show one primary reading, but switch if user takes alternate route.

        const candidates = currentWord.moras[currentMoraIndex];

        // Find best candidate to display
        // 1. If user typed something, pick candidate that matches input
        // 2. Default to first candidate
        const primaryCandidate = candidates.find(c => c.startsWith(typedInCurrentMora)) || candidates[0];

        // Render
        return (
            <span>
                <span className="text-cyan-400">{typedInCurrentMora}</span>
                <span className="text-white underline decoration-4 decoration-orange-500 underline-offset-8">
                    {primaryCandidate.slice(typedInCurrentMora.length)}
                </span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-white overflow-hidden relative flex flex-col">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>

            {/* Dynamic Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div
                    className="w-full h-full bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"
                    style={{
                        transform: 'perspective(500px) rotateX(60deg) translateY(0)',
                        transformOrigin: 'top center',
                        animation: gameState === 'playing' ? `gridMove ${bgSpeed}s linear infinite` : 'none'
                    }}
                />
            </div>
            <style jsx global>{`
                @keyframes gridMove {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 50px; }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>

            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center relative z-10 bg-slate-900/80 backdrop-blur border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🏎️</span>
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            016 TYPING RACER (JP/Plus)
                        </h1>
                    </div>
                </div>

                <div className="flex gap-6 font-mono">
                    <div className="text-right">
                        <div className="text-xs text-slate-400">TIME</div>
                        <div className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400">SCORE</div>
                        <div className="text-2xl font-bold text-orange-400">{score}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-400">SPEED</div>
                        <div className="text-2xl font-bold text-cyan-400">{wpm} <span className="text-xs">WPM</span></div>
                    </div>
                </div>
            </header>

            {/* Main Game Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-4xl mx-auto">

                {gameState === 'start' && (
                    <div className="text-center space-y-8 animate-in zoom-in duration-300">
                        <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 backdrop-blur-md">
                            <h2 className="text-4xl font-bold mb-4">Are You Ready?</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                画面の日本語をローマ字で入力してください。<br />
                                <span className="text-emerald-400 font-bold">ti/chi, tu/tsu, si/shi 両対応</span><br />
                                <span className="text-xs text-slate-500">例: 配列 → hairetsu / hairetu</span>
                            </p>
                            <button
                                onClick={startGame}
                                className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full font-black text-xl shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95 transition-all text-white"
                            >
                                START ENGINE
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">※ PC (物理キーボード) 推奨</p>
                    </div>
                )}

                {gameState === 'playing' && currentWord && (
                    <div className="w-full space-y-12">
                        {/* Speedometer */}
                        <div className="flex justify-center">
                            <div className="relative w-64 h-32 overflow-hidden">
                                <div className="absolute bottom-0 w-full h-full bg-slate-800 rounded-t-full border-t-8 border-slate-700"></div>
                                <div
                                    className="absolute bottom-0 left-1/2 w-1 h-28 bg-red-500 origin-bottom transition-transform duration-500 ease-out"
                                    style={{ transform: `translateX(-50%) rotate(${(Math.min(wpm, 120) / 120) * 180 - 90}deg)` }}
                                ></div>
                                <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-200 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                            </div>
                        </div>

                        {/* Word Display */}
                        <div className="text-center space-y-6">
                            {/* Japanese */}
                            <div className="text-4xl sm:text-6xl font-black text-slate-100 mb-4 transition-all">
                                {currentWord.display}
                            </div>

                            {/* Romaji Flow */}
                            <div
                                className={`inline-block text-5xl sm:text-7xl font-mono font-bold tracking-tight p-4 rounded-2xl transition-transform ${shake ? 'animate-shake text-red-400' : 'text-white'}`}
                            >
                                {/* Resolved (Already typed moras) */}
                                {resolvedMoras.map((m, i) => (
                                    <span key={i} className="text-cyan-600 opacity-60">{m}</span>
                                ))}

                                {/* Active (Typing now) */}
                                {renderActiveMora()}

                                {/* Remaining (Future moras) */}
                                {currentWord.moras.slice(currentMoraIndex + 1).map((m, i) => (
                                    <span key={i} className="text-slate-600">{m[0]}</span>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Fallback Input */}
                        <div className="opacity-0 absolute top-0 left-0 w-full h-full">
                            <input
                                autoFocus
                                type="text"
                                className="w-full h-full opacity-0"
                                onChange={(e) => {
                                    // Software keyboard basic support
                                    const char = e.target.value.slice(-1).toLowerCase();
                                    if (char) {
                                        // Dispatch manual event logic if needed, but keeping simple for now
                                        // For full mobile support we need dedicated handler, skipping for now per instruction "PC friendly"
                                    }
                                }}
                            />
                        </div>

                        <p className="text-center text-slate-500 font-mono text-sm">
                            ローマ字で入力してください
                        </p>
                    </div>
                )}

                {gameState === 'finished' && (
                    <div className="text-center space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <div className="text-6xl mb-4">🏁</div>
                        <h2 className="text-5xl font-black text-white uppercase italic">Finish!</h2>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <div className="text-slate-400 text-sm">FINAL SCORE</div>
                            <div className="text-3xl font-bold text-orange-400 text-right">{score}</div>

                            <div className="text-slate-400 text-sm">SPEED (WPM)</div>
                            <div className="text-3xl font-bold text-cyan-400 text-right">{wpm}</div>
                        </div>

                        <div className="pt-8">
                            <button
                                onClick={startGame}
                                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-white transition-all w-full max-w-xs mx-auto block"
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
