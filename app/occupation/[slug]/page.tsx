import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getAllOccupations,
  getOccupationBySlug,
  getAllInsuranceTypes,
  estimateMonthlyPremium,
  CATEGORY_LABELS,
  INSURANCE_CATEGORY_LABELS,
  getOccupationInsuranceNeeds,
} from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const occupations = await getAllOccupations()
  return occupations.map(o => ({ slug: o.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const occ = await getOccupationBySlug(slug)
  if (!occ) return {}
  return {
    title: `${occ.name_ja}の保険料相場【2023年版】適正保険料の目安`,
    description: `${occ.name_ja}の医療保険・生命保険・収入保障保険などの月額相場を政府統計データで確認。平均年収${occ.avg_income_man ? occ.avg_income_man + '万円' : ''}をもとに算出した参考値を無料で公開。`,
  }
}

const INSURANCE_ICONS: Record<string, string> = {
  medical: '🏥', life: '🛡️', 'income-protection': '💼',
  cancer: '🎗️', auto: '🚗', fire: '🏠',
  'personal-accident': '⚡', pension: '🏦', child: '👶', 'whole-life': '♾️',
}

export default async function OccupationPage({ params }: Props) {
  const { slug } = await params
  const [occ, insuranceTypes] = await Promise.all([
    getOccupationBySlug(slug),
    getAllInsuranceTypes(),
  ])
  if (!occ) notFound()

  const avgIncome = Math.round(((occ.avg_income_man || 400) + (occ.avg_income_woman || 350)) / 2)
  const needs = getOccupationInsuranceNeeds(occ.category)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${occ.name_ja}の保険料相場`,
    description: needs,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ヘッダー */}
      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <Link href="/occupation" className="hover:text-white">職業一覧</Link>
            <span>›</span>
            <span>{occ.name_ja}</span>
          </div>
          <div className="inline-block bg-white/10 text-xs px-3 py-1 rounded-full mb-3">
            {CATEGORY_LABELS[occ.category] || occ.category}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            {occ.name_ja}の<span className="text-[#2563eb]">保険料相場</span>
          </h1>
          <p className="text-gray-300 text-sm">政府統計（賃金構造基本統計調査2023年）に基づく参考値</p>
        </div>
      </section>

      {/* KPIカード */}
      <section className="py-10 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#f8fafc] rounded-xl p-5 text-center border">
            <p className="text-xs text-gray-500 mb-1">平均年収（男性）</p>
            <p className="text-3xl font-bold text-[#0f172a]">
              {occ.avg_income_man ? `${occ.avg_income_man}万円` : 'データなし'}
            </p>
            <p className="text-xs text-gray-400 mt-1">2023年 全国平均</p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-5 text-center border">
            <p className="text-xs text-gray-500 mb-1">平均年収（女性）</p>
            <p className="text-3xl font-bold text-[#0f172a]">
              {occ.avg_income_woman ? `${occ.avg_income_woman}万円` : 'データなし'}
            </p>
            <p className="text-xs text-gray-400 mt-1">2023年 全国平均</p>
          </div>
          <div className="bg-[#2563eb] rounded-xl p-5 text-center text-white">
            <p className="text-xs text-blue-200 mb-1">対応保険種類</p>
            <p className="text-3xl font-bold">{insuranceTypes.length}種類</p>
            <p className="text-xs text-blue-200 mt-1">相場データあり</p>
          </div>
        </div>
      </section>

      {/* 保険ニーズ */}
      <section className="py-10 px-4 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">
            {occ.name_ja}に多い保険ニーズ
          </h2>
          <div className="bg-white border-l-4 border-[#2563eb] rounded-r-xl p-5 text-gray-700 leading-relaxed">
            {needs}
          </div>
        </div>
      </section>

      {/* 保険種類一覧 */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-6">
            保険種類別の推定月額保険料
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            ※ 年収{avgIncome}万円（男女平均）をもとに算出した参考値です。実際の保険料は年齢・健康状態・保険会社により異なります。
          </p>
          <div className="space-y-3">
            {(['life', 'non-life', 'saving'] as const).map(cat => {
              const items = insuranceTypes.filter(t => t.category === cat)
              if (items.length === 0) return null
              return (
                <div key={cat}>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    {INSURANCE_CATEGORY_LABELS[cat]}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map(ins => {
                      const est = estimateMonthlyPremium(ins.slug, occ.avg_income_man, occ.avg_income_woman)
                      return (
                        <Link
                          key={ins.id}
                          href={`/occupation/${occ.slug}/${ins.slug}`}
                          className="group flex items-center justify-between bg-[#f8fafc] hover:bg-blue-50 border hover:border-[#2563eb] rounded-xl p-4 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{INSURANCE_ICONS[ins.slug] || '📋'}</span>
                            <div>
                              <p className="font-semibold text-[#0f172a] text-sm">{ins.name_ja}</p>
                              <p className="text-xs text-gray-500">
                                推定月額：<span className="text-[#2563eb] font-bold">{est.label}</span>
                                <span className="text-gray-400 ml-1">（参考値）</span>
                              </p>
                            </div>
                          </div>
                          <span className="text-[#2563eb] text-xs font-semibold group-hover:underline whitespace-nowrap">詳細 →</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-[#0f172a] text-white text-center">
        <p className="text-[#f59e0b] text-sm font-semibold mb-2">無料・強引な勧誘なし</p>
        <h2 className="text-xl font-bold mb-4">
          {occ.name_ja}に最適な保険を<br />プロに無料で相談する
        </h2>
        <Link
          href="/consult"
          className="inline-block bg-[#2563eb] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          無料で保険相談する →
        </Link>
        <p className="text-gray-500 text-xs mt-4">※本サイトはアフィリエイト広告を含みます（PR）</p>
      </section>

      {/* 免責事項 */}
      <section className="py-8 px-4 bg-[#f8fafc] border-t">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-500 leading-relaxed">
            【免責事項】本ページの保険料は公的統計データを基にした推計参考値です。実際の保険料は保険会社・年齢・健康状態・契約内容により大きく異なります。保険の加入・変更は必ず各保険会社または保険代理店にご確認ください。
          </p>
        </div>
      </section>
    </>
  )
}
