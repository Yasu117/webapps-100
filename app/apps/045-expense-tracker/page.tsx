
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, PieChart as ChartIcon } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type Expense = {
    id: number;
    label: string;
    amount: number;
    category: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ExpenseTracker() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem("expense-tracker-data");
        if (saved) {
            setExpenses(JSON.parse(saved));
        } else {
            // Initial Dummy Data
            setExpenses([
                { id: 1, label: "Lunch", amount: 1200, category: "Food" },
                { id: 2, label: "Coffee", amount: 450, category: "Food" },
                { id: 3, label: "Train", amount: 320, category: "Transport" },
            ]);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem("expense-tracker-data", JSON.stringify(expenses));
        }
    }, [expenses, isClient]);

    const add = () => {
        if (!label || !amount) return;
        setExpenses([...expenses, {
            id: Date.now(),
            label,
            amount: Number(amount),
            category: "Misc" // Simplified for MVP
        }]);
        setLabel("");
        setAmount("");
    };

    const remove = (id: number) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const total = expenses.reduce((acc, cur) => acc + cur.amount, 0);

    // Group data for Chart
    const chartData = Object.values(expenses.reduce((acc: any, cur) => {
        if (!acc[cur.label]) acc[cur.label] = { name: cur.label, value: 0 };
        acc[cur.label].value += cur.amount;
        return acc;
    }, {}));

    if (!isClient) return null; // Prevent hydration mismatch

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/apps" className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="font-bold text-xl text-slate-800">Expense Tracker</h1>
                    <div className="w-8" />
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg flex justify-between items-center">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium">Total Expenses</p>
                        <h2 className="text-3xl font-bold mt-1">¥{total.toLocaleString()}</h2>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                        <ChartIcon size={24} />
                    </div>
                </div>

                {/* Chart (Hidden if empty) */}
                {expenses.length > 0 && (
                    <div className="h-64 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* List */}
                <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">Recent</div>
                    {expenses.map((expense) => (
                        <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                                    💰
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{expense.label}</p>
                                    <p className="text-xs text-slate-400">{new Date(expense.id).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-slate-700">¥{expense.amount.toLocaleString()}</span>
                                <button onClick={() => remove(expense.id)} className="text-slate-300 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Floating Add Bar */}
            <div className="fixed bottom-6 left-0 w-full px-4">
                <div className="max-w-md mx-auto bg-white rounded-full shadow-2xl p-2 border border-slate-100 flex gap-2">
                    <input
                        type="text"
                        placeholder="Item"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="flex-[2] bg-slate-50 rounded-full px-4 py-3 focus:outline-none"
                    />
                    <input
                        type="number"
                        placeholder="¥"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-slate-50 rounded-full px-4 py-3 focus:outline-none"
                    />
                    <button
                        onClick={add}
                        disabled={!label || !amount}
                        className="w-12 h-12 bg-black rounded-full text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

        </div>
    );
}
