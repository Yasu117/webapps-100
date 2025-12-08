'use client';

import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ExtractionForm } from './components/ExtractionForm';
import { HistoryTable } from './components/HistoryTable';
import { OrderData } from './types';
import { supabase } from '@/utils/supabase'; // Using alias if configured, or relative path
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { analyzeImage, checkEnvVars } from './actions';

export const viewport = {
    colorScheme: 'light',
    themeColor: '#ffffff',
};

export default function Page() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [envStatus, setEnvStatus] = useState<{ hasGeminiKey: boolean, keyPrefix: string } | null>(null);

    useEffect(() => {
        fetchOrders();
        checkEnvVars().then(setEnvStatus);
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('extracted_orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching orders:', error);
            // If table doesn't exist, we might get an error. For MVP, we just log it.
        } else if (data) {
            setOrders(data);
        }
    };

    const handleAnalyze = async (file: File) => {
        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await analyzeImage(formData);

            if ('error' in result) {
                console.error("Analysis Error:", result);
                setToast({ type: 'error', message: result.error as string });
                setIsAnalyzing(false);
                return;
            }

            setCurrentOrder(result as OrderData);
            setToast({ type: 'success', message: '解析が完了しました' });
        } catch (error) {
            console.error('Analysis failed:', error);
            setToast({ type: 'error', message: '解析に失敗しました: ' + (error as any).message });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async (data: OrderData) => {
        try {
            const { error } = await supabase
                .from('extracted_orders')
                .insert([
                    {
                        order_number: data.order_number,
                        issue_date: data.issue_date,
                        orderer_name: data.orderer_name,
                        orderer_address: data.orderer_address,
                        orderer_contact: data.orderer_contact,
                        supplier_name: data.supplier_name,
                        supplier_address: data.supplier_address,
                        supplier_contact: data.supplier_contact,
                        delivery_date: data.delivery_date,
                        delivery_place: data.delivery_place,
                        delivery_method: data.delivery_method,
                        payment_terms: data.payment_terms,
                        subtotal_amount: data.subtotal_amount,
                        tax_amount: data.tax_amount,
                        total_amount: data.total_amount,
                        remarks: data.remarks,
                        items: data.items,
                    }
                ]);

            if (error) throw error;

            setToast({ type: 'success', message: 'データを保存しました' });
            setCurrentOrder(null);
            fetchOrders();
        } catch (error) {
            console.error('Save failed:', error);
            setToast({ type: 'error', message: '保存に失敗しました: ' + (error as any).message });
        }
    };

    // 006のデザインに合わせたドラッグ＆ドロップ関連の状態管理
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
            handleAnalyze(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleAnalyze(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        007 AI-OCR 受発注入力
                    </h1>
                    <p className="mt-2 text-slate-600">
                        注文書をアップロードするだけで、AIが内容を自動で読み取りデータ化します。
                        手入力の手間を削減し、業務効率を劇的に向上させます。
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* ファイルアップロードカード (006のデザインを移植) */}
                    <div className="bg-white shadow rounded-lg p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            A. 注文書のアップロード
                        </h2>

                        <div
                            className={twMerge(
                                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                                isDragging
                                    ? "border-indigo-500 bg-indigo-50"
                                    : "border-slate-300 hover:bg-slate-50",
                                isAnalyzing ? "opacity-50 cursor-not-allowed" : ""
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !isAnalyzing && document.getElementById('file-upload')?.click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isAnalyzing}
                            />

                            <div className="space-y-2 pointer-events-none">
                                <div className="mx-auto h-12 w-12 text-slate-400">
                                    {/* 006と同じアイコン (Document icon) */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>

                                <p className="text-sm text-slate-600 font-medium">
                                    ファイルをドラッグ＆ドロップ
                                </p>
                                <p className="text-xs text-slate-500">
                                    または クリックして選択
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">
                            ※ 画像ファイル (JPG, PNG) または PDF に対応しています。<br />
                            AI解析には数秒〜数十秒かかる場合があります。
                        </p>

                        {/* ローディング表示 */}
                        {isAnalyzing && (
                            <div className="text-center text-blue-600 font-medium animate-pulse mt-4">
                                解析中...
                            </div>
                        )}
                    </div>

                    {/* Section 2: Result (Conditional) */}
                    {currentOrder && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white shadow rounded-lg p-6 space-y-4 border border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-800">
                                    B. 解析結果の確認
                                </h2>
                                <ExtractionForm
                                    initialData={currentOrder}
                                    onSave={handleSave}
                                    onCancel={() => setCurrentOrder(null)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Section 3: History */}
                    <div className="bg-white shadow rounded-lg p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            C. 最近の保存データ
                        </h2>
                        <HistoryTable orders={orders} />
                    </div>
                </div>

                <footer className="mt-12 py-6 text-center text-slate-400 text-sm border-t border-slate-200">
                    <p>AI-OCR Order Entry System</p>
                    <p className="text-xs mt-2 font-mono">
                        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 'UNDEFINED'}
                    </p>
                    <p className="text-xs">
                        Server Gemini Key: {envStatus?.hasGeminiKey ? `Present (${envStatus.keyPrefix}...)` : 'Missing'}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-2">v20251207-1830</p>
                </footer>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right-full duration-300">
                    <div className={twMerge(
                        "flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border",
                        toast.type === 'success' ? "bg-white border-green-200 text-green-800" : "bg-white border-red-200 text-red-800"
                    )}>
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        )}
                        <p className="font-medium">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}


