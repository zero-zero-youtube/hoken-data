import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Occupation = {
  id: number
  slug: string
  name_ja: string
  category: string
  avg_income_man: number | null
  avg_income_woman: number | null
  description: string | null
}

export type InsuranceType = {
  id: number
  slug: string
  name_ja: string
  category: string
  description: string | null
  target_age_min: number
  target_age_max: number
}

export async function getAllOccupations(): Promise<Occupation[]> {
  try {
    const { data } = await getSupabase()
      .from('hoken_occupations')
      .select('id, slug, name_ja, category, avg_income_man, avg_income_woman, description')
      .order('id')
    return data || []
  } catch { return [] }
}

export async function getOccupationBySlug(slug: string): Promise<Occupation | null> {
  try {
    const { data } = await getSupabase()
      .from('hoken_occupations')
      .select('id, slug, name_ja, category, avg_income_man, avg_income_woman, description')
      .eq('slug', slug)
      .single()
    return data
  } catch { return null }
}

export async function getAllInsuranceTypes(): Promise<InsuranceType[]> {
  try {
    const { data } = await getSupabase()
      .from('hoken_insurance_types')
      .select('id, slug, name_ja, category, description, target_age_min, target_age_max')
      .order('id')
    return data || []
  } catch { return [] }
}

export async function getInsuranceTypeBySlug(slug: string): Promise<InsuranceType | null> {
  try {
    const { data } = await getSupabase()
      .from('hoken_insurance_types')
      .select('id, slug, name_ja, category, description, target_age_min, target_age_max')
      .eq('slug', slug)
      .single()
    return data
  } catch { return null }
}

// 年収から月額保険料を推計（万円単位で受け取り、円で返す）
export function estimateMonthlyPremium(
  insuranceSlug: string,
  avgIncomeMan: number | null,
  avgIncomeWoman: number | null
): { man: number; woman: number; label: string } {
  const avgIncome = ((avgIncomeMan || 400) + (avgIncomeWoman || 350)) / 2
  const annualYen = avgIncome * 10000

  const rates: Record<string, number | [number, number]> = {
    'medical':           0.005,
    'life':              0.01,
    'income-protection': 0.008,
    'cancer':            0.004,
    'auto':              [3000, 8000],   // 固定レンジ
    'fire':              [1000, 3000],   // 固定レンジ
    'personal-accident': 0.003,
    'pension':           0.02,
    'child':             0.015,
    'whole-life':        0.015,
  }

  const rate = rates[insuranceSlug]

  if (Array.isArray(rate)) {
    return { man: rate[0], woman: rate[1], label: `${rate[0].toLocaleString()}〜${rate[1].toLocaleString()}円` }
  }

  const r = rate || 0.005
  const man   = Math.round((avgIncomeMan   || 400) * 10000 * r / 12)
  const woman = Math.round((avgIncomeWoman || 350) * 10000 * r / 12)
  return { man, woman, label: `${Math.round(annualYen * r / 12).toLocaleString()}円前後` }
}

export const CATEGORY_LABELS: Record<string, string> = {
  it:           'IT・エンジニア',
  medical:      '医療・介護',
  public:       '公務員・教育',
  office:       'オフィス系',
  transport:    '運輸・物流',
  construction: '建設・土木',
  food:         '飲食・調理',
  beauty:       '美容・理容',
  professional: '専門職',
  creative:     'クリエイティブ',
  manufacturing:'製造業',
  parttime:     'パート・アルバイト',
}

export const INSURANCE_CATEGORY_LABELS: Record<string, string> = {
  life:     '生命・医療系',
  'non-life': '損害保険系',
  saving:   '貯蓄・年金系',
}

// 職業ごとの保険ニーズ説明
export function getOccupationInsuranceNeeds(category: string): string {
  const needs: Record<string, string> = {
    it:           'フリーランス・在宅勤務が多いITエンジニアは就業不能リスクに注意。収入保障保険や医療保険の充実が重要です。',
    medical:      '医療従事者は感染リスクや体力的負担が大きく、医療保険・就業不能保険の備えが特に重要です。',
    public:       '公務員は雇用が安定しているため死亡保障は抑えめでOK。老後に向けた個人年金・終身保険の積立が効果的です。',
    office:       '会社員は団体保険でカバーできる部分も多いですが、退職後のカバーを個人で補完する必要があります。',
    transport:    '事故リスクが高い職業のため、自動車保険・傷害保険の充実が最優先です。',
    construction: '体を使う職業は怪我リスクが高く、傷害保険・就業不能保険が特に重要です。',
    food:         '食中毒・飲食業特有のリスクがある業種。個人賠償保険や医療保険の備えが重要です。',
    beauty:       '立ち仕事が多く腰痛・腱鞘炎のリスクも。就業不能保険と医療保険でリスクに備えましょう。',
    professional: '高収入が多い専門職は保険料も相応に必要。死亡保障・収入保障の見直しが定期的に必要です。',
    creative:     'フリーランスが多いクリエイター職は社会保険が不充分。就業不能保険と医療保険が特に重要です。',
    manufacturing:'工場勤務は怪我リスクが高いため傷害保険・労災の上乗せ保険が重要です。',
    parttime:     '社会保険未加入のケースが多いため、医療保険・傷害保険で最低限の備えを。',
  }
  return needs[category] || '自分のライフスタイルに合った保険を選ぶことが重要です。'
}

// 保険種類別の説明文
export function getInsuranceDescription(slug: string): string {
  const desc: Record<string, string> = {
    'medical':           '入院・手術・通院にかかる費用を補償。公的医療保険でカバーできない自己負担分を備える保険です。',
    'life':              '死亡時に遺族へ保険金が支払われる保険。家族を養っている方の死亡保障として必須です。',
    'income-protection': '病気・怪我で働けなくなった際に月々の収入を補償。就業不能状態でも生活を守ります。',
    'cancer':            'がんと診断された際の治療費・入院費を重点的にカバー。がんは高額治療になりがちです。',
    'auto':              '車の事故による損害賠償・修理費などを補償。任意保険は万が一の高額賠償に備えます。',
    'fire':              '火災・自然災害による建物・家財の損害を補償。地震保険とセットで検討しましょう。',
    'personal-accident': '日常生活の怪我・事故を補償。他人への賠償責任もカバーする個人賠償特約が人気です。',
    'pension':           '老後の生活資金を積み立てる保険。税制優遇を活用しながら年金を上乗せできます。',
    'child':             '子供の教育資金を積み立てる保険。親が亡くなっても保険料免除で満期金が受け取れます。',
    'whole-life':        '一生涯の死亡保障と解約返戻金を兼ね備えた保険。相続対策にも活用されます。',
  }
  return desc[slug] || '保険の詳細は各保険会社にご確認ください。'
}
