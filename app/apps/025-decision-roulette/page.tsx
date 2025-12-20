"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, RotateCw, Sparkles, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";

// プリセット
const PRESETS = [
    { name: "今日のランチ", items: ["ラーメン", "カレー", "パスタ", "定食", "うどん/そば", "コンビニ", "ハンバーガー"] },
    { name: "やること", items: ["掃除", "勉強", "運動", "読書", "休憩", "買い物"] },
    { name: "罰ゲーム", items: ["デコピン", "ジュース奢り", "モノマネ", "初恋の話", "一発芸"] },
    { name: "YES / NO", items: ["YES", "NO"] },
];

const COLORS = [
    "#f87171", // red
    "#fbbf24", // amber
    "#34d399", // emerald
    "#60a5fa", // blue
    "#818cf8", // indigo
    "#c084fc", // purple
    "#f472b6", // pink
    "#fb923c", // orange
];

export default function RoulettePage() {
    const [items, setItems] = useState<string[]>(PRESETS[0].items);
    const [newItem, setNewItem] = useState("");
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [showPresets, setShowPresets] = useState(false);

    // マウント時に少し回しておく（見た目用）
    useEffect(() => {
        setRotation(Math.random() * 360);
    }, []);

    const handleAddItem = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newItem.trim()) return;
        if (items.length >= 12) {
            alert("項目は最大12個までです");
            return;
        }
        setItems([...items, newItem.trim()]);
        setNewItem("");
    };

    const removeItem = (index: number) => {
        if (items.length <= 2) {
            alert("最低2つの項目が必要です");
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const loadPreset = (presetItems: string[]) => {
        setItems(presetItems);
        setShowPresets(false);
        setResult(null);
    };

    const spin = () => {
        if (isSpinning || items.length < 2) return;

        setIsSpinning(true);
        setResult(null);

        // 現在の回転角度から、最低5回転(1800度) + ランダム(0-360)度を追加
        // 逆算して、どのアイテムで止まるかを決めることもできるが、今回は物理挙動っぽくランダム
        const minSpins = 5;
        const randomDegree = Math.floor(Math.random() * 360);
        const newRotation = rotation + (360 * minSpins) + randomDegree;

        setRotation(newRotation);

        // アニメーション終了後の処理 (CSSのtransition時間と合わせる: 4s)
        setTimeout(() => {
            setIsSpinning(false);
            calculateResult(newRotation);
        }, 4000);
    };

    const calculateResult = (finalRotation: number) => {
        // 角度を正規化 (0-360)
        // CSSのrotateは時計回りだが、ホイールのアイテム配置も時計回りだと仮定
        // 針（上部固定）に対する角度を計算

        // 補正: 針が0度(真上)にあるとする。
        // ホイールが時計回りに回る -> アイテムは反時計回りに動くように見える
        // 実際はホイール自体の角度が増えていく

        const normalizedRotation = finalRotation % 360;
        // 真上(270度 or -90度相当)に来ているスライスを計算
        // SVG描画の基本位置にもよるが、計算を簡単にするため
        // 「360 - (normalizedRotation % 360)」で、0度地点からのオフセットを出す
        // そこに針の位置オフセットを加味する

        const sliceAngle = 360 / items.length;
        // 針は真上(270度? SVGのrotate=0は3時方向、-90で真上)
        // ここではシンプルに実効角度で計算

        // 時計回りに回転した場合、針(固定)の下に来るアイテムは
        // インデックス逆順に巡回していく
        const degreesFromStart = normalizedRotation % 360;
        const index = Math.floor(((360 - degreesFromStart) % 360) / sliceAngle);

        // 微調整が必要かもしれないため実装後に確認
        // SVGの描画開始位置(0度=3時)と針の位置(真上=-90度)のズレを補正
        // 針の位置 = 270度 (または -90度)
        // アイテムiの角度範囲: i*slice 〜 (i+1)*slice

        // 正確な計算:
        // 針の角度(ホイール内相対) = (針の絶対角度 - ホイール回転角度) % 360
        // 針は常に270度(真上)にあるとする(svg coordinate system)
        let pointerAngle = (270 - normalizedRotation) % 360;
        if (pointerAngle < 0) pointerAngle += 360;

        const winningIndex = Math.floor(pointerAngle / sliceAngle);

        setResult(items[winningIndex]);
    };

    // ホイール描画用のパス計算
    const getWheelSlices = () => {
        const total = items.length;
        const anglePerSlice = 360 / total;
        const radius = 150; // SVG viewBox size based
        const center = 150;

        return items.map((item, i) => {
            const startAngle = i * anglePerSlice;
            const endAngle = (i + 1) * anglePerSlice;

            // ラジアン変換
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            // 座標計算
            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);

            // SVG Path: M(center) L(start) A(radius) L(center)
            // Large arc flag: 角度が180度以上なら1 (2分割以下の場合)
            const largeArc = anglePerSlice > 180 ? 1 : 0;

            const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            // テキスト位置（スライスの中心角度）
            const midAngle = startAngle + anglePerSlice / 2;
            const midRad = (midAngle * Math.PI) / 180;
            // 中心より少し外側に配置
            const textRadius = radius * 0.65;
            const tx = center + textRadius * Math.cos(midRad);
            const ty = center + textRadius * Math.sin(midRad);

            return (
                <g key={i}>
                    <path d={pathData} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth="2" />
                    {/* テキスト: 中心点で回転させて、中心から放射状に見えるようにする */}
                    <text
                        x={tx}
                        y={ty}
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${midAngle + (total <= 2 ? 90 : 0)}, ${tx}, ${ty})`}
                        style={{ pointerEvents: 'none' }}
                    >
                        {item.length > 8 ? item.substring(0, 7) + "..." : item}
                    </text>
                </g>
            );
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden">
            {/* 左側：ホイールエリア */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[50vh]">
                {/* 針 (オーバーレイ) */}
                <div className="absolute top-[15%] md:top-[10%] z-20 drop-shadow-lg">
                    <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-rose-500"></div>
                </div>

                {/* ホイール */}
                <div
                    className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] transition-transform shadow-2xl rounded-full border-4 border-slate-800"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning ? "transform 4s cubic-bezier(0.1, 0.05, 0.1, 1)" : "none" // 減速イージング
                    }}
                >
                    <svg viewBox="0 0 300 300" className="w-full h-full transform drop-shadow-xl">
                        {getWheelSlices()}
                    </svg>
                </div>

                {/* 結果モーダル */}
                {result && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl text-center transform scale-110 animate-bounce-short">
                            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                            <p className="text-slate-500 font-bold text-sm mb-1">決定！</p>
                            <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {result}
                            </h2>
                            <button
                                onClick={() => setResult(null)}
                                className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:scale-105 transition"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 右側：コントロールエリア */}
            <div className="flex-1 bg-slate-900 p-6 md:p-8 flex flex-col gap-6 md:border-l border-slate-800 overflow-y-auto max-h-[50vh] md:max-h-screen">
                <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </Link>
                <header>
                    <div className="text-sm font-bold text-purple-400 mb-1">App 025</div>
                    <h1 className="text-2xl font-bold bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        決定ルーレット
                    </h1>

                    <div className="bg-slate-800/50 p-4 rounded-xl text-xs text-slate-400 border border-slate-700/50">
                        <p className="font-bold text-slate-300 mb-2">使い方:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>迷った時のための運試しルーレットです。</li>
                            <li>下のフォームから項目を追加するか、<strong>「プリセット」</strong>から選んでください。</li>
                            <li><strong>SPINボタン</strong>を押すと回転し、ランダムで1つが選ばれます。</li>
                        </ul>
                    </div>
                </header>

                {/* プリセット選択 */}
                <div className="relative">
                    <button
                        onClick={() => setShowPresets(!showPresets)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 transition border border-slate-700"
                    >
                        <span>📋 プリセットから選ぶ</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showPresets ? "rotate-180" : ""}`} />
                    </button>

                    {showPresets && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 overflow-hidden text-sm">
                            {PRESETS.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => loadPreset(preset.items)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-0"
                                >
                                    <div className="font-bold text-slate-200">{preset.name}</div>
                                    <div className="text-xs text-slate-400 truncate">{preset.items.join(", ")}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* アイテム入力 */}
                <form onSubmit={handleAddItem} className="flex gap-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="新しい項目..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 focus:outline-none focus:border-purple-500 transition"
                    />
                    <button
                        type="submit"
                        className="p-3 bg-slate-800 hover:bg-slate-700 hover:text-purple-400 rounded-lg border border-slate-700 transition"
                        disabled={isSpinning}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                {/* アイテムリスト */}
                <div className="flex-1 min-h-[150px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800 group">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            ></div>
                            <span className="flex-1 truncate text-sm">{item}</span>
                            <button
                                onClick={() => removeItem(i)}
                                className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isSpinning}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* SPIN ボタン */}
                <button
                    onClick={spin}
                    disabled={isSpinning || items.length < 2}
                    className="w-full py-4 rounded-xl font-black text-xl tracking-wider shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                >
                    {isSpinning ? "SPINNING..." : "SPIN!"}
                    {!isSpinning && <RotateCw className="inline-block ml-2 w-5 h-5 mb-1" />}
                </button>
            </div>
        </div>
    );
}
