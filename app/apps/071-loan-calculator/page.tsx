
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";

export default function LoanCalculator() {
    const [amount, setAmount] = useState(3000); // 万円
    const [rate, setRate] = useState(1.5); // %
    const [years, setYears] = useState(35);

    const calculate = () => {
        const p = amount * 10000;
        const r = rate / 100 / 12;
        const n = years * 12;

        if (r === 0) {
            const m = Math.floor(p / n);
            return { monthly: m, total: p };
        }

        const monthly = Math.floor(p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
        const total = monthly * n;
        return { monthly, total };
    };

    const { monthly, total } = calculate();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4">
            <header className="max-w-md mx-auto flex items-center gap-4 mb-6">
                <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold flex items-center gap-2"><Calculator className="text-blue-500" />ローン返済シミュレーター</h1>
            </header>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 max-w-md mx-auto">
                <div className="text-xs font-bold mb-1 text-blue-500">#071</div>
                <div className="text-xs text-slate-600">借入金額・金利・期間を入力して、月々の返済額をシミュレーションします。</div>
            </div>

            <div className="max-w-md mx-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">借入金額 (万円)</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    className="flex-1 border bg-slate-50 rounded-lg p-3 text-right text-lg font-bold outline-none focus:ring-2 focus:ring-blue-400"
                                    value={amount}
                                    onChange={e => setAmount(Number(e.target.value))}
                                />
                                <span className="text-sm font-bold">万円</span>
                            </div>
                            <input type="range" min="100" max="10000" step="10" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full mt-2" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">金利 (%)</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    className="flex-1 border bg-slate-50 rounded-lg p-3 text-right text-lg font-bold outline-none focus:ring-2 focus:ring-blue-400"
                                    value={rate}
                                    onChange={e => setRate(Number(e.target.value))}
                                    step="0.01"
                                />
                                <span className="text-sm font-bold">%</span>
                            </div>
                            <input type="range" min="0.1" max="5.0" step="0.01" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full mt-2" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">返済期間 (年)</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    className="flex-1 border bg-slate-50 rounded-lg p-3 text-right text-lg font-bold outline-none focus:ring-2 focus:ring-blue-400"
                                    value={years}
                                    onChange={e => setYears(Number(e.target.value))}
                                />
                                <span className="text-sm font-bold">年</span>
                            </div>
                            <input type="range" min="1" max="50" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full mt-2" />
                        </div>
                    </div>
                </div>

                <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-sm font-bold text-blue-200 mb-4">計算結果 (元利均等・ボーナスなし)</h2>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm">月々の返済額</span>
                        <span className="text-3xl font-bold">{monthly.toLocaleString()} <span className="text-base font-normal">円</span></span>
                    </div>
                    <div className="w-full h-px bg-blue-500 my-4"></div>
                    <div className="flex justify-between items-end">
                        <span className="text-sm">総支払額</span>
                        <span className="text-xl font-bold">{total.toLocaleString()} <span className="text-sm font-normal">円</span></span>
                    </div>
                    <div className="flex justify-between items-end mt-2 text-blue-200 text-sm">
                        <span>うち利息分</span>
                        <span>{(total - amount * 10000).toLocaleString()} 円</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
