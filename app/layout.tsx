import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "経費帳簿 | 白色申告",
  description: "白色申告用経費管理システム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen antialiased">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-blue-700 text-lg">📒 経費帳簿</a>
            <div className="flex items-center gap-4 text-sm">
              <a href="/" className="text-gray-600 hover:text-blue-600">ホーム</a>
              <a href="/register" className="text-gray-600 hover:text-blue-600">登録</a>
              <a href="/list" className="text-gray-600 hover:text-blue-600">一覧</a>
            </div>
          </div>
        </nav>
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
