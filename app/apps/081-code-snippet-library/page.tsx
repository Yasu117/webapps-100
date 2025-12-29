
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Copy, Code, Check } from "lucide-react";

type Snippet = {
    id: string;
    title: string;
    code: string;
    language: string;
};

// Simple languages list
const LANGUAGES = ["javascript", "typescript", "python", "html", "css", "sql", "shell", "text"];

export default function SnippetLibrary() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [title, setTitle] = useState("");
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("app081-snippets");
        if (saved) {
            setSnippets(JSON.parse(saved));
        } else {
            // Demo data
            setSnippets([
                { id: "1", title: "Hello World", code: "console.log('Hello World');", language: "javascript" },
                { id: "2", title: "React Hook", code: "const [state, setState] = useState(initial);", language: "typescript" },
            ]);
        }
    }, []);

    const saveSnippets = (newSnippets: Snippet[]) => {
        setSnippets(newSnippets);
        localStorage.setItem("app081-snippets", JSON.stringify(newSnippets));
    };

    const addSnippet = () => {
        if (!title || !code) return;
        const newSnippet = {
            id: Date.now().toString(),
            title,
            code,
            language
        };
        saveSnippets([newSnippet, ...snippets]);
        setTitle("");
        setCode("");
        setIsFormOpen(false);
    };

    const deleteSnippet = (id: string) => {
        if (confirm("Delete this snippet?")) {
            saveSnippets(snippets.filter(s => s.id !== id));
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4">
            <header className="max-w-4xl mx-auto flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/apps" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"><ArrowLeft size={20} /></Link>
                    <h1 className="text-xl font-bold">#081 Code Snippet Library</h1>
                </div>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-500 transition"
                >
                    <Plus size={18} /> New Snippet
                </button>
            </header>

            <div className="max-w-4xl mx-auto space-y-6">
                {isFormOpen && (
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 animate-in slide-in-from-top-4">
                        <div className="grid gap-4 mb-4">
                            <input
                                placeholder="Title (e.g., Auth Hook)"
                                className="bg-slate-900 border border-slate-700 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <select
                                    className="bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                >
                                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                </select>
                            </div>
                            <textarea
                                placeholder="Paste code here..."
                                className="bg-slate-900 border border-slate-700 rounded-lg p-3 w-full font-mono text-sm h-40 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={addSnippet} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 font-bold">Save</button>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                    {snippets.map(snippet => (
                        <div key={snippet.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col hover:border-blue-500/50 transition">
                            <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Code size={16} className="text-blue-400" />
                                    <span className="font-bold text-slate-200">{snippet.title}</span>
                                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400 capitalize">{snippet.language}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(snippet.code, snippet.id)}
                                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                                        title="Copy"
                                    >
                                        {copiedId === snippet.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                    <button
                                        onClick={() => deleteSnippet(snippet.id)}
                                        className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <pre className="p-4 bg-slate-950 overflow-x-auto text-sm font-mono text-slate-300 flex-1 custom-scrollbar">
                                <code>{snippet.code}</code>
                            </pre>
                        </div>
                    ))}
                    {snippets.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            No snippets yet. Create one!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
