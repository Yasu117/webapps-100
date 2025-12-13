'use client';

import React, { useState, useEffect, useMemo } from 'react';

// --- Constants & Data ---
type City = {
    id: string;
    city: string;
    region: string;
    zone: string;
};

const AVAILABLE_CITIES: City[] = [
    // Asia & Oceania
    { id: 'tokyo', city: 'Tokyo', region: 'Japan', zone: 'Asia/Tokyo' },
    { id: 'seoul', city: 'Seoul', region: 'South Korea', zone: 'Asia/Seoul' },
    { id: 'beijing', city: 'Beijing', region: 'China', zone: 'Asia/Shanghai' },
    { id: 'hongkong', city: 'Hong Kong', region: 'China', zone: 'Asia/Hong_Kong' },
    { id: 'taipei', city: 'Taipei', region: 'Taiwan', zone: 'Asia/Taipei' },
    { id: 'singapore', city: 'Singapore', region: 'Singapore', zone: 'Asia/Singapore' },
    { id: 'bangkok', city: 'Bangkok', region: 'Thailand', zone: 'Asia/Bangkok' },
    { id: 'hanoi', city: 'Hanoi', region: 'Vietnam', zone: 'Asia/Bangkok' },
    { id: 'jakarta', city: 'Jakarta', region: 'Indonesia', zone: 'Asia/Jakarta' },
    { id: 'mumbai', city: 'Mumbai', region: 'India', zone: 'Asia/Kolkata' },
    { id: 'delhi', city: 'New Delhi', region: 'India', zone: 'Asia/Kolkata' },
    { id: 'dubai', city: 'Dubai', region: 'UAE', zone: 'Asia/Dubai' },
    { id: 'sydney', city: 'Sydney', region: 'Australia', zone: 'Australia/Sydney' },
    { id: 'melbourne', city: 'Melbourne', region: 'Australia', zone: 'Australia/Melbourne' },
    { id: 'auckland', city: 'Auckland', region: 'New Zealand', zone: 'Pacific/Auckland' },

    // Europe & Africa
    { id: 'london', city: 'London', region: 'UK', zone: 'Europe/London' },
    { id: 'paris', city: 'Paris', region: 'France', zone: 'Europe/Paris' },
    { id: 'berlin', city: 'Berlin', region: 'Germany', zone: 'Europe/Berlin' },
    { id: 'rome', city: 'Rome', region: 'Italy', zone: 'Europe/Rome' },
    { id: 'madrid', city: 'Madrid', region: 'Spain', zone: 'Europe/Madrid' },
    { id: 'amsterdam', city: 'Amsterdam', region: 'Netherlands', zone: 'Europe/Amsterdam' },
    { id: 'istanbul', city: 'Istanbul', region: 'Turkey', zone: 'Europe/Istanbul' },
    { id: 'moscow', city: 'Moscow', region: 'Russia', zone: 'Europe/Moscow' },
    { id: 'cairo', city: 'Cairo', region: 'Egypt', zone: 'Africa/Cairo' },
    { id: 'johannesburg', city: 'Johannesburg', region: 'South Africa', zone: 'Africa/Johannesburg' },

    // Americas
    { id: 'ny', city: 'New York', region: 'USA', zone: 'America/New_York' },
    { id: 'la', city: 'Los Angeles', region: 'USA', zone: 'America/Los_Angeles' },
    { id: 'chicago', city: 'Chicago', region: 'USA', zone: 'America/Chicago' },
    { id: 'toronto', city: 'Toronto', region: 'Canada', zone: 'America/Toronto' },
    { id: 'vancouver', city: 'Vancouver', region: 'Canada', zone: 'America/Vancouver' },
    { id: 'mexico', city: 'Mexico City', region: 'Mexico', zone: 'America/Mexico_City' },
    { id: 'saopaulo', city: 'Sao Paulo', region: 'Brazil', zone: 'America/Sao_Paulo' },
    { id: 'buenosaires', city: 'Buenos Aires', region: 'Argentina', zone: 'America/Argentina/Buenos_Aires' },
    { id: 'santiago', city: 'Santiago', region: 'Chile', zone: 'America/Santiago' },
    { id: 'honolulu', city: 'Honolulu', region: 'USA', zone: 'Pacific/Honolulu' },
];

const INITIAL_CITIES = ['tokyo', 'ny', 'london'];

// --- Helper: Get Time Info ---
const getTimeInfo = (zone: string, now: Date) => {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: zone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });

        const parts = formatter.formatToParts(now);
        const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

        const hour = parseInt(getPart('hour'));
        const minute = getPart('minute');
        const second = getPart('second');
        const weekday = getPart('weekday');
        const month = getPart('month');
        const day = getPart('day');

        // Determine phase of day for UI
        // 5-8: Dawn, 8-16: Day, 16-19: Sunset, 19-5: Night
        let phase = 'night';
        if (hour >= 5 && hour < 8) phase = 'dawn';
        else if (hour >= 8 && hour < 17) phase = 'day';
        else if (hour >= 17 && hour < 20) phase = 'sunset';
        else phase = 'night';

        return {
            timeStr: `${hour.toString().padStart(2, '0')}:${minute}`,
            secStr: second,
            dateStr: `${weekday}, ${month} ${day}`,
            phase,
            hour,
        };
    } catch (e) {
        return { timeStr: '--:--', secStr: '--', dateStr: '---', phase: 'day', hour: 12 };
    }
};

const getGradient = (phase: string) => {
    switch (phase) {
        case 'dawn': return 'from-indigo-400 via-purple-400 to-orange-300 text-slate-900';
        case 'day': return 'from-sky-400 via-blue-400 to-blue-300 text-slate-900';
        case 'sunset': return 'from-orange-400 via-rose-400 to-purple-500 text-white';
        case 'night': return 'from-slate-900 via-indigo-900 to-slate-800 text-indigo-100 border-slate-700';
        default: return 'from-slate-500 to-slate-400';
    }
};

const getIcon = (phase: string) => {
    switch (phase) {
        case 'dawn': return '🌅';
        case 'day': return '☀️';
        case 'sunset': return '🌇';
        case 'night': return '🌙';
        default: return '';
    }
};

export default function WorldClockPage() {
    const [now, setNow] = useState<Date | null>(null); // Null initially to avoid hydration mismatch
    const [selectedCityIds, setSelectedCityIds] = useState<string[]>(INITIAL_CITIES);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        setNow(new Date()); // Set initial client time
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleCity = (id: string) => {
        if (selectedCityIds.includes(id)) {
            setSelectedCityIds(selectedCityIds.filter(c => c !== id));
        } else {
            setSelectedCityIds([...selectedCityIds, id]);
        }
    };

    // Sort selected cities by time? Or just keep order? 
    // Let's keep addition order or fixed list order?
    // Let's sort by AVAILABLE_CITIES order for consistency
    const activeCities = useMemo(() => {
        return AVAILABLE_CITIES.filter(c => selectedCityIds.includes(c.id))
            .sort((a, b) => selectedCityIds.indexOf(a.id) - selectedCityIds.indexOf(b.id)); // Maintain user addition order? No, let's just assume selection order matters to user.
    }, [selectedCityIds]);

    if (!now) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading time...</div>;

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-20">
            {/* Header */}
            <header className="px-5 py-6 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 border-b border-slate-800/50">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-base mr-1">018</span>
                        Interactive World Clock
                    </h1>
                    <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">美しいグラデーションで世界の時間を体感</p>
                </div>
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${isEditMode ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    {isEditMode ? 'Done' : 'Edit'}
                </button>
            </header>

            {/* City List */}
            <main className="p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
                {activeCities.map(city => {
                    const timeInfo = getTimeInfo(city.zone, now);
                    const gradient = getGradient(timeInfo.phase);

                    return (
                        <div
                            key={city.id}
                            className={`relative w-full rounded-2xl p-5 shadow-lg bg-gradient-to-br ${gradient} border border-white/10 transition-all duration-500 ease-in-out hover:scale-[1.02]`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">{getIcon(timeInfo.phase)}</span>
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">{city.region}</span>
                                    </div>
                                    <h2 className="text-3xl font-bold leading-tight drop-shadow-sm">{city.city}</h2>
                                    <p className="text-sm font-medium opacity-90 mt-1">{timeInfo.dateStr}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-5xl font-black tracking-tighter drop-shadow-md tabular-nums">
                                        {timeInfo.timeStr}
                                    </div>
                                    <div className="text-lg font-medium opacity-80 tabular-nums">
                                        {timeInfo.secStr} <span className="text-xs">s</span>
                                    </div>
                                </div>
                            </div>

                            {/* Time Difference Tag - Approximation */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs font-bold px-2 py-1 rounded-md bg-black/20 backdrop-blur-sm inline-block">
                                    {city.zone.split('/')[1].replace('_', ' ')}
                                </div>
                                {isEditMode && (
                                    <button
                                        onClick={() => toggleCity(city.id)}
                                        className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm shadow-sm"
                                        aria-label="Remove"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full py-4 mt-2 border-2 border-dashed border-slate-800 hover:border-slate-600 text-slate-500 hover:text-slate-300 rounded-2xl flex items-center justify-center gap-2 transition-colors group"
                >
                    <span className="text-xl font-bold bg-slate-800 text-slate-400 rounded-full w-8 h-8 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors">+</span>
                    <span className="font-bold">Add City</span>
                </button>
            </main>

            {/* Fab Add Button */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-sky-500 hover:bg-sky-400 text-white rounded-full shadow-2xl shadow-sky-500/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-slate-900 sm:rounded-2xl rounded-t-2xl border-t sm:border-t-0 border-slate-800 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Add City</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-white p-2"
                            >
                                Close
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-2">
                            {AVAILABLE_CITIES.map(city => {
                                const isSelected = selectedCityIds.includes(city.id);
                                return (
                                    <button
                                        key={city.id}
                                        onClick={() => {
                                            if (!isSelected) toggleCity(city.id);
                                            setIsAddModalOpen(false);
                                        }}
                                        disabled={isSelected}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors ${isSelected ? 'bg-slate-800/50 opacity-50 cursor-default' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        <div>
                                            <div className="font-bold text-lg text-slate-200">{city.city}</div>
                                            <div className="text-xs text-slate-500">{city.region} • {city.zone}</div>
                                        </div>
                                        {isSelected && <span className="text-emerald-500 text-sm font-bold">Added</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
