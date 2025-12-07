'use client';

import React, { useState, useCallback } from 'react';
import { Upload, File as FileIcon, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FileUploadProps {
    onAnalyze: (file: File) => void;
    isAnalyzing: boolean;
}

export function FileUpload({ onAnalyze, isAnalyzing }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }, []);

    const handleRemoveFile = useCallback(() => {
        setFile(null);
    }, []);

    const handleAnalyzeClick = useCallback(() => {
        if (file) {
            onAnalyze(file);
        }
    }, [file, onAnalyze]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={twMerge(
                    "relative border-2 border-dashed rounded-xl p-10 transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer",
                    isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50",
                    file ? "bg-white border-blue-200" : "bg-white"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {!file ? (
                    <>
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            注文書をアップロード
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            ここにファイルをドラッグ＆ドロップ、またはクリックして選択
                        </p>
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            disabled={isAnalyzing}
                        />
                    </>
                ) : (
                    <div className="w-full flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <FileIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">{file.name}</p>
                        <p className="text-sm text-gray-500 mb-6">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        {!isAnalyzing && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile();
                                }}
                                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleAnalyzeClick}
                    disabled={!file || isAnalyzing}
                    className={twMerge(
                        "flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all",
                        !file || isAnalyzing
                            ? "bg-gray-300 cursor-not-allowed shadow-none"
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-0.5"
                    )}
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            解析中...
                        </>
                    ) : (
                        <>
                            画像解析を実行
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
