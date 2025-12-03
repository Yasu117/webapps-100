"use client";

import React, { useState } from "react";

export default function ContractRiskAiPage() {
    const [contractText, setContractText] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState("");
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTextSubmit = async () => {
        if (!contractText.trim()) return;

        setIsLoadingText(true);
        setError(null);
        setResult("");

        try {
            const res = await fetch("/api/contract-risks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contractText }),
            });

            if (!res.ok) {
                let errorMessage = `Error ${res.status}: Failed to analyze contract`;
                try {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await res.json();
                        if (errorData.error) {
                            errorMessage = errorData.error;
                        }
                    } else {
                        const text = await res.text();
                        errorMessage = `Error ${res.status}: ${text.slice(0, 200)}`;
                    }
                } catch (e) {
                    // ignore
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            setResult(data.result);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoadingText(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleFileSubmit = async () => {
        if (!selectedFile) return;

        setIsLoadingFile(true);
        setError(null);
        setResult("");

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await fetch("/api/contract-risks-from-file", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                let errorMessage = `Error ${res.status}: Failed to analyze file`;
                try {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await res.json();
                        if (errorData.error) {
                            errorMessage = errorData.error;
                        }
                    } else {
                        const text = await res.text();
                        errorMessage = `Error ${res.status}: ${text.slice(0, 200)}`;
                    }
                } catch (e) {
                    // ignore
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            setResult(data.result);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoadingFile(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        006 契約書リスク抽出AI
                    </h1>
                    <p className="mt-2 text-slate-600">
                        契約書テキストを貼り付けるか、PDF / Word ファイルをアップロードすると、
                        主なリスクと修正提案をAIが洗い出します。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ファイルアップロードカード */}
                    <div className="bg-white shadow rounded-lg p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            A. ファイルから分析
                        </h2>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition">
                            <input
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                "
                                disabled={isLoadingText || isLoadingFile}
                            />
                            {selectedFile && (
                                <div className="mt-2 text-sm text-slate-600">
                                    選択中: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            ※スキャンPDF（画像だけのPDF）の場合はテキストを抽出できないことがあります。
                            <br />
                            対応形式: PDF, Word (.docx) / 上限: 5MB
                        </p>
                        <button
                            onClick={handleFileSubmit}
                            disabled={isLoadingText || isLoadingFile || !selectedFile}
                            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
                ${isLoadingText || isLoadingFile || !selectedFile
                                    ? "bg-slate-400 cursor-not-allowed"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                                }`}
                        >
                            {isLoadingFile ? "分析中..." : "ファイルをアップロードして分析"}
                        </button>
                    </div>

                    {/* テキスト入力カード */}
                    <div className="bg-white shadow rounded-lg p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            B. テキストから分析
                        </h2>
                        <div>
                            <textarea
                                rows={12}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="ここに契約書の条文を貼り付けてください..."
                                value={contractText}
                                onChange={(e) => setContractText(e.target.value)}
                                maxLength={10000}
                                disabled={isLoadingText || isLoadingFile}
                            />
                            <div className="text-right text-xs text-slate-500 mt-1">
                                {contractText.length}文字
                            </div>
                        </div>
                        <button
                            onClick={handleTextSubmit}
                            disabled={isLoadingText || isLoadingFile || !contractText.trim()}
                            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
                ${isLoadingText || isLoadingFile || !contractText.trim()
                                    ? "bg-slate-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                        >
                            {isLoadingText ? "分析中..." : "テキストから分析"}
                        </button>
                    </div>
                </div>

                {/* エラー表示 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                {/* 結果表示 */}
                {result && (
                    <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
                            分析結果
                        </h2>
                        <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto text-black prose-headings:text-black prose-p:text-black prose-strong:text-black prose-li:text-black">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
