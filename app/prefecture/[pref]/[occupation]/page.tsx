import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllOccupations, getOccupationBySlug } from '@/lib/data'

type PrefInfo = {
  name: string
  nameFull: string
  region: string
  incomeMultiplier: number
  characteristic: string
}

const PREFECTURES: Record<string, PrefInfo> = {
  tokyo:    { name: '東京', nameFull: '東京都', region: '関東', incomeMultiplier: 1.15, characteristic: '全国最高水準の平均賃金を誇る首都圏。医療費・生活費ともに高く、充実した保険設計が求められます。' },
  osaka:    { name: '大阪', nameFull: '大阪府', region: '近畿', incomeMultiplier: 1.02, characteristic: '関西最大の経済都市。都市型リスクに対応した医療保険と収入保障の備えが重要です。' },
  aichi:    { name: '愛知', nameFull: '愛知県', region: '中部', incomeMultiplier: 1.05, characteristic: '製造業・自動車産業が集積する工業県。労災・怪我リスクへの上乗せ保険が特に重要です。' },
  kanagawa: { name: '神奈川', nameFull: '神奈川県', region: '関東', incomeMultiplier: 1.08, characteristic: '東京近郊の高所得エリア。長時間通勤によるリスクと都市型医療費をカバーしましょう。' },
  saitama:  { name: '埼玉', nameFull: '埼玉県', region: '関東', incomeMultiplier: 1.03, characteristic: '首都圏のファミリー層が多いベッドタウン。子育て世代向けの学資・生命保険設計が効果的です。' },
  chiba:    { name: '千葉', nameFull: '千葉県', region: '関東', incomeMultiplier: 1.02, characteristic: '成田空港・湾岸エリアを抱える多様な産業の地域。物流・サービス業従事者が多い特性があります。' },
  fukuoka:  { name: '福岡', nameFull: '福岡県', region: '九州', incomeMultiplier: 0.93, characteristic: '九州最大の都市圏。全国平均より賃金は低めですが生活コストも抑えられ、コスパの良い保険選びが可能です。' },
  hokkaido: { name: '北海道', nameFull: '北海道', region: '北海道', incomeMultiplier: 0.88, characteristic: '広大な土地と特有の産業構造。冬季の事故リスクと医療機関へのアクセス距離を考慮した保険設計が重要です。' },
  kyoto:    { name: '京都', nameFull: '京都府', region: '近畿', incomeMultiplier: 0.96, characteristic: '観光・文化産業が中心の都市。伝統産業から最新IT企業まで多様な職業リスクに対応が必要です。' },
  hyogo:    { name: '兵庫', nameFull: '兵庫県', region: '近畿', incomeMultiplier: 0.98, characteristic: '神戸を中心に多様な産業が集積。阪神間の高所得エリアと地方部で賃金格差があります。' },
}

type InsuranceRow = {
  slug: string
  name: string
  rate: number | null
  fixed?: [number, number]
}

const INSURANCE_ROWS: InsuranceRow[] = [
  { slug: 'medical',           name: '医療保険',       rate: 0.005 },
  { slug: 'life',              name: '生命保険',       rate: 0.01 },
  { slug: 'income-protection', name: '就業不能保険',   rate: 0.008 },
  { slug: 'cancer',            name: 'がん保険',       rate: 0.004 },
  { slug: 'personal-accident', name: '傷害保険',       rate: 0.003 },
  { slug: 'pension',           name: '個人年金',       rate: 0.02 },
  { slug: 'whole-life',        name: '終身保険',       rate: 0.015 },
  { slug: 'child',             name: '学資保険',       rate: 0.015 },
  { slug: 'fire',              name: '火災保険',       rate: null, fixed: [1000, 3000] },
  { slug: 'auto',              name: '自動車保険',     rate: null, fixed: [3000, 8000] },
]

export async function generateStaticParams() {
  const occupations = await getAllOccupations()
  const prefs = Object.keys(PREFECTURES)
  return prefs.flatMap(pref => occupations.map(occ => ({ pref, occupation: occ.slug })))
}

export async function generateMetadata(
  { params }: { params: Promise<{ pref: string; occupation: string }> }
): Promise<Metadata> {
  const { pref: prefSlug, occupation: occSlug } = await params
  const pref = PREFECTURES[prefSlug]
  const occ = await getOccupationBySlug(occSlug)
  if (!pref || !occ) return {}
  return {
    title: `${pref.nameFull}の${occ.name_ja}向け保険料相場【2024年版】`,
    description: `${pref.nameFull}で働く${occ.name_ja}の平均年収と保険料目安を解説。医療保険・就業不能保険など10種類の月額相場を政府統計データをもとに紹介します。`,
  }
}

export default async function PrefectureOccupationPage(
  { params }: { params: Promise<{ pref: string; occupation: string }> }
) {
  const { pref: prefSlug, occupation: occSlug } = await params
  const pref = PREFECTURES[prefSlug]
  const occ = await getOccupationBySlug(occSlug)

  if (!pref || !occ) notFound()

  const baseMan   = occ.avg_income_man   || 400
  const baseWoman = occ.avg_income_woman || 350
  const adjMan    = Math.round(baseMan   * pref.incomeMultiplier)
  const adjWoman  = Math.round(baseWoman * pref.incomeMultiplier)
  const repPremium = Math.round(adjMan * 10000 * 0.005 / 12)

  const faqItems = [
    {
      q: `${pref.nameFull}の${occ.name_ja}の平均年収はいくらですか？`,
      a: `政府統計データをもとにした推計では、${pref.nameFull}の${occ.name_ja}の平均年収は男性約${adjMan}万円、女性約${adjWoman}万円です（地域係数${pref.incomeMultiplier}倍を適用した参考値）。実際の年収は企業規模・経験年数により異なります。`,
    },
    {
      q: `${pref.nameFull}在住の${occ.name_ja}が優先すべき保険は何ですか？`,
      a: `${pref.characteristic} そのため${occ.name_ja}の方には、まず医療保険と就業不能保険での基本的な備えをおすすめします。家族がいる場合は生命保険も合わせて検討してください。`,
    },
    {
      q: `${pref.nameFull}で保険を選ぶ際に注意することはありますか？`,
      a: `地域によって医療費・生活費・賃金水準が異なります。${pref.nameFull}（${pref.region}地方）の物価水準に合った保障額を設定することが重要です。全国平均の約${Math.round(pref.incomeMultiplier * 100)}%の年収水準を基準に保障額を算出しましょう。`,
    },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'トップ', item: 'https://hoken-data.com' },
      { '@type': 'ListItem', position: 2, name: '職業から調べる', item: 'https://hoken-data.com/occupation' },
      { '@type': 'ListItem', position: 3, name: occ.name_ja, item: `https://hoken-data.com/occupation/${occSlug}` },
      { '@type': 'ListItem', position: 4, name: `${pref.nameFull}版`, item: `https://hoken-data.com/prefecture/${prefSlug}/${occSlug}` },
    ],
  }

  const otherPrefs = Object.entries(PREFECTURES).filter(([s]) => s !== prefSlug).slice(0, 6)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="bg-[#0f172a] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <Link href="/occupation" className="hover:text-white">職業一覧</Link>
            <span>›</span>
            <Link href={`/occupation/${occSlug}`} className="hover:text-white">{occ.name_ja}</Link>
            <span>›</span>
            <span>{pref.nameFull}</span>
          </div>
          <div className="inline-block bg-white/10 text-xs px-3 py-1 rounded-full mb-3">📍 地域別保険料データ</div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            {pref.nameFull}の{occ.name_ja}向け<br />
            <span className="text-[#2563eb]">保険料相場データ</span>
          </h1>
          <p className="text-gray-300 text-sm">政府統計データ×地域係数による参考値 | 2024年版</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* KPI */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: `${pref.name}の推定年収（男性）`, value: `${adjMan}万円` },
            { label: `${pref.name}の推定年収（女性）`, value: `${adjWoman}万円` },
            { label: '医療保険の推定月額（参考）', value: `${repPremium.toLocaleString()}円〜` },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[#f8fafc] rounded-xl p-5 border border-gray-100 text-center">
              <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-[#0f172a]">{kpi.value}</p>
            </div>
          ))}
        </section>

        {/* 地域特性 */}
        <section className="bg-blue-50 border-l-4 border-[#2563eb] rounded-r-xl p-6">
          <h2 className="text-lg font-bold text-[#0f172a] mb-2">
            {pref.nameFull}の{occ.name_ja}の特徴
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {pref.characteristic}
            {occ.description ? ` ${occ.name_ja}は${occ.description}` : ''}
            {' '}全国平均と比較して年収は約{Math.round(pref.incomeMultiplier * 100)}%水準です。
            年収に見合った保障額を設定することで、万が一の際も生活水準を維持できます。
          </p>
        </section>

        {/* 保険種類別テーブル */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">
            {pref.nameFull}の{occ.name_ja}向け 保険種類別月額目安
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="text-left p-3 font-semibold">保険種類</th>
                  <th className="text-right p-3 font-semibold">男性 推定月額</th>
                  <th className="text-right p-3 font-semibold">女性 推定月額</th>
                  <th className="text-right p-3 font-semibold">詳細</th>
                </tr>
              </thead>
              <tbody>
                {INSURANCE_ROWS.map((ins, i) => {
                  const manVal   = ins.rate ? Math.round(adjMan   * 10000 * ins.rate / 12) : null
                  const womanVal = ins.rate ? Math.round(adjWoman * 10000 * ins.rate / 12) : null
                  const fxd      = ins.fixed
                  return (
                    <tr key={ins.slug} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium">
                        <Link href={`/occupation/${occSlug}/${ins.slug}`} className="text-[#2563eb] hover:underline">
                          {ins.name}
                        </Link>
                      </td>
                      <td className="p-3 text-right font-semibold text-[#0f172a]">
                        {manVal ? `${manVal.toLocaleString()}円` : fxd ? `${fxd[0].toLocaleString()}〜${fxd[1].toLocaleString()}円` : '—'}
                      </td>
                      <td className="p-3 text-right font-semibold text-[#0f172a]">
                        {womanVal ? `${womanVal.toLocaleString()}円` : fxd ? `${fxd[0].toLocaleString()}〜${fxd[1].toLocaleString()}円` : '—'}
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/occupation/${occSlug}/${ins.slug}`} className="text-xs text-[#2563eb] hover:underline">
                          詳細 →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ※{pref.nameFull}の地域係数（{pref.incomeMultiplier}倍）を適用した参考値。実際の保険料は各保険会社・契約内容により異なります。
          </p>
        </section>

        {/* CTA */}
        <section className="bg-[#0f172a] text-white rounded-2xl p-8 text-center">
          <p className="text-[#f59e0b] text-sm font-semibold mb-2">PR・無料・強引な勧誘なし</p>
          <h2 className="text-xl font-bold mb-3">{pref.nameFull}で{occ.name_ja}向けの保険を無料で相談</h2>
          <p className="text-gray-400 text-sm mb-6">地域・職業に合わせた最適な保険プランをFPが無料で提案します</p>
          <Link href="/consult" className="inline-block bg-[#2563eb] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            無料で保険相談する →
          </Link>
          <p className="text-gray-600 text-xs mt-3">※本サイトはアフィリエイト広告を含みます</p>
        </section>

        {/* 他の都道府県リンク */}
        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">他の都道府県の{occ.name_ja}データ</h2>
          <div className="flex flex-wrap gap-2">
            {otherPrefs.map(([slug, p]) => (
              <Link
                key={slug}
                href={`/prefecture/${slug}/${occSlug}`}
                className="text-sm bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-3 py-2 rounded-lg transition-all"
              >
                {p.nameFull}の{occ.name_ja} →
              </Link>
            ))}
          </div>
        </section>

        {/* 関連リンク */}
        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">関連データ</h2>
          <div className="flex flex-wrap gap-2">
            <Link href={`/occupation/${occSlug}`} className="text-sm bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-3 py-2 rounded-lg transition-all">
              {occ.name_ja}の全国データ →
            </Link>
            <Link href="/occupation" className="text-sm bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-3 py-2 rounded-lg transition-all">
              全職業一覧 →
            </Link>
            <Link href="/simulator" className="text-sm bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-3 py-2 rounded-lg transition-all">
              保険料を診断する →
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-6">よくある質問</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                  <span className="font-semibold text-[#0f172a] pr-4">
                    <span className="text-[#2563eb] mr-2">Q.</span>{item.q}
                  </span>
                  <span className="flex-shrink-0 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                  <span className="text-[#f59e0b] font-bold mr-2">A.</span>{item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <p className="text-xs text-gray-500 leading-relaxed border-t pt-6">
          【免責事項】本ページの情報は公的統計データと地域係数を基にした参考情報です。保険の加入・変更は必ず各保険会社または保険代理店にご確認ください。本サイトはアフィリエイト広告を含みます。
        </p>
      </div>
    </>
  )
}
