import { getOccupationRiskData } from '@/lib/occupationRiskData'

type Props = {
  occSlug: string
  occName: string
}

export default function OccupationRiskDataSection({ occSlug, occName }: Props) {
  const data = getOccupationRiskData(occSlug)
  if (!data) return null

  return (
    <section className="py-10 px-4 bg-[#fffbeb] border-t border-[#fde68a]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#d97706] text-lg">⚠️</span>
          <h2 className="text-xl font-bold text-[#92400e]">
            {occName}のリスクデータ（政府統計）
          </h2>
        </div>
        <p className="text-xs text-[#a16207] mb-6">
          以下のデータは厚生労働省等の公的統計を基にした参考値です
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {data.risks.map((risk, i) => (
            <div
              key={i}
              className="bg-white border border-[#fde68a] rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{risk.icon}</span>
                <div>
                  <p className="font-semibold text-[#0f172a] text-sm mb-1">{risk.title}</p>
                  <p className="text-[#d97706] font-bold text-lg leading-tight">{risk.stat}</p>
                  <p className="text-xs text-gray-400 mt-1">出典：{risk.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#d97706] border border-[#fde68a] bg-white rounded-lg px-4 py-2 hover:bg-[#fef3c7] transition-colors"
          >
            一次データを確認する →
          </a>
        </div>
      </div>
    </section>
  )
}
