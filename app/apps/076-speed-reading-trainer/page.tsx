
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

const DEFAULT_TEXT = `Reading is a complex cognitive process of decoding symbols in order to construct or derive meaning. Reading is a means of language acquisition, communication, and of sharing information and ideas. Like all languages, it is a complex interaction between the text and the reader which is shaped by the reader's prior knowledge, experiences, attitude, and language community which the reader is culturally and socially situated. The reading process requires continuous practice, development, and refinement. In addition, reading requires creativity and critical analysis. Consumers of literature use reading interpretation to make sense of the texts they read. Speed reading is any of several techniques used to improve one's ability to read quickly. Speed reading methods include chunking and minimizing subvocalization. The many available speed reading training programs typically include books, videos, software, and seminars.`;

export default function SpeedReadingTrainer() {
    const [text, setText] = useState(DEFAULT_TEXT);
    const [words, setWords] = useState<string[]>([]);
    const [wpm, setWpm] = useState(300);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setWords(text.trim().split(/\s+/));
        setCurrentIndex(0);
        setIsPlaying(false);
    }, [text]);

    useEffect(() => {
        if (isPlaying && currentIndex < words.length) {
            const delay = 60000 / wpm;
            intervalRef.current = setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, delay);
        } else if (currentIndex >= words.length) {
            setIsPlaying(false);
        }

        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [isPlaying, currentIndex, wpm, words.length]);

    const togglePlay = () => {
        if (currentIndex >= words.length) setCurrentIndex(0);
        setIsPlaying(!isPlaying);
    };

    const reset = () => {
        setIsPlaying(false);
        setCurrentIndex(0);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4">
            <header className="max-w-3xl mx-auto flex items-center gap-4 mb-6">
                <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#076 Speed Reading Trainer</h1>
            </header>

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Display Area */}
                <div className="bg-white h-64 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-xs font-bold text-slate-400">
                        {currentIndex} / {words.length}
                    </div>
                    {/* Center guide lines */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-100"></div>
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-red-100"></div>

                    <div className="text-6xl font-black text-slate-800 z-10 text-center px-4 leading-tight">
                        {currentIndex < words.length ? words[currentIndex] : <span className="text-slate-300">Finished</span>}
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlay}
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${isPlaying ? "bg-amber-500" : "bg-blue-600"}`}
                        >
                            {isPlaying ? <Pause /> : <Play className="ml-1" />}
                        </button>
                        <button onClick={reset} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600">
                            <RotateCcw size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <span className="font-bold text-slate-500 whitespace-nowrap">Speed (WPM)</span>
                        <input
                            type="range"
                            min="60"
                            max="1000"
                            step="10"
                            value={wpm}
                            onChange={(e) => setWpm(Number(e.target.value))}
                            className="w-full md:w-48"
                        />
                        <span className="font-mono font-bold text-lg w-12 text-right">{wpm}</span>
                    </div>
                </div>

                {/* Text Input */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-sm text-slate-500 mb-2">Training Text</h3>
                    <textarea
                        className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="mt-2 text-xs text-slate-400">
                        Paste your own text here to practice.
                    </div>
                </div>
            </div>
        </div>
    );
}
