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
