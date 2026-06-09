export default function Disclaimer() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-6 flex gap-3">
      <span className="flex-shrink-0 text-gray-400 text-lg leading-none mt-0.5">ⓘ</span>
      <p className="text-xs text-gray-500 leading-relaxed">
        本サイトに掲載の保険料は公的統計データ（厚生労働省 賃金構造基本統計調査等）を基にした参考値です。
        実際の保険料は保険会社・契約内容・健康状態により大きく異なります。
        保険の加入・変更の際は必ず保険会社または資格を持つファイナンシャルプランナーにご相談ください。
        本サイトは特定の保険商品の推奨・募集を行いません。
        <span className="ml-1 text-gray-400">（PR：本サイトはアフィリエイト広告を含みます）</span>
      </p>
    </div>
  )
}
