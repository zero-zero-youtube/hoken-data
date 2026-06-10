'use client'

const checklist = [
  '現在の会社の団体保険・福利厚生の保障内容を確認した',
  '健康保険の高額療養費制度（月の自己負担上限）を把握している',
  '貯蓄で対応できるリスクと保険が必要なリスクを整理した',
  '必要保障額（月収×24ヶ月分が目安）を計算した',
]

export default function InsuranceChecklist() {
  return (
    <div className="bg-blue-50 rounded-xl p-5 my-6 border border-blue-100">
      <div className="font-bold text-blue-900 mb-3">📋 保険相談前の確認リスト</div>
      {checklist.map((item, i) => (
        <label key={i} className="flex items-start gap-2 mb-2 cursor-pointer">
          <input type="checkbox" className="mt-0.5 accent-blue-600" />
          <span className="text-sm text-gray-700">{item}</span>
        </label>
      ))}
      <div className="text-xs text-gray-500 mt-3">
        ✓ 上記を確認した上でFPに相談すると、より的確な提案が受けられます
      </div>
    </div>
  )
}
