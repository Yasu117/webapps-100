import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { situation, recipient, keyPoints, tone } = body;

        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini Client not configured" }, { status: 500 });
        }

        const model = client.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
You are an expert business communication assistant specializing in Japanese business etiquette.
Draft a professional email based on the user's request.

INPUT PARAMETERS:
- **Situation**: ${situation}
- **Recipient Type**: ${recipient}
- **Key Points to Include**:
"""
${keyPoints}
"""
- **Desired Tone**: ${tone}

INSTRUCTIONS:
1. Create a **Subject Line** that is clear, concise, and immediately conveys the email's purpose.
2. Write the **Body** following standard Japanese business email structure:
   - Proper opening (e.g., "Always indebted to you...").
   - Clear context setting.
   - Main points organized logically.
   - Polite closing.
3. Adjust the politeness level (Keigo) strictly according to the "Desired Tone".

OUTPUT FORMAT (JSON ONLY):
{
  "subject": "Email Subject",
  "body": "Full email body text..."
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid response format from AI");
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            subject: data.subject || "(件名なし)",
            body: data.body || "本文の生成に失敗しました。"
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
