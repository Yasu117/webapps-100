
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Layout } from "lucide-react";

export default function FlexboxPlayground() {
    const [flexDirection, setFlexDirection] = useState("row");
    const [justifyContent, setJustifyContent] = useState("flex-start");
    const [alignItems, setAlignItems] = useState("stretch");
    const [flexWrap, setFlexWrap] = useState("nowrap");
    const [gap, setGap] = useState("1rem");

    const [itemCount, setItemCount] = useState(5);

    const cssCode = `.container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap};
}`;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col md:flex-row">
            {/* Controls Panel */}
            <div className="w-full md:w-80 bg-slate-800 border-r border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/apps" className="text-slate-400 hover:text-white"><ArrowLeft size={20} /></Link>
                    <h1 className="font-bold text-lg text-white flex gap-2 items-center"><Layout size={20} /> Flexbox</h1>
                </div>

                <div className="bg-slate-700/50 p-2 rounded text-[10px] text-slate-300 mb-4 border border-slate-600">
                    <span className="font-bold text-blue-300 mr-2">#059</span>
                    Flexboxのプロパティを操作してレイアウトを確認できます。
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 font-bold block mb-2">flex-direction</label>
                        <div className="flex flex-wrap gap-2">
                            {["row", "column", "row-reverse", "column-reverse"].map(val => (
                                <button key={val} onClick={() => setFlexDirection(val)} className={`px-2 py-1 text-xs rounded border ${flexDirection === val ? "bg-blue-600 border-blue-500 text-white" : "border-slate-600 text-slate-400 hover:border-slate-400"}`}>{val}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold block mb-2">justify-content</label>
                        <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm" value={justifyContent} onChange={e => setJustifyContent(e.target.value)}>
                            {["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold block mb-2">align-items</label>
                        <div className="flex flex-wrap gap-2">
                            {["stretch", "flex-start", "flex-end", "center", "baseline"].map(val => (
                                <button key={val} onClick={() => setAlignItems(val)} className={`px-2 py-1 text-xs rounded border ${alignItems === val ? "bg-blue-600 border-blue-500 text-white" : "border-slate-600 text-slate-400 hover:border-slate-400"}`}>{val}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold block mb-2">flex-wrap</label>
                        <div className="flex flex-wrap gap-2">
                            {["nowrap", "wrap", "wrap-reverse"].map(val => (
                                <button key={val} onClick={() => setFlexWrap(val)} className={`px-2 py-1 text-xs rounded border ${flexWrap === val ? "bg-blue-600 border-blue-500 text-white" : "border-slate-600 text-slate-400 hover:border-slate-400"}`}>{val}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold block mb-2">Item Count</label>
                        <input type="range" min="1" max="20" value={itemCount} onChange={e => setItemCount(parseInt(e.target.value))} className="w-full" />
                    </div>
                </div>

                <div className="mt-auto bg-slate-900 rounded-lg p-3 text-xs font-mono relative group">
                    <pre className="text-blue-300">{cssCode}</pre>
                    <button
                        onClick={() => navigator.clipboard.writeText(cssCode)}
                        className="absolute top-2 right-2 p-1 bg-white/10 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition hover:bg-white/20 hover:text-white"
                    >
                        <Copy size={14} />
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-slate-950 p-4 relative overflow-hidden flex flex-col">
                <div
                    className="flex-1 rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/50 overflow-auto transition-all duration-300"
                    style={{
                        display: 'flex',
                        flexDirection: flexDirection as any,
                        justifyContent: justifyContent as any,
                        alignItems: alignItems as any,
                        flexWrap: flexWrap as any,
                        gap: gap,
                        padding: '1rem' // Internal padding
                    }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div
                            key={i}
                            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg shadow-lg flex items-center justify-center font-bold text-white text-xl animate-in zoom-in duration-300"
                            style={{ minWidth: '4rem', minHeight: '4rem' }}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
