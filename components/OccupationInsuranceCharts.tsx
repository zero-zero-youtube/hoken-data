'use client'

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

type IncomePoint = { income: string; man: number | null; woman: number | null }
type AgePoint = { age: string; man: number | null; woman: number | null }

type Props = {
  incomeData: IncomePoint[]
  ageData: AgePoint[]
  hasFixed: boolean
}

const fmt = (v: number) => `${v.toLocaleString()}円`

export default function OccupationInsuranceCharts({ incomeData, ageData, hasFixed }: Props) {
  if (hasFixed) return null

  const incomeValid = incomeData.some(d => d.man != null || d.woman != null)
  const ageValid = ageData.some(d => d.man != null || d.woman != null)

  return (
    <>
      {/* 年収別棒グラフ */}
      {incomeValid && (
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-3 text-right">
            出典：厚生労働省 賃金構造基本統計調査 × 業界平均係数より算出（参考値）
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={incomeData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="income" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(value) => typeof value === 'number' ? fmt(value) : value} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="man" name="男性" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="woman" name="女性" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2 text-center">
            ※実際の保険料は保険会社・年齢・健康状態により大きく異なります
          </p>
        </div>
      )}

      {/* 年齢別折れ線グラフ */}
      {ageValid && (
        <div className="mb-6 relative">
          <div className="absolute top-0 right-0 bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#92400e] text-xs font-semibold px-2 py-1 rounded-lg z-10">
            若いうちに加入するほど保険料が低い
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ageData} margin={{ top: 24, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(value) => typeof value === 'number' ? fmt(value) : value} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="man" name="男性" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="woman" name="女性" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2 text-center">
            ※年齢係数は一般的な傾向をもとにした参考値です
          </p>
        </div>
      )}
    </>
  )
}
