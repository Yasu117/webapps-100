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
        title: "血糖値スパイク予防習慣サポート",
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
    {
        id: "012",
        slug: "012-voice-memo",
        title: "AI Voice Memo & Summarizer",
        description: "音声入力した内容をテキスト化し、さらにAIが「要約」「ToDo抽出」「マインドマップ化」までしてくれる高度なメモアプリ。",
        tags: ["AI", "業務効率化", "音声認識"],
    },
    {
        id: "013",
        slug: "013-email-drafter",
        title: "Smart Email Drafter",
        description: "シチュエーションと相手を選ぶだけで、失礼のないビジネスメールをAIが代筆してくれるアプリ。",
        tags: ["AI", "ビジネス", "メール"],
    },
    {
        id: "014",
        slug: "014-color-palette",
        title: "AI Color Palette Generator",
        description: "抽象的なキーワードから統一感のある配色パレットを生成し、UIでの使用イメージもプレビューできるデザイナー向けツール。",
        tags: ["AI", "デザイン", "配色"],
    },
    {
        id: "015",
        slug: "015-neon-snake",
        title: "Neon Snake 2025",
        description: "ネオン輝くサイバーパンクな世界観で楽しむ、進化したスネークゲーム。爽快なエフェクトとレスポンシブな操作性。",
        tags: ["ゲーム", "アクション", "Canvas"],
    },
    {
        id: "016",
        slug: "016-typing-racer",
        title: "Typing Speed Racer",
        description: "入力速度に合わせて背景が加速する爽快タイピングゲーム。プログラミング用語を中心にWPMを計測。",
        tags: ["ゲーム", "タイピング", "PC推奨"],
    },
    {
        id: "017",
        slug: "017-2048-ultimate",
        title: "2048 Ultimate",
        description: "中毒性のあるパズルゲーム「2048」の究極版。スマホ操作に最適化されたUIと、心地よいネオン調のビジュアル。",
        tags: ["ゲーム", "パズル", "脳トレ"],
    },
    // ここに今後どんどん追加していく
    {
        id: "018",
        slug: "018-world-clock",
        title: "Interactive World Clock",
        description: "美しいグラデーションで世界の時間を体感。都市を追加して時差を一目で確認できます。",
        tags: ["ツール", "時計", "デザイン"],
    },
    {
        id: "019",
        slug: "019-zen-breath",
        title: "Zen Breath",
        description: "リラクゼーションのための深呼吸ガイド。4-7-8呼吸法などで心を整えられます。",
        tags: ["ヘルスケア", "リラックス", "瞑想"],
    },
    {
        id: "020",
        slug: "020-pixel-art",
        title: "Pixel Art Editor",
        description: "スマホで手軽にドット絵作成。16x16のキャンバスでレトロなアイコンを作って保存できます。",
        tags: ["ツール", "アート", "クリエイティブ"],
    },
    {
        id: "021",
        slug: "021-qr-generator",
        title: "QR Code Generator",
        description: "URLやテキストを瞬時にQRコードに変換。色をカスタマイズして、画像として保存できます。",
        tags: ["ツール", "便利", "ジェネレータ"],
    },
    {
        id: "022",
        slug: "022-reaction-test",
        title: "Reaction Time Test",
        description: "画面が緑になったらタップするだけ。あなたの反射神経をミリ秒単位で計測します。",
        tags: ["ゲーム", "測定", "反射神経"],
    },
    {
        id: "023",
        slug: "023-pdf-tools",
        title: "PDFツール",
        description: "PDFの結合・ページ抽出・削除がブラウザ上で完結。サーバーにアップロードしないので安心です。",
        tags: ["ツール", "PDF", "業務効率化"],
    },
    {
        id: "024",
        slug: "024-minesweeper",
        title: "マインスイーパ",
        description: "サイバーなデザインで蘇る定番パズル。スマホでも快適に遊べる操作性を追求しました。",
        tags: ["ゲーム", "パズル", "脳トレ"],
    },
    {
        id: "025",
        slug: "025-decision-roulette",
        title: "ルーレット",
        description: "ランチや罰ゲームなど、迷った時に楽しく決められる決定戦ルーレット。",
        tags: ["ツール", "ライフハック", "運試し"],
    },
    {
        id: "026",
        slug: "026-job-description",
        title: "求人票メーカー",
        description: "求める人物像を入力するだけで、AIが応募したくなる魅力的な募集要項を作成します。",
        tags: ["業務効率化", "AI", "人事"],
    },
    {
        id: "027",
        slug: "027-memory-match",
        title: "神経衰弱",
        description: "記憶力とスピードが勝負。連続正解でスコアが伸びる、爽快カードめくりゲーム。",
        tags: ["ゲーム", "記憶力", "脳トレ"],
    },
    {
        id: "028",
        slug: "028-smart-warikan",
        title: "割り勘電卓",
        description: "「上司多め」「遅刻した人安め」など傾斜をつけて計算し、LINE用のテキストも生成。",
        tags: ["ツール", "ライフハック", "便利"],
    },
    {
        id: "029",
        slug: "029-review-analyzer",
        title: "口コミ分析",
        description: "アンケートやレビュー文をAIが解析。ポジティブ/ネガティブ判定と重要ワードを可視化。",
        tags: ["業務効率化", "AI", "分析"],
    },
    {
        id: "030",
        slug: "030-idle-startup",
        title: "会社経営ゲーム",
        description: "クリックで稼ぎ、社員を雇って自動化。Web制作会社を大きくしていく放置系シミュレーション。",
        tags: ["ゲーム", "シミュレーション", "放置系"],
    },
    {
        id: "031",
        slug: "031-day-scheduler",
        title: "AI Day Scheduler",
        description: "やりたいことと予定を入力するだけ。AIが優先順位を考慮して最適な1日のスケジュールを組み立てます。",
        tags: ["AI", "スケジュール", "タスク管理"],
    },
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
