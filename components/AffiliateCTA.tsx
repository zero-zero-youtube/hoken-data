'use client'
import { affiliateLinks, AffiliateKey } from '@/lib/affiliateLinks'

interface Props {
  primary: AffiliateKey
  secondary?: AffiliateKey | null
}

export default function AffiliateCTA({ primary, secondary }: Props) {
  const p = affiliateLinks[primary]
  const s = secondary ? affiliateLinks[secondary] : null

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 my-8 text-white">
      <div className="text-xs text-blue-200 mb-1">PR・完全無料・強引な勧誘なし</div>
      <h3 className="text-lg font-bold mb-1">{p.description}</h3>
      <p className="text-blue-200 text-sm mb-4">{p.subtext}</p>

      <a
        href={p.href}
        rel="nofollow noopener"
        target="_blank"
        className="block w-full bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-center py-4 rounded-xl transition-colors text-sm"
      >
        {p.cta} →
      </a>

      {p.trackingPixel && (
        <img src={p.trackingPixel} width="1" height="1" alt="" style={{ border: 'none', display: 'block' }} />
      )}

      {s && (
        <div className="mt-3">
          <a
            href={s.href}
            rel="nofollow noopener"
            target="_blank"
            className="block w-full bg-white/10 hover:bg-white/20 text-white text-center py-3 rounded-xl transition-colors text-sm border border-white/20"
          >
            {s.cta} →
          </a>
          {s.trackingPixel && (
            <img src={s.trackingPixel} width="1" height="1" alt="" style={{ border: 'none', display: 'block' }} />
          )}
        </div>
      )}
    </div>
  )
}
