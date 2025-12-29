
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const { currentCareer, targetRole } = await req.json();

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
あなたはプロのキャリアコンサルタントです。
以下の「現在の職務経歴」を元に、「${targetRole || "希望職種"}」に向けた、プロフェッショナルで魅力的な職務経歴書をMarkdown形式で作成してください。

# 入力された経歴
${currentCareer}

# 出力要件
- 氏名等の個人情報はプレースホルダー（[氏名]など）にすること。
- 自己PR（要約）、職務経歴詳細、スキルセット、資格、という構成にすること。
- 見出しやリストを使って見やすく整えること。
- 日本語で出力すること。
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
    }
}
