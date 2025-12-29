
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowLeftRight, Copy } from "lucide-react";
import { clsx } from "clsx";

export default function JsonCsvConverter() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"json2csv" | "csv2json">("json2csv");
    const [error, setError] = useState("");

    const convert = () => {
        setError("");
        setOutput("");
        if (!input.trim()) return;

        try {
            if (mode === "json2csv") {
                const jsonData = JSON.parse(input);
                const array = Array.isArray(jsonData) ? jsonData : [jsonData];
                if (array.length === 0) return;

                // Collect all keys
                const keys = Array.from(new Set(array.flatMap(obj => Object.keys(obj))));
                const csv = [
                    keys.join(","),
                    ...array.map(obj => keys.map(k => {
                        const val = obj[k];
                        return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val
                    }).join(","))
                ].join("\n");
                setOutput(csv);

            } else {
                // CSV to JSON (Simple implementation)
                const lines = input.trim().split("\n");
                if (lines.length < 2) throw new Error("Invalid CSV");

                const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
                const result = lines.slice(1).map(line => {
                    // Simple split handling (doesn't handle commas inside quotes perfectly)
                    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
                    const obj: any = {};
                    headers.forEach((h, i) => {
                        obj[h] = values[i];
                    });
                    return obj;
                });
                setOutput(JSON.stringify(result, null, 2));
            }
        } catch (e) {
            setError("変換エラー: 入力形式を確認してください。");
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4">
            <header className="flex items-center gap-4 mb-6">
                <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-50">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <ArrowLeftRight size={24} className="text-blue-500" />
                    JSON ↔ CSV Converter
                </h1>
            </header>

            <div className="mb-4 bg-white p-3 rounded-lg text-xs text-slate-600 shadow-sm border border-slate-200">
                <span className="font-bold mr-2 text-blue-600">#056</span>
                JSONとCSVを相互に変換します。テキストエリアに入力してモードを切り替えてください。
            </div>

            <div className="grid md:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-slate-500">Input ({mode === "json2csv" ? "JSON" : "CSV"})</label>
                    <textarea
                        className="flex-1 w-full p-4 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-inner"
                        placeholder={mode === "json2csv" ? '[{"id":1, "name":"Alice"}]' : 'id,name\n1,Alice'}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2 relative">
                    <div className="absolute top-1/2 left-[-20px] md:left-[-30px] z-10 -translate-y-1/2 hidden md:block">
                        <button
                            onClick={convert}
                            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition active:scale-95"
                        >
                            <ArrowLeftRight />
                        </button>
                    </div>

                    {/* Mobile Convert Button */}
                    <div className="md:hidden flex justify-center py-2">
                        <button
                            onClick={convert}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg active:scale-95"
                        >
                            <ArrowLeftRight size={18} /> Convert
                        </button>
                    </div>

                    <label className="font-bold text-sm text-slate-500 flex justify-between">
                        <span>Output ({mode === "json2csv" ? "CSV" : "JSON"})</span>
                        <button onClick={() => setMode(m => m === "json2csv" ? "csv2json" : "json2csv")} className="text-blue-600 text-xs hover:underline">
                            モード切替: {mode === "json2csv" ? "JSON → CSV" : "CSV → JSON"}
                        </button>
                    </label>

                    <div className="relative flex-1">
                        <textarea
                            readOnly
                            className={clsx(
                                "w-full h-full p-4 rounded-xl border border-slate-300 font-mono text-xs outline-none bg-slate-50 resize-none",
                                error && "border-red-500 bg-red-50"
                            )}
                            value={error || output}
                        />
                        {output && !error && (
                            <button
                                onClick={() => navigator.clipboard.writeText(output)}
                                className="absolute top-4 right-4 p-2 bg-white/80 rounded-lg text-slate-600 hover:text-blue-600 shadow-sm"
                            >
                                <Copy size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
