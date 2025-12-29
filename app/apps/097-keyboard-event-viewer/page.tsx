
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Keyboard, Trash2 } from "lucide-react";
import { clsx } from "clsx";

type KeyEvent = {
    key: string;
    code: string;
    keyCode: number; // Deprecated but still asked for
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    timestamp: number;
};

export default function KeyboardViewer() {
    const [events, setEvents] = useState<KeyEvent[]>([]);
    const [lastEvent, setLastEvent] = useState<KeyEvent | null>(null);

    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            e.preventDefault();
            const evt = {
                key: e.key,
                code: e.code,
                keyCode: e.keyCode,
                shiftKey: e.shiftKey,
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
                timestamp: Date.now()
            };
            setLastEvent(evt);
            setEvents(prev => [evt, ...prev].slice(0, 50));
        };

        window.addEventListener("keydown", handleDown);
        return () => window.removeEventListener("keydown", handleDown);
    }, []);

    const clear = () => {
        setEvents([]);
        setLastEvent(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 font-sans flex flex-col items-center">
            <header className="max-w-4xl w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><ArrowLeft size={20} /></Link>
                    <h1 className="text-xl font-bold">#097 Keyboard Event Viewer</h1>
                </div>
                <button onClick={clear} className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-bold transition">
                    <Trash2 size={16} /> Clear
                </button>
            </header>

            {/* Big Display */}
            <div className="max-w-4xl w-full bg-white p-12 rounded-3xl shadow-xl border border-slate-200 mb-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                {!lastEvent ? (
                    <div className="text-slate-300 flex flex-col items-center gap-4">
                        <Keyboard size={64} />
                        <span className="text-2xl font-bold">Press any key</span>
                    </div>
                ) : (
                    <>
                        <div className="text-9xl font-black text-blue-600 mb-4 font-mono">
                            {lastEvent.keyCode}
                        </div>
                        <div className="text-4xl font-bold text-slate-700 font-mono mb-8">
                            {lastEvent.code}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-xs text-slate-400 font-bold uppercase mb-1">e.key</div>
                                <div className="text-xl font-mono text-slate-800">"{lastEvent.key}"</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-xs text-slate-400 font-bold uppercase mb-1">e.code</div>
                                <div className="text-xl font-mono text-slate-800">{lastEvent.code}</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-xs text-slate-400 font-bold uppercase mb-1">e.keyCode</div>
                                <div className="text-xl font-mono text-slate-800">{lastEvent.keyCode}</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-2 items-center justify-center">
                                {lastEvent.shiftKey && <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold">Shift</span>}
                                {lastEvent.ctrlKey && <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">Ctrl</span>}
                                {lastEvent.altKey && <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs font-bold">Alt</span>}
                                {lastEvent.metaKey && <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-bold">Meta</span>}
                                {!lastEvent.shiftKey && !lastEvent.ctrlKey && !lastEvent.altKey && !lastEvent.metaKey && <span className="text-slate-300 text-xs">No Modifier</span>}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* History Table */}
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-bold">Key</th>
                            <th className="p-4 font-bold">Code</th>
                            <th className="p-4 font-bold">KeyCode</th>
                            <th className="p-4 font-bold hidden md:table-cell">Modifiers</th>
                            <th className="p-4 font-bold text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {events.map((e, i) => (
                            <tr key={e.timestamp + i} className={clsx("hover:bg-slate-50", i === 0 && "bg-blue-50/50")}>
                                <td className="p-4 font-mono font-bold">"{e.key}"</td>
                                <td className="p-4 font-mono text-slate-600">{e.code}</td>
                                <td className="p-4 font-mono text-slate-400">{e.keyCode}</td>
                                <td className="p-4 hidden md:table-cell">
                                    <div className="flex gap-1">
                                        {e.shiftKey && <div className="w-2 h-2 rounded-full bg-blue-400" title="Shift" />}
                                        {e.ctrlKey && <div className="w-2 h-2 rounded-full bg-green-400" title="Ctrl" />}
                                        {e.altKey && <div className="w-2 h-2 rounded-full bg-yellow-400" title="Alt" />}
                                        {e.metaKey && <div className="w-2 h-2 rounded-full bg-purple-400" title="Meta" />}
                                    </div>
                                </td>
                                <td className="p-4 text-right text-slate-400 font-mono text-xs">
                                    {new Date(e.timestamp).toLocaleTimeString().split(' ')[0]}.{new Date(e.timestamp).getMilliseconds().toString().padStart(3, '0')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
