
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X, GripVertical } from "lucide-react";

type Task = {
    id: string;
    content: string;
    status: "todo" | "doing" | "done";
};

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("app077-tasks");
        if (saved) {
            setTasks(JSON.parse(saved));
        } else {
            setTasks([
                { id: "1", content: "アイデアを出す", status: "done" },
                { id: "2", content: "設計する", status: "doing" },
                { id: "3", content: "実装する", status: "todo" },
            ]);
        }
    }, []);

    const saveTasks = (newTasks: Task[]) => {
        setTasks(newTasks);
        localStorage.setItem("app077-tasks", JSON.stringify(newTasks));
    };

    const addTask = (status: Task["status"]) => {
        const text = prompt("Enter task:");
        if (text) {
            const newTask: Task = {
                id: Date.now().toString(),
                content: text,
                status,
            };
            saveTasks([...tasks, newTask]);
        }
    };

    const deleteTask = (id: string) => {
        if (confirm("Delete this task?")) {
            saveTasks(tasks.filter(t => t.id !== id));
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedTaskId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, status: Task["status"]) => {
        e.preventDefault();
        if (draggedTaskId) {
            const newTasks = tasks.map(t =>
                t.id === draggedTaskId ? { ...t, status } : t
            );
            saveTasks(newTasks);
            setDraggedTaskId(null);
        }
    };

    const columns: { id: Task["status"], title: string, color: string }[] = [
        { id: "todo", title: "To Do", color: "bg-pink-100" },
        { id: "doing", title: "Doing", color: "bg-yellow-100" },
        { id: "done", title: "Done", color: "bg-blue-100" },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 overflow-x-auto">
            <header className="flex items-center gap-4 mb-6">
                <Link href="/apps" className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><ArrowLeft size={20} /></Link>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold">#077 Kanban Board</h1>
                    <p className="text-xs text-slate-500">Simple Drag & Drop Task Management</p>
                </div>
            </header>

            <div className="flex gap-4 min-w-[800px] h-[calc(100vh-100px)]">
                {columns.map(col => (
                    <div
                        key={col.id}
                        className={`flex-1 rounded-2xl p-4 flex flex-col gap-3 ${col.color} shadow-sm border border-slate-200/50`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-bold text-slate-700">{col.title} <span className="text-xs opacity-50 bg-black/10 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === col.id).length}</span></h2>
                            <button onClick={() => addTask(col.id)} className="p-1 hover:bg-black/10 rounded"><Plus size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing group hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm leading-relaxed">{task.content}</p>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        <GripVertical size={14} className="text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
