
"use client";

import React, { useState } from "react";
import { ArrowLeft, Ruler, Scale, Thermometer, Box } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

const CATEGORIES = [
    { id: "length", name: "長さ", icon: Ruler },
    { id: "weight", name: "重さ", icon: Scale },
    { id: "temp", name: "温度", icon: Thermometer },
];

const UNITS: any = {
    length: [
        { id: "m", name: "メートル (m)", rate: 1 },
        { id: "km", name: "キロメートル (km)", rate: 1000 },
        { id: "cm", name: "センチメートル (cm)", rate: 0.01 },
        { id: "mm", name: "ミリメートル (mm)", rate: 0.001 },
        { id: "in", name: "インチ (in)", rate: 0.0254 },
        { id: "ft", name: "フィート (ft)", rate: 0.3048 },
        { id: "yd", name: "ヤード (yd)", rate: 0.9144 },
        { id: "mi", name: "マイル (mi)", rate: 1609.34 },
    ],
    weight: [
        { id: "kg", name: "キログラム (kg)", rate: 1 },
        { id: "g", name: "グラム (g)", rate: 0.001 },
        { id: "mg", name: "ミリグラム (mg)", rate: 0.000001 },
        { id: "lb", name: "ポンド (lb)", rate: 0.453592 },
        { id: "oz", name: "オンス (oz)", rate: 0.0283495 },
    ],
    temp: [
        { id: "c", name: "摂氏 (°C)" },
        { id: "f", name: "華氏 (°F)" },
        { id: "k", name: "ケルビン (K)" },
    ],
};

export default function UnitConverter() {
    const [category, setCategory] = useState("length");
    const [val1, setVal1] = useState<string>("1");
    const [unit1, setUnit1] = useState("m");
    const [unit2, setUnit2] = useState("ft");

    // Temperature logic is special
    const convert = (val: number, from: string, to: string, type: string) => {
        if (type === "temp") {
            let celsius = val;
            if (from === "f") celsius = (val - 32) * 5 / 9;
            if (from === "k") celsius = val - 273.15;

            if (to === "c") return celsius;
            if (to === "f") return (celsius * 9 / 5) + 32;
            if (to === "k") return celsius + 273.15;
            return celsius;
        } else {
            const fromRate = UNITS[type].find((u: any) => u.id === from)?.rate || 1;
            const toRate = UNITS[type].find((u: any) => u.id === to)?.rate || 1;
            // Convert to base unit -> convert to target unit
            const base = val * fromRate;
            return base / toRate;
        }
    };

    const handleVal1Change = (v: string) => {
        setVal1(v);
    };

    const calculatedVal2 = val1 === "" ? "" : convert(Number(val1), unit1, unit2, category);

    // When category changes, reset units
    const changeCategory = (c: string) => {
        setCategory(c);
        setUnit1(UNITS[c][0].id);
        setUnit2(UNITS[c][1].id);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/apps" className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-xl text-slate-800">Unit Converter</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-6">

                {/* Categories */}
                <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const active = category === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => changeCategory(cat.id)}
                                className={clsx(
                                    "flex flex-col items-center justify-center py-3 rounded-xl text-sm font-bold transition-all",
                                    active ? "bg-orange-500 text-white shadow-md" : "text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                <Icon size={20} className="mb-1" />
                                {cat.name}
                            </button>
                        )
                    })}
                </div>

                {/* Converter Card */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-orange-500" />

                    {/* Input 1 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <input
                                type="number"
                                value={val1}
                                onChange={(e) => handleVal1Change(e.target.value)}
                                className="w-full text-4xl font-bold bg-transparent focus:outline-none placeholder-slate-200 text-slate-800"
                                placeholder="0"
                            />
                        </div>
                        <select
                            value={unit1}
                            onChange={(e) => setUnit1(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                        >
                            {UNITS[category].map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-center text-slate-300">
                        <Box size={24} className="animate-bounce" />
                    </div>

                    {/* Input 2 (Readonly) */}
                    <div className="space-y-2 opacity-80">
                        <div className="flex justify-between items-center">
                            <div className="w-full text-4xl font-bold text-orange-500 overflow-hidden text-ellipsis">
                                {typeof calculatedVal2 === 'number' ? Number(calculatedVal2.toPrecision(6)) : calculatedVal2}
                            </div>
                        </div>
                        <select
                            value={unit2}
                            onChange={(e) => setUnit2(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                        >
                            {UNITS[category].map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                </div>

            </div>
        </div>
    );
}
