import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = {
  title: '保険料相場データベース【職業・年齢別】無料｜保険データドットコム',
  description: '職業・年齢・家族構成から適正な保険料の目安を調べられる無料データベース。政府統計に基づく客観的な保険料相場情報を提供。',
}

// カテゴリ日本語マッピング
const CATEGORY_LABELS: Record<string, string> = {
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

// カテゴリカラー
const CATEGORY_COLORS: Record<string, string> = {
  it:           'bg-blue-100 text-blue-700',
  medical:      'bg-red-100 text-red-700',
  public:       'bg-green-100 text-green-700',
  office:       'bg-gray-100 text-gray-700',
  transport:    'bg-orange-100 text-orange-700',
  construction: 'bg-yellow-100 text-yellow-700',
  food:         'bg-pink-100 text-pink-700',
  beauty:       'bg-purple-100 text-purple-700',
  professional: 'bg-indigo-100 text-indigo-700',
  creative:     'bg-fuchsia-100 text-fuchsia-700',
  manufacturing:'bg-teal-100 text-teal-700',
  parttime:     'bg-slate-100 text-slate-700',
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

export default async function Home() {
  const occupations = await getOccupations()

  // カテゴリ別グループ化
  const grouped = occupations.reduce<Record<string, Occupation[]>>((acc, occ) => {
    if (!acc[occ.category]) acc[occ.category] = []
    acc[occ.category].push(occ)
    return acc
  }, {})

  return (
    <>
      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ヒーローセクション */}
      <section className="bg-[#0f172a] text-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* バッジ */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="text-[#f59e0b]">●</span>
            <span>国交省・厚労省 公式データ準拠</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            あなたの職業に合った<br />
            <span className="text-[#2563eb]">保険料相場</span>を調べる
          </h1>

          <p className="text-gray-300 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
            職業・年齢・家族構成から適正な保険料の目安を無料で確認。<br />
            政府統計データに基づく客観的な情報を提供します。
          </p>

          {/* PR表記 */}
          <p className="text-gray-500 text-xs mb-8">
            ※本サイトはアフィリエイト広告を含みます（PR）
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#occupations"
              className="bg-[#2563eb] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-colors"
            >
              職業から調べる ↓
            </a>
            <Link
              href="/consult"
              className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition-colors"
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

      {/* 職業一覧 */}
      <section id="occupations" className="py-16 px-4 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#0f172a] mb-3">
            職業別・保険料相場データ
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">
            職業を選んで、あなたに合った保険料の目安を確認しましょう
          </p>

          {occupations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">📋</p>
              <p>データを準備中です。しばらくお待ちください。</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(grouped).map(([category, occs]) => (
                <div key={category}>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
                      {CATEGORY_LABELS[category] || category}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {occs.map(occ => (
                      <Link
                        key={occ.id}
                        href={`/occupation/${occ.slug}`}
                        className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-[#2563eb] hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[occ.category] || 'bg-gray-100 text-gray-700'}`}>
                            {CATEGORY_LABELS[occ.category] || occ.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#0f172a] text-sm leading-snug mb-3">
                          {occ.name_ja}
                        </h4>
                        {(occ.avg_income_man || occ.avg_income_woman) && (
                          <div className="text-xs text-gray-500 space-y-1 mb-3">
                            {occ.avg_income_man && (
                              <div className="flex justify-between">
                                <span>男性平均年収</span>
                                <span className="font-semibold text-[#0f172a]">{occ.avg_income_man}万円</span>
                              </div>
                            )}
                            {occ.avg_income_woman && (
                              <div className="flex justify-between">
                                <span>女性平均年収</span>
                                <span className="font-semibold text-[#0f172a]">{occ.avg_income_woman}万円</span>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="text-[#2563eb] text-xs font-semibold group-hover:underline">
                          保険料を調べる →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
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

      {/* 免責事項 */}
      <section className="py-10 px-4 bg-[#f8fafc] border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm font-bold text-gray-500 mb-3">免責事項</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            本サイトに掲載の保険料は公的統計データを基にした参考値です。実際の保険料は保険会社・契約内容により異なります。保険の加入・変更は各保険会社または代理店にご相談ください。本サイトはアフィリエイト広告を含み、保険会社・比較サービス等からの紹介手数料を収益源の一部としています。掲載情報の正確性には万全を期していますが、その内容を保証するものではありません。
          </p>
        </div>
      </section>
    </>
  )
}
