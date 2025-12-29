
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

const COLORS = ["red", "green", "blue", "yellow"] as const;

export default function SimonSays() {
    const [sequence, setSequence] = useState<typeof COLORS[number][]>([]);
    const [userStep, setUserStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [message, setMessage] = useState("Press Start");
    const [activeColor, setActiveColor] = useState<string | null>(null);

    const playSound = (color: string) => {
        // Simple tone generation could go here using Web Audio API
        // For now, visual only
    };

    const startGame = () => {
        setSequence([]);
        setUserStep(0);
        setIsPlaying(true);
        setMessage("Watch carefully...");
        nextRound([]);
    };

    const nextRound = async (currentSeq: typeof COLORS[number][]) => {
        const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const newSeq = [...currentSeq, nextColor];
        setSequence(newSeq);
        setUserStep(0);

        setIsShowingSequence(true);
        setMessage(`Round ${newSeq.length}`);

        // Play sequence
        for (const color of newSeq) {
            await new Promise(r => setTimeout(r, 500));
            setActiveColor(color);
            playSound(color);
            await new Promise(r => setTimeout(r, 500));
            setActiveColor(null);
        }

        setIsShowingSequence(false);
        setMessage("Your Turn!");
    };

    const handlePress = (color: typeof COLORS[number]) => {
        if (!isPlaying || isShowingSequence) return;

        setActiveColor(color);
        playSound(color);
        setTimeout(() => setActiveColor(null), 200);

        if (color !== sequence[userStep]) {
            // Game Over
            setIsPlaying(false);
            setMessage(`Game Over! Score: ${sequence.length - 1}`);
            return;
        }

        const nextStep = userStep + 1;
        if (nextStep === sequence.length) {
            // Success, next round
            setUserStep(0);
            setIsShowingSequence(true);
            setTimeout(() => nextRound(sequence), 1000);
        } else {
            setUserStep(nextStep);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <Link href="/apps" className="absolute top-4 left-4 text-slate-400 hover:text-white">
                <ArrowLeft size={24} />
            </Link>

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Simon Says</h1>
                <p className="text-xl text-green-400 font-mono h-8">{message}</p>
                <div className="text-slate-500 text-xs mt-2 font-medium">#067 光った色の順番を覚えてタップしてください</div>
            </div>

            <div className="relative w-64 h-64 rounded-full overflow-hidden grid grid-cols-2 gap-2 p-2 bg-slate-800 shadow-2xl transform transition-all active:scale-[0.99]">
                {/* Top Left - Green */}
                <button
                    className={clsx(
                        "bg-green-600 rounded-tl-full hover:bg-green-500 transition-colors duration-100",
                        activeColor === "green" && "bg-green-300 shadow-[0_0_30px_rgba(34,197,94,0.8)] z-10"
                    )}
                    onClick={() => handlePress("green")}
                />
                {/* Top Right - Red */}
                <button
                    className={clsx(
                        "bg-red-600 rounded-tr-full hover:bg-red-500 transition-colors duration-100",
                        activeColor === "red" && "bg-red-300 shadow-[0_0_30px_rgba(239,68,68,0.8)] z-10"
                    )}
                    onClick={() => handlePress("red")}
                />
                {/* Bottom Left - Yellow */}
                <button
                    className={clsx(
                        "bg-yellow-500 rounded-bl-full hover:bg-yellow-400 transition-colors duration-100",
                        activeColor === "yellow" && "bg-yellow-200 shadow-[0_0_30px_rgba(234,179,8,0.8)] z-10"
                    )}
                    onClick={() => handlePress("yellow")}
                />
                {/* Bottom Right - Blue */}
                <button
                    className={clsx(
                        "bg-blue-600 rounded-br-full hover:bg-blue-500 transition-colors duration-100",
                        activeColor === "blue" && "bg-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.8)] z-10"
                    )}
                    onClick={() => handlePress("blue")}
                />

                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-800 pointer-events-auto">
                        {!isPlaying && (
                            <button onClick={startGame} className="text-white hover:text-green-400 transition">
                                {sequence.length > 0 ? <RefreshCw size={24} /> : <Play size={24} className="ml-1" />}
                            </button>
                        )}
                        {isPlaying && (
                            <span className="text-white font-bold text-xl">{sequence.length}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
