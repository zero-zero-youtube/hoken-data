'use client'

import { useState } from 'react'

type Props = {
  occName: string
  manIncome: number | null
  womanIncome: number | null
  insName: string
  insSlug: string
  rate: number | null
}

const RATE_LABELS: Record<string, string> = {
  'medical':           '0.005（医療保険 業界平均保険料率 参考値）',
  'life':              '0.010（生命保険 業界平均保険料率 参考値）',
  'income-protection': '0.008（就業不能保険 業界平均保険料率 参考値）',
  'cancer':            '0.004（がん保険 業界平均保険料率 参考値）',
  'personal-accident': '0.003（傷害保険 業界平均保険料率 参考値）',
  'pension':           '0.020（個人年金 業界平均保険料率 参考値）',
  'child':             '0.015（学資保険 業界平均保険料率 参考値）',
  'whole-life':        '0.015（終身保険 業界平均保険料率 参考値）',
}

export default function DataCalculationBadge({ occName, manIncome, womanIncome, insName, insSlug, rate }: Props) {
  const [open, setOpen] = useState(false)

  if (!rate) return null

  const rateLabel = RATE_LABELS[insSlug] || `${rate}`
  const manMonthly = manIncome ? Math.round(manIncome * 10000 * rate / 12) : null
  const womanMonthly = womanIncome ? Math.round(womanIncome * 10000 * rate / 12) : null

  return (
    <div className="bg-[#f0f9ff] border border-[#bfdbfe] rounded-xl mt-4 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#e0f2fe] transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#1e40af]">📊 この数値の計算根拠を見る</span>
        <span className={`text-[#1e40af] text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="px-4 pb-4 text-[#1e40af] text-sm space-y-3 border-t border-[#bfdbfe] pt-3">
          {/* 計算式 */}
          <div>
            <p className="font-semibold mb-1">計算式：</p>
            <div className="bg-white/60 rounded-lg p-3 font-mono text-xs border border-[#bfdbfe]">
              月額 = 年収（万円）× 10,000 × [{insName}係数] ÷ 12
            </div>
          </div>

          {/* 職業年収データ */}
          <div>
            <p className="font-semibold mb-1">{occName}の年収データ：</p>
            <ul className="text-xs space-y-1 text-[#1e40af]/80">
              {manIncome && (
                <li>・男性平均年収：<strong>{manIncome}万円</strong>（厚生労働省 2023年賃金構造基本統計調査）</li>
              )}
              {womanIncome && (
                <li>・女性平均年収：<strong>{womanIncome}万円</strong>（同上）</li>
              )}
            </ul>
          </div>

          {/* 係数 */}
          <div>
            <p className="font-semibold mb-1">{insName}の係数：</p>
            <p className="text-xs text-[#1e40af]/80">{rateLabel}</p>
          </div>

          {/* 計算結果 */}
          {(manMonthly || womanMonthly) && (
            <div>
              <p className="font-semibold mb-1">計算結果：</p>
              <ul className="text-xs space-y-1 text-[#1e40af]/80">
                {manMonthly && manIncome && (
                  <li>・男性：{manIncome}万 × 10,000 × {rate} ÷ 12 = <strong>{manMonthly.toLocaleString()}円/月</strong></li>
                )}
                {womanMonthly && womanIncome && (
                  <li>・女性：{womanIncome}万 × 10,000 × {rate} ÷ 12 = <strong>{womanMonthly.toLocaleString()}円/月</strong></li>
                )}
              </ul>
            </div>
          )}

          {/* 参照データ */}
          <div className="border-t border-[#bfdbfe] pt-2">
            <p className="text-xs text-[#1e40af]/70">
              参照データ：e-Stat 賃金構造基本統計調査 —{' '}
              <a
                href="https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00450091"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#1e40af]"
              >
                データを確認する →
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
