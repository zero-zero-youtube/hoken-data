/**
 * Supabase Management API経由でテーブルを作成するスクリプト
 * 実行: node scripts/create-tables.mjs [SUPABASE_ACCESS_TOKEN]
 *
 * アクセストークンの取得: https://supabase.com/dashboard/account/tokens
 */

const PROJECT_REF = 'hjhovgyzvibzwgzxqwti'
const ACCESS_TOKEN = process.argv[2] || process.env.SUPABASE_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('❌ Supabase Personal Access Token が必要です')
  console.error('   取得先: https://supabase.com/dashboard/account/tokens')
  console.error('   実行方法: node scripts/create-tables.mjs [TOKEN]')
  process.exit(1)
}

const DDL = `
-- hoken_occupations
CREATE TABLE IF NOT EXISTS hoken_occupations (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_ja TEXT NOT NULL,
  category TEXT NOT NULL,
  estat_code TEXT,
  avg_income_man INT,
  avg_income_woman INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- hoken_insurance_types
CREATE TABLE IF NOT EXISTS hoken_insurance_types (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_ja TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  target_age_min INT,
  target_age_max INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- hoken_premium_stats
CREATE TABLE IF NOT EXISTS hoken_premium_stats (
  id SERIAL PRIMARY KEY,
  insurance_type_id INT REFERENCES hoken_insurance_types(id),
  occupation_id INT REFERENCES hoken_occupations(id),
  prefecture_code TEXT,
  age_group TEXT NOT NULL,
  gender TEXT,
  condition_flag INT DEFAULT 0,
  estimated_monthly_premium INT,
  estimated_annual_premium INT,
  data_source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hoken_premium_search
  ON hoken_premium_stats (age_group, gender, condition_flag);
CREATE INDEX IF NOT EXISTS idx_hoken_premium_type
  ON hoken_premium_stats (insurance_type_id, occupation_id);

-- hoken_age_stats
CREATE TABLE IF NOT EXISTS hoken_age_stats (
  id SERIAL PRIMARY KEY,
  prefecture_code TEXT,
  age_group TEXT NOT NULL,
  occupation_id INT REFERENCES hoken_occupations(id),
  avg_income INT,
  household_size DECIMAL,
  insurance_penetration_rate DECIMAL,
  avg_premium_paid INT,
  data_year INT,
  data_source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`

async function run() {
  console.log('📋 テーブル作成中...')
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: DDL }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('❌ エラー:', JSON.stringify(data, null, 2))
    process.exit(1)
  }

  console.log('✅ テーブル作成完了')
  console.log('次に: node scripts/seed.mjs を実行してください')
}

run().catch(e => { console.error(e); process.exit(1) })
