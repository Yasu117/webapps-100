
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { clsx } from "clsx";

type Habit = {
    id: string;
    name: string;
    completedDates: string[]; // YYYY-MM-DD
};

export default function HabitCalendar() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabitName, setNewHabitName] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("app073-habits");
        if (stored) setHabits(JSON.parse(stored));
        else setHabits([{ id: "1", name: "読書", completedDates: [] }]);
    }, []);

    const saveHabits = (newHabits: Habit[]) => {
        setHabits(newHabits);
        localStorage.setItem("app073-habits", JSON.stringify(newHabits));
    };

    const addHabit = () => {
        if (!newHabitName.trim()) return;
        const newHabit: Habit = {
            id: Date.now().toString(),
            name: newHabitName,
            completedDates: []
        };
        saveHabits([...habits, newHabit]);
        setNewHabitName("");
    };

    const toggleDate = (habitId: string, date: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const isCompleted = habit.completedDates.includes(date);
        let newDates;
        if (isCompleted) {
            newDates = habit.completedDates.filter(d => d !== date);
        } else {
            newDates = [...habit.completedDates, date];
        }

        const newHabits = habits.map(h => h.id === habitId ? { ...h, completedDates: newDates } : h);
        saveHabits(newHabits);
    };

    // Generate last 14 days
    const days = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return {
            dateObj: d,
            dateStr: d.toISOString().split('T')[0],
            day: d.getDate(),
            weekday: ["日", "月", "火", "水", "木", "金", "土"][d.getDay()]
        };
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4">
            <header className="max-w-xl mx-auto flex items-center gap-4 mb-6">
                <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><ArrowLeft size={20} /></Link>
                <h1 className="text-xl font-bold">Habit Calendar</h1>
            </header>

            <div className="max-w-xl mx-auto mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-xs font-bold mb-1 text-emerald-600">#073</div>
                <div className="text-xs text-slate-600">毎日の習慣を記録して継続をサポートします。日付をタップしてチェックしましょう。</div>
            </div>

            <div className="max-w-xl mx-auto space-y-8">
                {/* Add Habit */}
                <div className="flex gap-2">
                    <input
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                        placeholder="新しい習慣を追加..."
                        value={newHabitName}
                        onChange={e => setNewHabitName(e.target.value)}
                    />
                    <button
                        onClick={addHabit}
                        className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg hover:bg-emerald-600 disabled:opacity-50"
                        disabled={!newHabitName.trim()}
                    >
                        <Plus />
                    </button>
                </div>

                <div className="space-y-4 overflow-x-auto pb-4">
                    {habits.map(habit => (
                        <div key={habit.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-w-[340px]">
                            <div className="flex justify-between items-center mb-4 sticky left-0 bg-white">
                                <h3 className="font-bold text-slate-700">{habit.name}</h3>
                                <div className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">
                                    Streak: {calculateStreak(habit.completedDates)}
                                </div>
                            </div>

                            <div className="flex gap-1 justify-between">
                                {days.map(d => {
                                    const isActive = habit.completedDates.includes(d.dateStr);
                                    const isToday = d.dateStr === new Date().toISOString().split('T')[0];
                                    return (
                                        <button
                                            key={d.dateStr}
                                            onClick={() => toggleDate(habit.id, d.dateStr)}
                                            className="flex flex-col items-center gap-1 group"
                                        >
                                            <div className="text-[10px] text-slate-400">{d.weekday}</div>
                                            <div className={clsx(
                                                "w-6 h-6 rounded flex items-center justify-center transition-all",
                                                isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-transparent hover:bg-slate-200",
                                                isToday && !isActive && "ring-2 ring-emerald-200"
                                            )}>
                                                <Check size={14} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    const sorted = [...dates].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let streak = 0;
    let current = sorted.includes(today) ? today : sorted.includes(yesterday) ? yesterday : null;

    if (!current) return 0;

    for (let i = 0; i < dates.length; i++) {
        if (current && sorted.includes(current)) {
            streak++;
            const d: Date = new Date(current);
            d.setDate(d.getDate() - 1);
            current = d.toISOString().split('T')[0];
        } else {
            break;
        }
    }
    return streak;
}
