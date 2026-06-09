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
import Disclaimer from '@/components/Disclaimer'

type RiskItem = { label: string; detail: string; severity: 'high' | 'medium' }

const OCCUPATION_RISKS: Record<string, RiskItem[]> = {
  'freelance-engineer': [
    { label: '傷病手当金がない',     detail: '病気・怪我での休業時に国の傷病手当金が受け取れない。収入が即ゼロになるリスクがある。',         severity: 'high' },
    { label: '収入の不安定性',        detail: '案件の受注状況により収入が大幅に変動。固定収入がないため保険による安全網が重要。',               severity: 'high' },
    { label: '老齢年金が少ない',      detail: '国民年金のみのため、厚生年金加入者より将来の年金が少ない。個人年金での補完が必要。',             severity: 'medium' },
  ],
  'engineer': [
    { label: '精神疾患・燃え尽き症候群', detail: 'IT業界は長時間労働・過度なストレスによるメンタルヘルス悪化が多く、就業不能リスクが高い。', severity: 'high' },
    { label: '眼精疲労・腱鞘炎',      detail: '長時間のPC作業による職業病リスク。手術・治療費の負担が増大する場合がある。',                 severity: 'medium' },
  ],
  'nurse': [
    { label: '感染症リスク',           detail: '患者からの感染症リスクが常にある。新型ウイルスや結核など職業上の感染リスクは一般より高い。', severity: 'high' },
    { label: '腰痛・筋骨格系障害',    detail: '患者の体位変換・移乗介助による腰痛が職業病。長期休職につながるケースも多い。',               severity: 'high' },
    { label: '精神的ストレス',         detail: '夜勤・緊急対応・患者の死に直面するストレスによるメンタルヘルスリスクがある。',               severity: 'medium' },
  ],
  'doctor': [
    { label: '高額な賠償責任リスク',   detail: '医療過誤による患者からの損害賠償請求リスク。高額訴訟に発展するケースも。',                   severity: 'high' },
    { label: '感染症・被爆リスク',     detail: '手術・検査時の針刺し事故や放射線被爆など、職業特有の健康リスクがある。',                     severity: 'medium' },
  ],
  'construction': [
    { label: '労働災害リスク',         detail: '高所作業・重機操作など、生命に関わる事故リスクが業界平均を大幅に上回る。',                   severity: 'high' },
    { label: '騒音性難聴・振動障害',   detail: '重機の振動・騒音による職業病。長年の作業で慢性的な障害につながるリスクがある。',             severity: 'medium' },
    { label: '将来の体力限界',         detail: '体を酷使する仕事のため40〜50代での体力限界リスクが高く、早めの老後準備が必要。',             severity: 'medium' },
  ],
  'manufacturing': [
    { label: '工場内事故リスク',       detail: '機械・設備による挟まれ・巻き込まれ事故のリスクがある。労災だけでは不足することも。',         severity: 'high' },
    { label: '化学物質・粉塵リスク',   detail: '有害物質・粉塵への長期暴露による職業性疾病（じん肺等）のリスクがある。',                     severity: 'medium' },
  ],
  'driver': [
    { label: '交通事故リスク',         detail: '年間の走行距離が長く、統計的に交通事故に遭遇するリスクが高い。高額賠償リスクも。',           severity: 'high' },
    { label: '腰痛・頸椎障害',         detail: '長時間の運転姿勢による腰痛・椎間板ヘルニアのリスク。休職につながるケースも多い。',           severity: 'medium' },
  ],
  'hairdresser': [
    { label: '立ち仕事による下肢疾患', detail: '長時間の立ち仕事による腰痛・下肢静脈瘤のリスク。就業不能につながるケースがある。',           severity: 'high' },
    { label: '薬剤による皮膚炎',       detail: 'カラー剤・パーマ液などへの長期接触による接触性皮膚炎のリスクがある。',                       severity: 'medium' },
    { label: '収入の不安定性（個人事業主）', detail: '独立開業している場合は傷病手当金がない。病気・怪我で休業すると即収入ゼロに。',         severity: 'high' },
  ],
  'designer': [
    { label: '眼精疲労・頸椎障害',     detail: '長時間のモニター作業による眼精疲労・頸椎ヘルニアのリスク。慢性化しやすい。',               severity: 'medium' },
    { label: '収入不安定（フリーランス）', detail: 'フリーランスの場合は傷病手当金なし。長期休業時の収入保障が特に重要。',                   severity: 'high' },
  ],
  'teacher': [
    { label: '精神疾患・うつ病',       detail: '教員の精神疾患による休職は増加傾向。長期休職になると収入への影響が大きい。',               severity: 'high' },
    { label: '声帯・喉の疾患',         detail: '毎日大声を出す職業のため、声帯ポリープなど喉の疾患リスクがある。',                         severity: 'medium' },
  ],
  'restaurant': [
    { label: '食中毒・衛生事故リスク', detail: '調理中の食中毒事故では業務中断・損害賠償リスクが発生する。',                               severity: 'medium' },
    { label: '火傷・刃物による怪我',   detail: '調理中の火傷や包丁による切り傷のリスクが高く、手の怪我は即業務に支障をきたす。',           severity: 'high' },
    { label: '腰痛・長時間労働',       detail: '長時間の立ち仕事・重い食材運搬による腰痛リスク。外食産業は労働時間も長い傾向。',           severity: 'medium' },
  ],
  'civil-servant': [
    { label: '精神疾患リスク',         detail: '公務員の精神疾患による休職は増加傾向。共済は手厚いが長期休職への対策は必要。',             severity: 'medium' },
    { label: '老後の年金格差',         detail: '共済年金と厚生年金の統合で老後保障が変わりつつある。個人年金での補完を検討したい。',       severity: 'medium' },
  ],
  'sales': [
    { label: '高ストレス・生活習慣病', detail: '目標プレッシャーや長時間労働による高血圧・糖尿病・心疾患リスクが高い職業。',               severity: 'high' },
    { label: '通勤・外出中の事故',     detail: '頻繁な外出・移動による交通事故リスクがある。傷害保険での備えが重要。',                     severity: 'medium' },
  ],
  'manager': [
    { label: '過重労働・脳卒中リスク', detail: '管理職は長時間労働・高ストレスによる脳卒中・心筋梗塞リスクが高い世代。',                   severity: 'high' },
    { label: '高収入に見合った死亡保障', detail: '扶養家族の多い管理職は、万が一の際に家族の生活費・教育費をカバーする高額保障が必要。', severity: 'high' },
  ],
  'part-time': [
    { label: '社会保険未加入リスク',   detail: '週20時間未満等の場合、社会保険（健康保険・厚生年金）に加入できないケースがある。',         severity: 'high' },
    { label: '傷病手当金がない',       detail: '国民健康保険加入者は傷病手当金がない（一部自治体を除く）。医療保険で補完が必要。',         severity: 'high' },
  ],
}

function getOccupationRisks(slug: string, category: string): RiskItem[] {
  if (OCCUPATION_RISKS[slug]) return OCCUPATION_RISKS[slug]
  const categoryDefaults: Record<string, RiskItem[]> = {
    it:           [{ label: 'メンタルヘルスリスク', detail: 'IT業界は精神疾患リスクが高く、就業不能状態になるケースが増えています。', severity: 'high' }],
    medical:      [{ label: '感染症・身体的負担', detail: '医療現場での感染リスクと体力的負担が大きく、休職リスクに備えることが重要です。', severity: 'high' }],
    construction: [{ label: '労働災害リスク', detail: '現場作業による怪我・事故リスクが高く、傷害保険での備えが重要です。', severity: 'high' }],
    transport:    [{ label: '交通事故リスク', detail: '長時間運転による交通事故リスクが統計的に高い職業です。', severity: 'high' }],
    public:       [{ label: '精神疾患リスク', detail: 'ストレスによる精神疾患での休職が増加傾向にあります。', severity: 'medium' }],
    manufacturing:[{ label: '工場内事故リスク', detail: '機械・設備による事故リスクがあり、労災の上乗せ保険が重要です。', severity: 'high' }],
    food:         [{ label: '業務中の怪我リスク', detail: '火傷・刃物による怪我リスクが高く、傷害保険での備えが重要です。', severity: 'medium' }],
    beauty:       [{ label: '職業病リスク', detail: '立ち仕事・薬剤接触による職業病リスクがあります。', severity: 'medium' }],
  }
  return categoryDefaults[category] || [
    { label: '収入途絶リスク', detail: '病気・怪我で働けなくなった際の収入減少に備えることが重要です。', severity: 'medium' },
  ]
}

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
  const [occ, insuranceTypes, allOccupations] = await Promise.all([
    getOccupationBySlug(slug),
    getAllInsuranceTypes(),
    getAllOccupations(),
  ])
  if (!occ) notFound()

  const avgIncome = Math.round(((occ.avg_income_man || 400) + (occ.avg_income_woman || 350)) / 2)
  const needs = getOccupationInsuranceNeeds(occ.category)
  const risks = getOccupationRisks(occ.slug, occ.category)
  const sameCategory = allOccupations.filter(o => o.category === occ.category && o.slug !== occ.slug)

  const faqItems = [
    {
      q: `${occ.name_ja}が最も優先すべき保険は何ですか？`,
      a: `${needs} まずは医療保険と就業不能保険で基本の備えを確保し、家族がいる場合は生命保険も検討することをおすすめします。`,
    },
    {
      q: `${occ.name_ja}の適正な月額保険料はいくらですか？`,
      a: `月収の3〜8%程度が一般的な目安です。${occ.name_ja}の場合、平均年収（男性${occ.avg_income_man || '-'}万円・女性${occ.avg_income_woman || '-'}万円）をもとにすると、月額合計で1〜5万円程度が参考値となります。実際には保障内容・年齢・健康状態で大きく変わります。`,
    },
    {
      q: `${occ.name_ja}の保険を選ぶ際の注意点は？`,
      a: `職業特有のリスク（怪我・疾病・収入不安定性など）を踏まえた保険選びが重要です。また、勤務先の団体保険や社会保険でカバーされる範囲を先に確認し、重複しないよう補完的に民間保険を選ぶのが効率的です。`,
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
      { '@type': 'ListItem', position: 3, name: occ.name_ja, item: `https://hoken-data.com/occupation/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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

      {/* この職業特有のリスク */}
      <section className="py-10 px-4 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">
            {occ.name_ja}特有のリスク
          </h2>
          <div className="space-y-3">
            {risks.map((risk, i) => (
              <div key={i} className={`flex gap-4 bg-white rounded-xl p-4 border ${risk.severity === 'high' ? 'border-red-200' : 'border-gray-100'}`}>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${risk.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                  {risk.severity === 'high' ? '!' : '△'}
                </div>
                <div>
                  <p className="font-semibold text-[#0f172a] text-sm mb-1">{risk.label}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{risk.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 同じカテゴリの職業 */}
      {sameCategory.length > 0 && (
        <section className="py-10 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-[#0f172a] mb-4">
              同じ{CATEGORY_LABELS[occ.category] || 'カテゴリ'}の職業も調べる
            </h2>
            <div className="flex flex-wrap gap-2">
              {sameCategory.map(o => (
                <Link
                  key={o.slug}
                  href={`/occupation/${o.slug}`}
                  className="text-sm bg-[#f8fafc] border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-lg font-medium transition-all"
                >
                  {o.name_ja}の保険料 →
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 都道府県別データへのリンク */}
      <section className="py-10 px-4 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">
            {occ.name_ja}の都道府県別保険料データ
          </h2>
          <p className="text-xs text-gray-500 mb-4">地域によって平均年収・保険料の目安が異なります</p>
          <div className="flex flex-wrap gap-2">
            {[
              { slug: 'tokyo',    name: '東京都' },
              { slug: 'osaka',    name: '大阪府' },
              { slug: 'aichi',    name: '愛知県' },
              { slug: 'kanagawa', name: '神奈川県' },
              { slug: 'fukuoka',  name: '福岡県' },
            ].map(pref => (
              <Link
                key={pref.slug}
                href={`/prefecture/${pref.slug}/${occ.slug}`}
                className="text-sm bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-lg font-medium transition-all"
              >
                {pref.name}の{occ.name_ja} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 関連ガイド */}
      <section className="py-10 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">保険の選び方ガイド</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/guide" className="text-sm bg-[#f8fafc] border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-lg font-medium transition-all">
              保険の選び方ガイド →
            </Link>
            <Link href="/guide/medical-insurance" className="text-sm bg-[#f8fafc] border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-lg font-medium transition-all">
              医療保険の選び方 →
            </Link>
            <Link href="/guide/insurance-by-occupation" className="text-sm bg-[#f8fafc] border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-lg font-medium transition-all">
              職業別の保険選び方 →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <Disclaimer />
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
        </div>
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
