
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const { dreamContent } = await req.json();

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
あなたは夢占いの専門家（または心理カウンセラー）です。
ユーザーが見た以下の夢について、その意味や深層心理、そして現実生活へのアドバイスを教えてください。

# 夢の内容
${dreamContent}

# 出力要件
- 夢のシンボル（象徴）をいくつかピックアップして解説すること。
- 吉夢か、警告夢か、または心理的なストレスの表れかなどを優しく伝えること。
- ポジティブな行動指針（ラッキーアクション）で締めくくること。
- Markdown形式で出力すること。
- 日本語で出力すること。
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to interpret dream" }, { status: 500 });
    }
}
