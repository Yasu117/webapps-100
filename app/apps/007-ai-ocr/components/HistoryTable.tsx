'use client';

import React from 'react';
import { OrderData } from '../types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FileText, Calendar, Building2 } from 'lucide-react';

interface HistoryTableProps {
    orders: OrderData[];
}

export function HistoryTable({ orders }: HistoryTableProps) {
    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">保存されたデータはまだありません</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">保存済みデータ一覧</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm text-left">
                    <thead className="bg-white text-gray-500 font-medium border-b">
                        <tr>
                            <th className="px-6 py-3">発注No</th>
                            <th className="px-6 py-3">発行日</th>
                            <th className="px-6 py-3">発注元</th>
                            <th className="px-6 py-3">発注先</th>
                            <th className="px-6 py-3">納期</th>
                            <th className="px-6 py-3 text-right">合計金額</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-400">
                                    {order.order_number || `#${order.id}`}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {order.issue_date ? order.issue_date : '-'}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-blue-500" />
                                        {order.orderer_name || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {order.supplier_name || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {order.delivery_date}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                    ¥{(order.total_amount || 0).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
