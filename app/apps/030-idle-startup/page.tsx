"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Code,
    Coffee,
    Server,
    Laptop,
    Users,
    Building2,
    Zap,
    TrendingUp,
    Save,
    Rocket,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

// 型定義
type Resource = {
    money: number;
    totalEarned: number;
    linesOfCode: number;
};

type UpgradeType = "click" | "auto" | "multiplier";

type Upgrade = {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    costMultiplier: number; // 購入するたびに価格が何倍になるか
    effectValue: number; // 効果量
    type: UpgradeType;
    icon: React.ElementType;
    count: number;
    unlockCondition?: number; // アンロックに必要なtotalEarned
};

// 初期データ
const INITIAL_UPGRADES: Upgrade[] = [
    // クリック強化
    { id: "keyboard", name: "メカニカルキーボード", description: "タイピング速度UP (クリック効率 +1)", baseCost: 50, costMultiplier: 1.5, effectValue: 1, type: "click", icon: Code, count: 0 },
    { id: "coffee", name: "高級コーヒー豆", description: "カフェインパワー (クリック効率 +5)", baseCost: 500, costMultiplier: 1.6, effectValue: 5, type: "click", icon: Coffee, count: 0 },

    // 自動収益 (スタッフ雇用/設備)
    { id: "intern", name: "インターン生", description: "勉強熱心な若手 (自動収益 +2円/秒)", baseCost: 100, costMultiplier: 1.2, effectValue: 2, type: "auto", icon: Users, count: 0 },
    { id: "pc", name: "ハイスペックPC", description: "ビルド時間短縮 (自動収益 +10円/秒)", baseCost: 1000, costMultiplier: 1.3, effectValue: 10, type: "auto", icon: Laptop, count: 0 },
    { id: "server", name: "自社サーバー", description: "インフラ整備 (自動収益 +50円/秒)", baseCost: 5000, costMultiplier: 1.4, effectValue: 50, type: "auto", icon: Server, count: 0 },
    { id: "senior", name: "つよつよエンジニア", description: "1人で10人分 (自動収益 +200円/秒)", baseCost: 20000, costMultiplier: 1.5, effectValue: 200, type: "auto", icon: Rocket, count: 0 },
    { id: "ai", name: "AIアシスタント", description: "眠らない労働力 (自動収益 +1000円/秒)", baseCost: 100000, costMultiplier: 1.6, effectValue: 1000, type: "auto", icon: Zap, count: 0 },
];

export default function IdleStartupPage() {
    const [resource, setResource] = useState<Resource>({ money: 0, totalEarned: 0, linesOfCode: 0 });
    const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
    const [clickPower, setClickPower] = useState(1);
    const [autoIncome, setAutoIncome] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    // アニメーション用
    const [clickEffects, setClickEffects] = useState<{ id: number, x: number, y: number, val: number }[]>([]);

    // ロード処理
    useEffect(() => {
        const savedData = localStorage.getItem("idle-startup-save");
        if (savedData) {
            try {
                const { resource: savedRes, upgrades: savedUps } = JSON.parse(savedData);
                if (savedRes && savedUps) {
                    setResource(savedRes);
                    const mergedUpgrades = INITIAL_UPGRADES.map(initUp => {
                        const found = savedUps.find((s: Upgrade) => s.id === initUp.id);
                        return found ? { ...initUp, count: found.count } : initUp;
                    });
                    setUpgrades(mergedUpgrades);
                }
            } catch (e) {
                console.error("Save data load failed", e);
            }
        }
    }, []);

    // ステータス再計算 (upgrades変更時)
    useEffect(() => {
        let newClickPower = 1;
        let newAutoIncome = 0;

        upgrades.forEach(up => {
            if (up.type === "click") {
                newClickPower += up.count * up.effectValue;
            } else if (up.type === "auto") {
                newAutoIncome += up.count * up.effectValue;
            }
        });

        setClickPower(newClickPower);
        setAutoIncome(newAutoIncome);
    }, [upgrades]);

    // 自動収益ループ (1秒ごと)
    useEffect(() => {
        if (autoIncome === 0) return;
        const interval = setInterval(() => {
            setResource(prev => ({
                ...prev,
                money: prev.money + autoIncome,
                totalEarned: prev.totalEarned + autoIncome,
                linesOfCode: prev.linesOfCode + autoIncome * 0.1 // 適当なLOC増加
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [autoIncome]);

    // オートセーブ (30秒ごと)
    useEffect(() => {
        const interval = setInterval(() => {
            saveGame();
        }, 30000);
        return () => clearInterval(interval);
    }, [resource, upgrades]);

    const saveGame = () => {
        localStorage.setItem("idle-startup-save", JSON.stringify({ resource, upgrades }));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    // クリック処理
    const handleClick = (e: React.MouseEvent) => {
        // 収益加算
        setResource(prev => ({
            ...prev,
            money: prev.money + clickPower,
            totalEarned: prev.totalEarned + clickPower,
            linesOfCode: prev.linesOfCode + 1
        }));

        // エフェクト追加
        const id = Date.now();
        // ボタン内での相対座標を取得してもいいが、簡単のためe.clientX/Yを使う
        // ただし親コンテナ内での相対位置にするため少し調整
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setClickEffects(prev => [...prev, { id, x, y, val: clickPower }]);

        // エフェクト削除
        setTimeout(() => {
            setClickEffects(prev => prev.filter(eff => eff.id !== id));
        }, 1000);
    };

    // アップグレード購入
    const buyUpgrade = (id: string) => {
        const upgradeIndex = upgrades.findIndex(u => u.id === id);
        if (upgradeIndex === -1) return;

        const upgrade = upgrades[upgradeIndex];
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));

        if (resource.money >= cost) {
            setResource(prev => ({ ...prev, money: prev.money - cost }));

            const newUpgrades = [...upgrades];
            newUpgrades[upgradeIndex] = { ...upgrade, count: upgrade.count + 1 };
            setUpgrades(newUpgrades);
        }
    };

    const calculateCost = (upgrade: Upgrade) => {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count));
    };

    // オフィスランク計算 (totalEarnedベース)
    const getOfficeRank = () => {
        const earned = resource.totalEarned;
        if (earned > 10000000) return "Global Enterprise";
        if (earned > 1000000) return "Unicorn Startup";
        if (earned > 100000) return "Growing Tech Company";
        if (earned > 10000) return "Small Office in Shibuya";
        if (earned > 1000) return "Garage Startup";
        return "My Bedroom";
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row overflow-hidden">

            {/* 左パネル: プレイエリア */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900 to-slate-950">

                {/* 戻るボタン */}
                <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </Link>

                <div className="absolute top-16 left-4">
                    <div className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-1">APP 030: IDLE STARTUP</div>
                    <div className="text-sm text-emerald-400 font-bold uppercase tracking-widest">
                        {getOfficeRank()}
                    </div>
                </div>

                <div className="text-center mb-8 z-10">
                    <div className="text-sm text-slate-400 mb-1 font-bold">CURRENT BALANCE</div>
                    <div className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">
                        ¥ {Math.floor(resource.money).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 mt-2 flex items-center justify-center gap-4">
                        <span className="flex items-center gap-1"><TrendingUp size={14} /> {autoIncome.toLocaleString()}/sec</span>
                        <span className="flex items-center gap-1"><Code size={14} /> {resource.linesOfCode.toFixed(0)} LoC</span>
                    </div>
                </div>

                {/* メインクリックボタン */}
                <button
                    onClick={handleClick}
                    className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-slate-800 border-8 border-slate-700 shadow-[0_0_50px_rgba(56,189,248,0.2)] hover:scale-105 active:scale-95 transition-all group overflow-visible"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <DesktopIcon size={80} className="text-sky-400 group-hover:text-sky-300 transition-colors" />
                    </div>

                    {/* クリックエフェクト */}
                    {clickEffects.map(effect => (
                        <div
                            key={effect.id}
                            className="absolute text-xl font-bold text-emerald-400 pointer-events-none animate-float-up"
                            style={{ left: effect.x, top: effect.y }}
                        >
                            +{effect.val}
                        </div>
                    ))}
                </button>

                <div className="absolute top-4 right-4">
                    <button
                        onClick={saveGame}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        {isSaved ? <span className="text-emerald-400">Saved!</span> : <Save size={16} />}
                    </button>
                </div>

                {/* 社員表示エリア（簡易） */}
                <div className="absolute bottom-0 w-full h-32 flex items-end justify-center gap-2 pb-4 opacity-50 px-4 flex-wrap overflow-hidden pointer-events-none">
                    {upgrades.filter(u => u.type === 'auto' && u.count > 0).map(u => (
                        Array.from({ length: Math.min(u.count, 5) }).map((_, i) => (
                            <u.icon key={`${u.id}-${i}`} className="w-6 h-6 text-slate-600 animate-bounce" style={{ animationDuration: `${1 + Math.random()}s` }} />
                        ))
                    ))}
                </div>
            </div>

            {/* 右パネル: アップグレードストア */}
            <div className="w-full md:w-[400px] h-[50vh] md:h-screen bg-slate-900 border-l border-slate-800 flex flex-col">
                <header className="p-4 border-b border-slate-800 bg-slate-900 z-10 space-y-2">
                    <h2 className="font-bold flex items-center gap-2">
                        <Building2 className="text-purple-400" />
                        Investments
                    </h2>
                    <div className="text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                        <p><strong>遊び方:</strong></p>
                        <p>中央のMONITORをクリックして資金を稼ぎましょう。貯まったお金で設備投資やスタッフ雇用を行うと、自動で資金が増えていきます。目指せグローバル企業！</p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                    {upgrades.map(upgrade => {
                        const cost = calculateCost(upgrade);
                        const canAfford = resource.money >= cost;
                        const isLocked = upgrade.unlockCondition ? resource.totalEarned < upgrade.unlockCondition : false; // 将来的に実装

                        if (isLocked) return null;

                        return (
                            <button
                                key={upgrade.id}
                                onClick={() => buyUpgrade(upgrade.id)}
                                disabled={!canAfford}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${canAfford
                                    ? "bg-slate-800 border-slate-700 hover:border-purple-500 hover:bg-slate-750"
                                    : "bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed"
                                    }`}
                            >
                                <div className={`p-3 rounded-lg ${canAfford ? "bg-purple-500/10 text-purple-400" : "bg-slate-800 text-slate-600"}`}>
                                    <upgrade.icon size={20} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-bold text-sm text-slate-200">{upgrade.name}</span>
                                        <span className="text-xs font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400">Lvl {upgrade.count}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 truncate mb-1">{upgrade.description}</div>
                                    <div className={`text-sm font-mono font-bold ${canAfford ? "text-emerald-400" : "text-rose-400"}`}>
                                        ¥ {cost.toLocaleString()}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// アイコンコンポーネント (Monitor)
function DesktopIcon({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <line x1="8" x2="16" y1="21" y2="21" />
            <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
    )
}
