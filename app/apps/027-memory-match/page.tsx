"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Trophy,
    Timer,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";

// ゲーム設定
const PAIRS_COUNT = 8; // 8ペア = 16枚
const TIME_LIMIT = 60; // 秒

type Card = {
    id: number;
    value: number;
    isFlipped: boolean;
    isMatched: boolean;
};

type GameState = "idle" | "playing" | "finished";

export default function MemoryMatchPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [gameState, setGameState] = useState<GameState>("idle");
    const [flippedCards, setFlippedCards] = useState<number[]>([]); // card index
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [bestScore, setBestScore] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // カード生成
    const startGame = () => {
        // カード生成 (数字ペア)
        const numbers = Array.from({ length: PAIRS_COUNT }, (_, i) => i + 1); // 1 to 8
        const deck = [...numbers, ...numbers] // ペアにする
            .map((num, i) => ({
                id: i,
                value: num, // iconId -> value (number)
                isFlipped: false,
                isMatched: false,
            }))
            .sort(() => Math.random() - 0.5); // シャッフル

        setCards(deck);
        setGameState("playing");
        setScore(0);
        setCombo(0);
        setTimeLeft(TIME_LIMIT);
        setFlippedCards([]);

        // タイマースタート
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const endGame = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState("finished");
        setBestScore((prev) => Math.max(prev, score));
    };

    // 毎回タイマーのクリーンアップ
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // スコア更新
    useEffect(() => {
        if (gameState === "finished") {
            setBestScore((prev) => Math.max(prev, score));
        }
    }, [gameState, score]);


    // カードクリック処理
    const handleCardClick = (index: number) => {
        if (
            gameState !== "playing" ||
            cards[index].isFlipped ||
            cards[index].isMatched ||
            flippedCards.length >= 2
        ) {
            return;
        }

        // カードをめくる
        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        // 2枚めくった場合
        if (newFlipped.length === 2) {
            const [idx1, idx2] = newFlipped;
            const card1 = newCards[idx1];
            const card2 = newCards[idx2];

            if (card1.value === card2.value) {
                // マッチした場合
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((c) =>
                            c.id === card1.id || c.id === card2.id
                                ? { ...c, isMatched: true }
                                : c
                        )
                    );
                    setFlippedCards([]);

                    // スコア計算
                    setCombo((prev) => {
                        const newCombo = prev + 1;
                        setScore((s) => s + 100 * newCombo);
                        return newCombo;
                    });

                    // 全ペア達成チェック
                    if (cards.filter(c => c.isMatched).length + 2 === cards.length) {
                        setScore((s) => s + timeLeft * 50);
                        endGame();
                    }

                }, 500);
            } else {
                // マッチしなかった場合
                setCombo(0);
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((c) =>
                            c.id === card1.id || c.id === card2.id
                                ? { ...c, isFlipped: false }
                                : c
                        )
                    );
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full max-w-lg space-y-6 relative">
                <div className="absolute top-0 left-0 -mt-12">
                    <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* ヘッダー情報 */}
                <div className="space-y-4">
                    {/* タイトル */}
                    <div className="text-center">
                        <h1 className="text-2xl font-black italic bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                            027 SPEED MEMORY
                        </h1>
                    </div>

                    {/* スコアボード */}
                    <div className="flex justify-between items-end bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md z-10">
                        <div>
                            <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1">
                                <Trophy size={12} className="text-yellow-500" />
                                SCORE
                            </div>
                            <div className="text-3xl font-black font-mono tracking-tighter bg-gradient-to-br from-yellow-300 to-amber-500 bg-clip-text text-transparent">
                                {score.toLocaleString()}
                            </div>
                        </div>

                        <div className="text-center">
                            {combo > 1 && (
                                <div className="animate-bounce font-black text-rose-500 text-xl drop-shadow-md">
                                    {combo} COMBO!
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <div className="text-xs text-slate-400 font-bold mb-1 flex items-center justify-end gap-1">
                                <Timer size={12} className={timeLeft < 10 ? "text-rose-500 animate-pulse" : "text-sky-400"} />
                                TIME
                            </div>
                            <div className={`text-3xl font-black font-mono tracking-tighter ${timeLeft < 10 ? "text-rose-500" : "text-white"}`}>
                                {timeLeft}
                            </div>
                        </div>
                    </div>

                    {/* カードグリッド */}
                    <div className="grid grid-cols-4 gap-3 md:gap-4 aspect-square">
                        {cards.map((card, index) => (
                            <div
                                key={card.id}
                                className="relative group [perspective:1000px] cursor-pointer"
                                onClick={() => handleCardClick(index)}
                            >
                                <div
                                    className={`
                            relative w-full h-full rounded-xl transition-all duration-500 [transform-style:preserve-3d] shadow-lg
                            ${card.isFlipped || card.isMatched ? "[transform:rotateY(180deg)]" : ""}
                            ${card.isMatched ? "opacity-0 scale-0 !duration-700 delay-200" : "opacity-100"}
                        `}
                                >
                                    {/* 裏面 (Back) */}
                                    <div className="absolute inset-0 w-full h-full bg-slate-800 border-2 border-slate-700 rounded-xl [backface-visibility:hidden] flex items-center justify-center group-hover:border-sky-500/50 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                        </div>
                                    </div>

                                    {/* 表面 (Front) */}
                                    <div className="absolute inset-0 w-full h-full bg-slate-100 rounded-xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center text-slate-900 shadow-inner border-4 border-white">
                                        <div className={`transform transition-transform font-black text-4xl ${card.isMatched ? "scale-150" : ""}`}>
                                            {card.value}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* スタート画面 / リザルト画面 オーバーレイ */}
                        {gameState !== "playing" && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm rounded-2xl animate-in fade-in">
                                <div className="text-center p-8 max-w-sm">
                                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400 mb-4">
                                        {gameState === "idle" ? "MEMORY MATCH" : "TIME UP!"}
                                    </h2>

                                    {gameState === "idle" && (
                                        <div className="text-sm text-slate-400 mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-left">
                                            <p className="font-bold text-slate-200 mb-2 border-b border-slate-700 pb-1">遊び方:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>60秒以内に全てのペアを見つけてください。</li>
                                                <li><span className="text-yellow-400 font-bold">連続正解（コンボ）</span>するとスコアが大幅アップします。</li>
                                                <li>素早くめくる記憶力と反射神経がカギです！</li>
                                            </ul>
                                        </div>
                                    )}
                                    {gameState === "finished" && (
                                        <div className="mb-6">
                                            <p className="text-slate-400 text-sm">FINAL SCORE</p>
                                            <p className="text-5xl font-black text-white drop-shadow-lg">{score.toLocaleString()}</p>
                                            {score > 0 && score === bestScore && (
                                                <span className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/50 animate-pulse">
                                                    NEW RECORD!
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={startGame}
                                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-sky-500/40 transition-all flex items-center gap-2 mx-auto"
                                    >
                                        <RefreshCw size={20} />
                                        {gameState === "idle" ? "START GAME" : "PLAY AGAIN"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 背景装飾 */}
                <div className="fixed inset-0 -z-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
                </div>
            </div>
        </div>
    );
}
