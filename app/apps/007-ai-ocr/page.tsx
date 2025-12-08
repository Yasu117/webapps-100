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

    return (
        <div className="min-h-dvh bg-white p-4 md:p-8 font-sans text-gray-900" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-12">

                {/* Header */}
                <header className="text-center space-y-4">
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                        AI-OCR 受発注入力
                    </h1>
                    <p className="text-lg text-gray-900 max-w-2xl mx-auto">
                        注文書をアップロードするだけで、AIが内容を自動で読み取りデータ化します。<br />
                        手入力の手間を削減し、業務効率を劇的に向上させます。
                    </p>
                </header>

                {/* Main Content */}
                <main className="space-y-6 md:space-y-12">

                    {/* Section 1: Upload */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                            注文書のアップロード
                        </h2>
                        <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                    </section>

                    {/* Section 2: Result (Conditional) */}
                    {currentOrder && (
                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                                    解析結果の確認
                                </h2>
                                <ExtractionForm
                                    initialData={currentOrder}
                                    onSave={handleSave}
                                    onCancel={() => setCurrentOrder(null)}
                                />
                            </div>
                        </section>
                    )}

                    {/* Section 3: History */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gray-600 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                            最近の保存データ
                        </h2>
                        <HistoryTable orders={orders} />
                    </section>

                </main>

                <footer className="mt-12 py-6 text-center text-gray-400 text-sm border-t border-gray-200">
                    <p>AI-OCR Order Entry System</p>
                    <p className="text-xs mt-2 font-mono">
                        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 'UNDEFINED'}
                    </p>
                    <p className="text-xs">
                        Server Gemini Key: {envStatus?.hasGeminiKey ? `Present (${envStatus.keyPrefix}...)` : 'Missing'}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-2">v20251207-1830</p>
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


