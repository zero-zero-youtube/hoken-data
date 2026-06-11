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
import Disclaimer from '@/components/Disclaimer'
import OccupationInsuranceCharts from '@/components/OccupationInsuranceCharts'
import DataCalculationBadge from '@/components/DataCalculationBadge'
import OccupationRiskDataSection from '@/components/OccupationRiskDataSection'
import AffiliateCTA from '@/components/AffiliateCTA'
import InsuranceChecklist from '@/components/InsuranceChecklist'
import type { AffiliateKey } from '@/lib/affiliateLinks'
import { OCCUPATION_INSIGHTS } from '@/lib/occupationInsights'
import { INSURANCE_DETAILS } from '@/lib/insuranceDetails'

type Props = { params: Promise<{ slug: string; insurance: string }> }

export async function generateStaticParams() {
  const occupations = ['engineer','freelance-engineer','nurse','teacher','civil-servant','sales','driver','construction','food-service','beautician','accountant','doctor','lawyer','designer','manager','manufacturing','pharmacist','real-estate','finance','part-time']
  const insurances = ['medical','life','income-protection','cancer','whole-life','pension','auto','fire','personal-accident','child']
  return occupations.flatMap(slug =>
    insurances.map(insurance => ({ slug, insurance }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, insurance } = await params
  const [occ, ins] = await Promise.all([
    getOccupationBySlug(slug),
    getInsuranceTypeBySlug(insurance),
  ])
  if (!occ || !ins) return {}
  const est = estimateMonthlyPremium(ins.slug, occ.avg_income_man, occ.avg_income_woman)
  const monthlyStr = est.man ? `${est.man.toLocaleString()}円` : est.label
  return {
    title: `${occ.name_ja}の${ins.name_ja}相場【2025年版】推定月額${monthlyStr}`,
    description: `${occ.name_ja}の${ins.name_ja}の推定月額保険料は約${monthlyStr}。年収別・年齢別の保険料目安と、${occ.name_ja}特有のリスクへの備え方を政府統計データで解説。無料の保険料診断も。`,
  }
}

const INCOME_BRACKETS = [300, 400, 500, 600, 800]

function getCautionPoints(occCategory: string, insSlug: string, occName: string, insName: string): string[] {
  const key = `${occCategory}:${insSlug}`
  const map: Record<string, string[]> = {
    'it:income-protection': [
      '精神疾患・うつ病を免責とする商品が多いため、特約や支払要件を必ず確認してください',
      '待機期間（60〜90日）は保障されないため、緊急の貯蓄と併用して備えることが重要です',
      'フリーランスの場合は収入証明が難しいケースがあるため、契約前に保険会社に確認を',
    ],
    'it:medical': [
      '長時間労働・過労が原因の疾病は労災と医療保険の境界が曖昧なため、給付条件を確認してください',
      'リモートワーク中の怪我（通勤外）は労災対象外になる場合があり、私傷病特約の確認が必要です',
      '入院日数の短期化傾向により、入院一時金型も選択肢として比較することをおすすめします',
    ],
    'medical:medical': [
      '感染症による入院は職業上のリスクが高く、感染症特約の有無を必ず確認してください',
      '腰痛・ぎっくり腰など業務起因の疾病は労災と重複するため、給付条件の整合性を確認を',
      '夜勤・シフト勤務が多い職種は疲労蓄積による疾病リスクが高く、保障内容を手厚くすることを推奨します',
    ],
    'medical:income-protection': [
      '医療職は体力的負担が大きく、腰痛・腱鞘炎等での休業リスクが高いため、就業不能の定義を確認してください',
      '夜勤手当を含む収入を基準に保障額を設定すると、休業時の収入減が大きくなる点に注意してください',
      '育児休業中の収入変動と保障期間の整合性を事前に保険会社に確認することをおすすめします',
    ],
    'construction:personal-accident': [
      '労災保険の上乗せ傷害保険であることを確認し、支払対象と労災給付の重複・調整条件を確認してください',
      '建設現場特有の危険作業（高所・重機など）が免責事由に含まれていないか必ず確認してください',
      '仕事中・通勤中・日常生活の3区分での保障範囲を確認し、業務中の保障が十分かを確かめてください',
    ],
    'construction:income-protection': [
      '建設業は季節・受注状況による収入変動が大きいため、基準収入の計算方法を保険会社に確認してください',
      '高所作業・重機作業による怪我での休業は、就業不能の認定基準を事前に確認することが重要です',
      '個人事業主・一人親方の場合、社会保険が薄いため民間の就業不能保険の保障を手厚くすることを推奨します',
    ],
    'transport:auto': [
      '業務用車両と私用車両で保険が分かれる場合があるため、使用目的の届け出を正確に行ってください',
      '対人・対物賠償は無制限を強くおすすめします。最低限の保障額では重大事故の賠償に不足するリスクがあります',
      '等級の引き継ぎ・事故有係数の影響を理解した上で、補償範囲と保険料のバランスを検討してください',
    ],
    'public:pension': [
      '共済年金（退職等年金）との合算で年金収入を考え、過剰な積み立てにならないよう設計してください',
      '個人年金保険料控除（年間最大4万円の所得控除）を活用できるタイプを選ぶことで節税効果があります',
      '物価変動リスクに備えて、変額型と定額型の組み合わせや運用商品の分散を検討してください',
    ],
    'office:medical': [
      '健康保険の傷病手当金（最長18ヶ月）との重複期間を確認し、入院日数に応じた保障設計をしてください',
      '女性特有の疾病（子宮・乳房等）への保障特約の有無を確認し、必要に応じて追加してください',
      '通院保障・先進医療特約の必要性を自身の医療履歴や家族歴をもとに検討することをおすすめします',
    ],
  }
  return map[key] || [
    `${insName}の保障内容・免責事由・待機期間を複数社で比較検討してください`,
    `${occName}の職業リスクに対応した特約・オプションの有無を保険会社に確認してください`,
    `保険料・保障額・保障期間のバランスを、ファイナンシャルプランナーに相談した上で決定することをおすすめします`,
  ]
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

function generateLeadText(
  occ: { name_ja: string; slug: string; avg_income_man: number | null },
  ins: { name_ja: string; slug: string },
  est: { man: number | null; woman: number | null; label: string }
): string[] {
  const insight = OCCUPATION_INSIGHTS[occ.slug]
  const detail = INSURANCE_DETAILS[ins.slug]
  const lines: string[] = []

  if (insight?.keyRisks?.[0]) {
    lines.push(`${occ.name_ja}は「${insight.keyRisks[0]}」というリスクを抱えています。`)
  } else {
    lines.push(`${occ.name_ja}は職業特性から独自のリスクを抱えています。`)
  }

  if (detail?.mechanism) {
    const short = detail.mechanism.length > 80 ? detail.mechanism.slice(0, 80) + '…' : detail.mechanism
    lines.push(`${ins.name_ja}とは、${short}`)
  } else {
    lines.push(`${ins.name_ja}は万一の際の経済的リスクに備えるための保険です。`)
  }

  if (est.man) {
    lines.push(`${occ.name_ja}の平均年収（男性${occ.avg_income_man}万円）をもとに算出すると、推定月額保険料の目安は${est.man.toLocaleString()}円前後です。`)
  } else {
    lines.push(`${occ.name_ja}の${ins.name_ja}保険料は収入に関わらず一定の水準となっています。`)
  }

  if (insight?.recommendedCoverage) {
    lines.push(`保険の専門家は「${insight.recommendedCoverage}」を推奨しています。`)
  } else {
    lines.push(`職業リスクと現在の社会保険の保障内容を確認した上で、不足分を補う形で加入を検討してください。`)
  }

  lines.push(`ただし実際の保険料は年齢・健康状態・保険会社・保障内容により大きく異なります。複数の保険会社で見積もりを取ることを強くおすすめします。`)

  return lines
}

const japanAverages: Record<string, number> = {
  medical: 3500,
  life: 6000,
  'income-protection': 4000,
  cancer: 3000,
  'whole-life': 8000,
  pension: 15000,
  auto: 5000,
  fire: 2000,
  'personal-accident': 1500,
  child: 7000,
}

const JUDGMENT_STYLES = {
  green:  { badge: 'bg-green-100 text-green-700',   bar: 'bg-green-500' },
  blue:   { badge: 'bg-blue-100 text-blue-700',     bar: 'bg-blue-500' },
  yellow: { badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' },
  orange: { badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
}

function getPriceJudgment(estimated: number, average: number) {
  const ratio = estimated / average
  if (ratio < 0.7) return { label: '平均より低め', color: 'green' as const, desc: '収入に対して標準的な水準です', ratio }
  if (ratio < 1.0) return { label: '平均的',       color: 'blue' as const,  desc: '日本人平均と同水準の目安です', ratio }
  if (ratio < 1.3) return { label: 'やや高め',      color: 'yellow' as const, desc: '収入が高い分、必要保障額も大きくなります', ratio }
  return { label: '高め', color: 'orange' as const, desc: '高収入職種のため保障ニーズが高い傾向があります', ratio }
}

function getAffiliateCTA(insurance: string): { primary: AffiliateKey; secondary: AffiliateKey | null } {
  if (insurance === 'cancer') {
    return { primary: 'babyplanetCancer', secondary: 'miraitecho' }
  }
  if (insurance === 'child') {
    return { primary: 'babyplanetMama', secondary: 'miraitecho' }
  }
  if (['life', 'medical', 'income-protection', 'whole-life', 'pension'].includes(insurance)) {
    return { primary: 'miraitecho', secondary: 'minnano' }
  }
  return { primary: 'miraitecho', secondary: null }
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
  const affiliateCta = getAffiliateCTA(ins.slug)
  const leadLines = generateLeadText(occ, ins, est)
  const avgMonthly = japanAverages[ins.slug] ?? null
  const priceJudgment = (est.man && avgMonthly) ? getPriceJudgment(est.man, avgMonthly) : null

  const isFixedRange = ins.slug === 'auto' || ins.slug === 'fire'
  const isFreelanceIncomeProtection = occ.slug === 'freelance-engineer' && ins.slug === 'income-protection'
  const isNurseIncomeProtection = occ.slug === 'nurse' && ins.slug === 'income-protection'
  const isConstructionMedical = occ.slug === 'construction' && ins.slug === 'medical'
  const isTeacherMedical = occ.slug === 'teacher' && ins.slug === 'medical'
  const isCivilServantLife = occ.slug === 'civil-servant' && ins.slug === 'life'
  const isEngineerIncomeProtection = occ.slug === 'engineer' && ins.slug === 'income-protection'
  const isDriverMedical = occ.slug === 'driver' && ins.slug === 'medical'
  const isDoctorLife = occ.slug === 'doctor' && ins.slug === 'life'
  const isSalesLife = occ.slug === 'sales' && ins.slug === 'life'
  const isPartTimeMedical = occ.slug === 'part-time' && ins.slug === 'medical'
  const isFreelanceEngineerMedical = occ.slug === 'freelance-engineer' && ins.slug === 'medical'
  const isNurseMedical = occ.slug === 'nurse' && ins.slug === 'medical'
  const isConstructionLife = occ.slug === 'construction' && ins.slug === 'life'
  const isTeacherLife = occ.slug === 'teacher' && ins.slug === 'life'
  const isCivilServantMedical = occ.slug === 'civil-servant' && ins.slug === 'medical'
  const isManagerLife = occ.slug === 'manager' && ins.slug === 'life'
  const isManufacturingMedical = occ.slug === 'manufacturing' && ins.slug === 'medical'
  const isBeauticianMedical = occ.slug === 'beautician' && ins.slug === 'medical'
  const isFinanceLife = occ.slug === 'finance' && ins.slug === 'life'
  const isDoctorIncomeProtection = occ.slug === 'doctor' && ins.slug === 'income-protection'
  const isNurseCancer = occ.slug === 'nurse' && ins.slug === 'cancer'
  const isEngineerMedical = occ.slug === 'engineer' && ins.slug === 'medical'
  const isCivilServantIncomeProtection = occ.slug === 'civil-servant' && ins.slug === 'income-protection'
  const isTeacherIncomeProtection = occ.slug === 'teacher' && ins.slug === 'income-protection'
  const isConstructionIncomeProtection = occ.slug === 'construction' && ins.slug === 'income-protection'
  const isSalesMedical = occ.slug === 'sales' && ins.slug === 'medical'
  const isDriverLife = occ.slug === 'driver' && ins.slug === 'life'
  const isDoctorCancer = occ.slug === 'doctor' && ins.slug === 'cancer'
  const isFreelanceEngineerLife = occ.slug === 'freelance-engineer' && ins.slug === 'life'
  const isManagerMedical = occ.slug === 'manager' && ins.slug === 'medical'
  const isPartTimeLife = occ.slug === 'part-time' && ins.slug === 'life'

  const cautionPoints = getCautionPoints(occ.category, ins.slug, occ.name_ja, ins.name_ja)

  // 年収別推定月額
  const incomeBracketRows = INCOME_BRACKETS.map(income => {
    const bracketEst = estimateMonthlyPremium(ins.slug, income, income)
    return { income, monthly: bracketEst.man ?? bracketEst.woman ?? null }
  })

  // グラフ用レートマップ
  const rateMap: Record<string, number | null> = {
    'medical':           0.005,
    'life':              0.01,
    'income-protection': 0.008,
    'cancer':            0.004,
    'auto':              null,
    'fire':              null,
    'personal-accident': 0.003,
    'pension':           0.02,
    'child':             0.015,
    'whole-life':        0.015,
  }
  const chartRate = rateMap[ins.slug] ?? null

  // BarChart用データ（年収別）
  const incomeChartData = isFixedRange ? [] : INCOME_BRACKETS.map(income => ({
    income: `${income}万`,
    man: chartRate ? Math.round(income * 10000 * chartRate / 12) : null,
    woman: chartRate ? Math.round(income * 10000 * chartRate / 12) : null,
  }))

  // LineChart用データ（年齢別）
  const ageChartData = isFixedRange ? [] : AGE_ROWS.map(row => ({
    age: row.age.replace('〜', '〜').replace('歳', ''),
    man: est.man ? Math.round(est.man * row.factor) : null,
    woman: est.woman ? Math.round(est.woman * row.factor) : null,
  }))

  // 国民平均年収との比較（参考値）
  const AVG_MAN = 540
  const AVG_WOMAN = 400
  const avgManMonthly = chartRate ? Math.round(AVG_MAN * 10000 * chartRate / 12) : null
  const avgWomanMonthly = chartRate ? Math.round(AVG_WOMAN * 10000 * chartRate / 12) : null
  const occManRatio = (est.man && avgManMonthly) ? Math.round(est.man / avgManMonthly * 100) : null
  const occWomanRatio = (est.woman && avgWomanMonthly) ? Math.round(est.woman / avgWomanMonthly * 100) : null

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
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] rounded-xl p-5 text-center text-white shadow-lg">
                  <p className="text-xs text-blue-300 mb-1">男性（年収{occ.avg_income_man || '-'}万円）</p>
                  <p className="text-3xl font-bold">
                    {est.man ? `${est.man.toLocaleString()}円` : '-'}
                  </p>
                  <p className="text-xs text-blue-200 mt-1">/ 月（推計参考値）</p>
                  {occManRatio && avgManMonthly && (
                    <div className="mt-3">
                      <p className="text-xs text-blue-300 mb-1">国民平均（{avgManMonthly.toLocaleString()}円）比</p>
                      <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-[#2563eb]"
                          style={{ width: `${Math.min(occManRatio, 200) / 2}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-200 mt-1 font-semibold">{occManRatio}%</p>
                    </div>
                  )}
                </div>
                <div className="bg-gradient-to-br from-[#0f172a] to-[#3d1d00] rounded-xl p-5 text-center text-white shadow-lg">
                  <p className="text-xs text-amber-300 mb-1">女性（年収{occ.avg_income_woman || '-'}万円）</p>
                  <p className="text-3xl font-bold">
                    {est.woman ? `${est.woman.toLocaleString()}円` : '-'}
                  </p>
                  <p className="text-xs text-amber-200 mt-1">/ 月（推計参考値）</p>
                  {occWomanRatio && avgWomanMonthly && (
                    <div className="mt-3">
                      <p className="text-xs text-amber-300 mb-1">国民平均（{avgWomanMonthly.toLocaleString()}円）比</p>
                      <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-[#f59e0b]"
                          style={{ width: `${Math.min(occWomanRatio, 200) / 2}%` }}
                        />
                      </div>
                      <p className="text-xs text-amber-200 mt-1 font-semibold">{occWomanRatio}%</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] rounded-xl p-5 text-center text-white shadow-lg">
                <p className="text-xs text-blue-300 mb-1">{ins.name_ja}（年収による変動なし）</p>
                <p className="text-3xl font-bold">月額 {est.label}</p>
                <p className="text-xs text-blue-200 mt-1">推計参考値</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">
            ※実際の保険料は年齢・健康状態・保険会社・保障内容により大きく異なります。必ず各保険会社で見積もりを取ってください。
          </p>
          <DataCalculationBadge
            occName={occ.name_ja}
            manIncome={occ.avg_income_man}
            womanIncome={occ.avg_income_woman}
            insName={ins.name_ja}
            insSlug={ins.slug}
            rate={chartRate}
          />
        </div>
      </section>

      {/* なぜ重要か（拡張リード文） */}
      <section className="py-10 px-4 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">
            {occ.name_ja}に{ins.name_ja}が重要な理由
          </h2>
          <div className="bg-white border-l-4 border-[#2563eb] rounded-r-xl p-5 text-gray-700 leading-relaxed space-y-2">
            {leadLines.map((line, i) => (
              <p key={i} className="text-sm">{line}</p>
            ))}
          </div>

          {/* この保険料は高い？安い？ */}
          {priceJudgment && avgMonthly && (
            <div className="bg-gray-50 rounded-xl p-5 mt-6 border border-gray-200">
              <div className="text-sm font-bold text-[#0f172a] mb-3">この保険料は高い？安い？</div>
              <div className="text-sm text-gray-500 mb-2">日本人平均（{avgMonthly.toLocaleString()}円）との比較</div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div
                    className={`h-3 rounded-full ${JUDGMENT_STYLES[priceJudgment.color].bar}`}
                    style={{ width: `${Math.min(priceJudgment.ratio * 50, 100)}%` }}
                  />
                  <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-gray-500" />
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ${JUDGMENT_STYLES[priceJudgment.color].badge}`}>
                  {priceJudgment.label}
                </span>
              </div>
              <p className="text-xs text-gray-600">{priceJudgment.desc}</p>
              <div className="text-xs text-gray-400 mt-2">
                出典：生命保険文化センター「生命保険に関する全国実態調査」2022年
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 年収別グラフ + テーブル */}
      <section className="py-10 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">年収別 推定月額保険料（参考値）</h2>
          <p className="text-xs text-gray-500 mb-6">
            ※年収が高いほど必要保障額が増えるため、保険料の目安も変化します。
          </p>
          <OccupationInsuranceCharts
            incomeData={incomeChartData}
            ageData={[]}
            hasFixed={isFixedRange}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="text-left p-3">年収</th>
                  <th className="text-right p-3">推定月額保険料</th>
                  <th className="text-right p-3">年間保険料目安</th>
                </tr>
              </thead>
              <tbody>
                {incomeBracketRows.map((row, i) => (
                  <tr key={row.income} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                    <td className="p-3 font-medium">{row.income}万円</td>
                    <td className="p-3 text-right font-semibold text-[#0f172a]">
                      {row.monthly ? `${row.monthly.toLocaleString()}円` : '-'}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {row.monthly ? `約${(row.monthly * 12).toLocaleString()}円` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            ※上記は年収を基に算出した参考値です。実際の保険料は年齢・健康状態・保障内容により大きく異なります。
          </p>
        </div>
      </section>

      {/* この保険に加入する際の注意点 */}
      <section className="py-10 px-4 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">
            {occ.name_ja}が{ins.name_ja}に加入する際の注意点
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            職業特性を踏まえた重要なチェックポイントです
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cautionPoints.map((point, i) => (
              <div key={i} className="bg-white border-l-4 border-blue-500 rounded-r-xl p-4 shadow-sm">
                <div className="text-blue-600 font-bold text-sm mb-1">チェック {i + 1}</div>
                <div className="text-gray-800 text-sm leading-relaxed">{point}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OccupationRiskDataSection occSlug={occ.slug} occName={occ.name_ja} />

      {/* 年齢別グラフ + テーブル */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">年齢別 推奨月額保険料（参考値）</h2>
          <p className="text-xs text-gray-500 mb-6">
            ※年齢とともに保険料は変動します。若いうちに加入するほど有利な場合が多いです。
          </p>
          <OccupationInsuranceCharts
            incomeData={[]}
            ageData={ageChartData}
            hasFixed={isFixedRange}
          />
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

      {/* フリーランスエンジニア×収入保障 専用コンテンツ */}
      {isFreelanceIncomeProtection && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* Section 1：リード文 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              フリーランスエンジニアに収入保障保険が必要な理由
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
              <p>
                フリーランスエンジニアは、病気やケガで働けなくなった瞬間、収入がゼロになります。会社員であれば傷病手当金（月収の約67%・最長18ヶ月）が支給されますが、国民健康保険には傷病手当金制度がありません。これがフリーランスエンジニアにとって就業不能保険・収入保障保険が「必須の備え」である根本的な理由です。
              </p>
              <p>
                厚生労働省の過労死等防止対策白書（2022年）によると、IT業種の精神障害労災申請件数は製造業の約2.3倍。うつ病・適応障害による長期休業リスクは、フリーランスエンジニアにとって決して他人事ではありません。月収50万円のエンジニアが3ヶ月働けなくなった場合の収入損失は150万円。この現実に備える手段が就業不能保険です。
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                <p className="font-bold text-red-800">⚠ 傷病手当金がないフリーランスの現実</p>
                <p className="text-red-700 text-sm mt-1">
                  会社員：病気で休業 → 傷病手当金（月収の67%）が最長18ヶ月支給<br />
                  フリーランス：病気で休業 → 収入ゼロ（公的補填なし）
                </p>
                <p className="text-xs text-red-600 mt-2">
                  出典：
                  <a href="https://www.kyoukaikenpo.or.jp/g3/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="underline">
                    全国健康保険協会「傷病手当金について」
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Section 2：公的制度比較表 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              会社員 vs フリーランスエンジニア：就業不能時の公的保障比較
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              就業不能保険の必要性を正確に判断するには、まず公的制度でどこまでカバーされるかを知る必要があります。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">項目</th>
                    <th className="text-center p-3">会社員・公務員</th>
                    <th className="text-center p-3">フリーランスエンジニア</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: '加入する健康保険', company: '健康保険（協会けんぽ・組合健保）', freelance: '国民健康保険' },
                    { item: '傷病手当金', company: '✅ あり（月収の約67%・最長18ヶ月）', freelance: '❌ なし' },
                    { item: '障害基礎年金', company: '✅ あり（2級：約81万円/年）', freelance: '✅ あり（同額）' },
                    { item: '障害厚生年金', company: '✅ あり（報酬比例・上乗せ）', freelance: '❌ なし（国民年金のみ）' },
                    { item: '有給休暇', company: '✅ あり（年10〜20日）', freelance: '❌ なし' },
                    { item: '労災保険', company: '✅ 自動加入', freelance: '△ 特別加入制度あり（任意）' },
                  ].map((row, i) => (
                    <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.item}</td>
                      <td className="p-3 text-center text-xs">{row.company}</td>
                      <td className="p-3 text-center text-xs font-semibold text-indigo-700">{row.freelance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：
              <a href="https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                日本年金機構「障害基礎年金の受給要件・支給開始時期・計算方法」
              </a>
              、
              <a href="https://www.kyoukaikenpo.or.jp/g3/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                全国健康保険協会「傷病手当金について」
              </a>
            </p>
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 text-sm">
              <strong>この表が示す通り、</strong>フリーランスエンジニアは就業不能時の公的保障が会社員と比べて著しく手薄です。特に傷病手当金がない点が最大のリスクであり、民間の就業不能保険でこのギャップを埋めることが急務です。
            </div>
          </section>

          {/* Section 3：リスク実態データ */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              フリーランスエンジニアが直面する就業不能リスクの実態
            </h2>
            <div className="space-y-6 text-sm text-gray-700">
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">① 精神疾患リスク：全業種の2.3倍</h3>
                <p className="leading-relaxed mb-2">
                  厚生労働省の「過労死等防止対策白書（2022年）」によると、情報通信業（IT業種）における精神障害の労災申請件数は製造業の約2.3倍に達しています。フリーランスエンジニアは孤独な作業環境・納期プレッシャー・収入の不安定さが重なり、精神疾患リスクが特に高い職種です。
                </p>
                <p className="leading-relaxed">
                  うつ病による休業期間の平均は約6ヶ月〜1年。月収50万円のエンジニアが6ヶ月休業した場合の収入損失は300万円。就業不能保険（月15万円給付）でも90万円しかカバーできず、差額210万円は貯蓄で賄う必要があります。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">② 案件途切れと傷病の複合リスク</h3>
                <p className="leading-relaxed">
                  内閣官房「フリーランス実態調査（2021年）」によると、フリーランスの54.1%が収入喪失を経験しており、そのうち健康問題が原因のケースは28.3%に上ります。病気と案件途切れが重なった場合、収入はゼロになります。これがフリーランスエンジニアにとっての最悪シナリオです。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">③ 腱鞘炎・頸椎症などの職業性疾患</h3>
                <p className="leading-relaxed">
                  長時間のキーボード・マウス操作による腱鞘炎・頸椎症・眼精疲労は、フリーランスエンジニアに多い職業性疾患です。手首の腱鞘炎で3ヶ月コーディング不能になるケースも珍しくなく、これらの疾患が就業不能保険の給付対象になるかどうかも重要な確認ポイントです。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：
              <a href="https://www.mhlw.go.jp/stf/wp/hakusyo/karoushi/22/index.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                厚生労働省「過労死等防止対策白書」2022年
              </a>
              、内閣官房「フリーランス実態調査」2021年
            </p>
          </section>

          {/* Section 4：必要保障額の計算方法 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              フリーランスエンジニアの適正な保障額の計算方法
            </h2>
            <p className="text-sm text-gray-700 mb-4">就業不能保険の適正な保障額は、以下の計算式で算出できます。</p>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 mb-6">
              <p className="font-bold text-blue-900 mb-2">必要保障額の計算式</p>
              <p className="text-blue-800 font-mono text-sm">月額給付金の目安 ＝ 月間固定支出（家賃・食費・通信費等）</p>
              <p className="text-blue-700 text-xs mt-2">※収入の全額ではなく「生活を維持するための最低限の固定費」が目安</p>
            </div>
            <h3 className="font-bold text-[#0f172a] mb-3">年収別の推奨月額給付金目安</h3>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">年収</th>
                    <th className="text-right p-3">月収</th>
                    <th className="text-right p-3">推奨月額給付金</th>
                    <th className="text-right p-3">年間保険料目安</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { income: '300万円', monthly: '25万円', benefit: '10〜15万円', premium: '約2〜4万円' },
                    { income: '500万円', monthly: '約42万円', benefit: '15〜20万円', premium: '約3〜6万円' },
                    { income: '700万円', monthly: '約58万円', benefit: '20〜25万円', premium: '約4〜8万円' },
                    { income: '1,000万円', monthly: '約83万円', benefit: '25〜30万円', premium: '約6〜10万円' },
                  ].map((row, i) => (
                    <tr key={row.income} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.income}</td>
                      <td className="p-3 text-right">{row.monthly}</td>
                      <td className="p-3 text-right font-bold text-[#2563eb]">{row.benefit}</td>
                      <td className="p-3 text-right text-gray-600">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              ※参考値。実際の保険料は年齢・健康状態・保険会社により異なります。
              出典：
              <a href="https://www.jili.or.jp/research/report/chousa2022.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                生命保険文化センター「生活保障に関する調査」2022年
              </a>
              をもとに算出
            </p>
          </section>

          {/* Section 5：選び方の5つのチェックポイント */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              フリーランスエンジニアが就業不能保険を選ぶ際の5つのチェックポイント
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  num: '01',
                  title: '精神疾患が給付対象か',
                  detail: 'フリーランスエンジニアの最大リスクである精神疾患（うつ病・適応障害）が給付対象かどうかを必ず確認してください。一部の保険では精神疾患を免責としていたり、給付回数に上限（例：通算18回まで）を設けています。精神疾患特約の有無と条件を契約前に確認することが必須です。',
                },
                {
                  num: '02',
                  title: '支払対象外期間の長さ',
                  detail: '支払対象外期間とは、就業不能状態になってから給付が始まるまでの待機期間です。60日・90日・180日などがあります。傷病手当金がないフリーランスは貯蓄が少ない場合60日以下の短期タイプが適切です。貯蓄が300万円以上なら180日タイプで保険料を抑える選択もあります。',
                },
                {
                  num: '03',
                  title: '就業不能の定義（全部か一部か）',
                  detail: '「全く働けない状態のみ給付」という全部就業不能型と、「収入が一定割合以下に減少した場合も給付」という一部就業不能型があります。在宅ワーカーのフリーランスエンジニアは「完全に動けないわけではないがコーディングできない状態」になりやすいため、定義の確認が重要です。',
                },
                {
                  num: '04',
                  title: '保険期間と保険料払込期間',
                  detail: '就業不能保険の保険期間は「60歳まで」「65歳まで」などがあります。フリーランスは定年がないため65歳満了を選ぶことを検討してください。また保険料は年齢が上がるほど高くなるため、若いうちに加入するほど総支払い保険料が少なくなります。',
                },
                {
                  num: '05',
                  title: '腱鞘炎・頸椎症などの職業性疾患の扱い',
                  detail: 'キーボード作業による腱鞘炎・頸椎症・眼精疲労などのフリーランスエンジニア特有の疾患が給付対象かどうかを確認してください。「業務上の疾病」扱いになる場合、労災保険の特別加入を検討することも有効な選択肢です。',
                },
              ].map(cp => (
                <div key={cp.num} className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl font-bold text-[#2563eb] opacity-40 leading-none flex-shrink-0">{cp.num}</span>
                    <p className="font-bold text-[#0f172a] text-sm">{cp.title}</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{cp.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6：よくある失敗事例 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              フリーランスエンジニアの就業不能保険でよくある失敗事例3選
            </h2>
            <div className="space-y-4 text-sm">
              {[
                {
                  title: '失敗①：精神疾患が免責の保険を選んでしまった',
                  situation: '30代男性フリーランスエンジニア。月収60万円。',
                  problem: '保険料の安さだけで就業不能保険を選んだ結果、契約した保険は精神疾患を免責としていた。過労によるうつ病で6ヶ月休業したが、給付金がゼロ。貯蓄も底をつき家賃滞納に陥った。',
                  lesson: '保険料の安さだけでなく、精神疾患の給付条件を最初に確認すること。',
                },
                {
                  title: '失敗②：支払対象外期間180日で貯蓄が底をつく',
                  situation: '20代後半のフリーランスエンジニア。貯蓄100万円。',
                  problem: '保険料を抑えるため支払対象外期間180日のプランを選択。突発的な骨折で4ヶ月休業したが、180日（約6ヶ月）に達しないため給付金ゼロ。貯蓄が尽きた。',
                  lesson: '貯蓄額に応じて支払対象外期間を選ぶこと。貯蓄300万円未満なら60〜90日タイプ推奨。',
                },
                {
                  title: '失敗③：保障額が生活費を下回っていた',
                  situation: '月収70万円のフリーランスエンジニア。',
                  problem: '月額給付金10万円の保険に加入していたが、家賃8万円・食費3万円・通信費2万円だけで月13万円の固定費があり、給付金では生活費を賄えなかった。',
                  lesson: '月額給付金は「月間固定支出（最低生活費）」を基準に設定すること。',
                },
              ].map(c => (
                <div key={c.title} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 mb-2">{c.title}</p>
                  <div className="space-y-1 text-gray-700">
                    <p><span className="font-semibold text-gray-500">状況：</span>{c.situation}</p>
                    <p><span className="font-semibold text-gray-500">問題：</span>{c.problem}</p>
                    <p className="bg-white rounded-lg px-3 py-2 border border-red-100 mt-2">
                      <span className="font-bold text-red-700">教訓：</span>{c.lesson}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 7：フリーランス協会の選択肢 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              民間保険以外の選択肢：フリーランス協会の所得補償保険
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed space-y-4">
              <p>
                民間の就業不能保険以外に、一般社団法人プロフェッショナル＆パラレルキャリア・フリーランス協会（フリーランス協会）が提供する福利厚生パッケージも選択肢の一つです。
              </p>
              <p>
                年会費1万円で加入できるフリーランス協会のベネフィットパッケージには、所得補償保険（最長1年間・入院・自宅療養を問わず補償）が含まれています。民間の就業不能保険と比較して手続きがシンプルで、独立直後の若いフリーランスエンジニアにも加入しやすい点が特徴です。
              </p>
              <p>
                ただし補償期間や給付額に上限があるため、高収入のエンジニアには民間保険との併用を検討することも重要です。
              </p>
              <div className="bg-[#f8fafc] rounded-xl p-4 border border-gray-200">
                <p className="font-bold text-[#0f172a] mb-2">フリーランス協会 vs 民間就業不能保険の比較</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-2">項目</th>
                        <th className="text-center p-2">フリーランス協会</th>
                        <th className="text-center p-2">民間就業不能保険</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { item: '費用', assoc: '年会費1万円に含む', private: '月2,000〜10,000円' },
                        { item: '補償期間', assoc: '最長1年', private: '最長65歳まで' },
                        { item: '自宅療養', assoc: '✅ 対象', private: '商品による' },
                        { item: '精神疾患', assoc: '商品による', private: '特約で選べる' },
                        { item: '手続き', assoc: 'シンプル', private: '審査あり（健康告知）' },
                      ].map((r, i) => (
                        <tr key={r.item} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2 font-medium">{r.item}</td>
                          <td className="p-2 text-center">{r.assoc}</td>
                          <td className="p-2 text-center">{r.private}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                出典：一般社団法人プロフェッショナル＆パラレルキャリア・フリーランス協会「フリーランス協会ベネフィットパッケージ」
              </p>
            </div>
          </section>

          {/* Section 8：最終チェックリスト */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              フリーランスエンジニアの就業不能保険：加入前の最終確認リスト
            </h2>
            <div className="space-y-2">
              {[
                '傷病手当金がないことを認識し、就業不能時の収入ゼロリスクを把握した',
                '月間固定支出（最低生活費）を計算し、必要な月額給付金を算出した',
                '精神疾患（うつ病・適応障害）が給付対象かどうかを確認した',
                '支払対象外期間を自分の貯蓄額に合わせて選んだ（貯蓄300万円未満は60〜90日推奨）',
                '就業不能の定義（全部就業不能・一部就業不能）を確認した',
                '複数の保険会社で見積もりを比較した',
                'フリーランス協会の所得補償保険も選択肢として検討した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="text-[#2563eb] font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 看護師×収入保障 専用コンテンツ */}
      {isNurseIncomeProtection && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* Section 1：リード文 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              看護師に就業不能保険が必要な理由
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
              <p>
                看護師は医療の最前線で働く専門職ですが、その職業特性ゆえに就業不能リスクが極めて高い職種です。腰痛・針刺し事故・精神的バーンアウト・感染症罹患など、看護師特有のリスクで長期休業を余儀なくされるケースは珍しくありません。
              </p>
              <p>
                日本看護協会の調査（2022年）によると、看護師の離職理由の第2位は「精神的健康問題（21.3%）」。また腰痛有病率は約82%と、業務上疾病の第1位となっています。これらのリスクに対して、就業不能保険でしっかり備えることが重要です。
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                <p className="font-bold text-blue-800">💡 看護師が保険を考える際の重要な前提</p>
                <p className="text-blue-700 text-sm mt-1">
                  病院・クリニック勤務の看護師は会社員と同じ健康保険に加入しており、傷病手当金（月収の約67%・最長18ヶ月）が支給されます。ただし看護師特有のリスク（腰痛・精神疾患・感染症）で長期休業になった場合、18ヶ月を超える補償が民間保険で必要になります。
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  出典：
                  <a href="https://www.kyoukaikenpo.or.jp/g3/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="underline">
                    全国健康保険協会「傷病手当金について」
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Section 2：公的保障と民間保険の役割分担 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              看護師の公的保障と民間保険の役割分担
            </h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">項目</th>
                    <th className="text-center p-3">看護師（病院勤務）</th>
                    <th className="text-center p-3">看護師（訪問看護・個人事業主）</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: '加入する健康保険', hospital: '健康保険（協会けんぽ・組合健保）', freelance: '国民健康保険' },
                    { item: '傷病手当金', hospital: '✅ あり（月収の約67%・最長18ヶ月）', freelance: '❌ なし' },
                    { item: '労災保険', hospital: '✅ 自動加入（針刺し事故・腰痛も対象）', freelance: '△ 特別加入制度あり（任意）' },
                    { item: '看護師賠償責任保険', hospital: '病院側が加入している場合あり（要確認）', freelance: '個人での加入を強く推奨' },
                    { item: '18ヶ月以降の収入補償', hospital: '❌ 公的保障なし→民間保険が必要', freelance: '❌ 公的保障なし→民間保険が必要' },
                  ].map((row, i) => (
                    <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.item}</td>
                      <td className="p-3 text-center text-xs">{row.hospital}</td>
                      <td className="p-3 text-center text-xs font-semibold text-indigo-700">{row.freelance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              出典：
              <a href="https://www.kyoukaikenpo.or.jp/g3/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                全国健康保険協会「傷病手当金について」
              </a>
              、
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/index.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                厚生労働省「労働者災害補償保険法」
              </a>
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 text-sm">
              病院勤務の看護師は傷病手当金があるため、フリーランスエンジニアほど緊急性は高くありません。しかし腰痛や精神疾患による長期休業（18ヶ月超）のリスクを考えると、就業不能保険で長期の備えを持つことが重要です。
            </div>
          </section>

          {/* Section 3：リスク実態データ */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              看護師が直面する就業不能リスクの実態（政府統計）
            </h2>
            <div className="space-y-6 text-sm text-gray-700">
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">① 腰痛：業務上疾病の第1位・有病率82%</h3>
                <p className="leading-relaxed">
                  厚生労働省の労働安全衛生調査（2022年）によると、看護師の腰痛有病率は約82%。患者の移乗・体位変換・長時間立位による腰椎への負荷が主な原因です。重症化すると手術が必要になり、復職まで数ヶ月〜1年以上かかるケースもあります。腰痛が労働災害と認定されれば労災保険が適用されますが、認定要件は厳格で、日常的な腰痛は自己負担となるケースが多いです。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">② 精神疾患・バーンアウト：離職理由第2位</h3>
                <p className="leading-relaxed">
                  日本看護協会の「看護職員実態調査（2022年）」によると、看護師の離職理由の第2位は精神的健康問題（21.3%）です。夜勤による睡眠障害・患者死亡によるグリーフ・医療過誤への恐怖など、精神的ストレスが蓄積しやすい職場環境が背景にあります。精神疾患による休業期間は平均6ヶ月〜1年。就業不能保険の精神疾患特約の有無が重要な選択基準となります。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">③ 針刺し事故：年間約6万件・感染リスク</h3>
                <p className="leading-relaxed">
                  日本環境感染学会の調査（2021年）によると、医療従事者の針刺し・切創事故は年間約6万件で、そのうち看護師が約60%を占めています。B型肝炎・C型肝炎・HIVなどへの感染リスクがあり、感染が判明した場合は長期の治療・休業が必要になります。これらは労災認定される可能性がありますが、認定されない場合の備えとして民間保険が重要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">④ 夜勤によるがん・生活習慣病リスク</h3>
                <p className="leading-relaxed">
                  国立がん研究センターの多目的コホート研究（2021年）によると、夜勤従事者の乳がん発症リスクは日勤のみの女性と比較して約1.3倍。看護師は女性が多く夜勤が多い職種であるため、がん保険との組み合わせも重要な検討事項です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：
              <a href="https://www.mhlw.go.jp/toukei/list/h24-46-50.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                厚生労働省「労働安全衛生調査」2022年
              </a>
              、日本看護協会「看護職員実態調査」2022年、日本環境感染学会「針刺し・切創実態調査」2021年、
              <a href="https://epi.ncc.go.jp/jphc/" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                国立がん研究センター「多目的コホート研究」2021年
              </a>
            </p>
          </section>

          {/* Section 4：賠償責任保険との違い */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              看護師が保険を調べる際に注意：「就業不能保険」と「賠償責任保険」は全く別物
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
              <p className="font-bold text-amber-800 mb-2">⚠ 看護師が「医療保険」「収入保障保険」で検索すると...</p>
              <p className="text-amber-700 text-sm">
                検索結果に「看護職賠償責任保険」が多く表示されることがあります。これは医療過誤・対物賠償に備えるための損害保険であり、このページで解説している「自分が病気・ケガで働けなくなった時の収入補償」とは全く異なる保険です。混同しないようにご注意ください。
              </p>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">保険の種類</th>
                    <th className="text-left p-3">何に備えるか</th>
                    <th className="text-left p-3">必要性</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: '就業不能保険（本ページ）', purpose: '自分が病気・ケガで働けなくなった時の収入損失', need: '長期休業リスクへの備え' },
                    { type: '医療保険', purpose: '入院・手術費用の補填', need: '高額医療費への備え' },
                    { type: '看護職賠償責任保険', purpose: '医療過誤・患者への損害賠償', need: '業務上のミスへの法的保護' },
                  ].map((row, i) => (
                    <tr key={row.type} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium text-[#2563eb]">{row.type}</td>
                      <td className="p-3 text-xs">{row.purpose}</td>
                      <td className="p-3 text-xs text-gray-600">{row.need}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              看護職賠償責任保険は日本看護協会が年間1,580円（月132円〜）で提供しており、看護師であれば加入を強く推奨します。ただしこれは就業不能保険の代替にはなりません。両方の保険を目的別に加入することが重要です。
            </p>
          </section>

          {/* Section 5：必要保障額の計算方法 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              看護師の就業不能保険：適正な保障額の計算方法
            </h2>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 mb-5">
              <p className="font-bold text-blue-900 mb-2">看護師の必要保障額の考え方</p>
              <p className="text-blue-800 text-sm leading-relaxed">
                傷病手当金（月収の約67%・最長18ヶ月）がある病院勤務の場合、就業不能保険で補うべきは「18ヶ月以降の収入」です。月収の33%（傷病手当金でカバーされない分）＋生活費不足分が目安。
              </p>
            </div>
            <h3 className="font-bold text-[#0f172a] mb-3">看護師の年収別・推奨月額給付金目安</h3>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">年収</th>
                    <th className="text-right p-3">月収</th>
                    <th className="text-right p-3">傷病手当金（月収67%）</th>
                    <th className="text-right p-3">推奨月額給付金</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { income: '350万円', monthly: '約29万円', benefit: '約19万円', recommend: '10〜15万円' },
                    { income: '450万円', monthly: '約38万円', benefit: '約25万円', recommend: '15〜20万円' },
                    { income: '550万円', monthly: '約46万円', benefit: '約31万円', recommend: '15〜20万円' },
                    { income: '700万円', monthly: '約58万円', benefit: '約39万円', recommend: '20〜25万円' },
                  ].map((row, i) => (
                    <tr key={row.income} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.income}</td>
                      <td className="p-3 text-right">{row.monthly}</td>
                      <td className="p-3 text-right text-gray-500">{row.benefit}</td>
                      <td className="p-3 text-right font-bold text-[#2563eb]">{row.recommend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              ※参考値。実際の保険料は年齢・健康状態・保険会社により異なります。出典：
              <a href="https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2023/index.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                厚生労働省「賃金構造基本統計調査」2023年
              </a>
            </p>
          </section>

          {/* Section 6：5つのチェックポイント */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              看護師が就業不能保険を選ぶ際の5つのチェックポイント
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  num: '01',
                  title: '精神疾患・バーンアウトが給付対象か',
                  detail: '看護師の離職理由第2位が精神的健康問題（21.3%）であることを踏まえ、うつ病・適応障害・バーンアウトが給付対象かどうかを必ず確認してください。精神疾患を免責としている保険や、給付回数に上限がある保険は看護師にとってリスクが高いです。',
                },
                {
                  num: '02',
                  title: '腰痛・筋骨格系疾患が給付対象か',
                  detail: '有病率82%の腰痛が就業不能保険の給付対象になるかどうかを確認してください。「業務上の腰痛」は労災認定される可能性がありますが、認定されない慢性腰痛の場合は民間保険が頼りになります。椎間板ヘルニア・腰椎すべり症なども対象かどうか約款を確認しましょう。',
                },
                {
                  num: '03',
                  title: '夜勤手当込みの収入で保障額を設定できるか',
                  detail: '看護師は夜勤手当・残業手当によって基本給よりも実収入が高いケースがあります。就業不能保険の保障額は「直近12ヶ月の平均月収」を基準とする保険が多いため、夜勤手当込みの実収入を基準に設定できるかどうかを確認してください。',
                },
                {
                  num: '04',
                  title: '針刺し事故による感染症が給付対象か',
                  detail: 'B型肝炎・C型肝炎などへの感染が判明した場合、治療期間中の収入補償が就業不能保険で受けられるかどうかを確認してください。労災認定されれば労災保険が優先されますが、認定されない場合の備えとして重要です。',
                },
                {
                  num: '05',
                  title: '傷病手当金との調整条項があるか',
                  detail: '一部の就業不能保険では、傷病手当金と併給する場合に保険金が減額される「調整条項」があります。病院勤務の看護師は傷病手当金があるため、調整条項の有無と内容を契約前に必ず確認してください。',
                },
              ].map(cp => (
                <div key={cp.num} className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl font-bold text-[#2563eb] opacity-40 leading-none flex-shrink-0">{cp.num}</span>
                    <p className="font-bold text-[#0f172a] text-sm">{cp.title}</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{cp.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 7：よくある失敗事例 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              看護師の就業不能保険でよくある失敗事例3選
            </h2>
            <div className="space-y-4 text-sm">
              {[
                {
                  title: '失敗①：腰痛が免責になっていた',
                  situation: '30代女性看護師。病棟勤務10年。',
                  problem: '患者の移乗作業で腰椎椎間板ヘルニアを発症。3ヶ月休業したが、加入していた就業不能保険の約款に「業務上の腰痛は給付対象外」の条項があり、給付金がゼロだった。',
                  lesson: '腰痛・筋骨格系疾患の給付条件を契約前に必ず約款で確認すること。',
                },
                {
                  title: '失敗②：精神疾患特約をつけていなかった',
                  situation: '20代女性看護師。ICU勤務。',
                  problem: '患者の急変が続き、PTSDと診断されて6ヶ月休業。しかし加入していた就業不能保険は精神疾患特約なしのプランで、給付を受けられなかった。',
                  lesson: '看護師はICU・救急・精神科勤務ほど精神疾患リスクが高い。精神疾患特約は必須。',
                },
                {
                  title: '失敗③：傷病手当金との調整で給付額が半減',
                  situation: '40代女性看護師。月収45万円（夜勤手当込み）。',
                  problem: '腰椎手術で4ヶ月休業。傷病手当金（月約30万円）があったが、就業不能保険の調整条項により保険金が月10万円から月3万円に減額された。',
                  lesson: '傷病手当金との調整条項を事前に確認し、調整後でも生活費を賄える保障額を設定すること。',
                },
              ].map(c => (
                <div key={c.title} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 mb-2">{c.title}</p>
                  <div className="space-y-1 text-gray-700">
                    <p><span className="font-semibold text-gray-500">状況：</span>{c.situation}</p>
                    <p><span className="font-semibold text-gray-500">問題：</span>{c.problem}</p>
                    <p className="bg-white rounded-lg px-3 py-2 border border-red-100 mt-2">
                      <span className="font-bold text-red-700">教訓：</span>{c.lesson}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 8：最終チェックリスト */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              看護師の就業不能保険：加入前の最終確認リスト
            </h2>
            <div className="space-y-2">
              {[
                '傷病手当金（最長18ヶ月）の支給額と支給条件を確認した',
                '18ヶ月以降の収入補償として就業不能保険の必要性を把握した',
                '精神疾患・バーンアウトが給付対象かどうかを確認した',
                '腰痛・筋骨格系疾患の給付条件を約款で確認した',
                '夜勤手当込みの実収入を基準に保障額を設定した',
                '傷病手当金との調整条項の有無を確認した',
                '看護職賠償責任保険（日本看護協会・年1,580円）との違いを理解した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="text-[#2563eb] font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 建設業×医療保険 専用コンテンツ */}
      {isConstructionMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* Section 1：リード文 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              建設業・現場作業員に医療保険が必要な理由
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
              <p>
                建設業は全産業の中で最も死亡労働災害が多い業種の一つです。厚生労働省の「労働災害発生状況（2023年）」によると、建設業の死亡災害は全産業の約30%を占め、休業4日以上の労働災害発生率は全産業平均の約3.5倍に達します。現場での骨折・転落・熱中症・じん肺など、建設業特有のリスクに備えるための医療保険選びには特別な注意が必要です。
              </p>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                <p className="font-bold text-orange-800">⚠ 建設業の医療保険で最も重要な前提</p>
                <p className="text-orange-700 text-sm mt-1">
                  建設業では労働災害（労災）が発生した場合、労災保険が優先適用されます。しかし労災認定されない場合（私傷病・通勤外事故等）や、労災では補填されない差額ベッド代・食事代・生活費などは民間の医療保険が必要です。労災保険と民間医療保険の役割分担を正しく理解することが重要です。
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  出典：
                  <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/rousaihoken06.html" target="_blank" rel="noopener noreferrer" className="underline">
                    厚生労働省「労働災害発生状況」2023年
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Section 2：労災保険と民間医療保険の役割分担 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              労災保険と民間医療保険の役割分担
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              建設業の方が医療保険を選ぶ前に、労災保険でカバーされる範囲を正確に把握することが重要です。
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">費用の種類</th>
                    <th className="text-center p-3">労災保険</th>
                    <th className="text-center p-3">民間医療保険</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: '業務中の怪我・治療費', rousai: '✅ 全額補償（自己負担ゼロ）', private: '△ 労災認定後の差額のみ' },
                    { item: '通勤中の怪我', rousai: '✅ 通勤災害として補償', private: '△ 補完的' },
                    { item: '私傷病（業務外の病気）', rousai: '❌ 対象外', private: '✅ 主な給付対象' },
                    { item: '差額ベッド代', rousai: '❌ 対象外', private: '✅ 特約で補償可能' },
                    { item: '休業中の収入補填', rousai: '✅ 休業補償給付（給付基礎日額の80%）', private: '✅ 就業不能保険で補完' },
                    { item: 'じん肺・職業性疾患', rousai: '✅ 職業病として補償（認定要件あり）', private: '△ 認定されない場合は民間保険' },
                  ].map((row, i) => (
                    <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.item}</td>
                      <td className="p-3 text-center text-xs">{row.rousai}</td>
                      <td className="p-3 text-center text-xs font-semibold text-[#2563eb]">{row.private}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              出典：
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/index.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                厚生労働省「労働者災害補償保険法」
              </a>
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4 text-sm">
              建設業の方にとって民間医療保険が特に重要なのは、「私傷病（業務外の病気）」への備えです。がん・心疾患・脳血管疾患などの重大疾病は労災対象外であり、これらへの備えが民間医療保険の主な役割となります。
            </div>
          </section>

          {/* Section 3：リスクデータ */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              建設業・現場作業員が直面する健康リスクの実態（政府統計）
            </h2>
            <div className="space-y-6 text-sm text-gray-700">
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">① 死亡・重傷災害：全産業の約30%</h3>
                <p className="leading-relaxed">
                  厚生労働省「労働災害発生状況（2023年）」によると、建設業の死亡災害件数は全産業の約30%を占め、製造業（約20%）を大幅に上回ります。主な死亡原因は「墜落・転落（約40%）」「建設機械等（約15%）」。重傷を負った場合、長期入院・手術・リハビリが必要となり、医療費と収入損失が家計に直撃します。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">② 腰痛・骨折：労災第1位の疾病</h3>
                <p className="leading-relaxed">
                  厚生労働省「業務上疾病発生状況（2022年）」によると、建設業の業務上疾病の第1位は「腰痛」で、重量物の取り扱いや不自然な姿勢による腰椎への慢性的な負荷が原因です。また転落・落下物による骨折も多く、骨折の平均入院日数は約35日（厚生労働省「患者調査」2022年）と長期になりがちです。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">③ 熱中症：建設業が全産業の約25%</h3>
                <p className="leading-relaxed">
                  厚生労働省「職場における熱中症による死傷災害の発生状況（2023年）」によると、熱中症による死傷者のうち建設業が全産業の約25%を占め、屋外での長時間作業が主な原因です。重篤な熱中症は入院・集中治療が必要で、後遺症が残るケースもあります。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">④ じん肺・石綿関連疾患：長期潜伏リスク</h3>
                <p className="leading-relaxed">
                  建設業のじん肺（けい肺・石綿肺）は、粉塵を長期間吸入することで発症する職業性疾患です。厚生労働省「じん肺健康管理実施状況報告（2022年）」によると、建設業のじん肺有所見者率は他業種の約5倍。アスベスト（石綿）関連疾患（中皮腫・肺がん）は20〜40年の潜伏期間があり、退職後に発症するケースも多いです。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/rousaihoken06.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                厚生労働省「労働災害発生状況」2023年
              </a>
              、厚生労働省「業務上疾病発生状況」2022年、厚生労働省「職場における熱中症による死傷災害の発生状況」2023年、厚生労働省「じん肺健康管理実施状況報告」2022年
            </p>
          </section>

          {/* Section 4：一人親方 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              一人親方・個人事業主の建設業者は医療保険が特に重要
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5">
              <p className="font-bold text-red-800 mb-2">🔴 一人親方が知っておくべき重要な事実</p>
              <ul className="text-red-700 text-sm space-y-1.5">
                <li>❌ 傷病手当金なし（国民健康保険のため）</li>
                <li>❌ 有給休暇なし</li>
                <li>△ 労災保険：特別加入制度あり（任意・年間保険料約1〜3万円）</li>
                <li>❌ 労災特別加入なしの場合、業務中の怪我も自己負担</li>
              </ul>
              <p className="text-xs text-red-600 mt-2">
                出典：
                <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/dl/hokenryou02.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                  厚生労働省「一人親方等の特別加入」
                </a>
              </p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              一人親方は労災保険の「特別加入制度」に任意で加入できますが、未加入の場合は業務中の怪我も自己負担になります。また傷病手当金がないため、病気・怪我で働けない期間の収入は完全にゼロになります。医療保険に加えて就業不能保険への加入も強く検討することをお勧めします。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">項目</th>
                    <th className="text-center p-3">会社員建設業者</th>
                    <th className="text-center p-3">一人親方（個人事業主）</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: '健康保険', company: '健康保険（協会けんぽ）', hitori: '国民健康保険' },
                    { item: '傷病手当金', company: '✅ あり（月収67%・最長18ヶ月）', hitori: '❌ なし' },
                    { item: '労災保険', company: '✅ 自動加入', hitori: '△ 特別加入（任意・年1〜3万円）' },
                    { item: '業務中の怪我', company: '✅ 労災保険適用', hitori: '特別加入なし→❌ 全額自己負担' },
                  ].map((row, i) => (
                    <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.item}</td>
                      <td className="p-3 text-center text-xs">{row.company}</td>
                      <td className="p-3 text-center text-xs font-semibold text-red-700">{row.hitori}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5：5つのチェックポイント */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              建設業の医療保険選び5つのチェックポイント
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  num: '01',
                  title: '労災保険との重複・調整を確認する',
                  detail: '業務中の怪我は労災保険が優先されます。民間医療保険と労災保険が重複した場合の調整条項を確認してください。一般的に民間医療保険は労災保険と重複しても給付されますが、保険会社によって異なります。',
                },
                {
                  num: '02',
                  title: '骨折・外傷の入院日額が十分か',
                  detail: '建設業は骨折・外傷による長期入院リスクが高いです。骨折の平均入院日数は約35日のため、入院日額5,000円の場合17.5万円の給付になります。差額ベッド代・食事代・収入損失を考慮すると、入院日額1万円以上が推奨されます。',
                },
                {
                  num: '03',
                  title: 'じん肺・職業性疾患が給付対象か',
                  detail: 'じん肺・石綿肺などの職業性疾患が民間医療保険の給付対象になるかどうかを確認してください。労災認定された場合は労災保険が適用されますが、認定要件を満たさない場合や認定までの期間中は民間保険が頼りになります。',
                },
                {
                  num: '04',
                  title: '熱中症が給付対象か',
                  detail: '熱中症による入院が医療保険の給付対象になるかどうかを確認してください。業務中の熱中症は労災認定される可能性がありますが、プライベート中の熱中症は民間医療保険の対象となります。先進医療特約の内容も確認しましょう。',
                },
                {
                  num: '05',
                  title: '一人親方は就業不能保険との組み合わせを検討',
                  detail: '一人親方は傷病手当金がないため、医療保険だけでなく就業不能保険との組み合わせが重要です。労災保険の特別加入（年1〜3万円）も合わせて検討することで、業務中・業務外両方のリスクを効率的にカバーできます。',
                },
              ].map(cp => (
                <div key={cp.num} className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl font-bold text-[#2563eb] opacity-40 leading-none flex-shrink-0">{cp.num}</span>
                    <p className="font-bold text-[#0f172a] text-sm">{cp.title}</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{cp.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6：よくある失敗事例 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              建設業の医療保険でよくある失敗事例3選
            </h2>
            <div className="space-y-4 text-sm">
              {[
                {
                  title: '失敗①：労災認定されず医療費が全額自己負担',
                  situation: '40代男性・一人親方・建設業。労災保険特別加入なし。',
                  problem: '足場作業中に転落して腰椎骨折。入院費・手術費で約150万円。労災保険特別加入をしていなかったため全額自己負担。貯蓄が底をつき、治療を中断する事態に。',
                  lesson: '一人親方は労災保険の特別加入（年1〜3万円）と民間医療保険の両方に加入すること。',
                },
                {
                  title: '失敗②：じん肺が既往症として告知義務違反になった',
                  situation: '50代男性・建設業20年以上のベテラン職人。',
                  problem: '医療保険に加入する際、健康診断でじん肺の疑いを指摘されていたにもかかわらず告知しなかった。後にじん肺と確定診断されたが、告知義務違反として保険を解除された。',
                  lesson: 'じん肺の疑いがある場合は必ず告知すること。既往症があっても引受可能な保険を専門家に相談する。',
                },
                {
                  title: '失敗③：入院日額が低すぎて生活費を賄えなかった',
                  situation: '30代男性・建設会社勤務。月収35万円。',
                  problem: '転落事故による骨折で40日間入院。入院日額3,000円の医療保険では給付金12万円。差額ベッド代・食事代・収入減少分を合わせると実際の損失は50万円を超え、大幅な不足が生じた。',
                  lesson: '建設業は入院が長期化するリスクが高い。入院日額は最低でも1万円以上を目安に設定すること。',
                },
              ].map(c => (
                <div key={c.title} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 mb-2">{c.title}</p>
                  <div className="space-y-1 text-gray-700">
                    <p><span className="font-semibold text-gray-500">状況：</span>{c.situation}</p>
                    <p><span className="font-semibold text-gray-500">問題：</span>{c.problem}</p>
                    <p className="bg-white rounded-lg px-3 py-2 border border-red-100 mt-2">
                      <span className="font-bold text-red-700">教訓：</span>{c.lesson}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 7：最終チェックリスト */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              建設業の医療保険：加入前の最終確認リスト
            </h2>
            <div className="space-y-2">
              {[
                '労災保険（会社加入または一人親方特別加入）の適用範囲を確認した',
                '傷病手当金の有無（会社員か一人親方か）を確認した',
                '骨折・外傷に備えて入院日額1万円以上を確保した',
                'じん肺・職業性疾患の告知義務と給付条件を確認した',
                '熱中症・高所作業特有のリスクへの備えを確認した',
                '一人親方の場合は就業不能保険との組み合わせを検討した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="text-[#2563eb] font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 教員×医療保険 専用コンテンツ */}
      {isTeacherMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* Section 1：リード文 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              教員・教師に医療保険が必要な理由
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
              <p>
                教員は公務員として手厚い共済制度を持つ一方、精神疾患による休職者数が2022年度に過去最多を更新するなど、メンタルヘルスリスクが極めて深刻な職種です。文部科学省の調査によると、公立学校教員の精神疾患休職者数は2022年度に6,539人（過去最多）に達し、教員全体の0.71%が精神疾患で休職しています。
              </p>
              <p>
                教員特有の長時間労働（中学校教諭の時間外勤務月平均58時間）、保護者対応のストレス、部活動指導の負担が精神疾患・燃え尽き症候群のリスクを高めています。また声帯ポリープ・腰痛などの職業性疾患も多く、これらへの備えとして医療保険の重要性を正しく理解することが必要です。
              </p>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl">
                <p className="font-bold text-purple-800">💡 教員が医療保険を考える際の重要な前提</p>
                <p className="text-purple-700 text-sm mt-1">
                  公立学校の教員は文部科学省共済組合・各都道府県の共済組合に加入しており、傷病手当金・長期給付など手厚い保障があります。私立学校の教員は私学共済または健康保険（協会けんぽ）に加入します。民間医療保険は「共済でカバーできない部分」を補う役割です。
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  出典：
                  <a href="https://www.mext.go.jp/a_menu/shotou/kyoin/1287948.htm" target="_blank" rel="noopener noreferrer" className="underline">
                    文部科学省「公立学校共済組合について」
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Section 2：共済と民間保険の役割分担 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              教員の共済制度と民間医療保険の役割分担
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              教員が民間の医療保険を検討する前に、共済制度の保障内容を正確に把握することが重要です。共済制度は一般の会社員よりも手厚い部分がありますが、カバーしきれない部分も存在します。
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">項目</th>
                    <th className="text-center p-3">公立学校教員（共済組合）</th>
                    <th className="text-center p-3">私立学校教員（私学共済）</th>
                    <th className="text-center p-3">民間保険で補う部分</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: '医療費自己負担', public: '3割（高額療養費制度あり）', private: '3割（高額療養費制度あり）', supplement: '差額ベッド代・先進医療費用' },
                    { item: '傷病手当金', public: '✅ 月収の80%・最長1年6ヶ月', private: '✅ 月収の67%・最長1年6ヶ月', supplement: '18ヶ月超の長期休業時の補填' },
                    { item: '休職中の給与', public: '✅ 1年目100%、2年目80%', private: '学校による', supplement: '給与減額分の補填' },
                    { item: '精神疾患での休職', public: '✅ 対象（休職給与あり）', private: '✅ 対象', supplement: '復職後の治療費・再発リスク' },
                    { item: '先進医療', public: '❌ 対象外', private: '❌ 対象外', supplement: '✅ 民間保険の先進医療特約' },
                  ].map((row, i) => (
                    <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.item}</td>
                      <td className="p-3 text-center text-xs">{row.public}</td>
                      <td className="p-3 text-center text-xs">{row.private}</td>
                      <td className="p-3 text-center text-xs font-semibold text-[#2563eb]">{row.supplement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              出典：
              <a href="https://www.mext.go.jp/a_menu/shotou/kyoin/1287948.htm" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                文部科学省共済組合「給付の概要」
              </a>
              、
              <a href="https://www.shigakukyosai.jp/kyuufu/tanki/index.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                私立学校教職員共済「短期給付について」
              </a>
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-4 text-sm">
              公立教員の場合、休職1年目は給与が100%支給されるため、短期的な医療費の心配は少ないです。ただし休職が長期化した場合や、先進医療・差額ベッド代などには備えが必要です。
            </div>
          </section>

          {/* Section 3：リスクデータ */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              教員が直面する健康リスクの実態（政府統計）
            </h2>
            <div className="space-y-6 text-sm text-gray-700">
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">① 精神疾患休職：2022年度過去最多・6,539人</h3>
                <p className="leading-relaxed">
                  文部科学省「公立学校教職員の人事行政状況調査（2022年度）」によると、精神疾患を理由に休職した公立学校教員数は6,539人（過去最多）。教員全体の0.71%が精神疾患で休職しており、この割合は全就業者平均の約3倍に相当します。うつ病・適応障害・バーンアウトが主な診断名で、平均休職期間は6ヶ月〜1年以上です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">② 長時間労働：中学校教諭は月58時間超の時間外勤務</h3>
                <p className="leading-relaxed">
                  文部科学省「教員勤務実態調査（2022年度）」によると、小学校教諭の時間外勤務は月平均41時間、中学校教諭は月平均58時間（いわゆる過労死ラインの月80時間に迫る水準）。部活動指導・保護者対応・事務作業の増加が背景にあります。過労による心身疾患リスクが高く、医療保険の重要性が増しています。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">③ 声帯ポリープ・腰痛：教員特有の職業性疾患</h3>
                <p className="leading-relaxed">
                  教員は1日中声を使う職業であり、声帯ポリープ・声帯結節などの声の病気が職業性疾患として知られています。手術が必要な場合は1〜2週間の入院が必要です。また長時間の立位授業・教室内の移動による腰痛も多く、文部科学省の調査では教員の腰痛有病率は約55%に上ります。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">④ 私立学校教員は保障が手薄なケースがある</h3>
                <p className="leading-relaxed">
                  私立学校教員は学校によって共済制度の内容が異なり、公立教員より保障が薄いケースがあります。特に小規模な私立学校では団体保険が充実していないことも多く、民間医療保険の必要性が高くなります。勤務先の私学共済・健康保険の内容を確認した上で、民間保険で補完する部分を検討することが重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：
              <a href="https://www.mext.go.jp/a_menu/shotou/jinji/index.htm" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                文部科学省「公立学校教職員の人事行政状況調査」2022年度
              </a>
              、
              <a href="https://www.mext.go.jp/b_menu/houdou/mext_01247.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                文部科学省「教員勤務実態調査」2022年度
              </a>
            </p>
          </section>

          {/* Section 4：5つのチェックポイント */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              教員が医療保険を選ぶ際の5つのチェックポイント
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  num: '01',
                  title: '共済制度の内容を先に確認する',
                  detail: '公立教員の場合、共済組合の保障が手厚いため、民間医療保険は「差額ベッド代・先進医療・長期休職後の収入補填」に絞った最小限の保障で十分なケースがあります。まず勤務先の共済組合のパンフレットを確認し、カバーされていない部分のみ民間保険で補うことが効率的です。',
                },
                {
                  num: '02',
                  title: '精神疾患特約は必須',
                  detail: '教員の精神疾患休職者数が過去最多（6,539人）であることを踏まえ、精神疾患特約は必ず付帯してください。特に保護者対応・部活動指導・長時間労働によるストレスが多い中学校・高校の教員は精神疾患リスクが特に高いです。',
                },
                {
                  num: '03',
                  title: '声帯疾患・腰痛の給付条件を確認',
                  detail: '声帯ポリープ・声帯結節による手術・入院が給付対象かどうかを確認してください。また腰痛による入院・手術の給付条件も確認が必要です。これらは教員特有の高リスク疾患ですが、保険会社によって給付条件が異なります。',
                },
                {
                  num: '04',
                  title: '先進医療特約の付帯',
                  detail: '共済組合は先進医療費用をカバーしません。陽子線治療・重粒子線治療などの先進医療は数百万円の費用がかかる場合があります。月100〜200円程度の先進医療特約で備えることができるため、ほぼ必須の特約といえます。',
                },
                {
                  num: '05',
                  title: '私立学校教員は勤務先の保障を先に確認',
                  detail: '私立学校教員は学校によって共済・健康保険の内容が大きく異なります。傷病手当金の有無・休職中の給与補償の内容を勤務先の総務部門に確認してから民間保険を検討してください。公立教員よりも民間保険の必要性が高いケースがあります。',
                },
              ].map(cp => (
                <div key={cp.num} className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl font-bold text-[#2563eb] opacity-40 leading-none flex-shrink-0">{cp.num}</span>
                    <p className="font-bold text-[#0f172a] text-sm">{cp.title}</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{cp.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5：よくある失敗事例 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              教員の医療保険でよくある失敗事例3選
            </h2>
            <div className="space-y-4 text-sm">
              {[
                {
                  title: '失敗①：共済の保障を把握せず過剰な保険に加入',
                  situation: '20代女性・公立小学校教諭。',
                  problem: '共済組合の保障内容を確認せずに月額保険料8,000円の医療保険に加入。後から共済で多くがカバーされることを知り、重複した保障に月5,000円以上の無駄な保険料を支払い続けていたことが判明。',
                  lesson: '共済組合の保障内容を先に確認し、カバーされていない部分のみ民間保険で補うこと。',
                },
                {
                  title: '失敗②：精神疾患特約なしで休職給付を受けられなかった',
                  situation: '30代男性・公立中学校教諭。部活動顧問。',
                  problem: 'クレーム保護者対応と部活動の激務が重なり適応障害を発症。共済の休職給与はあったが、医療保険の入院給付（精神科入院）は精神疾患特約なしのため給付ゼロ。治療費の自己負担が重くなった。',
                  lesson: '教員は精神疾患リスクが全就業者平均の3倍。精神疾患特約は必須。',
                },
                {
                  title: '失敗③：先進医療費用が数百万円の自己負担に',
                  situation: '50代女性・私立高校教諭。',
                  problem: '乳がんと診断され、重粒子線治療（先進医療）を希望したが費用は約314万円。共済・健康保険では先進医療費用はカバーされず、先進医療特約もつけていなかったため全額自己負担になった。',
                  lesson: '先進医療特約は月100〜200円で付帯できる。必ずつけておくこと。',
                },
              ].map(c => (
                <div key={c.title} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 mb-2">{c.title}</p>
                  <div className="space-y-1 text-gray-700">
                    <p><span className="font-semibold text-gray-500">状況：</span>{c.situation}</p>
                    <p><span className="font-semibold text-gray-500">問題：</span>{c.problem}</p>
                    <p className="bg-white rounded-lg px-3 py-2 border border-red-100 mt-2">
                      <span className="font-bold text-red-700">教訓：</span>{c.lesson}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6：最終チェックリスト */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              教員の医療保険：加入前の最終確認リスト
            </h2>
            <div className="space-y-2">
              {[
                '勤務先の共済組合（公立）または私学共済・健康保険（私立）の保障内容を確認した',
                '休職中の給与補償（公立：1年目100%、2年目80%）を把握した',
                '共済でカバーされていない差額ベッド代・先進医療への備えを確認した',
                '精神疾患特約を付帯した（教員の精神疾患休職は過去最多水準）',
                '声帯疾患・腰痛の給付条件を確認した',
                '先進医療特約（月100〜200円）を付帯した',
                '私立学校教員の場合は勤務先の保障を先に確認した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="text-[#2563eb] font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 地方公務員×生命保険 専用コンテンツ */}
      {isCivilServantLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* Section 1：リード文 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              地方公務員に生命保険が必要な理由
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
              <p>
                地方公務員は共済組合による手厚い保障と、職場で案内される団体定期保険（グループ保険）を持っています。しかし「職場の団体保険に入っているから民間保険は不要」という判断が、退職後に大きな保障のギャップを生む原因になっています。
              </p>
              <p>
                全国で約270万人の職員が加入する公務員向け団体定期保険は割安な保険料と充実した保障で人気です。しかし団体保険には「退職後に保障が消える」という決定的な弱点があります。定年退職・早期退職・転職の際に保障がゼロになるリスクを正しく理解した上で、民間生命保険との最適な組み合わせを検討することが重要です。
              </p>
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
                <p className="font-bold text-indigo-800">💡 地方公務員が生命保険を考える際の最重要ポイント</p>
                <p className="text-indigo-700 text-sm mt-1">
                  大手保険サイトの多くは、公務員向け団体保険と民間保険の直接比較を避けています。本ページでは政府統計データと公開情報に基づき、中立的な立場で両者を比較します。
                </p>
                <p className="text-xs text-indigo-600 mt-2">
                  出典：
                  <a href="https://www.soumu.go.jp/main_sosiki/jichi_gyousei/koumuin_seido/kyousai.html" target="_blank" rel="noopener noreferrer" className="underline">
                    総務省「地方公務員共済組合年報」2022年
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Section 2：団体保険 vs 民間保険 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              【保存版】地方公務員の団体定期保険 vs 民間生命保険 徹底比較
            </h2>
            <p className="text-sm text-gray-700 mb-4">多くの保険サイトが触れない「団体保険と民間保険の直接比較」を客観的データに基づいて解説します。</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">比較項目</th>
                    <th className="text-center p-3">職場の団体定期保険</th>
                    <th className="text-center p-3">民間生命保険（個人契約）</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: '保険料', group: '✅ 割安（団体割引20〜30%適用）', private: '△ 標準〜やや高め' },
                    { item: '加入審査', group: '✅ 告知不要または簡易', private: '△ 健康告知・医師診査が必要な場合あり' },
                    { item: '退職後の保障', group: '❌ 退職と同時に保障終了', private: '✅ 退職後も継続（終身保険の場合）' },
                    { item: '転職・早期退職時', group: '❌ 保障が即座に消える', private: '✅ 継続可能' },
                    { item: '保障額の変更', group: '△ 年度ごとの更新時のみ変更可能', private: '✅ ライフステージに合わせて柔軟に変更可能' },
                    { item: '解約返戻金', group: '❌ なし（掛け捨て）', private: '終身・養老保険はあり' },
                    { item: '定年後の継続', group: '❌ 原則不可（継続は保険料大幅増）', private: '✅ 継続可能（終身保険は保険料変わらず）' },
                  ].map((row, i) => (
                    <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.item}</td>
                      <td className="p-3 text-center text-xs">{row.group}</td>
                      <td className="p-3 text-center text-xs font-semibold text-[#2563eb]">{row.private}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <p className="font-bold text-yellow-800 mb-2">📊 結論：団体保険と民間保険は「目的」が異なる</p>
              <p className="text-yellow-700 text-sm leading-relaxed">
                <strong>団体保険：</strong>在職中の保障を割安に確保するための手段<br />
                <strong>民間保険：</strong>退職後・転職後も続く長期的な保障を確保するための手段<br /><br />
                最適解は「団体保険（在職中の死亡保障）＋民間終身保険（退職後の保障）」の組み合わせです。どちらか一方では保障に穴が生じます。
              </p>
            </div>
          </section>

          {/* Section 3：共済の遺族保障 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              地方公務員の共済制度による遺族保障の実態
            </h2>
            <p className="text-sm text-gray-700 mb-4">生命保険の必要性を判断するには、共済組合の遺族給付をまず把握することが重要です。</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">給付の種類</th>
                    <th className="text-left p-3">内容</th>
                    <th className="text-right p-3">支給額の目安</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: '遺族共済年金', desc: '組合員が死亡した場合に遺族に支給される年金', amount: '報酬比例部分＋加給年金額' },
                    { type: '遺族基礎年金', desc: '国民年金から支給される基礎的な遺族年金', amount: '子のある配偶者：約102万円/年（子1人）' },
                    { type: '公務死給付', desc: '公務上の死亡の場合の特別給付', amount: '基礎額×加算額（職階・勤続年数による）' },
                    { type: '退職手当（死亡退職）', desc: '在職中に死亡した場合の退職手当', amount: '勤続年数×平均給与×支給率' },
                  ].map((row, i) => (
                    <tr key={row.type} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-semibold text-[#2563eb]">{row.type}</td>
                      <td className="p-3 text-xs">{row.desc}</td>
                      <td className="p-3 text-right text-xs font-medium">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              出典：
              <a href="https://www.soumu.go.jp/main_sosiki/jichi_gyousei/koumuin_seido/kyousai.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                総務省「地方公務員共済組合年報」2022年
              </a>
              、
              <a href="https://www.nenkin.go.jp/service/jukyu/izokunenkin/jukyu-yoken/20150401.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                日本年金機構「遺族基礎年金の受給要件・支給開始時期・計算方法」
              </a>
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 text-sm">
              共済の遺族給付は会社員（厚生年金）と同水準ですが、子のいない配偶者への遺族基礎年金は支給されない点に注意が必要です。また遺族共済年金は再婚・子の成長により支給が終了するため、長期的な家族の生活費を考えると民間生命保険で補完することが重要です。
            </div>
          </section>

          {/* Section 4：リスクデータ */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              地方公務員が直面する健康・生活リスクの実態
            </h2>
            <div className="space-y-6 text-sm text-gray-700">
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">① 精神疾患休職者数：10年連続増加・過去最多</h3>
                <p className="leading-relaxed">
                  総務省「地方公務員の健康状況等の現況（2022年）」によると、地方公務員のメンタルヘルス休職者数は10年連続で増加しており、2022年度は過去最多を更新しました。住民対応・議会対応・長時間残業が精神的負荷の主な原因です。精神疾患による長期休職は収入減少を招き、家族の生活費への影響が懸念されます。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">② 退職後の収入大幅低下：現役時の40〜60%</h3>
                <p className="leading-relaxed">
                  総務省統計局「就業構造基本調査（2022年）」によると、公務員の定年退職後の収入は現役時の約40〜60%に低下します。年金収入だけでは生活費を賄えないケースも多く、退職後の生命保険・医療保険の見直しが重要です。在職中に終身保険に加入しておくことで、退職後も保険料変動なしに保障を継続できます。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-base mb-2">③ 早期退職・転職リスク</h3>
                <p className="leading-relaxed">
                  近年は「公務員＝終身雇用」という常識が変わりつつあり、自己都合退職・早期退職する公務員も増加しています。団体保険のみに依存している場合、退職と同時に死亡保障がゼロになるリスクがあります。特に住宅ローン返済中の場合、団体信用生命保険（団信）以外の死亡保障確保が重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：
              <a href="https://www.soumu.go.jp/main_sosiki/jichi_gyousei/koumuin_seido/kenko.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                総務省「地方公務員の健康状況等の現況」2022年
              </a>
              、
              <a href="https://www.stat.go.jp/data/shugyou/2022/index.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                総務省統計局「就業構造基本調査」2022年
              </a>
            </p>
          </section>

          {/* Section 5：ライフステージ別戦略 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              地方公務員のライフステージ別・最適な生命保険の考え方
            </h2>
            <div className="space-y-3">
              {[
                {
                  stage: '20代・独身',
                  situation: '扶養家族なし・住宅ローンなし',
                  rec: '団体保険のみで十分なケースが多い。医療保険・就業不能保険を優先。生命保険は結婚・住宅購入後に検討。',
                  priority: '低',
                  color: 'bg-green-100 text-green-700',
                },
                {
                  stage: '30代・既婚・子あり',
                  situation: '住宅ローン・教育費・配偶者の生活費',
                  rec: '最も生命保険の必要性が高い時期。団体保険＋民間定期保険で必要保障額を確保。目安：年収×10〜15年分。',
                  priority: '高',
                  color: 'bg-red-100 text-red-700',
                },
                {
                  stage: '40代・子の教育費ピーク',
                  situation: '住宅ローン残債・大学費用',
                  rec: '保障額を見直し。住宅ローン返済が進むにつれて必要保障額は減少。収入保障型保険への切り替えを検討。',
                  priority: '中〜高',
                  color: 'bg-orange-100 text-orange-700',
                },
                {
                  stage: '50代・定年前',
                  situation: '退職後の保障継続を検討する時期',
                  rec: '団体保険が退職で終了することを見据えて終身保険への切り替えを検討。退職金・年金見込み額と照らし合わせて必要保障額を再計算。',
                  priority: '中',
                  color: 'bg-yellow-100 text-yellow-700',
                },
              ].map(s => (
                <div key={s.stage} className="bg-white border border-gray-100 rounded-xl p-5 flex gap-4 items-start">
                  <div className="flex-shrink-0 text-center">
                    <div className="font-bold text-[#0f172a] text-sm">{s.stage}</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${s.color}`}>
                      優先度：{s.priority}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500 text-xs mb-1">{s.situation}</p>
                    <p className="text-gray-700 leading-relaxed">{s.rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6：5つのチェックポイント */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              地方公務員が生命保険を選ぶ際の5つのチェックポイント
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  num: '01',
                  title: '団体保険の保障内容と退職後の扱いを確認する',
                  detail: 'まず職場の団体定期保険の保障額・保険料・退職後の継続可否を確認してください。団体保険は在職中は割安ですが、退職後に継続する場合は保険料が大幅に上昇するケースがほとんどです。退職後の継続保険料を事前に確認しておくことが重要です。',
                },
                {
                  num: '02',
                  title: '共済の遺族給付額を計算する',
                  detail: '共済組合の遺族給付（遺族共済年金＋遺族基礎年金）の概算額を計算してください。勤務先の共済組合に問い合わせるか、ねんきん定期便で確認できます。共済給付と生活費の差額が民間生命保険で補うべき金額です。',
                },
                {
                  num: '03',
                  title: '必要保障額を正確に計算する',
                  detail: '必要保障額 ＝ 遺族の生活費総額 − 共済遺族給付総額 − 貯蓄額。遺族の生活費は「現在の生活費×70%×残余年数」が目安です。住宅ローン残債・教育費・葬儀費用も加算してください。',
                },
                {
                  num: '04',
                  title: '終身保険で退職後の保障を確保する',
                  detail: '退職後も保障が続く終身保険を在職中に契約しておくことで、退職時に保険料が上昇するリスクを回避できます。50代で新たに終身保険に加入すると保険料が高くなるため、30〜40代での加入が有利です。',
                },
                {
                  num: '05',
                  title: '住宅ローンと団体信用生命保険の関係を確認する',
                  detail: '住宅ローン加入時に団体信用生命保険（団信）に加入している場合、死亡時にローン残債は相殺されます。この分は民間生命保険の必要保障額から差し引いて考えることができます。ただし団信はローン残債のみカバーするため、遺族の生活費・教育費への備えは別途必要です。',
                },
              ].map(cp => (
                <div key={cp.num} className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl font-bold text-[#2563eb] opacity-40 leading-none flex-shrink-0">{cp.num}</span>
                    <p className="font-bold text-[#0f172a] text-sm">{cp.title}</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{cp.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 7：よくある失敗事例 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              地方公務員の生命保険でよくある失敗事例3選
            </h2>
            <div className="space-y-4 text-sm">
              {[
                {
                  title: '失敗①：団体保険だけで退職後に保障ゼロ',
                  situation: '55歳男性・地方公務員・妻と子1人。',
                  problem: '在職中は団体定期保険（死亡保障3,000万円）のみで安心していたが、57歳で早期退職。退職と同時に保障がゼロになった。退職後に民間保険に加入しようとしたが、持病の高血圧を理由に通常の審査では加入できなかった。',
                  lesson: '健康なうちに終身保険に加入しておくこと。退職後は審査が通らないリスクがある。',
                },
                {
                  title: '失敗②：必要保障額を過大に見積もって保険料を払い過ぎ',
                  situation: '35歳男性・地方公務員・妻と子2人。',
                  problem: '共済の遺族給付を考慮せずに生命保険に加入。月額保険料2万円を払い続けていたが、FPに相談したところ共済給付を加味すると必要保障額は実際の半分以下だったことが判明。年間12万円の保険料を10年間払い過ぎていた。',
                  lesson: '共済の遺族給付額を先に計算し、不足分のみを民間保険で補うこと。',
                },
                {
                  title: '失敗③：退職後に保険料が3倍になった',
                  situation: '60歳男性・定年退職した元地方公務員。',
                  problem: '在職中の団体保険は月額2,500円だったが、退職後に継続しようとしたところ月額7,500円に跳ね上がった。家計への負担が大きく、やむなく保障額を半分に減額。老後の保障が手薄になった。',
                  lesson: '団体保険の退職後継続保険料を事前に確認し、在職中に終身保険への切り替えを検討すること。',
                },
              ].map(c => (
                <div key={c.title} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 mb-2">{c.title}</p>
                  <div className="space-y-1 text-gray-700">
                    <p><span className="font-semibold text-gray-500">状況：</span>{c.situation}</p>
                    <p><span className="font-semibold text-gray-500">問題：</span>{c.problem}</p>
                    <p className="bg-white rounded-lg px-3 py-2 border border-red-100 mt-2">
                      <span className="font-bold text-red-700">教訓：</span>{c.lesson}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 8：最終チェックリスト */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
              地方公務員の生命保険：加入前の最終確認リスト
            </h2>
            <div className="space-y-2">
              {[
                '職場の団体定期保険の保障額・保険料・退職後継続保険料を確認した',
                '共済組合の遺族給付（遺族共済年金＋遺族基礎年金）の概算額を確認した',
                '必要保障額（遺族生活費−共済給付−貯蓄）を計算した',
                '住宅ローンの団信で補われる金額を差し引いた',
                '退職後も保障が続く終身保険の加入を検討した',
                '精神疾患リスクへの就業不能保険・医療保険の備えも確認した',
                'ライフステージ（結婚・出産・住宅購入・定年）ごとの見直し計画を立てた',
                '複数の保険会社・FPに相談して見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="text-[#2563eb] font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 医師×収入保障保険 専用コンテンツ */}
      {isDoctorIncomeProtection && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">医師に就業不能保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              医師は日本最高水準の収入を誇りますが、就業不能になった場合の収入損失も最大規模になります。年収1,200万円の勤務医が精神疾患・過労で1年間就業不能になった場合の収入損失は1,200万円。傷病手当金（月収67%・最長18ヶ月）で補填されるのは約804万円のみで、残り約400万円は自己負担です。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              特に開業医・フリーランス医師は傷病手当金がなく収入損失がより深刻です。厚生労働省の調査（2022年）によると勤務医の週60時間以上労働は46.3%に達し、バーンアウト・精神疾患による長期休業リスクは全職種の中でも特に高い水準にあります。医師こそ就業不能保険が必要な職種の一つです。
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-emerald-800">💡 医師の就業不能保険で特に重要なポイント</p>
              <p className="text-emerald-700 text-sm mt-1">
                医師の就業不能保険には一般的な就業不能保険とは異なる重要な考慮点があります：<br/>
                ・「自分の専門科で働けない状態」を就業不能と定義する保険を選ぶ<br/>
                ・開業医は診療所の固定費（家賃・スタッフ給与）もカバーする保障が必要<br/>
                ・医師賠償責任保険との役割の違いを理解する
              </p>
              <p className="text-xs text-emerald-600 mt-2">出典：厚生労働省「医師の働き方改革 実態調査」2022年</p>
            </div>
          </section>

          {/* セクション2：勤務医vs開業医 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">勤務医 vs 開業医：就業不能時のリスクの根本的な違い</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>項目</span>
                    </th>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>勤務医</span>
                    </th>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>開業医（個人事業主）</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['傷病手当金','✅ あり（月収67%・最長18ヶ月）','❌ なし'],
                    ['就業不能時の収入','傷病手当金で18ヶ月はカバー','即座に収入ゼロ'],
                    ['診療所の固定費','❌ 関係なし','⚠️ 休業中も家賃・スタッフ給与が発生'],
                    ['患者への影響','病院が対応','⚠️ 診療所閉院→患者への影響甚大'],
                    ['就業不能保険の優先度','高（18ヶ月以降・収入損失33%分）','極めて高（即座の収入ゼロ＋固定費）'],
                  ].map(([item,employee,owner],i)=>(
                    <tr key={i} className={i%2===0?'bg-white':'bg-gray-50'}>
                      <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800">{item}</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">{employee}</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">{owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
              <p className="font-bold text-red-800 mb-2">🔴 開業医が最も注意すべき「ダブルリスク」</p>
              <p className="text-red-700 text-sm">
                開業医が就業不能になった場合：<br/>
                ①個人の収入がゼロになる<br/>
                ②診療所の固定費（家賃・スタッフ給与・医療機器リース）が継続する<br/><br/>
                月収150万円の開業医が3ヶ月休業した場合：<br/>
                収入損失：450万円<br/>
                診療所固定費（月100万円×3ヶ月）：300万円<br/>
                合計損失：750万円<br/><br/>
                就業不能保険の月額給付金は個人収入分だけでなく、診療所固定費もカバーできる水準に設定する必要があります。
              </p>
            </div>
          </section>

          {/* セクション3：リスクデータ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">医師が直面する就業不能リスクの実態</h2>
            <div className="space-y-6">
              {[
                {
                  title:'① 過労・長時間労働：週60時間超が46.3%',
                  body:'厚生労働省「医師の働き方改革 実態調査（2022年）」によると、勤務医の週60時間以上労働は46.3%、特定機能病院では週80時間超が18.1%。過労による心疾患・脳血管疾患での入院・長期リハビリが必要になるリスクが高いです。2024年4月からの時間外労働規制強化後も依然として高負荷な環境が続いています。',
                  color:'border-red-400 bg-red-50'
                },
                {
                  title:'② バーンアウト・精神疾患：約40%が経験',
                  body:'日本医師会「勤務医の健康支援に関する検討報告書（2022年）」によると、医師のバーンアウト経験率は約40%、うつ症状の有病率は一般人口の約2倍。患者の死亡・医療過誤への恐怖・訴訟リスクへのプレッシャーが精神的負荷の主な原因です。うつ病・適応障害による休業期間は平均6ヶ月〜1年以上で、18ヶ月を超えるケースも珍しくありません。',
                  color:'border-orange-400 bg-orange-50'
                },
                {
                  title:'③ 感染症・針刺し事故による長期療養',
                  body:'B型肝炎・C型肝炎への職業的感染リスクは一般人口の約4〜6倍（厚生労働省「院内感染対策」2022年）。感染が判明した場合、抗ウイルス薬による長期治療が必要で、診療制限・就業制限が課されるケースもあります。この期間の収入補填として就業不能保険が重要です。',
                  color:'border-yellow-400 bg-yellow-50'
                },
                {
                  title:'④ 医療訴訟による診療継続困難',
                  body:'日本医師会「医師賠償責任保険統計（2021年）」によると、医師はキャリア中に約25%が医療訴訟・紛争を経験。訴訟期間中の精神的ダメージから診療継続が困難になるケースもあります。この期間の収入補填として就業不能保険が有効です。',
                  color:'border-purple-400 bg-purple-50'
                },
              ].map((item,i)=>(
                <div key={i} className={`border-l-4 p-4 rounded-r-xl ${item.color}`}>
                  <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：厚生労働省「医師の働き方改革 実態調査」2022年 / 日本医師会「勤務医の健康支援に関する検討報告書」2022年 / 厚生労働省「医療機関における院内感染対策」2022年 / 日本医師会「医師賠償責任保険統計」2021年
            </p>
          </section>

          {/* セクション4：チェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">医師の就業不能保険選び5つのポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number:'01',
                  title:'「自分の専門科で働けない状態」を就業不能と定義する保険を選ぶ',
                  detail:'一般的な就業不能保険は「全く働けない状態」を給付条件とするものが多いですが、医師の場合「外科医として手術ができないが内科的な業務はできる状態」など部分的な就業不能が起こりやすいです。「自分の職業（専門科）に従事できない状態」を就業不能と定義する保険を選ぶことが重要です。'
                },
                {
                  number:'02',
                  title:'開業医は診療所の固定費もカバーできる保障額に設定する',
                  detail:'開業医の場合、個人収入の補填だけでなく診療所の固定費（家賃・スタッフ給与・医療機器リース）もカバーできる月額給付金を設定してください。個人収入分＋固定費分を合算した金額が必要な月額給付金の目安です。医療法人化している場合は法人保険との組み合わせも検討してください。'
                },
                {
                  number:'03',
                  title:'精神疾患特約は必須・給付日数の上限を確認する',
                  detail:'医師のバーンアウト経験率は約40%。精神疾患特約は必須であり、給付日数に上限がない（または1,000日超の）商品を選んでください。うつ病の平均治療期間は1〜3年であり、60日・180日の給付上限では不十分です。'
                },
                {
                  number:'04',
                  title:'勤務医は支払対象外期間を180日以上に設定して保険料を効率化',
                  detail:'勤務医は傷病手当金（最長18ヶ月）があるため、支払対象外期間を180日以上に設定することで保険料を大幅に抑えながら「18ヶ月以降の長期就業不能」に備えられます。開業医は傷病手当金がないため60日以下の短期タイプが適切です。'
                },
                {
                  number:'05',
                  title:'医師賠償責任保険との役割の違いを理解する',
                  detail:'医師賠償責任保険は医療過誤による患者への賠償に備えるもので、就業不能保険（自分の収入補填）とは全く別の保険です。勤務先病院が医師賠償責任保険に加入していても、個人の就業不能リスクには別途対応が必要です。両方の保険を目的別に整備することが重要です。'
                },
              ].map((cp,i)=>(
                <div key={i} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{cp.number}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">{cp.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{cp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">医師でよくある就業不能保険の失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title:'失敗①：「全く働けない状態」の定義で給付されなかった',
                  situation:'45歳男性・外科医。',
                  problem:'うつ病で手術ができない状態になったが、外来診療は継続できていた。加入していた就業不能保険は「全く働けない状態」のみ給付対象で、「外科手術ができないが業務は一部継続」という状態では給付されなかった。収入が30%減少した状態が1年以上続いた。',
                  lesson:'医師は「自分の専門科に従事できない状態」を就業不能と定義する保険を選ぶこと。'
                },
                {
                  title:'失敗②：開業医で休業中も固定費が発生し廃業',
                  situation:'50歳男性・内科クリニック経営。',
                  problem:'心筋梗塞で4ヶ月休業。就業不能保険の給付金（月30万円）は個人生活費には足りたが、診療所の固定費（家賃15万円・スタッフ給与40万円・リース10万円＝月65万円）を賄えず、やむなく閉院。患者への影響も甚大だった。',
                  lesson:'開業医は個人収入補填＋診療所固定費をカバーできる月額給付金を設定すること。'
                },
                {
                  title:'失敗③：精神疾患特約なしでバーンアウトの給付がゼロ',
                  situation:'38歳男性・大学病院勤務医。',
                  problem:'過労とバーンアウトでうつ病と診断され8ヶ月休業。加入していた就業不能保険は精神疾患特約なしのため給付ゼロ。傷病手当金のみで生活し、貯蓄が大幅に減少した。',
                  lesson:'医師はバーンアウト経験率が約40%。精神疾患特約は必須。'
                },
              ].map((c,i)=>(
                <div key={i} className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-600 px-5 py-3">
                    <h3 className="font-bold text-white">{c.title}</h3>
                  </div>
                  <div className="p-5 space-y-2 bg-white">
                    <p className="text-sm text-gray-600"><span className="font-semibold">状況：</span>{c.situation}</p>
                    <p className="text-sm text-gray-700"><span className="font-semibold">問題：</span>{c.problem}</p>
                    <p className="text-sm text-blue-700 font-semibold bg-blue-50 p-2 rounded"><span>教訓：</span>{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">医師の就業不能保険加入前・最終チェックリスト</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <ul className="space-y-3">
                {[
                  '勤務医か開業医かで保険設計が異なることを理解した',
                  '開業医の場合、診療所の固定費もカバーできる月額給付金を設定した',
                  '「専門科に従事できない状態」を就業不能と定義する保険を選んだ',
                  '精神疾患特約付き・給付日数1,000日以上の商品を選んだ',
                  '勤務医は支払対象外期間180日以上で保険料を効率化した',
                  '開業医は支払対象外期間60日以下で即時給付に備えた',
                  '医師賠償責任保険と就業不能保険の役割の違いを理解した',
                  '医療法人化している場合は法人保険との組み合わせを税理士に相談した',
                ].map((item,i)=>(
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>
      )}

      {/* 金融×生命保険 専用コンテンツ */}
      {isFinanceLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">金融・保険業に生命保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              銀行・証券・保険・ファンドなどの金融業は、高収入である反面、長時間労働・コンプライアンスプレッシャー・ノルマストレスによる精神疾患リスクが高い職種です。厚生労働省「毎月勤労統計調査（2023年）」によると、金融業の月平均残業は証券会社32.8時間・銀行28.4時間と全業種平均の約1.5倍。30〜40代の高収入期に死亡・高度障害になった場合、家族が失う収入損失は億単位になります。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              また金融業は転職・独立が多い職種でもあります。転職のたびに団体保険が途切れるリスクがあり、個人契約の生命保険で長期的な保障を確保しておくことが重要です。特にFP・証券外務員などの資格職は資格喪失・廃業リスクへの備えも必要です。
            </p>
            <div className="bg-slate-50 border-l-4 border-slate-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-slate-800">💡 金融業の生命保険設計で特に注意すべきポイント</p>
              <p className="text-slate-700 text-sm mt-1">
                金融業は保険知識が豊富な職種ですが、「自分は保険のことを知っているから大丈夫」という過信から保険設計が甘くなるケースがあります。また職場で加入を勧められる団体保険・会社の福利厚生保険の内容を正確に把握した上で、不足分を民間生命保険で補う設計が重要です。
              </p>
            </div>
          </section>

          {/* セクション2：公的保障と必要保障額 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">金融業の公的保障と必要保障額の考え方</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>給付の種類</span>
                    </th>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>会社員（銀行・証券・保険）</span>
                    </th>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>独立FP・個人事業主</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['遺族厚生年金','✅ あり（報酬比例）','❌ なし'],
                    ['遺族基礎年金','✅ あり（子あり：約102万円/年）','✅ あり（同額）'],
                    ['傷病手当金','✅ あり（標準報酬月額の67%）','❌ なし'],
                    ['退職金','✅ あり（会社規定）','❌ なし'],
                    ['会社の団体保険','✅ 多くの金融機関で完備','❌ なし'],
                  ].map(([type,employee,freelance],i)=>(
                    <tr key={i} className={i%2===0?'bg-white':'bg-gray-50'}>
                      <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800">{type}</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">{employee}</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">{freelance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mt-4 border border-blue-200">
              <p className="font-bold text-blue-800 mb-2">📊 年収700万円・銀行員の必要保障額試算例</p>
              <p className="text-blue-700 text-sm">
                年収700万円・38歳・妻（パート）・子2人の場合：<br/><br/>
                遺族の生活費：月28万円×12ヶ月×27年＝9,072万円<br/>
                子の教育費（2人）：約2,000万円<br/>
                住宅ローン残債：約3,000万円<br/>
                葬儀費用：約200万円<br/>
                合計：約1億4,272万円<br/><br/>
                遺族厚生・基礎年金（27年分）：約5,400万円<br/>
                退職手当（死亡退職）：約1,200万円<br/>
                貯蓄：約800万円<br/><br/>
                <strong>民間生命保険で補うべき金額：約6,872万円</strong>
              </p>
              <p className="text-xs text-blue-600 mt-2">※試算例。実際は家族構成・勤続年数・生活水準により異なります。</p>
            </div>
          </section>

          {/* セクション3：リスクデータ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">金融・保険業が直面する生命・健康リスクの実態</h2>
            <div className="space-y-6">
              {[
                {
                  title:'① 長時間労働・過労死リスク',
                  body:'厚生労働省「毎月勤労統計調査（2023年）」によると、証券会社の月平均残業は32.8時間・銀行は28.4時間と全業種平均の約1.5倍。特に決算期・IPO・M&A案件の繁忙期には月100時間超の残業になるケースもあり、過労による心疾患・脳血管疾患リスクが高いです。',
                  color:'border-red-400 bg-red-50'
                },
                {
                  title:'② コンプライアンスストレスによる精神疾患',
                  body:'厚生労働省「職場における心の健康づくり（2022年）」によると、金融業のメンタルヘルス不調率は全業種の上位。顧客資産の管理責任・法令違反へのプレッシャー・ノルマ達成の重圧が精神的負荷の主な原因です。うつ病・適応障害による長期休業は高収入職種にとって特に大きな収入損失につながります。',
                  color:'border-orange-400 bg-orange-50'
                },
                {
                  title:'③ 転職・独立による保障の断絶リスク',
                  body:'金融業は転職・独立が多い職種です。銀行→証券→独立FPというキャリアパスも一般的ですが、転職のたびに団体保険が途切れます。独立FPになると傷病手当金もなくなるため、早期に個人契約の生命保険・就業不能保険に加入しておくことが重要です。',
                  color:'border-yellow-400 bg-yellow-50'
                },
                {
                  title:'④ 生活習慣病：接待・不規則勤務による高リスク',
                  body:'厚生労働省「特定健康診査・特定保健指導実施状況（2022年）」によると、金融業従事者の特定健診メタボ該当率は全業種の上位。接待・会食・不規則な勤務時間による糖尿病・高血圧・心疾患リスクが高く、40〜50代での突然死リスクへの備えが重要です。',
                  color:'border-purple-400 bg-purple-50'
                },
              ].map((item,i)=>(
                <div key={i} className={`border-l-4 p-4 rounded-r-xl ${item.color}`}>
                  <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：厚生労働省「毎月勤労統計調査」2023年 / 厚生労働省「職場における心の健康づくり」2022年 / 厚生労働省「特定健康診査・特定保健指導実施状況」2022年
            </p>
          </section>

          {/* セクション4：チェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">金融業が生命保険を選ぶ5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number:'01',
                  title:'会社の団体保険の内容と退職後の扱いを確認する',
                  detail:'多くの金融機関は充実した団体生命保険を提供しています。団体保険の死亡保障額・退職後継続保険料を確認し、在職中は団体保険を活用しつつ、退職後も続く個人の終身保険を並行して準備することが最適です。転職・独立時に保障が途切れないよう個人契約を早めに確保してください。'
                },
                {
                  number:'02',
                  title:'必要保障額を億単位で正確に計算する',
                  detail:'年収700万円超の金融業従事者の場合、必要保障額は5,000万〜1億円以上になるケースがあります。遺族の生活費・教育費・住宅ローン・葬儀費用の合計から公的年金・退職金・貯蓄を差し引いた金額を正確に計算してください。'
                },
                {
                  number:'03',
                  title:'独立FP転向を想定した保障設計をする',
                  detail:'銀行・証券から独立FPへの転向は金融業では珍しくありません。独立後は傷病手当金がなくなり、退職金もありません。会社員のうちに個人の生命保険・就業不能保険に加入しておくことで、独立後も保障が途切れません。'
                },
                {
                  number:'04',
                  title:'精神疾患特約付き就業不能保険との組み合わせ',
                  detail:'金融業のメンタルヘルス不調率は全業種の上位。生命保険と合わせて精神疾患特約付きの就業不能保険への加入を強く推奨します。特にノルマのある営業職・トレーダー・コンプライアンス担当は精神疾患リスクが高いです。'
                },
                {
                  number:'05',
                  title:'メタボ・生活習慣病の告知と健康なうちの加入',
                  detail:'接待・会食が多い金融業は生活習慣病の有病率が高いです。高血圧・糖尿病・脂質異常症の診断がある場合は医療保険・生命保険の審査で条件が付くことがあります。健康診断で問題が出る前の若いうちに加入することがより良い条件での契約につながります。'
                },
              ].map((cp,i)=>(
                <div key={i} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{cp.number}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">{cp.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{cp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">金融・保険業でよくある生命保険の失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title:'失敗①：金融知識があるからと保険設計を後回しにした',
                  situation:'40歳男性・大手証券会社勤務。年収850万円。妻と子2人。',
                  problem:'「保険のことは詳しいから自分でできる」と加入を先延ばし。41歳で脳梗塞を発症し重度障害が残った。会社の団体保険2,000万円のみでは住宅ローン・家族の生活費・子の教育費を賄えず、妻がフルタイム復帰を余儀なくされた。',
                  lesson:'いくら保険知識があっても自分自身の設計は後回しになりがち。30代のうちに必要保障額を正確に計算して加入すること。'
                },
                {
                  title:'失敗②：転職時に団体保険が途切れ無保障期間が発生',
                  situation:'35歳男性・銀行から外資系証券へ転職。',
                  problem:'転職手続きに追われて保険の見直しを忘れていた。前職の団体保険終了から新職場の団体保険加入まで3ヶ月の空白期間が発生。この間に交通事故で入院し、生命保険・医療保険ともに無保障状態だったことが判明した。',
                  lesson:'転職前に個人契約の保険に加入しておくこと。団体保険だけに頼ると転職時に保障の空白が生じる。'
                },
                {
                  title:'失敗③：独立FP転向後に傷病手当金がなくなっていた',
                  situation:'42歳男性・銀行員から独立FPへ転向。',
                  problem:'独立後1年でうつ病を発症。銀行員時代は傷病手当金があったが、個人事業主になってからは傷病手当金がゼロ。就業不能保険にも未加入だったため、6ヶ月の休業で貯蓄が大幅に減少した。',
                  lesson:'独立前に就業不能保険に加入しておくこと。独立後は傷病手当金がなくなることを事前に把握して備えること。'
                },
              ].map((c,i)=>(
                <div key={i} className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-600 px-5 py-3">
                    <h3 className="font-bold text-white">{c.title}</h3>
                  </div>
                  <div className="p-5 space-y-2 bg-white">
                    <p className="text-sm text-gray-600"><span className="font-semibold">状況：</span>{c.situation}</p>
                    <p className="text-sm text-gray-700"><span className="font-semibold">問題：</span>{c.problem}</p>
                    <p className="text-sm text-blue-700 font-semibold bg-blue-50 p-2 rounded"><span>教訓：</span>{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">金融業の生命保険加入前・最終チェックリスト</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <ul className="space-y-3">
                {[
                  '会社の団体保険の内容と退職後継続保険料を確認した',
                  '必要保障額（5,000万〜1億円規模）を正確に計算した',
                  '転職・独立時の保障継続を個人契約で確保した',
                  '精神疾患特約付き就業不能保険との組み合わせを検討した',
                  '独立FP転向を想定した生命保険・就業不能保険の設計をした',
                  'メタボ・生活習慣病の告知義務を確認し健康なうちに加入した',
                  '収入保障保険で効率的に高額保障を確保した',
                  '複数のFP・保険会社で見積もりを比較した',
                ].map((item,i)=>(
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>
      )}

      {/* 美容師×医療保険 専用コンテンツ */}
      {isBeauticianMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">美容師・理容師に医療保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              美容師・理容師は薬剤（カラー剤・パーマ液）・長時間立位・繊細な手作業など、職業特有の健康リスクが集中している職種です。厚生労働省の調査によると、美容師の職業性皮膚炎有病率は約40〜50%と極めて高く、腰痛・頸肩腕症候群・気道疾患など複数の職業性疾患を同時に抱えるケースも珍しくありません。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              また美容師は個人事業主・フリーランスとして働く割合が高く、社会保険（健康保険・傷病手当金）に加入できない場合、病気・ケガで働けなくなった際のリスクが正社員より大幅に高くなります。自分の雇用形態と保障内容を確認した上で、適切な医療保険・就業不能保険を組み合わせることが重要です。
            </p>
            <div className="bg-pink-50 border-l-4 border-pink-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-pink-800">💡 美容師・理容師が医療保険を考える際の重要な前提</p>
              <p className="text-pink-700 text-sm mt-1">
                美容師・理容師の雇用形態は多様です：<br/>
                ①正社員・パート：社会保険加入→傷病手当金あり<br/>
                ②業務委託・フリーランス：国民健康保険→傷病手当金なし<br/>
                ③個人サロン経営（個人事業主）：国民健康保険→傷病手当金なし<br/>
                まず自分の雇用形態を確認し、傷病手当金の有無を把握してください。
              </p>
              <p className="text-xs text-pink-600 mt-2">出典：厚生労働省「社会保険適用拡大特設サイト」</p>
            </div>
          </section>

          {/* セクション2：雇用形態別の公的保障 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">雇用形態別の公的保障と医療保険の必要性</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>項目</span>
                    </th>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>正社員・社保加入パート</span>
                    </th>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>業務委託・個人事業主</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['健康保険','健康保険（協会けんぽ）','国民健康保険'],
                    ['傷病手当金','✅ あり（月収67%・最長18ヶ月）','❌ なし'],
                    ['労災保険','✅ 自動加入','△ 特別加入制度（任意）'],
                    ['休業中の収入','傷病手当金で一部補填','❌ 収入ゼロ'],
                    ['民間医療保険の優先度','中（差額ベッド代・先進医療への備え）','高（傷病手当金なし・収入補填必要）'],
                  ].map(([item,regular,freelance],i)=>(
                    <tr key={i} className={i%2===0?'bg-white':'bg-gray-50'}>
                      <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800">{item}</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">{regular}</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">{freelance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-2">出典：全国健康保険協会「傷病手当金について」 / 厚生労働省「社会保険適用拡大」</p>
          </section>

          {/* セクション3：リスクデータ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">美容師・理容師が直面する健康リスクの実態</h2>
            <div className="space-y-6">
              {[
                {
                  title:'① 職業性皮膚炎：有病率40〜50%',
                  body:'厚生労働省「職業性皮膚疾患の実態調査（2021年）」によると、美容師の職業性皮膚炎有病率は約40〜50%。カラー剤（パラフェニレンジアミン）・パーマ液（チオグリコール酸）・漂白剤（過酸化水素）などへの慢性的な接触によるアレルギー性接触皮膚炎が主な原因です。重症化すると手術・入院が必要になるケースもあり、皮膚科の長期通院・治療費がかかります。',
                  color:'border-pink-400 bg-pink-50'
                },
                {
                  title:'② 腰痛・頸肩腕症候群：長時間立位・前傾姿勢',
                  body:'長時間の立位作業・前傾姿勢でのカット・施術が腰椎・頸椎に慢性的な負荷をかけます。美容師の腰痛・頸肩腕症候群は職業性疾患として知られており、手術が必要になるケースもあります。重症化すると施術業務の継続が困難になり、廃業・転職を余儀なくされることもあります。',
                  color:'border-orange-400 bg-orange-50'
                },
                {
                  title:'③ 気道疾患・喘息リスク',
                  body:'日本産業衛生学会「職業性疾病研究報告（2021年）」によると、カラー剤・パーマ液・スプレー剤の吸入による気管支喘息・職業性鼻炎のリスクがあります。密閉空間での長時間薬剤使用が主な原因で、発症後は定期的な通院・投薬が必要になります。',
                  color:'border-yellow-400 bg-yellow-50'
                },
                {
                  title:'④ 個人サロン経営の廃業リスク',
                  body:'経済産業省「特定サービス産業動態統計調査（2022年）」によると、個人美容室の経営継続率（5年）は約55%。病気・ケガで長期休業した場合、顧客離れ・固定費（家賃・材料費）の継続により廃業に追い込まれるケースが多いです。医療保険に加えて就業不能保険への加入が重要です。',
                  color:'border-purple-400 bg-purple-50'
                },
              ].map((item,i)=>(
                <div key={i} className={`border-l-4 p-4 rounded-r-xl ${item.color}`}>
                  <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：厚生労働省「職業性皮膚疾患の実態調査」2021年 / 日本産業衛生学会「職業性疾病研究報告」2021年 / 経済産業省「特定サービス産業動態統計調査」2022年
            </p>
          </section>

          {/* セクション4：チェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">美容師・理容師が医療保険を選ぶ5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number:'01',
                  title:'皮膚炎・アレルギー疾患の告知義務を確認する',
                  detail:'既に職業性皮膚炎・アレルギー性鼻炎・気管支喘息の診断を受けている場合は、医療保険加入時の告知が必要です。これらの疾患があると引受条件が付く場合がありますが、告知義務違反は保険金不払いの原因になるため正確に申告してください。既往症がある場合は引受基準緩和型の保険も検討してください。'
                },
                {
                  number:'02',
                  title:'個人事業主・業務委託は就業不能保険との組み合わせが必須',
                  detail:'傷病手当金がない個人事業主・業務委託の美容師は、医療保険に加えて就業不能保険への加入が重要です。皮膚炎・腰痛で施術できない状態が続いた場合、収入がゼロになります。月額給付金は月収の50〜70%を目安に設定してください。'
                },
                {
                  number:'03',
                  title:'腰椎・頸椎手術の給付条件を確認する',
                  detail:'美容師は腰痛・頸椎疾患による手術リスクが高いです。椎間板手術・頸椎固定術などの整形外科手術が医療保険の給付対象かどうかを確認してください。また手術が困難な時期（皮膚炎の悪化時等）に入院が必要になるケースもあり、入院日額の設定も重要です。'
                },
                {
                  number:'04',
                  title:'先進医療特約を必ず付帯する',
                  detail:'月100〜200円で付帯できる先進医療特約は美容師にとっても重要な特約です。長年の薬剤使用による皮膚がん・夜勤なし職種でもがんリスクは誰にでもあります。先進医療特約で数百万円のリスクに備えてください。'
                },
                {
                  number:'05',
                  title:'保険料を収入に見合った水準に抑える',
                  detail:'美容師の平均年収は約250〜350万円と低めの傾向があります。月額保険料が高すぎると継続できなくなるリスクがあります。月収の1〜2%（月収25万円なら2,500〜5,000円）を医療保険と就業不能保険の合計の目安にしてください。'
                },
              ].map((cp,i)=>(
                <div key={i} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{cp.number}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">{cp.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{cp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">美容師・理容師でよくある医療保険の失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title:'失敗①：皮膚炎を告知せず保険金が支払われなかった',
                  situation:'30代女性・美容師歴10年。フリーランス。',
                  problem:'医療保険加入時に既に診断されていた職業性皮膚炎を告知しなかった。数年後に皮膚炎が重症化して入院したが、告知義務違反として保険契約を解除された。入院費用が全額自己負担になり、支払った保険料も戻らなかった。',
                  lesson:'職業性皮膚炎は加入時に必ず告知すること。引受基準緩和型の保険も選択肢として検討する。'
                },
                {
                  title:'失敗②：腰椎手術で長期休業・個人サロンが廃業',
                  situation:'40代女性・個人サロン経営。傷病手当金なし。',
                  problem:'腰椎椎間板ヘルニアの手術で3ヶ月休業。医療保険の入院給付はあったが就業不能保険に未加入。3ヶ月の収入ゼロ＋家賃・材料費の固定費が重なり、閉店を余儀なくされた。医療保険だけでは不十分だった。',
                  lesson:'個人事業主の美容師は就業不能保険が必須。医療保険だけでは収入途絶リスクに対応できない。'
                },
                {
                  title:'失敗③：高額な保険料で継続できず解約',
                  situation:'20代女性・美容師1年目。月収20万円。',
                  problem:'知人の勧めで月額5,500円の医療保険＋就業不能保険に加入。2年後に収入が減り保険料の支払いが苦しくなって解約。解約返戻金もなく、支払った保険料が無駄になった。',
                  lesson:'収入に見合った保険料設定が重要。月収の1〜2%を目安に。美容師1年目は特に収入が不安定なため無理のない設計をすること。'
                },
              ].map((c,i)=>(
                <div key={i} className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-600 px-5 py-3">
                    <h3 className="font-bold text-white">{c.title}</h3>
                  </div>
                  <div className="p-5 space-y-2 bg-white">
                    <p className="text-sm text-gray-600"><span className="font-semibold">状況：</span>{c.situation}</p>
                    <p className="text-sm text-gray-700"><span className="font-semibold">問題：</span>{c.problem}</p>
                    <p className="text-sm text-blue-700 font-semibold bg-blue-50 p-2 rounded"><span>教訓：</span>{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">美容師・理容師の医療保険加入前・最終チェックリスト</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <ul className="space-y-3">
                {[
                  '雇用形態（正社員・業務委託・個人事業主）と傷病手当金の有無を確認した',
                  '職業性皮膚炎・アレルギー疾患・気道疾患の告知義務を確認した',
                  '個人事業主・業務委託の場合は就業不能保険との組み合わせを検討した',
                  '腰椎・頸椎手術の給付条件を確認した',
                  '先進医療特約（月100〜200円）を付帯した',
                  '月収の1〜2%以内の保険料で継続可能な設計にした',
                  '引受基準緩和型保険の必要性を確認した（既往症がある場合）',
                  '複数の保険会社で見積もりを比較した',
                ].map((item,i)=>(
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>
      )}

      {/* 製造業×医療保険 専用コンテンツ */}
      {isManufacturingMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">製造業・工場勤務に医療保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              製造業・工場勤務は機械・設備・化学物質・騒音など多様な健康リスクが存在する職場環境です。厚生労働省「労働災害発生状況（2023年）」によると、製造業の休業4日以上の労働災害発生件数は全産業の約20%を占め、機械へのはさまれ・切れ・腰痛が主な原因です。また職業性難聴・化学物質による職業性疾患など、長期勤務により慢性化する健康リスクも特有の問題です。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              製造業の多くの会社員は健康保険（協会けんぽ・組合健保）に加入しており、傷病手当金・高額療養費制度の保障があります。しかし業務中の怪我は労災保険が適用される一方、私傷病・職業性疾患の自己負担分・差額ベッド代・先進医療費用には民間医療保険で備えることが重要です。
            </p>
            <div className="bg-gray-50 border-l-4 border-gray-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-gray-800">💡 製造業の医療保険で最も重要な前提</p>
              <p className="text-gray-700 text-sm mt-1">
                業務中の怪我・職業性疾患は労災保険が優先適用されます。民間医療保険は「業務外の私傷病」や「労災でカバーされない費用（差額ベッド代等）」を補う役割です。夜勤・交代勤務による生活習慣病リスクへの備えも重要です。
              </p>
              <p className="text-xs text-gray-600 mt-2">出典：厚生労働省「労働者災害補償保険法」</p>
            </div>
          </section>

          {/* セクション2：労災保険と民間医療保険の役割分担 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">労災保険と民間医療保険の役割分担</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>費用・リスクの種類</span>
                    </th>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>労災保険</span>
                    </th>
                    <th style={{background:'#0f172a',padding:'12px 16px',textAlign:'left'}}>
                      <span style={{color:'#ffffff',fontWeight:'bold',display:'block'}}>民間医療保険</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['業務中の怪我・治療費','✅ 全額補償','△ 労災後の差額のみ'],
                    ['職業性難聴・振動障害','✅ 認定されれば補償','△ 認定されない場合に必要'],
                    ['化学物質による疾患','✅ 職業病として認定されれば補償','△ 認定要件を満たさない場合'],
                    ['プライベート中の病気・ケガ','❌ 対象外','✅ 主な給付対象'],
                    ['夜勤による生活習慣病','❌ 原則対象外','✅ 主な給付対象'],
                    ['差額ベッド代・食事代','❌ 対象外','✅ 特約で補償可能'],
                  ].map(([type,rosai,private_ins],i)=>(
                    <tr key={i} className={i%2===0?'bg-white':'bg-gray-50'}>
                      <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800">{type}</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">{rosai}</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">{private_ins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-2">出典：厚生労働省「労働者災害補償保険法」</p>
          </section>

          {/* セクション3：製造業特有のリスクデータ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">製造業・工場勤務が直面する健康リスクの実態</h2>
            <div className="space-y-6">
              {[
                {
                  title:'① 労働災害：全産業の約20%・機械はさまれが最多',
                  body:'厚生労働省「労働災害発生状況（2023年）」によると、製造業の休業4日以上の労働災害発生件数は全産業の約20%。主な原因は「はさまれ・巻き込まれ（約25%）」「転倒（約20%）」「切れ・こすれ（約15%）」です。重大な怪我による長期入院・手術のリスクが常に存在します。',
                  color:'border-red-400 bg-red-50'
                },
                {
                  title:'② 職業性難聴：製造業が全業種で最高水準',
                  body:'厚生労働省「作業環境測定結果報告（2022年）」によると、製造業の職業性難聴有所見率は全業種で最高水準。長期間の騒音環境での作業により感音性難聴が進行するケースが多いです。補聴器の購入・定期的な耳鼻科通院など長期的な医療費がかかります。',
                  color:'border-orange-400 bg-orange-50'
                },
                {
                  title:'③ 腰痛：製造業の業務上疾病第1位',
                  body:'厚生労働省「業務上疾病発生状況（2022年）」によると、製造業の業務上疾病の第1位は腰痛。重量物の取り扱い・立位作業・不自然な姿勢による腰椎への慢性的な負荷が原因です。手術・入院・長期リハビリが必要になるケースもあります。',
                  color:'border-yellow-400 bg-yellow-50'
                },
                {
                  title:'④ 夜勤・交代勤務による生活習慣病・がんリスク',
                  body:'国立がん研究センター「多目的コホート研究（2021年）」によると、夜勤従事者の生活習慣病・睡眠障害リスクは日勤のみと比較して約1.4倍。製造業は交代勤務が多く、糖尿病・高血圧・がんリスクへの長期的な備えが重要です。',
                  color:'border-purple-400 bg-purple-50'
                },
              ].map((item,i)=>(
                <div key={i} className={`border-l-4 p-4 rounded-r-xl ${item.color}`}>
                  <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：厚生労働省「労働災害発生状況」2023年 / 厚生労働省「作業環境測定結果報告」2022年 / 厚生労働省「業務上疾病発生状況」2022年 / 国立がん研究センター「多目的コホート研究」2021年
            </p>
          </section>

          {/* セクション4：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">製造業が医療保険を選ぶ5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number:'01',
                  title:'腰痛・骨折などの整形外科手術が給付対象か確認する',
                  detail:'製造業は腰痛・骨折・切創による入院・手術リスクが高いです。椎間板手術・骨折手術などの整形外科手術が医療保険の手術給付金の対象かどうかを確認してください。内視鏡手術・レーザー手術も対象になる新しいタイプの手術給付が充実した商品を選びましょう。'
                },
                {
                  number:'02',
                  title:'職業性難聴・化学物質疾患の告知義務を確認する',
                  detail:'既に職業性難聴の診断を受けている場合や、化学物質への暴露歴がある場合は、医療保険加入時の告知義務として申告が必要です。告知義務違反は保険金不払いの原因になるため、正確に申告してください。既往症がある場合は引受基準緩和型の保険も選択肢です。'
                },
                {
                  number:'03',
                  title:'夜勤・交代勤務に備えたがん特約を検討する',
                  detail:'夜勤従事者のがんリスクは日勤の約1.4倍。医療保険のがん特約または単独のがん保険との組み合わせを検討してください。特に長期間夜勤に従事している40代以上の方はがんリスクへの備えが重要です。'
                },
                {
                  number:'04',
                  title:'入院日額は最低1万円以上を確保する',
                  detail:'製造業は骨折・腰椎手術による長期入院リスクが高いです。入院日額5,000円では長期入院時に不十分な場合があります。骨折の平均入院日数は約35日のため、入院日額1万円で約35万円の給付が得られます。差額ベッド代・食事代を含めると入院日額1万円以上が推奨されます。'
                },
                {
                  number:'05',
                  title:'先進医療特約を必ず付帯する',
                  detail:'がん・脳疾患の治療で先進医療を選択した場合、数十〜数百万円の費用が全額自己負担になります。月100〜200円の先進医療特約で最大2,000万円程度の保障が得られるため、必ず付帯してください。'
                },
              ].map((cp,i)=>(
                <div key={i} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{cp.number}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">{cp.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{cp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例3選 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">製造業・工場勤務でよくある医療保険の失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title:'失敗①：職業性難聴を告知せず保険金が支払われなかった',
                  situation:'50代男性・自動車部品工場勤務20年。',
                  problem:'医療保険加入時に既に診断されていた職業性難聴を告知しなかった。数年後に難聴が悪化して補聴器手術を受けたが、告知義務違反として保険契約を解除された。手術費用が全額自己負担になり、支払った保険料も戻らなかった。',
                  lesson:'職業性疾患（難聴・化学物質疾患等）は加入時に必ず告知すること。告知義務違反は保険金不払いの原因になる。'
                },
                {
                  title:'失敗②：腰椎手術で入院が長期化・入院日額不足',
                  situation:'40代男性・食品工場勤務。重量物搬送作業。',
                  problem:'腰椎椎間板ヘルニアの手術で45日間入院。入院日額5,000円の医療保険では給付金22.5万円。差額ベッド代（個室・1日6,000円×45日＝27万円）と合わせると実際の出費は50万円を超え、大幅な不足が生じた。',
                  lesson:'製造業は腰痛手術リスクが高い。入院日額は最低1万円以上を設定すること。'
                },
                {
                  title:'失敗③：夜勤20年でがん発症・先進医療特約なし',
                  situation:'52歳男性・電機工場勤務。夜勤20年以上。',
                  problem:'胃がんと診断され、重粒子線治療（先進医療）を希望。費用約294万円が全額自己負担。医療保険に加入していたが先進医療特約をつけていなかった。月150円の特約で防げた損失だった。',
                  lesson:'夜勤従事者はがんリスクが高い。先進医療特約は月100〜200円で付帯できるため必ず加入すること。'
                },
              ].map((c,i)=>(
                <div key={i} className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-600 px-5 py-3">
                    <h3 className="font-bold text-white">{c.title}</h3>
                  </div>
                  <div className="p-5 space-y-2 bg-white">
                    <p className="text-sm text-gray-600"><span className="font-semibold">状況：</span>{c.situation}</p>
                    <p className="text-sm text-gray-700"><span className="font-semibold">問題：</span>{c.problem}</p>
                    <p className="text-sm text-blue-700 font-semibold bg-blue-50 p-2 rounded"><span>教訓：</span>{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">製造業の医療保険加入前・最終チェックリスト</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <ul className="space-y-3">
                {[
                  '労災保険の適用範囲（業務中の怪我）と民間保険の役割を理解した',
                  '職業性難聴・化学物質疾患等の既往症を正確に告知した',
                  '腰椎手術・骨折に備えて入院日額1万円以上を確保した',
                  '整形外科手術（内視鏡・レーザー含む）が給付対象か確認した',
                  '夜勤リスクに備えてがん特約または単独がん保険を検討した',
                  '先進医療特約（月100〜200円）を付帯した',
                  '差額ベッド代特約の必要性を検討した',
                  '複数の保険会社で見積もりを比較した',
                ].map((item,i)=>(
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>
      )}

      {/* 管理職×生命保険 専用コンテンツ */}
      {isManagerLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">会社管理職に生命保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              課長・部長・役員などの管理職は、一般社員より高い収入を得ている分、万一の死亡・高度障害時に家族が失う収入損失も大きくなります。また管理職特有の長時間労働・マネジメントストレスによる過労死・精神疾患リスクも高く、適切な生命保険設計が家族を守る上で極めて重要です。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              厚生労働省「過労死等防止対策白書（2022年）」によると、管理職の月80時間超残業率は一般社員の約2.5倍。心疾患・脳血管疾患による突然死のリスクが高く、30〜50代の管理職にとって高額な死亡保障の確保が急務です。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-blue-800 mb-1">💡 管理職の生命保険設計で特に注意すべきポイント</p>
              <p className="text-blue-700 text-sm leading-relaxed">
                管理職は残業代がつかない「管理監督者」の場合があります。その場合、傷病手当金の計算基準となる標準報酬月額が実際の労働量に見合わない低い水準になることも。また役員・執行役員は健康保険の被保険者でなくなるケースがあり、傷病手当金が支給されない場合があります。自分の雇用形態と保障内容を確認することが重要です。
              </p>
              <p className="text-xs text-blue-600 mt-2">出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/roudouzikan/kanri.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「管理監督者の範囲について」</a></p>
            </div>
          </div>

          {/* セクション2：公的保障と必要保障額の考え方 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">管理職の公的保障と必要保障額の考え方</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">項目</th>
                    <th className="px-4 py-3 text-left font-semibold">一般管理職（課長・部長）</th>
                    <th className="px-4 py-3 text-left font-semibold">役員・執行役員</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">健康保険の種類</td><td className="px-4 py-3">健康保険（協会けんぽ・組合健保）</td><td className="px-4 py-3">健康保険（役員報酬が高い場合は任意継続等）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">傷病手当金</td><td className="px-4 py-3">✅ あり（標準報酬月額の67%・最長18ヶ月）</td><td className="px-4 py-3">⚠️ 役員報酬の性質によっては対象外の場合あり</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">遺族厚生年金</td><td className="px-4 py-3">✅ あり（報酬比例）</td><td className="px-4 py-3">✅ あり（報酬比例）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">退職金</td><td className="px-4 py-3">✅ あり（会社規定による）</td><td className="px-4 py-3">✅ あり（役員退職慰労金）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">会社の団体保険</td><td className="px-4 py-3">✅ 加入している場合が多い</td><td className="px-4 py-3">△ 役員向け特別保険の場合あり</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <p className="font-bold text-blue-800 mb-2">📊 年収800万円・管理職の必要保障額試算例</p>
              <p className="text-blue-700 text-sm leading-relaxed">
                年収800万円・42歳・妻（専業主婦）・子2人の場合：<br /><br />
                遺族の生活費：月30万円×12ヶ月×23年（65歳まで）＝8,280万円<br />
                子の教育費（2人）：約2,000万円<br />
                住宅ローン残債：約3,500万円<br />
                葬儀費用：約200万円<br />
                合計：約1億3,980万円<br /><br />
                遺族厚生・基礎年金（23年分）：約5,750万円<br />
                退職手当（死亡退職）：約1,500万円<br />
                貯蓄：約1,000万円<br /><br />
                <strong>民間生命保険で補うべき金額：約5,730万円</strong>
              </p>
              <p className="text-xs text-blue-600 mt-2">※試算例。実際は家族構成・勤続年数・生活水準により大きく異なります。</p>
            </div>
          </div>

          {/* セクション3：リスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">会社管理職が直面する死亡・生命リスクの実態</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 過労死リスク：月80時間超残業が一般社員の2.5倍</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「過労死等防止対策白書（2022年）」によると、管理職の月80時間超残業率は一般社員の約2.5倍。心筋梗塞・脳梗塞による突然死は40〜50代の管理職に多く発生しています。過労死認定された場合は労災保険が適用されますが、認定されない場合は民間生命保険が家族を守る唯一の手段です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② マネジメントストレスによる精神疾患</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「職場における心の健康づくり（2022年）」によると、管理職のメンタルヘルス不調率は一般社員の1.6倍。部下の問題・業績責任・上司からの圧力が重なる管理職特有のストレス構造が背景にあります。精神疾患による長期休業は昇進・収入にも影響するため、生命保険と合わせて就業不能保険も必要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 役員賠償責任リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  日本弁護士連合会「弁護士白書（2022年）」によると、管理職以上が民事訴訟の被告となる確率は一般社員の約4倍。労務問題・経営判断ミスによる損害賠償訴訟のリスクがあります。役員の場合はD&O保険（役員賠償責任保険）の検討も重要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">④ 生活習慣病：メタボ該当率が全男性平均の1.5倍</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「特定健康診査・特定保健指導実施状況（2022年）」によると、管理職以上の男性の特定健診メタボ該当率は44.2%（全男性平均28.7%の約1.5倍）。不規則な食事・接待・運動不足・ストレスが重なり、糖尿病・高血圧・心疾患リスクが高いです。生活習慣病による突然死リスクへの備えとして生命保険の重要性は特に高いです。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mhlw.go.jp/content/11200000/001148172.pdf" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「過労死等防止対策白書」2022年</a>　<a href="https://www.mhlw.go.jp/toukei/list/tokutei_kenkou.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「特定健康診査・特定保健指導実施状況」2022年</a>
            </p>
          </div>

          {/* セクション4：5つのチェックポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前に確認すべき5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '必要保障額を億単位で正確に計算する',
                  detail: '年収700〜1,000万円超の管理職の場合、必要保障額は5,000万〜1億円以上になるケースがあります。遺族の生活費・教育費・住宅ローン・葬儀費用の合計から公的年金・退職金・貯蓄を差し引いた金額を正確に計算してください。過小評価して家族が困窮するケースが多いです。',
                },
                {
                  number: '02',
                  title: '会社の団体保険と個人保険の組み合わせを最適化する',
                  detail: '多くの企業では役職に応じた団体生命保険に加入しています。団体保険の退職後の扱い（継続保険料・保障の有無）を確認し、在職中は団体保険を活用しつつ、退職後も続く個人の終身保険を並行して準備することが最適です。',
                },
                {
                  number: '03',
                  title: '役員・執行役員は傷病手当金の有無を確認する',
                  detail: '役員報酬の性質によっては健康保険の傷病手当金が支給されない場合があります。自分の雇用形態（使用人兼務役員か純粋な役員か）を確認し、傷病手当金がない場合は就業不能保険を手厚くしてください。',
                },
                {
                  number: '04',
                  title: '収入保障保険で効率的に高額保障を確保する',
                  detail: '5,000万〜1億円の死亡保障を一時金型保険で確保すると保険料が高額になります。毎月一定額を年金形式で支給する「収入保障保険」を活用することで、同じ保険料でより手厚い保障が得られます。特に子の独立・住宅ローン完済で必要保障額が減少する40〜50代の管理職に適しています。',
                },
                {
                  number: '05',
                  title: '就業不能保険・医療保険との組み合わせを設計する',
                  detail: '管理職の過労死・精神疾患リスクに備えるため、生命保険（死亡・高度障害）と就業不能保険（長期休業時の収入補填）・医療保険（入院・手術費用）の3種類を組み合わせた総合的な保障設計が重要です。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション5：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：必要保障額を過小評価して家族が困窮',
                  situation: '45歳男性・大手メーカー部長。年収900万円。妻と子2人。',
                  problem: '「退職金があるから大丈夫」と生命保険を2,000万円しか確保していなかった。46歳で急性心筋梗塞で死亡。退職手当1,500万円＋生命保険2,000万円では住宅ローン3,000万円・子2人の教育費・妻の生活費を賄えず、妻がフルタイム復帰・子の大学進学を諦めることになった。',
                  lesson: '高収入管理職ほど必要保障額は大きい。退職金・年金では補えない収入損失に備えること。',
                },
                {
                  title: '失敗②：役員就任後に傷病手当金がなくなっていた',
                  situation: '50歳男性・中小企業の取締役。',
                  problem: '取締役就任後に役員報酬の性質が変わり、実質的に傷病手当金の対象外になっていたことを把握していなかった。脳梗塞で6ヶ月入院した際、傷病手当金がゼロ。就業不能保険にも未加入だったため収入が途絶えた。',
                  lesson: '役員就任時に傷病手当金の適用可否を確認すること。適用外の場合は就業不能保険が必須。',
                },
                {
                  title: '失敗③：団体保険のみで退職後に保障がゼロ',
                  situation: '57歳男性・上場企業の執行役員。',
                  problem: '会社の役員団体保険（死亡保障5,000万円）に依存していたが、60歳での退任と同時に保障がゼロに。退任後に個人で生命保険に加入しようとしたが、高血圧・糖尿病の既往歴で通常審査では引受謝絶。健康なうちに個人の終身保険に加入しておかなかったことを後悔した。',
                  lesson: '団体保険だけに依存せず、在職中に個人の終身保険に加入しておくこと。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '必要保障額（遺族生活費＋教育費＋住宅ローン−公的年金−退職金−貯蓄）を計算した',
                '会社の団体保険の内容と退職後の扱いを確認した',
                '役員・執行役員の場合、傷病手当金の適用可否を確認した',
                '収入保障保険で効率的に高額保障を確保した',
                '就業不能保険（精神疾患特約付き）との組み合わせを検討した',
                '退職後も保障が続く終身保険への移行を在職中に準備した',
                'メタボ・生活習慣病の告知義務を確認し健康なうちに加入した',
                '複数のFP・保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 地方公務員×医療保険 専用コンテンツ */}
      {isCivilServantMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">地方公務員に医療保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              地方公務員は共済組合による手厚い医療保障があり、一般の会社員より医療費の自己負担が少ない傾向があります。しかし「共済があるから医療保険は不要」という判断が、先進医療・差額ベッド代・精神疾患の長期治療費などで思わぬ高額自己負担につながることがあります。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              特に注目すべきは精神疾患リスクです。総務省の調査によると、地方公務員のメンタルヘルス休職者数は10年連続で増加・過去最多を更新しており、精神科治療・入院費用への備えが公務員にとっても重要な課題となっています。
            </p>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-indigo-800 mb-1">💡 地方公務員の医療保険：共済でカバーされないものを理解する</p>
              <p className="text-indigo-700 text-sm leading-relaxed">
                共済組合の医療給付は健康保険（協会けんぽ）と同水準ですが、以下は共済でカバーされません：<br />
                ・差額ベッド代（個室等の追加料金）<br />
                ・先進医療費用（陽子線治療等）<br />
                ・高額療養費の自己負担分（月57,600円等）<br />
                ・入院中の生活費・交通費<br />
                これらへの備えとして民間医療保険を活用します。
              </p>
              <p className="text-xs text-indigo-600 mt-2">出典：<a href="https://www.soumu.go.jp/main_sosiki/jichi_gyousei/koumuin_seido/kyousai.html" target="_blank" rel="noopener noreferrer" className="underline">総務省「地方公務員共済組合年報」2022年</a></p>
            </div>
          </div>

          {/* セクション2：共済医療給付と民間医療保険の役割分担 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">共済医療給付と民間医療保険で補うべき部分</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">費用の種類</th>
                    <th className="px-4 py-3 text-left font-semibold">共済組合（公立公務員）</th>
                    <th className="px-4 py-3 text-left font-semibold">民間医療保険で補う部分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">保険診療の自己負担</td><td className="px-4 py-3">3割→高額療養費制度で上限あり</td><td className="px-4 py-3">入院日額・手術給付金で補完</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">付加給付（一部負担還元金）</td><td className="px-4 py-3">✅ 多くの共済組合で自己負担を25,000円に軽減</td><td className="px-4 py-3">付加給付後の残額を補完</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">差額ベッド代</td><td className="px-4 py-3">❌ 全額自己負担</td><td className="px-4 py-3">✅ 特約で補償</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">先進医療費用</td><td className="px-4 py-3">❌ 全額自己負担</td><td className="px-4 py-3">✅ 先進医療特約（月100〜200円）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">精神科入院費用</td><td className="px-4 py-3">高額療養費適用されるが長期入院で累積</td><td className="px-4 py-3">✅ 精神疾患特約付き医療保険</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">入院中の休業補償</td><td className="px-4 py-3">✅ 傷病手当金（月収80%・最長1年6ヶ月）</td><td className="px-4 py-3">収入補填は就業不能保険の役割</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <p className="font-bold text-green-800 mb-2">✅ 公務員共済の「付加給付」という手厚い制度</p>
              <p className="text-green-700 text-sm leading-relaxed">
                多くの共済組合では「付加給付（一部負担還元金）」という独自制度があり、月の医療費自己負担が25,000円を超えた場合に超過分が還付されます。一般の健康保険の高額療養費上限（月57,600円等）よりさらに手厚い保障です。この制度を把握した上で、民間医療保険の必要額を設計してください。
              </p>
              <p className="text-xs text-green-600 mt-2">出典：<a href="https://www.soumu.go.jp/main_sosiki/jichi_gyousei/koumuin_seido/kyousai.html" target="_blank" rel="noopener noreferrer" className="underline">総務省「地方公務員共済組合の概要」</a>　※付加給付の内容は共済組合により異なります</p>
            </div>
          </div>

          {/* セクション3：リスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">地方公務員が直面する医療リスクの実態</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 精神疾患休職：10年連続増加・過去最多</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  総務省「地方公務員の健康状況等の現況（2022年）」によると、地方公務員のメンタルヘルス休職者数は10年連続で増加、2022年度は過去最多を更新しました。住民対応・議会対応・長時間残業・ハラスメント問題などが精神的負荷の主な原因です。精神科通院・入院費用は共済の高額療養費・付加給付でカバーされますが、精神疾患特約付きの医療保険で長期的な備えをすることが重要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② 生活習慣病リスク：デスクワーク中心の健康リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  長時間のデスクワーク・不規則な残業・ストレスによる過食・運動不足が重なり、地方公務員は生活習慣病リスクが一般と同水準以上です。特に40〜50代での糖尿病・高血圧・脳血管疾患のリスクが高まります。これらの疾患は長期的な通院・入院が必要になるケースがあり、医療費への備えが重要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 先進医療費用の自己負担</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  がん・脳疾患などの重大疾患に罹患した場合、陽子線治療・重粒子線治療などの先進医療を選択するケースがあります。これらは共済・健康保険の対象外で全額自己負担となり、費用は100〜400万円に及ぶことがあります。月100〜200円の先進医療特約で備えることが重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.soumu.go.jp/main_content/000851160.pdf" target="_blank" rel="noopener noreferrer" className="underline">総務省「地方公務員の健康状況等の現況」2022年</a>　<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/sensiniryo/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「先進医療の概要について」</a>
            </p>
          </div>

          {/* セクション4：5つのチェックポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前に確認すべき5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '勤務先の共済組合の付加給付を先に確認する',
                  detail: '多くの共済組合は月25,000円を超えた医療費自己負担を還付する「付加給付」制度があります。この制度があれば民間医療保険の必要性は大幅に下がります。まず勤務先の共済組合のパンフレット・ウェブサイトで付加給付の有無と上限額を確認してください。',
                },
                {
                  number: '02',
                  title: '先進医療特約は必ず付帯する',
                  detail: '共済・健康保険は先進医療費用をカバーしません。月100〜200円で付帯できる先進医療特約は公務員にとっても必須の特約です。がん治療で先進医療を選択した場合、数百万円の費用が全額自己負担になります。',
                },
                {
                  number: '03',
                  title: '精神疾患特約付きの医療保険を選ぶ',
                  detail: '地方公務員の精神疾患休職者数が10年連続増加している現状を踏まえ、精神疾患特約は必須です。精神科通院・入院の費用は共済でカバーされますが、長期入院の場合に民間保険の給付があると生活の安心感が増します。',
                },
                {
                  number: '04',
                  title: '差額ベッド代特約の必要性を検討する',
                  detail: '個室・2人部屋などの差額ベッド代は共済対象外です。1日3,000〜10,000円の差額ベッド代が2〜3週間続くと数万〜数十万円の自己負担になります。入院時に個室を希望する場合は差額ベッド代特約の付帯を検討してください。',
                },
                {
                  number: '05',
                  title: '付加給付を考慮して最小限の保障で設計する',
                  detail: '共済の付加給付（月25,000円上限）がある場合、民間医療保険は差額ベッド代・先進医療・精神疾患に絞った最小限の保障で十分なケースが多いです。月額1,500〜3,000円程度の保険料に抑えることが公務員にとっての効率的な設計です。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション5：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：付加給付を知らず過剰な保険に加入',
                  situation: '30代女性・県庁職員。',
                  problem: '共済の付加給付制度を知らずに月額5,000円の医療保険に加入。後から付加給付で月25,000円超の自己負担が還付される制度を知り、実際に必要な保障は先進医療特約のみだったことが判明。10年間で60万円の保険料を過払いしていた。',
                  lesson: '共済の付加給付制度を先に確認すること。多くの公務員が過剰な医療保険に加入している。',
                },
                {
                  title: '失敗②：先進医療特約なしでがん治療に300万円',
                  situation: '48歳男性・市役所職員。',
                  problem: '前立腺がんと診断され、重粒子線治療（先進医療）を希望。費用約314万円が全額自己負担。共済・健康保険では先進医療費用はカバーされず、先進医療特約もつけていなかった。月200円の特約で防げた損失だった。',
                  lesson: '先進医療特約は月100〜200円で付帯できる。公務員でも必ず付帯すること。',
                },
                {
                  title: '失敗③：精神疾患で長期通院・治療費が累積',
                  situation: '35歳女性・区役所職員。',
                  problem: '住民対応のストレスからうつ病を発症。精神科通院を2年間継続。共済の高額療養費で自己負担は抑えられたが、精神疾患特約なしの医療保険だったため入院時の給付がゼロ。通院費・薬代が家計を圧迫した。',
                  lesson: '地方公務員は精神疾患リスクが高い。精神疾患特約は必ず付帯すること。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '勤務先の共済組合の付加給付（月25,000円上限等）の有無を確認した',
                '共済でカバーされない差額ベッド代・先進医療費用を把握した',
                '先進医療特約（月100〜200円）を付帯した',
                '精神疾患特約付きの医療保険を選んだ',
                '差額ベッド代特約の必要性を検討した',
                '付加給付を考慮して月額保険料1,500〜3,000円以内に設計した',
                '就業不能保険との組み合わせも検討した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 教員×生命保険 専用コンテンツ */}
      {isTeacherLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">教員・教師に生命保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              教員は公務員として共済組合による手厚い遺族保障がありますが、それだけで家族の生活を完全にカバーできるわけではありません。特に30〜40代の子育て世代の教員にとって、住宅ローン・子の教育費・配偶者の生活費を長期的に保障するためには民間生命保険が必要です。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              また精神疾患による休職・早期退職のリスクも考慮が必要です。文部科学省の調査（2022年度）によると、精神疾患で休職した教員は6,539人（過去最多）。長期休職・早期退職の場合、収入が大幅に低下し家族の生活に影響が出ます。生命保険による死亡保障と合わせて、就業不能保険による収入補償も重要です。
            </p>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-purple-800 mb-1">💡 教員の生命保険設計で最も重要なポイント</p>
              <p className="text-purple-700 text-sm leading-relaxed">
                公立教員の共済組合は遺族給付が充実しています。まず共済の遺族給付額を確認し、不足分のみを民間生命保険で補う設計が最も効率的です。過剰な保険に加入して保険料を払い過ぎることを避けることも重要です。
              </p>
              <p className="text-xs text-purple-600 mt-2">出典：<a href="https://www.mext.go.jp/a_menu/kyouiku/kyousyokuin/index.htm" target="_blank" rel="noopener noreferrer" className="underline">文部科学省共済組合「給付の概要」</a></p>
            </div>
          </div>

          {/* セクション2：共済遺族給付と民間生命保険の役割分担 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">教員の共済遺族給付と民間生命保険で補うべき金額</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">給付の種類</th>
                    <th className="px-4 py-3 text-left font-semibold">公立学校教員（共済組合）</th>
                    <th className="px-4 py-3 text-left font-semibold">私立学校教員</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">遺族共済年金</td><td className="px-4 py-3">✅ あり（報酬比例＋加給年金）</td><td className="px-4 py-3">✅ あり（私学共済）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">遺族基礎年金</td><td className="px-4 py-3">✅ あり（子あり：約102万円/年）</td><td className="px-4 py-3">✅ あり（同額）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">公務死給付</td><td className="px-4 py-3">✅ 公務上死亡の場合の特別給付</td><td className="px-4 py-3">△ 学校による</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">退職手当（死亡退職）</td><td className="px-4 py-3">✅ 勤続年数×給与×支給率</td><td className="px-4 py-3">△ 学校による</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">子のない配偶者への遺族基礎年金</td><td className="px-4 py-3">❌ 支給なし</td><td className="px-4 py-3">❌ 支給なし</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="font-bold text-yellow-800 mb-2">⚠️ 子のない配偶者への遺族給付に注意</p>
              <p className="text-yellow-700 text-sm leading-relaxed">
                遺族基礎年金は「子のある配偶者」または「子」にのみ支給されます。子のいない夫婦の場合、遺族基礎年金は支給されません。共済の遺族共済年金は支給されますが、基礎年金がない分、民間生命保険の必要性が高まります。特にDINKS（共働きで子なし）の教員夫婦はこの点に注意して保険設計をしてください。
              </p>
            </div>
          </div>

          {/* セクション3：リスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">教員が直面する生命・健康リスクの実態</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 精神疾患休職：過去最多6,539人・早期退職リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  文部科学省「公立学校教職員の人事行政状況調査（2022年度）」によると、精神疾患で休職した公立学校教員は6,539人（過去最多）。長期休職後に早期退職するケースも多く、その場合は退職手当が減額されます。早期退職により収入が大幅に低下した状態での住宅ローン返済・家族の生活費の確保が課題となります。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② 長時間労働による過労死リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  文部科学省「教員勤務実態調査（2022年度）」によると、中学校教諭の時間外勤務は月平均58時間。過労死ラインとされる月80時間に迫る水準の教員も存在します。過労による心疾患・脳血管疾患で死亡するケースもあり、30〜40代の教員の突然死リスクへの備えが重要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 退職後の収入大幅低下</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  教員の定年退職後の年金収入は現役時の約50〜60%程度です。在職中に生命保険・終身保険に加入しておくことで、退職後も保険料変動なしに保障を継続できます。50代での新規加入は保険料が高くなるため、30〜40代での加入が有利です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mext.go.jp/a_menu/shotou/jinji/index.htm" target="_blank" rel="noopener noreferrer" className="underline">文部科学省「公立学校教職員の人事行政状況調査」2022年度</a>　<a href="https://www.mext.go.jp/b_menu/shingi/chukyo/chukyo3/002/siryo/1397004.htm" target="_blank" rel="noopener noreferrer" className="underline">文部科学省「教員勤務実態調査」2022年度</a>
            </p>
          </div>

          {/* セクション4：ライフステージ別の生命保険戦略 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">教員のライフステージ別・最適な生命保険の考え方</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  stage: '20代・独身',
                  need: '低',
                  needColor: 'bg-green-100 text-green-800',
                  detail: '扶養家族なし。医療保険・就業不能保険を優先。生命保険は最小限でよい。',
                },
                {
                  stage: '30代・既婚・子あり・住宅購入',
                  need: '高',
                  needColor: 'bg-red-100 text-red-800',
                  detail: '必要保障額が最大の時期。共済遺族給付を確認した上で不足分を民間定期保険で補う。住宅ローン団信との重複に注意。',
                },
                {
                  stage: '40代・子の教育費ピーク',
                  need: '中〜高',
                  needColor: 'bg-orange-100 text-orange-800',
                  detail: '住宅ローン残債減少につれて必要保障額も減少。保障額の見直しと収入保障型保険への切り替えを検討。',
                },
                {
                  stage: '50代・定年前',
                  need: '中',
                  needColor: 'bg-blue-100 text-blue-800',
                  detail: '退職後の保障継続を考慮して終身保険への切り替えを検討。共済の退職後保障も確認する。',
                },
              ].map((s, i) => (
                <div key={i} className="bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-gray-900 text-sm">{s.stage}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.needColor}`}>必要度：{s.need}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* セクション5：5つのチェックポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前に確認すべき5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '共済の遺族給付額を先に確認・計算する',
                  detail: '勤務先の共済組合に問い合わせて、遺族共済年金の概算額を確認してください。ねんきん定期便でも概算が確認できます。共済給付と家族の生活費の差額が民間生命保険で補うべき金額です。多くの教員が共済給付を確認せずに過剰な保険に加入しているケースがあります。',
                },
                {
                  number: '02',
                  title: '子のない夫婦は遺族基礎年金がないことを考慮する',
                  detail: '子のいないDINKS教員夫婦の場合、配偶者が死亡しても遺族基礎年金は支給されません。遺族共済年金のみとなるため、子のある家庭より民間生命保険の必要額が相対的に大きくなります。',
                },
                {
                  number: '03',
                  title: '住宅ローンの団信と生命保険の重複を避ける',
                  detail: '住宅ローン加入時の団体信用生命保険（団信）で死亡時にローン残債が相殺されます。この分は民間生命保険の必要保障額から差し引いて計算することができます。団信を考慮せずに過剰な死亡保障に加入しているケースが教員に多く見られます。',
                },
                {
                  number: '04',
                  title: '私立学校教員は勤務先の保障を先に確認する',
                  detail: '私立学校教員は学校によって共済・退職手当の内容が大きく異なります。勤務先の総務部門に遺族給付の内容を確認してから民間保険を検討してください。公立教員より保障が薄いケースでは民間保険の必要性が高くなります。',
                },
                {
                  number: '05',
                  title: '精神疾患による早期退職リスクへの備えも検討する',
                  detail: '教員の精神疾患休職者数は過去最多水準。生命保険の死亡保障に加えて、精神疾患特約付きの就業不能保険で休職・早期退職時の収入減少にも備えることが重要です。生命保険と就業不能保険を組み合わせた総合的な保障設計を検討してください。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：共済給付を確認せず過剰な保険に加入',
                  situation: '30代男性・公立中学校教諭。',
                  problem: '共済の遺族給付を確認せずに月額保険料1万円の生命保険に加入。後からFPに相談したところ、共済給付で家族の生活費の大半はカバーできることが判明。10年間で120万円の保険料を払い過ぎていた。',
                  lesson: '共済の遺族給付額を先に確認し、不足分のみ民間保険で補うこと。',
                },
                {
                  title: '失敗②：子のない夫婦で遺族基礎年金がなく生活が困窮',
                  situation: '40代男性・公立高校教諭。妻と2人暮らし（子なし）。',
                  problem: '突然の脳梗塞で死亡。子がいないため遺族基礎年金は支給されず、遺族共済年金のみ（年約90万円）。民間生命保険も最小限だったため、専業主婦だった妻の生活費が大幅に不足。妻が急遽フルタイム就職を余儀なくされた。',
                  lesson: '子のないDINKS夫婦は遺族基礎年金がない分、民間生命保険の保障を手厚くすること。',
                },
                {
                  title: '失敗③：精神疾患で早期退職・退職手当が激減',
                  situation: '45歳女性・公立小学校教諭。',
                  problem: 'うつ病で3年間休職後、早期退職。勤続23年での退職となり、定年まで勤めた場合の退職手当（約2,000万円）の約60%しか受け取れなかった。住宅ローンが残っており、生命保険も見直しが必要な状況に。',
                  lesson: '精神疾患リスクに備えて就業不能保険に加入しておくこと。早期退職による退職手当の減額リスクも考慮した保障設計が重要。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション7：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '共済の遺族共済年金・遺族基礎年金の概算額を確認した',
                '子のない夫婦の場合、遺族基礎年金が支給されないことを把握した',
                '必要保障額（遺族生活費＋教育費−共済給付−退職手当−貯蓄）を計算した',
                '住宅ローンの団信で補われる金額を差し引いた',
                '私立学校教員の場合は勤務先の保障内容を確認した',
                '精神疾患リスクへの就業不能保険との組み合わせを検討した',
                '退職後も保障が続く終身保険への移行を検討した',
                '複数の保険会社・FPで見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 建設業×生命保険 専用コンテンツ */}
      {isConstructionLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">建設業・現場作業員に生命保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              建設業は全産業の中で死亡労働災害が最も多い業種の一つです。厚生労働省「労働災害発生状況（2023年）」によると、建設業の死亡災害は全産業の約30%を占めます。現場作業員が万一の事故で死亡・高度障害になった場合、残された家族への影響は甚大です。労災保険による遺族補償があるものの、それだけでは家族の長期的な生活費・教育費をカバーするには不十分なケースがほとんどです。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              また建設業は一人親方・個人事業主が多い業種でもあります。個人事業主の場合、遺族厚生年金がなく遺族基礎年金のみとなるため、民間生命保険の必要性が会社員よりさらに高くなります。
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-orange-800 mb-1">⚠️ 建設業の生命保険で最も重要な前提</p>
              <p className="text-orange-700 text-sm leading-relaxed">
                業務中の死亡事故は労災保険が適用されます。しかし労災保険の遺族補償は「遺族補償年金」として毎年支給されますが、金額は給付基礎日額の約153〜245日分。年収400万円の作業員の場合、年間約167〜268万円。家族の生活費・教育費には到底足りません。民間生命保険で不足分を補うことが必須です。
              </p>
              <p className="text-xs text-orange-600 mt-2">出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働者災害補償保険法」</a></p>
            </div>
          </div>

          {/* セクション2：労災保険の遺族補償と民間生命保険の役割分担 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">労災保険の遺族補償 vs 民間生命保険：補うべき金額を理解する</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">給付の種類</th>
                    <th className="px-4 py-3 text-left font-semibold">会社員建設業者</th>
                    <th className="px-4 py-3 text-left font-semibold">一人親方（個人事業主）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">労災遺族補償年金</td><td className="px-4 py-3">✅ 給付基礎日額×153〜245日/年</td><td className="px-4 py-3">△ 特別加入者のみ（任意加入）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">遺族厚生年金</td><td className="px-4 py-3">✅ あり（報酬比例）</td><td className="px-4 py-3">❌ なし（国民年金のみ）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">遺族基礎年金</td><td className="px-4 py-3">✅ あり（子あり：約102万円/年）</td><td className="px-4 py-3">✅ あり（同額）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">葬祭料</td><td className="px-4 py-3">✅ 労災から支給（給付基礎日額×60日）</td><td className="px-4 py-3">△ 特別加入者のみ</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">民間生命保険の必要性</td><td className="px-4 py-3">高（労災+年金では生活費不足）</td><td className="px-4 py-3">極めて高（遺族厚生年金なし）</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <p className="font-bold text-blue-800 mb-2">📊 年収400万円・会社員建設業者の遺族への給付シミュレーション</p>
              <p className="text-blue-700 text-sm leading-relaxed">
                労災遺族補償年金：約167〜268万円/年<br />
                遺族厚生年金＋遺族基礎年金：約120〜180万円/年<br />
                合計：約287〜448万円/年<br /><br />
                遺族の生活費（月25万円×12ヶ月）：300万円/年<br />
                子の教育費（大学まで）：約1,000〜1,500万円<br /><br />
                <strong>不足額：生活費だけで年間約100万円以上の不足が生じる可能性</strong>
              </p>
              <p className="text-xs text-blue-600 mt-2">※試算例。実際は家族構成・勤続年数・生活水準により異なります。</p>
            </div>
          </div>

          {/* セクション3：リスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">建設業・現場作業員の死亡・高度障害リスクの実態</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 死亡災害：全産業の約30%・墜落・転落が最多</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「労働災害発生状況（2023年）」によると、建設業の死亡災害は全産業の約30%を占め、主な死因は墜落・転落（約40%）、建設機械等（約15%）、飛来・落下（約10%）です。足場作業・高所作業・重機作業など、死亡リスクが常に隣り合わせの職場環境です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② 高度障害リスク：死亡より多い重篤災害</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  建設業では死亡には至らないものの、高所からの転落による脊髄損傷・重篤な脳障害で重度障害が残るケースも多いです。生命保険の「高度障害保険金」は、両眼失明・言語機能の廃絶・両上肢の機能廃絶など重度の障害状態になった場合に死亡保険金と同額が支払われます。生命保険の死亡保障は高度障害への備えにもなります。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ じん肺・アスベスト関連疾患による死亡リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  建設業特有のじん肺・中皮腫（アスベスト関連疾患）は、長い潜伏期間（20〜40年）の後に発症し、診断から数年以内に死亡するケースが多いです。既に退職・廃業した後に発症することも多く、在職中に生命保険に加入しておくことが家族への備えとして重要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">④ 一人親方の廃業リスク：家族への連鎖的影響</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  一人親方が死亡・高度障害になった場合、事業は即座に廃業となります。会社員と異なり退職金がなく、遺族厚生年金もないため、家族が受け取れる公的給付は遺族基礎年金のみ。子のいない配偶者には遺族基礎年金も支給されないため、民間生命保険が家族を守る唯一の手段となります。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei11/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働災害発生状況」2023年</a>　<a href="https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei34/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「じん肺健康管理実施状況報告」2022年</a>
            </p>
          </div>

          {/* セクション4：5つのポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">建設業の生命保険選び5つのポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '労災保険・遺族年金の給付額を先に確認する',
                  detail: '民間生命保険で補うべき金額を正確に計算するには、まず労災保険の遺族補償年金・遺族厚生年金・遺族基礎年金の概算額を把握することが重要です。会社の総務部門または最寄りの労働基準監督署に問い合わせることで概算額が確認できます。',
                },
                {
                  number: '02',
                  title: '高度障害保険金が付帯されているか確認する',
                  detail: '建設業は重篤な障害が残る重大事故リスクが高いです。生命保険の「高度障害保険金特約」が付帯されているかを確認してください。死亡保険金と同額の高度障害保険金が支払われる保険を選ぶことで、死亡・高度障害の両方に備えられます。',
                },
                {
                  number: '03',
                  title: '一人親方は死亡保障を手厚くする',
                  detail: '一人親方は遺族厚生年金がなく、退職金もありません。会社員建設業者より民間生命保険の死亡保障を手厚く設定する必要があります。必要保障額の目安：遺族の生活費（月収×12ヶ月×残余年数）＋教育費−遺族基礎年金総額−貯蓄。',
                },
                {
                  number: '04',
                  title: '健康なうちに加入する（告知義務の注意）',
                  detail: '建設業は身体的に過酷な職業であり、腰痛・じん肺・難聴などの既往歴がある場合、生命保険の審査で条件が付くことがあります。若いうちに・健康なうちに加入しておくことがより良い条件での契約につながります。',
                },
                {
                  number: '05',
                  title: '医療保険との組み合わせを検討する',
                  detail: '生命保険（死亡・高度障害）と医療保険（入院・手術）は別々の役割を持ちます。建設業の医療リスク（骨折・腰痛手術・熱中症入院）には医療保険で備え、死亡・高度障害には生命保険で備えるという役割分担で設計してください。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション5：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：労災保険があるから生命保険は不要と思っていた',
                  situation: '40代男性・建設会社勤務。妻と子2人。',
                  problem: '「労災保険があるから大丈夫」と生命保険に未加入。足場からの転落事故で死亡。労災遺族補償年金（年約200万円）と遺族年金（年約150万円）では月収35万円の収入を補えず、妻が急遽フルタイム復帰。子の大学進学を諦めることになった。',
                  lesson: '労災保険の遺族補償は生活費の一部しかカバーしない。民間生命保険で不足分を補うことが必須。',
                },
                {
                  title: '失敗②：一人親方で遺族厚生年金がなく家族が困窮',
                  situation: '45歳男性・一人親方・電気工事業。妻と子1人。',
                  problem: '心筋梗塞で急死。遺族厚生年金がなく、遺族基礎年金（年約102万円）のみ。民間生命保険にも未加入。妻への収入補填ゼロで、子が高校卒業後すぐに就職せざるを得なくなった。',
                  lesson: '一人親方は遺族厚生年金がない分、民間生命保険の必要性が会社員より高い。',
                },
                {
                  title: '失敗③：高度障害になり保険金が支払われなかった',
                  situation: '38歳男性・建設会社勤務。',
                  problem: '転落事故で脊髄損傷・下半身麻痺。医療保険には加入していたが、高度障害保険金特約のない生命保険だったため、障害認定後に死亡保険金相当の保険金を受け取れなかった。働けなくなったにもかかわらず生命保険からの給付がゼロ。',
                  lesson: '建設業は高度障害リスクが高い。生命保険に高度障害保険金特約が付いているか必ず確認すること。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '労災保険の遺族補償年金・遺族厚生年金の概算額を確認した',
                '必要保障額（遺族生活費＋教育費−公的給付−貯蓄）を計算した',
                '高度障害保険金特約が付帯されているか確認した',
                '一人親方の場合は遺族厚生年金がないことを考慮して保障額を増やした',
                '健康なうちに加入して良い条件での契約を確保した',
                '医療保険との役割分担で設計した（入院→医療保険・死亡→生命保険）',
                'じん肺・アスベスト関連疾患の告知義務の有無を確認した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 看護師×医療保険 専用コンテンツ */}
      {isNurseMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">看護師に医療保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              看護師は医療の専門家として、病気や医療制度に精通している職業です。しかしだからこそ「自分は健康管理ができている」「医療費の仕組みを知っているから大丈夫」と民間医療保険への加入を後回しにしがちです。実際には看護師は腰痛・針刺し事故・精神疾患・夜勤によるがんリスクなど、職業特有の医療リスクが非常に高い職種です。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              病院勤務の看護師は健康保険（協会けんぽ等）に加入しており、高額療養費制度・傷病手当金という手厚い公的保障があります。しかし差額ベッド代・先進医療費用・腰痛手術後の長期リハビリ費用などは公的保障ではカバーされず、民間医療保険で補うことが重要です。
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-emerald-800 mb-1">💡 「看護師×医療保険」を検索している方への重要な案内</p>
              <p className="text-emerald-700 text-sm leading-relaxed">
                「看護師 医療保険」で検索すると「看護職賠償責任保険」の情報が多く表示されることがあります。看護職賠償責任保険は医療過誤・対物賠償に備えるもので、このページで解説している「自分が病気・入院した時の医療費への備え」とは全く異なる保険です。本ページでは個人の医療保険について解説します。
              </p>
              <p className="text-xs text-emerald-600 mt-2">看護職賠償責任保険：日本看護協会・年間1,580円で加入可能（別途検討推奨）</p>
            </div>
          </div>

          {/* セクション2：公的保障と医療保険で補う部分 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">看護師の公的保障と民間医療保険で補うべき部分</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">費用・給付の種類</th>
                    <th className="px-4 py-3 text-left font-semibold">公的保障（健康保険・高額療養費）</th>
                    <th className="px-4 py-3 text-left font-semibold">民間医療保険で補う部分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">保険診療の自己負担</td><td className="px-4 py-3">✅ 3割→高額療養費で上限あり</td><td className="px-4 py-3">入院日額・手術給付金で補完</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">差額ベッド代</td><td className="px-4 py-3">❌ 全額自己負担（1日3,000〜10,000円）</td><td className="px-4 py-3">✅ 特約または入院日額で補完</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">先進医療費用</td><td className="px-4 py-3">❌ 全額自己負担（数十〜数百万円）</td><td className="px-4 py-3">✅ 先進医療特約（月100〜200円）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">腰痛手術・リハビリ費用</td><td className="px-4 py-3">△ 高額療養費適用後の自己負担残あり</td><td className="px-4 py-3">✅ 手術給付金・入院日額</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">精神科入院費用</td><td className="px-4 py-3">△ 高額療養費適用されるが長期入院で累積</td><td className="px-4 py-3">✅ 精神疾患特約付き医療保険</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">傷病手当金</td><td className="px-4 py-3">✅ あり（月収67%・最長18ヶ月）</td><td className="px-4 py-3">収入補填は就業不能保険の役割</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              出典：<a href="https://www.kyoukaikenpo.or.jp/g3/cat310/sb3020/r151/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「高額療養費制度について」</a>　<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/sensiniryo/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「先進医療の概要について」</a>
            </p>
          </div>

          {/* セクション3：特有のリスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">看護師が直面する医療リスクの実態（政府統計）</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 腰痛：有病率82%・手術が必要なケースも</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「労働安全衛生調査（2022年）」によると、看護師の腰痛有病率は約82%と業務上疾病の第1位。患者の移乗・体位変換・長時間立位による腰椎への負荷が主因です。腰椎椎間板ヘルニア・腰椎すべり症に発展すると手術（腰椎固定術等）と1〜2ヶ月の入院・リハビリが必要になります。手術費用は100〜200万円規模になることがあり、高額療養費適用後も相当な自己負担が生じます。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② 精神疾患：離職理由第2位・精神科入院リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  日本看護協会「看護職員実態調査（2022年）」によると、看護師の離職理由の第2位は精神的健康問題（21.3%）。重症化した場合は精神科への入院が必要になるケースもあります。精神科の平均入院日数は約278日（厚生労働省「患者調査」2020年）と長く、入院中の医療費・差額ベッド代の累積が大きくなります。精神疾患特約が付帯された医療保険が必須です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 夜勤によるがんリスク：乳がん発症1.3倍</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  国立がん研究センター「多目的コホート研究（2021年）」によると、夜勤従事者の乳がん発症リスクは日勤のみの女性と比較して約1.3倍。看護師は女性が多く夜勤が多い職種であるため、がん保険・医療保険の備えが重要です。乳がんの治療費（手術・抗がん剤・放射線）は高額療養費適用後でも数十万円の自己負担が生じることがあります。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">④ 針刺し事故による感染症リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  日本環境感染学会「針刺し・切創実態調査（2021年）」によると、看護師の針刺し事故は医療従事者全体の約60%。B型肝炎・C型肝炎への感染が判明した場合、抗ウイルス薬による長期治療が必要になります。慢性肝炎から肝硬変・肝がんへ進行するリスクもあり、長期的な医療費への備えが重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mhlw.go.jp/toukei/list/h24-46-50.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働安全衛生調査」2022年</a>　<a href="https://www.nurse.or.jp/nursing/shuroanzen/jitai/" target="_blank" rel="noopener noreferrer" className="underline">日本看護協会「看護職員実態調査」2022年</a>　<a href="https://epi.ncc.go.jp/jphc/outcome/8550.html" target="_blank" rel="noopener noreferrer" className="underline">国立がん研究センター「多目的コホート研究」2021年</a>
            </p>
          </div>

          {/* セクション4：5つのポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">看護師の医療保険選び5つのポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '精神疾患特約付き・入院給付日数の上限を確認する',
                  detail: '看護師の離職理由第2位が精神疾患であることを踏まえ、精神疾患特約は必須です。精神科の平均入院日数は278日と長いため、入院給付日数が60日・180日に制限されている商品では不十分です。1,000日以上または無制限の商品を優先してください。',
                },
                {
                  number: '02',
                  title: '腰痛手術（脊椎手術）が給付対象か確認する',
                  detail: '看護師は腰痛手術リスクが特に高いです。腰椎固定術・椎間板摘出術などの脊椎手術が手術給付金の対象になるかどうかを確認してください。内視鏡手術・レーザー手術も対象になる新しいタイプの手術給付が充実した商品を選びましょう。',
                },
                {
                  number: '03',
                  title: 'がん保険または医療保険のがん特約を付帯する',
                  detail: '夜勤による乳がんリスク（1.3倍）を考慮して、がん診断一時金特約または単独のがん保険との組み合わせを検討してください。乳がんは40代以降に発症率が高まるため、30代のうちに加入しておくことで保険料を抑えられます。',
                },
                {
                  number: '04',
                  title: '先進医療特約は必ず付帯する',
                  detail: '月100〜200円で付帯できる先進医療特約は、がん・脳疾患の最新治療に備えるために必須です。看護師は医療知識が豊富なため、最新の治療を選択する可能性が高いです。先進医療特約で治療の選択肢を広げておきましょう。',
                },
                {
                  number: '05',
                  title: '夜勤手当込みの収入に基づいて保険料・給付額を設計する',
                  detail: '看護師は夜勤手当により基本給より実収入が高いケースが多いです。入院中の収入減少をカバーする観点からも、夜勤手当込みの実収入を基準に保障額を設計することが重要です。就業不能保険も合わせて、総合的な保障設計を検討してください。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション5：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：腰痛手術で入院給付が不十分だった',
                  situation: '35歳女性・病棟看護師。夜勤あり。',
                  problem: '腰椎椎間板ヘルニアの手術で45日間入院。入院日額5,000円の医療保険では給付金22.5万円。差額ベッド代（個室・1日8,000円×45日＝36万円）と合わせると実際の出費は60万円を超えた。',
                  lesson: '看護師は腰痛手術リスクが特に高い。入院日額は最低1万円以上、差額ベッド代特約も付帯すること。',
                },
                {
                  title: '失敗②：精神疾患特約なしで長期入院の給付がゼロ',
                  situation: '28歳女性・ICU勤務看護師。',
                  problem: '患者の急変が続きPTSDと診断されて精神科に3ヶ月入院。加入していた医療保険は精神疾患特約なしのタイプで入院給付がゼロ。傷病手当金はあったが、入院中の医療費・差額ベッド代が全額自己負担になった。',
                  lesson: '看護師は精神疾患リスクが高い。精神疾患特約は必ず付帯すること。',
                },
                {
                  title: '失敗③：看護職賠償責任保険だけで医療保険の代わりにしていた',
                  situation: '30代女性・外来看護師。',
                  problem: '日本看護協会の看護職賠償責任保険（年1,580円）に加入していたが、これは医療過誤への賠償であり自分の入院費用には全く対応していなかった。虫垂炎で入院した際に初めて気づき、医療費が全額自己負担になった。',
                  lesson: '看護職賠償責任保険と個人の医療保険は全く別物。両方に加入することが必要。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '看護職賠償責任保険と個人の医療保険の違いを理解した',
                '高額療養費制度の自己負担上限額を把握した',
                '精神疾患特約付き・入院給付日数1,000日以上の商品を選んだ',
                '腰痛手術（脊椎手術）が給付対象かを確認した',
                'がん特約または単独がん保険で夜勤による乳がんリスクに備えた',
                '先進医療特約（月100〜200円）を付帯した',
                '就業不能保険との組み合わせで総合的な保障を設計した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* フリーランスエンジニア×医療保険 専用コンテンツ */}
      {isFreelanceEngineerMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">フリーランスエンジニアに医療保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              フリーランスエンジニアにとって医療保険は「収入保障保険と並ぶ二大必須保険」の一つです。収入保障保険が「働けない期間の収入補填」を担うのに対し、医療保険は「入院・手術の医療費そのもの」をカバーします。この2つは役割が全く異なり、どちらか一方だけではフリーランスのリスクを十分にカバーできません。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              国民健康保険に加入しているフリーランスエンジニアは、高額療養費制度により月の医療費自己負担に上限はあります。しかし差額ベッド代・食事代・先進医療費用・入院中の生活費などは全額自己負担です。平均年収550万円のフリーランスエンジニアが2週間入院した場合の実質的な経済損失は医療費以外の部分も含めると50〜100万円規模になりえます。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-blue-800 mb-1">💡 収入保障保険との役割の違いを理解する</p>
              <p className="text-blue-700 text-sm leading-relaxed">
                医療保険：入院・手術の医療費をカバー（入院日額・手術給付金）<br />
                収入保障保険：働けない期間の収入をカバー（月額給付金）<br /><br />
                2つは補完関係にあり、フリーランスエンジニアには両方が必要です。
              </p>
            </div>
          </div>

          {/* セクション2：高額療養費制度のカバー範囲 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">高額療養費制度で実はここまでカバーされる・されない</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              民間医療保険の必要性を正確に判断するには、まず公的制度でどこまでカバーされるかを把握することが重要です。
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">費用の種類</th>
                    <th className="px-4 py-3 text-left font-semibold">高額療養費制度</th>
                    <th className="px-4 py-3 text-left font-semibold">民間医療保険</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">保険診療の自己負担（3割）</td><td className="px-4 py-3">✅ 月の上限額超過分は還付</td><td className="px-4 py-3">入院日額・手術給付金で補完</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">差額ベッド代（個室等）</td><td className="px-4 py-3">❌ 全額自己負担</td><td className="px-4 py-3">✅ 特約で補償可能</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">食事代（1食550円）</td><td className="px-4 py-3">❌ 全額自己負担</td><td className="px-4 py-3">△ 入院日額で補完</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">先進医療費用</td><td className="px-4 py-3">❌ 全額自己負担（数十〜数百万円）</td><td className="px-4 py-3">✅ 先進医療特約で補償</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">入院中の交通費・雑費</td><td className="px-4 py-3">❌ 全額自己負担</td><td className="px-4 py-3">△ 入院一時金で補完</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">収入の減少</td><td className="px-4 py-3">❌ 対象外</td><td className="px-4 py-3">収入保障保険の役割</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="font-bold text-amber-800 mb-2">📊 フリーランスエンジニアの2週間入院シミュレーション</p>
              <p className="text-amber-700 text-sm leading-relaxed">
                保険診療の自己負担：約57,600円（高額療養費制度適用後・年収550万円の場合）<br />
                差額ベッド代（個室14日）：約56,000〜140,000円<br />
                食事代（14日×3食×550円）：約23,100円<br />
                入院中の収入損失（2週間）：約211,538円（年収550万円÷12ヶ月÷2）<br />
                <strong>合計損失：約35〜43万円（医療費のみ）</strong><br /><br />
                ※収入損失を含めると50〜100万円規模になる可能性があります。
              </p>
              <p className="text-xs text-amber-600 mt-2">
                出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「高額療養費制度」2024年</a>
              </p>
            </div>
          </div>

          {/* セクション3：特有の医療リスク */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">フリーランスエンジニアが特に注意すべき医療リスク</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 精神疾患・うつ病：入院リスクが高い</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  IT業種の精神障害労災申請は製造業の2.3倍。重症化したうつ病・双極性障害では精神科への入院が必要になるケースがあります。精神科の平均入院日数は約278日と全疾患の中で最長であり（厚生労働省「患者調査」2020年）、入院日額型の医療保険では長期給付が期待できます。ただし精神科入院に対応していない保険もあるため、精神疾患特約の確認が必須です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② 眼精疲労・緑内障リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  長時間のディスプレイ作業による眼精疲労はフリーランスエンジニアに多い職業性疾患です。慢性的な眼精疲労は緑内障のリスク因子にもなりえます。緑内障の治療（レーザー手術・点眼薬の長期使用）は医療費が継続的にかかります。眼科手術が給付対象かどうかも確認してください。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 腱鞘炎・頸椎症の手術リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  手首の腱鞘炎が重症化すると腱鞘切開術が必要になるケースがあります。頸椎症性神経根症・頸椎椎間板ヘルニアでは頸椎の手術（ACDF等）が必要になることもあり、入院期間は2週間〜1ヶ月程度です。これらの手術・入院が医療保険の給付対象になることを確認してください。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">④ 若いうちの加入が圧倒的に有利</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  医療保険の保険料は年齢が上がるほど高くなります。20代での加入と40代での加入では、同じ保障内容で月額保険料が2〜3倍異なることがあります。フリーランスになったタイミング（多くは20〜30代）で医療保険に加入しておくことが長期的な保険料節約につながります。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mhlw.go.jp/toukei/saikin/hw/kanja/20/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「患者調査」2020年</a>　<a href="https://www.mhlw.go.jp/content/11200000/001148172.pdf" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「過労死等防止対策白書」2022年</a>
            </p>
          </div>

          {/* セクション4：5つのチェックポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">フリーランスエンジニアの医療保険選び5つのポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '精神疾患特約は必須・入院給付に上限のない商品を選ぶ',
                  detail: 'IT業種は精神疾患リスクが製造業の2.3倍。精神科の平均入院日数は約278日と非常に長いため、精神疾患特約付きかつ入院給付日数に上限のない（または1,000日超の）商品を選んでください。給付日数が60日・180日に制限されている商品では長期の精神科入院に対応できません。',
                },
                {
                  number: '02',
                  title: '先進医療特約は月100〜200円で必ず付帯する',
                  detail: '陽子線治療・重粒子線治療などの先進医療は数十〜数百万円の費用がかかります。月100〜200円の先進医療特約で最大2,000万円程度の保障が得られるため、必ず付帯してください。フリーランスは健康が資本であり、最新の治療を受ける選択肢を持つことが重要です。',
                },
                {
                  number: '03',
                  title: '入院一時金型と日額型の使い分けを理解する',
                  detail: '近年の入院は短期化しており（一般病床平均16日）、短期入院には入院一時金型（1入院10〜30万円）が有利です。しかしフリーランスエンジニアが最も心配すべき精神科入院は長期化しやすいため、日額型（1日1万円×長期）との組み合わせが理想的です。',
                },
                {
                  number: '04',
                  title: '腱鞘炎・眼科手術の給付条件を確認する',
                  detail: '腱鞘切開術・緑内障手術・白内障手術などの眼科・整形外科の手術が給付対象かどうかを確認してください。「開腹手術・開胸手術のみ対象」という古いタイプの手術給付では、内視鏡手術・レーザー手術が対象外になる場合があります。',
                },
                {
                  number: '05',
                  title: '収入保障保険と合わせて月額保険料を設計する',
                  detail: 'フリーランスエンジニアは医療保険と収入保障保険の両方が必要です。2つ合わせた月額保険料が月収の3〜5%以内に収まるよう設計してください。月収50万円なら2つ合わせて月1.5〜2.5万円以内が目安です。優先順位は収入保障保険＞医療保険です。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション5：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：精神疾患特約なしで長期入院に対応できなかった',
                  situation: '32歳男性フリーランスエンジニア。',
                  problem: 'うつ病で精神科に4ヶ月入院。加入していた医療保険は精神疾患特約なしのため入院給付ゼロ。収入保障保険の給付はあったが、入院中の医療費・差額ベッド代が全額自己負担で貯蓄が大幅に減少した。',
                  lesson: 'フリーランスエンジニアには精神疾患特約付きの医療保険が必須。',
                },
                {
                  title: '失敗②：先進医療特約なしでがん治療に数百万円',
                  situation: '38歳男性フリーランスエンジニア。',
                  problem: '大腸がんと診断され、陽子線治療（先進医療）を希望。費用約294万円が全額自己負担。医療保険に加入していたが先進医療特約をつけていなかった。月200円の特約で防げた損失だった。',
                  lesson: '先進医療特約は月100〜200円で付帯できる。加入時に必ず確認すること。',
                },
                {
                  title: '失敗③：収入保障保険のみで医療費が想定外の出費に',
                  situation: '29歳女性フリーランスエンジニア。',
                  problem: '収入保障保険のみに加入していた。腱鞘炎の手術で10日間入院。手術費・入院費・差額ベッド代で35万円の出費。収入保障保険の給付（月15万円の1/3）では医療費をカバーできず貯蓄を崩すことになった。',
                  lesson: '収入保障保険と医療保険は別の役割。フリーランスには両方が必要。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '高額療養費制度の自己負担上限額（年収550万円：月57,600円）を把握した',
                '差額ベッド代・食事代・先進医療費用は自己負担であることを理解した',
                '精神疾患特約付き・入院給付日数に上限のない商品を選んだ',
                '先進医療特約（月100〜200円）を付帯した',
                '腱鞘炎手術・眼科手術の給付条件を確認した',
                '収入保障保険との組み合わせで月額保険料を月収の3〜5%以内に設計した',
                '若いうちに加入して長期的な保険料を節約した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* パート・アルバイト×医療保険 専用コンテンツ */}
      {isPartTimeMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">パート・アルバイトに医療保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              パート・アルバイトは正社員と比べて公的保障が手薄になりやすく、病気・ケガで働けなくなった際のリスクが特に高い雇用形態です。厚生労働省「パートタイム・有期雇用労働者総合実態調査（2021年）」によると、パート・アルバイトの社会保険非加入率は約40%（週20時間未満）。社会保険に加入していない場合、傷病手当金がなく医療費の自己負担も増える可能性があります。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              平均年収180万円前後のパート・アルバイト層にとって、医療費の急な自己負担は家計に直撃します。月額1,000〜3,000円程度の医療保険で最低限の備えをしておくことが、生活防衛の観点から重要です。
            </p>
            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-teal-800 mb-1">💡 パート・アルバイトが医療保険を考える際の最重要ポイント</p>
              <p className="text-teal-700 text-sm leading-relaxed">
                まず自分が社会保険（健康保険）に加入しているかどうかを確認してください。週20時間以上・月収88,000円以上（年収106万円以上）で社会保険適用事業所に勤務している場合、社会保険に加入でき傷病手当金の対象になります。加入していない場合は国民健康保険となり、傷病手当金がないため民間医療保険の重要性が高まります。
              </p>
              <p className="text-xs text-teal-600 mt-2">出典：<a href="https://www.mhlw.go.jp/tekiyo/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「社会保険適用拡大特設サイト」</a></p>
            </div>
          </div>

          {/* セクション2：社会保険加入状況と医療保険の必要性 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">社会保険の加入状況別・医療保険の必要性</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">項目</th>
                    <th className="px-4 py-3 text-left font-semibold">社会保険加入パート（週20h以上等）</th>
                    <th className="px-4 py-3 text-left font-semibold">社会保険非加入パート（国民健康保険）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">健康保険の種類</td><td className="px-4 py-3">健康保険（協会けんぽ）</td><td className="px-4 py-3">国民健康保険</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">傷病手当金</td><td className="px-4 py-3">✅ あり（月収の約67%・最長18ヶ月）</td><td className="px-4 py-3">❌ なし</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">医療費自己負担</td><td className="px-4 py-3">3割（高額療養費制度あり）</td><td className="px-4 py-3">3割（高額療養費制度あり）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">出産手当金</td><td className="px-4 py-3">✅ あり</td><td className="px-4 py-3">❌ なし</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">民間医療保険の必要性</td><td className="px-4 py-3">中（差額ベッド代・先進医療への備え）</td><td className="px-4 py-3">高（傷病手当金なし・収入補填が必要）</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              出典：<a href="https://www.mhlw.go.jp/tekiyo/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「社会保険適用拡大特設サイト」</a>　<a href="https://www.kyoukaikenpo.or.jp/g3/cat320/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「傷病手当金について」</a>
            </p>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <p className="font-bold text-blue-800 mb-2">📋 社会保険加入の確認方法</p>
              <p className="text-blue-700 text-sm leading-relaxed">
                以下の条件を全て満たす場合、社会保険への加入が義務付けられています：<br />
                ① 週の所定労働時間が20時間以上<br />
                ② 月収88,000円以上（年収106万円以上）<br />
                ③ 勤務期間が2ヶ月超の見込み<br />
                ④ 学生でない<br />
                ⑤ 従業員51人以上の企業に勤務（2024年10月〜）<br /><br />
                給与明細で「健康保険料」が引かれていれば社会保険加入済みです。
              </p>
              <p className="text-xs text-blue-600 mt-2">出典：<a href="https://www.mhlw.go.jp/tekiyo/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「社会保険適用拡大」2024年10月改正</a></p>
            </div>
          </div>

          {/* セクション3：リスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">パート・アルバイトが直面する健康・生活リスクの実態</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 社会保険非加入率：約40%（週20時間未満）</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「パートタイム・有期雇用労働者総合実態調査（2021年）」によると、週20時間未満のパート・アルバイトの社会保険非加入率は約40%。傷病手当金がない国民健康保険加入者は病気・ケガで働けなくなると即座に収入がゼロになります。低収入のパート層にとって、収入ゼロは生活の危機に直結します。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② 労働災害発生率：正社員の約1.3倍</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「労働災害発生状況（2023年）」によると、パート・アルバイトの労働災害発生率は正社員の約1.3倍。安全教育の不足・不慣れな作業環境が主な原因です。飲食・小売・介護などパートが多い業種での転倒・切創・腰痛が多発しています。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 低収入による医療費負担の相対的な重さ</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「賃金構造基本統計調査（2023年）」によると、パート・アルバイトの平均年収は約180万円（月収約15万円）。高額療養費制度の自己負担上限は月約18,000〜57,600円ですが、月収15万円の家庭にとってこれは家計の10〜38%に相当します。入院による収入減少と医療費の二重の打撃が家計に深刻な影響を与えます。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">④ 国民健康保険料の負担</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  国民健康保険の保険料は前年収入を基に算定されます。収入が変動しやすいパート・アルバイトは前年より収入が減った場合でも前年収入に基づく高い保険料を払い続けるリスクがあります。減額申請の手続きを知っておくことも重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mhlw.go.jp/toukei/list/h23-pt.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「パートタイム・有期雇用労働者総合実態調査」2021年</a>　<a href="https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei11/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働災害発生状況」2023年</a>　<a href="https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2023/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「賃金構造基本統計調査」2023年</a>
            </p>
          </div>

          {/* セクション4：最適な医療保険の選び方 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">パート・アルバイトに最適な医療保険の選び方</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              低収入のパート・アルバイトにとって、保険料の負担を最小限に抑えながら最低限の保障を確保することが重要です。
            </p>
            <div className="bg-green-50 rounded-xl p-5 border border-green-200 mb-5">
              <p className="font-bold text-green-800 mb-2">💰 パート・アルバイトにおすすめの保険選びの原則</p>
              <ul className="text-green-700 text-sm space-y-2">
                <li>✅ 月額保険料1,000〜2,000円以内を目標に設定する</li>
                <li>✅ 入院一時金型（短期入院でもまとまった給付）を優先する</li>
                <li>✅ 先進医療特約（月100〜200円）は必ず付帯する</li>
                <li>✅ 社会保険非加入の場合は就業不能保険との組み合わせも検討</li>
                <li>❌ 過剰な特約・高額な保険料は避ける</li>
              </ul>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">保険の種類</th>
                    <th className="px-4 py-3 text-left font-semibold">月額保険料目安</th>
                    <th className="px-4 py-3 text-left font-semibold">パート・アルバイトへの適合度</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">入院一時金型医療保険</td><td className="px-4 py-3">1,000〜2,500円</td><td className="px-4 py-3">✅ 高（短期入院でも給付・シンプル）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">日額型医療保険（5,000円/日）</td><td className="px-4 py-3">1,500〜3,000円</td><td className="px-4 py-3">△ 中（長期入院に強いが保険料が高め）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">県民共済・都民共済</td><td className="px-4 py-3">1,000〜2,000円</td><td className="px-4 py-3">✅ 高（低価格・シンプル・審査が通りやすい）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">就業不能保険</td><td className="px-4 py-3">2,000〜5,000円</td><td className="px-4 py-3">社会保険非加入者には高優先度</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">※保険料は年齢・性別・保障内容により異なります</p>
          </div>

          {/* セクション5：5つのチェックポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前に確認すべき5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '社会保険に加入しているかどうかを先に確認する',
                  detail: '給与明細で「健康保険料」が引かれているか確認してください。社会保険加入済みなら傷病手当金があるため、民間医療保険は差額ベッド代・先進医療特約に絞った最小限の保障で十分なケースが多いです。未加入なら民間医療保険＋就業不能保険の組み合わせが重要です。',
                },
                {
                  number: '02',
                  title: '月額保険料1,000〜2,000円以内に抑える',
                  detail: '年収180万円のパート・アルバイトにとって、月額3,000円超の保険料は家計負担が重くなります。県民共済・都民共済（月額1,000〜2,000円）やネット系の入院一時金型医療保険で保険料を抑えながら必要な保障を確保してください。',
                },
                {
                  number: '03',
                  title: '先進医療特約は必ず付帯する',
                  detail: '月100〜200円で付帯できる先進医療特約は、低収入のパート・アルバイトにとっても数百万円の先進医療費用へのリスクヘッジとして重要です。保険料が安い特約なので、必ず付帯することをお勧めします。',
                },
                {
                  number: '04',
                  title: '国民健康保険の高額療養費制度を理解する',
                  detail: '国民健康保険でも高額療養費制度は適用されます。年収180万円のパート・アルバイトの場合、月の医療費自己負担上限は約18,000円（住民税非課税世帯）〜57,600円程度。これを超える分は還付されます。まず公的制度の内容を把握した上で、カバーできない部分のみ民間保険で補ってください。',
                },
                {
                  number: '05',
                  title: '社会保険加入を検討する（106万円・130万円の壁）',
                  detail: '年収を106万円以上にすることで社会保険に加入でき、傷病手当金・出産手当金などの手厚い保障が得られます。いわゆる「106万円・130万円の壁」を意識して勤務時間・収入を調整している方も多いですが、社会保険に加入することで民間保険への依存度を大幅に下げられる場合があります。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：社会保険未加入で入院費が家計を直撃',
                  situation: '30代女性・スーパーパート。週18時間勤務。月収10万円。',
                  problem: '虫垂炎で10日間入院。社会保険未加入のため傷病手当金なし。入院中の収入ゼロ＋医療費自己負担3万円が重なり、家賃支払いが困難になった。民間医療保険にも未加入だった。',
                  lesson: '社会保険未加入のパートは民間医療保険が生活防衛の最後の砦。月1,000〜2,000円で最低限の備えをすること。',
                },
                {
                  title: '失敗②：高額な医療保険に加入して保険料が払えなくなった',
                  situation: '20代女性・カフェアルバイト。月収12万円。',
                  problem: '知人の勧めで月額4,500円の医療保険に加入。半年後に収入が減り、保険料の支払いが苦しくなって解約。解約返戻金もなく、支払った保険料が無駄になった。',
                  lesson: '収入に見合った保険料設定が重要。月収の1〜2%（月収12万円なら1,200〜2,400円）を目安に。',
                },
                {
                  title: '失敗③：高額療養費制度を知らず医療費を全額自己負担',
                  situation: '40代女性・工場パート。国民健康保険加入。',
                  problem: '手術で医療費が50万円かかると言われ、高額療養費制度を知らずに全額支払い。後から制度を知り申請したが、時効（2年）を過ぎていた部分は還付されなかった。',
                  lesson: '高額療養費制度は必ず申請すること。入院前に病院の窓口で「限度額適用認定証」を申請すれば、窓口での支払いを上限額以内に抑えられる。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション7：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '社会保険（健康保険）への加入状況を給与明細で確認した',
                '高額療養費制度の自己負担上限額（住民税非課税：約18,000円）を把握した',
                '限度額適用認定証の申請方法を確認した',
                '月額保険料1,000〜2,000円以内の医療保険を選んだ',
                '先進医療特約（月100〜200円）を付帯した',
                '社会保険未加入の場合は就業不能保険との組み合わせを検討した',
                '社会保険加入の可否（106万円・130万円の壁）を確認した',
                '国民健康保険料の減額申請制度を確認した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 営業職×生命保険 専用コンテンツ */}
      {isSalesLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">営業職に生命保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              営業職は日本のビジネスの最前線を担う職種ですが、ノルマプレッシャー・接待・外回りなど心身への負荷が大きい職業です。厚生労働省「職場における心の健康づくり（2022年）」によると、営業職のメンタルヘルス不調率は全職種平均の1.4倍。また不規則な食事・接待による生活習慣病リスクも高く、30〜40代での重大疾患リスクが懸念されます。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              営業職は歩合給・インセンティブが含まれる場合が多く、病気・ケガで長期休業した場合の収入損失が固定給社員より大きくなりやすい特徴があります。特に子育て世代の30〜40代営業職にとって、生命保険による死亡保障と就業不能保険による収入補償の両立が家族を守る最重要手段です。
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-orange-800 mb-1">💡 営業職が生命保険を考える際の重要な前提</p>
              <p className="text-orange-700 text-sm leading-relaxed">
                歩合給・インセンティブがある営業職は、傷病手当金の計算基準となる「標準報酬月額」が実際の収入より低くなるケースがあります。傷病手当金で補われる金額を事前に確認した上で、不足分を民間保険で補う設計が重要です。
              </p>
              <p className="text-xs text-orange-600 mt-2">出典：<a href="https://www.kyoukaikenpo.or.jp/g3/cat320/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「傷病手当金について」</a></p>
            </div>
          </div>

          {/* セクション2：公的保障と生命保険の役割 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">営業職の公的保障と生命保険で補うべき金額</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">給付の種類</th>
                    <th className="px-4 py-3 text-left font-semibold">会社員営業職</th>
                    <th className="px-4 py-3 text-left font-semibold">独立営業（個人事業主）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">遺族厚生年金</td><td className="px-4 py-3">✅ あり（報酬比例）</td><td className="px-4 py-3">❌ なし</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">遺族基礎年金</td><td className="px-4 py-3">✅ あり（子あり：約102万円/年）</td><td className="px-4 py-3">✅ あり（同額）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">傷病手当金</td><td className="px-4 py-3">✅ あり（標準報酬月額の67%・最長18ヶ月）</td><td className="px-4 py-3">❌ なし</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">歩合給の扱い</td><td className="px-4 py-3">⚠️ 標準報酬月額に反映されるが変動あり</td><td className="px-4 py-3">❌ 全額自己リスク</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">退職金</td><td className="px-4 py-3">✅ あり（会社による）</td><td className="px-4 py-3">❌ なし</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              出典：<a href="https://www.kyoukaikenpo.or.jp/g3/cat320/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「傷病手当金について」</a>　<a href="https://www.nenkin.go.jp/service/jukyu/izokunenkin/jukyu-yoken/20150401-04.html" target="_blank" rel="noopener noreferrer" className="underline">日本年金機構「遺族厚生年金」</a>
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="font-bold text-yellow-800 mb-1">⚠️ 歩合給営業職の傷病手当金に注意</p>
              <p className="text-yellow-700 text-sm leading-relaxed">
                傷病手当金は「標準報酬月額の67%」が基準です。歩合給・インセンティブが多い月と少ない月で標準報酬月額が変動する場合、実際の手取り収入より傷病手当金が大幅に少なくなるケースがあります。健保組合に標準報酬月額を確認しておきましょう。
              </p>
            </div>
          </div>

          {/* セクション3：リスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">営業職が直面する健康・生命リスクの実態</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 精神疾患：全職種平均の1.4倍</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「職場における心の健康づくり（2022年）」によると、営業職のメンタルヘルス不調率は全職種平均の1.4倍。ノルマ未達のプレッシャー・顧客クレーム対応・上司からの叱責がストレス源として上位を占めます。うつ病・適応障害による長期休業は歩合給営業職にとって収入の大幅な減少を意味します。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② 交通事故リスク：外回り営業は3.2倍</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  損害保険料率算出機構「自動車保険統計（2022年）」によると、車を使った外回り営業従事者の交通事故遭遇率はデスクワーカーの約3.2倍。重大事故による長期入院・後遺症リスクがあり、生命保険・医療保険の備えが重要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 生活習慣病：接待・不規則勤務による高リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「国民健康・栄養調査（2022年）」によると、接待・不規則な食事時間・飲酒機会の多い営業職は生活習慣病リスクが一般オフィスワーカーの1.3倍。40代での心疾患・脳血管疾患リスクが高く、家族のいる営業職にとって死亡保障の重要性は特に高いです。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">④ 高い離職率：収入不安定リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「雇用動向調査（2022年）」によると、営業・販売職の離職率は全職種平均より高い水準にあります。転職・独立を繰り返す営業職は、転職の度に保険の見直しが必要になるため、終身型の保険で長期的な保障を確保することが重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei12/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「職場における心の健康づくり」2022年</a>　<a href="https://www.mhlw.go.jp/toukei/list/20-21.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「雇用動向調査」2022年</a>
            </p>
          </div>

          {/* セクション4：ライフステージ別の必要保障額 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">営業職のライフステージ別・必要な生命保険の考え方</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  stage: '20代・独身',
                  avgIncome: '年収350〜450万円',
                  need: '低',
                  needColor: 'bg-green-100 text-green-800',
                  detail: '扶養家族なし。医療保険・就業不能保険を優先。生命保険は結婚まで最小限でよい。',
                },
                {
                  stage: '30代・既婚・子あり',
                  avgIncome: '年収450〜600万円',
                  need: '高',
                  needColor: 'bg-red-100 text-red-800',
                  detail: '最も必要保障額が大きい時期。住宅ローン・教育費・配偶者の生活費を考慮した保障額設定が必須。目安：年収×10〜15年分。',
                },
                {
                  stage: '40代・収入ピーク',
                  avgIncome: '年収500〜700万円',
                  need: '中〜高',
                  needColor: 'bg-orange-100 text-orange-800',
                  detail: 'ノルマ・プレッシャー増加でメンタルリスクが高まる時期。住宅ローン残債減少につれて保障額を見直す。がん保険との組み合わせも重要。',
                },
                {
                  stage: '50代・定年前',
                  avgIncome: '年収500〜650万円',
                  need: '中',
                  needColor: 'bg-blue-100 text-blue-800',
                  detail: '子の独立・住宅ローン完済で必要保障額は減少。退職後の保障継続を考慮して終身保険への切り替えを検討。',
                },
              ].map((s, i) => (
                <div key={i} className="bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-gray-900 text-sm">{s.stage}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.needColor}`}>必要度：{s.need}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{s.avgIncome}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* セクション5：5つのチェックポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前に確認すべき5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '標準報酬月額と実際の収入の差を確認する',
                  detail: '歩合給・インセンティブがある場合、傷病手当金の基準となる標準報酬月額が実際の手取りより低い可能性があります。健保組合・会社の総務部門に自分の標準報酬月額を確認してから必要な保険金額を設計してください。',
                },
                {
                  number: '02',
                  title: '必要保障額は住宅ローン・教育費を含めて計算する',
                  detail: '営業職は30〜40代に収入が高くなりやすい反面、住宅ローン・子の教育費が重なる時期でもあります。必要保障額 ＝ 遺族生活費 ＋ 教育費 ＋ 住宅ローン残債 − 公的年金 − 貯蓄 という計算式で、漏れなく必要額を算出してください。',
                },
                {
                  number: '03',
                  title: '精神疾患特約を付帯した就業不能保険との組み合わせ',
                  detail: '営業職のメンタルヘルス不調率は平均の1.4倍。生命保険と合わせて就業不能保険（精神疾患特約付き）への加入を強く推奨します。特にノルマの厳しい保険営業・不動産営業・金融営業従事者は精神疾患リスクが特に高いです。',
                },
                {
                  number: '04',
                  title: '転職・独立時の保険継続を確認する',
                  detail: '転職や独立（フリーランス化）の際、会社の団体保険は継続できなくなります。個人契約の保険で長期的な保障を確保しておくことで、転職・独立後も保障が途切れません。特に独立後は傷病手当金がなくなるため、就業不能保険の継続が重要です。',
                },
                {
                  number: '05',
                  title: '収入保障保険で効率的に保障を確保する',
                  detail: '一括払いの死亡保険金より、毎月一定額が支給される「収入保障保険」が営業職の家族には使いやすいケースがあります。遺族が毎月の生活費として受け取れるため、大金の管理リスクがなく計画的な生活設計が可能です。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：歩合給で傷病手当金が思ったより少なかった',
                  situation: '35歳男性・不動産営業。月収手取り70万円（歩合込み）。',
                  problem: 'うつ病で6ヶ月休業。傷病手当金を受け取ったが、標準報酬月額が35万円だったため月約23万円しか受け取れなかった。実際の手取りの3分の1以下で生活が苦しくなった。',
                  lesson: '歩合給が多い場合、標準報酬月額と実収入の差を事前に確認し、不足分を就業不能保険で補うこと。',
                },
                {
                  title: '失敗②：転職時に団体保険が終了し保障がゼロに',
                  situation: '40歳男性・メーカー営業から独立系営業へ転職。',
                  problem: '前職の団体生命保険（死亡保障3,000万円）に頼っていたが、転職と同時に保障が終了。新職場には団体保険なし。転職後に個人で生命保険に加入しようとしたが、転職直後の収入不安定を理由に高額保険への加入審査が通りにくかった。',
                  lesson: '転職前に個人契約の生命保険に加入しておくこと。団体保険だけに頼るのは危険。',
                },
                {
                  title: '失敗③：必要保障額を過小評価して遺族が困窮',
                  situation: '38歳男性・金融営業。年収650万円。妻と子2人。',
                  problem: '「公的年金があるから」と生命保険を最小限に設定。39歳で交通事故死。遺族年金と貯蓄では子2人の教育費・住宅ローン・生活費を賄えず、妻がフルタイム復帰を余儀なくされた。',
                  lesson: '遺族年金だけでは生活費の大部分をカバーできない。年収・家族構成に見合った必要保障額を正確に計算すること。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション7：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '標準報酬月額と実際の手取り収入の差を確認した',
                '必要保障額（遺族生活費＋教育費＋住宅ローン−公的年金−貯蓄）を計算した',
                '精神疾患特約付き就業不能保険との組み合わせを検討した',
                '転職・独立時の保険継続を個人契約で確保した',
                '収入保障保険による効率的な保障設計を検討した',
                '30〜40代のリスクが最大の時期に保障額を最大化した',
                'がん保険・医療保険との組み合わせも確認した',
                '複数の保険会社・FPで見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 医師×生命保険 専用コンテンツ */}
      {isDoctorLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">医師に生命保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              医師は日本最高水準の収入を誇る職業ですが、その高収入ゆえに生命保険の必要性も極めて高くなります。平均年収1,200万円（男性）の医師が死亡した場合、遺族が失う収入損失は数億円規模に達します。公的な遺族年金だけではこの損失を到底補えず、民間生命保険による手厚い死亡保障が不可欠です。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              また医師特有のリスクとして、長時間労働による過労死・燃え尽き症候群・感染症罹患があります。厚生労働省の調査（2022年）によると、勤務医の週60時間以上労働は46.3%、特定機能病院では週80時間超が18.1%に達します。高収入職種だからこそ、万一の際の家族への影響は甚大であり、適切な生命保険設計が求められます。
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-emerald-800 mb-1">💡 医師が生命保険を考える際の重要な前提</p>
              <p className="text-emerald-700 text-sm leading-relaxed">
                医師が「保険」で検索する場合、「医師賠償責任保険（医療過誤への備え）」と「生命保険（死亡・就業不能への備え）」を混同するケースがあります。本ページは後者の「個人の生命保険」について解説します。医師賠償責任保険は勤務先病院が加入しているケースが多いですが、開業医・フリーランス医師は個人での加入を検討してください。
              </p>
            </div>
          </div>

          {/* セクション2：公的保障と必要保障額 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">医師の公的遺族保障と民間生命保険で補うべき金額</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">給付の種類</th>
                    <th className="px-4 py-3 text-left font-semibold">勤務医</th>
                    <th className="px-4 py-3 text-left font-semibold">開業医（個人事業主）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">遺族厚生年金</td><td className="px-4 py-3">✅ あり（報酬比例）</td><td className="px-4 py-3">❌ なし（国民年金のみ）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">遺族基礎年金</td><td className="px-4 py-3">✅ あり（子あり：約102万円/年）</td><td className="px-4 py-3">✅ あり（同額）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">傷病手当金</td><td className="px-4 py-3">✅ あり（月収67%・最長18ヶ月）</td><td className="px-4 py-3">❌ なし</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">退職金</td><td className="px-4 py-3">✅ あり（勤続年数による）</td><td className="px-4 py-3">△ 小規模企業共済等で自助努力</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              年収1,200万円の勤務医が40歳で死亡した場合、定年（65歳）までの25年間の収入損失は3億円。遺族厚生年金・遺族基礎年金の合計は年間200〜300万円程度のため、収入損失の大部分は民間生命保険で補う必要があります。
            </p>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <p className="font-bold text-blue-900 mb-2">医師の必要保障額の計算例</p>
              <p className="text-blue-800 text-sm leading-relaxed">
                年収1,200万円・40歳・妻と子2人の場合：<br /><br />
                遺族の生活費：月40万円×12ヶ月×25年 ＝ 1億2,000万円<br />
                教育費（子2人）：約2,000万円<br />
                住宅ローン残債：約3,000万円（仮定）<br />
                葬儀費用：約200万円<br />
                合計：約1億7,200万円<br /><br />
                遺族厚生・基礎年金（25年分）：約6,250万円<br />
                貯蓄：約2,000万円（仮定）<br /><br />
                <strong>民間生命保険で補うべき金額：約8,950万円</strong>
              </p>
              <p className="text-xs text-blue-600 mt-2">※あくまで試算例。実際は家族構成・貯蓄額・支出により大きく異なります。</p>
            </div>
          </div>

          {/* セクション3：リスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">医師が直面する生命・健康リスクの実態</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 長時間労働・過労：週60時間超が46.3%</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「医師の働き方改革 実態調査（2022年）」によると、勤務医の週60時間以上労働は46.3%、特定機能病院（大学病院等）では週80時間超が18.1%に達します。過労による心疾患・脳血管疾患リスクが高く、40〜50代の勤務医での過労死事例が相次いでいます。2024年4月から勤務医の時間外労働規制が強化されましたが、依然として高負荷な労働環境が続いています。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② バーンアウト・精神疾患：約40%が経験</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  日本医師会「勤務医の健康支援に関する検討報告書（2022年）」によると、医師のバーンアウト経験率は約40%、うつ症状の有病率は一般人口の約2倍に相当します。患者の死亡・医療ミスへのプレッシャー・訴訟リスクへの恐怖が精神的負荷の主な原因です。精神疾患による長期休業は就業不能保険の問題ですが、生命保険の観点からも死亡リスクを高める要因として認識が必要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 感染症リスク：B型肝炎・C型肝炎の職業的感染</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「医療機関における院内感染対策（2022年）」によると、B型肝炎・C型肝炎の職業的感染リスクは一般人口の約4〜6倍。針刺し事故・血液曝露による感染が主経路です。慢性肝炎・肝硬変・肝がんへの進行リスクがあり、長期的な医療費と就業能力への影響を考えると医療保険・生命保険の重要性は高いです。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">④ 医療訴訟リスク：キャリア中25%が経験</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  日本医師会「医師賠償責任保険統計（2021年）」によると、医師はキャリア中に約25%が何らかの訴訟・紛争を経験します。訴訟による精神的ダメージ・診療継続困難による収入途絶リスクがあり、医師賠償責任保険（勤務先または個人）との組み合わせが重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mhlw.go.jp/content/10800000/000986982.pdf" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「医師の働き方改革 実態調査」2022年</a>
              　<a href="https://www.med.or.jp/nichiionline/article/010673.html" target="_blank" rel="noopener noreferrer" className="underline">日本医師会「勤務医の健康支援に関する検討報告書」2022年</a>
            </p>
          </div>

          {/* セクション4：勤務医 vs 開業医の保険戦略 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">勤務医 vs 開業医：生命保険戦略の根本的な違い</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">項目</th>
                    <th className="px-4 py-3 text-left font-semibold">勤務医</th>
                    <th className="px-4 py-3 text-left font-semibold">開業医（個人事業主）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">収入の安定性</td><td className="px-4 py-3">✅ 固定給・比較的安定</td><td className="px-4 py-3">△ 診療報酬・患者数に依存</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">傷病手当金</td><td className="px-4 py-3">✅ あり（月収67%・最長18ヶ月）</td><td className="px-4 py-3">❌ なし</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">退職金</td><td className="px-4 py-3">✅ あり</td><td className="px-4 py-3">❌ なし（自助努力が必要）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">事業承継リスク</td><td className="px-4 py-3">❌ なし</td><td className="px-4 py-3">✅ 死亡時の診療所閉院リスク</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">法人保険の活用</td><td className="px-4 py-3">△ 限定的</td><td className="px-4 py-3">✅ 医療法人化で節税効果</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">生命保険の優先度</td><td className="px-4 py-3">高（高収入×家族への影響大）</td><td className="px-4 py-3">極めて高（傷病手当金なし×事業リスク）</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              開業医は死亡時に診療所を閉院せざるを得ないケースが多く、従業員への退職金・医療機器のリース残債・患者への影響など、個人の生命保険以外の事業継続リスクへの備えも必要です。医療法人化している場合は法人保険の活用も検討してください。
            </p>
          </div>

          {/* セクション5：5つのチェックポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前に確認すべき5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '必要保障額を正確に計算する（億単位になるケースが多い）',
                  detail: '年収1,000万円超の医師の場合、必要保障額は5,000万円〜1億円以上になるケースが多いです。遺族の生活費・教育費・住宅ローン・葬儀費用を合計し、公的遺族年金・貯蓄を差し引いた金額が民間保険で補うべき額です。高額な保障が必要なため、逓減定期保険や収入保障保険で保険料を効率化することを検討してください。',
                },
                {
                  number: '02',
                  title: '逓減定期保険・収入保障保険で効率的に保障を確保する',
                  detail: '億単位の死亡保障を通常の定期保険で確保すると保険料が高額になります。「収入保障保険（毎月一定額を年金形式で支給）」や「逓減定期保険（時間とともに保障額が減少・保険料が安い）」を活用することで、必要な保障を効率的に確保できます。',
                },
                {
                  number: '03',
                  title: '開業医は事業リスクと個人リスクを分けて考える',
                  detail: '開業医の場合、診療所の事業継続リスク（従業員への影響・医療機器リース残債・患者への影響）と個人の生命保険（家族の生活費）を分けて設計することが重要です。医療法人化している場合は法人保険（経営者保険）との組み合わせを税理士・FPに相談してください。',
                },
                {
                  number: '04',
                  title: '医師賠償責任保険と生命保険の役割を明確に区別する',
                  detail: '医師賠償責任保険は医療過誤による患者への賠償に備えるもので、生命保険（死亡・就業不能）とは全く別の保険です。勤務先病院が医師賠償責任保険に加入している場合でも、個人の死亡・就業不能リスクには別途民間生命保険が必要です。',
                },
                {
                  number: '05',
                  title: '就業不能保険との組み合わせを検討する',
                  detail: '高収入の医師が就業不能になった場合の収入損失は一般職種より遥かに大きくなります。特に開業医は傷病手当金がないため、就業不能保険（月額給付金30万円以上）との組み合わせが重要です。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：必要保障額を過小評価して家族が困窮',
                  situation: '42歳男性・勤務医。年収1,300万円。妻と子2人。',
                  problem: '「貯蓄があるから大丈夫」と生命保険を最小限に設定。43歳で急性心筋梗塞で死亡。貯蓄2,000万円と遺族年金では子の教育費・住宅ローン・生活費を賄えず、妻が職場復帰を余儀なくされた。',
                  lesson: '高収入医師ほど必要保障額は大きい。貯蓄では補えない収入損失に備えること。',
                },
                {
                  title: '失敗②：開業後に就業不能になり診療所を閉院',
                  situation: '45歳男性・開業医。クリニック経営。',
                  problem: 'うつ病で6ヶ月休業。傷病手当金がない開業医のため収入ゼロ。スタッフの給与・医療機器リース料・テナント賃料が払えず、やむなく閉院。患者への影響も甚大だった。',
                  lesson: '開業医は就業不能保険が特に重要。個人収入の補填に加え、クリニックの固定費もカバーできる保障額を設定すること。',
                },
                {
                  title: '失敗③：医師賠償責任保険で生命保険の代わりにならないと気づかなかった',
                  situation: '35歳女性・勤務医。',
                  problem: '「病院が医師賠償責任保険に加入しているから保険は大丈夫」と思っていたが、これは医療過誤への賠償であり自身の死亡・就業不能には全く対応していなかった。子供が生まれたタイミングでFPに相談して初めて気づき、慌てて生命保険に加入した。',
                  lesson: '医師賠償責任保険と個人の生命保険は全く別物。それぞれ独立して検討すること。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション7：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '年収を基に必要保障額（5,000万〜1億円以上）を計算した',
                '公的遺族年金・退職金・貯蓄を差し引いた不足額を把握した',
                '収入保障保険・逓減定期保険で効率的な保障設計を検討した',
                '開業医の場合は事業継続リスクと個人リスクを分けて設計した',
                '医師賠償責任保険と生命保険の役割の違いを理解した',
                '就業不能保険（特に開業医）との組み合わせを検討した',
                '医療法人化している場合は法人保険の活用を税理士に相談した',
                '複数のFP・保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ドライバー×医療保険 専用コンテンツ */}
      {isDriverMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">トラックドライバー・運転手に医療保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              トラックドライバー・運転手は日本の物流を支える重要な職種ですが、健康リスクの観点では全職種の中でも特にリスクが高い職業です。厚生労働省の「過労死等防止対策白書（2022年）」によると、過労死認定件数は運輸業が全業種で長年1位を維持しており、長時間労働・不規則な生活リズム・長時間座位による健康への影響が深刻です。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              また交通事故による死傷リスク・腰椎椎間板ヘルニアなどの職業性疾患・睡眠時無呼吸症候群による突然死リスクなど、ドライバー特有の健康リスクへの備えとして医療保険の重要性は極めて高いです。特に長距離トラックドライバーや一人親方の運送業者は、病気・ケガで働けなくなった際の収入保障も合わせて検討することが重要です。
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-yellow-800 mb-1">⚠️ ドライバーが医療保険を考える際の重要な前提</p>
              <p className="text-yellow-700 text-sm leading-relaxed">
                業務中の交通事故・職業性疾患は労災保険が優先適用されます。民間医療保険は「業務外の病気・ケガ」や「労災でカバーされない費用（差額ベッド代等）」を補う役割です。また個人事業主・一人親方のドライバーは傷病手当金がないため、医療保険の重要性がさらに高まります。
              </p>
              <p className="text-xs text-yellow-600 mt-2">出典：<a href="https://www.mhlw.go.jp/content/11200000/001148172.pdf" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「過労死等防止対策白書」2022年</a></p>
            </div>
          </div>

          {/* セクション2：労災保険と民間医療保険の役割分担 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">労災保険と民間医療保険の役割分担</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">費用・リスクの種類</th>
                    <th className="px-4 py-3 text-left font-semibold">労災保険</th>
                    <th className="px-4 py-3 text-left font-semibold">民間医療保険</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">業務中の交通事故・治療費</td><td className="px-4 py-3">✅ 全額補償</td><td className="px-4 py-3">△ 労災認定後の差額のみ</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">業務中の腰痛・職業性疾患</td><td className="px-4 py-3">✅ 認定されれば補償</td><td className="px-4 py-3">△ 認定されない場合に必要</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">プライベート中の病気・ケガ</td><td className="px-4 py-3">❌ 対象外</td><td className="px-4 py-3">✅ 主な給付対象</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">睡眠時無呼吸症候群</td><td className="px-4 py-3">△ 業務起因性の立証が困難</td><td className="px-4 py-3">✅ 入院・手術の給付対象</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">差額ベッド代・食事代</td><td className="px-4 py-3">❌ 対象外</td><td className="px-4 py-3">✅ 特約で補償可能</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">生活習慣病（糖尿病・高血圧等）</td><td className="px-4 py-3">❌ 対象外</td><td className="px-4 py-3">✅ 主な給付対象</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">休業中の収入補填</td><td className="px-4 py-3">✅ 休業補償給付（給付基礎日額の80%）</td><td className="px-4 py-3">✅ 就業不能保険で補完</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働者災害補償保険法」</a></p>
          </div>

          {/* セクション3：リスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">トラックドライバー・運転手が直面する健康リスクの実態</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 過労死認定件数：全業種1位（運輸業）</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「過労死等防止対策白書（2022年）」によると、脳・心臓疾患による過労死認定件数は運輸業・郵便業が全業種で長年1位を維持しています。長距離トラックドライバーの拘束時間は1日最大16時間・1ヶ月最大293時間（改正前）と長く、心筋梗塞・脳卒中のリスクが極めて高い職種です。2024年4月からの「2024年問題」による時間外労働規制強化で改善が期待されますが、依然として高リスクな状況が続いています。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② 交通事故リスク：一般ドライバーの約3〜5倍</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  運輸業の死亡災害件数は全産業の約10%を占めます（厚生労働省「労働災害発生状況」2023年）。長時間運転による疲労蓄積・眠気が事故の主因で、重大事故による骨折・脊髄損傷・重篤な外傷のリスクがあります。業務中の事故は労災保険が適用されますが、長期入院・リハビリ期間中の差額ベッド代・食事代は自己負担です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 腰椎椎間板ヘルニア：長時間座位による職業性疾患</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「職業性疾病研究（2021年）」によると、長時間運転従事者の腰椎疾患有病率は非運転者の約2.1倍。振動・不自然な姿勢・長時間座位が腰椎に慢性的なダメージを与え、椎間板ヘルニア・腰椎すべり症などの手術が必要な疾患に発展するケースも多いです。手術・入院・リハビリで数ヶ月の休業が必要になることがあります。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">④ 睡眠時無呼吸症候群：突然死・事故リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  肥満率・不規則な食事習慣により、ドライバーは睡眠時無呼吸症候群（SAS）の高リスク職種です。SASは運転中の居眠り事故の原因になるだけでなく、未治療のまま放置すると心筋梗塞・脳梗塞のリスクが一般人の3〜4倍になると言われています。CPAP治療（持続陽圧呼吸療法）が必要な場合、定期的な医療費がかかります。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">⑤ 生活習慣病：肥満率・高血圧率が全業種平均を上回る</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「定期健康診断実施結果（2022年）」によると、運輸業従事者の肥満率・高血圧率は全業種平均を上回ります。不規則な食事時間・運動不足・ストレスが主な原因です。糖尿病・高血圧は長期的な医療費負担につながり、悪化すると入院・手術が必要になるケースもあります。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mhlw.go.jp/content/11200000/001148172.pdf" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「過労死等防止対策白書」2022年</a>
              　<a href="https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei11/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働災害発生状況」2023年</a>
            </p>
          </div>

          {/* セクション4：一人親方・個人事業主ドライバーは特に注意 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">一人親方・個人事業主ドライバーは医療保険が特に重要</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5">
              <p className="font-bold text-red-800 mb-2">🔴 個人事業主ドライバーが知っておくべき事実</p>
              <ul className="text-red-700 text-sm space-y-2">
                <li>❌ 傷病手当金なし（国民健康保険のため）</li>
                <li>❌ 有給休暇なし</li>
                <li>△ 労災保険：特別加入制度あり（任意・年間保険料数万円）</li>
                <li>❌ 労災特別加入なしの場合、業務中の事故も自己負担</li>
                <li>❌ 病気・ケガで車を運転できない期間は収入ゼロ</li>
              </ul>
              <p className="text-xs text-red-600 mt-2">出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「一人親方等の特別加入」</a></p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">項目</th>
                    <th className="px-4 py-3 text-left font-semibold">会社員ドライバー</th>
                    <th className="px-4 py-3 text-left font-semibold">個人事業主ドライバー</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">健康保険</td><td className="px-4 py-3">健康保険（協会けんぽ）</td><td className="px-4 py-3">国民健康保険</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">傷病手当金</td><td className="px-4 py-3">✅ あり（月収67%・最長18ヶ月）</td><td className="px-4 py-3">❌ なし</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">労災保険</td><td className="px-4 py-3">✅ 自動加入</td><td className="px-4 py-3">△ 特別加入（任意）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">休業中の収入</td><td className="px-4 py-3">傷病手当金で一部補填</td><td className="px-4 py-3">収入ゼロ（補填なし）</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* セクション5：5つのチェックポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前に確認すべき5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '生活習慣病・肥満関連疾患の告知と引受条件を確認する',
                  detail: 'ドライバーは生活習慣病の有病率が高く、高血圧・糖尿病・肥満がある場合、医療保険の審査で「条件付き引受」や「引受謝絶」になる可能性があります。持病がある場合は「引受基準緩和型医療保険」を検討してください。健康な若いうちに加入しておくことが重要です。',
                },
                {
                  number: '02',
                  title: '腰椎疾患・交通事故による長期入院に備えた日額設定',
                  detail: '腰椎手術・交通事故による骨折の平均入院日数は30〜60日と長めです。入院日額は最低1万円以上を目安に設定してください。また手術給付金（骨折・椎間板手術）の給付条件も確認しましょう。',
                },
                {
                  number: '03',
                  title: '睡眠時無呼吸症候群の治療費をカバーできるか',
                  detail: 'CPAP治療は月3,000〜5,000円の医療費がかかります。睡眠時無呼吸症候群の診断・治療が医療保険の給付対象かどうかを確認してください。入院を伴う精密検査（ポリソムノグラフィー）も給付対象となる保険が多いです。',
                },
                {
                  number: '04',
                  title: '個人事業主は就業不能保険との組み合わせを検討',
                  detail: '個人事業主ドライバーは傷病手当金がないため、医療保険に加えて就業不能保険への加入が重要です。腰椎手術や事故による長期休業時の収入ゼロリスクに備えるため、月収の50〜70%をカバーできる就業不能保険を選んでください。',
                },
                {
                  number: '05',
                  title: '2024年問題後の労働環境変化を考慮する',
                  detail: '2024年4月からの時間外労働規制強化（2024年問題）により、ドライバーの収入構造が変わる可能性があります。収入が減少した場合に保険料の支払いが継続できるか、保険料の水準を考慮して加入することが重要です。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：肥満・高血圧で医療保険に加入できなかった',
                  situation: '45歳男性・長距離トラックドライバー。',
                  problem: '若いうちに医療保険への加入を先延ばしにしていたところ、45歳時点でBMI30以上の肥満・高血圧（収縮期160mmHg）が判明。通常の医療保険は引受謝絶。引受基準緩和型に加入したが、保険料が割高になった。',
                  lesson: '生活習慣病リスクが高いドライバーは若いうちに加入しておくこと。40代以降は審査が通らなくなるリスクがある。',
                },
                {
                  title: '失敗②：腰椎手術で入院が長期化・入院日額が不足',
                  situation: '38歳男性・運送会社勤務ドライバー。',
                  problem: '腰椎椎間板ヘルニアの手術で50日間入院。入院日額3,000円の医療保険では給付金15万円。差額ベッド代・食事代・収入減少分を合わせると実際の損失は80万円を超え、大幅な不足が生じた。',
                  lesson: 'ドライバーは腰椎疾患リスクが高い。入院日額は最低1万円以上を設定すること。',
                },
                {
                  title: '失敗③：個人事業主で労災特別加入なし・業務中事故が全額自己負担',
                  situation: '40代男性・個人事業主・運送業。',
                  problem: '配送中の交通事故で骨折。労災保険の特別加入をしていなかったため、治療費が全額自己負担。医療保険も未加入だったため、100万円以上の医療費と3ヶ月の収入ゼロが重なり、廃業を余儀なくされた。',
                  lesson: '個人事業主ドライバーは労災特別加入（年数万円）と民間医療保険の両方が必須。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション7：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '労災保険（会社加入または特別加入）の適用範囲を確認した',
                '傷病手当金の有無（会社員か個人事業主か）を確認した',
                '生活習慣病・肥満・高血圧の有無を確認し、健康なうちに加入を検討した',
                '腰椎疾患・交通事故に備えて入院日額1万円以上を確保した',
                '睡眠時無呼吸症候群の治療費が給付対象かを確認した',
                '個人事業主の場合は就業不能保険との組み合わせを検討した',
                '2024年問題後の収入変化を考慮した保険料水準を設定した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 会社員エンジニア×収入保障 専用コンテンツ */}
      {isEngineerIncomeProtection && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">会社員エンジニアに収入保障保険が必要な理由</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              会社員エンジニアには傷病手当金（月収の約67%・最長18ヶ月）があります。「傷病手当金があるから就業不能保険は不要」と考える人が多いですが、これは大きな誤解です。傷病手当金は最長18ヶ月しか支給されず、それ以降の保障は一切ありません。うつ病・適応障害による長期休業が18ヶ月を超えた場合、収入はゼロになります。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              厚生労働省の過労死等防止対策白書（2022年）によると、IT業種の精神障害労災申請件数は製造業の約2.3倍。会社員エンジニアの平均年収（男性558万円・女性585万円）を考えると、18ヶ月以降の収入喪失は家族の生活に深刻な影響を与えます。傷病手当金終了後のリスクに備えることが、会社員エンジニアにとっての就業不能保険の本質的な役割です。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-blue-800 mb-1">💡 フリーランスエンジニアとの最大の違い</p>
              <p className="text-blue-700 text-sm leading-relaxed">
                フリーランス：病気になった瞬間から収入ゼロ→即座に保険が必要<br />
                会社員：傷病手当金で最長18ヶ月はカバーされる→18ヶ月以降の備えが必要<br /><br />
                会社員は「傷病手当金終了後」を想定した長期型の保障設計が重要です。
              </p>
              <p className="text-xs text-blue-600 mt-2">出典：<a href="https://www.kyoukaikenpo.or.jp/g3/cat320/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「傷病手当金について」</a></p>
            </div>
          </div>

          {/* セクション2：傷病手当金の仕組みと18ヶ月の壁 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">傷病手当金の仕組みと「18ヶ月の壁」</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              就業不能保険の必要性を正確に判断するために、傷病手当金の仕組みを詳しく理解しておきましょう。
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">項目</th>
                    <th className="px-4 py-3 text-left font-semibold">内容</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">支給額</td><td className="px-4 py-3">標準報酬月額の約67%（3分の2）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">支給期間</td><td className="px-4 py-3">最長1年6ヶ月（支給開始日から通算）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">待機期間</td><td className="px-4 py-3">連続3日の休業後、4日目から支給開始</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">対象疾患</td><td className="px-4 py-3">業務外の病気・ケガ（業務上は労災保険）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">精神疾患</td><td className="px-4 py-3">✅ 対象（うつ病・適応障害も支給対象）</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">18ヶ月以降</td><td className="px-4 py-3">❌ 支給終了・公的補填なし</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">退職後</td><td className="px-4 py-3">条件付きで継続受給可能（要確認）</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mb-4">出典：<a href="https://www.kyoukaikenpo.or.jp/g3/cat320/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「傷病手当金について」</a></p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="font-bold text-red-800 mb-2">🔴 「18ヶ月の壁」：会社員エンジニアが最も意識すべきリスク</p>
              <p className="text-red-700 text-sm leading-relaxed">
                年収558万円（月収約46万円）のエンジニアがうつ病で18ヶ月休業した場合：<br /><br />
                傷病手当金：約31万円/月×18ヶ月 ＝ 約558万円を受給<br />
                19ヶ月目以降：収入ゼロ<br /><br />
                うつ病の平均治療期間は1〜3年。18ヶ月を超える可能性が高く、就業不能保険で19ヶ月目以降をカバーすることが重要です。
              </p>
            </div>
          </div>

          {/* セクション3：リスクデータ */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">会社員エンジニアが直面する就業不能リスクの実態</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">① 精神疾患リスク：製造業の2.3倍</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「過労死等防止対策白書（2022年）」によると、情報通信業の精神障害労災申請件数は製造業の約2.3倍。長時間労働・納期プレッシャー・技術変化への対応ストレスが主因です。うつ病による休業期間の平均は6ヶ月〜1年以上で、18ヶ月を超えるケースも珍しくありません。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">② 長時間労働：月80時間超が約19%</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  厚生労働省「就労条件総合調査（2023年）」によると、IT業種で月80時間超の残業をしている割合は約19.2%（全業種平均8.3%の約2.3倍）。過労による心疾患・脳血管疾患のリスクも高く、これらの疾患による長期休業への備えが重要です。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">③ 燃え尽き症候群（バーンアウト）による長期離脱</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  エンジニアに多い「バーンアウト（燃え尽き症候群）」は、うつ病と並ぶ長期就業不能の原因です。スタートアップ・SIer・ゲーム会社など激務な職場では30代でのバーンアウト事例が増加しています。バーンアウトからの回復には平均1〜2年かかるとされており、18ヶ月を超える就業不能期間となるケースが多いです。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">④ 腱鞘炎・頸椎症：コーディング不能リスク</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  長時間のキーボード・マウス操作による腱鞘炎・頸椎症はエンジニア特有の職業性疾患です。重症化するとコーディングができなくなり、エンジニアとしての業務継続が困難になります。手術・リハビリで数ヶ月〜1年の休業が必要になるケースもあります。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              出典：<a href="https://www.mhlw.go.jp/content/11200000/001148172.pdf" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「過労死等防止対策白書」2022年</a>
              <a href="https://www.mhlw.go.jp/toukei/itiran/roudou/jikan/syurou/23/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「就労条件総合調査」2023年</a>
            </p>
          </div>

          {/* セクション4：必要保障額の計算方法 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">会社員エンジニアの就業不能保険：適正な保障額の計算方法</h2>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 mb-4">
              <p className="font-bold text-blue-900 mb-2">会社員エンジニアの必要保障額の考え方</p>
              <p className="text-blue-800 text-sm leading-relaxed">
                傷病手当金（月収の67%）で18ヶ月はカバーされます。就業不能保険で補うべきは主に以下の2点です：<br />
                ①傷病手当金でカバーされない33%分の収入補填（18ヶ月以内）<br />
                ②傷病手当金終了後（19ヶ月目以降）の全収入の補填
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="px-4 py-3 text-left font-semibold">年収</th>
                    <th className="px-4 py-3 text-left font-semibold">月収</th>
                    <th className="px-4 py-3 text-left font-semibold">傷病手当金（月収67%）</th>
                    <th className="px-4 py-3 text-left font-semibold">推奨月額給付金</th>
                    <th className="px-4 py-3 text-left font-semibold">月額保険料目安</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3">400万円</td><td className="px-4 py-3">約33万円</td><td className="px-4 py-3">約22万円</td><td className="px-4 py-3 font-medium">10〜15万円</td><td className="px-4 py-3">約2,000〜4,000円</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3">558万円（平均）</td><td className="px-4 py-3">約46万円</td><td className="px-4 py-3">約31万円</td><td className="px-4 py-3 font-medium">15〜20万円</td><td className="px-4 py-3">約3,000〜6,000円</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3">700万円</td><td className="px-4 py-3">約58万円</td><td className="px-4 py-3">約39万円</td><td className="px-4 py-3 font-medium">20〜25万円</td><td className="px-4 py-3">約4,000〜8,000円</td></tr>
                  <tr className="hover:bg-gray-50"><td className="px-4 py-3">1,000万円</td><td className="px-4 py-3">約83万円</td><td className="px-4 py-3">約56万円</td><td className="px-4 py-3 font-medium">25〜30万円</td><td className="px-4 py-3">約6,000〜10,000円</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              ※参考値。実際の保険料は年齢・健康状態・保険会社により異なります。出典：<a href="https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2023/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「賃金構造基本統計調査」2023年</a>
            </p>
          </div>

          {/* セクション5：5つのチェックポイント */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前に確認すべき5つのチェックポイント</h2>
            <div className="space-y-4">
              {[
                {
                  number: '01',
                  title: '支払対象外期間を180日以上に設定して保険料を抑える',
                  detail: '会社員は傷病手当金があるため、支払対象外期間（待機期間）を180日以上に設定することで保険料を大幅に抑えられます。傷病手当金の18ヶ月をカバーしてから支給開始する「19ヶ月目から」タイプが会社員に最適です。',
                },
                {
                  number: '02',
                  title: '精神疾患特約は必須',
                  detail: 'IT業種の精神障害労災申請は製造業の2.3倍。精神疾患特約は会社員エンジニアにとって最重要の特約です。特約なしの保険や、精神疾患の給付に上限（通算18回等）がある保険は避けることをお勧めします。',
                },
                {
                  number: '03',
                  title: '会社の団体保険・福利厚生を先に確認する',
                  detail: '大手IT企業・SIerでは会社が就業不能保険や団体長期障害所得補償保険（GLTD）を福利厚生として提供しているケースがあります。まず会社の福利厚生を確認し、カバーされていない部分のみ個人保険で補うことが効率的です。',
                },
                {
                  number: '04',
                  title: 'フリーランス転向の可能性を考慮する',
                  detail: 'エンジニアはキャリアの中でフリーランスに転向する可能性があります。フリーランスになると傷病手当金がなくなるため、就業不能保険の重要性が急激に上がります。転向前に個人で就業不能保険に加入しておくことで、フリーランス後も継続して保障を受けられます。',
                },
                {
                  number: '05',
                  title: '腱鞘炎・頸椎症が給付対象か確認する',
                  detail: 'コーディング作業に起因する腱鞘炎・頸椎症・眼精疲労が就業不能保険の給付対象かどうかを確認してください。「全く働けない状態」のみ対象の保険では、腱鞘炎でコーディングできない状態でも給付されない場合があります。',
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-xs font-bold">{item.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション6：よくある失敗事例3選 */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">よくある失敗事例3選</h2>
            <div className="space-y-5">
              {[
                {
                  title: '失敗①：傷病手当金があるからと就業不能保険を後回しにした',
                  situation: '35歳男性・大手SIer勤務エンジニア。年収600万円。',
                  problem: '「傷病手当金があるから大丈夫」と就業不能保険への加入を先延ばし。40歳でうつ病を発症し、傷病手当金（月約27万円）で18ヶ月はしのいだが、19ヶ月目以降は収入ゼロ。住宅ローンの返済が滞り始めた。40歳での新規加入は保険料が高く、回復後の家計負担が大きくなった。',
                  lesson: '傷病手当金は18ヶ月で終わる。若いうちに保険料の安い時期に加入しておくこと。',
                },
                {
                  title: '失敗②：精神疾患特約なしで最大のリスクに無防備',
                  situation: '28歳男性・スタートアップ勤務エンジニア。',
                  problem: '保険料を抑えるために精神疾患特約なしの就業不能保険に加入。過重労働による適応障害で6ヶ月休業したが、精神疾患特約なしのため給付金ゼロ。傷病手当金のみで生活し、貯蓄が大幅に減った。',
                  lesson: 'IT業種は精神疾患リスクが最も高い。精神疾患特約は必須。',
                },
                {
                  title: '失敗③：会社のGLTDを確認せず重複加入',
                  situation: '32歳女性・大手IT企業勤務エンジニア。',
                  problem: '個人で就業不能保険（月額保険料5,000円）に加入後、会社の福利厚生に団体長期障害所得補償保険（GLTD）が含まれていることを発見。実質的に重複した保障に毎月5,000円を払っていた。',
                  lesson: '加入前に会社の福利厚生・団体保険の内容を必ず確認すること。',
                },
              ].map((c, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="font-bold text-red-800 text-sm mb-2">{c.title}</p>
                  <p className="text-xs text-gray-500 mb-2">【状況】{c.situation}</p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{c.problem}</p>
                  <div className="bg-white border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-bold text-red-700">📌 教訓：{c.lesson}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* セクション7：最終チェックリスト */}
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">加入前の最終チェックリスト</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '傷病手当金（月収67%・最長18ヶ月）の仕組みと支給額を把握した',
                '18ヶ月以降の収入ゼロリスクを認識した',
                '会社の福利厚生・団体保険（GLTD等）の内容を確認した',
                '精神疾患特約を付帯した（IT業種は精神疾患リスクが製造業の2.3倍）',
                '支払対象外期間を180日以上に設定して保険料を効率化した',
                '腱鞘炎・頸椎症の給付条件を確認した',
                'フリーランス転向時の保障継続を考慮した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* パートタイム×生命保険 専用コンテンツ */}
      {isPartTimeLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">パートタイム労働者に生命保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              パートタイム労働者は2,126万人と雇用者全体の36.5%を占め
              （総務省「労働力調査」2025年平均）、
              特に女性の非正規比率は47.8%に達します
              （令和4年就業構造基本調査）。
              非正規雇用の約9割は年間所得200万円未満であり、
              低収入の中でいかに家族を守る保障を設計するかが
              パートタイム労働者の生命保険選びの核心です。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              特に2025年に成立した遺族厚生年金の改正
              （2028年4月施行）により、
              60歳未満で配偶者を亡くした場合は
              原則5年間の有期給付に変わります。
              これまで「終身でもらえる」と思っていた遺族年金が
              5年で終了するケースが生まれます。
              扶養範囲内で働くパートタイム労働者は
              この改正の影響を最も大きく受ける層の一つです。
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-amber-800">
                ⚠️ パートで扶養範囲内（年収130万円未満）で働く場合の重大な盲点
              </p>
              <p className="text-amber-700 text-sm mt-1">
                扶養範囲内パートは国民年金のみ加入のため、
                配偶者が死亡しても遺族厚生年金は受け取れません。
                受け取れるのは遺族基礎年金（子がいる場合のみ・年約109万円）のみです。
                子のない夫婦では公的給付がゼロになる可能性があります。
                公的保障の空白地帯を理解した上で
                生命保険を設計する必要があります。
              </p>
              <p className="text-xs text-amber-600 mt-2">
                出典：<a href="https://www.nenkin.go.jp/tokusetsu/tekiyokakudai_kojin.html" target="_blank" rel="noopener noreferrer" className="underline">日本年金機構「社会保険の適用拡大」</a>
              </p>
            </div>
          </section>

          {/* セクション2：公的保障と民間保険の役割分担 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">パートの加入状況別・公的保障と民間生命保険の役割分担</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">加入状況</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">遺族厚生年金</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">遺族基礎年金</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">備考</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['扶養範囲内パート（130万円未満）', '❌ なし', '✅ あり（子がいる場合のみ）', '国民年金のみ加入'],
                    ['社会保険加入パート（週20h・月8.8万円以上）', '✅ あり（加入期間に比例）', '✅ あり', '厚生年金に加入'],
                    ['配偶者（正社員）の被扶養者', '✅ あり（配偶者の年金から）', '✅ あり', '第3号被保険者'],
                  ].map(([status, kousei, kiso, note], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{status}</td>
                      <td className="px-4 py-3 text-gray-700">{kousei}</td>
                      <td className="px-4 py-3 text-gray-700">{kiso}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-bold text-red-800 mb-2">🔴 2028年4月施行：遺族厚生年金の有期化で状況が大きく変わる</p>
              <p className="text-red-700 text-sm">
                現行制度：30歳以上の妻は遺族厚生年金を終身受給<br />
                2028年4月以降：60歳未満で配偶者を亡くした場合は原則5年間の有期給付に変更<br /><br />
                子が18歳になった後に受給開始した場合は5年で打ち切り。
                5年後も月収約10万円以下の低所得者は継続給付があるが、
                それでも生活の安定は難しい。
                生命保険の重要性がさらに高まります。
              </p>
              <p className="text-xs text-red-600 mt-2">
                出典：<a href="https://www.moneypro.jp/columns/others/5939/" target="_blank" rel="noopener noreferrer" className="underline">遺族厚生年金2025年改正の詳細</a>
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：<a href="https://www.stat.go.jp/data/roudou/sokuhou/nen/ft/pdf/youyaku.pdf" target="_blank" rel="noopener noreferrer" className="underline">総務省「労働力調査」2025年平均</a>
              <a href="https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2024/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「令和4年賃金構造基本統計調査」</a>
            </p>
          </section>

          {/* セクション3：パートタイム特有のリスクデータ */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">パートタイム労働者が直面する生命保険リスクの実態</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① 低収入世帯の遺族保障の薄さ</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省「令和4年賃金構造基本統計調査」によると、
                  非正規雇用の平均年収は306万円（正規531万円との差225万円）。
                  パート・アルバイトの約9割は年間所得200万円未満です。
                  遺族基礎年金（子1人で年約109万円）のみでは
                  生活費月20〜25万円（総務省「家計調査」）を賄えません。
                  年間約130〜190万円もの生活費不足が生じ、
                  民間生命保険なしでは家族の生活が成り立ちません。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② 2028年遺族厚生年金改正の低収入世帯への打撃</h3>
                <p className="text-gray-700 leading-relaxed">
                  2028年4月以降、60歳未満で配偶者を亡くした場合は
                  遺族厚生年金が原則5年間の有期給付に変わります。
                  女性の非正規比率が47.8%という現状を踏まえると、
                  「遺族厚生年金が終わった後に十分な収入を得られない女性が多数発生する」
                  という問題が現実的になります。
                  月収10万円以下なら5年後も継続給付がありますが、
                  それでも生活は厳しく、
                  5年間で終了するケースへの備えが急務です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ 扶養範囲内パートの「保険空白地帯」</h3>
                <p className="text-gray-700 leading-relaxed">
                  年収130万円未満で働くパートは国民年金のみ加入のため、
                  自分が死亡した場合に配偶者が受け取れる遺族厚生年金はゼロです
                  （第3号被保険者として夫の厚生年金からは受け取れます）。
                  さらに子のない夫婦の場合、自分が死亡しても
                  遺族基礎年金すら支給されません。
                  社会保険加入パートですら、
                  加入期間が短ければ遺族厚生年金は月数千円の可能性があります。
                  この「保険空白地帯」を民間生命保険で埋めることが必須です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://www.stat.go.jp/data/roudou/sokuhou/nen/ft/pdf/youyaku.pdf" target="_blank" rel="noopener noreferrer" className="underline">総務省「労働力調査」2025年平均</a>
              <a href="https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2024/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「令和4年賃金構造基本統計調査」</a>
              <a href="https://www.nenkin.go.jp/tokusetsu/tekiyokakudai_kojin.html" target="_blank" rel="noopener noreferrer" className="underline">日本年金機構「社会保険の適用拡大」</a>
              <a href="https://www.moneypro.jp/columns/others/5939/" target="_blank" rel="noopener noreferrer" className="underline">遺族厚生年金2025年改正の詳細</a>
            </p>
          </section>

          {/* セクション4：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">パートタイム労働者の生命保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '扶養範囲内か社会保険加入かで公的保障が大きく変わる',
                  detail: '現在の社会保険加入状況（国民年金のみ or 厚生年金加入）を確認してください。扶養範囲内パートは遺族厚生年金がゼロのため、民間生命保険の必要額が社会保険加入パートより大きくなります。2026年10月に月額8.8万円要件が撤廃予定・2027年10月から企業規模要件が36人以上に拡大と、適用拡大が続いています。',
                },
                {
                  number: '02',
                  title: '2028年改正後は収入保障保険との組み合わせを検討する',
                  detail: '2028年4月以降、子のない世帯では遺族厚生年金が5年で終了します。5年後の生活費不足に備えるため、配偶者の生命保険に収入保障保険（月額給付型）を追加することを検討してください。特に配偶者が60歳未満で死亡するリスクへの備えが重要です。',
                },
                {
                  number: '03',
                  title: '配偶者（正社員）の生命保険額が適切か確認する',
                  detail: 'パート収入では残された場合の生活費が不足します。配偶者（正社員）の生命保険は「遺族年金＋保険金で残りの人生を賄えるか」という観点で見直してください。子の教育費・住宅費・老後の生活費まで試算した上で必要保障額を設定してください。',
                },
                {
                  number: '04',
                  title: '保険料の手頃さが最優先：月3,000〜5,000円のシンプルな定期保険から',
                  detail: '非正規雇用の平均年収306万円では高額な保険料を払い続けることが困難です。まず月額3,000〜5,000円程度のシンプルな掛け捨て定期保険（収入保障保険）から始め、余裕ができたら追加を検討してください。無理な保険料設定は解約につながります。',
                },
                {
                  number: '05',
                  title: '子の独立後の保障見直しを忘れずに',
                  detail: '子が18歳を過ぎると遺族基礎年金も失効します。2028年改正後は遺族厚生年金も5年で終了するため、子の独立後も配偶者が60歳未満である間は一定の生命保険が必要です。ライフステージの変化に合わせた保険の見直しを計画してください。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：扶養範囲内なので遺族年金は夫の分がもらえると思っていた',
                  situation: 'Aさん（42歳・パート・年収100万円）。夫（45歳・会社員）が病死。子なし。',
                  problem: 'Aさん自身が扶養の第3号被保険者のため夫の遺族厚生年金は受給できたが、子がいないため遺族基礎年金はゼロ。2028年改正後は遺族厚生年金も5年で終了（子なし世帯）。5年後の生活費を確保する手段がなく、生活の見通しが立たなくなった。',
                  lesson: '2028年以降は「終身でもらえる」という前提が崩れる。5年後の生活費を確保する生命保険が必要。',
                },
                {
                  title: '失敗②：夫婦2人ともパートで生命保険を節約した',
                  situation: 'Bさん（38歳・パート年収80万円）と夫（40歳・パート年収120万円）。子2人。夫が事故死。',
                  problem: '夫の社会保険加入期間が短く遺族厚生年金は月1.5万円程度。子が2人いるため遺族基礎年金は月10万円程度受給できたが、子が18歳になると終了。月の生活費が著しく不足し、Bさんが生活保護を申請せざるを得ない状況になった。',
                  lesson: '低収入世帯ほど民間生命保険（収入保障保険）の必要額が大きくなるという逆説を理解すること。',
                },
                {
                  title: '失敗③：子が独立したら生命保険を解約してしまった',
                  situation: 'Cさん（52歳・パート）。夫（55歳・正社員）。子の独立を機に生命保険を全解約。',
                  problem: '2028年改正後は60歳未満での死別→遺族厚生年金は5年間のみ。夫が60歳未満で死亡すると5年で年金が終了し、Cさんが65歳で老齢年金を受け取るまでの10年近くが無保障になる可能性がある。',
                  lesson: '子の独立後も配偶者が60歳になるまでの間は一定の生命保険が必要。2028年改正を見据えた見直しを行うこと。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-amber-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">生命保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '現在の社会保険加入状況（国民年金のみ or 厚生年金加入）を確認した',
                '配偶者が死亡した場合に受け取れる遺族年金額をシミュレーションした',
                '2028年遺族厚生年金改正の影響を自分の家庭に当てはめて確認した',
                '子の年齢と遺族基礎年金の受給期間（子が18歳まで）の関係を把握した',
                '配偶者（正社員）の生命保険は残された家族の生活費をカバーできる額か確認した',
                '自分自身が死亡した場合の必要保障額を試算した（低収入でも葬儀費用等は必要）',
                '月額3,000〜5,000円程度の収入保障保険（掛け捨て）の見積もりを取った',
                '子の独立後も60歳未満は保障が必要なことを確認した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 管理職×医療保険 専用コンテンツ */}
      {isManagerMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">会社管理職に医療保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              課長・部長・役員などの管理職は、
              長時間労働・マネジメントストレス・接待による
              生活習慣病リスクが一般社員より大幅に高い職種です。
              厚生労働省「特定健康診査・特定保健指導の実施状況（2022年度）」によると、
              40〜74歳男性のメタボリックシンドローム該当者は23.3%と
              全体平均16.6%を大幅に上回ります。
              管理職は40〜50代男性が多く、
              このリスクにそのまま当てはまるケースが多いです。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              また厚生労働省の脳・心臓疾患の労災認定基準（2021年改正）によると、
              発症前1ヶ月に100時間超、または2〜6ヶ月平均で月80時間超の
              時間外労働が継続する場合、
              脳・心臓疾患との業務関連性が強いと評価されます。
              管理職は残業代の対象外となる「管理監督者」であることが多く、
              実質的な長時間労働が表面化しにくい問題があります。
              適切な医療保険で、万一の際の医療費・収入減少に備えることが重要です。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-blue-800">
                💡 管理職の医療保険：会社の健保組合の付加給付を先に確認する
              </p>
              <p className="text-blue-700 text-sm mt-1">
                大企業・健保組合加入の管理職は
                付加給付（月25,000円超の自己負担を還付）がある場合があります。
                この制度がある場合は民間医療保険の必要性が下がるため、
                まず会社の健保組合の給付内容を確認してから設計してください。
              </p>
              <p className="text-xs text-blue-600 mt-2">
                出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/tokutei-kensin/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「特定健康診査・特定保健指導の実施状況」2022年度</a>
              </p>
            </div>
          </section>

          {/* セクション2：公的保障と民間医療保険の役割分担 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">管理職の公的保障と民間医療保険で補うべき部分</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">費用の種類</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">公的保障（健康保険・高額療養費）</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">民間医療保険で補う部分</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['保険診療の自己負担', '高額療養費で月57,600円〜上限あり', '入院日額・手術給付金で補完'],
                    ['健保組合の付加給付', '✅ 大企業は月25,000円上限の場合も', '付加給付後の残額のみ補完'],
                    ['差額ベッド代', '❌ 全額自己負担（1日3,000〜10,000円）', '✅ 特約または入院日額で補完'],
                    ['先進医療費用', '❌ 全額自己負担（数十〜数百万円）', '✅ 先進医療特約（月100〜200円）'],
                    ['役員の傷病手当金', '⚠️ 役員報酬の性質によっては対象外', '✅ 就業不能保険で補完'],
                  ].map(([type, pub, priv], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{type}</td>
                      <td className="px-4 py-3 text-gray-600">{pub}</td>
                      <td className="px-4 py-3 text-gray-700">{priv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「高額療養費制度について」2024年</a>
              <a href="https://www.kyoukaikenpo.or.jp/g3/cat310/sb3040/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「傷病手当金について」</a>
            </p>
          </section>

          {/* セクション3：管理職特有の医療リスク */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">会社管理職が直面する医療リスクの実態（最新統計）</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① メタボリックシンドローム：40〜74歳男性の23.3%が該当</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省「特定健康診査・特定保健指導の実施状況（2022年度）」によると、
                  40〜74歳男性のメタボリックシンドローム該当者は23.3%、
                  予備群も含めると33%に達します。
                  接待・会食・不規則な食事時間・運動不足が重なる管理職は
                  このリスクが特に高い年代層と一致します。
                  メタボから糖尿病・高血圧・脂質異常症が重症化すると
                  心疾患・脳血管疾患の入院・手術リスクが高まります。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② 過労死ライン超えリスク：月80時間超で脳・心臓疾患の業務関連性が強まる</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省「脳・心臓疾患の労災認定基準（2021年改正）」によると、
                  発症前2〜6ヶ月平均で月80時間超の時間外労働が継続する場合、
                  脳・心臓疾患（心筋梗塞・脳梗塞等）との
                  業務関連性が強いと評価されます。
                  管理職は「管理監督者」として残業代が出ないケースも多く、
                  実質的な長時間労働が把握されにくい問題があります。
                  突然の心筋梗塞・脳梗塞による入院・手術への備えが重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ 精神疾患：マネジメントストレスによる不調率は一般社員の1.6倍</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省「職場における心の健康づくり（2022年）」によると、
                  管理職のメンタルヘルス不調率は一般社員の1.6倍。
                  部下の問題・業績責任・ハラスメント対応など
                  管理職特有のストレスが背景にあります。
                  精神疾患による入院（平均278日）への備えとして
                  精神疾患特約付きの医療保険が重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">④ 役員就任後の傷病手当金消滅リスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  取締役・執行役員に就任すると、
                  役員報酬の性質によっては傷病手当金の支給対象外になる場合があります。
                  入院・手術で長期療養が必要になった際、
                  傷病手当金がなければ収入が大幅に減少します。
                  医療保険の入院給付金に加えて就業不能保険との組み合わせが
                  役員・執行役員には特に重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/tokutei-kensin/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「特定健康診査・特定保健指導の実施状況」2022年度</a>
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousaihoken06/rousaichishiki06.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「脳・心臓疾患の労災認定基準」2021年改正</a>
              <a href="https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei12/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「職場における心の健康づくり」2022年</a>
              <a href="https://www.mhlw.go.jp/toukei/saikin/hw/kanja/20/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「患者調査」2020年</a>
            </p>
          </section>

          {/* セクション4：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">管理職の医療保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '会社の健保組合の付加給付を先に確認する',
                  detail: '大企業・健保組合加入の管理職は付加給付（月25,000円超の自己負担還付）がある場合があります。付加給付がある場合は民間医療保険は差額ベッド代・先進医療に絞った最小限の設計で十分なケースも。まず会社の健保組合の給付内容を確認してください。',
                },
                {
                  number: '02',
                  title: '脳・心臓疾患・生活習慣病に備えた入院日額を設定する',
                  detail: '管理職は心筋梗塞・脳梗塞・糖尿病重症化による長期入院リスクが高いです。心筋梗塞の平均入院日数は約20〜30日、脳梗塞は約100日と長期化するケースがあります。入院日額は最低1万円以上を確保してください。',
                },
                {
                  number: '03',
                  title: '精神疾患特約付き・入院給付日数1,000日以上を選ぶ',
                  detail: '管理職の精神疾患不調率は一般社員の1.6倍。精神疾患特約は必須で、入院給付日数が1,000日以上の商品を選んでください。',
                },
                {
                  number: '04',
                  title: '先進医療特約を必ず付帯する',
                  detail: '月100〜200円で付帯できる先進医療特約は管理職にとっても必須です。がん・脳疾患で先進医療を選択した場合、数百万円の費用が全額自己負担になります。',
                },
                {
                  number: '05',
                  title: '役員・執行役員は傷病手当金の有無を確認する',
                  detail: '役員就任後に傷病手当金の対象外になる場合があります。自分の雇用形態（使用人兼務役員か純粋な役員か）を確認し、傷病手当金がない場合は就業不能保険との組み合わせが必須です。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：メタボを放置して心筋梗塞で長期入院',
                  situation: '52歳男性・大手メーカー部長。BMI28・高血圧・高脂血症。',
                  problem: '健康診断でメタボ・高血圧を指摘されていたが多忙を理由に放置。54歳で心筋梗塞を発症し30日間入院・手術。高額療養費適用後の自己負担・差額ベッド代（個室1日8,000円×30日）・食事代で70万円以上の自己負担が発生。医療保険の入院日額が3,000円と低く給付金では全く足りなかった。',
                  lesson: '管理職はメタボ・高血圧の進行リスクが高い。入院日額は最低1万円以上を確保すること。',
                },
                {
                  title: '失敗②：役員就任後に傷病手当金がなくなっていた',
                  situation: '50歳男性・中小企業の取締役。',
                  problem: '取締役就任後に役員報酬の性質が変わり、傷病手当金の対象外になっていたことを知らなかった。脳梗塞で3ヶ月入院した際、医療保険の入院給付金しか収入がなく、月収が大幅に減少した。就業不能保険に未加入だったため深刻な収入減になった。',
                  lesson: '役員就任時に傷病手当金の適用可否を確認し、対象外の場合は就業不能保険に加入すること。',
                },
                {
                  title: '失敗③：大企業の付加給付を知らず過剰な保険に加入',
                  situation: '40代女性・大手IT企業部長。',
                  problem: '会社の健保組合に付加給付（月25,000円上限）があることを知らずに月額6,000円の医療保険に加入。実際に必要だったのは先進医療特約のみで、8年間で57万円の保険料を過払いしていた。',
                  lesson: '大企業管理職は会社の健保組合の付加給付を先に確認すること。付加給付があれば民間保険は最小限でよい。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-blue-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">医療保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '会社の健保組合の付加給付有無を確認した',
                '高額療養費制度の自己負担上限額を把握した',
                '脳・心臓疾患・生活習慣病に備えた入院日額1万円以上を確保した',
                '精神疾患特約付き・入院給付日数1,000日以上の商品を選んだ',
                '先進医療特約（月100〜200円）を付帯した',
                '役員・執行役員の場合、傷病手当金の適用可否を確認した',
                '就業不能保険との組み合わせを設計した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* フリーランスエンジニア×生命保険 専用コンテンツ */}
      {isFreelanceEngineerLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">フリーランスエンジニアに生命保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              フリーランスエンジニアは会社員と異なり、
              遺族厚生年金がありません。
              万一死亡した場合に遺族が受け取れる公的給付は
              遺族基礎年金（子あり：年約109万円）のみで、
              会社員と比べて数千万円規模の格差が生じます。
              エヌエヌ生命の試算によると、
              年収700万円のフリーランスと同収入の会社員では
              遺族が受け取れる年金の総額に
              約5,000万円の差があります。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              この「遺族厚生年金の空白」を埋めるのが
              民間生命保険の最も重要な役割です。
              特に30〜40代でパートナーや子どもがいる
              フリーランスエンジニアにとって、
              生命保険は家族を守る最重要手段です。
              傷病手当金もなく収入保障保険も必要な
              フリーランスにとって、
              就業不能リスクと死亡リスクの両方に備えることが
              急務となっています。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-blue-800">
                💡 フリーランスエンジニアの生命保険：会社員との最大の違い
              </p>
              <p className="text-blue-700 text-sm mt-1">
                会社員が死亡した場合：遺族基礎年金＋遺族厚生年金<br />
                フリーランスが死亡した場合：遺族基礎年金のみ<br /><br />
                2026年度の遺族基礎年金額（子1人の場合）：年109万1,100円<br />
                この金額だけでは家族の生活費を到底賄えません。
                民間生命保険で遺族厚生年金の空白を埋めることが必須です。
              </p>
              <p className="text-xs text-blue-600 mt-2">
                出典：<a href="https://www.jili.or.jp/lifeplan/socialsecurity/1.html" target="_blank" rel="noopener noreferrer" className="underline">生命保険文化センター「公的な遺族年金の仕組みについて」2026年度版</a>
              </p>
            </div>
          </section>

          {/* セクション2：フリーランス vs 会社員の遺族給付比較 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">フリーランスエンジニア vs 会社員：死亡時の遺族への公的給付比較</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">給付の種類</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">フリーランス（国民年金）</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">会社員エンジニア（厚生年金）</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['遺族基礎年金（子1人）', '✅ 年109万1,100円（2026年度）', '✅ 年109万1,100円（同額）'],
                    ['遺族基礎年金（子2人）', '✅ 年133万4,900円（2026年度）', '✅ 年133万4,900円（同額）'],
                    ['遺族厚生年金', '❌ なし', '✅ あり（報酬比例・年収700万円：年約200〜250万円）'],
                    ['退職金', '❌ なし', '✅ あり（会社規定による）'],
                    ['子なし配偶者への遺族年金', '❌ 遺族基礎年金なし・寡婦年金のみ', '✅ 遺族厚生年金あり'],
                  ].map(([type, free, emp], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{type}</td>
                      <td className="px-4 py-3 text-gray-600">{free}</td>
                      <td className="px-4 py-3 text-gray-700">{emp}</td>
                    </tr>
                  ))}
                  <tr className="bg-red-50">
                    <td className="px-4 py-3 font-medium text-gray-800">遺族年金の総額差（年収700万・子1人・妻90歳まで）</td>
                    <td colSpan={2} className="px-4 py-3 text-center font-bold text-red-700">約5,000万円の差（エヌエヌ生命試算）</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：<a href="https://www.jili.or.jp/lifeplan/socialsecurity/1.html" target="_blank" rel="noopener noreferrer" className="underline">生命保険文化センター「公的な遺族年金の仕組みについて」2026年度</a>
              <a href="https://www.nenkin.go.jp/service/jukyu/izokunenkin/jukyu-yoken/20150401-02.html" target="_blank" rel="noopener noreferrer" className="underline">日本年金機構「遺族厚生年金（受給要件・対象者・年金額）」</a>
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
              <p className="font-bold text-red-800 mb-2">🔴 フリーランスエンジニアの生命保険の緊急度</p>
              <p className="text-red-700 text-sm">
                年収550万円のフリーランスエンジニア（38歳・妻・子1人）が死亡した場合：<br /><br />
                公的給付（遺族基礎年金）：年109万円×子が18歳になるまで約13年＝約1,417万円<br />
                遺族の生活費（月20万円×12ヶ月×27年）：6,480万円<br />
                子の教育費：約1,000万円<br /><br />
                <strong>不足額：約6,000万円以上</strong><br />
                この不足額を民間生命保険で補うことが家族を守る唯一の手段です。
              </p>
            </div>
          </section>

          {/* セクション3：死亡リスクの実態 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">フリーランスエンジニアが直面する死亡・高度障害リスク</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① IT業種の過労死リスク：精神障害労災申請は製造業の2.3倍</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省「過労死等防止対策白書（2022年）」によると、
                  IT業種の精神障害労災申請件数は製造業の約2.3倍。
                  過労による心疾患・脳血管疾患のリスクも高く、
                  突然死・高度障害のリスクが一般職種より高い水準にあります。
                  フリーランスの場合は長時間労働を制限する
                  規制がなく、自己管理が唯一の歯止めとなります。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② フリーランスの収入喪失リスク：54.1%が経験</h3>
                <p className="text-gray-700 leading-relaxed">
                  内閣官房「フリーランス実態調査（2021年）」によると、
                  フリーランスの54.1%が収入喪失を経験しており、
                  そのうち健康問題が原因のケースは28.3%。
                  死亡リスクだけでなく重篤な疾患による
                  廃業リスクも現実的な脅威として存在します。
                  家族がいる場合、廃業による収入ゼロは
                  死亡に準じる深刻な打撃となります。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ 法人化時の保障断絶リスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  フリーランスエンジニアが法人化（一人法人）すると、
                  社長として厚生年金に加入でき
                  遺族厚生年金が発生します。
                  しかし個人事業主のままでいる間は
                  遺族厚生年金がゼロのままです。
                  法人化を検討している場合でも、
                  それまでの期間は民間生命保険で
                  遺族厚生年金の空白を補い続けることが重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">④ 子のない配偶者への保障がゼロになるリスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  子のないフリーランス夫婦の場合、
                  遺族基礎年金が支給されません。
                  遺族厚生年金もないため、
                  パートナーが受け取れる公的給付は
                  寡婦年金（最高年約61万2,000円・60〜65歳のみ）のみです。
                  DINKSのフリーランスカップルにとって、
                  生命保険は特に重要な備えとなります。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/karoshiboushi/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「過労死等防止対策白書」2022年</a>
              <a href="https://www.cas.go.jp/jp/seisaku/atarashii_sihonsyugi/freelance/pdf/chousakekka.pdf" target="_blank" rel="noopener noreferrer" className="underline">内閣官房「フリーランス実態調査」2021年</a>
              <a href="https://www.jili.or.jp/lifeplan/socialsecurity/1.html" target="_blank" rel="noopener noreferrer" className="underline">生命保険文化センター「公的な遺族年金の仕組みについて」2026年度</a>
            </p>
          </section>

          {/* セクション4：ライフステージ別の考え方 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">フリーランスエンジニアのライフステージ別・生命保険の考え方</h2>
            <div className="space-y-4">
              {[
                {
                  stage: '20代・独身・フリーランス転向直後',
                  need: '低〜中',
                  needColor: 'bg-green-100 text-green-700',
                  detail: '扶養家族なし。就業不能保険・医療保険を優先。生命保険は最小限でよい。ただし法人化前の遺族厚生年金ゼロを認識しておく。',
                },
                {
                  stage: '30代・パートナーあり・子なし',
                  need: '中',
                  needColor: 'bg-yellow-100 text-yellow-700',
                  detail: '子のないDINKSでも遺族基礎年金がなくなる点に注意。遺族厚生年金の空白を補う収入保障保険への加入を検討。',
                },
                {
                  stage: '30〜40代・既婚・子あり',
                  need: '高',
                  needColor: 'bg-red-100 text-red-700',
                  detail: '必要保障額が最大の時期。遺族基礎年金のみでは家族の生活費・教育費が全く足りない。収入保障保険＋定期保険で6,000万円以上の保障確保が推奨。',
                },
                {
                  stage: '40代後半〜・法人化検討中',
                  need: '中',
                  needColor: 'bg-yellow-100 text-yellow-700',
                  detail: '法人化後は遺族厚生年金が発生するため生命保険の必要性が下がる。法人化前後で保険の見直しが必要。法人化後は法人保険の活用も検討。',
                },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${s.needColor}`}>必要度：{s.need}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{s.stage}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">フリーランスエンジニアの生命保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '遺族厚生年金の空白額を正確に計算する',
                  detail: '会社員と比べた場合の遺族厚生年金の空白額を把握することが第一歩です。年収・年齢・家族構成を入力してねんきんネットで試算するか、年金事務所に問い合わせることで概算が確認できます。この空白額が民間生命保険で補うべき金額の基準になります。',
                },
                {
                  number: '02',
                  title: '収入保障保険で効率的に高額保障を確保する',
                  detail: 'フリーランスエンジニアの必要保障額は5,000万〜8,000万円規模になるケースが多いです。一括払いの定期保険より、毎月一定額を年金形式で支給する収入保障保険の方が同じ保険料でより大きな保障が得られます。月20〜30万円×65歳までという設計が一般的です。',
                },
                {
                  number: '03',
                  title: '就業不能保険との優先順位を理解する',
                  detail: 'フリーランスエンジニアは①就業不能保険（働けない時の収入補填）②生命保険（死亡時の遺族保障）③医療保険（入院・手術費用）の順で優先度が高いです。すべてに加入する場合は合計保険料が月収の5%以内に収まるよう設計してください。',
                },
                {
                  number: '04',
                  title: '法人化を検討している場合は加入タイミングを考慮する',
                  detail: 'フリーランスから一人法人に切り替えると遺族厚生年金が発生するため、生命保険の必要保障額が大幅に下がります。法人化が具体的な計画にある場合は、それを前提とした保険設計をFPに相談することをお勧めします。',
                },
                {
                  number: '05',
                  title: 'DINKSカップルは遺族基礎年金ゼロを前提に設計する',
                  detail: '子のないフリーランスカップルの場合、遺族基礎年金が支給されません。パートナーへの遺族厚生年金もゼロのため、遺族が受け取れる公的給付は寡婦年金のみです。この現実を前提に、より手厚い生命保険の設計が必要です。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：遺族厚生年金がないことを知らなかった',
                  situation: '35歳男性・フリーランスエンジニア歴5年。妻と子1人。',
                  problem: '会社員時代の生命保険（死亡保障2,000万円）のまま独立。38歳で急性心筋梗塞で死亡。遺族厚生年金がなく、遺族基礎年金（年109万円）と死亡保険金2,000万円のみ。子が18歳になるまでの生活費・教育費に全く足りず、妻が実家に戻る事態になった。',
                  lesson: 'フリーランス転向時に生命保険を必ず見直すこと。遺族厚生年金がなくなる分、民間保険の保障額を大幅に増やす必要がある。',
                },
                {
                  title: '失敗②：DINKSで遺族基礎年金ゼロ・パートナーが無収入に',
                  situation: '40歳男性・フリーランスエンジニア。妻（専業主婦）・子なし。',
                  problem: 'がんで死亡。子がいないため遺族基礎年金は支給されず、遺族厚生年金もゼロ。民間生命保険も最小限だったため、妻が受け取れた公的給付は寡婦年金（60歳以降に年約61万円）のみ。それまでの20年間を民間保険金だけで生活することになった。',
                  lesson: '子のないフリーランスカップルは遺族基礎年金も遺族厚生年金もゼロ。生命保険で手厚く備えること。',
                },
                {
                  title: '失敗③：就業不能保険を優先して生命保険を後回しにした',
                  situation: '32歳男性・フリーランスエンジニア。妻と子1人。',
                  problem: '就業不能保険・医療保険には加入していたが「まだ若いから」と生命保険を後回しにしていた。33歳で交通事故で死亡。就業不能保険・医療保険は生命保険の代わりにならず、遺族が受け取れたのは遺族基礎年金のみ。',
                  lesson: '家族がいるフリーランスは就業不能保険だけでなく生命保険も同時に加入すること。どちらが先に必要になるかは誰にもわからない。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-blue-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション7：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">生命保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '遺族厚生年金がないことを認識し、必要保障額を計算した',
                '2026年度の遺族基礎年金額（子1人：年109万1,100円）を把握した',
                '子のないDINKSカップルは遺族基礎年金ゼロを前提に設計した',
                '収入保障保険で5,000万〜8,000万円規模の保障を確保した',
                '就業不能保険→生命保険→医療保険の優先順位を理解した',
                '法人化計画がある場合は保険設計への影響を確認した',
                '合計保険料を月収の5%以内に抑えた',
                '複数のFP・保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 医師×がん保険 専用コンテンツ */}
      {isDoctorCancer && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">医師にがん保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              医師は患者のがん治療に携わる職業ですが、
              自身のがんリスクへの備えが疎かになりがちな職種です。
              国立がん研究センター「最新がん統計（2023年）」によると、
              生涯でがんに罹患する確率は男性65.5%・女性51.2%と、
              男性では2人に1人以上、女性では2人に1人以上が
              がんに罹患します。
              医師も例外ではありません。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              特に注目すべきは医師特有のがんリスクです。
              針刺し事故によるC型肝炎感染から肝がんへの進行リスク、
              過重労働・バーンアウトによる免疫機能低下、
              そして「医師は自分で健康管理できる」という
              過信から定期的ながん検診を受けない傾向が重なり、
              早期発見が遅れるケースがあります。
              高収入の医師ほど、がんによる就業不能・収入損失の
              影響が大きくなります。
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-emerald-800">
                💡 医師のがん保険で特に重要なポイント
              </p>
              <p className="text-emerald-700 text-sm mt-1">
                医師ががんに罹患した場合、一般の会社員と異なる
                2つの特有リスクがあります：<br />
                ①開業医は診療所の休業リスク（固定費の継続）<br />
                ②手術・処置ができなくなることによる職業的損失<br />
                がん診断一時金と就業不能保険の組み合わせが特に重要です。
              </p>
              <p className="text-xs text-emerald-600 mt-2">
                出典：<a href="https://ganjoho.jp/reg_stat/statistics/stat/summary.html" target="_blank" rel="noopener noreferrer" className="underline">国立がん研究センター「最新がん統計」2023年</a>
              </p>
            </div>
          </section>

          {/* セクション2：公的保障の限界 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">医師のがんリスクと公的保障でカバーされない費用</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">費用の種類</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">公的保障（健康保険・高額療養費）</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">民間がん保険で補う部分</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['手術・入院費用（保険診療）', '高額療養費で月57,600円〜上限あり', 'がん診断一時金・手術給付金で補完'],
                    ['抗がん剤・免疫療法', '保険診療は高額療養費適用', '抗がん剤治療給付金で月々の負担補完'],
                    ['先進医療費用', '❌ 全額自己負担（最大数百万円）', '✅ 先進医療特約（最大2,000万円）'],
                    ['自由診療・最新治療薬', '❌ 全額自己負担（数百万〜数千万円）', '✅ がん診断一時金で充当'],
                    ['開業医の診療所固定費', '❌ 対象外', '✅ がん診断一時金＋就業不能保険'],
                    ['就業制限中の収入損失', '勤務医：傷病手当金（最長18ヶ月）／開業医：❌ なし', '✅ 就業不能保険との組み合わせ'],
                  ].map(([type, pub, priv], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{type}</td>
                      <td className="px-4 py-3 text-gray-600">{pub}</td>
                      <td className="px-4 py-3 text-gray-700">{priv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「高額療養費制度について」2024年</a>
              <a href="https://www.mhlw.go.jp/topics/bukyoku/isei/sensiniryo/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「先進医療の概要について」</a>
            </p>
          </section>

          {/* セクション3：医師特有のがんリスク */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">医師が直面するがんリスクの実態（最新統計）</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① 生涯がん罹患リスク：男性65.5%・女性51.2%</h3>
                <p className="text-gray-700 leading-relaxed">
                  国立がん研究センター「最新がん統計（2023年データ）」によると、
                  日本人が生涯でがんに罹患する累積確率は
                  男性65.5%・女性51.2%。
                  がんによる死亡は2024年に38万4,111人で
                  全死亡数の23.9%を占め、1981年から死因第1位が続いています
                  （厚生労働省「人口動態統計」2024年）。
                  医師も例外なくこのリスクにさらされています。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② バーンアウト・過労による免疫低下リスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省の2022年文献調査によると、
                  過半数の医師がバーンアウト（燃え尽き症候群）を
                  経験していると評価されています。
                  日本の医師の約40%が年間960時間以上の残業を報告しており、
                  10%は1,860時間を超えています
                  （順天堂大学「長時間労働医師の働き方改革に関する全国横断調査」2024年）。
                  慢性的な過労・睡眠不足は免疫機能を低下させ、
                  がんリスクを間接的に高める可能性があります。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ 針刺し事故→C型肝炎→肝がんリスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  C型肝炎ウイルス（HCV）への職業的感染から
                  慢性肝炎・肝硬変・肝がんへ進行するリスクがあります。
                  日本で発生する原発性肝がんの約80%はHCVによるものとされており
                  （厚生労働省がん対策情報）、
                  医師はHCVへの職業的暴露リスクが一般人の約4〜6倍です
                  （厚生労働省「院内感染対策」2022年）。
                  C型肝炎からの肝がん発症率は年間約3〜7%と高く、
                  がん保険での備えが重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">④ 「医師だから大丈夫」という過信による早期発見の遅れ</h3>
                <p className="text-gray-700 leading-relaxed">
                  医師は自身の健康管理に過信が生じやすく、
                  定期的ながん検診を受けない傾向があることが指摘されています。
                  患者に検診を勧める立場にありながら、
                  自分自身は忙しさから検診を後回しにするケースが少なくありません。
                  がん保険への加入が、自身の健康管理を意識する
                  きっかけになることもあります。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://ganjoho.jp/reg_stat/statistics/stat/summary.html" target="_blank" rel="noopener noreferrer" className="underline">国立がん研究センター「最新がん統計」2023年データ</a>
              <a href="https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/kakutei24/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「人口動態統計」2024年（確定数）</a>
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/naika/" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「医療機関における院内感染対策」2022年</a>
            </p>
          </section>

          {/* セクション4：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">医師のがん保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: 'がん診断一時金は500万円以上を確保する',
                  detail: '高収入の医師ががんに罹患した場合、治療費だけでなく就業制限中の収入損失・開業医は診療所固定費も発生します。一般的な100〜300万円の診断一時金では不十分で、500万円以上を確保することが推奨されます。特に開業医は月次固定費（家賃・スタッフ給与等）もカバーできる水準の一時金が必要です。',
                },
                {
                  number: '02',
                  title: '先進医療特約は最大限の保障額で付帯する',
                  detail: '医師は医療知識が豊富なため、最新の治療法（免疫チェックポイント阻害薬・陽子線・重粒子線治療など）を選択する可能性が高いです。先進医療特約は月100〜200円で最大2,000万円の保障が得られます。自由診療の最新治療薬は数百万〜数千万円になるケースがあり、がん診断一時金との組み合わせで備えてください。',
                },
                {
                  number: '03',
                  title: '抗がん剤治療給付金（通院対応）を確認する',
                  detail: '近年のがん治療は外来化学療法（通院での抗がん剤投与）が主流です。入院給付金のみのがん保険では外来治療をカバーできません。月1〜4回の外来化学療法に対応した通院給付金付きのがん保険を選んでください。',
                },
                {
                  number: '04',
                  title: '開業医は就業不能保険との組み合わせが必須',
                  detail: '開業医ががん治療中に就業制限になった場合、個人収入のゼロ＋診療所固定費の二重リスクが発生します。がん保険の診断一時金に加えて就業不能保険（月額給付金は固定費込みで設定）との組み合わせが必須です。',
                },
                {
                  number: '05',
                  title: '定期的なPET-CT・腫瘍マーカー検査を習慣化する',
                  detail: '医師だからこそ、自身のがん検診を後回しにしがちです。がん保険への加入と合わせて、年1回のPET-CT検診・腫瘍マーカー検査を習慣化することをお勧めします。早期発見による治療費の大幅な削減と生存率の向上が期待できます。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：診断一時金が少なく開業医の固定費を賄えなかった',
                  situation: '48歳男性・内科開業医。診療所固定費：月80万円。',
                  problem: '大腸がんと診断され治療に6ヶ月要した。がん保険の診断一時金は100万円だったが、6ヶ月間の診療所固定費（家賃・スタッフ給与・リース費用合計480万円）と個人生活費を合わせると600万円以上の資金が必要だった。一時金100万円では全く足りず、金融機関からの借入が必要になった。',
                  lesson: '開業医のがん診断一時金は診療所固定費も含めた額（500万円以上）を設定すること。',
                },
                {
                  title: '失敗②：先進医療特約なしで免疫療法に数百万円の自己負担',
                  situation: '52歳男性・勤務医。肺がん診断。',
                  problem: '肺がんと診断され、最新の免疫チェックポイント阻害薬による治療を選択。保険適用外の自由診療分として数百万円の自己負担が発生。がん保険に加入していたが先進医療・自由診療特約をつけておらず、診断一時金200万円だけでは不足した。',
                  lesson: '医師は最新治療を選択する可能性が高い。先進医療特約＋自由診療特約で備えること。',
                },
                {
                  title: '失敗③：C型肝炎感染を軽視して肝がんに進行',
                  situation: '45歳女性・外科医。若手時代に針刺し事故経験あり。',
                  problem: '研修医時代の針刺し事故でC型肝炎に感染したが、多忙を理由に治療を後回しにしていた。45歳時に肝硬変から肝がんへの進行が判明。手術・抗がん剤・先進医療で総額300万円以上の自己負担が発生。がん保険に未加入だった。',
                  lesson: '針刺し事故経験のある医師はC型肝炎の治療を優先し、がん保険で肝がんリスクに備えること。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">がん保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '生涯がん罹患リスク（男性65.5%・女性51.2%）を認識した',
                '針刺し事故歴とC型肝炎の検査・治療状況を確認した',
                'がん診断一時金500万円以上を確保した（開業医は固定費も考慮）',
                '先進医療特約を最大保障額で付帯した',
                '通院化学療法に対応した通院給付金を確認した',
                '開業医は就業不能保険との組み合わせを設計した',
                '年1回のPET-CT・腫瘍マーカー検査を習慣化した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* ドライバー×生命保険 専用コンテンツ */}
      {isDriverLife && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">トラックドライバー・運転手に生命保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              トラックドライバーは日本で最も過労死リスクが高い職種の一つです。
              厚生労働省の労災補償データによると、
              脳・心臓疾患の労災支給決定件数に占める
              道路貨物運送業の割合は32.5%と全業種で最も高く、
              雇用者100万人当たりの過労死認定件数は28.3件と
              全業種平均6.0件の約4.7倍に達します。
              30〜50代のドライバーが突然死した場合、
              残された家族への影響は甚大です。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              長距離トラックドライバーの拘束時間は
              1日最大16時間・1ヶ月最大293時間（改正前）と長く、
              心筋梗塞・脳梗塞による突然死リスクが
              全業種の中で突出して高い職種です。
              2024年4月からの「2024年問題」による
              時間外労働規制強化で改善が期待されますが、
              依然として高リスク環境が続いています。
              高収入ではないケースが多い一方、
              家族を養っているドライバーにとって
              生命保険は家族を守る最重要手段です。
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-yellow-800">⚠️ ドライバーの生命保険で特に重要な前提</p>
              <p className="text-yellow-700 text-sm mt-1">
                業務中の死亡事故・過労死は労災保険が適用され
                遺族補償年金が支給されます。
                しかし労災遺族補償年金だけでは
                家族の長期的な生活費・教育費を賄うには不十分です。
                民間生命保険で不足分を補うことが必須です。
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                出典：<a href="https://www.mhlw.go.jp/bunya/roudoukijun/rousaihoken06/dl/0602.pdf" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「過労死等の労災補償状況」2022年度</a>
              </p>
            </div>
          </section>

          {/* セクション2：労災遺族補償と民間生命保険の役割分担 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">労災遺族補償と民間生命保険で補うべき金額</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">給付の種類</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">会社員ドライバー</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">個人事業主（特別加入あり）</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['労災遺族補償年金', '✅ 給付基礎日額×153〜245日/年', '✅ 特別加入者も同様に支給'],
                    ['遺族厚生年金', '✅ あり（報酬比例）', '❌ なし（国民年金のみ）'],
                    ['遺族基礎年金', '✅ あり（子あり：約102万円/年）', '✅ あり（同額）'],
                    ['退職金', '△ 会社規定による', '❌ なし'],
                    ['民間生命保険の必要性', '高（労災+年金では生活費不足）', '極めて高（遺族厚生年金なし）'],
                  ].map(([type, emp, self], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{type}</td>
                      <td className="px-4 py-3 text-gray-600">{emp}</td>
                      <td className="px-4 py-3 text-gray-700">{self}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mt-4 border border-blue-200">
              <p className="font-bold text-blue-800 mb-2">📊 年収400万円・会社員ドライバーの遺族給付シミュレーション</p>
              <p className="text-blue-700 text-sm">
                年収400万円・40歳・妻（パート）・子2人の場合：<br /><br />
                労災遺族補償年金：約167万円/年<br />
                遺族厚生年金＋遺族基礎年金：約130万円/年<br />
                合計公的給付：約297万円/年<br /><br />
                遺族の生活費（月20万円×12ヶ月）：240万円/年<br />
                教育費（子2人）：約1,000〜1,500万円<br /><br />
                <strong>公的給付でも生活費は一応カバーできるが教育費・住宅費・緊急時の資金が不足。民間生命保険で3,000〜5,000万円の保障を確保することが推奨されます。</strong>
              </p>
              <p className="text-xs text-blue-600 mt-2">※試算例。実際は家族構成・勤続年数・生活水準により異なります。</p>
            </div>
          </section>

          {/* セクション3：ドライバー特有の死亡リスク */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">トラックドライバーが直面する死亡・高度障害リスクの実態</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① 過労死認定件数：全業種の32.5%・雇用者100万人当たり28.3件</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省の労災補償データによると、
                  脳・心臓疾患の労災支給決定件数に占める
                  道路貨物運送業の割合は32.5%と全業種で最も高いです。
                  雇用者100万人当たりの過労死認定件数は28.3件と
                  全業種平均6.0件の約4.7倍。
                  脳・心臓疾患の発症時期は1〜3月の厳寒期と
                  7〜9月の猛暑期に集中しており、
                  走行中の突然発症が最も多い特徴があります。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② 交通事故死亡リスク：運輸業の死亡災害は全産業の約10%</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省「労働災害発生状況（2023年）」によると、
                  運輸業・郵便業の死亡災害件数は全産業の約10%を占めます。
                  長時間運転による疲労蓄積・睡眠不足が
                  重大事故の主な原因であり、
                  突然死・重大事故による家族への影響が
                  他の職種より大幅に高いリスクとして存在します。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ 健康診断未受診：労災認定ドライバーの30.8%が未受診</h3>
                <p className="text-gray-700 leading-relaxed">
                  労働安全衛生総合研究所の調査によると、
                  脳・心臓疾患の労災認定があったトラックドライバーの
                  健康診断受診率は69.2%と、
                  輸送・機械運転従事者全体の95.2%より大幅に低い水準でした。
                  健康診断を受けていないために
                  高血圧・糖尿病などの生活習慣病が見逃され、
                  突然の脳・心臓疾患発症につながるケースが多いです。
                  若いうちに生命保険に加入しておくことが重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">④ 個人事業主ドライバーの遺族保障の薄さ</h3>
                <p className="text-gray-700 leading-relaxed">
                  個人事業主・一人親方のドライバーは
                  遺族厚生年金がありません。
                  死亡時に遺族が受け取れる公的給付は
                  遺族基礎年金（子あり：年約102万円）のみで、
                  子のない配偶者には遺族基礎年金も支給されません。
                  民間生命保険が家族を守る唯一の手段となります。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://www.mhlw.go.jp/bunya/roudoukijun/rousaihoken06/dl/0602.pdf" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「過労死等の労災補償状況」2022年度</a>
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousaihoken06/rousaichishiki06.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省労働基準局「脳・心臓疾患の労災認定参考資料」2022年</a>
              <a href="https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei11/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働災害発生状況」2023年</a>
            </p>
          </section>

          {/* セクション4：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">ドライバーの生命保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '必要保障額は労災遺族補償を差し引いて計算する',
                  detail: '業務中の死亡は労災遺族補償年金が支給されます。民間生命保険の必要保障額は「遺族の生活費総額＋教育費＋住宅費」から「労災補償＋遺族年金＋貯蓄」を差し引いた金額です。年収400万円のドライバーで3,000〜5,000万円が目安です。',
                },
                {
                  number: '02',
                  title: '健康状態が良いうちに加入する（過労・肥満で審査困難になる前に）',
                  detail: 'トラックドライバーは長時間労働・不規則食事による高血圧・糖尿病・肥満のリスクが高いです。健康診断で異常を指摘される前に加入しておくことが重要です。労災認定ドライバーの30.8%が健康診断未受診だったというデータは、健康管理の重要性を示しています。',
                },
                {
                  number: '03',
                  title: '個人事業主は遺族厚生年金がないことを考慮して保障額を増やす',
                  detail: '個人事業主ドライバーは遺族厚生年金がなく、会社員より民間生命保険の必要保障額が大きくなります。子のない配偶者への遺族基礎年金も支給されないため、特に子のない夫婦の場合は手厚い保障が必要です。',
                },
                {
                  number: '04',
                  title: '収入保障保険で効率的に保障を確保する',
                  detail: '一時金型の死亡保険金より、毎月一定額が支給される「収入保障保険」がドライバーの家族には使いやすいケースがあります。毎月の生活費として受け取れるため、大金の管理リスクがなく計画的な生活設計が可能です。保険料も割安になる傾向があります。',
                },
                {
                  number: '05',
                  title: '医療保険・就業不能保険との組み合わせを設計する',
                  detail: '生命保険（死亡・高度障害）と医療保険（入院・手術）、就業不能保険（長期休業時の収入補填）の3種類を組み合わせた総合的な保障設計が重要です。特に個人事業主ドライバーは傷病手当金がないため就業不能保険が特に必要です。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：労災があるから生命保険は不要と思っていた',
                  situation: '42歳男性・長距離トラックドライバー。妻と子2人。',
                  problem: '「業務中に死んだら労災が出るから大丈夫」と生命保険に未加入。走行中に心筋梗塞で死亡。労災遺族補償年金（年約167万円）と遺族年金（年約130万円）は支給されたが、教育費・住宅ローンを賄えず、妻がフルタイム復帰を余儀なくされた。',
                  lesson: '労災遺族補償は生活費の一部しかカバーしない。教育費・住宅費への備えに民間生命保険が必須。',
                },
                {
                  title: '失敗②：高血圧・肥満で審査に通らなかった',
                  situation: '48歳男性・運送会社勤務。BMI32・高血圧（収縮期170mmHg）。',
                  problem: '子供が生まれたタイミングで生命保険への加入を検討したが、長年の不規則食事と運動不足で高血圧・肥満が進行しており通常審査では引受謝絶。割高な引受基準緩和型に加入するしかなかった。',
                  lesson: '若いうちに・健康なうちに加入すること。ドライバーは生活習慣病リスクが高く、年齢が上がるほど加入が困難になる。',
                },
                {
                  title: '失敗③：個人事業主で遺族厚生年金がなく家族が困窮',
                  situation: '45歳男性・個人事業主・運送業。妻と子1人。',
                  problem: '心疾患で急死。遺族厚生年金がなく遺族基礎年金（年約102万円）のみ。民間生命保険も最小限だったため、妻への収入補填が不十分で子の高校卒業後すぐの就職を余儀なくされた。',
                  lesson: '個人事業主ドライバーは遺族厚生年金がない分、民間生命保険の保障額を会社員より手厚くすること。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-yellow-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">生命保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '過労死認定件数が全業種の32.5%というリスクを認識した',
                '労災遺族補償・遺族年金の概算額を確認した',
                '必要保障額（3,000〜5,000万円）を計算した',
                '健康診断結果を確認し健康なうちに加入した',
                '個人事業主の場合は遺族厚生年金がないことを考慮した保障額を設定した',
                '収入保障保険による効率的な保障設計を検討した',
                '医療保険・就業不能保険との組み合わせを設計した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 営業職×医療保険 専用コンテンツ */}
      {isSalesMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">営業職に医療保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              営業職は外回り・接待・ノルマストレスという
              職業特有の健康リスクが重なる職種です。
              厚生労働省「労働安全衛生調査（2022年）」によると、
              メンタルヘルス不調で連続1ヶ月以上休業した労働者がいた
              事業所割合は10.6%。
              特にノルマのある営業職はこのリスクが高く、
              精神疾患・生活習慣病・交通事故という
              3つのリスクが同時に存在します。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              会社員営業職は健康保険に加入しており
              傷病手当金・高額療養費制度という公的保障があります。
              しかし差額ベッド代・先進医療費用・
              精神科の長期入院費用などは
              公的保障ではカバーされません。
              営業職特有のリスクを理解した上で、
              必要最小限かつ最大効果の医療保険設計が重要です。
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-orange-800">
                💡 営業職の医療保険で特に重要なポイント
              </p>
              <p className="text-orange-700 text-sm mt-1">
                営業職は「精神疾患・生活習慣病・交通事故」という
                3つのリスクが同時に存在します。
                特に精神疾患特約・先進医療特約の2つが
                営業職の医療保険選びの核心です。
              </p>
              <p className="text-xs text-orange-600 mt-2">
                出典：<a href="https://www.mhlw.go.jp/toukei/list/h24-46-50.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働安全衛生調査（実態調査）」2022年</a>
              </p>
            </div>
          </section>

          {/* セクション2：公的保障と民間医療保険の役割分担 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">会社員営業職の公的保障と民間医療保険で補うべき部分</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">費用の種類</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">公的保障（健康保険・高額療養費）</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">民間医療保険で補う部分</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['入院・手術費用（保険診療）', '高額療養費で月57,600円上限（年収500万円の場合）', '入院日額・手術給付金で補完'],
                    ['差額ベッド代', '❌ 全額自己負担（1日3,000〜10,000円）', '✅ 特約または入院日額で補完'],
                    ['先進医療費用', '❌ 全額自己負担（数十〜数百万円）', '✅ 先進医療特約（月100〜200円）'],
                    ['精神科入院費用', '高額療養費適用（平均278日入院で累積大）', '✅ 精神疾患特約付き医療保険'],
                    ['交通事故による入院', '健康保険適用（自動車保険との調整あり）', '✅ 入院日額で補完'],
                    ['生活習慣病の長期治療費', '高額療養費適用だが通院が長期累積', '✅ 入院給付金・手術給付金'],
                  ].map(([type, pub, priv], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{type}</td>
                      <td className="px-4 py-3 text-gray-600">{pub}</td>
                      <td className="px-4 py-3 text-gray-700">{priv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「高額療養費制度について」2024年</a>
            </p>
          </section>

          {/* セクション3：営業職特有の医療リスク */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">営業職が直面する医療リスクの実態（最新統計）</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① 精神疾患：メンタルヘルス不調休業の事業所割合10.6%</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省「労働安全衛生調査（実態調査）2022年」によると、
                  メンタルヘルス不調で連続1ヶ月以上休業した労働者がいた
                  事業所の割合は10.6%。
                  ノルマ達成プレッシャー・顧客クレーム・
                  長時間の移動や接待が重なる営業職は
                  このリスクが特に高い職種です。
                  精神科の平均入院日数は約278日
                  （厚生労働省「患者調査」2020年）と長く、
                  精神疾患特約付きの医療保険が必須です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② 生活習慣病：メタボ該当者16.6%・接待・不規則食事が主因</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省「特定健康診査・特定保健指導の実施状況（2022年度）」によると、
                  特定健診受診者のうちメタボリックシンドローム該当者は16.6%
                  （男性23.3%・女性3.2%）、予備群該当者は12.3%。
                  接待・会食・不規則な食事時間が多い営業職は
                  このリスクが全国平均より高い傾向があります。
                  糖尿病が強く疑われる人は男性18.1%・女性9.1%
                  （厚生労働省「国民健康・栄養調査」2022年）で、
                  入院・手術が必要になる重症化への備えが重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ 交通事故リスク：外回り営業は業務中事故リスクが高い</h3>
                <p className="text-gray-700 leading-relaxed">
                  外回り営業で車を日常的に使用する営業職は、
                  業務中の交通事故リスクが一般のデスクワーカーより高いです。
                  交通事故による骨折の平均入院日数は約35日
                  （厚生労働省「患者調査」2022年）。
                  業務中の交通事故は労災保険が適用されますが、
                  差額ベッド代・食事代は自己負担となります。
                  またメンタルヘルス不調との関連も指摘されており、
                  精神疾患によるアクシデントリスクにも注意が必要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">④ 声帯疾患・のどの酷使による職業性疾患</h3>
                <p className="text-gray-700 leading-relaxed">
                  営業職は日常的に声を使う職業であり、
                  長期間の電話営業・プレゼン・商談による
                  声帯ポリープ・咽頭炎のリスクがあります。
                  重症化すると手術・入院が必要になるケースもあり、
                  これらの手術が医療保険の給付対象かどうかを
                  確認することが重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://www.mhlw.go.jp/toukei/list/h24-46-50.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働安全衛生調査（実態調査）」2022年</a>
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/tokutei-kensin/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「特定健康診査・特定保健指導の実施状況」2022年度</a>
              <a href="https://www.mhlw.go.jp/bunya/kenkou/eiyou/h24-houkoku.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「国民健康・栄養調査」2022年</a>
              <a href="https://www.mhlw.go.jp/toukei/saikin/hw/kanja/20/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「患者調査」2020年・2022年</a>
            </p>
          </section>

          {/* セクション4：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">営業職の医療保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '精神疾患特約付き・入院給付日数1,000日以上を選ぶ',
                  detail: '営業職のメンタルヘルス不調リスクを考慮すると、精神疾患特約は必須です。精神科の平均入院日数は278日と長いため、入院給付日数が1,000日以上（または無制限）の商品を選んでください。60日・180日制限の商品では長期入院に対応できません。',
                },
                {
                  number: '02',
                  title: '先進医療特約は必ず付帯する',
                  detail: '月100〜200円で付帯できる先進医療特約は営業職にも必須です。生活習慣病の重症化によるがん・脳疾患で先進医療を選択した場合、数百万円の費用が全額自己負担になります。',
                },
                {
                  number: '03',
                  title: '会社の健康保険組合の付加給付を先に確認する',
                  detail: '大企業・健保組合加入の営業職は付加給付（月25,000円超の自己負担を還付）がある場合があります。付加給付がある場合は民間医療保険の必要性が下がります。まず会社の健保組合の給付内容を確認してから設計してください。',
                },
                {
                  number: '04',
                  title: '生活習慣病の告知と健康なうちの加入を優先する',
                  detail: '接待・不規則食事によるメタボ・高血圧・糖尿病がある場合、医療保険の審査で条件が付くことがあります。健康診断で異常を指摘される前の若いうちに加入することがより良い条件での契約につながります。',
                },
                {
                  number: '05',
                  title: '就業不能保険との組み合わせを検討する',
                  detail: '医療保険（入院・手術費用）と就業不能保険（収入補填）は役割が異なります。営業職は歩合給・インセンティブがある場合、傷病手当金が実収入より少なくなることがあります。不足分を就業不能保険で補う設計も検討してください。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：精神疾患特約なしでうつ病入院の給付ゼロ',
                  situation: '32歳男性・不動産営業。ノルマ達成率50%が続いた。',
                  problem: 'ノルマプレッシャーからうつ病を発症し精神科に4ヶ月入院。加入していた医療保険は精神疾患特約なしのため入院給付ゼロ。傷病手当金はあったが入院中の医療費・差額ベッド代が全額自己負担になり貯蓄が大幅に減少した。',
                  lesson: '営業職はメンタルヘルス不調リスクが高い。精神疾患特約付き・入院給付日数1,000日以上の医療保険が必須。',
                },
                {
                  title: '失敗②：生活習慣病で審査が通らず加入できなかった',
                  situation: '45歳男性・保険営業。接待が多い職場。',
                  problem: '健康診断で糖尿病（HbA1c 7.2%）・高血圧（収縮期160mmHg）を指摘された後に医療保険への加入を検討したが、通常の審査では引受謝絶。引受基準緩和型に加入したが保険料が割高になった。',
                  lesson: '接待の多い営業職は生活習慣病リスクが高い。健康診断で異常を指摘される前に加入しておくこと。',
                },
                {
                  title: '失敗③：先進医療特約なしで大腸がん治療に300万円',
                  situation: '48歳男性・食品メーカー営業。',
                  problem: '大腸がんと診断され重粒子線治療（先進医療）を希望。費用約294万円が全額自己負担。医療保険に加入していたが先進医療特約をつけていなかった。月150円の特約で防げた損失だった。',
                  lesson: '先進医療特約は月100〜200円で付帯できる。加入時に必ず確認すること。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-orange-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">医療保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '会社の健保組合の付加給付有無を確認した',
                '高額療養費制度の自己負担上限額を把握した',
                '精神疾患特約付き・入院給付日数1,000日以上の商品を選んだ',
                '先進医療特約（月100〜200円）を付帯した',
                '生活習慣病・メタボの告知義務を確認し健康なうちに加入した',
                '就業不能保険との組み合わせで歩合給の収入減少リスクに備えた',
                '声帯疾患・咽頭炎の手術給付条件を確認した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 建設業×就業不能保険 専用コンテンツ */}
      {isConstructionIncomeProtection && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">建設業・現場作業員に就業不能保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              建設業は全産業の中で死亡・重傷災害が最も多い業種ですが、
              死亡に至らない重篤な怪我による長期就業不能リスクも
              極めて高い職種です。
              高所からの転落による脊髄損傷・骨折・
              重機事故による四肢の切断など、
              長期にわたって現場作業ができない状態になるケースが
              建設業では特に多く発生しています。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              業務中の事故は労災保険が適用され休業補償給付
              （給付基礎日額の80%）が支給されますが、
              これには上限があります。
              また一人親方・個人事業主の場合、
              労災特別加入をしていなければ
              業務中の事故でも労災保険が適用されません。
              会社員・個人事業主それぞれの状況に応じた
              就業不能保険の設計が重要です。
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-orange-800">⚠️ 建設業の就業不能保険で最も重要な前提</p>
              <p className="text-orange-700 text-sm mt-1">
                業務中の怪我：労災保険が優先適用<br />
                （休業補償給付＝給付基礎日額×80%）<br /><br />
                私傷病（業務外の病気・ケガ）：<br />
                会社員→傷病手当金（月収67%・最長18ヶ月）<br />
                一人親方→傷病手当金なし・収入即ゼロ<br /><br />
                民間就業不能保険は「労災・傷病手当金でカバーされない部分」
                および「給付終了後の長期就業不能」に備えるものです。
              </p>
              <p className="text-xs text-orange-600 mt-2">
                出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働者災害補償保険法」</a>
              </p>
            </div>
          </section>

          {/* セクション2：公的保障と就業不能保険の役割分担 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">建設業の公的保障と就業不能保険で補うべき部分</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">項目</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">会社員建設業者</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">一人親方（特別加入あり）</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">一人親方（特別加入なし）</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['業務中の怪我', '労災休業補償（日額80%）', '労災休業補償（日額80%）', '❌ 補償なし'],
                    ['私傷病の収入補填', '傷病手当金（月収67%・最長18ヶ月）', '❌ なし', '❌ なし'],
                    ['18ヶ月以降の補填', '❌ なし', '❌ なし', '❌ なし'],
                    ['就業不能保険の優先度', '中〜高（18ヶ月以降・私傷病33%分）', '高（私傷病は即収入ゼロ）', '極めて高（全リスクに無防備）'],
                  ].map(([item, col1, col2, col3], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{item}</td>
                      <td className="px-4 py-3 text-gray-600">{col1}</td>
                      <td className="px-4 py-3 text-gray-600">{col2}</td>
                      <td className="px-4 py-3 text-gray-700">{col3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/rousai/" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働者災害補償保険法」</a>
              <a href="https://www.kyoukaikenpo.or.jp/g3/cat310/sb3040/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「傷病手当金について」</a>
            </p>
          </section>

          {/* セクション3：就業不能リスクの実態 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">建設業・現場作業員が直面する就業不能リスクの実態</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① 重傷災害：脊髄損傷・四肢切断による長期就業不能</h3>
                <p className="text-gray-700 leading-relaxed">
                  高所からの転落による脊髄損傷は
                  建設業特有の重大リスクです。
                  脊髄損傷による四肢麻痺・対麻痺は
                  現場作業への復帰が困難または不可能になるケースが多く、
                  長期的な就業不能状態が続きます。
                  労災保険の障害補償年金が支給されますが、
                  それだけでは生活費を賄えない場合があります。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② 腰椎・頸椎の重症疾患：手術後の長期リハビリ</h3>
                <p className="text-gray-700 leading-relaxed">
                  重量物の取り扱いや高所作業による腰椎椎間板ヘルニア・
                  腰椎すべり症の重症例では、
                  腰椎固定術後のリハビリに3〜6ヶ月かかります。
                  術後の就業制限期間中は現場作業ができず、
                  収入が大幅に減少します。
                  この期間の収入補填として就業不能保険が重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ じん肺・石綿関連疾患：長期療養リスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  じん肺・中皮腫（アスベスト関連疾患）は
                  発症後の就業能力が著しく低下します。
                  労災認定されれば療養補償・障害補償が支給されますが、
                  認定プロセスに時間がかかる間の収入補填として
                  民間就業不能保険が有効です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">④ 一人親方の「即収入ゼロ」リスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  一人親方は病気・ケガで働けなくなった瞬間、
                  収入がゼロになります。
                  傷病手当金がなく、
                  労災特別加入をしていなければ
                  業務中の事故でも補償がありません。
                  月収40万円の一人親方が3ヶ月働けなくなった場合、
                  収入損失は120万円。
                  これに家族の生活費・現場の道具・車両の維持費が重なります。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://www.mhlw.go.jp/bunya/roudoukijun/anzeneisei11/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「労働災害発生状況」2023年</a>
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/anzen/jinkaku/" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「じん肺健康管理実施状況報告」2022年</a>
            </p>
          </section>

          {/* セクション4：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">建設業の就業不能保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '一人親方は労災特別加入と就業不能保険を両方確保する',
                  detail: '一人親方は労災特別加入（年間保険料数万円）と民間就業不能保険の両方が必要です。労災特別加入は業務中のリスクをカバーし、就業不能保険は私傷病（業務外の病気・ケガ）をカバーします。どちらか一方では完全なカバーができません。',
                },
                {
                  number: '02',
                  title: '会社員は支払対象外期間を18ヶ月に設定する',
                  detail: '会社員建設業者は傷病手当金（最長18ヶ月）があるため、就業不能保険の支払対象外期間を18ヶ月に設定することで保険料を抑えながら「18ヶ月以降の長期就業不能」に備えられます。一人親方は傷病手当金がないため支払対象外期間は60〜90日が適切です。',
                },
                {
                  number: '03',
                  title: '「現場作業ができない状態」を就業不能と定義する保険を選ぶ',
                  detail: '建設業の就業不能は「完全に動けない」ではなく「現場作業（高所作業・重量物取り扱い等）ができない状態」です。就業不能の定義が「全く働けない状態のみ」の保険では、現場復帰できないが軽作業はできる状態で給付されないケースがあります。就業不能の定義を確認してください。',
                },
                {
                  number: '04',
                  title: '脊髄損傷・四肢麻痺の高度障害補償を確認する',
                  detail: '建設業は高所転落による脊髄損傷リスクが高いです。就業不能保険と合わせて、生命保険の高度障害保険金特約（両手・両足の機能廃絶等）が付帯されているかを確認してください。就業不能状態が永続する場合は高度障害保険金が重要な備えになります。',
                },
                {
                  number: '05',
                  title: '月額給付金は固定費（道具・車両維持費）も考慮する',
                  detail: '建設業の個人事業主・一人親方は道具・工具・車両の維持費が毎月発生します。就業不能中もこれらの固定費は続くため、月額給付金は個人の生活費だけでなく事業の固定費もカバーできる水準に設定してください。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：一人親方で労災特別加入なし・業務中事故で無補償',
                  situation: '45歳男性・一人親方・左官工。',
                  problem: '足場からの転落で腰椎骨折。労災特別加入をしていなかったため業務中の事故にもかかわらず労災保険が適用されず。就業不能保険にも未加入で、5ヶ月間の収入ゼロ＋医療費で貯蓄が底をつき廃業を余儀なくされた。',
                  lesson: '一人親方は労災特別加入（年数万円）と就業不能保険の両方が必須。どちらか一方では不十分。',
                },
                {
                  title: '失敗②：「現場作業不能」が就業不能と認定されなかった',
                  situation: '38歳男性・建設会社勤務・とび職。',
                  problem: '高所転落で膝の靭帯損傷。高所作業・重量物作業ができない状態が4ヶ月続いたが、加入していた就業不能保険の定義が「全く働けない状態」のみで、事務作業は可能だったため給付が認められなかった。',
                  lesson: '建設業は「現場作業ができない状態」を就業不能と定義する保険を選ぶこと。',
                },
                {
                  title: '失敗③：会社員で支払対象外期間が短すぎて保険料の無駄',
                  situation: '35歳男性・建設会社正社員。',
                  problem: '支払対象外期間60日の就業不能保険に加入。腰椎手術で3ヶ月休業した際、傷病手当金と就業不能保険の給付が重複し過剰な収入補填になった。支払対象外期間18ヶ月に設定すれば同じ保障でより安い保険料にできた。',
                  lesson: '会社員建設業者は傷病手当金（最長18ヶ月）を考慮して支払対象外期間を18ヶ月に設定することで保険料を最適化できる。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-orange-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">就業不能保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '一人親方の場合は労災特別加入の有無を確認した',
                '会社員：支払対象外期間18ヶ月設定で保険料を最適化した',
                '一人親方：支払対象外期間60〜90日の即時給付タイプを選んだ',
                '「現場作業ができない状態」を就業不能と定義する保険を選んだ',
                '脊髄損傷・高度障害に備えた生命保険の高度障害特約を確認した',
                '月額給付金に事業固定費（道具・車両維持費）も含めた',
                'じん肺・石綿関連疾患への長期的な備えも検討した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 教員×就業不能保険 専用コンテンツ */}
      {isTeacherIncomeProtection && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">教員・教師に就業不能保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              教員は2022年度に精神疾患による休職者数が
              過去最多の6,539人を記録した職種です。
              公立学校教員は共済組合による手厚い休職給与補償
              （1年目100%・2年目80%）がありますが、
              3年目以降は無給となります。
              精神疾患の治療が長期化した場合、
              「3年目の収入の崖」に備えた就業不能保険が必要です。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              また私立学校教員は学校によって保障内容が異なり、
              公立教員より休職給与補償が薄いケースがあります。
              さらに早期退職・転職を選択した場合も
              収入が大幅に低下するため、
              就業不能保険による長期的な収入補償が
              教員にとって重要な備えとなります。
            </p>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-purple-800">
                💡 教員の就業不能保険：公立と私立で設計が異なる
              </p>
              <p className="text-purple-700 text-sm mt-1">
                公立学校教員：<br />
                休職1年目100%→2年目80%→3年目以降0%<br />
                → 支払対象外期間2年設定が最適<br /><br />
                私立学校教員：<br />
                学校によって異なる（傷病手当金のみの場合も）<br />
                → 勤務先の保障を確認してから設計する
              </p>
              <p className="text-xs text-purple-600 mt-2">
                出典：<a href="https://www.mext.go.jp/a_menu/shotou/jinji/index.htm" target="_blank" rel="noopener noreferrer" className="underline">文部科学省「公立学校教職員の休職制度」</a>
              </p>
            </div>
          </section>

          {/* セクション2：共済補償と就業不能保険の役割分担 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">教員の共済休職補償と就業不能保険で補うべき部分</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">休職期間</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">公立学校教員（共済）</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">私立学校教員</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">就業不能保険の役割</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['休職1年目', '✅ 給与100%', '傷病手当金（月収67%）', '公立は補完不要・私立は33%分補填'],
                    ['休職2年目', '✅ 給与80%', '傷病手当金終了→無給', '公立は20%補填・私立は全額補填'],
                    ['休職3年目以降', '❌ 無給', '❌ 無給', '✅ 全額補填が必要'],
                    ['早期退職後', '退職手当減額・年金のみ', '退職手当・年金のみ', '✅ 再就職までの収入補填'],
                  ].map(([period, pub, priv, role], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{period}</td>
                      <td className="px-4 py-3 text-gray-600">{pub}</td>
                      <td className="px-4 py-3 text-gray-600">{priv}</td>
                      <td className="px-4 py-3 text-gray-700">{role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：<a href="https://www.mext.go.jp/a_menu/shotou/jinji/index.htm" target="_blank" rel="noopener noreferrer" className="underline">文部科学省「公立学校共済組合給付の概要」</a>
              <a href="https://www.kyoukaikenpo.or.jp/g3/cat310/sb3040/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「傷病手当金について」</a>
            </p>
          </section>

          {/* セクション3：就業不能リスクの実態 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">教員が直面する就業不能リスクの実態</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① 精神疾患休職：過去最多6,539人・全就業者平均の3倍</h3>
                <p className="text-gray-700 leading-relaxed">
                  文部科学省「公立学校教職員の人事行政状況調査（2022年度）」によると、
                  精神疾患で休職した公立学校教員は6,539人（過去最多）。
                  教員全体の0.71%が精神疾患で休職しており、
                  この割合は全就業者平均の約3倍に相当します。
                  主な原因は保護者対応・長時間労働・部活動指導・
                  同僚・管理職との人間関係です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② 平均休職期間：1年以上が多数</h3>
                <p className="text-gray-700 leading-relaxed">
                  教員の精神疾患による休職は長期化しやすく、
                  1年以上の休職事例が多数報告されています。
                  文部科学省の調査では、
                  精神疾患休職者の約40%が2年以上休職しており、
                  公立教員の「3年目の無給」に直面するケースが
                  決して稀ではありません。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ 早期退職による退職手当の激減</h3>
                <p className="text-gray-700 leading-relaxed">
                  精神疾患で長期休職後に早期退職した場合、
                  定年まで勤めた場合と比べて退職手当が
                  大幅に減額されます。
                  勤続20年での早期退職と勤続35年での定年退職では、
                  退職手当に1,000万円以上の差が生じるケースがあります。
                  早期退職後の収入低下期間を支える
                  就業不能保険の重要性は高いです。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">④ 声帯疾患・腰痛による就業制限</h3>
                <p className="text-gray-700 leading-relaxed">
                  教員は声を酷使する職業であり、
                  声帯ポリープ・声帯結節による手術後の
                  発声制限期間（1〜3ヶ月）に授業ができない状態になります。
                  また腰痛による就業制限も教員に多い就業不能要因です。
                  これらの疾患が就業不能保険の給付対象かどうかも
                  確認が必要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://www.mext.go.jp/a_menu/shotou/jinji/1411820.htm" target="_blank" rel="noopener noreferrer" className="underline">文部科学省「公立学校教職員の人事行政状況調査」2022年度</a>
              <a href="https://www.mext.go.jp/b_menu/houdou/2023/1411715_00001.htm" target="_blank" rel="noopener noreferrer" className="underline">文部科学省「教員勤務実態調査」2022年度</a>
            </p>
          </section>

          {/* セクション4：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">教員の就業不能保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '公立教員は支払対象外期間を2年に設定する',
                  detail: '公立学校教員は休職1〜2年目に給与補償があるため、就業不能保険の支払対象外期間を2年（730日）に設定することで保険料を大幅に抑えながら「3年目以降の保障の空白」に備えられます。私立学校教員は傷病手当金の期間（最長18ヶ月）に合わせて支払対象外期間を設定してください。',
                },
                {
                  number: '02',
                  title: '精神疾患特約は必須・給付日数の上限なしを選ぶ',
                  detail: '教員の精神疾患休職者数は全就業者平均の3倍。精神疾患特約は必須であり、給付日数に上限がない（または1,000日超の）商品を選んでください。重症例では3年以上の治療が必要なケースがあるため、長期給付に対応した商品が重要です。',
                },
                {
                  number: '03',
                  title: '声帯疾患・腰痛が就業不能の給付対象か確認する',
                  detail: '声帯ポリープ手術後の発声制限・腰痛による授業不能状態が就業不能保険の給付対象になるかどうかを確認してください。「全く働けない状態」のみ対象の保険では、声が出ない・立てないが出勤はできる状態が給付対象外になる可能性があります。',
                },
                {
                  number: '04',
                  title: '早期退職後の収入補填期間を考慮する',
                  detail: '精神疾患で早期退職した場合、退職後の再就職・収入回復までの期間の生活費補填が必要です。就業不能保険の保険期間を65歳満了に設定することで、早期退職後も保障が継続します。',
                },
                {
                  number: '05',
                  title: '私立学校教員は勤務先の保障を先に確認する',
                  detail: '私立学校教員は学校によって休職時の給与補償が大きく異なります。傷病手当金のみの場合は最長18ヶ月後に無給となるため、支払対象外期間の設定が公立教員とは異なります。勤務先の総務・人事部門に確認してから設計してください。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：3年目に無給になり住宅ローンが払えなくなった',
                  situation: '40代男性・公立中学校教諭。住宅ローン残債2,500万円。',
                  problem: 'バーンアウトで休職。1年目・2年目は共済の給与補償で生活できたが、3年目に突入した時点で完全に無給に。就業不能保険に未加入だったため住宅ローンの支払いが困難になり、自宅売却を余儀なくされた。',
                  lesson: '公立教員でも3年目以降は無給。「3年目の収入の崖」に備えた就業不能保険は必須。',
                },
                {
                  title: '失敗②：精神疾患特約なしで最も必要な給付がゼロ',
                  situation: '20代女性・公立小学校教諭。採用2年目。',
                  problem: '保護者からのクレームが続きうつ病を発症して休職。就業不能保険に加入していたが精神疾患特約なしのタイプで給付ゼロ。共済の給与補償はあったが、精神科の治療費・薬代が家計を圧迫した。',
                  lesson: '教員は精神疾患リスクが全就業者の3倍。精神疾患特約は必ず付帯すること。',
                },
                {
                  title: '失敗③：私立学校で傷病手当金が18ヶ月で終了し無保障に',
                  situation: '35歳女性・私立高校教諭。',
                  problem: '適応障害で休職。私立学校のため傷病手当金（最長18ヶ月）のみの保障だったが、就業不能保険の支払対象外期間を2年に設定していたため、傷病手当金終了後〜就業不能保険の給付開始まで6ヶ月間の空白期間が発生し無収入になった。',
                  lesson: '私立学校教員は傷病手当金の期間（18ヶ月）に合わせた支払対象外期間の設定が必要。公立教員と混同しないこと。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-purple-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">就業不能保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '公立か私立かで休職時の保障内容が異なることを把握した',
                '公立：支払対象外期間2年設定で保険料を効率化した',
                '私立：傷病手当金期間（18ヶ月）に合わせた支払対象外期間を設定した',
                '精神疾患特約付き・給付日数1,000日以上の商品を選んだ',
                '声帯疾患・腰痛の就業不能給付条件を確認した',
                '早期退職後の収入補填を考慮した65歳満了の保険期間を選んだ',
                '医療保険との組み合わせも検討した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 地方公務員×就業不能保険 専用コンテンツ */}
      {isCivilServantIncomeProtection && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">地方公務員に就業不能保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              「公務員は手厚い共済があるから就業不能保険は不要」
              という認識は半分正解・半分誤りです。
              公立学校教員や地方公務員の共済組合は
              休職中の給与補償が充実していますが、
              それには期限があります。
              公立公務員の場合、休職1年目は給与100%、
              2年目は給与80%が支給されますが、
              3年目以降は無給となります。
              精神疾患による休職が3年を超えるケースでは
              民間の就業不能保険が必要になります。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              総務省の調査によると地方公務員の
              メンタルヘルス休職者数は10年連続増加・過去最多。
              精神疾患による休職が長期化するリスクは
              公務員にとっても現実的な問題です。
              共済の手厚い保障を正確に把握した上で、
              3年目以降の「保障の空白」に備えることが重要です。
            </p>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-indigo-800">
                💡 地方公務員の就業不能保険：共済でカバーされない部分を理解する
              </p>
              <p className="text-indigo-700 text-sm mt-1">
                公立公務員の休職給与：<br />
                1年目：給与100%<br />
                2年目：給与80%<br />
                3年目以降：無給（民間就業不能保険が必要）<br /><br />
                多くの精神疾患は2〜3年で回復しますが、
                重症例では3年を超えることもあります。
                「3年目以降の保障」として民間保険を活用してください。
              </p>
              <p className="text-xs text-indigo-600 mt-2">
                出典：<a href="https://www.soumu.go.jp/main_sosiki/jichi_gyousei/koumuin/kyuusoku.html" target="_blank" rel="noopener noreferrer" className="underline">総務省「地方公務員の休職制度」</a>
              </p>
            </div>
          </section>

          {/* セクション2：共済保障と民間保険の役割分担 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">共済の休職給与補償と民間就業不能保険で補うべき部分</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">休職期間</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">公立公務員（共済）</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">私立・民間類似職</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">民間就業不能保険の役割</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['休職1年目', '✅ 給与100%支給', '傷病手当金（月収67%）', '補完不要（十分な保障あり）'],
                    ['休職2年目', '✅ 給与80%支給', '傷病手当金終了→無給', '20%分の収入補填'],
                    ['休職3年目以降', '❌ 無給', '❌ 無給', '✅ 全額補填が必要'],
                    ['休職上限→免職', '休職3年で分限免職の可能性', '解雇の可能性', '失業後の生活費補填'],
                  ].map(([period, civil, private_, role], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{period}</td>
                      <td className="px-4 py-3 text-gray-600">{civil}</td>
                      <td className="px-4 py-3 text-gray-600">{private_}</td>
                      <td className="px-4 py-3 text-gray-700">{role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
              <p className="font-bold text-yellow-800 mb-2">⚠️ 公務員の「分限免職」リスクに注意</p>
              <p className="text-yellow-700 text-sm">
                公務員は法律で身分が保障されていますが、
                休職期間が上限（通常3年）を超えると
                「分限免職（能力・適格性を欠くとして免職）」
                になる可能性があります。
                免職後は公務員の身分を失い、
                公的年金・社会保険も変わります。
                この最悪のシナリオに備えた長期的な
                就業不能保険が重要です。
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                出典：<a href="https://elaws.e-gov.go.jp/document?lawid=325AC0000000261" target="_blank" rel="noopener noreferrer" className="underline">地方公務員法第28条（分限）</a>
              </p>
            </div>
          </section>

          {/* セクション3：就業不能リスクの実態 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">地方公務員が直面する就業不能リスクの実態</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① 精神疾患休職：10年連続増加・平均休職期間1年以上</h3>
                <p className="text-gray-700 leading-relaxed">
                  総務省「地方公務員の健康状況等の現況（2022年）」によると、
                  地方公務員のメンタルヘルス休職者数は10年連続増加。
                  住民対応・議会対応・ハラスメント問題が主な原因で、
                  精神疾患による平均休職期間は1年以上のケースが多いです。
                  休職2年目から給与が80%に減額され、
                  3年目以降は無給になるため、
                  長期化した場合の収入補填が必要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② 長時間労働：国家公務員の月平均残業20.4時間</h3>
                <p className="text-gray-700 leading-relaxed">
                  人事院「国家公務員給与等実態調査（2022年）」によると、
                  国家公務員の時間外勤務月平均は20.4時間。
                  地方公務員でも議会対応・災害対応・年度末などに
                  長時間残業が発生しやすく、
                  過労による心疾患・脳血管疾患リスクがあります。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ 休職3年後の「収入の崖」</h3>
                <p className="text-gray-700 leading-relaxed">
                  公務員の休職給与は1年目100%→2年目80%→3年目以降0%。
                  月収40万円の公務員が3年間休職した場合の収入シミュレーション：<br />
                  1年目：月40万円（計480万円）<br />
                  2年目：月32万円（計384万円）<br />
                  3年目：月0円（収入の崖）<br />
                  3年目以降に就業不能保険がなければ
                  家族の生活が危機に瀕します。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://www.soumu.go.jp/main_sosiki/jichi_gyousei/koumuin/kenkoukanri.html" target="_blank" rel="noopener noreferrer" className="underline">総務省「地方公務員の健康状況等の現況」2022年</a>
              <a href="https://www.jinji.go.jp/toukei/kyuuyo/jtoukeisho.html" target="_blank" rel="noopener noreferrer" className="underline">人事院「国家公務員給与等実態調査」2022年</a>
              <a href="https://elaws.e-gov.go.jp/document?lawid=325AC0000000261" target="_blank" rel="noopener noreferrer" className="underline">地方公務員法第28条</a>
            </p>
          </section>

          {/* セクション4：5つのチェックポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">地方公務員の就業不能保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '支払対象外期間は2年（730日）に設定する',
                  detail: '公立公務員は休職1〜2年目は給与補償があるため、就業不能保険の支払対象外期間を2年（730日）に設定することで保険料を大幅に抑えながら「3年目以降の保障の空白」に備えられます。これが公務員にとって最も効率的な設計です。',
                },
                {
                  number: '02',
                  title: '精神疾患特約は必須・給付日数の上限を確認する',
                  detail: '地方公務員の精神疾患休職者数が10年連続増加している現状を踏まえ、精神疾患特約は必須です。精神疾患の回復には長期間かかるケースがあるため、給付日数に上限がない（または1,000日超の）商品を選んでください。',
                },
                {
                  number: '03',
                  title: '月額給付金は給与の20〜100%をカバーできる水準に設定する',
                  detail: '休職2年目は給与80%のため不足分は20%。休職3年目以降は給与0%のため全額が必要です。段階的に保障が必要になる公務員の場合、「支払対象外期間2年・月額給付金は月収の50〜70%」という設計が現実的です。',
                },
                {
                  number: '04',
                  title: '分限免職後の生活費も考慮した長期保障を選ぶ',
                  detail: '休職3年で分限免職になった場合、公務員の身分を失い収入がゼロになります。再就職までの期間（6ヶ月〜2年程度）の生活費をカバーできる長期の就業不能保険を選んでください。保険期間は最低でも65歳満了を選ぶことをお勧めします。',
                },
                {
                  number: '05',
                  title: '私立学校教員・独立行政法人職員は共済内容を先に確認',
                  detail: '私立学校教員・独立行政法人職員は公立公務員と異なる共済・健康保険に加入しています。休職時の給与補償の内容が異なるため、勤務先の人事・総務部門に確認した上で就業不能保険の設計をしてください。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：共済があるから不要と思い3年目で収入ゼロ',
                  situation: '40代女性・市役所職員。',
                  problem: 'うつ病で休職。1年目・2年目は共済の給与補償で生活できたが、3年目に突入した時点で無給に。就業不能保険に未加入だったため、住宅ローンの支払いが困難になり自宅を手放すことを検討せざるを得なかった。',
                  lesson: '公務員の給与補償は3年目で終了。「3年目以降の保障の空白」に備えて就業不能保険に加入すること。',
                },
                {
                  title: '失敗②：支払対象外期間が短すぎて保険料の無駄が発生',
                  situation: '30代男性・県庁職員。',
                  problem: '支払対象外期間60日の就業不能保険に加入。1年目は共済で給与100%保障があるため、就業不能保険の給付を受けても共済と合わせて収入が過剰になった。支払対象外期間2年に設定すれば同じ保障でより安い保険料にできたことが判明。',
                  lesson: '公務員は支払対象外期間を2年に設定することで保険料を効率化できる。',
                },
                {
                  title: '失敗③：精神疾患特約なしで最も必要な場面で給付ゼロ',
                  situation: '30代女性・小学校教諭。',
                  problem: 'モンスターペアレントへの対応ストレスから適応障害を発症し休職。就業不能保険に加入していたが精神疾患特約なしのタイプで給付がゼロ。共済の給与補償はあったが、入院費用・治療費の自己負担が重くなった。',
                  lesson: '地方公務員は精神疾患リスクが高い。精神疾患特約は必ず付帯すること。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-indigo-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">就業不能保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '共済の休職給与補償（1年目100%・2年目80%・3年目以降0%）を把握した',
                '支払対象外期間を2年（730日）に設定して保険料を効率化した',
                '3年目以降の「保障の空白」に備える月額給付金を設定した',
                '精神疾患特約付き・給付日数1,000日以上の商品を選んだ',
                '分限免職後の長期収入補填を考慮した保険期間を選んだ',
                '私立学校・独立行政法人の場合は勤務先の共済内容を確認した',
                '医療保険との組み合わせも検討した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* エンジニア×医療保険 専用コンテンツ */}
      {isEngineerMedical && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">システムエンジニアに医療保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              システムエンジニアは会社員として健康保険に加入しており、
              傷病手当金・高額療養費制度という公的保障があります。
              しかしIT業種特有の長時間労働・精神疾患リスク・
              眼精疲労・腱鞘炎など、
              職業特性から生じる医療ニーズへの備えとして
              民間医療保険の重要性は高いです。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              厚生労働省「過労死等防止対策白書（2022年）」によると、
              IT業種の精神障害労災申請件数は製造業の約2.3倍。
              精神科入院（平均入院日数278日）や
              腱鞘炎・頸椎症の手術など、
              エンジニア特有の医療リスクに対応した
              保険設計が必要です。
              また差額ベッド代・先進医療費用など、
              公的保障ではカバーされない部分への備えも重要です。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-blue-800">
                💡 会社員エンジニアの医療保険：最小限で最大効果を得る設計
              </p>
              <p className="text-blue-700 text-sm mt-1">
                会社員エンジニアは傷病手当金・高額療養費制度があるため、
                民間医療保険は「公的保障でカバーされない部分」に
                絞った設計が効率的です。
                差額ベッド代・先進医療・精神疾患の長期入院が
                主なカバー対象です。
              </p>
              <p className="text-xs text-blue-600 mt-2">
                出典：<a href="https://www.kyoukaikenpo.or.jp/g3/cat310/sb3020/r151/" target="_blank" rel="noopener noreferrer" className="underline">全国健康保険協会「高額療養費制度について」</a>
              </p>
            </div>
          </section>

          {/* セクション2：公的保障の範囲と民間保険で補う部分 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">会社員エンジニアの公的保障と医療保険で補うべき部分</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">費用の種類</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">公的保障（健康保険・高額療養費）</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">民間医療保険で補う部分</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['入院・手術費用（保険診療）', '高額療養費で月57,600円上限', '入院日額・手術給付金で補完'],
                    ['差額ベッド代（個室等）', '❌ 全額自己負担（1日3,000〜10,000円）', '✅ 特約または入院日額で補完'],
                    ['先進医療費用', '❌ 全額自己負担（数十〜数百万円）', '✅ 先進医療特約（月100〜200円）'],
                    ['精神科入院費用', '高額療養費適用（平均278日で累積大）', '✅ 精神疾患特約付き医療保険'],
                    ['腱鞘炎・頸椎手術', '高額療養費適用後も自己負担残あり', '✅ 手術給付金'],
                    ['収入の減少', '傷病手当金（最長18ヶ月）', '就業不能保険の役割'],
                  ].map(([type, pub, priv], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{type}</td>
                      <td className="px-4 py-3 text-gray-600">{pub}</td>
                      <td className="px-4 py-3 text-gray-700">{priv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「高額療養費制度について」</a>
              <a href="https://www.mhlw.go.jp/topics/bukyoku/isei/sensiniryo/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「先進医療の概要について」</a>
            </p>
          </section>

          {/* セクション3：エンジニア特有の医療リスク */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">システムエンジニアが直面する医療リスクの実態</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① 精神疾患：製造業の2.3倍・平均入院日数278日</h3>
                <p className="text-gray-700 leading-relaxed">
                  厚生労働省「過労死等防止対策白書（2022年）」によると、
                  IT業種の精神障害労災申請件数は製造業の約2.3倍。
                  重症化したうつ病・双極性障害では
                  精神科入院が必要になるケースもあります。
                  精神科の平均入院日数は約278日
                  （厚生労働省「患者調査」2020年）と長く、
                  精神疾患特約付きの医療保険が必須です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② 腱鞘炎・頸椎症：手術が必要なケースも</h3>
                <p className="text-gray-700 leading-relaxed">
                  長時間のキーボード・マウス操作による
                  腱鞘炎・頸椎症・胸郭出口症候群は
                  エンジニア特有の職業性疾患です。
                  重症化すると腱鞘切開術・頸椎手術が必要になり、
                  入院・リハビリで数週間〜数ヶ月の休業が必要です。
                  これらの手術・入院が医療保険の給付対象かどうかを
                  確認することが重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ 眼精疲労・緑内障リスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  長時間のディスプレイ作業による慢性的な眼精疲労は
                  緑内障のリスク因子となりえます。
                  緑内障は日本の失明原因第1位であり、
                  早期発見・治療が重要です。
                  レーザー治療・手術が必要なケースでは
                  医療保険の給付対象になります。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">④ 長時間座位による血栓リスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  1日8時間以上の座位時間は
                  深部静脈血栓症（エコノミークラス症候群）のリスクを高めます。
                  国立がん研究センター「多目的コホート研究（2022年）」によると、
                  1日8時間以上の座位は糖尿病リスク2.0倍・
                  心疾患リスク1.4倍。
                  これらの疾患による入院への備えが重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/karoshiboushi/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「過労死等防止対策白書」2022年</a>
              <a href="https://www.mhlw.go.jp/toukei/saikin/hw/kanja/20/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「患者調査」2020年</a>
              <a href="https://epi.ncc.go.jp/jphc/" target="_blank" rel="noopener noreferrer" className="underline">国立がん研究センター「多目的コホート研究」2022年</a>
            </p>
          </section>

          {/* セクション4：選び方5つのポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">エンジニアの医療保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '精神疾患特約付き・入院給付日数1,000日以上を選ぶ',
                  detail: 'IT業種の精神疾患リスクは製造業の2.3倍。精神科の平均入院日数は278日と長いため、精神疾患特約付きかつ入院給付日数が1,000日以上（または無制限）の商品を選んでください。給付日数が60日・180日に制限されている商品では長期の精神科入院に対応できません。',
                },
                {
                  number: '02',
                  title: '先進医療特約は必ず付帯する',
                  detail: '月100〜200円で付帯できる先進医療特約はエンジニアにとっても必須です。がん・脳疾患の最新治療を選択できる保障を確保しておくことが重要です。',
                },
                {
                  number: '03',
                  title: '腱鞘炎・眼科手術の給付条件を確認する',
                  detail: '腱鞘切開術・緑内障手術・白内障手術などの眼科・整形外科手術が給付対象かどうかを確認してください。内視鏡手術・レーザー手術も対象になる新しいタイプの手術給付が充実した商品を選びましょう。',
                },
                {
                  number: '04',
                  title: '会社の団体保険・健康保険組合の付加給付を確認する',
                  detail: '大手IT企業・SIerでは健康保険組合が付加給付（月25,000円超の自己負担を還付）を提供しているケースがあります。付加給付がある場合は民間医療保険の必要性が下がります。まず会社の健康保険組合の給付内容を確認してください。',
                },
                {
                  number: '05',
                  title: '就業不能保険との組み合わせで総合的に設計する',
                  detail: '医療保険（入院・手術費用）と就業不能保険（収入補填）は役割が異なります。エンジニアは両方のリスクが高いため、2つを組み合わせた総合的な保障設計が重要です。合計保険料が月収の3〜5%以内に収まるよう設計してください。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：精神疾患特約なしで長期入院の給付ゼロ',
                  situation: '30代男性・SIer勤務エンジニア。',
                  problem: 'うつ病で精神科に5ヶ月入院。加入していた医療保険は精神疾患特約なしのため入院給付がゼロ。傷病手当金はあったが入院中の医療費・差額ベッド代が全額自己負担。貯蓄が大幅に減少した。',
                  lesson: 'IT業種は精神疾患リスクが高い。精神疾患特約付き・入院給付日数1,000日以上の医療保険が必須。',
                },
                {
                  title: '失敗②：腱鞘炎手術が給付対象外だった',
                  situation: '28歳男性・ゲーム会社エンジニア。',
                  problem: '手首の腱鞘炎が重症化して腱鞘切開術が必要に。加入していた医療保険の手術給付金は「開腹・開胸・開頭手術のみ対象」の古いタイプで、腱鞘切開術は対象外だった。手術費用・入院費が全額自己負担になった。',
                  lesson: '内視鏡・レーザー・整形外科手術も対象になる新しいタイプの手術給付を選ぶこと。',
                },
                {
                  title: '失敗③：会社の付加給付を知らず過剰な保険に加入',
                  situation: '35歳女性・大手IT企業エンジニア。',
                  problem: '会社の健康保険組合に付加給付（月25,000円上限）があることを知らずに月額4,500円の医療保険に加入。実際に必要だったのは先進医療特約のみで、5年間で27万円の保険料を過払いしていた。',
                  lesson: '会社の健康保険組合の付加給付を先に確認すること。IT大手に多い付加給付があれば民間保険は最小限でよい。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-blue-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">医療保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '会社の健康保険組合の付加給付有無を確認した',
                '高額療養費制度の自己負担上限額を把握した',
                '精神疾患特約付き・入院給付日数1,000日以上の商品を選んだ',
                '腱鞘炎・眼科手術（内視鏡・レーザー含む）が給付対象かを確認した',
                '先進医療特約（月100〜200円）を付帯した',
                '就業不能保険との組み合わせで合計保険料を月収の3〜5%以内に設計した',
                'フリーランス転向を想定した保障継続を考慮した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* 看護師×がん保険 専用コンテンツ */}
      {isNurseCancer && (
        <div className="max-w-4xl mx-auto px-4 space-y-14 py-12">

          {/* セクション1：リード文 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">看護師にがん保険が必要な理由</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              看護師はがん患者のケアを日常的に行う職業ですが、
              自身もがんリスクが高い職種です。
              国立がん研究センター「多目的コホート研究（2021年）」によると、
              夜勤従事者の乳がん発症リスクは日勤のみの女性と比較して約1.3倍。
              看護師は女性が多く夜勤が多い職種であるため、
              乳がんリスクへの備えが特に重要です。
              また針刺し事故による肝炎ウイルス感染から
              肝がんへ進行するリスクも看護師特有の脅威です。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              日本人の2人に1人ががんに罹患する時代において、
              看護師は職業的なリスクも加わり、
              がん保険の必要性が一般職種より高いといえます。
              治療の長期化・先進医療の活用・
              就業制限期間の収入補填など、
              看護師のライフスタイルに合ったがん保険選びが重要です。
            </p>
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 my-4 rounded-r-xl">
              <p className="font-bold text-rose-800">
                💡 看護師のがん保険で特に重要なポイント
              </p>
              <p className="text-rose-700 text-sm mt-1">
                看護師はがんの医療知識が豊富なため、
                「がんになったら最新の治療を受けたい」という
                意識が高い傾向があります。
                先進医療特約・治療給付金（抗がん剤・放射線）など、
                治療の選択肢を広げる保障が充実した
                がん保険を選ぶことが重要です。
              </p>
              <p className="text-xs text-rose-600 mt-2">
                出典：<a href="https://epi.ncc.go.jp/jphc/" target="_blank" rel="noopener noreferrer" className="underline">国立がん研究センター「多目的コホート研究」2021年</a>
              </p>
            </div>
          </section>

          {/* セクション2：公的保障の限界 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-4">看護師のがんリスクと公的保障でカバーされない費用</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1b2631]">
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">費用の種類</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">公的保障（健康保険・高額療養費）</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-white font-bold">民間がん保険で補う部分</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['手術費用', '高額療養費制度で自己負担に上限', 'がん診断一時金・手術給付金で補完'],
                    ['抗がん剤治療費', '高額療養費制度適用（月57,600円等）', '抗がん剤治療給付金で月々の負担を補完'],
                    ['放射線治療費', '高額療養費制度適用', '放射線治療給付金で補完'],
                    ['先進医療費用', '❌ 全額自己負担（数十〜数百万円）', '✅ 先進医療特約（最大2,000万円）'],
                    ['差額ベッド代', '❌ 全額自己負担', '✅ 入院日額・一時金で補完'],
                    ['通院治療費（外来化学療法）', '高額療養費適用だが月複数回で累積', '✅ 通院給付金で補完'],
                    ['就業制限中の収入損失', '傷病手当金（最長18ヶ月）', 'がん診断一時金・就業不能保険で補完'],
                  ].map(([type, pub, priv], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{type}</td>
                      <td className="px-4 py-3 text-gray-600">{pub}</td>
                      <td className="px-4 py-3 text-gray-700">{priv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              出典：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「高額療養費制度について」</a>
              <a href="https://www.mhlw.go.jp/topics/bukyoku/isei/sensiniryo/index.html" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「先進医療の概要について」</a>
            </p>
          </section>

          {/* セクション3：看護師特有のがんリスク */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">看護師が特に注意すべきがんリスクの実態</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">① 夜勤による乳がんリスク：1.3倍</h3>
                <p className="text-gray-700 leading-relaxed">
                  国立がん研究センター「多目的コホート研究（2021年）」によると、
                  夜勤従事者の乳がん発症リスクは日勤のみの女性と比較して約1.3倍。
                  メラトニン分泌の抑制・概日リズムの乱れが
                  乳がんリスクを高めると考えられています。
                  看護師は女性の割合が高く夜勤頻度も多いため、
                  乳がんへの備えが特に重要です。
                  乳がんの5年生存率は約92%（早期発見の場合）と高く、
                  治療費への備えが重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">② 針刺し事故→肝炎→肝がんリスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  C型肝炎ウイルスへの職業的感染から
                  慢性肝炎・肝硬変・肝がんへ進行するリスクがあります。
                  C型肝炎からの肝がん発症率は年間約3〜7%。
                  早期発見・治療が重要ですが、
                  治療費（インターフェロン治療・肝がん手術等）は
                  高額になるケースがあります。
                  がん保険でこのリスクをカバーすることが重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">③ ストレス・過労による免疫低下</h3>
                <p className="text-gray-700 leading-relaxed">
                  長時間労働・夜勤・精神的ストレスによる免疫機能の低下が
                  がんリスクを間接的に高める可能性があります。
                  看護師の平均睡眠時間は全職業平均より短く、
                  慢性的な睡眠不足が免疫機能に影響します。
                  日頃からの定期的ながん検診と
                  がん保険による備えの両立が重要です。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">④ 治療中の就業制限リスク</h3>
                <p className="text-gray-700 leading-relaxed">
                  看護師ががんと診断された場合、
                  治療期間中に「感染管理上の理由」から
                  患者への直接ケアを制限されるケースがあります。
                  特に化学療法中は免疫抑制状態となり、
                  通常業務への復帰が遅れることがあります。
                  傷病手当金（最長18ヶ月）に加えて
                  がん診断一時金で収入の減少を補填することが重要です。
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              出典：<a href="https://epi.ncc.go.jp/jphc/" target="_blank" rel="noopener noreferrer" className="underline">国立がん研究センター「多目的コホート研究」2021年</a>
              <a href="https://ganjoho.jp/reg_stat/statistics/stat/summary.html" target="_blank" rel="noopener noreferrer" className="underline">国立がん研究センター「がん統計」2023年</a>
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/naika/" target="_blank" rel="noopener noreferrer" className="underline">厚生労働省「医療機関における院内感染対策」2022年</a>
            </p>
          </section>

          {/* セクション4：選び方5つのポイント */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">看護師のがん保険選び5つのポイント</h2>
            <div className="space-y-5">
              {[
                {
                  number: '01',
                  title: '診断一時金は100万円以上を確保する',
                  detail: 'がんと診断された時点で受け取れる診断一時金は、治療開始前の準備資金・収入減少の補填として重要です。看護師のがん治療中の就業制限を考慮すると、月収の3〜6ヶ月分（150〜300万円程度）が理想的ですが、まず100万円以上を確保してください。',
                },
                {
                  number: '02',
                  title: '先進医療特約は必ず付帯する',
                  detail: '医療知識のある看護師は先進医療の選択肢を積極的に検討するケースが多いです。陽子線治療・重粒子線治療・免疫療法などの先進医療は数十〜数百万円の費用がかかります。月100〜200円の先進医療特約で最大2,000万円の保障が得られるため必須です。',
                },
                {
                  number: '03',
                  title: '通院給付金の有無を確認する',
                  detail: '近年のがん治療は入院よりも外来（通院）での抗がん剤・放射線治療が主流になっています。入院給付金のみのがん保険では、外来治療の費用をカバーできません。通院給付金（1日5,000〜10,000円）が付帯されているかを確認してください。',
                },
                {
                  number: '04',
                  title: '乳がん・子宮がんの診断一時金が上乗せされる商品を検討する',
                  detail: '女性看護師は乳がん・子宮頸がん・卵巣がんリスクが高いです。女性特有のがんに対して診断一時金が上乗せされる「女性疾病特約」付きのがん保険を検討してください。夜勤による乳がんリスクが1.3倍の看護師には特に有効です。',
                },
                {
                  number: '05',
                  title: '就業不能保険との組み合わせを設計する',
                  detail: 'がん治療中の就業制限・長期休業に備えるため、がん保険の診断一時金に加えて就業不能保険（精神疾患特約付き）との組み合わせが重要です。傷病手当金（最長18ヶ月）終了後の長期収入補填も設計に含めてください。',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5">
                  <div className="flex-shrink-0 w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.number}
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{item.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション5：よくある失敗事例 */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">よくある失敗事例3選</h2>
            <div className="space-y-6">
              {[
                {
                  title: '失敗①：入院給付金のみで外来治療をカバーできなかった',
                  situation: '42歳女性・病棟看護師。夜勤あり。',
                  problem: '乳がんと診断され、手術後に外来で抗がん剤治療を6ヶ月継続。加入していたがん保険は入院給付金のみで通院給付金なし。毎月の外来治療費（高額療養費適用後）と交通費・食事代が累積し、年間で50万円以上の自己負担が発生した。',
                  lesson: '近年のがん治療は外来中心。通院給付金付きのがん保険を選ぶこと。',
                },
                {
                  title: '失敗②：先進医療特約なしで治療の選択肢が狭まった',
                  situation: '38歳女性・外来看護師。',
                  problem: '子宮がんと診断され、重粒子線治療を希望したが費用約314万円が全額自己負担。先進医療特約をつけていなかったため、費用の問題で通常の放射線治療を選択せざるを得なかった。医療知識があるだけに最新治療を受けられなかったことへの後悔が大きかった。',
                  lesson: '月100〜200円の先進医療特約で治療の選択肢を広げておくこと。',
                },
                {
                  title: '失敗③：診断一時金が少なく治療準備が不十分',
                  situation: '45歳女性・ICU看護師。月収35万円。',
                  problem: '大腸がんと診断。診断一時金50万円では手術前の準備・入院準備・3ヶ月の就業制限中の収入補填に全く足りなかった。傷病手当金はあったが、月収の33%分の不足と医療費で貯蓄が大幅に減少した。',
                  lesson: '診断一時金は月収の3〜6ヶ月分（最低100万円以上）を確保すること。',
                },
              ].map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-rose-700 px-5 py-3">
                    <p className="font-bold text-white text-sm">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">【状況】{c.situation}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">問題</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-bold text-amber-800 mb-1">📌 教訓</p>
                      <p className="text-sm text-amber-700">{c.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* セクション6：最終チェックリスト */}
          <section>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">がん保険加入前の最終チェックリスト</h2>
            <div className="space-y-3">
              {[
                '夜勤による乳がんリスク（1.3倍）を認識し、女性疾病特約を検討した',
                '針刺し事故→肝炎→肝がんリスクへの備えを確認した',
                '診断一時金100万円以上を確保した',
                '通院給付金付きのがん保険を選んだ',
                '先進医療特約（月100〜200円）を付帯した',
                '女性特有がん（乳がん・子宮がん）の上乗せ特約を検討した',
                '就業不能保険との組み合わせで長期収入補填を設計した',
                '複数の保険会社で見積もりを比較した',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* チェックリスト + CTA */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <InsuranceChecklist />
          <AffiliateCTA primary={affiliateCta.primary} secondary={affiliateCta.secondary} />
        </div>
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

    </>
  )
}
