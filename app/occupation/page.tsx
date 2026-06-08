import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllOccupations, CATEGORY_LABELS } from '@/lib/data'

export const metadata: Metadata = {
  title: '職業別 保険料相場一覧',
  description: '20職業の保険料相場を政府統計データで比較。あなたの職業に合った医療保険・生命保険・収入保障の目安を無料で確認できます。',
}

const CATEGORY_COLORS: Record<string, string> = {
  it: 'bg-blue-100 text-blue-700', medical: 'bg-red-100 text-red-700',
  public: 'bg-green-100 text-green-700', office: 'bg-gray-100 text-gray-700',
  transport: 'bg-orange-100 text-orange-700', construction: 'bg-yellow-100 text-yellow-700',
  food: 'bg-pink-100 text-pink-700', beauty: 'bg-purple-100 text-purple-700',
  professional: 'bg-indigo-100 text-indigo-700', creative: 'bg-fuchsia-100 text-fuchsia-700',
  manufacturing: 'bg-teal-100 text-teal-700', parttime: 'bg-slate-100 text-slate-700',
}

export default async function OccupationListPage() {
  const occupations = await getAllOccupations()
  const grouped = occupations.reduce<Record<string, typeof occupations>>((acc, occ) => {
    if (!acc[occ.category]) acc[occ.category] = []
    acc[occ.category].push(occ)
    return acc
  }, {})

  return (
    <>
      <section className="bg-[#0f172a] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-3">職業別 保険料相場一覧</h1>
          <p className="text-gray-300">20職業の保険料相場を政府統計データで確認できます</p>
        </div>
      </section>

      <section className="py-12 px-4 max-w-6xl mx-auto">
        {Object.entries(grouped).map(([category, occs]) => (
          <div key={category} className="mb-10">
            <h2 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
                {CATEGORY_LABELS[category] || category}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {occs.map(occ => (
                <Link
                  key={occ.id}
                  href={`/occupation/${occ.slug}`}
                  className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-[#2563eb] hover:shadow-md transition-all"
                >
                  <h3 className="font-bold text-[#0f172a] text-sm leading-snug mb-3">{occ.name_ja}</h3>
                  {(occ.avg_income_man || occ.avg_income_woman) && (
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      {occ.avg_income_man && (
                        <div className="flex justify-between">
                          <span>男性平均年収</span>
                          <span className="font-semibold text-[#0f172a]">{occ.avg_income_man}万円</span>
                        </div>
                      )}
                      {occ.avg_income_woman && (
                        <div className="flex justify-between">
                          <span>女性平均年収</span>
                          <span className="font-semibold text-[#0f172a]">{occ.avg_income_woman}万円</span>
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-[#2563eb] text-xs font-semibold group-hover:underline">保険料を調べる →</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
