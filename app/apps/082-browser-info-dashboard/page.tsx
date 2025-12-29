
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Wifi, Battery, Globe } from "lucide-react";

export default function BrowserInfo() {
    const [info, setInfo] = useState<any>({});

    useEffect(() => {
        const getBattery = async () => {
            if ('getBattery' in navigator) {
                const batt: any = await (navigator as any).getBattery();
                return {
                    level: batt.level * 100 + "%",
                    charging: batt.charging ? "Yes" : "No",
                    chargingTime: batt.chargingTime,
                    dischargingTime: batt.dischargingTime
                };
            }
            return null;
        };

        const updateInfo = async () => {
            const batt = await getBattery();
            setInfo({
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screen: {
                    width: window.screen.width,
                    height: window.screen.height,
                    availWidth: window.screen.availWidth,
                    availHeight: window.screen.availHeight,
                    colorDepth: window.screen.colorDepth,
                    pixelRatio: window.devicePixelRatio,
                },
                connection: (navigator as any).connection ? {
                    effectiveType: (navigator as any).connection.effectiveType,
                    rtt: (navigator as any).connection.rtt + "ms",
                    downlink: (navigator as any).connection.downlink + "Mbps",
                    saveData: (navigator as any).connection.saveData ? "Yes" : "No"
                } : null,
                battery: batt,
                cookiesEnabled: navigator.cookieEnabled ? "Yes" : "No",
                onLine: navigator.onLine ? "Yes" : "No",
            });
        };

        updateInfo();
        window.addEventListener("resize", updateInfo);
        return () => window.removeEventListener("resize", updateInfo);
    }, []);

    const InfoCard = ({ icon, title, data }: { icon: React.ReactNode, title: string, data: any }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">{icon}</div>
                <h2 className="font-bold text-slate-700">{title}</h2>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {data ? Object.entries(data).map(([k, v]) => (
                    <div key={k} className="flex flex-col border-b border-slate-50 pb-2 last:border-0">
                        <dt className="text-slate-400 text-xs font-bold uppercase">{k.replace(/([A-Z])/g, ' $1').trim()}</dt>
                        <dd className="font-mono text-slate-700 break-all">{String(v)}</dd>
                    </div>
                )) : <div className="text-slate-400 italic">Not available</div>}
            </dl>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 font-sans">
            <header className="max-w-5xl mx-auto flex items-center gap-4 mb-8">
                <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">#082 Browser Info Dashboard</h1>
            </header>

            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
                <InfoCard icon={<Monitor />} title="Screen & Window" data={info.screen} />
                <InfoCard icon={<Wifi />} title="Network" data={info.connection} />
                <InfoCard icon={<Battery />} title="Battery" data={info.battery} />
                <InfoCard icon={<Globe />} title="Navigator" data={{
                    Language: info.language,
                    Platform: info.platform,
                    Cookies: info.cookiesEnabled,
                    Online: info.onLine
                }} />

                <div className="md:col-span-2 bg-slate-800 text-slate-200 p-6 rounded-2xl shadow-lg font-mono text-xs break-all">
                    <div className="text-slate-400 font-bold mb-2 uppercase">User Agent</div>
                    {info.userAgent}
                </div>
            </div>
        </div>
    );
}
