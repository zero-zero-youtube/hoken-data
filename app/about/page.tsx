import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '運営者情報・サイトについて',
  description: '保険データドットコムの運営者情報・サイト概要・データソースについて説明します。政府統計データに基づく中立的な保険料相場情報を提供しています。',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'トップ', item: 'https://hoken-data.com' },
    { '@type': 'ListItem', position: 2, name: '運営者情報', item: 'https://hoken-data.com/about' },
  ],
}

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <span>運営者情報</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold">運営者情報・サイトについて</h1>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">

        {/* 運営者 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            運営者について
          </h2>
          <div className="bg-[#f8fafc] rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <dt className="text-gray-500 font-medium">運営者名</dt>
              <dd className="col-span-2 text-[#0f172a] font-semibold">zero</dd>
              <dt className="text-gray-500 font-medium">専門</dt>
              <dd className="col-span-2 text-[#0f172a]">保険データアナリスト・政府統計データ分析</dd>
              <dt className="text-gray-500 font-medium">X（旧Twitter）</dt>
              <dd className="col-span-2">
                <a href="https://x.com/anime_blog_info" target="_blank" rel="noopener noreferrer"
                  className="text-[#2563eb] hover:underline">
                  @anime_blog_info
                </a>
              </dd>
            </div>
          </div>
        </section>

        {/* サイトを作った理由 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            このサイトを作った理由
          </h2>
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-gray-700 leading-relaxed space-y-4">
            <p>
              保険の見直しを考えた時、職業や年収に合った適正な保険料を客観的に調べられるサービスがないことに気づきました。
            </p>
            <p>
              保険会社や代理店に相談すると、どうしても営業目的のアドバイスになりがちです。また、保険比較サイトも結局は資料請求・申込み誘導が主な目的で、純粋に「自分の職業や年収では保険料の目安はいくらか」を調べられる場所がほとんどありませんでした。
            </p>
            <p>
              そこで、厚生労働省の賃金構造基本統計調査などの政府統計データを基に、職業別・年齢別の保険料相場を中立的な立場から提供するサービスを作りました。
            </p>
            <p className="text-sm text-gray-500 bg-[#f8fafc] rounded-lg p-4 border-l-4 border-[#2563eb]">
              本サイトはアフィリエイト広告を含みます。ただし、掲載する情報は公的統計データに基づいており、特定の保険会社や商品を優遇することなく、客観的な相場情報の提供を第一の目的としています。
            </p>
          </div>
        </section>

        {/* サイト情報 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            サイト情報
          </h2>
          <div className="bg-[#f8fafc] rounded-xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { value: '20職業', label: '対象職業数' },
                { value: '10種類', label: '保険種類' },
                { value: '237ページ', label: '相場データ数' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl p-4 text-center border">
                  <p className="text-2xl font-bold text-[#2563eb]">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-4">
                <span className="text-gray-500 w-32 flex-shrink-0">サイト名</span>
                <span className="text-[#0f172a]">保険データドットコム</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-32 flex-shrink-0">URL</span>
                <span className="text-[#0f172a]">https://hoken-data.com</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-32 flex-shrink-0">開設</span>
                <span className="text-[#0f172a]">2026年6月</span>
              </div>
            </div>
          </div>
        </section>

        {/* データソース */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            データソース
          </h2>
          <div className="space-y-3">
            {[
              {
                name: '賃金構造基本統計調査（厚生労働省）',
                desc: '職業別・年齢別の平均賃金データ。e-Stat（政府統計の総合窓口）から取得。',
                url: 'https://www.e-stat.go.jp/',
              },
              {
                name: '生命保険に関する全国実態調査（生命保険文化センター）',
                desc: '保険加入率・保険料支払い実態に関する統計データ。',
                url: 'https://www.jili.or.jp/',
              },
              {
                name: '家計調査（総務省統計局）',
                desc: '世帯別の保険料支出に関するデータ。',
                url: 'https://www.stat.go.jp/',
              },
            ].map(source => (
              <div key={source.name} className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="font-semibold text-[#0f172a] mb-1">{source.name}</p>
                <p className="text-sm text-gray-600 mb-2">{source.desc}</p>
                <a href={source.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#2563eb] hover:underline">{source.url}</a>
              </div>
            ))}
          </div>
        </section>

        {/* 免責事項 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            免責事項
          </h2>
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-sm text-gray-600 leading-relaxed space-y-3">
            <p>本サイトに掲載している保険料は、公的統計データをもとに算出した推計参考値です。実際の保険料は、保険会社・保障内容・年齢・健康状態・契約内容によって大きく異なります。</p>
            <p>保険の加入・変更・解約を検討される際は、必ず各保険会社または保険代理店にご相談の上、ご自身の判断で決定してください。</p>
            <p>本サイトはアフィリエイト広告を含みます。掲載リンクから保険会社・比較サービスへ誘導し、成約等が発生した場合に紹介料を受け取ることがあります。</p>
            <p>掲載情報の正確性・完全性については万全を期していますが、内容の保証はいたしかねます。本サイトの利用により生じた損害について、運営者は一切の責任を負いません。</p>
          </div>
        </section>

        {/* お問い合わせ */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            お問い合わせ
          </h2>
          <div className="bg-[#f8fafc] rounded-xl p-6 text-sm text-gray-700">
            <p className="mb-3">ご意見・ご要望・データの誤り等のご指摘は、X（旧Twitter）のDMにてお受けしています。</p>
            <a
              href="https://x.com/anime_blog_info"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              X @anime_blog_info へ連絡する →
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
