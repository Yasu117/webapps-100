import { NextRequest, NextResponse } from "next/server";
import { getLegalModel } from "@/lib/gemini";
import { buildContractRiskPrompt } from "../contract-risks/prompt";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
    try {
        const model = getLegalModel();

        if (!model) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded." },
                { status: 400 }
            );
        }

        // サイズチェック (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size exceeds 5MB limit." },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let contractText = "";

        // pdfjs-dist を使用してテキスト抽出
        // @ts-ignore
        if (typeof DOMMatrix === "undefined") {
            // @ts-ignore
            global.DOMMatrix = class { };
        }
        // @ts-ignore
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

        // ワーカーを手動で設定して、バンドルに含まれるようにする
        // @ts-ignore
        await import("pdfjs-dist/legacy/build/pdf.worker.mjs");

        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            const uint8Array = new Uint8Array(arrayBuffer);
            const loadingTask = pdfjsLib.getDocument({
                data: uint8Array,
                useSystemFonts: true,
                disableFontFace: true,
            });
            const doc = await loadingTask.promise;
            let fullText = "";
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                fullText += pageText + "\n";
            }
            contractText = fullText;
        } else if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.name.endsWith(".docx")
        ) {
            const { value } = await mammoth.extractRawText({ buffer });
            contractText = value;
        } else {
            return NextResponse.json(
                { error: "Unsupported file type. Please upload PDF or DOCX." },
                { status: 400 }
            );
        }

        if (!contractText || contractText.trim().length < 10) {
            return NextResponse.json(
                { error: "Could not extract text from file. It might be a scanned PDF (image only)." },
                { status: 400 }
            );
        }

        const prompt = buildContractRiskPrompt(contractText);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });

    } catch (error: any) {
        console.error("Error analyzing contract file:", error);
        return NextResponse.json(
            {
                error: `[${error.name}] ${error.message} (Details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))})`
            },
            { status: 500 }
        );
    }
}
