import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { targetPersona, companyName, salary, jobType } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
あなたはプロの採用コンサルタント兼コピーライターです。
以下の条件に基づいて、求職者が「応募したい！」と思うような魅力的な求人票（募集要項）を作成してください。

【会社名】
${companyName}

【職種】
${jobType}

【給与イメージ】
${salary}

【求める人物像・条件（メモ）】
${targetPersona}

---
# 出力フォーマット
（markdown形式で出力してください）

## 【キャッチコピー】
（30文字以内で、ターゲットの心に刺さるインパクトのあるコピー）

## 【募集背景・仕事の魅力】
（なぜ今募集するのか、この仕事のやりがいや面白さを、「あなた」への呼びかけ形式で200文字程度で情熱的に）

## 【具体的な業務内容】
- （3〜5個の箇条書き）

## 【応募資格】
### 必須スキル
- （3〜5個の箇条書き）

### 歓迎スキル
- （3〜5個の箇条書き）

## 【こんな方におすすめ】
- （性格や志向性など3つ）

---
※トーン＆マナー：親しみやすく、かつプロフェッショナルな雰囲気で。
※「求める人物像」の情報が不足している場合は、一般的な同職種の魅力的な条件を補完して書いてください。
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return Response.json({ text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return Response.json(
            { error: "Failed to generate job description" },
            { status: 500 }
        );
    }
}
