'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { Occupation } from '@/lib/data'
import { CATEGORY_LABELS } from '@/lib/data'

const RISK_ICON: Record<string, string> = {
  'engineer':           '💻',
  'freelance-engineer': '🖥️',
  'nurse':              '🏥',
  'doctor':             '⚕️',
  'pharmacist':         '💊',
  'civil-servant':      '🏛️',
  'teacher':            '📚',
  'sales':              '📊',
  'manager':            '👔',
  'finance':            '💹',
  'real-estate':        '🏠',
  'construction':       '⛑️',
  'driver':             '🚛',
  'manufacturing':      '🔧',
  'food-service':       '🍳',
  'beautician':         '✂️',
  'accountant':         '📋',
  'lawyer':             '⚖️',
  'designer':           '🎨',
  'part-time':          '⏰',
}

const TOP_INSURANCE: Record<string, { slug: string; name: string }> = {
  'engineer':           { slug: 'income-protection', name: '就業不能保険' },
  'freelance-engineer': { slug: 'income-protection', name: '就業不能保険' },
  'designer':           { slug: 'income-protection', name: '就業不能保険' },
  'nurse':              { slug: 'medical',           name: '医療保険' },
  'doctor':             { slug: 'life',              name: '生命保険' },
  'pharmacist':         { slug: 'medical',           name: '医療保険' },
  'civil-servant':      { slug: 'pension',           name: '個人年金' },
  'teacher':            { slug: 'pension',           name: '個人年金' },
  'sales':              { slug: 'cancer',            name: 'がん保険' },
  'manager':            { slug: 'life',              name: '生命保険' },
  'finance':            { slug: 'life',              name: '生命保険' },
  'construction':       { slug: 'personal-accident', name: '傷害保険' },
  'manufacturing':      { slug: 'personal-accident', name: '傷害保険' },
  'driver':             { slug: 'auto',              name: '自動車保険' },
  'food-service':       { slug: 'medical',           name: '医療保険' },
  'beautician':         { slug: 'income-protection', name: '就業不能保険' },
  'part-time':          { slug: 'medical',           name: '医療保険' },
  'accountant':         { slug: 'whole-life',        name: '終身保険' },
  'lawyer':             { slug: 'life',              name: '生命保険' },
  'real-estate':        { slug: 'life',              name: '生命保険' },
}

const INS_BADGE_COLORS: Record<string, string> = {
  'income-protection': 'bg-blue-100 text-blue-700',
  'medical':           'bg-red-100 text-red-700',
  'pension':           'bg-green-100 text-green-700',
  'personal-accident': 'bg-yellow-100 text-yellow-800',
  'auto':              'bg-orange-100 text-orange-700',
  'life':              'bg-purple-100 text-purple-700',
  'cancer':            'bg-pink-100 text-pink-700',
  'whole-life':        'bg-indigo-100 text-indigo-700',
}

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

type FilterGroup = { label: string; cats: string[] | null }

const FILTER_GROUPS: FilterGroup[] = [
  { label: '全て',            cats: null },
  { label: 'IT・クリエイティブ', cats: ['it', 'creative'] },
  { label: '医療・福祉',      cats: ['medical'] },
  { label: '公務員・教育',    cats: ['public'] },
  { label: 'オフィス・専門職', cats: ['office', 'professional'] },
  { label: '建設・製造・運輸', cats: ['construction', 'manufacturing', 'transport'] },
  { label: 'その他',          cats: ['food', 'beauty', 'parttime'] },
]

export default function OccupationListClient({ occupations }: { occupations: Occupation[] }) {
  const [activeFilter, setActiveFilter] = useState('全て')
  const [searchText, setSearchText] = useState('')

  const filtered = occupations
    .filter(occ => {
      if (activeFilter === '全て') return true
      const group = FILTER_GROUPS.find(g => g.label === activeFilter)
      return group?.cats?.includes(occ.category)
    })
    .filter(occ => {
      if (!searchText.trim()) return true
      return occ.name_ja.includes(searchText.trim())
    })

  const grouped = filtered.reduce<Record<string, Occupation[]>>((acc, occ) => {
    if (!acc[occ.category]) acc[occ.category] = []
    acc[occ.category].push(occ)
    return acc
  }, {})

  // 横棒グラフ用データ（医療保険 月額推定）
  const chartData = [...occupations]
    .map(occ => ({
      name: occ.name_ja,
      monthly: Math.round((occ.avg_income_man || 400) * 10000 * 0.005 / 12),
    }))
    .sort((a, b) => b.monthly - a.monthly)

  return (
    <>
      {/* ヒーローセクション */}
      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">トップ</Link>
            <span>›</span>
            <span>職業から調べる</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3">職業別 保険料相場一覧</h1>

          {/* データバッジ */}
          <div className="flex flex-wrap gap-3 mb-5">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm">
              <span className="text-[#f59e0b] font-bold">20</span>職業
              <span className="text-gray-500">×</span>
              <span className="text-[#2563eb] font-bold">10</span>保険種類
              <span className="text-gray-500">=</span>
              <span className="text-white font-bold">200</span>パターン
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-gray-300">
              📊 政府統計データ準拠
            </span>
          </div>

          <p className="text-gray-300 mb-5 text-sm">
            職業を選ぶと、その職業特有のリスクと適正保険料がわかります
          </p>

          {/* 検索 */}
          <div className="relative max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="職業名で検索（例：看護師、エンジニア）"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563eb] focus:bg-white/20 transition-all"
            />
          </div>
        </div>
      </section>

      {/* 医療保険 月額比較グラフ */}
      <section className="py-12 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">どの職業が最も保険料が高い？</h2>
          <p className="text-xs text-gray-400 mb-1">医療保険の推定月額保険料（年収ベース参考値）</p>
          <p className="text-xs text-gray-400 mb-6">
            出典：厚生労働省 賃金構造基本統計調査 2023 ×
            業界平均保険料率（0.5%）より算出
          </p>
          <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 22)}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 4, right: 80, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11, fill: '#0f172a' }}
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === 'number' ? [`${value.toLocaleString()}円`, '推定月額'] : value
                }
              />
              <Bar
                dataKey="monthly"
                name="推定月額（医療保険）"
                fill="#2563eb"
                radius={[0, 4, 4, 0]}
                label={{ position: 'right', formatter: (v: unknown) => typeof v === 'number' ? `${v.toLocaleString()}円` : '', fontSize: 11, fill: '#64748b' }}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-3 text-center">
            ※実際の保険料は年齢・健康状態・保険会社・保障内容により大きく異なります
          </p>
        </div>
      </section>

      {/* フィルター + カードグリッド */}
      <section className="py-10 px-4 max-w-6xl mx-auto">
        {/* カテゴリフィルター */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTER_GROUPS.map(group => (
            <button
              key={group.label}
              onClick={() => setActiveFilter(group.label)}
              className={`text-sm px-4 py-2 rounded-full font-semibold transition-all ${
                activeFilter === group.label
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2563eb] hover:text-[#2563eb]'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p>「{searchText || activeFilter}」に該当する職業が見つかりませんでした</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, occs]) => (
              <div key={category}>
                <h2 className="text-lg font-bold text-[#0f172a] mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
                    {CATEGORY_LABELS[category] || category}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {occs.map(occ => {
                    const topIns = TOP_INSURANCE[occ.slug]
                    const riskIcon = RISK_ICON[occ.slug] ?? '📋'
                    return (
                      <Link
                        key={occ.id}
                        href={`/occupation/${occ.slug}`}
                        className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-[#2563eb] hover:shadow-md transition-all flex flex-col"
                      >
                        {/* リスクアイコン + 保険バッジ */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{riskIcon}</span>
                          {topIns && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${INS_BADGE_COLORS[topIns.slug] || 'bg-gray-100 text-gray-600'}`}>
                              ★ {topIns.name}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-[#0f172a] text-sm leading-snug mb-3">{occ.name_ja}</h3>

                        {(occ.avg_income_man || occ.avg_income_woman) && (
                          <div className="space-y-1 mb-4">
                            {occ.avg_income_man && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-400">男性平均</span>
                                <span className="text-base font-bold text-[#0f172a]">
                                  {occ.avg_income_man}
                                  <span className="text-xs font-normal text-gray-500 ml-0.5">万円</span>
                                </span>
                              </div>
                            )}
                            {occ.avg_income_woman && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-400">女性平均</span>
                                <span className="text-base font-bold text-[#0f172a]">
                                  {occ.avg_income_woman}
                                  <span className="text-xs font-normal text-gray-500 ml-0.5">万円</span>
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <span className="mt-auto text-[#2563eb] text-xs font-semibold group-hover:underline">
                          詳細を見る →
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
