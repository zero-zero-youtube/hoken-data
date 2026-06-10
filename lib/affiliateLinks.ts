export const affiliateLinks = {
  miraitecho: {
    name: 'ミライ帖',
    description: '保険・資産運用・ライフプランをFPに無料相談',
    cta: '無料でFPに相談する（ミライ帖）',
    subtext: '完全無料・強引な勧誘なし・オンライン相談OK',
    href: 'http://www.rentracks.jp/adx/r.html?idx=0.72767.382229.10612.15191&dna=173109',
    trackingPixel: 'http://www.rentracks.jp/adx/p.gifx?idx=0.72767.382229.10612.15191&dna=173109',
    coverage: 'nationwide',
  },
  minnano: {
    name: 'みんなの生命保険アドバイザー',
    description: '過去利用者数50万人以上・利用満足度97%のFP紹介サービス',
    cta: '無料でFPを探す（みんなの生命保険アドバイザー）',
    subtext: '全国対応・オンライン相談OK・完全無料',
    href: 'https://h.accesstrade.net/sp/cc?rk=0100pfk700otv3',
    trackingPixel: 'https://h.accesstrade.net/sp/rr?rk=0100pfk700otv3',
    coverage: 'nationwide',
  },
  hokenlaundry: {
    name: '保険ランドリー',
    description: 'プロのコンサルタントがご自宅や希望の場所に訪問',
    cta: '無料で保険相談する（保険ランドリー）',
    subtext: '訪問相談・完全無料・初心者向け',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5SK4+AQEIK2+3S2C+5Z6WY',
    trackingPixel: 'https://www18.a8.net/0.gif?a8mat=4B5SK4+AQEIK2+3S2C+5Z6WY',
    coverage: ['hokkaido','miyagi','fukushima','ibaraki','tochigi','gunma','saitama','chiba','tokyo','kanagawa','gifu','aichi','mie','shiga','kyoto','osaka','hyogo','nara','wakayama'],
  },
  babyplanetCancer: {
    name: 'baby planet（がん保険専門）',
    description: '30社以上のがん保険からプロが最適プランを提案',
    cta: 'がん保険を無料相談する（ベビープラネット）',
    subtext: '完全無料・相談後にプレゼントあり',
    href: 'https://px.a8.net/svt/ejp?a8mat=4AZOWJ+A94SM2+503M+HVFKY',
    trackingPixel: 'https://www15.a8.net/0.gif?a8mat=4AZOWJ+A94SM2+503M+HVFKY',
    coverage: 'nationwide',
  },
  babyplanetMama: {
    name: 'ベビープラネット（ママ向け）',
    description: '妊娠〜出産〜子育て中のママのための保険無料相談',
    cta: '無料で保険相談する（ベビープラネット）',
    subtext: '子育て経験のあるFPが対応・完全無料',
    href: 'https://px.a8.net/svt/ejp?a8mat=4B5SK4+B5ACOI+503M+5YJRM',
    trackingPixel: 'https://www13.a8.net/0.gif?a8mat=4B5SK4+B5ACOI+503M+5YJRM',
    coverage: 'nationwide',
  },
} as const

export type AffiliateKey = keyof typeof affiliateLinks
