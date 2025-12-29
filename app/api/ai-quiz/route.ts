
import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const { topic, difficulty } = await req.json();

        const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
        // JSON response schema enforcement is cleaner with prompt engineering for now, or using response_mime_type if available. 
        // For safety, I'll ask for JSON string specifically.
        const prompt = `
あなたはクイズ作成AIです。
以下のテーマと難易度に基づいて、4択クイズを5問作成してください。

- テーマ: ${topic}
- 難易度: ${difficulty}

# 出力フォーマット (JSONのみ出力すること)
[
  {
    "question": "問題文",
    "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    "answer": "正解の選択肢（文字列）",
    "explanation": "解説"
  },
  ...
]

余計な冒頭の挨拶やMarkdown記法（\`\`\`jsonなど）は含めず、純粋なJSON配列のみを返してください。
    `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Clean up markdown block if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return NextResponse.json({ result: text }); // Frontend will parse JSON
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}
