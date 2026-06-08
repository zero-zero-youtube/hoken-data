-- hoken_occupations（職業マスター）
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

-- hoken_insurance_types（保険種類マスター）
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

-- hoken_premium_stats（保険料相場統計）
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

-- hoken_age_stats（年齢別統計）
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
