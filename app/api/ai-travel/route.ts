
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const { destination, days, interests } = await req.json();

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
あなたはトラベルプランナーです。
以下の条件で旅行プランを作成してください。

- 目的地: ${destination}
- 期間: ${days}日間
- 興味・関心: ${interests}

# 出力要件
- 1日ごとのタイムスケジュール（朝・昼・夕・夜）を作成すること。
- 各スポットの魅力や移動手段も簡単に補足すること。
- Markdown形式で出力すること。
- 日本語で出力すること。
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to generate travel plan" }, { status: 500 });
    }
}
