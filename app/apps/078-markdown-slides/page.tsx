
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

const DEFAULT_DECK = `
# Markdown Slides
---
## What is this?
A simple presentation tool powered by Markdown.
---
## Features
- Splitted by \`---\`
- Standard Markdown support
- **Bold**, *Italic*, \`Code\`
---
## Code Example
\`\`\`javascript
console.log("Hello Slides!");
\`\`\`
---
# Thank You!
`;

export default function MarkdownSlides() {
    const [source, setSource] = useState(DEFAULT_DECK);
    const [mode, setMode] = useState<"edit" | "present">("edit");
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = source.split(/\n---\n/).map(s => s.trim()).filter(s => s);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    // Keyboard navigation
    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (mode === "present") {
                if (e.key === "ArrowRight" || e.key === "Space") nextSlide();
                if (e.key === "ArrowLeft") prevSlide();
                if (e.key === "Escape") setMode("edit");
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [mode, slides.length]); // Dependencies slightly tricky but slides length shouldn't change in present mode

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans">
            {mode === "edit" ? (
                <div className="flex flex-col h-screen">
                    <header className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-4">
                            <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><ArrowLeft size={20} /></Link>
                            <div>
                                <h1 className="text-xl font-bold">#078 Markdown Slides</h1>
                                <p className="text-xs text-slate-500">Separate slides with `---`</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setMode("present"); setCurrentSlide(0); }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                        >
                            <Maximize size={18} /> Present
                        </button>
                    </header>
                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-1/2 p-4 border-r border-slate-200 bg-slate-50">
                            <textarea
                                className="w-full h-full p-4 font-mono text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                value={source}
                                onChange={e => setSource(e.target.value)}
                            />
                        </div>
                        <div className="w-1/2 p-8 overflow-y-auto bg-white flex flex-col items-center justify-center">
                            <div className="prose prose-slate lg:prose-xl text-center">
                                <p className="text-slate-400 text-sm mb-4">Preview of Slide 1</p>
                                <ReactMarkdown>{slides[0]}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
                    <div className="max-w-4xl w-full p-12 aspect-video bg-white text-slate-900 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center prose prose-xl overflow-hidden">
                        <ReactMarkdown>{slides[currentSlide]}</ReactMarkdown>
                    </div>

                    <div className="absolute bottom-8 flex gap-4 text-white/50">
                        <button onClick={prevSlide} className="p-2 hover:text-white"><ChevronLeft size={32} /></button>
                        <span className="flex items-center font-mono">{currentSlide + 1} / {slides.length}</span>
                        <button onClick={nextSlide} className="p-2 hover:text-white"><ChevronRight size={32} /></button>
                    </div>

                    <button
                        onClick={() => setMode("edit")}
                        className="absolute top-8 right-8 text-white/30 hover:text-white transition"
                    >
                        <FileText /> Edit
                    </button>
                </div>
            )}
        </div>
    );
}
