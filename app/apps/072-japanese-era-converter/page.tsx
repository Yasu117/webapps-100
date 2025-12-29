
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

const ERAS = [
    { name: "令和", start: 2019 },
    { name: "平成", start: 1989 },
    { name: "昭和", start: 1926 },
    { name: "大正", start: 1912 },
    { name: "明治", start: 1868 },
];

export default function EraConverter() {
    const [year, setYear] = useState(new Date().getFullYear());

    const getEra = (y: number) => {
        for (const era of ERAS) {
            if (y >= era.start) {
                const eraYear = y - era.start + 1;
                return { name: era.name, year: eraYear === 1 ? "元" : eraYear.toString() };
            }
        }
        return null;
    };

    const currentEra = getEra(year);

    return (
        <div className="min-h-screen bg-[#f7f3e8] text-slate-800 font-serif p-4">
            <header className="max-w-md mx-auto flex items-center gap-4 mb-8">
                <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-red-800" /> 年号・西暦変換</h1>
            </header>

            <div className="max-w-md mx-auto mb-6 bg-white p-4 rounded-lg shadow-sm border border-stone-200">
                <div className="text-xs font-bold mb-1 text-red-800">#072</div>
                <div className="text-xs text-slate-600">西暦を入力すると、対応する和暦（令和・平成など）と年齢を表示します。</div>
            </div>

            <div className="max-w-md mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-200 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-[32px] border-r-[32px] border-t-red-600/10 border-r-transparent"></div>

                    <div className="mb-8">
                        <label className="block text-sm text-stone-500 mb-2">西暦</label>
                        <div className="flex justify-center items-center gap-2">
                            <input
                                type="number"
                                className="text-4xl font-bold test-center w-32 text-center border-b-2 border-stone-300 focus:border-red-500 outline-none bg-transparent"
                                value={year}
                                onChange={e => setYear(Number(e.target.value))}
                            />
                            <span className="text-xl text-stone-600">年</span>
                        </div>
                    </div>

                    <div className="w-1 bg-stone-200 h-8 mx-auto mb-8"></div>

                    <div className="bg-stone-50 py-8 rounded-xl border border-stone-100">
                        <label className="block text-sm text-stone-500 mb-2">和暦</label>
                        {currentEra ? (
                            <div className="text-5xl font-bold text-red-800 tracking-widest">
                                {currentEra.name}<span className="mx-2">{currentEra.year}</span>年
                            </div>
                        ) : (
                            <div className="text-stone-400">明治以前</div>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-stone-100 grid grid-cols-2 gap-4 text-left">
                        <div className="bg-white p-4 rounded border border-stone-100">
                            <div className="text-xs text-stone-400 mb-1">年齢 (誕生日がまだ)</div>
                            <div className="text-xl font-bold">{new Date().getFullYear() - year - 1} <span className="text-xs font-normal">歳</span></div>
                        </div>
                        <div className="bg-white p-4 rounded border border-stone-100">
                            <div className="text-xs text-stone-400 mb-1">年齢 (誕生日がきた)</div>
                            <div className="text-xl font-bold">{new Date().getFullYear() - year} <span className="text-xs font-normal">歳</span></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-2">
                    <h2 className="text-sm font-bold text-stone-500 ml-2">速見表</h2>
                    {ERAS.map(e => (
                        <button
                            key={e.name}
                            onClick={() => setYear(e.start)}
                            className="flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow-sm border border-stone-200 hover:bg-stone-50 text-sm"
                        >
                            <span className="font-bold text-stone-700">{e.name}元年</span>
                            <span className="text-stone-500">{e.start}年</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
