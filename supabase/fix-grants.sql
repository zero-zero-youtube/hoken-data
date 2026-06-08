-- hoken_* テーブルの権限設定
-- Supabase SQL Editor で実行してください
-- https://supabase.com/dashboard/project/hjhovgyzvibzwgzxqwti/sql/new

GRANT ALL ON TABLE hoken_occupations TO postgres, service_role, anon, authenticated;
GRANT ALL ON TABLE hoken_insurance_types TO postgres, service_role, anon, authenticated;
GRANT ALL ON TABLE hoken_premium_stats TO postgres, service_role, anon, authenticated;
GRANT ALL ON TABLE hoken_age_stats TO postgres, service_role, anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, anon, authenticated;

-- RLS 無効化（パブリックデータのため）
ALTER TABLE hoken_occupations DISABLE ROW LEVEL SECURITY;
ALTER TABLE hoken_insurance_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE hoken_premium_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE hoken_age_stats DISABLE ROW LEVEL SECURITY;

-- 確認
SELECT table_name, has_table_privilege('service_role', table_name, 'SELECT') as service_role_ok
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'hoken_%';
