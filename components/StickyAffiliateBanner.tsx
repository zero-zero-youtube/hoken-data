'use client'
import { useState, useEffect } from 'react'

export default function StickyAffiliateBanner() {
  const [visible, setVisible] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && !closed) {
        setVisible(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [closed])

  if (!visible || closed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-950 shadow-lg">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-blue-200 text-xs mb-1">PR・完全無料・強引な勧誘なし</p>
          <a
            href="http://www.rentracks.jp/adx/r.html?idx=0.72767.382229.10612.15191&dna=173109"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold text-center py-2 px-4 rounded-lg text-sm transition-colors"
          >
            保険のこと、FPに無料相談する（ミライ帖）→
          </a>
          <p className="text-blue-200 text-xs text-center mt-1">
            ✓ 完全無料　✓ 強引な勧誘なし　✓ オンライン相談OK
          </p>
        </div>
        <button
          onClick={() => { setClosed(true); setVisible(false) }}
          className="text-white hover:text-blue-200 font-bold text-xl leading-none flex-shrink-0 p-1"
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
    </div>
  )
}
