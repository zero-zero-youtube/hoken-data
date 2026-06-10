import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '医療保険の選び方【職業別・年齢別の適正保険料】2023年版',
  description: '医療保険の選び方を職業別・年齢別に解説。フリーランス・会社員・公務員それぞれの必要性と推奨月額保険料の目安を政府統計データをもとに紹介します。',
}

const faqItems = [
  {
    q: '医療保険は公的保険（健康保険）があれば不要ですか？',
    a: '公的医療保険でカバーできない費用（差額ベッド代・先進医療・入院中の収入減少など）は自己負担になります。特にフリーランスや自営業は傷病手当金がなく、就業できない期間の収入保障が必要なため、医療保険の役割は大きくなります。',
  },
  {
    q: '医療保険はいつ加入するのがベストですか？',
    a: '若くて健康なうちに加入するほど保険料が安く、健康状態による加入制限も受けにくいです。20〜30代での加入が最もコストパフォーマンスが高く、病気になってからでは加入できない場合もあるため、早めの検討をおすすめします。',
  },
  {
    q: '入院日額と実損填補型、どちらを選ぶべきですか？',
    a: '入院日額型は定額の給付金が受け取れるシンプルな仕組みで、実際の入院費より多く受け取れる場合もあります。実損填補型は実際にかかった費用をカバーするため過不足が少ない反面、保険料が高めの傾向があります。近年は実損填補型の人気が高まっています。',
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

      {/* ヘッダー */}
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
          <p className="text-gray-300 text-sm">政府統計データに基づく2023年版ガイド</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-14">

        {/* 医療保険とは */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            医療保険とは
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4">
            <p>
              医療保険は、病気や怪我で入院・手術が必要になった際に保険金が支払われる保険です。日本には公的医療保険（健康保険・国民健康保険）がありますが、それだけではカバーできない費用が存在します。
            </p>
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
              <p className="font-semibold text-[#0f172a] mb-3">公的医療保険でカバーできない主な費用</p>
              <ul className="space-y-2 text-sm">
                {[
                  '差額ベッド代（個室・2人部屋の追加料金）',
                  '食事代（1食460円の自己負担）',
                  '先進医療・自由診療の費用',
                  '入院中の収入減少（特にフリーランス・自営業）',
                  '長期入院による生活費の不足',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold flex-shrink-0">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 職業別の必要性 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            職業別に見る医療保険の必要性
          </h2>
          <div className="space-y-4">
            {[
              {
                title: 'フリーランス・自営業（最重要）',
                priority: '必須',
                priorityColor: 'bg-red-100 text-red-700',
                desc: '会社員と異なり「傷病手当金」がありません。病気・怪我で働けなくなると収入がゼロになります。医療保険に加えて収入保障保険との組み合わせが特に重要です。',
                link: '/occupation/freelance-engineer/medical',
                linkText: 'フリーランスエンジニアの医療保険相場 →',
              },
              {
                title: '会社員・正社員',
                priority: '重要',
                priorityColor: 'bg-orange-100 text-orange-700',
                desc: '傷病手当金（最大18ヶ月・給与の約2/3）がありますが、長期入院の際の追加費用や差額ベッド代等は自己負担です。団体保険の内容を確認した上で不足分を補完しましょう。',
                link: '/occupation/engineer/medical',
                linkText: 'システムエンジニアの医療保険相場 →',
              },
              {
                title: '公務員・教員',
                priority: '推奨',
                priorityColor: 'bg-green-100 text-green-700',
                desc: '公務員は共済組合の保障が手厚く、傷病手当金も長期間支給されます。基本的な医療費はカバーされますが、個室入院や先進医療への備えとして民間医療保険を上乗せするのが効果的です。',
                link: '/occupation/civil-servant/medical',
                linkText: '公務員の医療保険相場 →',
              },
              {
                title: '医療・看護師',
                priority: '重要',
                priorityColor: 'bg-orange-100 text-orange-700',
                desc: '感染リスクや体力的負担が大きい職業です。業務上の感染症・腰痛・燃え尽き症候群による休職リスクがあるため、医療保険と就業不能保険の組み合わせが重要です。',
                link: '/occupation/nurse/medical',
                linkText: '看護師の医療保険相場 →',
              },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-bold text-[#0f172a]">{item.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.priorityColor}`}>{item.priority}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{item.desc}</p>
                <Link href={item.link} className="text-[#2563eb] text-xs font-semibold hover:underline">{item.linkText}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* 年齢別推奨保険料 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            年齢別の推奨月額保険料目安
          </h2>
          <p className="text-xs text-gray-500 mb-4">※一般的な健康状態・標準的な保障内容を想定した参考値です。</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="text-left p-3">年齢</th>
                  <th className="text-right p-3">男性 目安</th>
                  <th className="text-right p-3">女性 目安</th>
                  <th className="text-right p-3">ポイント</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { age: '20〜29歳', man: '1,500〜2,500円', woman: '2,000〜3,500円', point: '低コスト・早期加入が有利' },
                  { age: '30〜39歳', man: '2,000〜3,500円', woman: '2,500〜4,500円', point: '結婚・出産を機に見直し' },
                  { age: '40〜49歳', man: '3,000〜5,000円', woman: '3,500〜6,000円', point: 'がん特約追加を検討' },
                  { age: '50〜59歳', man: '4,500〜7,500円', woman: '5,000〜8,000円', point: '保障内容の充実が重要' },
                  { age: '60〜69歳', man: '6,000〜12,000円', woman: '6,500〜11,000円', point: '更新型は保険料上昇に注意' },
                ].map((row, i) => (
                  <tr key={row.age} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                    <td className="p-3 font-medium">{row.age}</td>
                    <td className="p-3 text-right">{row.man}</td>
                    <td className="p-3 text-right">{row.woman}</td>
                    <td className="p-3 text-right text-xs text-gray-500">{row.point}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 選ぶ3つのポイント */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            医療保険を選ぶ3つのポイント
          </h2>
          <div className="space-y-4">
            {[
              {
                num: '01',
                title: '入院日額 or 実損填補型かを決める',
                desc: '入院日額型（5,000〜10,000円/日）はシンプルで計算しやすく、実際の費用より多く受け取れることも。実損填補型は実際にかかった費用をカバーするため過不足が少ない。近年は実損填補型が増加傾向。',
              },
              {
                num: '02',
                title: '終身型 vs 定期型で選ぶ',
                desc: '終身型は保険料が一生涯変わらず、長期で見るとお得になりやすい。定期型は保険料が安いが、更新時に保険料が上がる場合が多い。若いうちに終身型に加入するのが一般的にコスト効率が良い。',
              },
              {
                num: '03',
                title: '特約の過不足をチェック',
                desc: '先進医療特約・がん特約・三大疾病特約など、オプションが豊富。付けすぎると保険料が高くなりすぎるため、職業・年齢・家族構成に合わせて必要な特約だけを選ぶことが重要。',
              },
            ].map(point => (
              <div key={point.num} className="flex gap-4 bg-[#f8fafc] rounded-xl p-5 border border-gray-100">
                <span className="text-3xl font-bold text-[#2563eb] opacity-30 flex-shrink-0 leading-none">{point.num}</span>
                <div>
                  <h3 className="font-bold text-[#0f172a] mb-2">{point.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{point.desc}</p>
                </div>
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
              { slug: 'sales', name: '営業職' },
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
        <section className="bg-[#0f172a] text-white rounded-2xl p-8 text-center">
          <p className="text-[#f59e0b] text-sm font-semibold mb-2">PR・無料・強引な勧誘なし</p>
          <h2 className="text-xl font-bold mb-3">自分に合った医療保険をプロに相談</h2>
          <p className="text-gray-400 text-sm mb-6">複数の保険会社を比較して、最適な保険を提案してもらえます</p>
          <Link href="/simulator" className="inline-block bg-[#2563eb] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            無料で保険相談する →
          </Link>
          <p className="text-gray-600 text-xs mt-3">※本サイトはアフィリエイト広告を含みます</p>
        </section>

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

        {/* 免責事項 */}
        <p className="text-xs text-gray-500 leading-relaxed border-t pt-6">
          【免責事項】本ページの保険料は公的統計データを基にした推計参考値です。実際の保険料は保険会社・年齢・健康状態・契約内容により大きく異なります。保険の加入・変更は必ず各保険会社または保険代理店にご確認ください。
        </p>
      </div>
    </>
  )
}
