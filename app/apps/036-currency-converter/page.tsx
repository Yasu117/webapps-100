
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

const CURRENCIES = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
    { code: "KRW", name: "South Korean Won", flag: "🇰🇷" },
];

export default function CurrencyConverter() {
    const [amount, setAmount] = useState<number>(1);
    const [from, setFrom] = useState("USD");
    const [to, setTo] = useState("JPY");
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");

    const fetchRates = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
            const data = await res.json();
            setRates(data.rates);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (e) {
            console.error(e);
            // Fallback for offline or error
            if (from === "USD" && to === "JPY") setRates({ JPY: 145.5 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, [from]);

    const converted = rates[to] ? (amount * rates[to]).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "---";

    const swap = () => {
        setFrom(to);
        setTo(from);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center pt-8 px-4">
            {/* Header */}
            <div className="w-full max-w-md flex items-center justify-between mb-8">
                <Link href="/apps" className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <span className="font-bold text-lg">通貨コンバーター Pro</span>
                <button onClick={fetchRates} className={`p-2 hover:bg-slate-800 rounded-full transition-colors ${loading ? "animate-spin" : ""}`}>
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-700 relative overflow-hidden">
                {/* Decorative Blob */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />

                <div className="space-y-6 relative z-10">

                    {/* FROM */}
                    <div>
                        <label className="text-slate-400 text-sm font-medium mb-2 block">From</label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-2xl font-bold focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <select
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="w-32 bg-slate-700 border border-slate-600 rounded-xl px-2 text-lg font-bold focus:outline-none"
                            >
                                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center -my-3 relative z-20">
                        <button
                            onClick={swap}
                            className="bg-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-500 transition-transform active:scale-95"
                        >
                            <ArrowRightLeft size={20} />
                        </button>
                    </div>

                    {/* TO */}
                    <div>
                        <label className="text-slate-400 text-sm font-medium mb-2 block">To</label>
                        <div className="flex gap-4">
                            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center">
                                <span className="text-2xl font-bold text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {converted}
                                </span>
                            </div>
                            <select
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="w-32 bg-slate-700 border border-slate-600 rounded-xl px-2 text-lg font-bold focus:outline-none"
                            >
                                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="pt-4 border-t border-slate-700 flex justify-between text-xs text-slate-500">
                        <span>Rate: 1 {from} = {rates[to]?.toFixed(3)} {to}</span>
                        <span>Updated: {lastUpdated}</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
