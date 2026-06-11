'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  {
    label: 'IT・エンジニア',
    occupations: [
      { name: 'システムエンジニア', href: '/occupation/engineer' },
      { name: 'フリーランスエンジニア', href: '/occupation/freelance-engineer' },
      { name: 'デザイナー・クリエイター', href: '/occupation/designer' },
    ],
  },
  {
    label: '医療・介護',
    occupations: [
      { name: '医師', href: '/occupation/doctor' },
      { name: '看護師', href: '/occupation/nurse' },
      { name: '薬剤師', href: '/occupation/pharmacist' },
    ],
  },
  {
    label: '公務員・教育',
    occupations: [
      { name: '地方公務員', href: '/occupation/civil-servant' },
      { name: '教員・教師', href: '/occupation/teacher' },
    ],
  },
  {
    label: 'オフィス・営業',
    occupations: [
      { name: '営業職', href: '/occupation/sales' },
      { name: '会社管理職', href: '/occupation/manager' },
      { name: '金融・保険業', href: '/occupation/finance' },
      { name: '不動産業', href: '/occupation/real-estate' },
    ],
  },
  {
    label: '建設・製造・運輸',
    occupations: [
      { name: '建設業・現場作業員', href: '/occupation/construction' },
      { name: 'トラック運転手', href: '/occupation/driver' },
      { name: '製造業・工場勤務', href: '/occupation/manufacturing' },
    ],
  },
  {
    label: '飲食・美容',
    occupations: [
      { name: '飲食店経営・調理師', href: '/occupation/restaurant' },
      { name: '美容師・理容師', href: '/occupation/hairdresser' },
    ],
  },
  {
    label: '士業・専門職',
    occupations: [
      { name: '公認会計士・税理士', href: '/occupation/accountant' },
      { name: '弁護士', href: '/occupation/lawyer' },
    ],
  },
  {
    label: 'その他',
    occupations: [
      { name: 'パート・アルバイト', href: '/occupation/part-time' },
    ],
  },
]

export default function HomeOccupationTabs() {
  const [activeTab, setActiveTab] = useState('IT・エンジニア')
  const activeCategory = CATEGORIES.find(c => c.label === activeTab) ?? CATEGORIES[0]

  return (
    <div>
      {/* タブ */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setActiveTab(cat.label)}
            className={`text-sm px-4 py-2 rounded-full font-semibold transition-all ${
              activeTab === cat.label
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2563eb] hover:text-[#2563eb]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 職業カード */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {activeCategory.occupations.map(occ => (
          <Link
            key={occ.name}
            href={occ.href}
            className="group bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-[#2563eb] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <p className="font-semibold text-[#0f172a] text-sm leading-snug mb-3">{occ.name}</p>
            <span className="text-[#2563eb] text-xs font-semibold group-hover:underline">
              → 相場を見る
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
