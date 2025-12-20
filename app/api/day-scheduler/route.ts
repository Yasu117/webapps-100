import { NextRequest, NextResponse } from "next/server";
import { getSchedulerModel } from "@/lib/gemini";

const buildSchedulerPrompt = (tasks: string, constraints: string) => {
    return `
あなたはプロフェッショナルなAIタスクスケジューラーです。
ユーザーの「やりたいこと（タスク）」と「既存の予定（スケジュール）」をもとに、
最適な1日のスケジュールを作成してください。

# 重要な指示：抽象的な入力への対応
ユーザーは「今日はゆっくりしたい」「気合を入れて勉強したい」「部屋をきれいにしたい」といった、
具体的でない抽象的な要望（バイブスや気分）を伝えることがあります。
その場合は、その意図を汲み取り、具体的なタスクに分解・翻訳してスケジュールに落とし込んでください。
例：「今日はリラックスしたい」→ 散歩、読書、映画鑑賞、入浴などを提案しスケジュールに組み込む。

# 前提
- 既存の予定には新しいタスクを入れないでください。
- 移動時間や休憩時間も適切に考慮してください。
- 優先順位が高いと思われるものからスケジューリングしてください。
- 不可能な場合はその旨を伝えてください。
- 開始時刻の指定がない場合は、朝9:00開始、夜22:00終了を目安にしてください。

# 入力情報
## やりたいこと（タスク）
${tasks}

## 既存の予定・制約
${constraints ? constraints : "特になし"}

# 出力フォーマット
Markdown形式で出力してください。
以下のセクションを含めてください。

## 1. 今日の概略
全体の流れやポイントを簡単に。

## 2. スケジュール詳細
| 時間 | 内容 | メモ |
| --- | --- | --- |
| HH:MM - HH:MM | タスク名 | 備考 |
...

## 3. アドバイス
効率的に過ごすためのコツなど。
`;
};

export async function POST(req: NextRequest) {
    try {
        const model = getSchedulerModel();

        if (!model) {
            return NextResponse.json(
                { error: "Gemini API key is not configured." },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { tasks, constraints } = body;

        if (!tasks || typeof tasks !== "string") {
            return NextResponse.json(
                { error: "Tasks are required." },
                { status: 400 }
            );
        }

        const prompt = buildSchedulerPrompt(tasks, constraints);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error("Error generating schedule:", error);
        return NextResponse.json(
            {
                error: `Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
            },
            { status: 500 }
        );
    }
}
