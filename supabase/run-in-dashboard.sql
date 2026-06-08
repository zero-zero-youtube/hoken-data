-- ==================================================
-- 保険データドットコム - Supabase SQL Editor で実行
-- https://supabase.com/dashboard/project/hjhovgyzvibzwgzxqwti/sql/new
-- ==================================================

-- 1. hoken_occupations（職業マスター）
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

-- 2. hoken_insurance_types（保険種類マスター）
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

-- 3. hoken_premium_stats（保険料相場統計）
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

-- 4. hoken_age_stats（年齢別統計）
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

-- 5. 職業マスター初期データ（20件）
INSERT INTO hoken_occupations (slug, name_ja, category, avg_income_man, avg_income_woman) VALUES
  ('engineer', 'システムエンジニア・プログラマー', 'it', 600, 480),
  ('freelance-engineer', 'フリーランスエンジニア', 'it', 550, 450),
  ('nurse', '看護師', 'medical', 480, 430),
  ('teacher', '教員・教師', 'public', 550, 490),
  ('civil-servant', '地方公務員', 'public', 520, 460),
  ('sales', '営業職', 'office', 480, 380),
  ('driver', 'トラック運転手・ドライバー', 'transport', 420, 350),
  ('construction', '建設業・現場作業員', 'construction', 430, 320),
  ('restaurant', '飲食店経営・調理師', 'food', 350, 280),
  ('hairdresser', '美容師・理容師', 'beauty', 320, 290),
  ('accountant', '公認会計士・税理士', 'professional', 750, 580),
  ('doctor', '医師', 'medical', 1200, 950),
  ('lawyer', '弁護士', 'professional', 800, 650),
  ('designer', 'デザイナー・クリエイター', 'creative', 420, 380),
  ('manager', '会社管理職・部長職', 'office', 850, 650),
  ('manufacturing', '製造業・工場勤務', 'manufacturing', 400, 300),
  ('pharmacist', '薬剤師', 'medical', 550, 510),
  ('real-estate', '不動産業', 'office', 480, 380),
  ('finance', '金融・保険業', 'office', 620, 480),
  ('part-time', 'パート・アルバイト', 'parttime', 180, 150)
ON CONFLICT (slug) DO NOTHING;

-- 6. 保険種類マスター初期データ（10件）
INSERT INTO hoken_insurance_types (slug, name_ja, category, target_age_min, target_age_max) VALUES
  ('medical', '医療保険', 'life', 20, 70),
  ('life', '生命保険・死亡保険', 'life', 20, 65),
  ('income-protection', '収入保障保険・就業不能保険', 'life', 20, 60),
  ('cancer', 'がん保険', 'life', 20, 75),
  ('auto', '自動車保険', 'non-life', 18, 80),
  ('fire', '火災保険・地震保険', 'non-life', 20, 80),
  ('personal-accident', '傷害保険・個人賠償', 'non-life', 20, 75),
  ('pension', '個人年金保険', 'saving', 20, 55),
  ('child', '学資保険・子供保険', 'saving', 20, 45),
  ('whole-life', '終身保険', 'life', 20, 65)
ON CONFLICT (slug) DO NOTHING;

-- 確認クエリ
SELECT 'hoken_occupations' as table_name, COUNT(*) FROM hoken_occupations
UNION ALL
SELECT 'hoken_insurance_types', COUNT(*) FROM hoken_insurance_types;
