import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Webアプリ100本ノック</h1>
        <p className="text-xl text-gray-600">
          しみずやすたかの1ヶ月で100個のアプリ作成挑戦記。
        </p>
      </div>

      <Link
        href="/apps"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        アプリ一覧を見る
      </Link>
    </div>
  );
}
