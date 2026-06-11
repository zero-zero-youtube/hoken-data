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
    <div className="bg-blue-950 rounded-xl p-6 my-8">
      <div className="text-xs text-blue-200 mb-1">完全無料・強引な勧誘なし</div>
      <h3 className="text-lg font-bold mb-1 text-white">{p.description}</h3>
      <p className="text-blue-200 text-sm mb-4">{p.subtext}</p>

      <a
        href={p.href}
        rel="noopener noreferrer sponsored"
        target="_blank"
        className="block w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold text-center py-4 rounded-lg mb-2 transition-colors text-sm"
      >
        {p.cta} →
      </a>

      {p.trackingPixel && (
        <img src={p.trackingPixel} width="1" height="1" alt="" style={{ border: 'none', display: 'block' }} />
      )}

      <p className="text-blue-200 text-xs text-center mb-4">
        ✓ 完全無料・強引な勧誘なし　✓ オンライン相談OK　✓ 相談後の保険加入は完全任意
      </p>

      {s && (
        <div>
          <a
            href={s.href}
            rel="noopener noreferrer sponsored"
            target="_blank"
            className="block w-full bg-blue-800 hover:bg-blue-700 text-white font-bold text-center py-3 rounded-lg transition-colors text-sm"
          >
            {s.cta} →
          </a>
          {s.trackingPixel && (
            <img src={s.trackingPixel} width="1" height="1" alt="" style={{ border: 'none', display: 'block' }} />
          )}
          <p className="text-blue-200 text-xs text-center mt-2">
            ✓ 何度でも無料　✓ 全国のFPから選べる
          </p>
        </div>
      )}
    </div>
  )
}
