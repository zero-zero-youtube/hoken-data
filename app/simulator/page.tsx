import type { Metadata } from 'next'
import SimulatorClient from './SimulatorClient'
import { getAllOccupations } from '@/lib/data'

export const metadata: Metadata = {
  title: '保険料無料診断【職業・年齢・家族構成別】',
  description: '職業・年齢・性別・家族構成を入力するだけで、あなたに必要な保険と適正月額保険料の目安を無料で診断できます。政府統計データに基づく客観的な診断結果。',
}

export default async function SimulatorPage() {
  const occupations = await getAllOccupations()
  return <SimulatorClient occupations={occupations} />
}
