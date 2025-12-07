'use client';

import React, { useState, useEffect } from 'react';
import { OrderData, OrderItem } from '../types';
import { Plus, Trash2, Save, Loader2, Calendar } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ExtractionFormProps {
    initialData: OrderData;
    onSave: (data: OrderData) => Promise<void>;
    onCancel: () => void;
}

export function ExtractionForm({ initialData, onSave, onCancel }: ExtractionFormProps) {
    const [formData, setFormData] = useState<OrderData>(initialData);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData((prev) => ({ ...prev, items: newItems }));

        if (field === 'price' || field === 'quantity') {
            recalculateTotal(newItems);
        }
    };

    const recalculateTotal = (items: OrderItem[]) => {
        // ユーザーの要望により、自動計算（税10%など）は行わず、
        // 明細行の単純合計のみを計算する（消費税行があればそれも含まれるため）
        const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

        setFormData((prev) => ({
            ...prev,
            subtotal_amount: subtotal,
            // tax_amount は自動計算しない（AIが読み取った値を維持、または手入力）
            total_amount: subtotal // 合計も単純積み上げ（必要なら手修正）
        }));
    };

    const addItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { product_code: '', product_name: '', spec: '', quantity: 1, price: 0 }],
        }));
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, items: newItems }));
        recalculateTotal(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <div className="min-w-[800px]">
                <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">解析結果の確認・編集</h2>
                    <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
                        キャンセル
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-8">

                    {/* 基本情報 */}
                    {/* 基本情報 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">発注書番号</label>
                            <input
                                type="text"
                                name="order_number"
                                value={formData.order_number || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">発行日</label>
                            <input
                                type="date"
                                name="issue_date"
                                value={formData.issue_date || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">納入期限</label>
                            <input
                                type="date"
                                name="delivery_date"
                                value={formData.delivery_date || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-gray-100 py-6">
                        {/* 発注元 */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                発注元 (Orderer)
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    name="orderer_name"
                                    value={formData.orderer_name || ''}
                                    onChange={handleInputChange}
                                    placeholder="会社名"
                                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="text"
                                    name="orderer_address"
                                    value={formData.orderer_address || ''}
                                    onChange={handleInputChange}
                                    placeholder="住所"
                                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    name="orderer_contact"
                                    value={formData.orderer_contact || ''}
                                    onChange={handleInputChange}
                                    placeholder="担当者"
                                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* 発注先 */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                発注先 (Supplier)
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    name="supplier_name"
                                    value={formData.supplier_name || ''}
                                    onChange={handleInputChange}
                                    placeholder="会社名"
                                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="text"
                                    name="supplier_address"
                                    value={formData.supplier_address || ''}
                                    onChange={handleInputChange}
                                    placeholder="住所"
                                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    name="supplier_contact"
                                    value={formData.supplier_contact || ''}
                                    onChange={handleInputChange}
                                    placeholder="担当者"
                                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 条件系 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">納入場所</label>
                            <input
                                type="text"
                                name="delivery_place"
                                value={formData.delivery_place || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">納品方法</label>
                            <input
                                type="text"
                                name="delivery_method"
                                value={formData.delivery_method || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">支払い条件</label>
                            <input
                                type="text"
                                name="payment_terms"
                                value={formData.payment_terms || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* 明細行 */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-gray-900">明細行</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                行を追加
                            </button>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                    <tr>
                                        <th className="px-4 py-3 w-24">品番</th>
                                        <th className="px-4 py-3">品名</th>
                                        <th className="px-4 py-3 w-32">仕様</th>
                                        <th className="px-4 py-3 w-20">数量</th>
                                        <th className="px-4 py-3 w-28">単価</th>
                                        <th className="px-4 py-3 w-28">金額</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(formData.items || []).map((item, index) => (
                                        <tr key={index} className="group hover:bg-gray-50/50">
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={item.product_code}
                                                    onChange={(e) => handleItemChange(index, 'product_code', e.target.value)}
                                                    className="w-full px-2 py-1 rounded border border-gray-200 focus:border-blue-500 outline-none"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={item.product_name || ''}
                                                    onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                                                    className="w-full px-2 py-1 rounded border border-gray-200 focus:border-blue-500 outline-none"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={item.spec || ''}
                                                    onChange={(e) => handleItemChange(index, 'spec', e.target.value)}
                                                    className="w-full px-2 py-1 rounded border border-gray-200 focus:border-blue-500 outline-none"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity || ''}
                                                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                    className="w-full px-2 py-1 rounded border border-gray-200 focus:border-blue-500 outline-none text-right"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={item.price || ''}
                                                    onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                                    className="w-full px-2 py-1 rounded border border-gray-200 focus:border-blue-500 outline-none text-right"
                                                />
                                            </td>
                                            <td className="p-2 text-right font-medium text-gray-700">
                                                ¥{(item.quantity * item.price).toLocaleString()}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t font-semibold text-gray-900">
                                    <tr>
                                        <td colSpan={5} className="px-4 py-2 text-right text-gray-500 font-normal">小計</td>
                                        <td className="px-4 py-2 text-right">¥{(formData.subtotal_amount || 0).toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} className="px-4 py-2 text-right text-gray-500 font-normal">消費税</td>
                                        <td className="px-4 py-2 text-right">¥{(formData.tax_amount || 0).toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                    <tr className="bg-gray-100">
                                        <td colSpan={5} className="px-4 py-3 text-right">合計金額</td>
                                        <td className="px-4 py-3 text-right text-lg">
                                            ¥{(formData.total_amount || 0).toLocaleString()}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* 備考欄 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">備考欄</label>
                        <textarea
                            name="remarks"
                            value={formData.remarks || ''}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={twMerge(
                                "flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white shadow-md transition-all",
                                isSaving
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    データベースへ保存
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
