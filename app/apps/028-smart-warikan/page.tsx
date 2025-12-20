"use client";

import React, { useState, useEffect } from "react";
import {
    Calculator,
    Users,
    Send,
    Copy,
    Check,
    RefreshCcw,
    Sparkles,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

// 設定型
type RoundingUnit = 10 | 100 | 500 | 1000;

// グループ設定
type Group = {
    id: string;
    name: string;
    count: number;
    ratio: number; // 支払比率 (例: 1.5, 1.0, 0.5)
};

export default function SmartWarikanPage() {
    const [totalAmount, setTotalAmount] = useState<string>("");
    const [rounding, setRounding] = useState<RoundingUnit>(100);

    // 初期グループ: 多め(1.5), 普通(1.0), 少なめ(0.5)
    const [groups, setGroups] = useState<Group[]>([
        { id: "boss", name: "多めに払う人", count: 0, ratio: 1.5 },
        { id: "general", name: "普通の人", count: 2, ratio: 1.0 },
        { id: "cheap", name: "安くする人", count: 0, ratio: 0.5 },
    ]);

    const [result, setResult] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);

    // 計算ロジック
    const calculate = () => {
        const total = parseInt(totalAmount, 10);
        if (isNaN(total) || total <= 0) {
            setResult("");
            return;
        }

        // 1. ポイントの合計を計算 (人数 * 比率)
        let totalPoints = 0;
        groups.forEach(group => {
            totalPoints += group.count * group.ratio;
        });

        if (totalPoints === 0) {
            setResult("");
            return;
        }

        // 2. 1ポイントあたりの金額（仮）
        const baseAmountPerPoint = total / totalPoints;

        // 3. グループごとの金額を計算し、端数処理
        let calculatedTotal = 0;
        const groupPayment: { id: string, name: string, amount: number, count: number }[] = [];

        // まずはベースの計算
        groups.forEach(group => {
            if (group.count === 0) return;

            let rawAmount = baseAmountPerPoint * group.ratio;

            // 端数切り上げ処理
            rawAmount = Math.ceil(rawAmount / rounding) * rounding;

            groupPayment.push({
                id: group.id,
                name: group.name,
                amount: rawAmount,
                count: group.count
            });

            calculatedTotal += rawAmount * group.count;
        });

        // 4. 合計との差額調整 (多く集まりすぎた場合などは調整せず「余り」とするのが一般的だが、
        // ここでは単純に切り上げ計算後の結果を表示)

        // 結果テキスト生成
        let text = `🍻 割り勘計算結果\n`;
        text += `全員で ${groups.reduce((sum, g) => sum + g.count, 0)}人 / 合計 ${total.toLocaleString()}円\n`;
        text += `----------------\n`;

        groupPayment.forEach(g => {
            text += `${g.name} (${g.count}人)\n`;
            text += `一人あたり: ${g.amount.toLocaleString()}円\n\n`;
        });

        const diff = calculatedTotal - total;
        if (diff > 0) {
            text += `----------------\n`;
            text += `余り: ${diff.toLocaleString()}円\n(幹事のポケットへ？)`;
        } else if (diff < 0) {
            // 基本切り上げなのでマイナスになることはないはずだが念のため
            text += `----------------\n`;
            text += `不足: ${Math.abs(diff).toLocaleString()}円`;
        }

        setResult(text);
    };

    // 入力が変わるたびに再計算
    useEffect(() => {
        calculate();
    }, [totalAmount, rounding, groups]);

    // グループ人数変更
    const updateCount = (id: string, delta: number) => {
        setGroups(prev => prev.map(g => {
            if (g.id === id) {
                return { ...g, count: Math.max(0, g.count + delta) };
            }
            return g;
        }));
    };

    // 比率変更
    const updateRatio = (id: string, newRatio: string) => {
        const ratio = parseFloat(newRatio);
        if (isNaN(ratio) || ratio < 0) return;

        setGroups(prev => prev.map(g => {
            if (g.id === id) {
                return { ...g, ratio: ratio };
            }
            return g;
        }));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // シェア用URL生成 (Web Share API)
    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '割り勘結果',
                    text: result,
                });
            } catch (err) {
                console.error(err);
            }
        } else {
            copyToClipboard();
            alert("クリップボードにコピーしました");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 md:pb-0">
            <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl flex flex-col">

                {/* ヘッダー */}
                <header className="bg-slate-900 text-white p-6 rounded-b-[2rem] shadow-lg z-10 relative">
                    <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex flex-col mb-4">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <Sparkles size={16} className="text-yellow-400" />
                            <span className="text-xs font-bold tracking-widest">App 028</span>
                        </div>
                        <h1 className="text-2xl font-bold">割り勘電卓 (傾斜配分)</h1>
                        <p className="text-xs text-slate-400 mt-2">
                            「多めに払う人」「安くする人」といった傾斜をつけて、不公平感のない割り勘計算ができます。結果はテキストコピーしてLINE等に貼り付けられます。
                        </p>
                    </div>

                    {/* 合計金額入力 */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">¥</span>
                        <input
                            type="number"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            placeholder="合計金額を入力"
                            className="w-full bg-slate-800 border-none rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none transition-all shadow-inner"
                            inputMode="numeric"
                        />
                    </div>
                </header>

                <main className="flex-1 p-6 space-y-8">

                    {/* 端数設定 */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Rounding Unit</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl">
                            {[10, 100, 500, 1000].map((unit) => (
                                <button
                                    key={unit}
                                    onClick={() => setRounding(unit as RoundingUnit)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${rounding === unit
                                        ? "bg-white text-slate-900 shadow-md ring-1 ring-black/5"
                                        : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {unit}円単位
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 人数設定 */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Members & Ratios</label>

                        {groups.map(group => (
                            <div key={group.id} className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div>
                                    <div className="font-bold text-slate-700">{group.name}</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-xs text-slate-400">比率:</span>
                                        <input
                                            type="number"
                                            value={group.ratio}
                                            onChange={(e) => updateRatio(group.id, e.target.value)}
                                            className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-sm font-bold text-slate-600 focus:ring-1 focus:ring-sky-400 outline-none"
                                            step="0.1"
                                            min="0"
                                        />
                                        <span className="text-xs text-slate-400">x</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                    <button
                                        onClick={() => updateCount(group.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-400 shadow-sm hover:text-rose-500 active:scale-95 transition-all text-lg font-bold disabled:opacity-50"
                                        disabled={group.count <= 0}
                                    >
                                        -
                                    </button>
                                    <span className="font-bold w-6 text-center text-lg">{group.count}</span>
                                    <button
                                        onClick={() => updateCount(group.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-emerald-500 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all text-lg font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 結果表示エリア */}
                    {result && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Result</label>
                            <div className="bg-slate-900 text-slate-300 p-5 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-xl relative overflow-hidden group">
                                {result}

                                {/* 背景装飾 */}
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={copyToClipboard}
                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isCopied
                                        ? "bg-emerald-500 text-white shadow-emerald-200"
                                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                                        }`}
                                >
                                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                                    {isCopied ? "おっけー" : "コピー"}
                                </button>
                                <button
                                    onClick={share}
                                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
                                >
                                    <Send size={18} />
                                    LINEに送る
                                </button>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
