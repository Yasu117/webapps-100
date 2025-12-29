
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const { code, language } = await req.json();

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
あなたはプログラミングの先生です。
以下のコード（言語: ${language || "不明"}）について、初心者にもわかるように丁寧に解説してください。

# コード
\`\`\`
${code}
\`\`\`

# 出力要件
- コードの目的や動作概要を最初に説明する。
- 重要な行や関数について、何をしているか説明する。
- 専門用語があれば噛み砕いて説明する。
- Markdown形式で出力すること。
- 日本語で出力すること。
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to explain code" }, { status: 500 });
    }
}
