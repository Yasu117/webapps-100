
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const { ingredients } = await req.json();

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
あなたはプロの料理人です。
以下の食材を使って作れる美味しいレシピを3つ提案してください。

# 食材
${ingredients}

# 出力要件
- 1つだけでなく、3つのバリエーション（例：主菜、副菜、汁物、またはジャンル違い）を出すこと。
- 各レシピには、料理名、簡単な材料リスト、手順（3ステップ程度）、調理時間の目安を含めること。
- Markdown形式で見やすく出力すること。
- 日本語で出力すること。
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 });
    }
}
