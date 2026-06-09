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
                { value: '484ページ', label: '相場データ数' },
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

        {/* データの計算方法 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            データの計算方法
          </h2>
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="font-bold text-[#0f172a] mb-2 text-sm">推定保険料の計算式</h3>
              <div className="bg-[#f8fafc] rounded-lg p-4 font-mono text-sm text-[#0f172a] border border-gray-200">
                推定月額 = 年収（万円）× 10,000 × 保険種類別係数 ÷ 12
              </div>
            </div>
            <div>
              <h3 className="font-bold text-[#0f172a] mb-3 text-sm">保険種類別係数（目安）</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a] text-white">
                      <th className="text-left p-3">保険種類</th>
                      <th className="text-right p-3">係数</th>
                      <th className="text-right p-3">年収500万円の月額目安</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: '医療保険',         rate: 0.005,  monthly: Math.round(500 * 10000 * 0.005 / 12) },
                      { name: '生命保険',         rate: 0.010,  monthly: Math.round(500 * 10000 * 0.010 / 12) },
                      { name: '就業不能保険',     rate: 0.008,  monthly: Math.round(500 * 10000 * 0.008 / 12) },
                      { name: 'がん保険',         rate: 0.004,  monthly: Math.round(500 * 10000 * 0.004 / 12) },
                      { name: '傷害保険',         rate: 0.003,  monthly: Math.round(500 * 10000 * 0.003 / 12) },
                      { name: '個人年金',         rate: 0.020,  monthly: Math.round(500 * 10000 * 0.020 / 12) },
                      { name: '終身保険',         rate: 0.015,  monthly: Math.round(500 * 10000 * 0.015 / 12) },
                      { name: '学資保険',         rate: 0.015,  monthly: Math.round(500 * 10000 * 0.015 / 12) },
                      { name: '自動車保険',       rate: null,   monthly: null },
                      { name: '火災保険',         rate: null,   monthly: null },
                    ].map((row, i) => (
                      <tr key={row.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                        <td className="p-3">{row.name}</td>
                        <td className="p-3 text-right text-gray-600 font-mono">{row.rate ?? '固定額'}</td>
                        <td className="p-3 text-right font-semibold">
                          {row.monthly ? `${row.monthly.toLocaleString()}円` : '1,000〜8,000円（固定）'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold text-yellow-800 mb-1">⚠️ 重要な注意事項</p>
              <p>上記の係数はあくまで参考値です。実際の保険料は保険会社・年齢・健康状態・保障内容・契約期間などにより大きく異なります。本サイトのデータは「おおよその目安」として参考にしてください。正確な保険料は各保険会社で見積もりを取ることをおすすめします。</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">年収データの出典：</p>
              <a
                href="https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00450091"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563eb] text-sm hover:underline"
              >
                e-Stat（政府統計の総合窓口）賃金構造基本統計調査 →
              </a>
            </div>
          </div>
        </section>

        {/* 更新履歴 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            更新履歴
          </h2>
          <div className="space-y-3">
            {[
              {
                date: '2026年6月9日',
                title: 'サイト公開・20職業×10保険種類データ掲載',
                desc: '厚生労働省賃金構造基本統計調査に基づく職業別保険料相場データを公開。',
              },
              {
                date: '2026年6月9日',
                title: '保険料シミュレーター追加',
                desc: '職業・年齢・性別・家族構成から推奨保険TOP3を診断するシミュレーターを追加。',
              },
              {
                date: '2026年6月9日',
                title: '484ページのデータベース構築完了',
                desc: '職業×保険（200ページ）・都道府県×職業（200ページ）・年齢×保険（40ページ）等484ページを公開。',
              },
              {
                date: '今後の予定',
                title: '都道府県別データ拡充・最新統計データへの更新',
                desc: '現在10都道府県のデータを47都道府県に拡充予定。また、毎年公開される最新の賃金統計データに順次更新します。',
                future: true,
              },
            ].map((item, i) => (
              <div key={i} className={`flex gap-4 bg-white rounded-xl p-5 border ${item.future ? 'border-dashed border-gray-300' : 'border-gray-100'}`}>
                <div className="flex-shrink-0 text-right">
                  <span className={`text-xs font-semibold whitespace-nowrap ${item.future ? 'text-gray-400' : 'text-[#2563eb]'}`}>
                    {item.date}
                  </span>
                </div>
                <div>
                  <p className={`font-bold text-sm mb-1 ${item.future ? 'text-gray-400' : 'text-[#0f172a]'}`}>{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
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
