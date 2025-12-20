import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text || text.length < 5) {
            return Response.json({ error: "Text too short" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
あなたはプロのカスタマーサクセス・アナリストです。
以下の顧客からのフィードバック（口コミ・アンケート）を分析し、JSON形式で結果を返してください。

【分析対象テキスト】
${text}

【出力スキーマ】
{
  "score": number, // 0(超ネガティブ)〜100(超ポジティブ)の感情スコア。50が中立。
  "sentiment": string, // "Positive", "Neutral", "Negative" のいずれか
  "summary": string, // 全体の要約（100文字以内で簡潔に）
  "keywords": string[], // 頻出する重要な単語やキーワード（5〜8個）
  "improvements": string[] // ネガティブな意見に基づいた具体的な改善提案（2〜3個。なければ空配列）
}
`;

        let result;
        let retries = 3;
        while (retries > 0) {
            try {
                result = await model.generateContent(prompt);
                break;
            } catch (error: any) {
                if (error.status === 429 && retries > 1) {
                    console.log("Rate limited, retrying in 2 seconds...");
                    await new Promise(r => setTimeout(r, 2000));
                    retries--;
                    continue;
                }
                throw error;
            }
        }

        if (!result) throw new Error("Failed to generate content after retries");

        const response = await result.response;
        const jsonText = response.text();

        // JSONパース
        const data = JSON.parse(jsonText);

        return Response.json(data);
    } catch (error: any) {
        console.error("Gemini API Error:", error);

        const status = error.status === 429 ? 429 : 500;
        const message = error.status === 429
            ? "Too many requests. Please try again later."
            : "Failed to analyze text";

        return Response.json(
            { error: message },
            { status: status }
        );
    }
}
