
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from "lucide-react";
import Link from "next/link";

type WeatherData = {
    current_weather: {
        temperature: number;
        weathercode: number;
        windspeed: number;
    };
    daily: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weathercode: number[];
        time: string[];
    };
};

const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun size={48} className="text-yellow-400" />;
    if (code <= 3) return <Cloud size={48} className="text-gray-400" />;
    if (code <= 67) return <CloudRain size={48} className="text-blue-400" />;
    if (code <= 77) return <CloudSnow size={48} className="text-cyan-400" />;
    return <CloudRain size={48} className="text-blue-500" />;
};

const getWeatherLabel = (code: number) => {
    if (code <= 1) return "Sunny";
    if (code <= 3) return "Cloudy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    return "Rainy";
};

export default function WeatherDashboard() {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    // Default Tokyo
    const lat = 35.6895;
    const lon = 139.6917;

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`);
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
            Loading...
        </div>
    );

    const current = data?.current_weather;
    const daily = data?.daily;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white pb-12">
            <div className="p-4 flex items-center justify-between">
                <Link href="/apps" className="p-2 -ml-2 rounded-full hover:bg-white/10">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-400" />
                    <span className="font-bold">Tokyo, JP</span>
                </div>
                <div className="w-8" />
            </div>

            <div className="p-6 flex flex-col items-center text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {current && getWeatherIcon(current.weathercode)}
                </div>
                <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                    {current?.temperature}°
                </h1>
                <p className="text-xl text-slate-300 font-medium">
                    {current && getWeatherLabel(current.weathercode)}
                </p>
                <div className="flex gap-6 mt-6 text-sm font-bold text-slate-400 bg-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/5">
                    <div className="flex items-center gap-2">
                        <Wind size={16} />
                        {current?.windspeed} km/h
                    </div>
                </div>
            </div>

            <div className="mt-8 px-4">
                <h2 className="text-slate-400 font-bold mb-4 px-2">Weekly Forecast</h2>
                <div className="bg-white/5 rounded-3xl p-4 backdrop-blur-md border border-white/5 space-y-4">
                    {daily && daily.time.map((t, i) => (
                        <div key={t} className="flex items-center justify-between p-2">
                            <span className="w-16 font-bold text-slate-300">
                                {new Date(t).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <div className="flex-1 flex justify-center">
                                <div className="scale-75 origin-center">
                                    {getWeatherIcon(daily.weathercode[i])}
                                </div>
                            </div>
                            <div className="w-24 text-right font-mono font-bold flex gap-3 justify-end">
                                <span className="text-white">{Math.round(daily.temperature_2m_max[i])}°</span>
                                <span className="text-slate-500">{Math.round(daily.temperature_2m_min[i])}°</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
