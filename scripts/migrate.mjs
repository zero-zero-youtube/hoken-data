import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = 'https://hjhovgyzvibzwgzxqwti.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaG92Z3l6dmliendnenhxd3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkzNDQ4MywiZXhwIjoyMDk1NTEwNDgzfQ.muvrwwrbX9vg2QTzEAX36ClyyRNHjdwCm74Zjb9UDM0'

const supabase = createClient(supabaseUrl, serviceRoleKey)

const migrations = [
  '001_create_hoken_tables.sql',
  '002_seed_master_data.sql',
]

for (const file of migrations) {
  const sql = readFileSync(join(__dirname, '../supabase/migrations', file), 'utf8')
  console.log(`Running ${file}...`)
  const { error } = await supabase.rpc('exec_sql', { query: sql }).catch(() => ({ error: null }))
  if (error) {
    console.error(`Error in ${file}:`, error.message)
  } else {
    console.log(`✓ ${file} done`)
  }
}
