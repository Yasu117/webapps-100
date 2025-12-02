"use client";

import React, { useEffect, useState } from "react";

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}`;
};

export default function PomodoroTimerPage() {
    const [workMinutes, setWorkMinutes] = useState<number>(15);
    const [breakMinutes, setBreakMinutes] = useState<number>(5);
    const [mode, setMode] = useState<"work" | "break">("work");
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [remainingSeconds, setRemainingSeconds] = useState<number>(
        15 * 60
    );

    // タイマー本体（useEffect + setInterval）
    useEffect(() => {
        if (!isRunning) return;

        const intervalId = window.setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    // 0 になったら作業↔休憩を自動で切り替え
                    if (mode === "work") {
                        setMode("break");
                        return breakMinutes * 60 || 0;
                    } else {
                        setMode("work");
                        return workMinutes * 60 || 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        // unmount や停止時に Interval を掃除
        return () => {
            window.clearInterval(intervalId);
        };
    }, [isRunning, mode, workMinutes, breakMinutes]);

    // 入力変更時：停止中なら残り時間も更新
    const handleWorkChange = (value: string) => {
        const num = Number(value) || 0;
        setWorkMinutes(num);
        if (!isRunning && mode === "work") {
            setRemainingSeconds(num * 60);
        }
    };

    const handleBreakChange = (value: string) => {
        const num = Number(value) || 0;
        setBreakMinutes(num);
        if (!isRunning && mode === "break") {
            setRemainingSeconds(num * 60);
        }
    };

    const handleStart = () => {
        // 初回スタートで残り時間が0なら、今のモードの分数からセット
        setRemainingSeconds((prev) => {
            if (prev > 0) return prev;
            return (mode === "work" ? workMinutes : breakMinutes) * 60;
        });
        setIsRunning(true);
    };

    const handleStop = () => {
        setIsRunning(false);
    };

    const labelText =
        mode === "work" ? "作業終了まで：" : "休憩終了まで：";

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-label="tomato">
                            🍅
                        </span>
                        <h1 className="text-xl font-bold text-slate-800">
                            ポモドーロタイマー
                        </h1>
                    </div>
                    <button
                        type="button"
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-300 text-slate-500 text-sm"
                        aria-label="設定（ダミー）"
                    >
                        ⚙️
                    </button>
                </div>

                {/* モード表示 */}
                <div className="mb-4 text-center">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${mode === "work"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-sky-50 text-sky-700 border border-sky-200"
                            }`}
                    >
                        {mode === "work" ? "作業中" : "休憩中"}
                    </span>
                </div>

                {/* カウントダウン表示 */}
                <p className="text-center text-sm text-slate-600 mb-1">
                    {labelText}
                </p>
                <p className="text-center text-4xl font-mono font-semibold text-slate-900 mb-6">
                    {formatTime(remainingSeconds)}
                </p>

                {/* 入力欄 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            作業時間（分）
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={workMinutes}
                            onChange={(e) => handleWorkChange(e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            休憩時間（分）
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={breakMinutes}
                            onChange={(e) => handleBreakChange(e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                    </div>
                </div>

                {/* ボタン */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleStart}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition"
                    >
                        <span>▶</span>
                        <span>START</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleStop}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition"
                    >
                        <span>■</span>
                        <span>STOP</span>
                    </button>
                </div>

                {/* 補足テキスト（任意） */}
                <p className="mt-4 text-[11px] text-center text-slate-500">
                    作業と休憩は自動で切り替わります。時間はいつでも変更できます。
                </p>
            </div>
        </div>
    );
}
