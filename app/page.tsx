import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 gap-8 bg-slate-900">
      <div className="w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden border border-slate-700">
        <Image
          src="/images/challenge-banner.jpg"
          alt="1 Month 100 Apps Challenge"
          width={1200}
          height={630}
          className="w-full h-auto"
          priority
        />
      </div>

      <div className="text-center space-y-4">
        <h1 className="sr-only">Webアプリ100本ノック - しみずやすたかの1ヶ月で100個のアプリ作成挑戦記</h1>
      </div>

      <Link
        href="/apps"
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        アプリ一覧を見る
      </Link>
    </div>
  );
}
