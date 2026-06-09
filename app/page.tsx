import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import HomeOccupationTabs from '@/components/HomeOccupationTabs'

export const metadata: Metadata = {
  title: '保険料相場データベース【職業・年齢別】無料｜保険データドットコム',
  description: '職業・年齢・家族構成から適正な保険料の目安を調べられる無料データベース。政府統計に基づく客観的な保険料相場情報を提供。',
}


type Occupation = {
  id: number
  slug: string
  name_ja: string
  category: string
  avg_income_man: number | null
  avg_income_woman: number | null
}

async function getOccupations(): Promise<Occupation[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase
      .from('hoken_occupations')
      .select('id, slug, name_ja, category, avg_income_man, avg_income_woman')
      .order('category')
    if (error) return []
    return data || []
  } catch {
    return []
  }
}

const faqItems = [
  {
    q: 'このサイトのデータはどこから取得していますか？',
    a: '国土交通省・厚生労働省・金融庁等の政府公開統計データ（賃金構造基本統計調査など）をもとに算出しています。e-Stat（政府統計の総合窓口）から取得した一次データを使用しています。',
  },
  {
    q: '無料で使えますか？',
    a: 'はい、完全無料でご利用いただけます。本サイトはアフィリエイト広告収入により運営しており、保険料相場データの閲覧・比較は全て無料です。',
  },
  {
    q: '保険の加入手続きはできますか？',
    a: '本サイトは保険料相場の参考情報を提供するサービスであり、保険の加入手続きは行っておりません。加入をご検討の際は、各保険会社または保険代理店にお問い合わせください。無料相談の窓口もご案内しています。',
  },
  {
    q: 'データはいつ更新されますか？',
    a: '政府統計データの公開に合わせて定期的に更新しています。賃金構造基本統計調査は毎年更新されるため、最新データが公開され次第、順次反映いたします。',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '保険データドットコム',
  url: 'https://hoken-data.com',
  description: '公的データに基づく保険料の相場・職業別・年齢別データを無料で調べられるサービスです。',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://hoken-data.com/occupation' },
    'query-input': 'required name=search_term_string',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '保険データドットコム',
  url: 'https://hoken-data.com',
  description: '政府統計データに基づく保険料相場データベース。職業・年齢・家族構成から適正な保険料の目安を無料で確認できます。',
  foundingDate: '2024',
  sameAs: ['https://twitter.com/anime_blog_info'],
}

export default async function Home() {
  const occupations = await getOccupations()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      {/* ヒーローセクション */}
      <section className="bg-[#0f172a] text-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* バッジ */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="text-[#f59e0b]">●</span>
            <span>厚生労働省 賃金構造基本統計調査 準拠</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            あなたの職業に合った<br />
            <span className="text-[#2563eb]">保険料相場</span>を調べる
          </h1>

          <p className="text-gray-300 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
            職業・年齢・家族構成から適正な保険料の目安を無料で確認。<br />
            政府統計データに基づく客観的な情報を提供します。
          </p>

          {/* データ規模 */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm text-gray-300 mb-6">
            <span><span className="text-white font-bold">20</span>職業</span>
            <span className="text-gray-600">×</span>
            <span><span className="text-white font-bold">10</span>保険種類</span>
            <span className="text-gray-600">×</span>
            <span><span className="text-white font-bold">484</span>ページのデータ</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/simulator"
              className="bg-[#2563eb] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-colors"
              aria-label="無料で保険料診断ツールを使う"
            >
              無料で保険料診断する →
            </Link>
            <Link
              href="/consult"
              className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition-colors"
              aria-label="ファイナンシャルプランナーに無料で保険相談する"
            >
              無料で保険相談する →
            </Link>
          </div>
        </div>
      </section>

      {/* 統計バー */}
      <section className="bg-[#1e293b] text-white py-5 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { value: '20', label: '対象職業' },
            { value: '10', label: '保険種類' },
            { value: '政府統計', label: 'データソース' },
            { value: '完全無料', label: '利用料金' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[#f59e0b] text-2xl font-bold">{item.value}</p>
              <p className="text-gray-400 text-sm mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* できること3カード */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#0f172a] mb-10">
            このサイトでできること
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📊',
                title: '職業別の保険料相場を調べる',
                desc: '自分の職業を選ぶだけで、医療保険・生命保険・収入保障など主要保険の月額相場をすぐ確認できます。',
                href: '#occupations',
                cta: '職業から調べる →',
              },
              {
                icon: '📅',
                title: '年齢・家族構成別に比較する',
                desc: '20代独身から50代家族持ちまで、ライフステージ別の保険料目安を政府統計データで比較できます。',
                href: '/age',
                cta: '年齢別データを見る →',
              },
              {
                icon: '💬',
                title: '無料で保険相談する',
                desc: 'データを確認した上で、専門のファイナンシャルプランナーに無料で相談できます。強引な勧誘はありません。',
                href: '/consult',
                cta: '無料相談を申し込む →',
              },
            ].map(card => (
              <Link
                key={card.title}
                href={card.href}
                className="group bg-[#f8fafc] rounded-2xl p-6 border border-gray-100 hover:border-[#2563eb] hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{card.desc}</p>
                <span className="text-[#2563eb] text-sm font-semibold group-hover:underline">{card.cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* データで見る保険市場 */}
      <section className="py-16 px-4 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#0f172a] mb-3">
            データで見る保険市場
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">政府統計データから読み解く、知っておくべき3つのポイント</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* インサイト1：最高年収職業 */}
            {(() => {
              const topOcc = [...occupations].sort((a, b) => ((b.avg_income_man || 0) - (a.avg_income_man || 0)))[0]
              return (
                <div className="bg-white rounded-2xl p-6 border-2 border-[#f59e0b] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#f59e0b]/10 rounded-bl-full" />
                  <div className="text-[#f59e0b] text-2xl mb-3">👑</div>
                  <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-wide mb-1">最も保険料が高い職業</p>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">
                    {topOcc ? topOcc.name_ja : '医師・弁護士'}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {topOcc ? `平均年収${topOcc.avg_income_man}万円（男性）。` : ''}
                    高収入職業ほど保険料も高くなる傾向があります。収入に見合った保障額の設計が特に重要です。
                  </p>
                  {topOcc && (
                    <Link href={`/occupation/${topOcc.slug}`} className="text-xs text-[#f59e0b] font-bold hover:underline">
                      {topOcc.name_ja}の保険料を見る →
                    </Link>
                  )}
                </div>
              )
            })()}

            {/* インサイト2：フリーランス */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#2563eb] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#2563eb]/10 rounded-bl-full" />
              <div className="text-[#2563eb] text-2xl mb-3">⚠️</div>
              <p className="text-xs font-bold text-[#2563eb] uppercase tracking-wide mb-1">フリーランスが最も注意すべき保険</p>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">就業不能・収入保障保険</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                フリーランスには傷病手当金がありません。病気・怪我で働けなくなると収入が即ゼロに。収入保障保険は必須の備えです。
              </p>
              <Link href="/occupation/freelance-engineer/income-protection" className="text-xs text-[#2563eb] font-bold hover:underline">
                フリーランスの収入保障相場を見る →
              </Link>
            </div>

            {/* インサイト3：30代 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#10b981] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#10b981]/10 rounded-bl-full" />
              <div className="text-[#10b981] text-2xl mb-3">📅</div>
              <p className="text-xs font-bold text-[#10b981] uppercase tracking-wide mb-1">30代が最も加入すべき保険</p>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">医療保険＋収入保障の組み合わせ</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                結婚・出産・住宅購入が重なる30代はリスクが最大化。医療保険と収入保障保険の2本柱で働き盛りを守りましょう。
              </p>
              <Link href="/age/30dai/income-protection" className="text-xs text-[#10b981] font-bold hover:underline">
                30代の収入保障相場を見る →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 職業から調べる */}
      <section id="occupations" className="py-16 px-4 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#0f172a] mb-3">
            20の職業から保険料を調べる
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            カテゴリを選んで、あなたの職業の保険料相場を確認できます
          </p>
          <HomeOccupationTabs />
          <div className="text-center mt-8">
            <Link
              href="/occupation"
              className="inline-block bg-[#2563eb] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              全職業一覧を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* ライフステージから調べる */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#0f172a] mb-3">
            ライフステージから保険を調べる
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">年代ごとに変わる保険ニーズ。今の自分に合った備えを確認しましょう</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                age: '20代',
                badge: '社会人スタート期',
                title: '社会人になったら最初に考える保険',
                recs: '医療保険・収入保障保険',
                href: '/age/20dai/medical',
                color: 'border-[#2563eb]',
                badgeBg: 'bg-blue-100 text-blue-700',
                icon: '🌱',
              },
              {
                age: '30代',
                badge: '結婚・子育て期',
                title: '結婚・出産・住宅購入で見直す保険',
                recs: '生命保険・医療保険',
                href: '/age/30dai/life',
                color: 'border-[#10b981]',
                badgeBg: 'bg-green-100 text-green-700',
                icon: '👨‍👩‍👧',
              },
              {
                age: '40代',
                badge: '収入ピーク・健康管理期',
                title: 'がんリスクが高まる40代の保険',
                recs: 'がん保険・就業不能保険',
                href: '/age/40dai/cancer',
                color: 'border-[#f59e0b]',
                badgeBg: 'bg-yellow-100 text-yellow-800',
                icon: '⚕️',
              },
              {
                age: '50代',
                badge: '老後準備期',
                title: '老後に備える50代の保険',
                recs: '個人年金・終身保険',
                href: '/age/50dai/pension',
                color: 'border-purple-400',
                badgeBg: 'bg-purple-100 text-purple-700',
                icon: '🏦',
              },
            ].map(item => (
              <Link
                key={item.age}
                href={item.href}
                className={`group bg-white rounded-xl p-5 border-2 ${item.color} hover:shadow-md transition-all flex flex-col`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <span className={`self-start text-xs px-2 py-0.5 rounded-full font-semibold mb-2 ${item.badgeBg}`}>
                  {item.age}・{item.badge}
                </span>
                <h3 className="font-bold text-[#0f172a] text-sm leading-snug mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 mb-4">推奨：{item.recs}</p>
                <span className="mt-auto text-[#2563eb] text-xs font-semibold group-hover:underline">
                  保険料を調べる →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* よく見られている組み合わせ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#0f172a] mb-3">
            よく見られている組み合わせ
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">
            職業と保険種類の人気の組み合わせから調べる
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { occ: 'engineer', occName: 'システムエンジニア', ins: 'medical', insName: '医療保険', income: 558, rate: 0.005 },
              { occ: 'nurse', occName: '看護師', ins: 'income-protection', insName: '就業不能保険', income: 574, rate: 0.008 },
              { occ: 'freelance-engineer', occName: 'フリーランスエンジニア', ins: 'income-protection', insName: '収入保障保険', income: 550, rate: 0.008 },
              { occ: 'manager', occName: '会社管理職', ins: 'life', insName: '生命保険', income: 885, rate: 0.01 },
              { occ: 'sales', occName: '営業職', ins: 'cancer', insName: 'がん保険', income: 620, rate: 0.004 },
              { occ: 'civil-servant', occName: '地方公務員', ins: 'pension', insName: '個人年金', income: 885, rate: 0.02 },
            ].map(item => {
              const monthly = Math.round(item.income * 10000 * item.rate / 12)
              return (
                <Link
                  key={`${item.occ}-${item.ins}`}
                  href={`/occupation/${item.occ}/${item.ins}`}
                  className="group bg-[#f8fafc] rounded-xl p-5 border border-gray-100 hover:border-[#2563eb] hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{item.occName}</span>
                    <span className="text-gray-400 text-xs">×</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{item.insName}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">推定月額保険料（参考値）</p>
                  <p className="text-2xl font-bold text-[#0f172a] mb-3">
                    {monthly.toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">円/月</span>
                  </p>
                  <span className="text-[#2563eb] text-xs font-semibold group-hover:underline">詳細を見る →</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#0f172a] mb-10">
            よくある質問
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details
                key={i}
                className="group border border-gray-200 rounded-xl overflow-hidden"
              >
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
