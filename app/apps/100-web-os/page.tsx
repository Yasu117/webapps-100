
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Monitor, X, Maximize2, Minimize2, Grid, Search,
    Battery, Wifi, Calendar, Music, Terminal, Globe
} from "lucide-react";
import { clsx } from "clsx";

import { apps } from "../page";

// Map real apps to OS format
const APPS = apps.map((app, i) => ({
    id: app.id,
    name: app.title.replace(/（[^）]*）/g, ''), // Remove parens for cleaner icon text if needed, or keep full
    fullTitle: app.title,
    color: `hsl(${parseInt(app.id) * 13}, 70%, 50%)`,
    slug: app.slug
}));

type WindowState = {
    id: string;
    title: string;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    appId: string;
    slug: string;
};

export default function WebOS() {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [menuOpen, setMenuOpen] = useState(false);
    const [zCounter, setZCounter] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const openApp = (appId: string) => {
        // Check if already open
        const existing = windows.find(w => w.appId === appId);
        if (existing) {
            focusWindow(existing.id);
            return;
        }

        const appData = APPS.find(a => a.id === appId);
        if (!appData) return;

        const newWin: WindowState = {
            id: Date.now().toString(),
            title: appData.name,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            zIndex: zCounter + 1,
            appId,
            slug: appData.slug
        };
        setZCounter(prev => prev + 1);
        setWindows(prev => [...prev, newWin]);
        setActiveId(newWin.id);
        setMenuOpen(false);
    };

    const closeWindow = (id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    };

    const focusWindow = (id: string) => {
        setZCounter(prev => prev + 1);
        setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zCounter + 1, isMinimized: false } : w));
        setActiveId(id);
    };

    const toggleMaximize = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    };

    const minimize = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
        setActiveId(null);
    };

    const filteredApps = APPS.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.includes(searchTerm));

    return (
        <div className="h-screen w-screen bg-[url('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2874&auto=format&fit=crop')] bg-cover bg-center overflow-hidden font-sans select-none relative">

            {/* Desktop Icons */}
            <div className="absolute inset-0 p-8 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-4 content-start items-start justify-items-start pointer-events-none">
                {APPS.slice(0, 8).map(app => ( // Show first 8 just as shortcut examples
                    <div
                        key={app.id}
                        onDoubleClick={() => openApp(app.id)}
                        className="w-24 flex flex-col items-center gap-1 group pointer-events-auto cursor-pointer"
                    >
                        <div
                            className="w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center text-white text-xl font-bold bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition"
                            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                        >
                            {app.id}
                        </div>
                        <div className="text-white text-xs font-bold drop-shadow-md text-center bg-black/20 px-2 rounded-full">{app.name}</div>
                    </div>
                ))}
            </div>

            {/* Windows */}
            {windows.map(win => (
                <div
                    key={win.id}
                    className={clsx(
                        "absolute bg-slate-900 border border-slate-700 shadow-2xl rounded-lg overflow-hidden flex flex-col transition-all duration-200",
                        win.isMaximized ? "inset-0 rounded-none mb-12" : "top-20 left-20 w-[600px] h-[400px]", // Simple pos for now
                        win.isMinimized && "opacity-0 scale-95 pointer-events-none"
                    )}
                    style={{ zIndex: win.zIndex }}
                    onMouseDown={() => focusWindow(win.id)}
                >
                    {/* Title Bar */}
                    <div className="h-10 bg-slate-800 flex items-center justify-between px-4 border-b border-slate-700 active:cursor-grabbing cursor-grab">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                            {win.title}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => minimize(win.id)} className="p-1 hover:bg-slate-700 rounded text-slate-400"><Minimize2 size={14} /></button>
                            <button onClick={() => toggleMaximize(win.id)} className="p-1 hover:bg-slate-700 rounded text-slate-400"><Maximize2 size={14} /></button>
                            <button onClick={() => closeWindow(win.id)} className="p-1 hover:bg-red-500/20 text-red-400 rounded"><X size={14} /></button>
                        </div>
                    </div>
                    {/* Content (Iframe simulation using Link or just placeholder) */}
                    <div className="flex-1 bg-white relative">
                        {/* We cannot easily embed normal Next.js pages in iframes on same host without some config, but let's try or just link */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                            <h2 className="text-2xl font-bold mb-4">Running {win.title}</h2>
                            <div className="bg-slate-100 p-8 rounded-full mb-8 animate-pulse">
                                <Monitor size={48} />
                            </div>
                            <Link href={`/apps/${win.slug}`} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 shadow-lg">
                                Open Fullscreen
                            </Link>
                            <p className="mt-4 text-xs max-w-xs text-center">
                                *In a real OS, this would be an iframe. For this demo, please open safely in a new tab.*
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            {/* Taskbar */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 flex items-center px-4 justify-between z-[9999]">

                <div className="flex items-center gap-4">
                    {/* Start Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={clsx(
                            "p-2 rounded-lg transition text-white",
                            menuOpen ? "bg-white/20" : "hover:bg-white/10"
                        )}
                    >
                        <Grid fill="currentColor" size={20} />
                    </button>

                    {/* Open Apps */}
                    <div className="flex items-center gap-2">
                        {windows.map(win => (
                            <button
                                key={win.id}
                                onClick={() => win.isMinimized ? focusWindow(win.id) : activeId === win.id ? minimize(win.id) : focusWindow(win.id)}
                                className={clsx(
                                    "px-4 py-1 rounded-md text-xs font-bold transition flex items-center gap-2 border-b-2",
                                    activeId === win.id && !win.isMinimized ? "bg-white/10 border-blue-400 text-white" : "hover:bg-white/5 border-transparent text-slate-400"
                                )}
                            >
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                {win.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* System Tray */}
                <div className="flex items-center gap-4 text-white/50 text-xs font-bold">
                    <Wifi size={16} />
                    <Battery size={16} />
                    <span>{currentTime.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Start Menu */}
            {menuOpen && (
                <div className="absolute bottom-14 left-4 w-96 h-[500px] bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden z-[9999] animate-in slide-in-from-bottom-10 fade-in">
                    <div className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search apps..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        <div className="text-xs font-bold text-slate-500 uppercase px-4 py-2">All Apps</div>
                        {filteredApps.map(app => (
                            <button
                                key={app.id}
                                onClick={() => openApp(app.id)}
                                className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl flex items-center gap-3 transition group"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow"
                                    style={{ backgroundColor: app.color }}
                                >
                                    {app.id}
                                </div>
                                <span className="text-sm font-bold text-slate-200 group-hover:text-white">{app.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 bg-black/20 border-t border-white/10 flex justify-between items-center text-slate-400">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                            User
                        </div>
                        <Link href="/apps" className="hover:text-white transition"><Terminal size={16} /></Link>
                    </div>
                </div>
            )}
        </div>
    );
}
