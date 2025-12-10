// app/apps/page.tsx
import Link from "next/link";

const apps = [
    {
        id: "001",
        slug: "001-todo",
        title: "シンプルToDo",
        description: "今日やることをサクッと管理する超シンプルToDoリスト。",
        tags: ["生活", "効率化"],
    },
    {
        id: "002",
        slug: "002-pomodoro",
        title: "ポモドーロタイマー",
        description: "作業時間と休憩時間を設定して使えるシンプルなポモドーロタイマー。",
        tags: ["タイマー", "生産性"],
    },
    {
        id: "003",
        slug: "003-tetris",
        title: "テトリス（ミニ）",
        description: "矢印キーで操作できるシンプルなテトリス風ゲーム。",
        tags: ["ゲーム", "Canvas"],
    },
    {
        id: "004",
        slug: "004-breakout",
        title: "ブロック崩し（ミニ）",
        description: "ボールを跳ね返してブロックを消すクラシックなブロック崩し。",
        tags: ["ゲーム", "Canvas"],
    },
    {
        id: "005",
        slug: "005-requirements-generator",
        title: "要件定義ジェネレーター",
        description: "1行のビジネスアイデアから、FE/BE/DB/非機能要件まで自動分解するAIアプリ。",
        tags: ["AI", "要件定義"],
    },
    {
        id: "006",
        slug: "006-contract-risk-ai",
        title: "契約書リスク抽出AI",
        description: "契約書のテキスト入力またはPDF/Wordアップロードから、主なリスクと修正提案を洗い出すリーガルチェック補助AI。",
        tags: ["AI", "契約書", "リーガル"],
    },
    {
        id: "007",
        slug: "007-ai-ocr",
        title: "AI-OCR 受発注入力",
        description: "注文書（画像/PDF）をアップロードしてAIが自動入力。確認・修正してDB保存する業務効率化ツール。",
        tags: ["AI", "OCR", "業務効率化"],
    },
    {
        id: "008",
        slug: "008-markdown-memo/index.html",
        title: "Markdownメモ",
        description: "リアルタイムプレビューと自動保存機能を備えたシンプルなMarkdownエディタ。",
        tags: ["ツール", "Markdown"],
    },
    {
        id: "009",
        slug: "009-mood-tracker/index.html",
        title: "Mood Tracker",
        description: "その日の気分を5段階で記録して見える化する、メンタル管理アプリ。",
        tags: ["健康", "ライフスタイル"],
    },
    {
        id: "010",
        slug: "010-glucose-habit",
        title: "血糖値習慣サポート",
        description: "食事記録からAIが血糖値スパイクの傾向を解析し、最適な運動アドバイスを提案する生活習慣改善アプリ。",
        tags: ["健康", "AI", "生活習慣"],
    },
    {
        id: "011",
        slug: "011-mario-game",
        title: "マリオ風ゲーム（モック）",
        description: "Phaserを使ったマリオライクなアクションゲームのプロトタイプ。ブロック、敵、ジャンプ、パワーアップ機能を実装。",
        tags: ["ゲーム", "Phaser", "アクション"],
    },
    // ここに今後どんどん追加していく
];

export default function AppsPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <header>
                    <h1 className="text-2xl font-bold mb-1">Webアプリ100本ノック</h1>
                    <p className="text-sm text-slate-300">
                        作ったミニアプリをここに並べていく。まずは #001 から。
                    </p>
                </header>

                <section className="grid gap-4">
                    {apps.map((app) => (
                        <Link
                            key={app.id}
                            href={`/apps/${app.slug}`}
                            className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-400 hover:bg-slate-900 transition"
                        >
                            <div className="text-xs text-slate-400 mb-1">#{app.id}</div>
                            <h2 className="font-semibold mb-1">{app.title}</h2>
                            <p className="text-xs text-slate-300 mb-2">
                                {app.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {app.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </section>
            </div>
        </main>
    );
}
