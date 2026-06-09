import type { Metadata } from 'next'
import { getAllOccupations } from '@/lib/data'
import OccupationListClient from './OccupationListClient'

export const metadata: Metadata = {
  title: '職業別 保険料相場一覧【20職業】政府統計データで比較',
  description: '20職業の保険料相場を政府統計データで比較。カテゴリで絞り込んで、あなたの職業に合った医療保険・生命保険・収入保障の月額目安を無料で確認できます。',
}

export default async function OccupationListPage() {
  const occupations = await getAllOccupations()
  return <OccupationListClient occupations={occupations} />
}
