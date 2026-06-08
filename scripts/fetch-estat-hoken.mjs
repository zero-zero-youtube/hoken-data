/**
 * e-Stat 賃金構造基本統計調査から職業別年収を取得して hoken_occupations を更新
 * 実行: node scripts/fetch-estat-hoken.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const env = {}
readFileSync(join(__dirname, '../.env.local'), 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) env[k.trim()] = v.join('=').trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const ESTAT_APP_ID = env.ESTAT_APP_ID
const STATS_ID = '0003445758'
const YEAR = '2023'

// hoken_occupations.slug -> e-Stat 職種コード
const SLUG_TO_CODE = {
  'engineer':      '1104',
  'nurse':         '1231',
  'teacher':       '1311',
  'civil-servant': '1031',
  'sales':         '1345',
  'designer':      '1224',
  'manager':       '1031',
  'pharmacist':    '1241',
  'finance':       '1351',
}

// tab コード（年度によって新旧あり）
const TAB_ALIASES = { '08': '40', '12': '44' }

function parseValue(arr, tabCode) {
  // 全国計（area=00000）のみ対象
  const alias = TAB_ALIASES[tabCode]
  const found = arr.find(v =>
    v['@area'] === '00000' &&
    (v['@tab'] === tabCode || (alias && v['@tab'] === alias))
  )
  if (!found || found['$'] === '-' || found['$'] === '***') return null
  return parseFloat(found['$'])
}

async function fetchWage(jobCode, sex) {
  // sex: '1'=男, '2'=女
  const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData` +
    `?appId=${ESTAT_APP_ID}` +
    `&statsDataId=${STATS_ID}` +
    `&cdCat01=0${sex}` +
    `&cdCat02=${jobCode}` +
    `&cdTime=${YEAR}000000` +
    `&cdArea=00000` +
    `&lang=J&metaGetFlg=N&sectionHeaderFlg=1`

  const res = await fetch(url)
  const data = await res.json()
  const values = data?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE
  if (!values) return null
  const arr = Array.isArray(values) ? values : [values]

  const monthly = parseValue(arr, '08')
  const bonus   = parseValue(arr, '12')
  if (!monthly) return null

  // 千円 -> 万円 換算
  const annualMan = Math.round((monthly * 12 + (bonus || 0)) / 10)
  return annualMan
}

async function run() {
  console.log(`e-Stat 賃金データ取得中（${YEAR}年 全国計）\n`)

  const updates = []

  for (const [slug, jobCode] of Object.entries(SLUG_TO_CODE)) {
    process.stdout.write(`  ${slug} (${jobCode}) ... `)
    try {
      const [man, woman] = await Promise.all([
        fetchWage(jobCode, '1'),
        fetchWage(jobCode, '2'),
      ])
      if (man || woman) {
        updates.push({ slug, man, woman })
        console.log(`男:${man}万 女:${woman}万`)
      } else {
        console.log('データなし')
      }
      await new Promise(r => setTimeout(r, 600))
    } catch (e) {
      console.log(`エラー: ${e.message}`)
    }
  }

  console.log(`\n取得完了: ${updates.length}件 → hoken_occupations 更新中...\n`)

  for (const { slug, man, woman } of updates) {
    const patch = {}
    if (man)   patch.avg_income_man   = man
    if (woman) patch.avg_income_woman = woman
    if (Object.keys(patch).length === 0) continue

    const { error } = await supabase
      .from('hoken_occupations')
      .update(patch)
      .eq('slug', slug)

    if (error) {
      console.error(`❌ ${slug}: ${error.message}`)
    } else {
      console.log(`✅ ${slug}: 男${man}万 / 女${woman}万`)
    }
  }

  console.log('\n🎉 e-Stat データ更新完了！')
}

run().catch(e => { console.error(e); process.exit(1) })
