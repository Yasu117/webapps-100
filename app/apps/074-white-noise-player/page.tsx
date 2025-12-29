
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, Volume2 } from "lucide-react";

export default function WhiteNoisePlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Multiple Noise sources
    const noises = useRef<{
        white: GainNode | null;
        pink: GainNode | null;
        brown: GainNode | null;
    }>({ white: null, pink: null, brown: null });

    const [volumes, setVolumes] = useState({
        white: 0.2,
        pink: 0,
        brown: 0
    });

    const initAudio = () => {
        if (audioContextRef.current) return;

        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const createNoise = (type: "white" | "pink" | "brown") => {
            const bufferSize = 2 * ctx.sampleRate;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            if (type === "white") {
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
            } else if (type === "pink") {
                let b0, b1, b2, b3, b4, b5, b6;
                b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    let white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    data[i] *= 0.11; // (roughly) compensate for gain
                    b6 = white * 0.115926;
                }
            } else if (type === "brown") {
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    let white = Math.random() * 2 - 1;
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5; // (roughly) compensate for gain
                }
            }

            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = buffer;
            noiseSrc.loop = true;

            const gainNode = ctx.createGain();
            noiseSrc.connect(gainNode);
            gainNode.connect(ctx.destination);

            noiseSrc.start();
            gainNode.gain.value = 0; // Start muted
            return gainNode;
        };

        noises.current.white = createNoise("white");
        noises.current.pink = createNoise("pink");
        noises.current.brown = createNoise("brown");
    };

    const togglePlay = () => {
        if (!audioContextRef.current) initAudio();

        if (audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume();
        }

        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const t = ctx.currentTime;

        // Update gains based on playing state AND volumes
        if (isPlaying) {
            noises.current.white?.gain.setTargetAtTime(volumes.white, t, 0.1);
            noises.current.pink?.gain.setTargetAtTime(volumes.pink, t, 0.1);
            noises.current.brown?.gain.setTargetAtTime(volumes.brown, t, 0.1);
        } else {
            noises.current.white?.gain.setTargetAtTime(0, t, 0.1);
            noises.current.pink?.gain.setTargetAtTime(0, t, 0.1);
            noises.current.brown?.gain.setTargetAtTime(0, t, 0.1);
        }
    }, [isPlaying, volumes]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 flex flex-col items-center justify-center">
            <Link href="/apps" className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20"><ArrowLeft size={24} /></Link>

            <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-700">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-1">Focus Noise</h1>
                    <p className="text-slate-400 text-sm mb-2">Mix your perfect background sound</p>
                    <div className="text-xs text-slate-500 font-bold">#074 集中力を高める環境音を作成</div>
                </div>

                <div className="space-y-6 mb-8">
                    {["white", "pink", "brown"].map((type) => (
                        <div key={type} className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-bold capitalize">
                                <span>{type} Noise</span>
                                <span>{Math.round((volumes as any)[type] * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Volume2 size={16} className="text-slate-500" />
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={(volumes as any)[type]}
                                    onChange={(e) => setVolumes({ ...volumes, [type]: parseFloat(e.target.value) })}
                                    className="w-full accent-blue-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={togglePlay}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isPlaying ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-blue-600 text-white shadow-lg hover:shadow-blue-500/50 hover:bg-blue-500"}`}
                >
                    {isPlaying ? <Pause /> : <Play />}
                    {isPlaying ? "Stop" : "Play"}
                </button>
            </div>
        </div>
    );
}
