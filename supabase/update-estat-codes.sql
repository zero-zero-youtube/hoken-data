-- hoken_occupations e-Statコード更新
-- Supabase SQL Editor で実行してください
-- https://supabase.com/dashboard/project/hjhovgyzvibzwgzxqwti/sql/new

UPDATE hoken_occupations SET estat_code = '1104' WHERE slug = 'engineer';
UPDATE hoken_occupations SET estat_code = '1109' WHERE slug = 'freelance-engineer';
UPDATE hoken_occupations SET estat_code = '1231' WHERE slug = 'nurse';
UPDATE hoken_occupations SET estat_code = '1311' WHERE slug = 'teacher';
UPDATE hoken_occupations SET estat_code = '1031' WHERE slug = 'civil-servant';
UPDATE hoken_occupations SET estat_code = '1345' WHERE slug = 'sales';
UPDATE hoken_occupations SET estat_code = '1109' WHERE slug = 'driver';
UPDATE hoken_occupations SET estat_code = '1671' WHERE slug = 'construction';
UPDATE hoken_occupations SET estat_code = '1511' WHERE slug = 'manufacturing';
UPDATE hoken_occupations SET estat_code = '1224' WHERE slug = 'designer';
UPDATE hoken_occupations SET estat_code = '1031' WHERE slug = 'manager';
UPDATE hoken_occupations SET estat_code = '1181' WHERE slug = 'accountant';
UPDATE hoken_occupations SET estat_code = '1221' WHERE slug = 'doctor';
UPDATE hoken_occupations SET estat_code = '1173' WHERE slug = 'lawyer';
UPDATE hoken_occupations SET estat_code = '1241' WHERE slug = 'pharmacist';

-- 確認
SELECT slug, name_ja, estat_code FROM hoken_occupations ORDER BY id;
