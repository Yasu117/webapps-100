
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, RefreshCw, Copy, Eye, EyeOff } from "lucide-react";
import { clsx } from "clsx";

export default function PasswordStrength() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const calculateStrength = (pwd: string) => {
        let score = 0;
        if (!pwd) return 0;
        if (pwd.length > 8) score += 1;
        if (pwd.length > 12) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
        return score; // Max 5
    };

    const estimateCrackTime = (pwd: string) => {
        if (!pwd) return "Instant";
        // Very rough estimation
        const pool = 26 + (/[A-Z]/.test(pwd) ? 26 : 0) + (/[0-9]/.test(pwd) ? 10 : 0) + (/[^A-Za-z0-9]/.test(pwd) ? 32 : 0);
        const combinations = Math.pow(pool, pwd.length);
        const speed = 1e9; // 1 billion guesses/sec
        const seconds = combinations / speed;

        if (seconds < 1) return "Instantly";
        if (seconds < 60) return "Few seconds";
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
        if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
        if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
        return "Centuries";
    };

    const strength = calculateStrength(password);
    const crackTime = estimateCrackTime(password);

    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    const strengthColors = ["bg-slate-200", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let pass = "";
        for (let i = 0; i < 16; i++) {
            pass += chars[Math.floor(Math.random() * chars.length)];
        }
        setPassword(pass);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Link href="/apps" className="absolute top-4 left-4 p-2 bg-white rounded-full shadow hover:bg-slate-100"><ArrowLeft size={20} /></Link>

            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <header className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">#080 Password Checker</h1>
                        <p className="text-xs text-slate-500">Analyze Strength & Entropy</p>
                    </div>
                </header>

                <div className="relative mb-6">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pr-12 text-lg font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        placeholder="Enter password..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Strength Meter */}
                <div className="space-y-4 mb-8">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4, 5].map(step => (
                            <div
                                key={step}
                                className={clsx("flex-1 transition-colors duration-500", step <= strength ? strengthColors[strength] : "bg-transparent")}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-400">Strength</span>
                        <span className={clsx("transition-colors", strength >= 4 ? "text-green-600" : strength >= 2 ? "text-yellow-600" : "text-red-500")}>
                            {strengthLabels[strength]}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-4 mt-2">
                        <span className="text-slate-400">Est. Crack Time</span>
                        <span className="font-mono font-bold text-slate-700">{crackTime}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={generatePassword}
                        className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                    >
                        <RefreshCw size={18} /> Gen Random
                    </button>
                    <button
                        onClick={() => navigator.clipboard.writeText(password)}
                        className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
                        disabled={!password}
                    >
                        <Copy size={18} /> Copy
                    </button>
                </div>
            </div>
        </div>
    );
}
