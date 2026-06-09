'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/constants'

export default function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-[#0f172a] text-white sticky top-0 z-50 shadow-md border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-[#f59e0b]">保険</span>データドットコム
            </span>
          </Link>

          {/* PC nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* PC 無料相談ボタン */}
          <div className="hidden md:block">
            <Link
              href="/simulator"
              className="bg-[#2563eb] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              無料診断
            </Link>
          </div>

          {/* SP ハンバーガーメニュー */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="メニューを開く"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* SP ドロワーメニュー */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-300 hover:text-white py-3 border-b border-white/10 last:border-0 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
