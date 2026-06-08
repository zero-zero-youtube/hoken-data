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

  return (
    <>
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
          <p className="text-gray-700 leading-relaxed">{description}</p>
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

      {/* CTA */}
      <section className="py-12 px-4 bg-[#0f172a] text-white text-center">
        <p className="text-[#f59e0b] text-sm font-semibold mb-2">無料・強引な勧誘なし</p>
        <h2 className="text-xl font-bold mb-4">
          {ins.name_ja}について<br />プロに無料で相談する
        </h2>
        <Link href="/consult" className="inline-block bg-[#2563eb] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
          無料で保険相談する →
        </Link>
        <p className="text-gray-500 text-xs mt-4">※本サイトはアフィリエイト広告を含みます（PR）</p>
      </section>

      <section className="py-8 px-4 bg-[#f8fafc] border-t">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-500 leading-relaxed">
            【免責事項】本ページの保険料は公的統計データを基にした推計参考値です。実際の保険料は保険会社・年齢・健康状態・契約内容により大きく異なります。
          </p>
        </div>
      </section>
    </>
  )
}
