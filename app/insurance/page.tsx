import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllInsuranceTypes, INSURANCE_CATEGORY_LABELS, getInsuranceDescription } from '@/lib/data'

export const metadata: Metadata = {
  title: '保険種類一覧',
  description: '医療保険・生命保険・収入保障・がん保険など10種類の保険の相場と選び方を無料で確認できます。',
}

const INSURANCE_ICONS: Record<string, string> = {
  medical: '🏥', life: '🛡️', 'income-protection': '💼',
  cancer: '🎗️', auto: '🚗', fire: '🏠',
  'personal-accident': '⚡', pension: '🏦', child: '👶', 'whole-life': '♾️',
}

export default async function InsuranceListPage() {
  const insuranceTypes = await getAllInsuranceTypes()
  const grouped = insuranceTypes.reduce<Record<string, typeof insuranceTypes>>((acc, ins) => {
    if (!acc[ins.category]) acc[ins.category] = []
    acc[ins.category].push(ins)
    return acc
  }, {})

  return (
    <>
      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-3">保険種類一覧</h1>
          <p className="text-gray-300">10種類の保険の相場と選び方を職業・年齢別に確認できます</p>
        </div>
      </section>

      <section className="py-12 px-4 max-w-5xl mx-auto">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-10">
            <h2 className="text-base font-bold text-gray-500 mb-4">{INSURANCE_CATEGORY_LABELS[cat] || cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map(ins => (
                <Link
                  key={ins.id}
                  href={`/insurance/${ins.slug}`}
                  className="group flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100 hover:border-[#2563eb] hover:shadow-md transition-all"
                >
                  <span className="text-3xl flex-shrink-0">{INSURANCE_ICONS[ins.slug] || '📋'}</span>
                  <div>
                    <h3 className="font-bold text-[#0f172a] mb-1">{ins.name_ja}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{getInsuranceDescription(ins.slug)}</p>
                    <p className="text-xs text-gray-400 mt-2">対象：{ins.target_age_min}〜{ins.target_age_max}歳</p>
                    <span className="text-[#2563eb] text-xs font-semibold group-hover:underline mt-1 inline-block">相場を見る →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
