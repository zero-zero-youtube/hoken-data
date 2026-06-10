import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateCTA from '@/components/AffiliateCTA'

export const metadata: Metadata = {
  title: '医療保険の選び方【職業別・年齢別の適正保険料】2025年版',
  description: '医療保険の選び方を公的制度との違いから解説。高額療養費制度の実態、フリーランス・会社員・公務員別の必要性、よくある加入ミス3選まで政府統計データをもとに紹介。',
}

const faqItems = [
  {
    q: '医療保険は公的保険（健康保険）があれば不要ですか？',
    a: '高額療養費制度により月の自己負担には上限がありますが、差額ベッド代・先進医療・入院中の収入減少はカバーされません。特にフリーランスや自営業は傷病手当金がなく、働けない間の収入補填として医療保険の役割が大きくなります。',
  },
  {
    q: '医療保険はいつ加入するのがベストですか？',
    a: '若くて健康なうちに加入するほど保険料が安く、健康状態による加入制限も受けにくいです。20〜30代での終身型加入が最もコストパフォーマンスが高く、病気になってからでは加入できない場合もあるため早めの検討をおすすめします。',
  },
  {
    q: '入院日額型と一時金型、どちらを選ぶべきですか？',
    a: '厚生労働省の統計では平均入院日数が年々短縮し2022年で一般病床約16日です。短期入院が多い現代では一時金型が受け取り額で有利になりやすい一方、長期入院リスクが高い職業は日額型の方が安心です。職業リスクに合わせて選びましょう。',
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
    { '@type': 'ListItem', position: 3, name: '医療保険の選び方', item: 'https://hoken-data.com/guide/medical-insurance' },
  ],
}

export default function MedicalInsuranceGuidePage() {
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
            <span>医療保険の選び方</span>
          </div>
          <div className="inline-block bg-white/10 text-xs px-3 py-1 rounded-full mb-3">🏥 医療保険ガイド</div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            医療保険の選び方<br />
            <span className="text-[#2563eb]">【職業別・年齢別の適正保険料】</span>
          </h1>
          <p className="text-gray-300 text-sm">政府統計データに基づく2025年版ガイド</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-14">

        {/* 目次 */}
        <nav className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
          <p className="font-bold text-[#0f172a] text-sm mb-3">📋 この記事の目次</p>
          <ol className="space-y-1.5 text-sm text-[#2563eb]">
            {[
              '医療保険とは何か：公的保険との違いを理解する',
              '高額療養費制度で実はこんなにカバーされている',
              '医療保険が本当に必要な人・不要な人',
              '医療保険の主な種類：入院日額型 vs 一時金型',
              '職業別・年齢別の選び方のポイント',
              '医療保険の平均相場（政府統計・業界調査より）',
              'よくある加入ミス3選',
              '医療保険選びの最終チェックリスト',
            ].map((title, i) => (
              <li key={i} className="hover:underline">
                <span className="text-gray-400 mr-2">{i + 1}.</span>{title}
              </li>
            ))}
          </ol>
        </nav>

        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            1. 医療保険とは何か：公的保険との違いを理解する
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              日本には国民健康保険・健康保険（社会保険）という公的医療保険制度があり、医療費の自己負担は原則3割です。さらに「高額療養費制度」により、1ヶ月の自己負担額には上限が設けられています（年収約370〜770万円の場合、月約8〜9万円）。
            </p>
            <p>
              民間の医療保険は、この公的制度でカバーできない部分を補うものです。具体的には①入院中の収入減少②差額ベッド代③先進医療費用④退院後の生活費などが対象となります。
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="font-bold text-blue-900 mb-3">重要なポイント</p>
              <p className="text-blue-800">
                医療保険は「病気になった時の治療費」よりも「働けない間の収入補填」として考えるのが正確です。特にフリーランス・個人事業主は傷病手当金がないため、この観点が非常に重要になります。
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            2. 高額療養費制度で実はこんなにカバーされている
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              多くの人が知らないのが高額療養費制度の手厚さです。年収500万円のサラリーマンが入院して100万円の医療費がかかった場合、3割負担で30万円になりますが、高額療養費制度を適用すると実質負担は約8〜9万円まで抑えられます。つまり100万円の手術でも実質負担は9万円程度です。
            </p>
            <p>
              この事実を知らずに過剰な医療保険に加入している人が非常に多くいます。まず公的制度の内容を把握した上で、不足する部分を民間保険で補うという順序が大切です。
            </p>
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
              <p className="font-bold text-[#0f172a] mb-3">高額療養費制度でカバーされない費用</p>
              <ul className="space-y-2">
                {[
                  '差額ベッド代（個室・2人部屋の追加料金）：1日3,000〜10,000円',
                  '食事代：1食460円（1日3食で1,380円）',
                  '先進医療技術料：陽子線治療など数十〜数百万円',
                  '入院中の収入減少（フリーランス・自営業は特に深刻）',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 font-bold flex-shrink-0">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              出典：
              <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/juuyou/kougakuiryou/index.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                厚生労働省「高額療養費制度を利用される皆さまへ」
              </a>
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            3. 医療保険が本当に必要な人・不要な人
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="font-bold text-red-800 mb-3">優先度が高い人</p>
              <ul className="space-y-2 text-red-700">
                {[
                  'フリーランス・個人事業主（傷病手当金がない）',
                  '貯蓄が少ない（入院費用を現金で賄えない）',
                  '家族を養っている（収入停止が家計直結）',
                  '精神疾患リスクの高い職業（IT・医療・介護）',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">◎</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <p className="font-bold text-green-800 mb-3">優先度が低い人</p>
              <ul className="space-y-2 text-green-700">
                {[
                  '会社員で傷病手当金が出る（最長1年6ヶ月・月収の2/3）',
                  '貯蓄が300万円以上ある',
                  '独身で扶養家族がいない',
                  '50代以降（保険料が高く、貯蓄対応が現実的）',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">△</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 text-sm">
            <strong>特に会社員の場合：</strong>傷病手当金（月収の約67%）が最長18ヶ月支給されます。これを把握せずに高額な就業不能保険に加入している例が多く見られます。
          </div>
          <p className="text-xs text-gray-500 mt-2">
            出典：
            <a href="https://www.kyoukaikenpo.or.jp/g3/sb3040/r139/" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
              全国健康保険協会「傷病手当金」
            </a>
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            4. 医療保険の主な種類：入院日額型 vs 一時金型
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-2">入院日額型</h3>
              <p className="text-blue-700 leading-relaxed mb-3">入院1日あたり5,000円・10,000円などが支給される従来型。</p>
              <ul className="space-y-1 text-blue-600">
                <li>✓ 長期入院に強い</li>
                <li>✗ 入院短期化で給付額が少なくなりやすい</li>
              </ul>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <h3 className="font-bold text-indigo-800 mb-2">一時金型（入院一時金型）</h3>
              <p className="text-indigo-700 leading-relaxed mb-3">入院1回につき10万円・30万円などが一括支給される新しいタイプ。</p>
              <ul className="space-y-1 text-indigo-600">
                <li>✓ 短期入院でもまとまった額が受け取れる</li>
                <li>✗ 長期入院では日額型より少なくなる可能性</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            厚生労働省の統計では平均入院日数は年々短縮しており、2022年時点で一般病床の平均は約16日です。この傾向から一時金型が近年注目されています。
          </p>
          <p className="text-xs text-gray-500 mt-2">
            出典：
            <a href="https://www.mhlw.go.jp/toukei/list/10-20.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
              厚生労働省「患者調査」2022年
            </a>
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            5. 職業別・年齢別の選び方のポイント
          </h2>
          <div className="space-y-3 text-sm">
            {[
              {
                title: 'フリーランス・個人事業主',
                badge: '必須',
                badgeColor: 'bg-red-100 text-red-700',
                desc: '傷病手当金がないため、就業不能保険との組み合わせが必須。月収×24ヶ月分の保障を目安に設計しましょう。',
                link: '/occupation/freelance-engineer/medical',
                linkText: 'フリーランスの医療保険相場',
              },
              {
                title: '会社員・公務員',
                badge: '推奨',
                badgeColor: 'bg-green-100 text-green-700',
                desc: '傷病手当金があるため優先度は中程度。差額ベッド代・先進医療特約に絞った最小限の保障で十分なケースが多い。',
                link: '/occupation/engineer/medical',
                linkText: '会社員の医療保険相場',
              },
              {
                title: '医療・介護職',
                badge: '重要',
                badgeColor: 'bg-orange-100 text-orange-700',
                desc: '感染リスク・腰痛などの職業性疾患リスクが高い。精神疾患特約の有無を必ず確認する。',
                link: '/occupation/nurse/medical',
                linkText: '看護師の医療保険相場',
              },
              {
                title: '建設業・製造業',
                badge: '重要',
                badgeColor: 'bg-orange-100 text-orange-700',
                desc: '労働災害の発生率が高く、長期入院リスクも高め。入院日額型で手厚い保障を確保する。',
                link: '/occupation/construction/medical',
                linkText: '建設業の医療保険相場',
              },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-[#0f172a]">{item.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.badgeColor}`}>{item.badge}</span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-2">{item.desc}</p>
                <Link href={item.link} className="text-[#2563eb] text-xs font-semibold hover:underline">{item.linkText} →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            6. 医療保険の平均相場（政府統計・業界調査より）
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            生命保険文化センターの調査（2022年）によると、医療保険・疾病入院特約の年間払込保険料の平均は以下の通りです。ただし職業・健康状態・保障内容によって大きく変わります。
          </p>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="text-left p-3">年齢層</th>
                  <th className="text-right p-3">月額目安（平均）</th>
                  <th className="text-left p-3">見直しポイント</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { age: '20代', monthly: '約2,000〜2,500円', point: '早期加入で終身型を確保' },
                  { age: '30代', monthly: '約2,500〜3,500円', point: '結婚・出産を機に保障を見直す' },
                  { age: '40代', monthly: '約3,500〜4,500円', point: 'がんリスク増でがん特約追加を検討' },
                  { age: '50代', monthly: '約4,500〜6,000円', point: '不要な特約を整理してコスト最適化' },
                ].map((row, i) => (
                  <tr key={row.age} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                    <td className="p-3 font-medium">{row.age}</td>
                    <td className="p-3 text-right font-bold text-[#0f172a]">{row.monthly}</td>
                    <td className="p-3 text-xs text-gray-500">{row.point}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            出典：
            <a href="https://www.jili.or.jp/research/report/chousa2022.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
              生命保険文化センター「生命保険に関する全国実態調査」2022年
            </a>
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            7. よくある加入ミス3選
          </h2>
          <div className="space-y-4 text-sm">
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-5">
              <p className="font-bold text-red-800 mb-2">ミス1：精神疾患を免責とする保険を選ぶ</p>
              <p className="text-gray-700 leading-relaxed">
                うつ病・適応障害による入院・休職は現代の主要リスクです。特にIT・医療・介護職は精神疾患の発症率が高く、精神疾患が免責（保障対象外）の保険では最も重要なリスクをカバーできません。契約前に必ず約款の免責条項を確認してください。
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-5">
              <p className="font-bold text-red-800 mb-2">ミス2：傷病手当金を知らずに過剰加入する</p>
              <p className="text-gray-700 leading-relaxed">
                会社員・公務員には傷病手当金（月収の約67%・最長18ヶ月）があります。これを把握せずに高額な就業不能保険・医療保険に加入すると保険料の払い過ぎになります。自分の公的保険給付を確認してから民間保険を設計しましょう。
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-5">
              <p className="font-bold text-red-800 mb-2">ミス3：保険料の安さだけで選ぶ</p>
              <p className="text-gray-700 leading-relaxed">
                保険料が安い＝保障が薄いということです。入院日額・手術給付金・特約の内容を必ず比較してください。特に「先進医療特約」は月100〜200円の追加で数百万円の保障が得られるため、ほぼ必須といえます。
              </p>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            8. 医療保険選びの最終チェックリスト
          </h2>
          <p className="text-sm text-gray-700 mb-4">保険に加入・見直しする前に以下を確認してください：</p>
          <div className="space-y-2">
            {[
              '現在の健康保険（高額療養費制度）の自己負担上限額を確認した',
              '会社の傷病手当金・団体保険の内容を確認した',
              '貯蓄額と照らし合わせて本当に保険が必要か判断した',
              '精神疾患が保障対象かどうか確認した',
              '入院日額型か一時金型かを自分のリスクに合わせて選んだ',
              '先進医療特約の有無を確認した',
              '複数の保険会社で見積もりを取った',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-lg px-4 py-3 border border-gray-100 text-sm">
                <span className="text-[#2563eb] font-bold flex-shrink-0">✓</span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 職業別相場リンク */}
        <section className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">職業別の医療保険相場を調べる</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { slug: 'engineer', name: 'エンジニア' },
              { slug: 'freelance-engineer', name: 'フリーランス' },
              { slug: 'nurse', name: '看護師' },
              { slug: 'civil-servant', name: '公務員' },
              { slug: 'teacher', name: '教員' },
              { slug: 'construction', name: '建設業' },
            ].map(occ => (
              <Link
                key={occ.slug}
                href={`/occupation/${occ.slug}/medical`}
                className="bg-white text-center py-3 px-4 rounded-lg border border-gray-100 hover:border-[#2563eb] text-sm text-[#2563eb] font-semibold hover:underline transition-all"
              >
                {occ.name} →
              </Link>
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
