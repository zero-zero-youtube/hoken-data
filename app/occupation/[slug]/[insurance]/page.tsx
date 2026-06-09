import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getAllOccupations,
  getAllInsuranceTypes,
  getOccupationBySlug,
  getInsuranceTypeBySlug,
  estimateMonthlyPremium,
  getInsuranceDescription,
  getOccupationInsuranceNeeds,
} from '@/lib/data'

type Props = { params: Promise<{ slug: string; insurance: string }> }

export async function generateStaticParams() {
  const [occupations, insuranceTypes] = await Promise.all([
    getAllOccupations(),
    getAllInsuranceTypes(),
  ])
  const params: { slug: string; insurance: string }[] = []
  for (const occ of occupations) {
    for (const ins of insuranceTypes) {
      params.push({ slug: occ.slug, insurance: ins.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, insurance } = await params
  const [occ, ins] = await Promise.all([
    getOccupationBySlug(slug),
    getInsuranceTypeBySlug(insurance),
  ])
  if (!occ || !ins) return {}
  return {
    title: `${occ.name_ja}の${ins.name_ja}相場【2023年版】月額推定と選び方`,
    description: `${occ.name_ja}（平均年収${occ.avg_income_man || '-'}万円）に合った${ins.name_ja}の月額相場・選び方を解説。政府統計データに基づく推計値を無料公開。`,
  }
}

const AGE_ROWS = [
  { age: '20〜24歳', factor: 0.75 },
  { age: '25〜29歳', factor: 0.85 },
  { age: '30〜34歳', factor: 0.95 },
  { age: '35〜39歳', factor: 1.0 },
  { age: '40〜44歳', factor: 1.15 },
  { age: '45〜49歳', factor: 1.3 },
  { age: '50〜54歳', factor: 1.5 },
  { age: '55〜59歳', factor: 1.7 },
]

function getReason(occCategory: string, insSlug: string): string {
  const reasons: Record<string, Record<string, string>> = {
    it: {
      medical: 'フリーランス・在宅勤務が多いITエンジニアは、社会保険の保障が手薄になりがちです。入院・手術への備えとして医療保険は必須です。',
      'income-protection': 'ITエンジニアは精神疾患・過労による休職リスクがあります。就業不能状態でも収入を確保するため収入保障保険が特に重要です。',
      life: 'ITエンジニアは比較的高収入のため、家族への生活保障として生命保険の準備が重要です。',
      cancer: '年々増加するがんリスク。ITエンジニアは高額治療を受けられる環境を整えることが重要です。',
    },
    medical: {
      medical: '医療従事者は感染リスクが高く、自身の入院・手術リスクに備える医療保険が特に重要です。',
      'income-protection': '病気・怪我で働けなくなった際の収入減少リスクに備えます。医療従事者は体力的負担が大きいため重要です。',
    },
    construction: {
      'personal-accident': '建設業・現場作業員は業務中の怪我リスクが高く、傷害保険による手厚い補償が必要です。',
      'income-protection': '体を使う仕事のため、怪我による長期休業リスクに備えた収入保障が重要です。',
    },
    transport: {
      auto: 'ドライバー職は自動車事故リスクが高く、任意自動車保険の充実が最優先事項です。',
      'personal-accident': '交通事故・業務中の怪我リスクに対して、傷害保険でしっかり備えましょう。',
    },
    public: {
      pension: '公務員は雇用が安定しているため、老後資金の積み立てとして個人年金が特に効果的です。',
      'whole-life': '公務員の安定した収入を活かして、終身保険で死亡保障と老後の貯蓄を兼ね備えましょう。',
    },
  }
  return reasons[occCategory]?.[insSlug]
    || `${getOccupationInsuranceNeeds(occCategory)} ${getInsuranceDescription(insSlug)}`
}

type CTACopy = { badge: string; headline: string; sub: string }

function getCTACopy(occSlug: string, occName: string, occCategory: string, insSlug: string, insName: string): CTACopy {
  // 特定の組み合わせ
  const key = `${occSlug}:${insSlug}`
  const specific: Record<string, CTACopy> = {
    'freelance-engineer:income-protection': {
      badge: 'フリーランス専門 | 無料相談',
      headline: 'フリーランスの収入リスクに備えるなら、\nまず専門家に無料で相談してみましょう',
      sub: '傷病手当金がないフリーランスだからこそ、就業不能保険の選び方が重要です。FPに最適な保障額を無料で試算してもらえます。',
    },
    'nurse:medical': {
      badge: '医療職向け | 無料相談',
      headline: '医療職だからこそ知っておきたい\n保険の選び方をFPに無料相談できます',
      sub: '感染リスク・腰痛リスクを抱える看護師向けの医療保険。職業特性を理解したFPが最適なプランを提案します。',
    },
    'nurse:income-protection': {
      badge: '医療職向け | 無料相談',
      headline: '看護師の就業不能リスクに対応した\n保険プランを無料で相談できます',
      sub: '体力的負担の大きい看護師こそ、就業不能保険で収入を守ることが重要。無料でFPに試算してもらいましょう。',
    },
    'construction:personal-accident': {
      badge: '現場職向け | 無料相談',
      headline: '建設業の高い怪我リスクに対応した\n傷害保険プランをFPに無料で相談',
      sub: '労災保険だけでは不十分なケースも。建設業特有のリスクを理解したFPが最適な上乗せ保険を提案します。',
    },
    'freelance-engineer:medical': {
      badge: 'フリーランス向け | 無料相談',
      headline: '社会保険が手薄なフリーランスのための\n医療保険プランを無料相談できます',
      sub: '傷病手当金のないフリーランスは入院・手術リスクへの備えが特に重要。FPが最適な保障額を無料で試算します。',
    },
    'manager:life': {
      badge: '管理職向け | 無料相談',
      headline: '高収入管理職の家族を守る\n生命保険プランをFPに無料で相談',
      sub: '扶養家族の多い管理職は、万が一の際の保障額設計が重要です。収入・資産に合わせた最適な死亡保障を提案します。',
    },
    'civil-servant:pension': {
      badge: '公務員向け | 無料相談',
      headline: '公務員の共済を活かした上乗せ設計で\n老後資産を最大化する無料相談',
      sub: '共済と個人年金の最適な組み合わせはFPに相談するのが確実。税制優遇を活かした積み立て方法を無料で提案します。',
    },
    'sales:cancer': {
      badge: 'ストレス職向け | 無料相談',
      headline: '営業職に多い生活習慣病・がんリスクに\n備える保険プランを無料相談',
      sub: '高ストレスの営業職はがん・生活習慣病リスクが高め。最適ながん保険の選び方をFPに無料で相談できます。',
    },
  }
  if (specific[key]) return specific[key]

  // カテゴリ×保険種類の汎用コピー
  const categoryIns: Record<string, Partial<CTACopy>> = {
    'it:income-protection':   { headline: `IT・エンジニアの就業不能リスクに備える\n${insName}プランをFPに無料で相談` },
    'medical:medical':        { headline: `医療従事者向けの${insName}プランを\nFPに無料で相談できます` },
    'construction:income-protection': { headline: `現場職の怪我・病気リスクに対応した\n${insName}プランを無料相談` },
    'public:pension':         { headline: `公務員の共済を補完する個人年金プランを\nFPに無料で相談できます` },
  }
  const catKey = `${occCategory}:${insSlug}`
  const catCopy = categoryIns[catKey]

  return {
    badge: 'PR・無料・強引な勧誘なし',
    headline: catCopy?.headline || `${occName}に最適な${insName}を\nプロに無料で相談する`,
    sub: `${insName}の相場データを確認した上で、${occName}の職業特性に合ったプランを提案してもらえます。強引な勧誘は一切ありません。`,
  }
}

const faqTemplate = (occName: string, insName: string, monthly: string) => [
  {
    q: `${occName}は${insName}に必ず入るべきですか？`,
    a: `必ずとは言い切れませんが、${occName}の収入・リスクプロファイルを考えると${insName}の備えは重要です。現在の社会保険の保障内容を確認した上で、不足分を補う形で検討することをおすすめします。`,
  },
  {
    q: `${insName}の月額${monthly}という金額は妥当ですか？`,
    a: `本サイトの金額は${occName}の平均年収をもとにした推計参考値です。実際の保険料は年齢・健康状態・保険会社・保障内容により大きく変わります。複数の保険会社で見積もりを取ることをおすすめします。`,
  },
  {
    q: `${insName}を選ぶ際のポイントは何ですか？`,
    a: `保障内容・保険料・保険会社の信頼性・免責期間などを総合的に比較することが重要です。${occName}の場合、特に${getInsuranceDescription(insName)}という観点から選ぶとよいでしょう。`,
  },
]

const faqSchema = (items: ReturnType<typeof faqTemplate>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
})

export default async function OccupationInsurancePage({ params }: Props) {
  const { slug, insurance } = await params
  const [occ, ins] = await Promise.all([
    getOccupationBySlug(slug),
    getInsuranceTypeBySlug(insurance),
  ])
  if (!occ || !ins) notFound()

  const est = estimateMonthlyPremium(ins.slug, occ.avg_income_man, occ.avg_income_woman)
  const reason = getReason(occ.category, ins.slug)
  const faqs = faqTemplate(occ.name_ja, ins.name_ja, est.label)
  const schema = faqSchema(faqs)
  const cta = getCTACopy(occ.slug, occ.name_ja, occ.category, ins.slug, ins.name_ja)

  const isFixedRange = Array.isArray([est.man, est.woman]) && ins.slug === 'auto' || ins.slug === 'fire'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ヘッダー */}
      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <Link href="/occupation" className="hover:text-white">職業一覧</Link>
            <span>›</span>
            <Link href={`/occupation/${occ.slug}`} className="hover:text-white">{occ.name_ja}</Link>
            <span>›</span>
            <span>{ins.name_ja}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            {occ.name_ja}の<br className="sm:hidden" />
            <span className="text-[#2563eb]">{ins.name_ja}</span>相場
          </h1>
          <p className="text-gray-300 text-sm">政府統計データに基づく2023年推計値（参考値）</p>
        </div>
      </section>

      {/* 推定月額 */}
      <section className="py-10 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-[#0f172a] mb-6">推定月額保険料（参考値）</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {!isFixedRange ? (
              <>
                <div className="bg-[#f8fafc] rounded-xl p-5 text-center border">
                  <p className="text-xs text-gray-500 mb-1">男性（年収{occ.avg_income_man || '-'}万円）</p>
                  <p className="text-3xl font-bold text-[#0f172a]">
                    月額 {est.man ? `${est.man.toLocaleString()}円` : '-'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">推計参考値</p>
                </div>
                <div className="bg-[#f8fafc] rounded-xl p-5 text-center border">
                  <p className="text-xs text-gray-500 mb-1">女性（年収{occ.avg_income_woman || '-'}万円）</p>
                  <p className="text-3xl font-bold text-[#0f172a]">
                    月額 {est.woman ? `${est.woman.toLocaleString()}円` : '-'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">推計参考値</p>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 bg-[#f8fafc] rounded-xl p-5 text-center border">
                <p className="text-xs text-gray-500 mb-1">{ins.name_ja}（年収による変動なし）</p>
                <p className="text-3xl font-bold text-[#0f172a]">月額 {est.label}</p>
                <p className="text-xs text-gray-400 mt-1">推計参考値</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">
            ※実際の保険料は年齢・健康状態・保険会社・保障内容により大きく異なります。必ず各保険会社で見積もりを取ってください。
          </p>
        </div>
      </section>

      {/* なぜ重要か */}
      <section className="py-10 px-4 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">
            {occ.name_ja}に{ins.name_ja}が重要な理由
          </h2>
          <div className="bg-white border-l-4 border-[#2563eb] rounded-r-xl p-5 text-gray-700 leading-relaxed">
            {reason}
          </div>
        </div>
      </section>

      {/* 年齢別推奨保険料テーブル */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">年齢別 推奨月額保険料（参考値）</h2>
          <p className="text-xs text-gray-500 mb-6">
            ※年齢とともに保険料は変動します。若いうちに加入するほど有利な場合が多いです。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="text-left p-3">年齢層</th>
                  <th className="text-right p-3">男性 推定月額</th>
                  <th className="text-right p-3">女性 推定月額</th>
                </tr>
              </thead>
              <tbody>
                {AGE_ROWS.map((row, i) => {
                  const manVal = est.man ? Math.round(est.man * row.factor) : null
                  const womanVal = est.woman ? Math.round(est.woman * row.factor) : null
                  return (
                    <tr key={row.age} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.age}</td>
                      <td className="p-3 text-right">{manVal ? `${manVal.toLocaleString()}円` : '-'}</td>
                      <td className="p-3 text-right">{womanVal ? `${womanVal.toLocaleString()}円` : '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">※年齢係数は一般的な傾向をもとにした参考値です。</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-[#0f172a] text-white text-center">
        <p className="text-[#f59e0b] text-sm font-semibold mb-2">{cta.badge}</p>
        <h2 className="text-xl font-bold mb-3 whitespace-pre-line">{cta.headline}</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto leading-relaxed">{cta.sub}</p>
        <Link
          href="/consult"
          className="inline-block bg-[#2563eb] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors mb-3"
        >
          無料で保険相談する →
        </Link>
        <p className="text-gray-600 text-xs">※本サイトはアフィリエイト広告を含みます</p>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-6">よくある質問</h2>
          <div className="space-y-4">
            {faqs.map((item, i) => (
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
        </div>
      </section>

      {/* 免責事項 */}
      <section className="py-8 px-4 bg-[#f8fafc] border-t">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-500 leading-relaxed">
            【免責事項】本ページの保険料は公的統計データを基にした推計参考値です。実際の保険料は保険会社・年齢・健康状態・契約内容により大きく異なります。保険の加入・変更は必ず各保険会社または保険代理店にご確認ください。本サイトはアフィリエイト広告を含み、保険会社・比較サービス等からの紹介手数料を収益源の一部としています。
          </p>
        </div>
      </section>
    </>
  )
}
