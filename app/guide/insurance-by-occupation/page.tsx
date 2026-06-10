import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateCTA from '@/components/AffiliateCTA'

export const metadata: Metadata = {
  title: '職業別おすすめ保険の選び方【20職業の保険ニーズを解説】2023年版',
  description: 'IT・フリーランス・医療・公務員・製造業など20職業別に必要な保険と選び方を解説。職業ごとのリスクに合った適切な保険を政府統計データをもとに紹介します。',
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

const occupationGroups = [
  {
    title: 'IT系・フリーランスの保険選び',
    icon: '💻',
    color: 'border-blue-300 bg-blue-50',
    titleColor: 'text-blue-800',
    priority: '就業不能保険が最優先',
    desc: 'フリーランスエンジニアは傷病手当金がなく、病気・怪我で収入が即ゼロになります。医療保険と就業不能保険を軸に、老後の個人年金も検討しましょう。会社員エンジニアは団体保険の内容を確認しつつ、不足分を補完します。',
    needs: ['就業不能保険（◎必須）', '医療保険（◎必須）', '個人年金（◯推奨）', '生命保険（家族がいる場合）'],
    links: [
      { slug: 'freelance-engineer', name: 'フリーランスエンジニア' },
      { slug: 'engineer', name: 'システムエンジニア' },
      { slug: 'designer', name: 'デザイナー' },
    ],
  },
  {
    title: '医療・看護師の保険選び',
    icon: '🏥',
    color: 'border-red-300 bg-red-50',
    titleColor: 'text-red-800',
    priority: '感染リスク・体力的負担に備える',
    desc: '医療従事者は業務上の感染症リスクが高く、腰痛や精神的ストレスによる休職リスクもあります。医療保険に加えて就業不能保険での備えが重要。看護師は夜勤手当込みの収入が高い一方、体力的限界による転職リスクも考慮が必要です。',
    needs: ['医療保険（◎必須）', '就業不能保険（◎必須）', '傷害保険（◯推奨）', '老後資産（個人年金）'],
    links: [
      { slug: 'nurse', name: '看護師' },
      { slug: 'doctor', name: '医師' },
      { slug: 'pharmacist', name: '薬剤師' },
    ],
  },
  {
    title: '公務員・教員の保険選び',
    icon: '🏛️',
    color: 'border-green-300 bg-green-50',
    titleColor: 'text-green-800',
    priority: '手厚い共済保障を活かした上乗せ設計',
    desc: '公務員・教員は共済組合の保障が手厚く、長期の傷病手当金や退職後の年金もある程度確保されています。民間保険は重複を避けて上乗せに特化し、保険料を抑えながら老後資産を積み立てるのが効果的です。',
    needs: ['個人年金（◎推奨）', '終身保険（◯推奨）', '医療保険（補完的に）', '火災保険（持ち家の場合）'],
    links: [
      { slug: 'civil-servant', name: '地方公務員' },
      { slug: 'teacher', name: '教員・教師' },
    ],
  },
  {
    title: '製造業・建設業の保険選び',
    icon: '🏗️',
    color: 'border-yellow-300 bg-yellow-50',
    titleColor: 'text-yellow-800',
    priority: '怪我・事故リスクが高い職業',
    desc: '製造業・建設業は業務中の怪我リスクが高く、労災保険だけでは不十分な場合があります。傷害保険・就業不能保険による上乗せが重要。体を使う仕事は年齢とともに体力限界が来ることも多く、早めの老後資産の積み立ても大切です。',
    needs: ['傷害保険（◎必須）', '就業不能保険（◎必須）', '医療保険（◯推奨）', '個人年金（早めに）'],
    links: [
      { slug: 'construction', name: '建設業・現場作業員' },
      { slug: 'manufacturing', name: '製造業・工場勤務' },
    ],
  },
  {
    title: '営業職・管理職の保険選び',
    icon: '💼',
    color: 'border-purple-300 bg-purple-50',
    titleColor: 'text-purple-800',
    priority: '収入に見合った死亡保障と生活習慣病対策',
    desc: '営業職・管理職はストレスが多く、生活習慣病（高血圧・糖尿病等）のリスクが高い職業です。医療保険・がん保険での備えと、高い収入を維持できなくなった際の収入保障が重要です。管理職は家族の生活費をカバーできる死亡保障も必要です。',
    needs: ['医療保険（◎必須）', 'がん保険（◯推奨）', '生命保険（家族持ちは必須）', '収入保障保険（◯推奨）'],
    links: [
      { slug: 'sales', name: '営業職' },
      { slug: 'manager', name: '会社管理職・部長職' },
      { slug: 'finance', name: '金融・保険業' },
    ],
  },
]

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
          <p className="text-gray-300 text-sm">2023年最新版 – 職業ごとのリスクに合った保険を選ぼう</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* 職業グループ別解説 */}
        {occupationGroups.map(group => (
          <section key={group.title}>
            <div className={`border-l-4 rounded-r-xl p-6 ${group.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{group.icon}</span>
                <div>
                  <h2 className={`text-xl font-bold ${group.titleColor}`}>{group.title}</h2>
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

        {/* 全職業一覧へのリンク */}
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
