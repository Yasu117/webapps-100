import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
        }

        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini Client not configured" }, { status: 500 });
        }

        const model = client.getGenerativeModel({ model: "gemini-flash-latest" });

        const aiPrompt = `
You are a professional color theorist and UI designer.
Generate a cohesive color palette based on the following theme/prompt.

PROMPT: "${prompt}"

REQUIREMENTS:
1. Generate 5 distinct colors that work well together.
2. Assign each color a role: "primary", "secondary", "background", "surface", "text" (though you can be creative with the specific colors).
3. Provide a hex code for each.

OUTPUT FORMAT (JSON ONLY):
{
  "themeName": "Creative Name for this Palette",
  "description": "Short explanation of the mood/vibe (Japanese)",
  "colors": [
    { "hex": "#RRGGBB", "name": "Color Name", "role": "Primary/Accent/etc" },
    { "hex": "#RRGGBB", "name": "Color Name", "role": "..." },
    { "hex": "#RRGGBB", "name": "Color Name", "role": "..." },
    { "hex": "#RRGGBB", "name": "Color Name", "role": "..." },
    { "hex": "#RRGGBB", "name": "Color Name", "role": "..." }
  ]
}
`;

        const result = await model.generateContent(aiPrompt);
        const responseText = result.response.text();

        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid response format from AI");
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
