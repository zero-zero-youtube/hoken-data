import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 bg-[#f8fafc]">
      <div className="max-w-lg w-full text-center">
        {/* 404 */}
        <div className="text-8xl font-bold text-[#2563eb] mb-4 leading-none">404</div>
        <h1 className="text-2xl font-bold text-[#0f172a] mb-3">
          ページが見つかりません
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-10">
          お探しのページは移動・削除されたか、URLが正しくない可能性があります。<br />
          以下の人気ページからお探しの情報をご確認ください。
        </p>

        {/* 人気ページへのリンク */}
        <div className="space-y-3 mb-10">
          <Link
            href="/"
            className="flex items-center justify-between bg-white rounded-xl px-5 py-4 border border-gray-200 hover:border-[#2563eb] hover:shadow-md transition-all group"
            aria-label="トップページへ戻る"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div className="text-left">
                <p className="font-bold text-[#0f172a] text-sm">トップページ</p>
                <p className="text-xs text-gray-400">保険料相場データベースTOP</p>
              </div>
            </div>
            <span className="text-[#2563eb] group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/simulator"
            className="flex items-center justify-between bg-white rounded-xl px-5 py-4 border border-gray-200 hover:border-[#2563eb] hover:shadow-md transition-all group"
            aria-label="保険料無料診断ツールへ"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💊</span>
              <div className="text-left">
                <p className="font-bold text-[#0f172a] text-sm">保険料 無料診断</p>
                <p className="text-xs text-gray-400">職業・年齢から推奨保険をチェック</p>
              </div>
            </div>
            <span className="text-[#2563eb] group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/occupation"
            className="flex items-center justify-between bg-white rounded-xl px-5 py-4 border border-gray-200 hover:border-[#2563eb] hover:shadow-md transition-all group"
            aria-label="職業一覧から保険料を調べる"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <p className="font-bold text-[#0f172a] text-sm">職業一覧から調べる</p>
                <p className="text-xs text-gray-400">20職業の保険料相場を確認</p>
              </div>
            </div>
            <span className="text-[#2563eb] group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/insurance"
            className="flex items-center justify-between bg-white rounded-xl px-5 py-4 border border-gray-200 hover:border-[#2563eb] hover:shadow-md transition-all group"
            aria-label="保険種類一覧を見る"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div className="text-left">
                <p className="font-bold text-[#0f172a] text-sm">保険種類から調べる</p>
                <p className="text-xs text-gray-400">10種類の保険の仕組みと相場</p>
              </div>
            </div>
            <span className="text-[#2563eb] group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <Link
          href="/"
          className="inline-block bg-[#2563eb] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          トップページへ戻る →
        </Link>
      </div>
    </div>
  )
}
