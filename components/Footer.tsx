import Link from 'next/link'
import { FOOTER_LINKS } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-400 mt-auto">
      {/* PR表記 */}
      <div className="bg-[#f59e0b] text-[#0f172a] text-center text-xs font-bold py-2">
        本ページはアフィリエイト広告を含みます（PR）
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サイト説明 */}
          <div className="md:col-span-2">
            <div className="text-xl font-bold text-white mb-3">
              <span className="text-[#f59e0b]">保険</span>データドットコム
            </div>
            <p className="text-sm leading-relaxed">
              公的統計データに基づき、生命保険・医療保険・火災保険などの
              保険料相場を職業別・年齢別に無料で調べられるサービスです。
              保険選びの参考情報として、客観的なデータをご提供します。
            </p>
          </div>

          {/* リンク */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">サイトマップ</p>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 免責事項 */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs leading-relaxed text-gray-500">
            【免責事項】本サイトはアフィリエイト広告を含みます。掲載情報は公的データ（厚生労働省・金融庁等）に基づく参考値であり、実際の保険料は保険会社・個人の状況により異なります。保険の加入・変更は必ず各保険会社または保険代理店にご確認ください。本サイトは情報提供を目的としており、特定の保険商品を推薦するものではありません。
          </p>
          <p className="text-xs text-gray-600 mt-3 text-center">
            &copy; {new Date().getFullYear()} 保険データドットコム All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
