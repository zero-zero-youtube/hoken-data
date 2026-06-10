import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateCTA from '@/components/AffiliateCTA'

export const metadata: Metadata = {
  title: '収入保障保険・就業不能保険の選び方【フリーランス必見】2023年版',
  description: '収入保障保険と就業不能保険の違い・選び方を解説。フリーランス・自営業に特に重要な理由と会社員との違い（傷病手当金）、職業別の保険料目安を紹介。',
}

const faqItems = [
  {
    q: '収入保障保険と就業不能保険の違いは何ですか？',
    a: '収入保障保険は主に死亡時に保険金が分割して支払われる保険で、就業不能保険は病気・怪我で働けなくなった際に毎月給付金が支払われる保険です。混同されやすいですが目的が異なります。フリーランスが特に必要なのは「就業不能保険（就業不能状態への備え）」です。',
  },
  {
    q: 'フリーランスが就業不能保険に入るべき理由は？',
    a: '会社員には病気・怪我で休職した際に「傷病手当金（給与の約2/3を最大18ヶ月）」があります。しかしフリーランス・自営業は国民健康保険に加入しており、傷病手当金がありません。働けなくなると即収入ゼロになるため、就業不能保険は特に重要です。',
  },
  {
    q: '保険料はどのくらいが目安ですか？',
    a: '就業不能保険の保険料は年齢・保障額・職業によって大きく異なりますが、30代男性で月額1万円の給付金を設定した場合、月額2,000〜4,000円程度が目安です。フリーランスは収入の変動があるため、給付金額は固定費をカバーできる水準で設定するのがおすすめです。',
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
    { '@type': 'ListItem', position: 2, name: 'ガイド', item: 'https://hoken-data.com/guide' },
    { '@type': 'ListItem', position: 3, name: '収入保障・就業不能保険の選び方', item: 'https://hoken-data.com/guide/income-protection' },
  ],
}

export default function IncomeProtectionGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <Link href="/guide" className="hover:text-white">ガイド</Link>
            <span>›</span>
            <span>収入保障・就業不能保険</span>
          </div>
          <div className="inline-block bg-white/10 text-xs px-3 py-1 rounded-full mb-3">💼 収入保障保険ガイド</div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            収入保障保険・就業不能保険の選び方<br />
            <span className="text-[#2563eb]">【フリーランス必見】</span>
          </h1>
          <p className="text-gray-300 text-sm">2023年最新版 – フリーランス・自営業・会社員別に解説</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-14">

        {/* 2つの保険の違い */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            収入保障保険と就業不能保険の違い
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-2">収入保障保険</h3>
              <p className="text-sm text-blue-700 leading-relaxed mb-3">
                主に<strong>死亡・高度障害</strong>時に保険金が毎月分割で支払われる保険。
                残された家族の生活費をカバーする目的。
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>✓ 死亡・高度障害が対象</li>
                <li>✓ 保険期間が進むと保険金総額が減少</li>
                <li>✓ 保険料が比較的安い</li>
              </ul>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <h3 className="font-bold text-indigo-800 mb-2">就業不能保険</h3>
              <p className="text-sm text-indigo-700 leading-relaxed mb-3">
                <strong>病気・怪我で働けなくなった</strong>際に毎月給付金が支払われる保険。
                フリーランスの収入途絶リスクをカバー。
              </p>
              <ul className="text-xs text-indigo-600 space-y-1">
                <li>✓ 就業不能状態が対象</li>
                <li>✓ 毎月定額の給付金</li>
                <li>✓ 精神疾患もカバーする商品あり</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-[#f8fafc] rounded-xl p-4 text-sm text-gray-700 border-l-4 border-[#f59e0b]">
            <strong>ポイント：</strong>フリーランスが特に必要なのは「就業不能保険」。死亡保障（収入保障保険）も重要ですが、働けなくなるリスクへの備えが優先されます。
          </div>
        </section>

        {/* 会社員との違い */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            フリーランスに特に重要な理由：傷病手当金がない
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="text-left p-3">項目</th>
                  <th className="text-center p-3">会社員（健康保険）</th>
                  <th className="text-center p-3">フリーランス（国民健康保険）</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { item: '傷病手当金', company: '✅ あり（給与の約2/3）', freelance: '❌ なし' },
                  { item: '支給期間', company: '最大18ヶ月', freelance: '－' },
                  { item: '休業補償', company: '労災保険あり', freelance: '特別加入が必要' },
                  { item: '収入途絶リスク', company: '低（手当金でカバー）', freelance: '高（即ゼロになる）' },
                  { item: '就業不能保険の必要性', company: '◯ 推奨', freelance: '◎ 必須レベル' },
                ].map((row, i) => (
                  <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                    <td className="p-3 font-medium">{row.item}</td>
                    <td className="p-3 text-center text-sm">{row.company}</td>
                    <td className="p-3 text-center text-sm font-semibold text-indigo-700">{row.freelance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 職業別保険料目安 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            職業別の就業不能保険料目安
          </h2>
          <p className="text-xs text-gray-500 mb-4">※月額給付金10万円・30代・一般的な健康状態を想定した参考値。実際の保険料は保険会社・条件により大きく異なります。</p>
          <div className="space-y-3">
            {[
              { slug: 'freelance-engineer', name: 'フリーランスエンジニア', monthly: '2,500〜4,500円', priority: '必須', color: 'text-red-600' },
              { slug: 'engineer', name: 'システムエンジニア（会社員）', monthly: '2,000〜3,500円', priority: '重要', color: 'text-orange-600' },
              { slug: 'nurse', name: '看護師', monthly: '2,500〜4,000円', priority: '重要', color: 'text-orange-600' },
              { slug: 'civil-servant', name: '地方公務員', monthly: '1,500〜2,500円', priority: '推奨', color: 'text-green-600' },
              { slug: 'construction', name: '建設業・現場作業員', monthly: '3,500〜6,000円', priority: '重要', color: 'text-orange-600' },
            ].map(item => (
              <div key={item.slug} className="flex items-center justify-between bg-[#f8fafc] rounded-xl px-5 py-4 border border-gray-100">
                <div>
                  <Link href={`/occupation/${item.slug}/income-protection`} className="font-semibold text-[#0f172a] hover:text-[#2563eb] text-sm">
                    {item.name}
                  </Link>
                  <p className={`text-xs font-semibold mt-0.5 ${item.color}`}>{item.priority}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0f172a]">{item.monthly}</p>
                  <p className="text-xs text-gray-500">/月（参考値）</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 就業不能保険 選ぶ際のチェックポイント */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            就業不能保険を選ぶ際のチェックポイント
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: '精神疾患が対象か確認', desc: 'うつ病・適応障害など精神疾患を免責にしている商品も多い。IT・医療職は特に要確認。' },
              { title: '待機期間（免責期間）の長さ', desc: '一般的に60〜90日の待機期間あり。その間は給付なし。緊急の貯蓄で対応できるか確認。' },
              { title: '給付金額の設定', desc: '月の固定費（家賃・食費・光熱費等）を最低カバーできる額を設定。一般的に月収の50〜60%が目安。' },
              { title: '保障期間（何歳まで）', desc: '60歳・65歳まで等の選択肢がある。定年まで保障が続く商品を選ぶのが基本。' },
            ].map((item, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl p-4 border border-gray-200">
                <p className="font-semibold text-[#0f172a] text-sm mb-1">✓ {item.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <AffiliateCTA primary="miraitecho" secondary="minnano" />

        {/* FAQ */}
        <section>
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
        </section>

      </div>
    </>
  )
}
