import { NextRequest, NextResponse } from "next/server";
import { getRequirementsModel } from "@/lib/gemini";

const buildRequirementsPrompt = (idea: string) => {
    return `
あなたはソフトウェア開発の要件定義に精通したシステムアーキテクトです。

# 目的
ユーザーが入力する「1行のビジネスアイデア（最大500文字）」から、
Webアプリ or システム開発を想定した要件定義を日本語で整理してください。

# 出力フォーマット
以下の見出しごとに箇条書きで出力してください。

■ 1. フロントエンド要件
- ユーザーが画面上でできること
- 主要な画面（ページ）と概要
- UI上で重要になるポイント

■ 2. バックエンド要件
- 必要なAPIやバッチ処理の一覧
- ビジネスロジックのポイント
- 外部サービス連携があれば明記

■ 3. DB設計（テーブル例）
- 想定されるテーブル名
- 主なカラム（日本語名＋英語カラム名＋型のイメージ）
- 主キーやリレーションの簡単な説明

■ 4. 非機能要件
- パフォーマンス要件（ざっくりでOK）
- セキュリティや認証の方針
- スケーラビリティ・運用面で気をつけること

■ 5. 前提・補足
- 想定したユーザー層
- 想定した利用シーン
- 仮で置いた前提条件があれば明記

# 制約
- 出力はすべて日本語
- 各項目は3〜7個程度の箇条書き
- 実装技術は必要に応じて仮定してよい
  （Next.js/TypeScript、API Routes、PostgreSQLなど）
- Markdownの記号（*、#、- など）は使用せず、プレーンテキストで見やすく整形すること。
- 見出しの先頭には「■」を使用すること。
- 箇条書きの先頭には「・」を使用すること。

# ビジネスアイデア
「${idea}」
`;
};

export async function POST(req: NextRequest) {
    try {
        const model = getRequirementsModel();

        if (!model) {
            return NextResponse.json(
                { error: "Gemini API key is not configured." },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { idea } = body;

        if (!idea || typeof idea !== "string" || idea.length === 0 || idea.length > 500) {
            return NextResponse.json(
                { error: "Invalid idea. Must be a string between 1 and 500 characters." },
                { status: 400 }
            );
        }

        const prompt = buildRequirementsPrompt(idea);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error("Error generating requirements:", error);
        return NextResponse.json(
            {
                error: `Failed to generate requirements: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: error
            },
            { status: 500 }
        );
    }
}
