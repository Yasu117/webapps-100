"use client";

import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import {
    FileUp,
    Files,
    Trash2,
    Download,
    ArrowUp,
    ArrowDown,
    FileText,
    MousePointer2,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type PdfFile = {
    id: string;
    file: File;
    name: string;
    pageCount: number;
};

export default function PdfToolsPage() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ファイル処理の共通ロジック
    const processFiles = async (inputFiles: FileList | File[]) => {
        setIsProcessing(true);

        const newFiles: PdfFile[] = [];
        for (const file of Array.from(inputFiles)) {
            if (file.type !== "application/pdf") continue;
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                newFiles.push({
                    id: Math.random().toString(36).substring(7),
                    file,
                    name: file.name,
                    pageCount: pdfDoc.getPageCount(),
                });
            } catch (err) {
                console.error("Failed to load PDF", err);
                alert(`${file.name} の読み込みに失敗しました。`);
            }
        }

        setFiles((prev) => [...prev, ...newFiles]);
        setIsProcessing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    };

    // ファイル追加ハンドラ (Click)
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        processFiles(e.target.files);
    };

    // ドラッグ＆ドロップハンドラ
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    // ファイル削除
    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    // 順序入れ替え（上へ）
    const moveUp = (index: number) => {
        if (index === 0) return;
        setFiles((prev) => {
            const newFiles = [...prev];
            [newFiles[index - 1], newFiles[index]] = [
                newFiles[index],
                newFiles[index - 1],
            ];
            return newFiles;
        });
    };

    // 順序入れ替え（下へ）
    const moveDown = (index: number) => {
        if (index === files.length - 1) return;
        setFiles((prev) => {
            const newFiles = [...prev];
            [newFiles[index], newFiles[index + 1]] = [
                newFiles[index + 1],
                newFiles[index],
            ];
            return newFiles;
        });
    };

    // PDF結合処理
    const mergePdfs = async () => {
        if (files.length < 2) {
            alert("結合するには2つ以上のPDFを追加してください。");
            return;
        }

        setIsProcessing(true);
        try {
            const mergedPdf = await PDFDocument.create();

            for (const pdfFile of files) {
                const arrayBuffer = await pdfFile.file.arrayBuffer();
                const pdfObj = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(
                    pdfObj,
                    pdfObj.getPageIndices()
                );
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `merged_${new Date().getTime()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Merge failed", err);
            alert("PDFの結合に失敗しました。");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="text-center space-y-4">
                    <div>
                        <div className="text-sm font-bold text-blue-400 mb-1">App 023</div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            PDFツール
                        </h1>
                    </div>

                    <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>

                    <div className="bg-slate-900/50 p-4 rounded-xl text-sm text-slate-300 text-left border border-slate-800">
                        <h3 className="font-bold text-slate-200 mb-2">使い方</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                            <li>複数のPDFファイルをアップロードして、1つのファイルに<strong>結合</strong>できます。</li>
                            <li>ファイルをドラッグ＆ドロップするか、クリックして選択してください。</li>
                            <li>ファイルリストの矢印ボタンで結合順序を並べ替えられます。</li>
                            <li>処理はすべてブラウザ上で行われるため、外部サーバーにファイルが送信されることはありません。</li>
                        </ul>
                    </div>
                </header>

                {/* ファイル操作エリア */}
                <div
                    className={`
                        rounded-xl border-2 border-dashed transition-all p-6 shadow-xl backdrop-blur-sm
                        ${isDragging
                            ? "bg-indigo-900/40 border-indigo-400 scale-[1.02]"
                            : "bg-slate-900/50 border-slate-800"
                        }
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {files.length === 0 ? (
                        <div
                            className="p-8 text-center cursor-pointer hover:bg-slate-800/50 rounded-xl transition-all group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FileUp className={`w-12 h-12 mx-auto mb-3 transition-colors ${isDragging ? "text-indigo-400" : "text-slate-600 group-hover:text-indigo-400"}`} />
                            <p className="text-slate-300 font-medium text-lg">
                                {isDragging ? "ここにPDFをドロップ" : "PDFファイルを追加"}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                クリックして選択 または ドラッグ＆ドロップ
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <Files className="w-4 h-4" />
                                    選択中のファイル ({files.length})
                                </h2>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                                >
                                    + 追加
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                                {files.map((file, index) => (
                                    <div
                                        key={file.id}
                                        className="group bg-slate-800 rounded-lg p-3 flex items-center gap-3 border border-slate-700 hover:border-slate-600 transition"
                                    >
                                        <div className="p-2 bg-slate-700/50 rounded text-slate-400">
                                            <FileText className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate text-slate-200">
                                                {file.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {file.pageCount} ページ
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => moveUp(index)}
                                                disabled={index === 0}
                                                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => moveDown(index)}
                                                disabled={index === files.length - 1}
                                                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded ml-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        multiple
                        className="hidden"
                    />
                </div>

                {/* アクションボタン */}
                {files.length > 0 && (
                    <div className="sticky bottom-4">
                        <button
                            onClick={mergePdfs}
                            disabled={isProcessing || files.length < 2}
                            className={`w-full py-4 rounded-xl font-bold btn-shine shadow-lg flex items-center justify-center gap-2 text-lg transition-all transform active:scale-95 ${files.length < 2
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25"
                                }`}
                        >
                            {isProcessing ? (
                                <span className="animate-pulse">処理中...</span>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    PDFを結合してダウンロード
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* ヒント */}
                <div className="text-center text-xs text-slate-500">
                    <p>※クライアントサイドで処理されるため、大きなファイルは時間がかかる場合があります。</p>
                </div>
            </div>
        </div>
    );
}
