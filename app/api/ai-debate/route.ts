
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const { topic, side, userMessage, history } = await req.json();

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Construct chat history context
        const context = history.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n");

        const prompt = `
あなたはディベートの達人です。
今回のテーマは「${topic}」です。
あなたはユーザー（${side}派）とは逆の立場（${side === "肯定" ? "否定" : "肯定"}派、または対立する立場）として反論してください。

# 会話履歴
${context}

# ユーザーの発言
${userMessage}

# 指示
- 相手の意見を尊重しつつも、論理的に鋭い反論や、別の視点からの指摘を行ってください。
- 感情的にならず、知的で少しユーモアのある口調で話してください。
- 200文字以内で簡潔に返してください。
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to debate" }, { status: 500 });
    }
}
