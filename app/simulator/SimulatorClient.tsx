'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Occupation } from '@/lib/data'

type Family = 'single' | 'married' | 'married-1child' | 'married-2children'
type Gender = 'male' | 'female'

type Answers = {
  occupation: Occupation | null
  age: number
  gender: Gender
  family: Family
}

type RecommendedInsurance = {
  slug: string
  name: string
  icon: string
  reason: string
  monthlyEst: number
  occupationSlug: string
}

const STEP_LABELS = ['職業', '年齢', '性別', '家族構成', '診断結果']

const FAMILY_OPTIONS: { value: Family; label: string; icon: string }[] = [
  { value: 'single', label: '独身', icon: '🧑' },
  { value: 'married', label: '既婚（子供なし）', icon: '👫' },
  { value: 'married-1child', label: '既婚（子供1人）', icon: '👨‍👩‍👦' },
  { value: 'married-2children', label: '既婚（子供2人以上）', icon: '👨‍👩‍👧‍👦' },
]

const FREELANCE_SLUGS = ['freelance-engineer', 'designer', 'restaurant', 'hairdresser']

function calcMonthlyPremium(annualIncome: number, rate: number): number {
  return Math.round(annualIncome * 10000 * rate / 12)
}

function getRecommendations(answers: Answers): RecommendedInsurance[] {
  const occ = answers.occupation
  if (!occ) return []

  const income = answers.gender === 'male'
    ? (occ.avg_income_man || 400)
    : (occ.avg_income_woman || 350)

  const isFreelance = FREELANCE_SLUGS.includes(occ.slug)
  const hasChild = answers.family === 'married-1child' || answers.family === 'married-2children'
  const isMarried = answers.family !== 'single'
  const isOver40 = answers.age >= 40

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
      reason: answers.age <= 40
        ? '老後資金の積み立ては早いほど有利。税制優遇も活用できます。'
        : '老後まで時間が少ないため、早めの積み立て開始が重要です。',
      monthlyEst: calcMonthlyPremium(income, 0.02),
      occupationSlug: occ.slug,
      score: answers.age <= 45 ? 65 : 45,
    },
  ]

  return all
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score: _score, ...rest }) => rest)
}

export default function SimulatorClient({ occupations }: { occupations: Occupation[] }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({
    occupation: null,
    age: 30,
    gender: 'male',
    family: 'single',
  })
  const [showResult, setShowResult] = useState(false)
  const [occSearch, setOccSearch] = useState('')

  const filteredOcc = occSearch
    ? occupations.filter(o => o.name_ja.includes(occSearch))
    : occupations

  const progress = (step / 5) * 100

  const goNext = () => {
    if (step < 5) setStep(s => s + 1)
    if (step === 4) setShowResult(true)
  }
  const goBack = () => {
    if (step > 1) setStep(s => s - 1)
    if (step === 5) setShowResult(false)
  }

  const canNext =
    (step === 1 && answers.occupation !== null) ||
    (step === 2 && answers.age >= 20 && answers.age <= 70) ||
    step === 3 ||
    step === 4

  const recommendations = showResult ? getRecommendations(answers) : []

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ヘッダー */}
      <section className="bg-[#0f172a] text-white py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block bg-[#f59e0b] text-[#0f172a] text-xs font-bold px-3 py-1 rounded-full mb-3">
            PR・完全無料
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">保険料 無料診断</h1>
          <p className="text-gray-300 text-sm">職業・年齢・家族構成から最適な保険を診断します</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`text-xs font-semibold ${i + 1 <= step ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                {label}
              </span>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">STEP {step} / 5</p>
        </div>

        {/* STEP 1: 職業選択 */}
        {step === 1 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">あなたの職業は？</h2>
            <p className="text-sm text-gray-500 mb-5">最も近い職業を選んでください</p>
            <input
              type="text"
              placeholder="職業名で絞り込む..."
              value={occSearch}
              onChange={e => setOccSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#2563eb]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredOcc.map(occ => (
                <button
                  key={occ.id}
                  onClick={() => setAnswers(a => ({ ...a, occupation: occ }))}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    answers.occupation?.id === occ.id
                      ? 'border-[#2563eb] bg-blue-50'
                      : 'border-gray-100 bg-white hover:border-[#2563eb] hover:bg-blue-50'
                  }`}
                >
                  <p className="font-semibold text-[#0f172a] text-sm">{occ.name_ja}</p>
                  {occ.avg_income_man && (
                    <p className="text-xs text-gray-500 mt-1">平均年収 {occ.avg_income_man}万円〜</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: 年齢 */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">年齢を入力してください</h2>
            <p className="text-sm text-gray-500 mb-8">20〜70歳の範囲で入力してください</p>
            <div className="text-center mb-8">
              <span className="text-7xl font-bold text-[#2563eb]">{answers.age}</span>
              <span className="text-2xl text-gray-500 ml-2">歳</span>
            </div>
            <input
              type="range"
              min={20}
              max={70}
              value={answers.age}
              onChange={e => setAnswers(a => ({ ...a, age: parseInt(e.target.value) }))}
              className="w-full accent-[#2563eb]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>20歳</span>
              <span>70歳</span>
            </div>
            <div className="flex gap-3 justify-center mt-6 flex-wrap">
              {[25, 30, 35, 40, 45, 50].map(age => (
                <button
                  key={age}
                  onClick={() => setAnswers(a => ({ ...a, age }))}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    answers.age === age
                      ? 'bg-[#2563eb] text-white border-[#2563eb]'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#2563eb]'
                  }`}
                >
                  {age}歳
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: 性別 */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">性別を選択してください</h2>
            <p className="text-sm text-gray-500 mb-8">保険料の計算に使用します</p>
            <div className="grid grid-cols-2 gap-4">
              {([
                { value: 'male', label: '男性', icon: '👨' },
                { value: 'female', label: '女性', icon: '👩' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAnswers(a => ({ ...a, gender: opt.value }))}
                  className={`p-8 rounded-2xl border-2 text-center transition-all ${
                    answers.gender === opt.value
                      ? 'border-[#2563eb] bg-blue-50'
                      : 'border-gray-100 bg-white hover:border-[#2563eb] hover:bg-blue-50'
                  }`}
                >
                  <span className="text-5xl block mb-3">{opt.icon}</span>
                  <span className="text-lg font-bold text-[#0f172a]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: 家族構成 */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">家族構成を選んでください</h2>
            <p className="text-sm text-gray-500 mb-6">推奨保険の優先度に影響します</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FAMILY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAnswers(a => ({ ...a, family: opt.value }))}
                  className={`p-6 rounded-2xl border-2 text-center transition-all ${
                    answers.family === opt.value
                      ? 'border-[#2563eb] bg-blue-50'
                      : 'border-gray-100 bg-white hover:border-[#2563eb] hover:bg-blue-50'
                  }`}
                >
                  <span className="text-4xl block mb-2">{opt.icon}</span>
                  <span className="font-bold text-[#0f172a] text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: 結果 */}
        {step === 5 && showResult && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-block bg-[#2563eb] text-white text-sm font-bold px-4 py-1.5 rounded-full mb-3">
                診断完了 🎉
              </div>
              <h2 className="text-xl font-bold text-[#0f172a] mb-1">
                {answers.occupation?.name_ja}・{answers.age}歳・{answers.gender === 'male' ? '男性' : '女性'}の診断結果
              </h2>
              <p className="text-sm text-gray-500">推奨保険 TOP{recommendations.length}</p>
            </div>

            <div className="space-y-4 mb-8">
              {recommendations.map((rec, i) => (
                <div
                  key={rec.slug}
                  className={`bg-white rounded-2xl border-2 p-5 ${
                    i === 0 ? 'border-[#f59e0b] shadow-md' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      i === 0 ? 'bg-[#f59e0b]' : i === 1 ? 'bg-[#2563eb]' : 'bg-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{rec.icon}</span>
                        <h3 className="font-bold text-[#0f172a]">{rec.name}</h3>
                        {i === 0 && <span className="text-xs bg-[#f59e0b] text-white px-2 py-0.5 rounded-full">最優先</span>}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{rec.reason}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400">推定月額（参考値）</p>
                          <p className="text-xl font-bold text-[#0f172a]">
                            {rec.monthlyEst.toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">円/月</span>
                          </p>
                        </div>
                        <Link
                          href={`/occupation/${rec.occupationSlug}/${rec.slug}`}
                          className="text-xs text-[#2563eb] font-semibold hover:underline whitespace-nowrap"
                        >
                          詳しく調べる →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-[#0f172a] text-white rounded-2xl p-6 text-center mb-6">
              <p className="text-[#f59e0b] text-xs font-bold mb-2">PR・無料・強引な勧誘なし</p>
              <h3 className="text-lg font-bold mb-2">診断結果をもとにプロに相談する</h3>
              <p className="text-gray-400 text-xs mb-5">
                FP（ファイナンシャルプランナー）が、{answers.occupation?.name_ja}に最適な保険を無料で提案します
              </p>
              <Link
                href="/consult"
                className="block bg-[#2563eb] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors mb-2"
              >
                無料で保険相談する →
              </Link>
              <p className="text-gray-600 text-xs">※本サイトはアフィリエイト広告を含みます</p>
            </div>

            <button
              onClick={() => { setStep(1); setShowResult(false); setAnswers({ occupation: null, age: 30, gender: 'male', family: 'single' }) }}
              className="w-full py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              もう一度診断する
            </button>

            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              ※本診断結果は公的統計データをもとにした推計参考値です。実際の保険料は保険会社・健康状態・契約内容により大きく異なります。
            </p>
          </div>
        )}

        {/* ナビゲーションボタン */}
        {step < 5 && (
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={goBack}
                className="flex-1 py-4 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← 戻る
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!canNext}
              className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors ${
                canNext
                  ? 'bg-[#2563eb] hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === 4 ? '診断する 🎉' : '次へ →'}
            </button>
          </div>
        )}

        {step === 5 && (
          <button onClick={goBack} className="w-full mt-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            ← 回答を修正する
          </button>
        )}
      </div>
    </div>
  )
}
