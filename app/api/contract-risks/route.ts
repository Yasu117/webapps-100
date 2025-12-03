import { NextRequest, NextResponse } from "next/server";
import { getLegalModel } from "@/lib/gemini";
import { buildContractRiskPrompt } from "./prompt";

export async function POST(req: NextRequest) {
    try {
        const model = getLegalModel();

        if (!model) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { contractText } = body;

        if (!contractText || typeof contractText !== "string" || contractText.trim().length === 0) {
            return NextResponse.json(
                { error: "Invalid contract text." },
                { status: 400 }
            );
        }

        const prompt = buildContractRiskPrompt(contractText);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });
    } catch (error: any) {
        console.error("Error analyzing contract:", error);
        return NextResponse.json(
            {
                error: `[${error.name}] ${error.message} (Details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))})`
            },
            { status: 500 }
        );
    }
}
