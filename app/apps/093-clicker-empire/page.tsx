
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Code, Coffee, Server, Database, Brain } from "lucide-react";
import { clsx } from "clsx";

type Building = {
    id: string;
    name: string;
    cost: number;
    cps: number; // clicks per second (or lines/sec)
    icon: React.ReactNode;
};

const BUILDINGS: Building[] = [
    { id: "coffee", name: "Coffee", cost: 15, cps: 0.1, icon: <Coffee size={16} /> },
    { id: "keyboard", name: "Mech Keyboard", cost: 100, cps: 1, icon: <Code size={16} /> },
    { id: "junior", name: "Junior Dev", cost: 1100, cps: 8, icon: "👶" },
    { id: "server", name: "Dev Server", cost: 12000, cps: 47, icon: <Server size={16} /> },
    { id: "database", name: "Database", cost: 130000, cps: 260, icon: <Database size={16} /> },
    { id: "senior", name: "Senior Dev", cost: 1400000, cps: 1400, icon: "👴" },
    { id: "ai", name: "AI Copilot", cost: 20000000, cps: 7800, icon: <Brain size={16} /> },
];

export default function ClickerEmpire() {
    const [lines, setLines] = useState(0);
    const [inventory, setInventory] = useState<Record<string, number>>({});
    const [lifetimeLines, setLifetimeLines] = useState(0);

    // Load
    useEffect(() => {
        const saved = localStorage.getItem("app093-save");
        if (saved) {
            const data = JSON.parse(saved);
            setLines(data.lines || 0);
            setInventory(data.inventory || {});
            setLifetimeLines(data.lifetimeLines || 0);
        }
    }, []);

    // Save
    useEffect(() => {
        localStorage.setItem("app093-save", JSON.stringify({ lines, inventory, lifetimeLines }));
    }, [lines, inventory, lifetimeLines]);

    // Loop
    useEffect(() => {
        const timer = setInterval(() => {
            let passiveGain = 0;
            BUILDINGS.forEach(b => {
                const count = inventory[b.id] || 0;
                passiveGain += count * b.cps;
            });

            if (passiveGain > 0) {
                const gain = passiveGain / 10; // 10 ticks per sec
                setLines(l => l + gain);
                setLifetimeLines(l => l + gain);
            }
        }, 100);
        return () => clearInterval(timer);
    }, [inventory]);

    const handleClick = () => {
        setLines(l => l + 1);
        setLifetimeLines(l => l + 1);
    };

    const buy = (b: Building) => {
        const cost = Math.floor(b.cost * Math.pow(1.15, inventory[b.id] || 0));
        if (lines >= cost) {
            setLines(l => l - cost);
            setInventory(prev => ({
                ...prev,
                [b.id]: (prev[b.id] || 0) + 1
            }));
        }
    };

    const totalCps = BUILDINGS.reduce((acc, b) => acc + (inventory[b.id] || 0) * b.cps, 0);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 overflow-hidden">
            <header className="flex items-center gap-4 mb-4">
                <Link href="/apps" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"><ArrowLeft size={20} /></Link>
                <div>
                    <h1 className="text-xl font-bold">#093 Dev Clicker</h1>
                    <div className="text-xs text-slate-400">Total Code Written: {Math.floor(lifetimeLines)} lines</div>
                </div>
            </header>

            <div className="grid md:grid-cols-[300px_1fr] gap-8 h-[calc(100vh-100px)]">
                {/* Click Area */}
                <div className="bg-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                    <div className="text-slate-400 font-bold mb-2">Lines of Code</div>
                    <div className="text-5xl font-black mb-8 font-mono text-green-400 truncate w-full text-center">
                        {Math.floor(lines).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 mb-8 font-mono">{totalCps.toFixed(1)} lines/sec</div>

                    <button
                        onClick={handleClick}
                        className="w-48 h-48 bg-blue-600 rounded-full shadow-[0_0_50px_rgba(37,99,235,0.4)] flex items-center justify-center text-6xl hover:scale-105 active:scale-95 transition-transform"
                    >
                        ⌨️
                    </button>

                    {/* Floating Code Particles could be added here */}
                </div>

                {/* Shop */}
                <div className="bg-slate-800 rounded-3xl p-4 overflow-y-auto custom-scrollbar">
                    <h2 className="text-xl font-bold mb-4 px-2">Upgrades</h2>
                    <div className="space-y-2">
                        {BUILDINGS.map(b => {
                            const count = inventory[b.id] || 0;
                            const cost = Math.floor(b.cost * Math.pow(1.15, count));
                            const canBuy = lines >= cost;

                            return (
                                <button
                                    key={b.id}
                                    onClick={() => buy(b)}
                                    disabled={!canBuy}
                                    className={clsx(
                                        "w-full flex items-center justify-between p-4 rounded-xl transition border-2",
                                        canBuy
                                            ? "bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-blue-500"
                                            : "bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-2xl">
                                            {b.icon}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">{b.name}</div>
                                            <div className="text-xs text-green-400 font-mono">Cost: {cost.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-500">{count}</div>
                                        <div className="text-xs text-slate-600">+{b.cps} cps</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
