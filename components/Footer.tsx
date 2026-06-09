import Link from 'next/link'

const OCCUPATION_LINKS = [
  { href: '/occupation/engineer',           label: 'システムエンジニア' },
  { href: '/occupation/nurse',              label: '看護師' },
  { href: '/occupation/freelance-engineer', label: 'フリーランスエンジニア' },
  { href: '/occupation/civil-servant',      label: '地方公務員' },
  { href: '/occupation/construction',       label: '建設業・現場作業員' },
  { href: '/occupation/driver',             label: 'ドライバー' },
  { href: '/occupation/doctor',             label: '医師' },
  { href: '/occupation/sales',              label: '営業職' },
]

const INSURANCE_LINKS = [
  { href: '/insurance/medical',           label: '医療保険' },
  { href: '/insurance/life',              label: '生命保険' },
  { href: '/insurance/income-protection', label: '就業不能保険' },
  { href: '/insurance/cancer',            label: 'がん保険' },
  { href: '/insurance/pension',           label: '個人年金' },
  { href: '/insurance/whole-life',        label: '終身保険' },
]

const GUIDE_LINKS = [
  { href: '/guide',                          label: '保険の選び方ガイド' },
  { href: '/guide/medical-insurance',        label: '医療保険の選び方' },
  { href: '/guide/insurance-by-occupation',  label: '職業別の保険選び' },
  { href: '/guide/income-protection',        label: '収入保障保険の選び方' },
]

const AGE_LINKS = [
  { href: '/age/20dai/medical', label: '20代の保険相場' },
  { href: '/age/30dai/life',    label: '30代の保険相場' },
  { href: '/age/40dai/cancer',  label: '40代の保険相場' },
  { href: '/age/50dai/pension', label: '50代の保険相場' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* サイト説明 */}
        <div className="mb-10">
          <div className="text-xl font-bold text-white mb-3">
            <span className="text-[#f59e0b]">保険</span>データドットコム
          </div>
          <p className="text-sm leading-relaxed max-w-xl">
            公的統計データに基づき、生命保険・医療保険・火災保険などの
            保険料相場を職業別・年齢別に無料で調べられるサービスです。
          </p>
        </div>

        {/* 4カラムリンク */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* 職業から調べる */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">職業から調べる</p>
            <ul className="space-y-2">
              {OCCUPATION_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/occupation" className="text-xs text-[#f59e0b] hover:text-yellow-300 transition-colors font-semibold">
                  全職業を見る →
                </Link>
              </li>
            </ul>
          </div>

          {/* 保険種類から調べる */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">保険種類から調べる</p>
            <ul className="space-y-2">
              {INSURANCE_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/insurance" className="text-xs text-[#f59e0b] hover:text-yellow-300 transition-colors font-semibold">
                  全保険種類を見る →
                </Link>
              </li>
            </ul>
          </div>

          {/* ガイド */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">ガイド</p>
            <ul className="space-y-2">
              {GUIDE_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 年齢別データ・その他 */}
          <div>
            <p className="text-white text-sm font-semibold mb-3">年齢別データ</p>
            <ul className="space-y-2">
              {AGE_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-white text-sm font-semibold mb-3 mt-6">サービス</p>
            <ul className="space-y-2">
              <li><Link href="/simulator" className="text-xs hover:text-white transition-colors">保険料診断</Link></li>
              <li><Link href="/consult" className="text-xs hover:text-white transition-colors">無料保険相談</Link></li>
              <li><Link href="/about" className="text-xs hover:text-white transition-colors">サイトについて</Link></li>
              <li><Link href="/privacy" className="text-xs hover:text-white transition-colors">プライバシーポリシー</Link></li>
            </ul>
          </div>
        </div>

        {/* 免責事項 */}
        <div className="pt-6 border-t border-white/10">
          <p className="text-xs leading-relaxed text-gray-500">
            【免責事項】掲載情報は公的データ（厚生労働省・金融庁等）に基づく参考値であり、実際の保険料は保険会社・個人の状況により異なります。保険の加入・変更は必ず各保険会社または保険代理店にご確認ください。本サイトは情報提供を目的としており、特定の保険商品を推薦するものではありません。なお本サイトはアフィリエイト広告（PR）を含みます。
          </p>
          <p className="text-xs text-gray-600 mt-3 text-center">
            &copy; {new Date().getFullYear()} 保険データドットコム All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
