import { MetadataRoute } from 'next'

const BASE_URL = 'https://hoken-data.com'

const PREFECTURE_SLUGS = [
  'tokyo', 'osaka', 'aichi', 'kanagawa', 'saitama',
  'chiba', 'fukuoka', 'hokkaido', 'kyoto', 'hyogo',
]

const OCCUPATION_SLUGS = [
  'engineer', 'freelance-engineer', 'designer',
  'nurse', 'doctor', 'pharmacist',
  'civil-servant', 'teacher',
  'sales', 'manager', 'finance',
  'construction', 'manufacturing',
  'driver', 'restaurant', 'hairdresser',
  'part-time', 'accountant',
  'lawyer', 'real-estate', 'self-employed', 'freelance',
]

const INSURANCE_SLUGS = [
  'medical', 'life', 'income-protection', 'cancer',
  'auto', 'fire', 'personal-accident', 'pension', 'child', 'whole-life',
  'disability',
]

const AGE_SLUGS = ['20dai', '30dai', '40dai', '50dai']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                                         lastModified: now, changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE_URL}/occupation`,                         lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/insurance`,                          lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/guide`,                              lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/guide/medical-insurance`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/guide/income-protection`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/guide/insurance-by-occupation`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/simulator`,                          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`,                              lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`,                            lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // /occupation/[slug] × 22
  const occupationPages: MetadataRoute.Sitemap = OCCUPATION_SLUGS.map(slug => ({
    url: `${BASE_URL}/occupation/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // /occupation/[slug]/[insurance] × 242
  const occupationInsurancePages: MetadataRoute.Sitemap = OCCUPATION_SLUGS.flatMap(occ =>
    INSURANCE_SLUGS.map(ins => ({
      url: `${BASE_URL}/occupation/${occ}/${ins}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  )

  // /insurance/[slug] × 11
  const insurancePages: MetadataRoute.Sitemap = INSURANCE_SLUGS.map(slug => ({
    url: `${BASE_URL}/insurance/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // /prefecture/[pref]/[occupation] × 220
  const prefecturePages: MetadataRoute.Sitemap = PREFECTURE_SLUGS.flatMap(pref =>
    OCCUPATION_SLUGS.map(occ => ({
      url: `${BASE_URL}/prefecture/${pref}/${occ}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  )

  // /age/[age]/[insurance] × 44
  const agePages: MetadataRoute.Sitemap = AGE_SLUGS.flatMap(age =>
    INSURANCE_SLUGS.map(ins => ({
      url: `${BASE_URL}/age/${age}/${ins}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    }))
  )

  return [
    ...staticPages,
    ...occupationPages,
    ...occupationInsurancePages,
    ...insurancePages,
    ...prefecturePages,
    ...agePages,
  ]
}
