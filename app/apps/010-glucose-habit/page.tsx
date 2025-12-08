'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MealRecord, UserProfile, MealCategory, RiskLevel } from './types';

// --- Constants ---
const STORAGE_KEY_MEALS = 'app-010-glucose-meals';
const STORAGE_KEY_PROFILE = 'app-010-glucose-profile';

const CATEGORY_LABELS: Record<MealCategory, string> = {
    carb_heavy: '糖質多め',
    balanced: 'バランス',
    low_carb: '低糖質',
};

const RISK_LABELS: Record<RiskLevel, string> = {
    low: '低',
    medium: '中',
    high: '高',
};

const RISK_COLORS: Record<RiskLevel, string> = {
    low: 'text-emerald-600 bg-emerald-100 border-emerald-200',
    medium: 'text-yellow-700 bg-yellow-100 border-yellow-200',
    high: 'text-rose-700 bg-rose-100 border-rose-200',
};

// --- Helper Functions ---
function getFormattedToday(): string {
    const now = new Date();
    // YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDate(isoString: string): string {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getDateKey(isoString: string): string {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Unknown';
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 800; // Resize to reasonable max dimension
            const MAX_HEIGHT = 800;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.7 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl);
            URL.revokeObjectURL(img.src);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(img.src);
            reject(err);
        };
    });
};

// --- Main Component ---
export default function GlucoseHabitPage() {
    const [activeTab, setActiveTab] = useState<'today' | 'history' | 'profile'>('today');

    // Data State
    const [meals, setMeals] = useState<MealRecord[]>([]);
    const [profile, setProfile] = useState<UserProfile>({
        nickname: '',
        age: '',
        gender: 'no_answer',
        height: '',
        weight: '',
        exercises: [],
        memo: ''
    });

    // Form State (Today Tab)
    const [inputDate, setInputDate] = useState(getFormattedToday());
    const [inputText, setInputText] = useState('');
    const [inputMemo, setInputMemo] = useState('');
    const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Validate image type if needed, but for now just accept
            if (e.dataTransfer.files[0].type.startsWith('image/')) {
                setSelectedFile(e.dataTransfer.files[0]);
                setSelectedImageName(e.dataTransfer.files[0].name);
            } else {
                alert('画像ファイルを選択してください');
            }
        }
    };

    // Initial Load
    useEffect(() => {
        const savedMeals = localStorage.getItem(STORAGE_KEY_MEALS);
        if (savedMeals) {
            try {
                setMeals(JSON.parse(savedMeals));
            } catch (e) {
                console.error('Failed to parse meals', e);
            }
        }

        const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (savedProfile) {
            try {
                setProfile(JSON.parse(savedProfile));
            } catch (e) {
                console.error('Failed to parse profile', e);
            }
        }
    }, []);

    // Save functions
    const saveMeals = (newMeals: MealRecord[]) => {
        setMeals(newMeals);
        localStorage.setItem(STORAGE_KEY_MEALS, JSON.stringify(newMeals));
    };

    const saveProfile = (newProfile: UserProfile) => {
        setProfile(newProfile);
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
    };

    // Actions
    const handleAnalyze = async () => {
        if (!inputText.trim() && !selectedFile) {
            alert('食事内容または画像を入力してください');
            return;
        }

        setIsAnalyzing(true);

        try {
            let imageBase64 = null;
            if (selectedFile) {
                try {
                    // Resize/Compress logic
                    imageBase64 = await compressImage(selectedFile);
                } catch (e) {
                    console.error("Image compression failed", e);
                    // Fallback to raw reading if compression fails
                    const reader = new FileReader();
                    imageBase64 = await new Promise<string>((resolve, reject) => {
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(selectedFile);
                    });
                }
            }

            const res = await fetch('/api/meals/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meal: { text: inputText, eatenAt: inputDate, image: imageBase64 },
                    profile: profile
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || 'API Error: ' + res.status);
            }

            const data = await res.json();

            const newRecord: MealRecord = {
                id: crypto.randomUUID(),
                text: inputText,
                note: inputMemo,
                eatenAt: inputDate,
                imageUrl: selectedImageName || undefined,
                category: data.category,
                riskLevel: data.riskLevel,
                adviceText: data.adviceText,
                exerciseDone: false,
                createdAt: Date.now()
            };

            const updatedMeals = [newRecord, ...meals];
            saveMeals(updatedMeals);

            // Reset form
            setInputText('');
            setInputMemo('');
            setSelectedImageName(null);
            setSelectedFile(null);
            setInputDate(getFormattedToday());

        } catch (error: any) {
            console.error(error);
            // Fallback mock
            const fallbackRecord: MealRecord = {
                id: crypto.randomUUID(),
                text: inputText,
                note: inputMemo,
                eatenAt: inputDate,
                imageUrl: selectedImageName || undefined,
                category: 'balanced',
                riskLevel: 'medium',
                adviceText: '通信エラーまたはAPI制限のため解析できませんでした。時間をおいて試すか、画像のサイズを小さくしてください。',
                exerciseDone: false,
                createdAt: Date.now()
            };
            saveMeals([fallbackRecord, ...meals]);

            // Reset
            setInputText('');
            setInputMemo('');
            setSelectedImageName(null);
            setSelectedFile(null);

            alert(`解析に失敗しました（ダミーデータを登録しました）\nエラー: ${error?.message || String(error)}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleExercise = (id: string) => {
        const updated = meals.map(m =>
            m.id === id ? { ...m, exerciseDone: !m.exerciseDone } : m
        );
        saveMeals(updated);
    };

    // Derived State
    const todayKey = getDateKey(new Date().toISOString());
    const todaysMeals = meals.filter(m => getDateKey(m.eatenAt) === todayKey);

    // Group by date for history
    const groupedHistory = useMemo(() => {
        const groups: Record<string, MealRecord[]> = {};
        meals.forEach(m => {
            const key = getDateKey(m.eatenAt);
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });
        // Sort keys desc
        return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    }, [meals]);


    // --- Render Functions ---

    const renderTabBar = () => (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <button
                onClick={() => setActiveTab('today')}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'today' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}
            >
                <span className="text-xl mb-0.5">🍚</span>
                <span className="text-[10px]">今日の記録</span>
            </button>
            <button
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'history' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}
            >
                <span className="text-xl mb-0.5">📅</span>
                <span className="text-[10px]">履歴</span>
            </button>
            <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'profile' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}
            >
                <span className="text-xl mb-0.5">👤</span>
                <span className="text-[10px]">プロフィール</span>
            </button>
        </div>
    );

    const renderMealCard = (meal: MealRecord, showDate = false) => (
        <div key={meal.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="text-xs text-slate-500 font-medium">
                    {showDate ? formatDate(meal.eatenAt) : meal.eatenAt.split('T')[1]}
                </div>
                <div className="flex gap-2">
                    {meal.category && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {CATEGORY_LABELS[meal.category]}
                        </span>
                    )}
                    {meal.riskLevel && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${RISK_COLORS[meal.riskLevel]}`}>
                            リスク: {RISK_LABELS[meal.riskLevel]}
                        </span>
                    )}
                </div>
            </div>

            <div className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                {meal.text}
            </div>
            {meal.note && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded leading-relaxed border border-slate-100">
                    <span className="font-bold mr-1">📝 メモ:</span>
                    {meal.note}
                </div>
            )}
            {meal.imageUrl && (
                <div className="text-xs text-slate-400 flex items-center gap-1">
                    <span>📷</span> {meal.imageUrl}
                </div>
            )}

            {meal.adviceText && (
                <div className="bg-sky-50 rounded-lg p-3 text-xs text-slate-700 leading-relaxed border border-sky-100">
                    <span className="font-bold text-sky-600 block mb-1">💡 アドバイス</span>
                    {meal.adviceText}
                </div>
            )}

            <label className={`flex items-center gap-2 mt-1 p-2 rounded-lg transition-colors cursor-pointer select-none ${meal.exerciseDone ? 'bg-green-50' : 'hover:bg-slate-50'}`}>
                <input
                    type="checkbox"
                    checked={meal.exerciseDone}
                    onChange={() => toggleExercise(meal.id)}
                    className="w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className={`text-sm ${meal.exerciseDone ? 'text-green-700 font-bold' : 'text-slate-600'}`}>
                    {meal.exerciseDone ? '運動を実行しました！🎉' : '運動したらチェック'}
                </span>
            </label>
        </div>
    );

    const renderTodayTab = () => (
        <div className="space-y-6">
            <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    🍽 食事を記録
                </h2>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">食事の時間</label>
                    <input
                        type="datetime-local"
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">写真 (推奨)</label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:bg-slate-50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setSelectedFile(e.target.files[0]);
                                    setSelectedImageName(e.target.files[0].name);
                                }
                            }}
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            <span className="text-2xl">📷</span>
                            <span className="text-xs text-slate-500 font-bold">
                                {selectedImageName ? selectedImageName : 'クリック または ドラッグ＆ドロップ'}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">食事の内容 (写真がない場合や補足)</label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="例：写真がない場合は詳細を入力してください"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 h-24 resize-none outline-none focus:ring-2 focus:ring-sky-200 placeholder:text-slate-400"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">一言コメント (任意)</label>
                    <input
                        type="text"
                        value={inputMemo}
                        onChange={(e) => setInputMemo(e.target.value)}
                        placeholder="例：美味しかった、少し食べすぎた"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-200 placeholder:text-slate-400"
                    />
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!inputText.trim() && !selectedFile)}
                    className={`w-full py-3 rounded-xl text-white font-bold shadow-md transition-all active:scale-[0.98] ${isAnalyzing || (!inputText.trim() && !selectedFile)
                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/30'
                        }`}
                >
                    {isAnalyzing ? '解析中...' : 'AIに解析を依頼する ✨'}
                </button>
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 px-1">今日の記録 ({todaysMeals.length})</h3>
                {todaysMeals.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-sm">まだ記録がありません</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {todaysMeals.map(meal => renderMealCard(meal))}
                    </div>
                )}
            </section>
        </div>
    );

    const renderHistoryTab = () => (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 px-1">履歴</h2>
            {groupedHistory.map(([dateString, dateMeals]) => {
                const total = dateMeals.length;
                const carbHighCount = dateMeals.filter(m => m.category === 'carb_heavy').length;
                const doneCount = dateMeals.filter(m => m.exerciseDone).length;

                return (
                    <details key={dateString} open className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors list-none select-none">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{dateString}</span>
                                <div className="text-[10px] text-slate-500 mt-1 space-x-2">
                                    <span>🍽 {total}食</span>
                                    {carbHighCount > 0 && <span className="text-rose-500 font-bold">⚠️ 糖質多め: {carbHighCount}</span>}
                                    <span className="text-emerald-600 font-bold">👟 運動: {doneCount}</span>
                                </div>
                            </div>
                            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-4 pt-0 space-y-4 border-t border-slate-100 bg-white">
                            <div className="h-2"></div> {/* spacer */}
                            {dateMeals.map(meal => renderMealCard(meal, false))}
                        </div>
                    </details>
                );
            })}
            {groupedHistory.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-slate-400">履歴がありません</p>
                </div>
            )}
        </div>
    );

    const renderProfileTab = () => (
        <div className="space-y-6 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">プロフィール設定</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">ニックネーム</label>
                    <input
                        type="text"
                        value={profile.nickname}
                        onChange={(e) => saveProfile({ ...profile, nickname: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">年齢</label>
                        <input
                            type="number"
                            value={profile.age}
                            onChange={(e) => saveProfile({ ...profile, age: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">性別</label>
                        <select
                            value={profile.gender}
                            onChange={(e) => saveProfile({ ...profile, gender: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                        >
                            <option value="no_answer">無回答</option>
                            <option value="male">男性</option>
                            <option value="female">女性</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">身長 (cm)</label>
                        <input
                            type="number"
                            value={profile.height}
                            onChange={(e) => saveProfile({ ...profile, height: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">体重 (kg)</label>
                        <input
                            type="number"
                            value={profile.weight}
                            onChange={(e) => saveProfile({ ...profile, weight: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">よく行う運動</label>
                    <div className="flex flex-wrap gap-2">
                        {['ウォーキング', 'ランニング', '筋トレ', 'ヨガ', 'ストレッチ', '水泳', 'サイクリング'].map(ex => (
                            <label key={ex} className={`px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-colors ${profile.exercises.includes(ex) ? 'bg-sky-100 text-sky-700 border-sky-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={profile.exercises.includes(ex)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            saveProfile({ ...profile, exercises: [...profile.exercises, ex] });
                                        } else {
                                            saveProfile({ ...profile, exercises: profile.exercises.filter(item => item !== ex) });
                                        }
                                    }}
                                />
                                {ex}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">メモ（持病や気になること）</label>
                    <textarea
                        value={profile.memo}
                        onChange={(e) => saveProfile({ ...profile, memo: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 resize-none"
                    />
                </div>
            </div>

            <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-lg text-[11px] text-orange-800 leading-relaxed">
                <span className="font-bold block mb-1">⚠️ ご利用上の注意</span>
                このアプリは医療・診断を目的としたものではなく、一般的な生活習慣の参考情報を提供するためのものです。健康状態については必ず医師などの専門家にご相談ください。
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            <div className="max-w-md mx-auto min-h-screen bg-slate-50">
                {/* Header Area */}
                <header className="px-5 py-4 bg-white shadow-sm sticky top-0 z-10">
                    <h1 className="text-lg font-bold text-slate-800">010 血糖値習慣サポート</h1>
                </header>

                {/* Main Content Area */}
                <main className="p-4">
                    {activeTab === 'today' && renderTodayTab()}
                    {activeTab === 'history' && renderHistoryTab()}
                    {activeTab === 'profile' && renderProfileTab()}
                </main>

                {renderTabBar()}
            </div>
        </div>
    );
}
