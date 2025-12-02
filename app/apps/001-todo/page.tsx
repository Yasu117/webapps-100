"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "miniapp-001-todo";

export default function TodoApp() {
    const [todos, setTodos] = useState<string[]>([]);
    const [input, setInput] = useState("");

    // 🔹 初回ロード時に localStorage から読み込む
    useEffect(() => {
        if (typeof window === "undefined") return; // SSR対策
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setTodos(JSON.parse(saved));
            } catch {
                // 壊れてたら無視
            }
        }
    }, []);

    // 🔹 todos が変わるたびに localStorage に保存
    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }, [todos]);

    // 追加
    const addTodo = () => {
        if (!input.trim()) return;
        setTodos([...todos, input.trim()]);
        setInput("");
    };

    // 完了（＝削除）
    const completeTodo = (index: number) => {
        setTodos((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-md mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-center">シンプルToDo</h1>

                {/* 入力欄 */}
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-2 rounded bg-slate-800 border border-slate-700"
                        placeholder="やることを入力..."
                        onKeyDown={(e) => e.key === "Enter" && addTodo()}
                    />
                    <button
                        onClick={addTodo}
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                    >
                        追加
                    </button>
                </div>

                {/* ToDoリスト */}
                <ul className="space-y-2">
                    {todos.map((todo, i) => (
                        <li
                            key={i}
                            className="flex items-center justify-between gap-2 p-3 bg-slate-800 rounded border border-slate-700"
                        >
                            <span>{todo}</span>
                            <button
                                onClick={() => completeTodo(i)}
                                className="text-xs px-2 py-1 rounded bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                            >
                                完了
                            </button>
                        </li>
                    ))}
                    {todos.length === 0 && (
                        <li className="text-sm text-slate-400">まだタスクはありません。</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
