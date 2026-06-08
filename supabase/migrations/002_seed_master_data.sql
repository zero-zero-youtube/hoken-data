-- hoken_occupations 初期データ
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

-- hoken_insurance_types 初期データ
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
