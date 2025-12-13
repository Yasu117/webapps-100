import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini Client not configured" }, { status: 500 });
        }

        // Use the same model as other apps for consistency
        const model = client.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
You are an intelligent executive assistant.
Analyze the following voice memo transcript and structure the information.

TRANSCRIPT:
"""
${text}
"""

TASKS:
1. **Summary**: Provide a clear, concise summary of what was said (in Japanese).
2. **Action Items (Todos)**: Extract actionable tasks. If implied, make them explicit.
3. **Mindmap Outline**: Organize the content into a hierarchical structure using text. Use "- " for the root and indentations (2 spaces) for children.

OUTPUT FORMAT (JSON ONLY):
{
  "summary": "String (Japanese)",
  "todos": ["String", "String"],
  "mindmap": ["- Main Topic", "  - Subtopic", "    - Detail"]
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Gemini response is not JSON:", responseText);
            throw new Error("Invalid response format from AI");
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            summary: data.summary || "要約できませんでした",
            todos: data.todos || [],
            mindmap: data.mindmap || []
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
