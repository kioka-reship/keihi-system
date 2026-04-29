import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="space-y-4">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h1 className="text-xl font-bold text-gray-800">ページが見つかりません</h1>
        <p className="text-sm text-gray-500">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl px-6 py-3 transition-colors"
        >
          トップページへ戻る
        </Link>
      </div>
    </div>
  );
}
