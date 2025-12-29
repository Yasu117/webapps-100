
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Code, FileText, Image as ImageIcon } from "lucide-react";
import { clsx } from "clsx";

export default function Base64Encoder() {
    const [activeTab, setActiveTab] = useState<"text" | "image">("text");
    const [inputText, setInputText] = useState("");
    const [inputImage, setInputImage] = useState<string | null>(null);
    const [output, setOutput] = useState("");

    const handleTextEncode = (val: string) => {
        setInputText(val);
        try {
            // Use UTF-8 encoding
            setOutput(btoa(unescape(encodeURIComponent(val))));
        } catch (e) {
            setOutput("Erorr: Invalid input");
        }
    };

    const handleTextDecode = (val: string) => {
        setInputText(val);
        try {
            setOutput(decodeURIComponent(escape(atob(val))));
        } catch (e) {
            // It might be just partial input
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const res = ev.target?.result as string;
                setInputImage(res);
                setOutput(res);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/apps" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Code size={24} className="text-green-400" />
                    Base64 Encoder/Decoder
                </h1>
            </header>

            <div className="max-w-2xl mx-auto mb-6 bg-slate-800 p-3 rounded-lg text-xs text-slate-300 border border-slate-700">
                <span className="font-bold text-green-400 mr-2">#057</span>
                テキストや画像をBase64形式に変換（エンコード・デコード）します。開発時のデータ確認に便利です。
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => { setActiveTab("text"); setOutput(""); setInputText(""); }}
                        className={clsx("flex-1 py-2 rounded-lg text-sm font-bold transition", activeTab === "text" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white")}
                    >
                        Text
                    </button>
                    <button
                        onClick={() => { setActiveTab("image"); setOutput(""); setInputText(""); }}
                        className={clsx("flex-1 py-2 rounded-lg text-sm font-bold transition", activeTab === "image" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white")}
                    >
                        Image
                    </button>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    {activeTab === "text" ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Input Text (Auto Encode)</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-mono h-32 focus:ring-2 focus:ring-green-500 outline-none"
                                    value={inputText}
                                    onChange={e => handleTextEncode(e.target.value)}
                                    placeholder="Type here to encode..."
                                />
                            </div>
                            <div className="flex justify-center text-xs text-slate-500">OR</div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Decode Base64</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm font-mono h-32 focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="Paste Base64 here to decode..."
                                    onChange={e => handleTextDecode(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center">
                            <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 hover:bg-slate-700/50 transition">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" />
                                <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <ImageIcon size={48} className="text-slate-500" />
                                    <span className="text-sm font-bold text-slate-400">Click to upload image</span>
                                </label>
                            </div>
                            {inputImage && (
                                <div className="w-full h-32 relative bg-slate-900/50 rounded-lg overflow-hidden flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={inputImage} alt="Preview" className="max-h-full object-contain" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-xs text-slate-400 font-bold">Result</label>
                    <div className="relative">
                        <textarea
                            readOnly
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-mono h-40 text-green-400 focus:outline-none"
                            value={output}
                        />
                        {output && (
                            <button
                                onClick={() => navigator.clipboard.writeText(output)}
                                className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white text-xs rounded shadow hover:bg-green-500"
                            >
                                Copy
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
