import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateCTA from '@/components/AffiliateCTA'

export const metadata: Metadata = {
  title: '収入保障保険・就業不能保険の選び方【フリーランス必見】2025年版',
  description: '収入保障保険と就業不能保険の違い・選び方を解説。傷病手当金でカバーされる範囲、必要保障額の計算方法、職業別リスクと推奨保障額まで徹底解説。',
}

const faqItems = [
  {
    q: '収入保障保険と就業不能保険の違いは何ですか？',
    a: '収入保障保険は主に死亡時に保険金が分割して支払われる保険で、就業不能保険は病気・怪我で働けなくなった際に毎月給付金が支払われる保険です。フリーランスが特に必要なのは「就業不能保険（就業不能状態への備え）」です。',
  },
  {
    q: 'フリーランスが就業不能保険に入るべき理由は？',
    a: '会社員には傷病手当金（給与の約2/3を最大18ヶ月）がありますが、フリーランス・自営業は国民健康保険に加入しており傷病手当金がありません。働けなくなると即収入ゼロになるため、就業不能保険は特に重要です。',
  },
  {
    q: '保険料はどのくらいが目安ですか？',
    a: '就業不能保険の保険料は年齢・保障額・職業によって異なりますが、30代男性で月額10万円の給付金を設定した場合、月額2,000〜4,000円程度が目安です。フリーランスは収入の変動があるため、給付金額は固定費をカバーできる水準で設定するのがおすすめです。',
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
          <p className="text-gray-300 text-sm">2025年最新版 – フリーランス・自営業・会社員別に解説</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-14">

        {/* 目次 */}
        <nav className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
          <p className="font-bold text-[#0f172a] text-sm mb-3">📋 この記事の目次</p>
          <ol className="space-y-1.5 text-sm text-[#2563eb]">
            {[
              '収入保障保険・就業不能保険とは何か（公的制度との違い）',
              '傷病手当金・障害年金でカバーされる範囲',
              '収入保障保険が特に必要な人（フリーランス・自営業）',
              '収入保障保険 vs 就業不能保険の違い',
              '必要保障額の計算方法',
              '職業別リスクと推奨保障額',
              'よくある加入ミス3選',
              '選び方チェックリスト',
            ].map((title, i) => (
              <li key={i}><span className="text-gray-400 mr-2">{i + 1}.</span>{title}</li>
            ))}
          </ol>
        </nav>

        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            1. 収入保障保険・就業不能保険とは何か（公的制度との違い）
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              「働けなくなった時の備え」には公的制度と民間保険の2つがあります。公的制度には傷病手当金・障害年金・労災補償などがありますが、いずれも受給条件・支給額・期間に制限があります。
            </p>
            <p>
              民間の収入保障保険・就業不能保険は、この公的制度の隙間を埋めるものです。特にフリーランス・個人事業主は公的セーフティーネットが薄いため、民間保険の重要性が極めて高くなります。
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="font-bold text-blue-900 mb-2">2つの保険の目的の違い</p>
              <ul className="space-y-2 text-blue-800">
                <li>・<strong>収入保障保険</strong>：死亡・高度障害時に残された家族の生活費を毎月補填</li>
                <li>・<strong>就業不能保険</strong>：病気・怪我で本人が働けない間の収入を毎月補填</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            2. 傷病手当金・障害年金でカバーされる範囲
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              公的制度の内容を正確に把握することが、保険設計の出発点です。会社員・公務員が利用できる主な制度は以下の通りです。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">制度</th>
                    <th className="text-center p-3">会社員</th>
                    <th className="text-center p-3">フリーランス</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: '傷病手当金', company: '✅ 月収の2/3・最大18ヶ月', freelance: '❌ なし' },
                    { item: '労災補償（業務中）', company: '✅ あり', freelance: '△ 特別加入で一部可' },
                    { item: '障害年金（障害2級）', company: '✅ 約78万円/年', freelance: '✅ 約78万円/年' },
                    { item: '収入途絶リスク', company: '低（手当金でカバー）', freelance: '高（即ゼロになる）' },
                  ].map((row, i) => (
                    <tr key={row.item} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.item}</td>
                      <td className="p-3 text-center">{row.company}</td>
                      <td className="p-3 text-center font-semibold text-indigo-700">{row.freelance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              出典：
              <a href="https://www.kyoukaikenpo.or.jp/g3/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                全国健康保険協会「傷病手当金」
              </a>
              、
              <a href="https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                日本年金機構「障害年金」
              </a>
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            3. 収入保障保険が特に必要な人（フリーランス・自営業）
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              フリーランス・個人事業主が就業不能になった場合、傷病手当金がないため翌月から収入がゼロになります。固定費（家賃・光熱費・通信費）や生活費は容赦なく発生し続けるため、貯蓄が急速に底をつくリスクがあります。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="font-bold text-red-800 mb-2">特に必要な人</p>
                <ul className="space-y-1 text-red-700 text-xs">
                  {[
                    'フリーランス・個人事業主（傷病手当金なし）',
                    '自営業・中小企業経営者',
                    '貯蓄が生活費の12ヶ月未満',
                    '住宅ローンがある',
                    '家族を扶養している',
                  ].map(i => <li key={i}>◎ {i}</li>)}
                </ul>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="font-bold text-green-800 mb-2">優先度が低い人</p>
                <ul className="space-y-1 text-green-700 text-xs">
                  {[
                    '公務員（共済組合の保障が手厚い）',
                    '大企業の正社員（団体保険・傷病手当金あり）',
                    '独身で貯蓄が生活費の24ヶ月以上ある',
                    '配偶者の収入で家計が維持できる',
                  ].map(i => <li key={i}>△ {i}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            4. 収入保障保険 vs 就業不能保険の違い
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-2">収入保障保険</h3>
              <p className="text-blue-700 leading-relaxed mb-3">
                主に<strong>死亡・高度障害</strong>時に保険金が毎月分割で支払われる保険。残された家族の生活費をカバーする目的。
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>✓ 死亡・高度障害が対象</li>
                <li>✓ 保険期間が進むと保険金総額が減少</li>
                <li>✓ 保険料が比較的安い（月2,000〜5,000円）</li>
                <li>✗ 就業不能（生存・病気）には対応しない</li>
              </ul>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <h3 className="font-bold text-indigo-800 mb-2">就業不能保険</h3>
              <p className="text-indigo-700 leading-relaxed mb-3">
                <strong>病気・怪我で働けなくなった</strong>際に毎月給付金が支払われる保険。フリーランスの収入途絶リスクをカバー。
              </p>
              <ul className="text-xs text-indigo-600 space-y-1">
                <li>✓ 就業不能状態が対象（生存していてもOK）</li>
                <li>✓ 毎月定額の給付金</li>
                <li>✓ 精神疾患もカバーする商品あり</li>
                <li>✗ 死亡時は対象外</li>
              </ul>
            </div>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 text-sm">
            <strong>ポイント：</strong>フリーランスが特に必要なのは「就業不能保険」。死亡保障（収入保障保険）も重要ですが、働けなくなるリスクへの備えが優先されます。
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            5. 必要保障額の計算方法
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              必要な保障額は「就業不能期間中に不足する収入」を計算することで求められます。以下の順序で計算してください。
            </p>
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200 space-y-4">
              {[
                {
                  step: 'Step 1',
                  title: '月の固定費を洗い出す',
                  desc: '家賃・住宅ローン・光熱費・通信費・食費・保険料など、就業不能でも発生し続ける費用を合計する。',
                },
                {
                  step: 'Step 2',
                  title: '公的給付を差し引く',
                  desc: '会社員なら傷病手当金（月収×2/3）を、フリーランスなら障害年金（約6.5万円/月）を差し引く。',
                },
                {
                  step: 'Step 3',
                  title: '不足額×想定期間で保障額を決める',
                  desc: '不足額（月）×保障すべき月数（12〜60ヶ月）が必要保障額の目安。一般的には月収の50〜60%が給付金の目安。',
                },
              ].map(s => (
                <div key={s.step} className="flex gap-4">
                  <span className="bg-[#2563eb] text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0 h-fit">{s.step}</span>
                  <div>
                    <p className="font-bold text-[#0f172a] mb-1">{s.title}</p>
                    <p className="text-gray-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="font-bold text-blue-800 mb-1">計算例（フリーランスエンジニア・月収50万円の場合）</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>・月の固定費：25万円（家賃・食費・光熱費・各種費用）</li>
                <li>・公的給付：障害年金約6.5万円/月</li>
                <li>・不足額：25万 − 6.5万 ＝ 約18.5万円/月</li>
                <li>・推奨給付金：月20万円（切り上げて余裕を持たせる）</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            6. 職業別リスクと推奨保障額
          </h2>
          <p className="text-xs text-gray-500 mb-4">※月額給付金10万円・30代・一般的な健康状態を想定した参考値。実際の保険料は保険会社・条件により大きく異なります。</p>
          <div className="space-y-3">
            {[
              { slug: 'freelance-engineer', name: 'フリーランスエンジニア', monthly: '2,500〜4,500円', priority: '必須', color: 'text-red-600', risk: '傷病手当金なし・収入即ゼロリスク' },
              { slug: 'engineer', name: 'システムエンジニア（会社員）', monthly: '2,000〜3,500円', priority: '重要', color: 'text-orange-600', risk: '精神疾患・燃え尽きリスクが高い' },
              { slug: 'nurse', name: '看護師', monthly: '2,500〜4,000円', priority: '重要', color: 'text-orange-600', risk: '感染症・腰痛・精神疾患リスク' },
              { slug: 'civil-servant', name: '地方公務員', monthly: '1,500〜2,500円', priority: '推奨', color: 'text-green-600', risk: '共済保障が手厚い・上乗せ設計でOK' },
              { slug: 'construction', name: '建設業・現場作業員', monthly: '3,500〜6,000円', priority: '必須', color: 'text-red-600', risk: '労災リスクが高く長期入院の可能性' },
            ].map(item => (
              <div key={item.slug} className="bg-[#f8fafc] rounded-xl border border-gray-100">
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <Link href={`/occupation/${item.slug}/income-protection`} className="font-semibold text-[#0f172a] hover:text-[#2563eb] text-sm">
                      {item.name}
                    </Link>
                    <p className={`text-xs font-semibold mt-0.5 ${item.color}`}>{item.priority}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.risk}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0f172a]">{item.monthly}</p>
                    <p className="text-xs text-gray-500">/月（参考値）</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            7. よくある加入ミス3選
          </h2>
          <div className="space-y-4 text-sm">
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-5">
              <p className="font-bold text-red-800 mb-2">ミス1：精神疾患が免責の保険を選ぶ</p>
              <p className="text-gray-700 leading-relaxed">
                うつ病・適応障害は現代の主要な就業不能原因です。厚生労働省の調査では精神疾患患者数は増加の一途をたどっています。精神疾患が免責（対象外）の就業不能保険では、最も頻度の高いリスクに備えられません。契約前に必ず確認してください。
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-5">
              <p className="font-bold text-red-800 mb-2">ミス2：待機期間（免責期間）を把握していない</p>
              <p className="text-gray-700 leading-relaxed">
                就業不能保険には一般的に60〜90日の待機期間があり、その間は給付がありません。この期間を緊急予備費（生活費3ヶ月分）でカバーできるか確認した上で加入してください。待機期間が短い商品は保険料が高くなる傾向があります。
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-5">
              <p className="font-bold text-red-800 mb-2">ミス3：収入保障保険と就業不能保険を混同する</p>
              <p className="text-gray-700 leading-relaxed">
                この2つは全く異なる保険です。「収入保障保険（死亡時の遺族向け）」に入っているから「就業不能（自分が生存しながら働けなくなる）」もカバーされると勘違いしているケースが多くあります。目的に合った保険を選ぶことが重要です。
              </p>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            8. 選び方チェックリスト
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
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
          <div className="space-y-2">
            {[
              '現在の公的制度（傷病手当金・障害年金）の内容を確認した',
              '月の固定費を計算し、必要給付額を算出した',
              '精神疾患が保障対象に含まれているか確認した',
              '待機期間（60〜90日）を乗り越えられる貯蓄があるか確認した',
              '保障期間が65歳（または定年年齢）まであるか確認した',
              '収入保障保険と就業不能保険の違いを理解した',
              '複数の保険会社で見積もりを取った',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                <span className="text-[#2563eb] font-bold flex-shrink-0">✓</span>
                <span className="text-gray-700">{item}</span>
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
