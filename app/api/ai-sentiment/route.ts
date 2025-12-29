
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const { text } = await req.json();

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        // Keep output valid JSON
        const prompt = `
以下の日記テキストの感情を分析してください。

# テキスト
${text}

# 出力フォーマット (JSONのみ)
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "score": 0〜100 (ポジティブ度),
  "primary_emotion": "喜び" | "悲しみ" | "怒り" | "不安" | "平穏" | "期待",
  "comment": "短いフィードバックコメント（30文字以内）"
}

Markdown記号は含めず、純粋なJSON文字列のみを返してください。
    `;

        const result = await model.generateContent(prompt);
        let jsonStr = result.response.text();
        jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();

        return NextResponse.json({ result: jsonStr });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 });
    }
}
