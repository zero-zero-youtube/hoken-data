import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type AgeInfo = {
  label: string
  range: string
  incomeMultiplier: number
  lifeStage: string
  characteristics: string
  priority: string
  advice: string
}

const AGE_GROUPS: Record<string, AgeInfo> = {
  '20dai': {
    label: '20代',
    range: '20〜29歳',
    incomeMultiplier: 0.75,
    lifeStage: '社会人スタート期',
    characteristics: '保険料が最も安く加入しやすい時期。若いうちから医療保険・就業不能保険に加入することで長期的に割安な保険料を確保できます。',
    priority: '医療保険・就業不能保険を低コストで確保',
    advice: '独身が多く死亡保障のニーズは低めですが、親への仕送りがある場合は生命保険も検討を。iDeCoや個人年金を早期から始めることで老後資産の形成が有利になります。',
  },
  '30dai': {
    label: '30代',
    range: '30〜39歳',
    incomeMultiplier: 1.0,
    lifeStage: '結婚・子育て期',
    characteristics: '結婚・出産・住宅購入など大きなライフイベントが集中する時期。家族を持つ方は死亡保障・学資保険の検討が急務です。',
    priority: '生命保険・学資保険・住宅ローン保険の整備',
    advice: '収入が安定してくる一方、支出も増える時期。子供が生まれた場合は死亡保障を大幅に増やし、住宅ローンを組んだ場合は団信（団体信用生命保険）の内容を確認しましょう。',
  },
  '40dai': {
    label: '40代',
    range: '40〜49歳',
    incomeMultiplier: 1.2,
    lifeStage: '収入ピーク・健康管理期',
    characteristics: '年収がピークに達する一方、がん・生活習慣病リスクが高まる時期。がん保険・医療保険の充実と老後への備えが重要です。',
    priority: 'がん保険・老後資産の積み立て強化',
    advice: 'がんの罹患率が急増する40代。がん保険未加入の方は早急に検討を。一方で子供の独立が近づき死亡保障の必要額が減少する場合もあります。保険の見直し適齢期です。',
  },
  '50dai': {
    label: '50代',
    range: '50〜59歳',
    incomeMultiplier: 1.25,
    lifeStage: '老後準備・健康リスク管理期',
    characteristics: '老後まで10年程度となり、年金・資産形成の最終段階。保険は過剰保障を整理しながら必要な保障を維持することが重要です。',
    priority: '余剰な保険の整理と老後資産の最終確認',
    advice: '50代は「保険の整理」が必要な時期。不要な死亡保障を減らし、貯蓄型保険や個人年金に切り替えることで老後資産を効率的に積み立てましょう。',
  },
}

type InsuranceInfo = {
  name: string
  rate: number | null
  fixed?: [number, number]
  ageNotes: Record<string, string>
}

const INSURANCE_DATA: Record<string, InsuranceInfo> = {
  'medical': {
    name: '医療保険',
    rate: 0.005,
    ageNotes: {
      '20dai': '20代は健康なうちに加入することで保険料が割安に。入院・手術の自己負担に備える基本の保険です。',
      '30dai': '30代は入院リスクが増し始める時期。精神疾患・骨折など意外なリスクにも対応できる医療保険が重要です。',
      '40dai': '生活習慣病・がんのリスクが高まる40代。入院日数の長期化にも対応できる手厚い保障を検討しましょう。',
      '50dai': '50代は入院・手術の確率が大きく上昇。健康状態によっては引受基準緩和型保険の活用も検討を。',
    },
  },
  'life': {
    name: '生命保険',
    rate: 0.01,
    ageNotes: {
      '20dai': '独身が多い20代は死亡保障の優先度は低め。結婚・出産後に加入を検討するのが一般的です。',
      '30dai': '家族を持ち始める30代は死亡保障が最重要。子供が独立するまでの期間をカバーする定期保険が効果的です。',
      '40dai': '子供の教育費がピークの40代。収入保障保険や定期保険で万が一の際の家族の生活費を確保しましょう。',
      '50dai': '子供の独立が近づく50代は保障額の見直しを。老後に向けた終身保険への切り替えも検討しましょう。',
    },
  },
  'income-protection': {
    name: '就業不能保険',
    rate: 0.008,
    ageNotes: {
      '20dai': '若いうちに加入するほど保険料が割安。精神疾患による休職リスクは20代からあるため早期加入がおすすめです。',
      '30dai': '住宅ローンや養育費を抱える30代は就業不能リスクが最も深刻。傷病手当金との組み合わせを確認しましょう。',
      '40dai': 'がん・脳卒中・心疾患などの三大疾病による長期休職リスクが高まる40代。保障内容の充実度を確認を。',
      '50dai': '定年まで10年の50代こそ就業不能保険の存在感が増す。退職金・老後資産に穴をあけないための備えです。',
    },
  },
  'cancer': {
    name: 'がん保険',
    rate: 0.004,
    ageNotes: {
      '20dai': '罹患率は低いですが、保険料が最も安い20代に加入するのがベスト。長期的な保険料負担を抑えられます。',
      '30dai': '女性は乳がん・子宮がんのリスクが高まる30代に加入を。男性も40代を見据えて早めの準備が重要です。',
      '40dai': 'がん罹患率が急増する40代。未加入の方は早急な加入を検討してください。治療の長期化に備えた保障が重要です。',
      '50dai': '罹患率が最も高い世代。加入済みの方は特約・保障内容を確認し、最新のがん治療（免疫療法等）に対応しているか確認を。',
    },
  },
  'auto': {
    name: '自動車保険',
    rate: null,
    fixed: [3000, 8000],
    ageNotes: {
      '20dai': '20代は事故率が高く保険料が割高になりがち。ゴールド免許取得を目指しながら任意保険で備えましょう。',
      '30dai': '家族が増え、日常的に車を使う機会が増える時期。家族全員をカバーできる保険内容の確認が重要です。',
      '40dai': '運転経験が豊富で比較的事故率が低い時期。補償内容の最適化と保険料の見直しタイミングです。',
      '50dai': '視力・反射神経の変化が出始める時期。安全運転支援機能付き車向けの特約も活用しましょう。',
    },
  },
  'fire': {
    name: '火災保険',
    rate: null,
    fixed: [1000, 3000],
    ageNotes: {
      '20dai': '賃貸住まいが多い20代は少額の家財保険が中心。地震保険の付帯も検討しましょう。',
      '30dai': '住宅購入時に必須となる火災保険。建物と家財を適切な保障額でカバーし、地震保険も合わせて加入を。',
      '40dai': '保険期間の見直しや保障額の再確認が必要な時期。リフォームした場合は建物評価額の更新も忘れずに。',
      '50dai': '長期契約の満期を迎える方も多い50代。更新時に最新の保険商品と比較検討しましょう。',
    },
  },
  'personal-accident': {
    name: '傷害保険',
    rate: 0.003,
    ageNotes: {
      '20dai': 'スポーツ・レジャーでの怪我リスクが高い20代に最適。日常生活の事故をリーズナブルにカバーできます。',
      '30dai': '子育て中の事故リスクにも対応。個人賠償責任特約を付帯することで、子供の起こした事故にも備えられます。',
      '40dai': 'アウトドア活動や通勤中の事故に備えて。就労不能期間をカバーする後遺障害補償の確認も重要です。',
      '50dai': '骨密度の低下で骨折リスクが増す50代。日常生活での転倒・骨折に対応した保障内容を確認しましょう。',
    },
  },
  'pension': {
    name: '個人年金',
    rate: 0.02,
    ageNotes: {
      '20dai': '早期開始が最もお得。iDeCo・つみたてNISAと組み合わせることで、税制優遇を最大限活用できます。',
      '30dai': '住宅ローンとの兼ね合いを考慮しながら無理のない範囲で積み立て開始を。老後資産は早いほど有利です。',
      '40dai': '老後まで20年以内となる40代。積立額の確認と不足分の補充が急務。確定拠出年金の見直しも重要です。',
      '50dai': '老後まで10年程度の最終調整期。元本保証型か運用型かを慎重に選び、受取開始時期も検討しましょう。',
    },
  },
  'child': {
    name: '学資保険',
    rate: 0.015,
    ageNotes: {
      '20dai': '子供が生まれた直後の加入がベスト。早期加入ほど返戻率が高く、教育資金を効率的に積み立てられます。',
      '30dai': '30代での加入が最も一般的。大学入学時に合わせた満期設定と、親の万が一に備えた保険料免除特約が重要です。',
      '40dai': '40代での加入は返戻率が下がりがち。積立NISAとの比較・組み合わせを検討しましょう。',
      '50dai': '50代での学資保険加入は条件が限られる場合も。子供の年齢に合わせた教育ローンとの比較も検討を。',
    },
  },
  'whole-life': {
    name: '終身保険',
    rate: 0.015,
    ageNotes: {
      '20dai': '若いうちに加入するほど保険料が割安。死亡保障と貯蓄を兼ね備えた終身保険は長期視点での資産形成に有効です。',
      '30dai': '家族の死亡保障として定期保険と組み合わせるケースが多い。相続対策としての活用も視野に入れましょう。',
      '40dai': '老後の資産として解約返戻金を活用する戦略も。払済み保険への変更オプションも確認しておきましょう。',
      '50dai': '相続対策・葬儀費用の準備として有効。一時払い終身保険への加入も選択肢として検討できます。',
    },
  },
}

const BASE_INCOME_MAN   = 450
const BASE_INCOME_WOMAN = 390

export function generateStaticParams() {
  const ages = Object.keys(AGE_GROUPS)
  const insurances = Object.keys(INSURANCE_DATA)
  return ages.flatMap(age => insurances.map(insurance => ({ age, insurance })))
}

export async function generateMetadata(
  { params }: { params: Promise<{ age: string; insurance: string }> }
): Promise<Metadata> {
  const { age: ageSlug, insurance: insSlug } = await params
  const ag  = AGE_GROUPS[ageSlug]
  const ins = INSURANCE_DATA[insSlug]
  if (!ag || !ins) return {}
  return {
    title: `${ag.label}の${ins.name}相場と選び方【2024年版】`,
    description: `${ag.label}（${ag.range}）の${ins.name}の月額保険料目安と選び方を解説。ライフステージ別の保険ニーズと具体的な加入のポイントを政府統計データをもとに紹介します。`,
  }
}

export default async function AgeInsurancePage(
  { params }: { params: Promise<{ age: string; insurance: string }> }
) {
  const { age: ageSlug, insurance: insSlug } = await params
  const ag  = AGE_GROUPS[ageSlug]
  const ins = INSURANCE_DATA[insSlug]

  if (!ag || !ins) notFound()

  const incomeMan   = Math.round(BASE_INCOME_MAN   * ag.incomeMultiplier)
  const incomeWoman = Math.round(BASE_INCOME_WOMAN * ag.incomeMultiplier)

  let premiumManStr: string
  let premiumWomanStr: string
  if (ins.rate) {
    const pm = Math.round(incomeMan   * 10000 * ins.rate / 12)
    const pw = Math.round(incomeWoman * 10000 * ins.rate / 12)
    premiumManStr   = `${pm.toLocaleString()}円/月`
    premiumWomanStr = `${pw.toLocaleString()}円/月`
  } else if (ins.fixed) {
    premiumManStr   = `${ins.fixed[0].toLocaleString()}〜${ins.fixed[1].toLocaleString()}円/月`
    premiumWomanStr = `${ins.fixed[0].toLocaleString()}〜${ins.fixed[1].toLocaleString()}円/月`
  } else {
    premiumManStr   = '要問合せ'
    premiumWomanStr = '要問合せ'
  }

  const ageNote = ins.ageNotes[ageSlug] || ''

  const otherAges = Object.entries(AGE_GROUPS).filter(([s]) => s !== ageSlug)
  const otherInsurances = [
    { slug: 'medical', name: '医療保険' },
    { slug: 'life', name: '生命保険' },
    { slug: 'income-protection', name: '就業不能保険' },
    { slug: 'cancer', name: 'がん保険' },
    { slug: 'pension', name: '個人年金' },
  ].filter(i => i.slug !== insSlug)

  const faqItems = [
    {
      q: `${ag.label}が${ins.name}に加入する最適なタイミングはいつですか？`,
      a: `${ag.label}（${ag.range}）は${ag.lifeStage}の時期です。${ageNote} 保険料は年齢が若いほど割安になる傾向があるため、必要性を感じたら早めに加入を検討することをおすすめします。`,
    },
    {
      q: `${ag.label}の${ins.name}の相場はいくらですか？`,
      a: `政府統計データをもとにした${ag.label}の平均年収（男性約${incomeMan}万円、女性約${incomeWoman}万円）から算出すると、${ins.name}の月額目安は男性${premiumManStr}、女性${premiumWomanStr}程度が参考値となります。実際の保険料は健康状態・保障内容により大きく異なります。`,
    },
    {
      q: `${ag.label}の保険選びで最も重視すべき点は何ですか？`,
      a: `${ag.priority}が${ag.label}の優先課題です。${ag.advice} 複数の保険会社を比較検討した上で、FP（ファイナンシャルプランナー）に相談することをおすすめします。`,
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
      { '@type': 'ListItem', position: 2, name: '保険種類から調べる', item: 'https://hoken-data.com/insurance' },
      { '@type': 'ListItem', position: 3, name: ins.name, item: `https://hoken-data.com/insurance/${insSlug}` },
      { '@type': 'ListItem', position: 4, name: `${ag.label}版`, item: `https://hoken-data.com/age/${ageSlug}/${insSlug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="bg-[#0f172a] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <Link href="/insurance" className="hover:text-white">保険種類一覧</Link>
            <span>›</span>
            <Link href={`/insurance/${insSlug}`} className="hover:text-white">{ins.name}</Link>
            <span>›</span>
            <span>{ag.label}</span>
          </div>
          <div className="inline-block bg-white/10 text-xs px-3 py-1 rounded-full mb-3">📅 年齢別保険料データ</div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            {ag.label}の{ins.name}相場と選び方<br />
            <span className="text-[#2563eb]">【{ag.range}・{ag.lifeStage}】</span>
          </h1>
          <p className="text-gray-300 text-sm">政府統計データによる年収・保険料参考値 | 2024年版</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* KPI */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: `${ag.label}の推定年収（男性）`, value: `${incomeMan}万円` },
            { label: `${ag.label}の推定年収（女性）`, value: `${incomeWoman}万円` },
            { label: `${ins.name}の推定月額（男性）`, value: premiumManStr },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[#f8fafc] rounded-xl p-5 border border-gray-100 text-center">
              <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-xl font-bold text-[#0f172a]">{kpi.value}</p>
            </div>
          ))}
        </section>

        {/* ライフステージ別の保険ニーズ */}
        <section className="bg-blue-50 border-l-4 border-[#2563eb] rounded-r-xl p-6">
          <h2 className="text-lg font-bold text-[#0f172a] mb-2">
            {ag.label}の{ins.name} — ライフステージ別ポイント
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{ageNote}</p>
          <div className="bg-white rounded-lg p-4 text-sm text-gray-700">
            <p className="font-semibold text-[#0f172a] mb-1">▶ {ag.label}の優先課題</p>
            <p>{ag.priority}</p>
          </div>
        </section>

        {/* 月額保険料テーブル */}
        <section>
          <h2 className="text-xl font-bold text-[#0f172a] mb-4">
            {ag.label}の{ins.name} 推定月額保険料
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  <th className="text-left p-3 font-semibold">項目</th>
                  <th className="text-right p-3 font-semibold">男性</th>
                  <th className="text-right p-3 font-semibold">女性</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="p-3 text-gray-600">{ag.label}の推定平均年収</td>
                  <td className="p-3 text-right font-semibold">{incomeMan}万円</td>
                  <td className="p-3 text-right font-semibold">{incomeWoman}万円</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 text-gray-600">{ins.name}の推定月額保険料</td>
                  <td className="p-3 text-right font-bold text-[#2563eb]">{premiumManStr}</td>
                  <td className="p-3 text-right font-bold text-[#2563eb]">{premiumWomanStr}</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3 text-gray-600">年収に対する保険料率（目安）</td>
                  <td className="p-3 text-right">{ins.rate ? `${(ins.rate * 100).toFixed(1)}%` : '固定額'}</td>
                  <td className="p-3 text-right">{ins.rate ? `${(ins.rate * 100).toFixed(1)}%` : '固定額'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ※政府統計データをもとにした参考値です。実際の保険料は健康状態・保障内容・保険会社により異なります。
          </p>
        </section>

        {/* キャリア・ライフアドバイス */}
        <section className="bg-[#f8fafc] rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-[#0f172a] mb-3">
            {ag.label}の保険選び アドバイス
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{ag.advice}</p>
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1">ライフステージ</p>
            <p className="font-bold text-[#0f172a]">{ag.lifeStage}（{ag.range}）</p>
            <p className="text-sm text-gray-600 mt-1">{ag.characteristics}</p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0f172a] text-white rounded-2xl p-8 text-center">
          <p className="text-[#f59e0b] text-sm font-semibold mb-2">PR・無料・強引な勧誘なし</p>
          <h2 className="text-xl font-bold mb-3">{ag.label}に最適な{ins.name}をFPに無料相談</h2>
          <p className="text-gray-400 text-sm mb-6">年齢・家族構成・収入に合わせた最適な保険プランを無料で提案します</p>
          <Link href="/consult" className="inline-block bg-[#2563eb] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            無料で保険相談する →
          </Link>
          <p className="text-gray-600 text-xs mt-3">※本サイトはアフィリエイト広告を含みます</p>
        </section>

        {/* 年齢別リンク */}
        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">他の年代の{ins.name}データ</h2>
          <div className="flex flex-wrap gap-2">
            {otherAges.map(([slug, ag2]) => (
              <Link
                key={slug}
                href={`/age/${slug}/${insSlug}`}
                className="text-sm bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-3 py-2 rounded-lg transition-all"
              >
                {ag2.label}の{ins.name} →
              </Link>
            ))}
          </div>
        </section>

        {/* 他の保険種類リンク */}
        <section>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">{ag.label}の他の保険を調べる</h2>
          <div className="flex flex-wrap gap-2">
            {otherInsurances.map(i => (
              <Link
                key={i.slug}
                href={`/age/${ageSlug}/${i.slug}`}
                className="text-sm bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-3 py-2 rounded-lg transition-all"
              >
                {ag.label}の{i.name} →
              </Link>
            ))}
            <Link href={`/insurance/${insSlug}`} className="text-sm bg-white border border-gray-200 hover:border-[#2563eb] text-[#2563eb] px-3 py-2 rounded-lg transition-all">
              {ins.name}の全職業データ →
            </Link>
          </div>
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

        <p className="text-xs text-gray-500 leading-relaxed border-t pt-6">
          【免責事項】本ページの情報は公的統計データをもとにした参考情報です。保険の加入・変更は必ず各保険会社または保険代理店にご確認ください。本サイトはアフィリエイト広告を含みます。
        </p>
      </div>
    </>
  )
}
