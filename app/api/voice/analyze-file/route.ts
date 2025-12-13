import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const client = getGeminiClient();
        if (!client) {
            return NextResponse.json({ error: "Gemini Client not configured" }, { status: 500 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');
        const mimeType = file.type;

        // Use flash model for multimodal capabilities
        const model = client.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
You are an intelligent executive assistant.
Processing an audio file attached.

TASKS:
1. **Transcribe**: Transcribe the audio verbatim (in Japanese).
2. **Summary**: Provide a clear, concise summary of the content (in Japanese).
3. **Action Items (Todos)**: Extract actionable tasks.
4. **Mindmap Outline**: Organize the content structure.

OUTPUT FORMAT (JSON ONLY):
{
  "transcript": "Full transcription string...",
  "summary": "String (Japanese)",
  "todos": ["String", "String"],
  "mindmap": ["- Main Topic", "  - Subtopic"]
}
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            }
        ]);

        const responseText = result.response.text();

        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid response format from AI");
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            transcript: data.transcript || "",
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
