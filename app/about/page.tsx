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

const rules = [
  {
    icon: '✅',
    title: '特定商品の推薦・ランキングを行わない',
    desc: '本サイトは「おすすめ」「ランキング」など主観的な評価を一切掲載しません。表示順は保険料の低い順・保険種類のアルファベット順など客観的基準のみです。',
  },
  {
    icon: '✅',
    title: '一次統計データのみを使用',
    desc: '政府・公的研究機関が公開する一次統計データのみを情報源とし、民間調査や口コミ情報は使用しません。',
  },
  {
    icon: '✅',
    title: '保険募集行為を行わない',
    desc: '本サイトは保険募集の許可を受けておらず、保険商品の販売・勧誘・申込受付を行いません。加入手続きは各保険会社または代理店で行ってください。',
  },
  {
    icon: '✅',
    title: 'アフィリエイト広告の完全開示',
    desc: '本サイトはアフィリエイト広告を含み、紹介料を収益源の一部としています。ただし広告収益は掲載情報の中立性に一切影響しません。',
  },
  {
    icon: '✅',
    title: '参考値であることの明示',
    desc: '全ての保険料は推計参考値であり、実際の保険料は年齢・健康状態・保険会社により大きく異なることを全ページで明示しています。',
  },
]

const history = [
  {
    date: '2026年6月9日',
    title: 'サイト公開',
    desc: '20職業×10保険種類・484ページのデータベースを公開。厚生労働省 賃金構造基本統計調査2023年版データを使用。',
    future: false,
  },
  {
    date: '2026年6月9日',
    title: '保険料シミュレーター追加',
    desc: '職業・年齢・性別・家族構成から推奨保険TOP3を3STEPで診断するツールを追加。',
    future: false,
  },
  {
    date: '2026年6月9日',
    title: '職業別リスクデータ追加',
    desc: '厚生労働省の労働災害統計・過労死等防止対策白書等から18職業の職業リスクデータを追加。',
    future: false,
  },
  {
    date: '2026年6月（予定）',
    title: 'アフィリエイト提携開始',
    desc: 'ほけんの縁結び（レントラックス）・保険クリニック（A8.net）等との提携申請予定。',
    future: true,
  },
  {
    date: '2026年秋（予定）',
    title: '都道府県データ拡充',
    desc: '現在10都道府県のデータを全47都道府県に拡充予定。',
    future: true,
  },
]

const calcSteps = [
  {
    step: 1,
    icon: '🏛️',
    title: 'データ取得',
    desc: '厚生労働省「賃金構造基本統計調査」（e-Stat）から職業別・男女別の平均年収を取得',
  },
  {
    step: 2,
    icon: '📊',
    title: '年収データの整形',
    desc: '各職業の男性・女性別の平均年収（万円単位）を確認。数値がない場合は業界平均を代用',
  },
  {
    step: 3,
    icon: '✖️',
    title: '保険種類別係数を適用',
    desc: '「年収 × 10,000 × 係数 ÷ 12」で月額を算出。係数は業界平均の保険料率を参考に設定',
  },
  {
    step: 4,
    icon: '💴',
    title: '推定月額保険料を表示',
    desc: '算出した月額を「推計参考値」として表示。職業の実際のリスクや保障ニーズは別途掲載',
  },
]

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
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-8">

            {/* 計算フロー（縦並び矢印付き） */}
            <div>
              <h3 className="font-bold text-[#0f172a] mb-5 text-sm">計算フロー</h3>
              <div className="flex flex-col items-stretch gap-0">
                {calcSteps.map((s, i) => (
                  <div key={s.step} className="flex flex-col items-center">
                    {/* ステップカード */}
                    <div className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#2563eb] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {s.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{s.icon}</span>
                          <span className="font-semibold text-[#0f172a] text-sm">{s.title}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                    {/* 矢印（最後のステップ以外） */}
                    {i < calcSteps.length - 1 && (
                      <div className="flex flex-col items-center py-1">
                        <div className="w-0.5 h-4 bg-[#2563eb]" />
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-[#2563eb]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 計算式 */}
            <div>
              <h3 className="font-bold text-[#0f172a] mb-2 text-sm">推定保険料の計算式</h3>
              <div className="bg-[#f8fafc] rounded-lg p-4 font-mono text-sm text-[#0f172a] border border-gray-200">
                推定月額 = 年収（万円）× 10,000 × 保険種類別係数 ÷ 12
              </div>
            </div>

            {/* 係数テーブル */}
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
                      { name: '医療保険',     rate: 0.005,  monthly: Math.round(500 * 10000 * 0.005 / 12) },
                      { name: '生命保険',     rate: 0.010,  monthly: Math.round(500 * 10000 * 0.010 / 12) },
                      { name: '就業不能保険', rate: 0.008,  monthly: Math.round(500 * 10000 * 0.008 / 12) },
                      { name: 'がん保険',     rate: 0.004,  monthly: Math.round(500 * 10000 * 0.004 / 12) },
                      { name: '傷害保険',     rate: 0.003,  monthly: Math.round(500 * 10000 * 0.003 / 12) },
                      { name: '個人年金',     rate: 0.020,  monthly: Math.round(500 * 10000 * 0.020 / 12) },
                      { name: '終身保険',     rate: 0.015,  monthly: Math.round(500 * 10000 * 0.015 / 12) },
                      { name: '学資保険',     rate: 0.015,  monthly: Math.round(500 * 10000 * 0.015 / 12) },
                      { name: '自動車保険',   rate: null,   monthly: null },
                      { name: '火災保険',     rate: null,   monthly: null },
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

        {/* このサイトが守るルール（YMYL対応） */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-2 pb-2 border-b-2 border-[#10b981]">
            このサイトが守るルール
          </h2>
          <p className="text-sm text-gray-500 mb-5">保険業法・景品表示法への対応と、中立性確保のための編集方針</p>
          <div className="space-y-3">
            {rules.map((rule, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4">
                <span className="text-xl flex-shrink-0 mt-0.5">{rule.icon}</span>
                <div>
                  <p className="font-semibold text-[#0f172a] text-sm mb-1">{rule.title}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 更新履歴（タイムライン形式） */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            更新履歴
          </h2>
          <div className="relative">
            {/* 縦線 */}
            <div className="absolute left-[88px] top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {history.map((item, i) => (
                <div key={i} className="flex gap-6 relative">
                  {/* 左：日付 */}
                  <div className="w-20 flex-shrink-0 text-right pt-3">
                    <span className={`text-xs font-semibold leading-tight ${item.future ? 'text-gray-400' : 'text-[#2563eb]'}`}>
                      {item.date.replace('年', '\n年').replace('月', '\n月')}
                    </span>
                  </div>

                  {/* ドット */}
                  <div className="relative flex-shrink-0 flex items-start pt-3.5">
                    <div className={`w-3 h-3 rounded-full border-2 ${item.future ? 'border-gray-300 bg-white' : 'border-[#2563eb] bg-[#2563eb]'}`} />
                  </div>

                  {/* 右：内容 */}
                  <div className={`flex-1 bg-white border rounded-xl p-4 ${item.future ? 'border-dashed border-gray-300' : 'border-gray-100'}`}>
                    <p className={`font-bold text-sm mb-1 ${item.future ? 'text-gray-400' : 'text-[#0f172a]'}`}>
                      {item.future && <span className="text-xs font-normal text-gray-400 mr-2">（予定）</span>}
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
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

        {/* お問い合わせ（カード化） */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            お問い合わせ
          </h2>
          <div className="border-2 border-[#2563eb] rounded-xl p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#0f172a]">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="font-bold text-[#0f172a]">@anime_blog_info へ DM</span>
              </div>
              <p className="text-sm text-gray-500">データの誤り・修正依頼はお気軽にご連絡ください</p>
            </div>
            <a
              href="https://x.com/anime_blog_info"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X でメッセージを送る →
            </a>
          </div>
        </section>

      </div>
    </>
  )
}
