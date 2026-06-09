import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '保険の選び方ガイド',
  description: '保険の基礎知識から職業別・年齢別の選び方まで、保険料相場データと合わせてわかりやすく解説します。',
}

const INSURANCE_BASICS = [
  { slug: 'medical', name: '医療保険', desc: '入院・手術・通院の自己負担をカバー', icon: '🏥' },
  { slug: 'life', name: '生命保険・死亡保険', desc: '死亡時に遺族の生活を守る', icon: '🛡️' },
  { slug: 'income-protection', name: '収入保障・就業不能保険', desc: '働けなくなった時の収入を補償', icon: '💼' },
  { slug: 'cancer', name: 'がん保険', desc: 'がん治療の高額費用に備える', icon: '🎗️' },
  { slug: 'auto', name: '自動車保険', desc: '交通事故の損害賠償リスクをカバー', icon: '🚗' },
  { slug: 'fire', name: '火災保険・地震保険', desc: '住まいへの損害を補償', icon: '🏠' },
  { slug: 'pension', name: '個人年金保険', desc: '老後の生活資金を積み立てる', icon: '🏦' },
  { slug: 'whole-life', name: '終身保険', desc: '一生涯の死亡保障と資産形成', icon: '♾️' },
]

const OCCUPATION_GUIDES = [
  { slug: 'engineer', name: 'システムエンジニア・プログラマー', highlight: '収入保障が特に重要' },
  { slug: 'nurse', name: '看護師', highlight: '感染リスク・労災上乗せに注意' },
  { slug: 'civil-servant', name: '地方公務員', highlight: '個人年金・終身保険が効果的' },
  { slug: 'freelance-engineer', name: 'フリーランスエンジニア', highlight: '社会保険が薄いため手厚い備えを' },
  { slug: 'doctor', name: '医師', highlight: '高収入に見合った死亡保障を' },
  { slug: 'construction', name: '建設業・現場作業員', highlight: '傷害保険・就業不能保険が最優先' },
]

const AGE_GUIDES = [
  {
    age: '20代',
    title: '20代の保険選びのポイント',
    points: [
      '医療保険は若いうちに加入すると保険料が安い',
      '収入保障保険で万が一の働けないリスクに備える',
      '貯蓄型保険（個人年金・終身）は20代から始めると有利',
    ],
  },
  {
    age: '30代',
    title: '30代の保険選びのポイント',
    points: [
      '結婚・出産を機に生命保険（死亡保障）を見直す',
      '住宅購入時は火災保険・地震保険を忘れずに',
      '収入が上がった分、保障内容の見直しが必要',
    ],
  },
  {
    age: '40代',
    title: '40代の保険選びのポイント',
    points: [
      'がんリスクが高まる年代。がん保険の加入を検討',
      '子供の独立・住宅ローン完済で死亡保障を減額できる',
      '老後に向けた個人年金の積み立てを本格化',
    ],
  },
  {
    age: '50代',
    title: '50代の保険選びのポイント',
    points: [
      '退職後の医療保障の見直しが必要',
      '相続対策として終身保険の活用を検討',
      '不要な保険を解約して保険料を最適化',
    ],
  },
]

export default function GuidePage() {
  return (
    <>
      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <span>ガイド</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3">保険の選び方ガイド</h1>
          <p className="text-gray-300">保険の基礎知識から職業・年齢別の選び方まで解説</p>
        </div>
      </section>

      {/* 保険種類別基礎知識 */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">保険種類別の基礎知識</h2>
          <p className="text-gray-500 text-sm mb-8">各保険の仕組みと相場データを確認しましょう</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INSURANCE_BASICS.map(ins => (
              <Link
                key={ins.slug}
                href={`/insurance/${ins.slug}`}
                className="group bg-[#f8fafc] rounded-xl p-5 border border-gray-100 hover:border-[#2563eb] hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{ins.icon}</div>
                <h3 className="font-bold text-[#0f172a] text-sm mb-1">{ins.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{ins.desc}</p>
                <span className="text-[#2563eb] text-xs font-semibold group-hover:underline">相場を見る →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 職業別ガイド */}
      <section className="py-12 px-4 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">職業別の保険選びガイド</h2>
          <p className="text-gray-500 text-sm mb-8">職業によってリスクと必要な保障は変わります</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OCCUPATION_GUIDES.map(occ => (
              <Link
                key={occ.slug}
                href={`/occupation/${occ.slug}`}
                className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-[#2563eb] hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-[#0f172a] text-sm mb-2">{occ.name}</h3>
                <p className="text-xs text-[#f59e0b] font-semibold mb-3">👉 {occ.highlight}</p>
                <span className="text-[#2563eb] text-xs font-semibold group-hover:underline">保険料を調べる →</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/occupation" className="inline-block text-[#2563eb] text-sm font-semibold hover:underline">
              全20職業を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* 年齢別ガイド */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">年齢別の保険選びガイド</h2>
          <p className="text-gray-500 text-sm mb-8">ライフステージに合わせた保険の見直しポイント</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {AGE_GUIDES.map(guide => (
              <div key={guide.age} className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#2563eb] text-white text-sm font-bold px-3 py-1 rounded-full">{guide.age}</span>
                  <h3 className="font-bold text-[#0f172a] text-sm">{guide.title}</h3>
                </div>
                <ul className="space-y-2">
                  {guide.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#2563eb] font-bold flex-shrink-0 mt-0.5">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-[#0f172a] text-white text-center">
        <p className="text-[#f59e0b] text-sm font-semibold mb-2">PR・無料・強引な勧誘なし</p>
        <h2 className="text-xl font-bold mb-4">わからないことはプロに無料相談</h2>
        <Link href="/consult" className="inline-block bg-[#2563eb] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
          無料で保険相談する →
        </Link>
        <p className="text-gray-600 text-xs mt-4">※本サイトはアフィリエイト広告を含みます</p>
      </section>
    </>
  )
}
