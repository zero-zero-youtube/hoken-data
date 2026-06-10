import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateCTA from '@/components/AffiliateCTA'

export const metadata: Metadata = {
  title: '職業別おすすめ保険の選び方【20職業の保険ニーズを解説】2025年版',
  description: 'IT・フリーランス・医療・公務員・製造業など職業別に必要な保険と選び方を解説。なぜ職業によって保険が違うのか、転職時の見直しポイントまで政府統計データをもとに紹介。',
}

const faqItems = [
  {
    q: '職業によって必要な保険はどのくらい違いますか？',
    a: '大きく異なります。たとえばフリーランスは傷病手当金がないため就業不能保険が必須ですが、公務員は共済組合の保障が手厚いため民間保険の優先度が下がります。建設業・運輸業は怪我リスクが高く傷害保険が重要、医療職は感染リスクがある等、職業によってリスクの種類と大きさが異なります。',
  },
  {
    q: '転職したら保険は見直すべきですか？',
    a: 'はい、転職時には必ず保険の見直しをおすすめします。会社員からフリーランスになると傷病手当金がなくなるため就業不能保険が必要になります。逆に自営業から会社員になると、勤務先の団体保険を活用できる場合があります。また、年収が大きく変わった場合も死亡保障額の見直しが必要です。',
  },
  {
    q: '複数の職業に当てはまる場合はどうすればいいですか？',
    a: '主な就業形態（正社員・フリーランス等）と実際の業務内容の両方を考慮してください。副業がある場合は、本業と副業の両方のリスクを考えた上で保険を選ぶ必要があります。複合的なケースはFP（ファイナンシャルプランナー）への相談が最も確実です。',
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
    { '@type': 'ListItem', position: 3, name: '職業別おすすめ保険', item: 'https://hoken-data.com/guide/insurance-by-occupation' },
  ],
}

export default function InsuranceByOccupationGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <Link href="/guide" className="hover:text-white">ガイド</Link>
            <span>›</span>
            <span>職業別おすすめ保険</span>
          </div>
          <div className="inline-block bg-white/10 text-xs px-3 py-1 rounded-full mb-3">📋 職業別保険ガイド</div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            職業別おすすめ保険の選び方<br />
            <span className="text-[#2563eb]">【20職業の保険ニーズを解説】</span>
          </h1>
          <p className="text-gray-300 text-sm">2025年最新版 – 職業ごとのリスクに合った保険を選ぼう</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-14">

        {/* 目次 */}
        <nav className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
          <p className="font-bold text-[#0f172a] text-sm mb-3">📋 この記事の目次</p>
          <ol className="space-y-1.5 text-sm text-[#2563eb]">
            {[
              'なぜ職業によって必要な保険が違うのか',
              '職業別リスクマップ（IT・医療・建設・公務員・フリーランス）',
              '会社員 vs フリーランスの保険の考え方の根本的な違い',
              '職業別おすすめ保険の組み合わせ（5職業×推奨保険）',
              '転職時の保険見直しタイミングと注意点',
              '職業別の平均保険料データ（政府統計より）',
            ].map((title, i) => (
              <li key={i}><span className="text-gray-400 mr-2">{i + 1}.</span>{title}</li>
            ))}
          </ol>
        </nav>

        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            1. なぜ職業によって必要な保険が違うのか
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              保険は「リスクへの備え」ですが、職業によってリスクの種類・大きさは大きく異なります。また、職業によって利用できる公的保険制度も変わるため、同じ保障額の保険でも「過剰」になる職業と「不足」になる職業が生じます。
            </p>
            <p>
              例えば公務員は共済組合の手厚い保障があるため、民間保険の必要性は相対的に低くなります。一方フリーランスは傷病手当金がなく、就業不能になった途端に収入がゼロになるため、民間保険への依存度が高くなります。
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="font-bold text-blue-900 mb-3">保険設計を左右する3つの職業特性</p>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li><strong>① 雇用形態</strong>：会社員/フリーランス/公務員で利用できる公的給付が大きく異なる</li>
                <li><strong>② 職業リスク</strong>：体を使う仕事は怪我リスクが高く、IT・医療は精神疾患リスクが高い</li>
                <li><strong>③ 収入水準</strong>：収入が高いほど同じ保障割合でも必要保障額が大きくなる</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              出典：
              <a href="https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2023/index.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                厚生労働省「賃金構造基本統計調査」2023年
              </a>
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            2. 職業別リスクマップ
          </h2>
          <div className="overflow-x-auto text-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="text-left p-3">職業群</th>
                  <th className="text-center p-3">入院リスク</th>
                  <th className="text-center p-3">収入途絶リスク</th>
                  <th className="text-center p-3">精神疾患リスク</th>
                  <th className="text-left p-3">最重要保険</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { group: 'IT・フリーランス', hospital: '中', income: '高（公的給付なし）', mental: '高', key: '就業不能保険' },
                  { group: '医療・看護師', hospital: '高（感染症）', income: '中', mental: '高', key: '就業不能保険＋医療保険' },
                  { group: '公務員・教員', hospital: '低〜中', income: '低（共済保障あり）', mental: '中', key: '個人年金・上乗せ医療' },
                  { group: '建設・製造業', hospital: '高（怪我）', income: '中', mental: '低', key: '傷害保険＋就業不能保険' },
                  { group: '営業・管理職', hospital: '中', income: '中', mental: '高', key: '医療保険＋がん保険' },
                ].map((row, i) => (
                  <tr key={row.group} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                    <td className="p-3 font-medium">{row.group}</td>
                    <td className="p-3 text-center">{row.hospital}</td>
                    <td className="p-3 text-center">{row.income}</td>
                    <td className="p-3 text-center">{row.mental}</td>
                    <td className="p-3 text-[#2563eb] font-semibold text-xs">{row.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            3. 会社員 vs フリーランスの保険の考え方の根本的な違い
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              会社員とフリーランスでは、使える公的セーフティーネットが大きく異なります。この差を理解せずに同じ感覚で保険を選ぶと、会社員は「過剰な保険料」を、フリーランスは「致命的な保険の空白」を抱えることになります。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <p className="font-bold text-blue-800 mb-3">会社員の保険設計の基本方針</p>
                <ul className="space-y-2 text-blue-700 text-xs">
                  <li>① まず会社の団体保険・傷病手当金を確認</li>
                  <li>② 不足分だけを民間保険で補う</li>
                  <li>③ 差額ベッド代・先進医療特約は費用対効果が高い</li>
                  <li>④ 老後の個人年金・iDeCoを優先的に検討</li>
                </ul>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                <p className="font-bold text-indigo-800 mb-3">フリーランスの保険設計の基本方針</p>
                <ul className="space-y-2 text-indigo-700 text-xs">
                  <li>① 就業不能保険が最優先（傷病手当金なし）</li>
                  <li>② 医療保険で入院リスクをカバー</li>
                  <li>③ 国民年金のみで老後は不足→個人年金必須</li>
                  <li>④ 遺族がいる場合は収入保障保険も必要</li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
              <strong>重要：</strong>フリーランスが会社員と同じ感覚で「保険は最低限でいい」と考えると、就業不能時に即座に生活が破綻するリスクがあります。公的給付の差を必ず確認してください。
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            4. 職業別おすすめ保険の組み合わせ（5職業）
          </h2>
          <div className="space-y-4">
            {[
              {
                title: 'フリーランスエンジニア・デザイナー',
                icon: '💻',
                color: 'border-blue-300 bg-blue-50',
                titleColor: 'text-blue-800',
                priority: '就業不能保険が最優先',
                desc: '傷病手当金がなく、病気・怪我で収入が即ゼロになります。就業不能保険（月給付金：生活費の50〜60%相当）と医療保険を組み合わせるのが基本設計です。老後は国民年金のみで不足するため個人年金も検討しましょう。精神疾患特約は必ず確認してください。',
                needs: ['就業不能保険（◎必須）', '医療保険（◎必須）', '個人年金（◯推奨）', '収入保障保険（家族持ちは必須）'],
                links: [
                  { slug: 'freelance-engineer', name: 'フリーランスエンジニア' },
                  { slug: 'designer', name: 'デザイナー' },
                ],
              },
              {
                title: '看護師・医療従事者',
                icon: '🏥',
                color: 'border-red-300 bg-red-50',
                titleColor: 'text-red-800',
                priority: '感染リスク・精神疾患リスクに備える',
                desc: '業務上の感染症リスク、腰痛、燃え尽き症候群（バーンアウト）による休職リスクが高い職業です。医療保険に加えて就業不能保険での備えが重要です。また看護師は夜勤手当込みの収入が高い一方、体力的限界による転職・収入ダウンリスクも考慮が必要です。',
                needs: ['医療保険（◎必須）', '就業不能保険（◎必須）', '傷害保険（◯推奨）', '個人年金（老後資産）'],
                links: [
                  { slug: 'nurse', name: '看護師' },
                  { slug: 'doctor', name: '医師' },
                  { slug: 'pharmacist', name: '薬剤師' },
                ],
              },
              {
                title: '地方公務員・教員',
                icon: '🏛️',
                color: 'border-green-300 bg-green-50',
                titleColor: 'text-green-800',
                priority: '手厚い共済保障を活かした上乗せ設計',
                desc: '共済組合の保障が手厚く、長期の傷病手当金や退職後の年金もある程度確保されています。民間保険は重複を避けて上乗せに特化し、保険料を抑えながら老後資産を積み立てるのが効果的です。個人年金・終身保険での資産形成を優先しましょう。',
                needs: ['個人年金（◎推奨）', '終身保険（◯推奨）', '医療保険（補完的に）', '火災保険（持ち家の場合）'],
                links: [
                  { slug: 'civil-servant', name: '地方公務員' },
                  { slug: 'teacher', name: '教員・教師' },
                ],
              },
              {
                title: '建設業・製造業（現場作業員）',
                icon: '🏗️',
                color: 'border-yellow-300 bg-yellow-50',
                titleColor: 'text-yellow-800',
                priority: '怪我・事故リスクへの手厚い備え',
                desc: '業務中の怪我リスクが高く、労災保険だけでは不十分な場合があります。傷害保険・就業不能保険による上乗せが重要です。体を使う仕事は年齢とともに体力限界が来ることも多く、早めの老後資産の積み立ても大切です。労災特別加入の活用も検討しましょう。',
                needs: ['傷害保険（◎必須）', '就業不能保険（◎必須）', '医療保険（◯推奨）', '個人年金（早めに開始）'],
                links: [
                  { slug: 'construction', name: '建設業・現場作業員' },
                  { slug: 'manufacturing', name: '製造業・工場勤務' },
                ],
              },
              {
                title: '営業職・管理職',
                icon: '💼',
                color: 'border-purple-300 bg-purple-50',
                titleColor: 'text-purple-800',
                priority: '生活習慣病・精神疾患リスクに備える',
                desc: '営業職・管理職はストレスが多く、高血圧・糖尿病・うつ病などのリスクが高い職業です。医療保険・がん保険での備えと、高い収入を維持できなくなった際の収入保障が重要です。40代以降はがんリスクが特に高まるため、がん保険の追加を検討してください。',
                needs: ['医療保険（◎必須）', 'がん保険（◯推奨）', '生命保険（家族持ちは必須）', '収入保障保険（◯推奨）'],
                links: [
                  { slug: 'sales', name: '営業職' },
                  { slug: 'manager', name: '会社管理職・部長職' },
                  { slug: 'finance', name: '金融・保険業' },
                ],
              },
            ].map(group => (
              <section key={group.title}>
                <div className={`border-l-4 rounded-r-xl p-6 ${group.color}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{group.icon}</span>
                    <div>
                      <h3 className={`text-lg font-bold ${group.titleColor}`}>{group.title}</h3>
                      <p className="text-sm font-semibold text-gray-600 mt-0.5">👉 {group.priority}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{group.desc}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {group.needs.map(need => (
                      <div key={need} className="bg-white rounded-lg px-3 py-2 text-xs text-gray-700 border border-gray-100">{need}</div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.links.map(link => (
                      <Link
                        key={link.slug}
                        href={`/occupation/${link.slug}`}
                        className="text-xs bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-3 py-1.5 rounded-lg font-semibold hover:underline transition-all"
                      >
                        {link.name}の保険相場 →
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            5. 転職時の保険見直しタイミングと注意点
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              転職は保険を見直す絶好のタイミングです。雇用形態が変わると公的給付の内容も変わるため、必ず転職前後に保険内容を確認してください。
            </p>
            <div className="space-y-3">
              {[
                {
                  title: '会社員 → フリーランス（最も注意が必要）',
                  color: 'bg-red-50 border-red-200',
                  titleColor: 'text-red-800',
                  items: [
                    '傷病手当金がなくなる→就業不能保険を早急に加入',
                    '健康保険が社会保険→国民健康保険に変わる（保険料上昇）',
                    '厚生年金→国民年金のみになる（老後の備えが必要）',
                    '団体保険の適用が終わる→民間保険で補完が必要',
                  ],
                },
                {
                  title: '会社員同士の転職（収入が大きく変わる場合）',
                  color: 'bg-yellow-50 border-yellow-200',
                  titleColor: 'text-yellow-800',
                  items: [
                    '年収が上がった場合→死亡保障額の引き上げを検討',
                    '年収が下がった場合→保険料の見直し・減額を検討',
                    '新勤務先の団体保険の内容を確認する',
                    '職種が変わった場合→リスクが変わるため保険種類の見直しも必要',
                  ],
                },
                {
                  title: 'フリーランス → 会社員（保険の整理チャンス）',
                  color: 'bg-green-50 border-green-200',
                  titleColor: 'text-green-800',
                  items: [
                    '傷病手当金が使えるようになる→就業不能保険の減額・解約を検討',
                    '団体保険を確認して重複している民間保険を整理',
                    '厚生年金加入で老後保障が改善→個人年金の見直し',
                  ],
                },
              ].map(item => (
                <div key={item.title} className={`border rounded-xl p-5 ${item.color}`}>
                  <p className={`font-bold mb-2 ${item.titleColor}`}>{item.title}</p>
                  <ul className="space-y-1 text-gray-700 text-xs">
                    {item.items.map(i => <li key={i}>・{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-5 pb-2 border-b-2 border-[#2563eb]">
            6. 職業別の平均保険料データ（政府統計より）
          </h2>
          <div className="text-gray-700 leading-relaxed space-y-4 text-sm">
            <p>
              生命保険文化センター「生命保険に関する全国実態調査」（2022年）によると、世帯年間保険料の平均は37.1万円（月換算約3.1万円）です。ただし職業・家族構成・年収によって大きく異なります。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    <th className="text-left p-3">職業</th>
                    <th className="text-right p-3">月額保険料目安</th>
                    <th className="text-left p-3">主な理由</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { occ: 'フリーランスエンジニア', monthly: '1.5〜3万円', reason: '就業不能保険・医療保険・個人年金の組み合わせ' },
                    { occ: 'システムエンジニア（会社員）', monthly: '8,000〜1.5万円', reason: '団体保険で補完・上乗せ設計' },
                    { occ: '看護師', monthly: '1〜2万円', reason: '就業不能保険・感染症対応の医療保険' },
                    { occ: '地方公務員', monthly: '5,000〜1万円', reason: '共済保障が充実・民間は最小限' },
                    { occ: '建設業・現場作業員', monthly: '1.2〜2.5万円', reason: '傷害保険・就業不能保険が中心' },
                    { occ: '医師', monthly: '2〜4万円', reason: '高収入に見合った高額死亡保障' },
                  ].map((row, i) => (
                    <tr key={row.occ} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                      <td className="p-3 font-medium">{row.occ}</td>
                      <td className="p-3 text-right font-bold text-[#0f172a]">{row.monthly}</td>
                      <td className="p-3 text-xs text-gray-500">{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              ※参考値。実際の保険料は年齢・健康状態・保障内容によって大きく異なります。
              出典：
              <a href="https://www.jili.or.jp/research/report/chousa2022.html" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline">
                生命保険文化センター「生命保険に関する全国実態調査」2022年
              </a>
            </p>
          </div>
        </section>

        {/* 全職業一覧 */}
        <section className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100 text-center">
          <h2 className="text-lg font-bold text-[#0f172a] mb-3">全20職業の保険料相場を調べる</h2>
          <p className="text-sm text-gray-500 mb-5">職業を選んで、医療保険・生命保険・収入保障など10種類の保険料目安を確認できます</p>
          <Link href="/occupation" className="inline-block bg-[#2563eb] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            職業一覧を見る →
          </Link>
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
