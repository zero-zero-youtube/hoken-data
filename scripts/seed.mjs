/**
 * マスターデータ投入スクリプト
 * 実行: node scripts/seed.mjs
 * ※ テーブルが存在することが前提
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// .env.local から読み込み
const envPath = join(__dirname, '../.env.local')
const env = {}
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) env[k.trim()] = v.join('=').trim()
  })
} catch {
  console.error('❌ .env.local が見つかりません')
  process.exit(1)
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

const occupations = [
  { slug: 'engineer', name_ja: 'システムエンジニア・プログラマー', category: 'it', avg_income_man: 600, avg_income_woman: 480 },
  { slug: 'freelance-engineer', name_ja: 'フリーランスエンジニア', category: 'it', avg_income_man: 550, avg_income_woman: 450 },
  { slug: 'nurse', name_ja: '看護師', category: 'medical', avg_income_man: 480, avg_income_woman: 430 },
  { slug: 'teacher', name_ja: '教員・教師', category: 'public', avg_income_man: 550, avg_income_woman: 490 },
  { slug: 'civil-servant', name_ja: '地方公務員', category: 'public', avg_income_man: 520, avg_income_woman: 460 },
  { slug: 'sales', name_ja: '営業職', category: 'office', avg_income_man: 480, avg_income_woman: 380 },
  { slug: 'driver', name_ja: 'トラック運転手・ドライバー', category: 'transport', avg_income_man: 420, avg_income_woman: 350 },
  { slug: 'construction', name_ja: '建設業・現場作業員', category: 'construction', avg_income_man: 430, avg_income_woman: 320 },
  { slug: 'restaurant', name_ja: '飲食店経営・調理師', category: 'food', avg_income_man: 350, avg_income_woman: 280 },
  { slug: 'hairdresser', name_ja: '美容師・理容師', category: 'beauty', avg_income_man: 320, avg_income_woman: 290 },
  { slug: 'accountant', name_ja: '公認会計士・税理士', category: 'professional', avg_income_man: 750, avg_income_woman: 580 },
  { slug: 'doctor', name_ja: '医師', category: 'medical', avg_income_man: 1200, avg_income_woman: 950 },
  { slug: 'lawyer', name_ja: '弁護士', category: 'professional', avg_income_man: 800, avg_income_woman: 650 },
  { slug: 'designer', name_ja: 'デザイナー・クリエイター', category: 'creative', avg_income_man: 420, avg_income_woman: 380 },
  { slug: 'manager', name_ja: '会社管理職・部長職', category: 'office', avg_income_man: 850, avg_income_woman: 650 },
  { slug: 'manufacturing', name_ja: '製造業・工場勤務', category: 'manufacturing', avg_income_man: 400, avg_income_woman: 300 },
  { slug: 'pharmacist', name_ja: '薬剤師', category: 'medical', avg_income_man: 550, avg_income_woman: 510 },
  { slug: 'real-estate', name_ja: '不動産業', category: 'office', avg_income_man: 480, avg_income_woman: 380 },
  { slug: 'finance', name_ja: '金融・保険業', category: 'office', avg_income_man: 620, avg_income_woman: 480 },
  { slug: 'part-time', name_ja: 'パート・アルバイト', category: 'parttime', avg_income_man: 180, avg_income_woman: 150 },
]

const insuranceTypes = [
  { slug: 'medical', name_ja: '医療保険', category: 'life', target_age_min: 20, target_age_max: 70 },
  { slug: 'life', name_ja: '生命保険・死亡保険', category: 'life', target_age_min: 20, target_age_max: 65 },
  { slug: 'income-protection', name_ja: '収入保障保険・就業不能保険', category: 'life', target_age_min: 20, target_age_max: 60 },
  { slug: 'cancer', name_ja: 'がん保険', category: 'life', target_age_min: 20, target_age_max: 75 },
  { slug: 'auto', name_ja: '自動車保険', category: 'non-life', target_age_min: 18, target_age_max: 80 },
  { slug: 'fire', name_ja: '火災保険・地震保険', category: 'non-life', target_age_min: 20, target_age_max: 80 },
  { slug: 'personal-accident', name_ja: '傷害保険・個人賠償', category: 'non-life', target_age_min: 20, target_age_max: 75 },
  { slug: 'pension', name_ja: '個人年金保険', category: 'saving', target_age_min: 20, target_age_max: 55 },
  { slug: 'child', name_ja: '学資保険・子供保険', category: 'saving', target_age_min: 20, target_age_max: 45 },
  { slug: 'whole-life', name_ja: '終身保険', category: 'life', target_age_min: 20, target_age_max: 65 },
]

async function seed() {
  console.log('📦 職業マスター投入中... (20件)')
  const { error: occErr } = await supabase
    .from('hoken_occupations')
    .upsert(occupations, { onConflict: 'slug' })
  if (occErr) {
    console.error('❌ hoken_occupations エラー:', occErr.message)
    console.error('   → テーブルが存在しない場合は先に create-tables.mjs を実行してください')
    process.exit(1)
  }
  console.log('✅ hoken_occupations 20件 完了')

  console.log('📦 保険種類マスター投入中... (10件)')
  const { error: insErr } = await supabase
    .from('hoken_insurance_types')
    .upsert(insuranceTypes, { onConflict: 'slug' })
  if (insErr) {
    console.error('❌ hoken_insurance_types エラー:', insErr.message)
    process.exit(1)
  }
  console.log('✅ hoken_insurance_types 10件 完了')

  console.log('\n🎉 シードデータ投入完了！')
}

seed().catch(e => { console.error(e); process.exit(1) })
