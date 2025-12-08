import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { meal, profile } = body;
        const text = meal.text || '';
        const imageBase64 = meal.image || null; // Expected full data URI or base64

        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini Client not configured" }, { status: 500 });
        }
        const model = client.getGenerativeModel({ model: "gemini-flash-latest" });

        const inputs = [];

        let promptText = `
You are an expert on glucose control and healthy lifestyle habits.
Analyze the user's meal record and suggest actions to mitigate glucose spikes.

User Profile:
${JSON.stringify(profile, null, 2)}

Meal Description: ${text}

Task:
1. Analyze the provided meal data.
   - If an image is provided, PRIORITIZE visual analysis. Identify food items, portion sizes, and hidden sugars or carbs based on visual appearance.
   - If text is provided, use it to supplement the analysis.
   - Estimate the total carbohydrate load and the speed of digestion (GI/GL) to assess glucose spike risk.
2. Determine the Meal Category: 'carb_heavy' (high carb, low fiber), 'balanced' (good protein/fat/fiber balance), or 'low_carb' (minimal carbs).
3. Determine Risk Level: 'low', 'medium', or 'high'.
4. Provide a friendly, actionable advice text (in Japanese).
   - CRITICAL: Include a specific "Recommended Exercise" and "Duration" (e.g., "Squats for 3 mins", "Brisk walking for 15 mins") to perform *after* this meal.
   - Explain *why* this exercise helps (e.g. "Because this meal has high sugar, immediate muscle activation is needed").
   - Keep the tone encouraging but professional.

Output Format: Strictly valid JSON.
{
  "category": "carb_heavy" | "balanced" | "low_carb",
  "riskLevel": "low" | "medium" | "high",
  "adviceText": "String containing advice and specific exercise recommendation."
}
`;
        inputs.push(promptText);

        if (imageBase64) {
            // imageBase64 expected to be "data:image/jpeg;base64,..."
            // Gemini expects just base64 data and mimeType.
            const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                const mimeType = matches[1];
                const data = matches[2];
                inputs.push({
                    inlineData: {
                        data: data,
                        mimeType: mimeType
                    }
                });
            }
        }

        if (!text && !imageBase64) {
            return NextResponse.json({ error: "No input provided" }, { status: 400 });
        }

        const result = await model.generateContent(inputs);
        const responseText = result.response.text();

        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid response format");
        }

        const jsonString = jsonMatch[0];
        const data = JSON.parse(jsonString);

        return NextResponse.json({
            category: data.category || 'balanced',
            riskLevel: data.riskLevel || 'medium',
            adviceText: data.adviceText || '解析できませんでした。'
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
