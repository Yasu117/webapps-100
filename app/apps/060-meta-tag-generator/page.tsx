
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Code, Globe, Twitter, Share2 } from "lucide-react";

export default function MetaTagGenerator() {
    const [data, setData] = useState({
        title: "My Awesome Page",
        description: "This is a description of my page content.",
        url: "https://example.com/my-page",
        image: "https://example.com/og-image.jpg"
    });

    const generateCode = () => {
        return `
<!-- HTML Meta Tags -->
<title>${data.title}</title>
<meta name="description" content="${data.description}">

<!-- Facebook Meta Tags -->
<meta property="og:url" content="${data.url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${data.title}">
<meta property="og:description" content="${data.description}">
<meta property="og:image" content="${data.image}">

<!-- Twitter Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:domain" content="${new URL(data.url || 'https://example.com').hostname}">
<meta property="twitter:url" content="${data.url}">
<meta name="twitter:title" content="${data.title}">
<meta name="twitter:description" content="${data.description}">
<meta name="twitter:image" content="${data.image}">
      `.trim();
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4">
            <header className="max-w-4xl mx-auto flex items-center gap-4 mb-8">
                <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100 transition">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Globe size={28} className="text-indigo-600" />
                    Meta Tag Generator
                </h1>
            </header>

            <div className="max-w-4xl mx-auto mb-6 bg-white p-3 rounded-lg text-xs text-slate-600 shadow-sm border border-slate-200">
                <span className="font-bold mr-2">#060</span>
                Webページの情報を入力して、SEOやSNS用のメタタグ（HTML）を生成します。
            </div>

            <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h2 className="font-bold text-slate-500 mb-2">Basic Information</h2>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Page Title</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm h-24" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Page URL</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={data.url} onChange={e => setData({ ...data, url: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Image URL</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={data.image} onChange={e => setData({ ...data, image: e.target.value })} />
                    </div>
                </div>

                {/* Preview & Code */}
                <div className="space-y-6">
                    {/* Preview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-slate-500 mb-4 flex items-center gap-2"><Share2 size={16} /> Social Preview (Card)</h2>

                        <div className="border border-slate-200 rounded-xl overflow-hidden max-w-sm mx-auto shadow-md">
                            <div className="h-40 bg-slate-200 relative overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={data.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Image+Preview")} />
                            </div>
                            <div className="p-4 bg-white">
                                <div className="text-xs text-slate-500 uppercase mb-1">{new URL(data.url || 'https://example.com').hostname}</div>
                                <div className="font-bold text-slate-900 mb-1 line-clamp-1">{data.title}</div>
                                <div className="text-sm text-slate-600 line-clamp-2">{data.description}</div>
                            </div>
                        </div>
                    </div>

                    {/* Code Output */}
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-slate-300 relative">
                        <h2 className="font-bold text-slate-500 mb-4 flex items-center gap-2 text-xs uppercase"><Code size={14} /> Generated HTML</h2>
                        <pre className="text-xs font-mono overflow-auto whitespace-pre-wrap max-h-60">
                            {generateCode()}
                        </pre>
                        <button
                            onClick={() => navigator.clipboard.writeText(generateCode())}
                            className="absolute top-4 right-4 text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
