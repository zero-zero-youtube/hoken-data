import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getAllInsuranceTypes,
  getInsuranceTypeBySlug,
  getAllOccupations,
  estimateMonthlyPremium,
  CATEGORY_LABELS,
  INSURANCE_CATEGORY_LABELS,
  getInsuranceDescription,
} from '@/lib/data'
import Disclaimer from '@/components/Disclaimer'
import { getInsuranceDetail } from '@/lib/insuranceDetails'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const types = await getAllInsuranceTypes()
  return types.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const ins = await getInsuranceTypeBySlug(slug)
  if (!ins) return {}
  return {
    title: `${ins.name_ja}の相場と選び方【2023年版】`,
    description: `${ins.name_ja}の月額保険料相場・選び方を職業別・年齢別に解説。${ins.description || getInsuranceDescription(ins.slug)}`,
  }
}

const AGE_GROUPS = ['20代', '30代', '40代', '50代']
const RECOMMEND: Record<string, Record<string, string>> = {
  medical:           { '20代': '◎', '30代': '◎', '40代': '◎', '50代': '◎' },
  life:              { '20代': '○', '30代': '◎', '40代': '◎', '50代': '△' },
  'income-protection': { '20代': '◎', '30代': '◎', '40代': '◎', '50代': '△' },
  cancer:            { '20代': '△', '30代': '○', '40代': '◎', '50代': '◎' },
  auto:              { '20代': '◎', '30代': '◎', '40代': '◎', '50代': '◎' },
  fire:              { '20代': '○', '30代': '◎', '40代': '◎', '50代': '◎' },
  'personal-accident': { '20代': '◎', '30代': '◎', '40代': '◎', '50代': '◎' },
  pension:           { '20代': '◎', '30代': '◎', '40代': '○', '50代': '△' },
  child:             { '20代': '○', '30代': '◎', '40代': '○', '50代': '-' },
  'whole-life':      { '20代': '◎', '30代': '◎', '40代': '○', '50代': '△' },
}

const RECOMMEND_COLORS: Record<string, string> = {
  '◎': 'bg-green-100 text-green-700 font-bold',
  '○': 'bg-blue-50 text-blue-600',
  '△': 'bg-yellow-50 text-yellow-600',
  '-': 'bg-gray-50 text-gray-400',
}

export default async function InsurancePage({ params }: Props) {
  const { slug } = await params
  const [ins, occupations] = await Promise.all([
    getInsuranceTypeBySlug(slug),
    getAllOccupations(),
  ])
  if (!ins) notFound()

  const description = ins.description || getInsuranceDescription(ins.slug)
  const recommend = RECOMMEND[ins.slug] || {}
  const detail = getInsuranceDetail(ins.slug)

  const faqItems = [
    {
      q: `${ins.name_ja}は必要ですか？`,
      a: `${description} 必要性はライフステージ・家族構成・職業によって異なります。まず公的保険（健康保険・雇用保険等）でカバーされる範囲を確認し、不足分を民間保険で補う形が基本的な考え方です。`,
    },
    {
      q: `${ins.name_ja}の月額保険料の目安はいくらですか？`,
      a: `職業・年齢・健康状態・保障内容により大きく異なります。本サイトの職業別データでは、平均年収をもとにした推計参考値を確認できます。一般的な目安として収入の3〜5%程度を保険料として考える方も多いです。`,
    },
    {
      q: `${ins.name_ja}を選ぶときのポイントは何ですか？`,
      a: `保障内容・免責期間・保険会社の信頼性・保険料の比較が基本です。特に${ins.name_ja}では、保障が始まるまでの待機期間や、支払い条件の詳細を必ず確認してください。複数の会社で見積もりを比較することをおすすめします。`,
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
      { '@type': 'ListItem', position: 2, name: '保険種類一覧', item: 'https://hoken-data.com/insurance' },
      { '@type': 'ListItem', position: 3, name: ins.name_ja, item: `https://hoken-data.com/insurance/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <Link href="/insurance" className="hover:text-white">保険種類一覧</Link>
            <span>›</span>
            <span>{ins.name_ja}</span>
          </div>
          <div className="inline-block bg-white/10 text-xs px-3 py-1 rounded-full mb-3">
            {INSURANCE_CATEGORY_LABELS[ins.category] || ins.category}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            {ins.name_ja}の<span className="text-[#2563eb]">相場と選び方</span>
          </h1>
          <p className="text-gray-300 text-sm">対象年齢：{ins.target_age_min}〜{ins.target_age_max}歳</p>
        </div>
      </section>

      {/* 概要 */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">{ins.name_ja}とは</h2>
          <p className="text-gray-700 leading-relaxed mb-6">{detail?.mechanism || description}</p>
          {detail && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* こんな人に必要 */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-[#0f172a] text-sm mb-3 flex items-center gap-2">
                  <span className="text-[#2563eb]">✓</span> こんな人に必要
                </h3>
                <ul className="space-y-2">
                  {detail.whoNeeds.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#2563eb] flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* 不要な場合 */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-[#0f172a] text-sm mb-3 flex items-center gap-2">
                  <span className="text-gray-500">△</span> 不要な場合もある
                </h3>
                <ul className="space-y-2">
                  {detail.whoDoesntNeed.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* 相場・税制 */}
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h3 className="font-bold text-[#0f172a] text-sm mb-2">💰 保険料の相場</h3>
                <p className="text-sm text-gray-700">{detail.averagePremium}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <h3 className="font-bold text-[#0f172a] text-sm mb-2">💡 税制上の扱い</h3>
                <p className="text-sm text-gray-700">{detail.taxTreatment}</p>
              </div>
              {/* 注意点 */}
              <div className="bg-red-50 rounded-xl p-5 border border-red-100 md:col-span-2">
                <h3 className="font-bold text-[#0f172a] text-sm mb-3 flex items-center gap-2">
                  <span className="text-red-500">⚠️</span> 加入前に確認すべき注意点
                </h3>
                <ul className="space-y-2">
                  {detail.cautions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-500 flex-shrink-0 font-bold">!</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 年齢別おすすめ度 */}
      <section className="py-10 px-4 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-6">年齢別おすすめ度</h2>
          <div className="grid grid-cols-4 gap-3">
            {AGE_GROUPS.map(age => (
              <div key={age} className="bg-white rounded-xl p-4 text-center border">
                <p className="text-sm text-gray-500 mb-2">{age}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-lg ${RECOMMEND_COLORS[recommend[age] || '-'] || ''}`}>
                  {recommend[age] || '-'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">◎ 強くおすすめ　○ おすすめ　△ 状況次第</p>
        </div>
      </section>

      {/* 職業別推定保険料テーブル */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">職業別 推定月額保険料</h2>
          <p className="text-xs text-gray-500 mb-6">
            ※年収をもとに算出した推計参考値です。実際の保険料は年齢・健康状態・保険会社により異なります。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="text-left p-3 rounded-tl-lg">職業</th>
                  <th className="text-right p-3">カテゴリ</th>
                  <th className="text-right p-3 rounded-tr-lg">推定月額（参考値）</th>
                </tr>
              </thead>
              <tbody>
                {occupations.map((occ, i) => {
                  const est = estimateMonthlyPremium(ins.slug, occ.avg_income_man, occ.avg_income_woman)
                  return (
                    <tr key={occ.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3">
                        <Link href={`/occupation/${occ.slug}/${ins.slug}`} className="text-[#2563eb] hover:underline font-semibold">
                          {occ.name_ja}
                        </Link>
                      </td>
                      <td className="p-3 text-right text-gray-500 text-xs">{CATEGORY_LABELS[occ.category]}</td>
                      <td className="p-3 text-right font-bold text-[#0f172a]">{est.label}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 px-4 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-6">よくある質問</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden bg-white">
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
        </div>
      </section>

      {/* 関連職業ページ */}
      <section className="py-10 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">
            職業別の{ins.name_ja}相場を調べる
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { slug: 'engineer',           name: 'システムエンジニア' },
              { slug: 'nurse',              name: '看護師' },
              { slug: 'freelance-engineer', name: 'フリーランスエンジニア' },
              { slug: 'civil-servant',      name: '地方公務員' },
              { slug: 'construction',       name: '建設業・現場作業員' },
            ].map(occ => (
              <Link
                key={occ.slug}
                href={`/occupation/${occ.slug}/${ins.slug}`}
                className="text-sm bg-[#f8fafc] border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-lg font-medium transition-all"
              >
                {occ.name}の{ins.name_ja} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 年齢別データへのリンク */}
      <section className="py-10 px-4 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">
            年齢別の{ins.name_ja}相場を調べる
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { slug: '20dai', label: '20代' },
              { slug: '30dai', label: '30代' },
              { slug: '40dai', label: '40代' },
              { slug: '50dai', label: '50代' },
            ].map(age => (
              <Link
                key={age.slug}
                href={`/age/${age.slug}/${ins.slug}`}
                className="text-sm bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-lg font-medium transition-all"
              >
                {age.label}の{ins.name_ja} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <Disclaimer />
          <p className="text-[#f59e0b] text-sm font-semibold mb-2">無料・強引な勧誘なし</p>
          <h2 className="text-xl font-bold mb-4">
            {ins.name_ja}について<br />プロに無料で相談する
          </h2>
          <Link href="/consult" className="inline-block bg-[#2563eb] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            無料で保険相談する →
          </Link>
          <p className="text-gray-500 text-xs mt-4">※本サイトはアフィリエイト広告を含みます（PR）</p>
        </div>
      </section>
    </>
  )
}
