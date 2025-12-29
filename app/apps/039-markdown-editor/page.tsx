
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Edit3, Eye } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useState<string>("# Welcome to Markdown Editor\n\nStart typing on the **left** (or top on mobile) to see the preview.\n\n- Support for lists\n- **Bold** and *Italic*\n\n```js\nconsole.log('Code blocks supported');\n```");
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Header */}
            <div className="h-14 border-b border-slate-200 flex items-center px-4 justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/apps" className="text-slate-500 hover:bg-slate-100 p-2 rounded-full -ml-2">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="font-bold text-slate-800">Markdown Editor</h1>
                </div>

                {/* Mobile Toggle */}
                <div className="flex md:hidden bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("edit")}
                        className={clsx("p-2 rounded-md transition-all text-xs font-bold flex items-center gap-1", activeTab === "edit" ? "bg-white shadow text-slate-900" : "text-slate-500")}
                    >
                        <Edit3 size={14} /> Edit
                    </button>
                    <button
                        onClick={() => setActiveTab("preview")}
                        className={clsx("p-2 rounded-md transition-all text-xs font-bold flex items-center gap-1", activeTab === "preview" ? "bg-white shadow text-slate-900" : "text-slate-500")}
                    >
                        <Eye size={14} /> View
                    </button>
                </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 flex overflow-hidden">

                {/* Input Area (Visible on Desktop OR when Tab is Edit) */}
                <div className={clsx(
                    "flex-1 bg-slate-50 p-4 md:flex md:border-r border-slate-200 overflow-y-auto",
                    activeTab === "edit" ? "flex" : "hidden"
                )}>
                    <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed text-slate-800"
                        placeholder="Type markdown here..."
                    />
                </div>

                {/* Preview Area (Visible on Desktop OR when Tab is Preview) */}
                <div className={clsx(
                    "flex-1 bg-white p-8 md:flex overflow-y-auto prose prose-slate max-w-none flex-col",
                    activeTab === "preview" ? "flex" : "hidden"
                )}>
                    <ReactMarkdown>
                        {markdown}
                    </ReactMarkdown>
                </div>

            </div>
        </div>
    );
}
