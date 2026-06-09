'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Occupation } from '@/lib/data'

type AgeBand = '20代' | '30代' | '40代' | '50代'
type Gender = 'male' | 'female'
type Family = 'single' | 'married' | 'with-child'
type IncomeBand = 'lt300' | '300-500' | '500-800' | 'gt800'

type Answers = {
  occupation: Occupation | null
  ageBand: AgeBand
  gender: Gender
  family: Family
  incomeBand: IncomeBand
}

type RecommendedInsurance = {
  slug: string
  name: string
  icon: string
  reason: string
  monthlyEst: number
  occupationSlug: string
}

const STEP_LABELS = ['あなたについて', '家族・収入', '診断結果']

const AGE_BAND_OPTIONS: { value: AgeBand; icon: string; desc: string }[] = [
  { value: '20代', icon: '🌱', desc: '20〜29歳' },
  { value: '30代', icon: '📈', desc: '30〜39歳' },
  { value: '40代', icon: '⚕️', desc: '40〜49歳' },
  { value: '50代', icon: '🏦', desc: '50〜59歳' },
]

const AGE_MAP: Record<AgeBand, number> = {
  '20代': 25, '30代': 35, '40代': 45, '50代': 55,
}

const FAMILY_OPTIONS: { value: Family; label: string; icon: string; desc: string }[] = [
  { value: 'single',     label: '独身',      icon: '🧑',  desc: '一人暮らし・実家暮らし' },
  { value: 'married',    label: '既婚・子なし', icon: '👫',  desc: 'パートナーあり・子供なし' },
  { value: 'with-child', label: '既婚・子あり', icon: '👨‍👩‍👦', desc: '配偶者＋子供あり' },
]

const FAMILY_LABELS: Record<Family, string> = {
  'single': '独身', 'married': '既婚・子なし', 'with-child': '既婚・子あり',
}

const INCOME_OPTIONS: { value: IncomeBand; label: string; desc: string }[] = [
  { value: 'lt300',    label: '〜300万',    desc: '年収300万円未満' },
  { value: '300-500',  label: '300〜500万', desc: '年収300〜500万円' },
  { value: '500-800',  label: '500〜800万', desc: '年収500〜800万円' },
  { value: 'gt800',    label: '800万〜',    desc: '年収800万円以上' },
]

const INCOME_MAP: Record<IncomeBand, number> = {
  'lt300': 250, '300-500': 400, '500-800': 650, 'gt800': 1000,
}

const INCOME_LABELS: Record<IncomeBand, string> = {
  'lt300': '〜300万', '300-500': '300〜500万', '500-800': '500〜800万', 'gt800': '800万〜',
}

const RANK_STYLES = [
  { badge: '🥇 第1位', border: 'border-[#f59e0b]', shadow: 'shadow-lg', badgeBg: 'bg-[#f59e0b]', label: '最優先' },
  { badge: '🥈 第2位', border: 'border-[#2563eb]',  shadow: 'shadow-md', badgeBg: 'bg-[#2563eb]',  label: 'おすすめ' },
  { badge: '🥉 第3位', border: 'border-gray-300',   shadow: '',          badgeBg: 'bg-gray-400',    label: '検討を' },
]

const FREELANCE_SLUGS = ['freelance-engineer', 'designer', 'food-service', 'beautician']

function calcMonthlyPremium(annualIncome: number, rate: number): number {
  return Math.round(annualIncome * 10000 * rate / 12)
}

function getRecommendations(answers: Answers): RecommendedInsurance[] {
  const occ = answers.occupation
  if (!occ) return []

  const income = INCOME_MAP[answers.incomeBand]
  const age = AGE_MAP[answers.ageBand]
  const isFreelance = FREELANCE_SLUGS.includes(occ.slug)
  const hasChild = answers.family === 'with-child'
  const isMarried = answers.family !== 'single'
  const isOver40 = age >= 40

  const all: (RecommendedInsurance & { score: number })[] = [
    {
      slug: 'medical',
      name: '医療保険',
      icon: '🏥',
      reason: '入院・手術の自己負担をカバー。すべての方に必要な基本保険です。',
      monthlyEst: calcMonthlyPremium(income, 0.005),
      occupationSlug: occ.slug,
      score: 100,
    },
    {
      slug: 'income-protection',
      name: '就業不能・収入保障保険',
      icon: '💼',
      reason: isFreelance
        ? '傷病手当金がないフリーランスには最重要。病気・怪我で働けなくなると収入がゼロになります。'
        : '病気や精神疾患で長期休職した際の収入減少リスクに備えます。',
      monthlyEst: calcMonthlyPremium(income, 0.008),
      occupationSlug: occ.slug,
      score: isFreelance ? 95 : 60,
    },
    {
      slug: 'life',
      name: '生命保険・死亡保険',
      icon: '🛡️',
      reason: isMarried
        ? '家族の生活費・教育費を守るための死亡保障。扶養家族がいる方には必須です。'
        : '将来の家族のために早めに加入しておくと保険料が安く済みます。',
      monthlyEst: calcMonthlyPremium(income, 0.01),
      occupationSlug: occ.slug,
      score: hasChild ? 90 : isMarried ? 75 : 30,
    },
    {
      slug: 'cancer',
      name: 'がん保険',
      icon: '🎗️',
      reason: isOver40
        ? '40代以降はがんリスクが急増。高額な治療費に備えるがん保険は特に重要です。'
        : '年々若年化するがんリスク。早期加入で保険料を抑えられます。',
      monthlyEst: calcMonthlyPremium(income, 0.004),
      occupationSlug: occ.slug,
      score: isOver40 ? 80 : 50,
    },
    {
      slug: 'child',
      name: '学資保険・子供保険',
      icon: '👶',
      reason: '子供の教育資金を計画的に積み立て。親が万が一の時も保険料免除で満期金を確保できます。',
      monthlyEst: calcMonthlyPremium(income, 0.015),
      occupationSlug: occ.slug,
      score: hasChild ? 85 : 0,
    },
    {
      slug: 'pension',
      name: '個人年金保険',
      icon: '🏦',
      reason: age <= 40
        ? '老後資金の積み立ては早いほど有利。税制優遇も活用できます。'
        : '老後まで時間が少ないため、早めの積み立て開始が重要です。',
      monthlyEst: calcMonthlyPremium(income, 0.02),
      occupationSlug: occ.slug,
      score: age <= 45 ? 65 : 45,
    },
  ]

  return all
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score: _score, ...rest }) => rest)
}

function buildShareText(answers: Answers, recs: RecommendedInsurance[]): string {
  const occ = answers.occupation?.name_ja ?? ''
  const top = recs[0]
  if (!top) return encodeURIComponent('保険データドットコムで保険料を無料診断しました。')
  return encodeURIComponent(
    `${occ}（${answers.ageBand}・年収${INCOME_LABELS[answers.incomeBand]}）の${top.name}推定月額は約${top.monthlyEst.toLocaleString()}円でした。\nあなたも調べてみて👇\nhttps://hoken-data.com/simulator\n#保険料診断 #保険データドットコム`
  )
}

export default function SimulatorClient({ occupations }: { occupations: Occupation[] }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({
    occupation: null,
    ageBand: '30代',
    gender: 'male',
    family: 'single',
    incomeBand: '300-500',
  })
  const [showResult, setShowResult] = useState(false)
  const [occSearch, setOccSearch] = useState('')

  const filteredOcc = occSearch
    ? occupations.filter(o => o.name_ja.includes(occSearch) || o.slug.includes(occSearch))
    : occupations

  const goNext = () => {
    if (step < 3) setStep(s => s + 1)
    if (step === 2) setShowResult(true)
  }
  const goBack = () => {
    if (step > 1) setStep(s => s - 1)
    if (step === 3) setShowResult(false)
  }
  const reset = () => {
    setStep(1)
    setShowResult(false)
    setAnswers({ occupation: null, ageBand: '30代', gender: 'male', family: 'single', incomeBand: '300-500' })
    setOccSearch('')
  }

  const canNext = (step === 1 && answers.occupation !== null) || step === 2

  const recommendations = showResult ? getRecommendations(answers) : []

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ヘッダー */}
      <section className="bg-[#0f172a] text-white py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <span>保険料診断</span>
          </div>
          <div className="text-center">
            <div className="inline-block bg-[#f59e0b] text-[#0f172a] text-xs font-bold px-3 py-1 rounded-full mb-3">
              PR・完全無料
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">保険料 無料診断</h1>
            <p className="text-gray-300 text-sm">職業・年齢・家族構成から最適な保険を診断します</p>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ステップインジケーター */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEP_LABELS.map((label, i) => {
              const num = i + 1
              const isDone    = num < step
              const isCurrent = num === step
              return (
                <div key={label} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isDone    ? 'bg-[#10b981] text-white' :
                    isCurrent ? 'bg-[#2563eb] text-white scale-110 shadow-md' :
                                'bg-gray-200 text-gray-400'
                  }`}>
                    {isDone ? '✓' : num}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${
                    isDone    ? 'text-[#10b981]' :
                    isCurrent ? 'text-[#2563eb]' :
                                'text-gray-400'
                  }`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
          {/* プログレスバー */}
          <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2563eb] to-[#10b981] rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: あなたについて（職業 + 年齢帯 + 性別） */}
        {step === 1 && (
          <div className="space-y-8">
            {/* 職業 */}
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] mb-1">あなたの職業は？</h2>
              <p className="text-sm text-gray-500 mb-4">最も近い職業を選んでください</p>
              <div className="relative mb-3">
                <label htmlFor="occ-search" className="sr-only">職業名で検索</label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  id="occ-search"
                  type="text"
                  placeholder="職業名で検索（例：エンジニア、看護師）"
                  value={occSearch}
                  onChange={e => setOccSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {filteredOcc.map(occ => (
                  <button
                    key={occ.id}
                    onClick={() => setAnswers(a => ({ ...a, occupation: occ }))}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      answers.occupation?.id === occ.id
                        ? 'border-[#2563eb] bg-blue-50 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-[#2563eb] hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#0f172a] text-sm">{occ.name_ja}</p>
                      {answers.occupation?.id === occ.id && (
                        <span className="text-[#2563eb] text-xs font-bold">✓</span>
                      )}
                    </div>
                    {occ.avg_income_man && (
                      <p className="text-xs text-gray-400 mt-0.5">年収 {occ.avg_income_man}万円〜</p>
                    )}
                  </button>
                ))}
                {filteredOcc.length === 0 && (
                  <p className="col-span-2 text-center text-gray-400 text-sm py-6">該当する職業が見つかりませんでした</p>
                )}
              </div>
            </div>

            {/* 年齢帯 */}
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] mb-1">年齢帯は？</h2>
              <p className="text-sm text-gray-500 mb-4">最も近い年代を選んでください</p>
              <div className="grid grid-cols-4 gap-2">
                {AGE_BAND_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers(a => ({ ...a, ageBand: opt.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      answers.ageBand === opt.value
                        ? 'border-[#2563eb] bg-blue-50 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-[#2563eb]'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{opt.icon}</span>
                    <span className="font-bold text-[#0f172a] text-sm block">{opt.value}</span>
                    <span className="text-xs text-gray-400">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 性別 */}
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] mb-1">性別は？</h2>
              <p className="text-sm text-gray-500 mb-4">保険料の計算に使用します</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'male', label: '男性', icon: '👨', sub: '男性平均を適用' },
                  { value: 'female', label: '女性', icon: '👩', sub: '女性平均を適用' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers(a => ({ ...a, gender: opt.value }))}
                    className={`p-5 rounded-2xl border-2 text-center transition-all ${
                      answers.gender === opt.value
                        ? 'border-[#2563eb] bg-blue-50 shadow-md'
                        : 'border-gray-100 bg-white hover:border-[#2563eb]'
                    }`}
                  >
                    <span className="text-4xl block mb-2">{opt.icon}</span>
                    <span className="text-base font-bold text-[#0f172a] block">{opt.label}</span>
                    <span className="text-xs text-gray-400 mt-1 block">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: 家族・収入 */}
        {step === 2 && (
          <div className="space-y-8">
            {/* 家族構成 */}
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] mb-1">家族構成は？</h2>
              <p className="text-sm text-gray-500 mb-4">推奨保険の優先度に影響します</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FAMILY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers(a => ({ ...a, family: opt.value }))}
                    className={`p-5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                      answers.family === opt.value
                        ? 'border-[#2563eb] bg-blue-50 shadow-md'
                        : 'border-gray-100 bg-white hover:border-[#2563eb]'
                    }`}
                  >
                    <span className="text-3xl flex-shrink-0">{opt.icon}</span>
                    <div>
                      <span className="font-bold text-[#0f172a] text-sm block">{opt.label}</span>
                      <span className="text-xs text-gray-400">{opt.desc}</span>
                    </div>
                    {answers.family === opt.value && (
                      <span className="ml-auto text-[#2563eb] font-bold text-sm">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 年収帯 */}
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] mb-1">年収帯は？</h2>
              <p className="text-sm text-gray-500 mb-4">保険料の目安計算に使用します</p>
              <div className="grid grid-cols-2 gap-3">
                {INCOME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers(a => ({ ...a, incomeBand: opt.value }))}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      answers.incomeBand === opt.value
                        ? 'border-[#2563eb] bg-blue-50 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-[#2563eb]'
                    }`}
                  >
                    <span className="font-bold text-[#0f172a] text-base block">{opt.label}</span>
                    <span className="text-xs text-gray-400 mt-1 block">{opt.desc}</span>
                    {answers.incomeBand === opt.value && (
                      <span className="text-[#2563eb] text-xs font-bold mt-1 block">✓ 選択中</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: 診断結果 */}
        {step === 3 && showResult && (
          <div>
            {/* プロフィールサマリーバー */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-sm text-[#0f172a] font-semibold flex flex-wrap gap-2 items-center">
              <span className="text-[#2563eb]">📋</span>
              <span>{answers.occupation?.name_ja}</span>
              <span className="text-gray-400">·</span>
              <span>{answers.ageBand}</span>
              <span className="text-gray-400">·</span>
              <span>{answers.gender === 'male' ? '男性' : '女性'}</span>
              <span className="text-gray-400">·</span>
              <span>{FAMILY_LABELS[answers.family]}</span>
              <span className="text-gray-400">·</span>
              <span>年収{INCOME_LABELS[answers.incomeBand]}</span>
            </div>

            {/* 結果ヘッダー */}
            <div className="text-center mb-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="inline-block bg-[#10b981] text-white text-sm font-bold px-4 py-1.5 rounded-full mb-3">
                ✓ 診断完了
              </div>
              <h2 className="text-lg font-bold text-[#0f172a] mb-1">
                推奨保険 TOP{recommendations.length}
              </h2>
              <p className="text-sm text-gray-500 mb-4">{answers.occupation?.name_ja}に最適な保険の組み合わせ</p>
              {/* シェアボタン */}
              <a
                href={`https://twitter.com/intent/tweet?text=${buildShareText(answers, recommendations)}&url=${encodeURIComponent('https://hoken-data.com/simulator')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                この診断結果をポストする
              </a>
            </div>

            {/* 推奨保険TOP3 */}
            <div className="space-y-4 mb-6">
              {recommendations.map((rec, i) => {
                const rank = RANK_STYLES[i]
                return (
                  <div
                    key={rec.slug}
                    className={`bg-white rounded-2xl border-2 p-5 ${rank.border} ${rank.shadow}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base font-bold">{rank.badge}</span>
                      <span className={`text-xs text-white px-2 py-0.5 rounded-full font-semibold ${rank.badgeBg}`}>
                        {rank.label}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{rec.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#0f172a] text-lg mb-1">{rec.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{rec.reason}</p>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">推定月額（参考値）</p>
                            <p className="text-2xl font-bold text-[#0f172a]">
                              {rec.monthlyEst.toLocaleString()}
                              <span className="text-sm font-normal text-gray-500 ml-1">円/月</span>
                            </p>
                          </div>
                          <Link
                            href={`/occupation/${rec.occupationSlug}/${rec.slug}`}
                            className="text-sm text-[#2563eb] font-semibold hover:underline whitespace-nowrap"
                          >
                            詳しく調べる →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 次のステップ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <h3 className="font-bold text-[#0f172a] text-sm mb-4">次のステップ</h3>
              <div className="space-y-3">
                {recommendations[0] && (
                  <Link
                    href={`/occupation/${recommendations[0].occupationSlug}/${recommendations[0].slug}`}
                    className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 hover:bg-blue-100 transition-colors"
                  >
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">1位の詳しいデータを見る</p>
                      <p className="font-semibold text-[#0f172a] text-sm">{recommendations[0].name}の相場データ</p>
                    </div>
                    <span className="text-[#2563eb] text-lg">→</span>
                  </Link>
                )}
                <Link
                  href="/insurance"
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">別の保険種類も調べる</p>
                    <p className="font-semibold text-[#0f172a] text-sm">全保険種類一覧を見る</p>
                  </div>
                  <span className="text-[#2563eb] text-lg">→</span>
                </Link>
              </div>
            </div>

            {/* もう一度診断する */}
            <button
              onClick={reset}
              aria-label="もう一度保険料診断をする"
              className="w-full py-4 mb-4 bg-white border-2 border-[#2563eb] text-[#2563eb] rounded-xl font-bold text-base hover:bg-blue-50 transition-colors"
            >
              🔄 もう一度診断する
            </button>

            {/* CTA */}
            <div className="bg-[#0f172a] text-white rounded-2xl p-6 text-center mb-4">
              <p className="text-[#f59e0b] text-xs font-bold mb-2">PR・無料・強引な勧誘なし</p>
              <h3 className="text-lg font-bold mb-2">この結果をもとに無料相談する</h3>
              <p className="text-gray-400 text-xs mb-5">
                FP（ファイナンシャルプランナー）が、{answers.occupation?.name_ja}に最適な保険を無料で提案します
              </p>
              <Link
                href="/consult"
                className="block bg-[#2563eb] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors mb-2"
                aria-label="無料で保険相談を申し込む"
              >
                この結果をもとに無料相談する →
              </Link>
              <p className="text-gray-600 text-xs">※本サイトはアフィリエイト広告を含みます</p>
            </div>

            {/* 回答修正 */}
            <button
              onClick={goBack}
              aria-label="回答を修正して診断し直す"
              className="w-full py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              ← 回答を修正する
            </button>

            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              ※本診断結果は公的統計データをもとにした推計参考値です。実際の保険料は保険会社・健康状態・契約内容により大きく異なります。
            </p>
          </div>
        )}

        {/* ナビゲーションボタン */}
        {step < 3 && (
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={goBack}
                className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← 戻る
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!canNext}
              className={`flex-1 py-4 rounded-xl font-bold text-white text-base transition-colors ${
                canNext
                  ? 'bg-[#2563eb] hover:bg-blue-700 shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === 2 ? '✨ 診断する' : '次へ →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
