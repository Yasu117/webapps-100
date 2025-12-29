
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const { target, budget, likes } = await req.json();

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
あなたはギフト選びのプロフェッショナルです。
以下の条件に合うプレゼントを5つ提案してください。

- 相手の属性: ${target}
- 予算: ${budget}
- 相手の好きなもの・趣味: ${likes}

# 出力要件
- 各提案について、「商品名（またはジャンル）」と「おすすめ理由」を書くこと。
- なぜそれが相手に喜ばれるか、気の利いたポイントを含めること。
- Markdown形式で出力すること。
- 日本語で出力すること。
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to generate gift ideas" }, { status: 500 });
    }
}
