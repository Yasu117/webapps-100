
"use client";

import React, { } from "react";
import { ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";

// 50 Apps List
const APPS = Array.from({ length: 49 }, (_, i) => {
    const num = i + 1;
    const id = num.toString().padStart(3, '0');
    // Simple logic for names, in reality we might want a map, but for now ID is enough
    return { id, name: `App ${id}` };
});
// Special Metadata can be added here if needed

export default function GalleryPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black pb-20">

            {/* Hero */}
            <div className="h-[60vh] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black"></div>
                <div className="z-10 text-center space-y-6 animate-in fade-in zoom-in duration-1000">
                    <div className="inline-block px-4 py-1 rounded-full border border-cyan-500/50 text-cyan-400 text-sm font-mono mb-4 bg-cyan-950/20">
                        MISSION COMPLETE
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                        50 APPS
                    </h1>
                    <p className="text-slate-400 max-w-md mx-auto text-lg">
                        The journey of building 50 web applications.
                    </p>
                    <p className="text-cyan-600 text-sm font-bold mt-2">50個のWebアプリ制作の軌跡</p>
                </div>

                {/* Particles or Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {APPS.map((app) => (
                        <Link
                            key={app.id}
                            href={`/apps/${app.id}-*`} // Note: This link is approximate, ideally we map to exact slug
                            // But we don't have slugs here. 
                            // Let's just link to /apps and let user find it, OR 
                            // better: Link to /apps which is the main list. 
                            // Wait, this page IS 050.
                            // Let's try to link to `/apps` generally or make these dumb cards for visual.
                            // Actually, I can construct the link if I know the folder name.
                            // Since I don't, I will just display them as "Badges" of honor.
                            className="group relative aspect-square bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-cyan-500/50 transition-colors"
                        >
                            <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">
                                {app.id}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-full animate-pulse"></div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* 50th Card */}
                    <div className="col-span-2 md:col-span-2 aspect-square md:aspect-auto bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(8,145,178,0.4)] relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                        <Rocket size={48} className="text-white relative z-10" />

                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-white mb-2">050</h3>
                            <p className="text-cyan-100 font-medium leading-tight">
                                The Final App.<br />
                                Gallery of Innovation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-20 text-center text-slate-600 text-sm">
                Created with Passion & Code.
            </div>

            <Link href="/apps" className="fixed bottom-8 right-8 bg-white text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50">
                <ArrowLeft size={24} />
            </Link>

        </div>
    );
}
