
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Copy, Check, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function PasswordGenerator() {
    const [password, setPassword] = useState("");
    const [length, setLength] = useState(12);
    const [includeUpper, setIncludeUpper] = useState(true);
    const [includeNumber, setIncludeNumber] = useState(true);
    const [includeSymbol, setIncludeSymbol] = useState(true);
    const [copied, setCopied] = useState(false);

    const generate = () => {
        const lowers = "abcdefghijklmnopqrstuvwxyz";
        const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        let chars = lowers;
        if (includeUpper) chars += uppers;
        if (includeNumber) chars += numbers;
        if (includeSymbol) chars += symbols;

        let ret = "";
        for (let i = 0; i < length; i++) {
            ret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(ret);
        setCopied(false);
    };

    useEffect(() => {
        generate();
    }, [length, includeUpper, includeNumber, includeSymbol]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const score = [includeUpper, includeNumber, includeSymbol, length >= 12].filter(Boolean).length;
    const strength = score === 4 ? "Very Strong" : score === 3 ? "Strong" : score === 2 ? "Medium" : "Weak";
    const strengthColor = score === 4 ? "bg-green-500" : score === 3 ? "bg-blue-500" : score === 2 ? "bg-yellow-500" : "bg-red-500";

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            {/* Header (Back button only for simplicity in centering) */}
            <Link href="/apps" className="absolute top-4 left-4 p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
                <ArrowLeft size={24} />
            </Link>

            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Secure Password
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Generate strong passwords instantly</p>
                </div>

                {/* Display */}
                <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl relative group border border-slate-700">
                    <div className="text-center mb-2">
                        <span className={clsx("text-3xl font-mono font-bold break-all", copied ? "text-green-400" : "text-white")}>
                            {password}
                        </span>
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-bold"
                        >
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                        <button
                            onClick={generate}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm font-bold"
                        >
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>

                    {/* Strength Indicator */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-700 rounded-t-2xl overflow-hidden">
                        <div className={clsx("h-full transition-all duration-500", strengthColor)} style={{ width: `${(score / 4) * 100}%` }} />
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 space-y-6">

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-slate-300">Length</label>
                            <span className="text-blue-400 font-mono font-bold">{length}</span>
                        </div>
                        <input
                            type="range"
                            min="6"
                            max="32"
                            value={length}
                            onChange={(e) => setLength(Number(e.target.value))}
                            className="w-full accent-blue-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-3">
                        <Toggle label="Uppercase (A-Z)" checked={includeUpper} onChange={setIncludeUpper} />
                        <Toggle label="Numbers (0-9)" checked={includeNumber} onChange={setIncludeNumber} />
                        <Toggle label="Symbols (!@#...)" checked={includeSymbol} onChange={setIncludeSymbol} />
                    </div>

                </div>
            </div>
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (b: boolean) => void }) {
    return (
        <div
            onClick={() => onChange(!checked)}
            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
        >
            <span className="text-sm font-medium text-slate-300">{label}</span>
            <div className={clsx("w-12 h-6 rounded-full p-1 transition-colors relative", checked ? "bg-blue-600" : "bg-slate-600")}>
                <div className={clsx("w-4 h-4 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-6" : "translate-x-0")} />
            </div>
        </div>
    )
}
