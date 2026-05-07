'use server'

import { requireUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function parseValue(raw: string, scoreType: string): number {
  if (scoreType === 'for_time') {
    const parts = raw.trim().split(':')
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10)
      const secs = parseFloat(parts[1])
      return mins * 60 + secs
    }
    return parseFloat(raw)
  }
  return Number(raw)
}

export async function submitScore(formData: FormData) {
  const { supabase, user } = await requireUser()
  const competition_id = formData.get('competition_id') as string
  const workout_id = formData.get('workout_id') as string
  const division_id = formData.get('division_id') as string
  const score_type = formData.get('score_type') as string
  const value = parseValue(formData.get('value') as string, score_type)

  // Verify athlete is registered in this division
  const { data: athlete } = await supabase
    .from('athletes')
    .select('division_id')
    .eq('competition_id', competition_id)
    .eq('user_id', user.id)
    .single()

  if (!athlete || athlete.division_id !== division_id) {
    throw new Error('이 대회에 등록되지 않았습니다.')
  }

  await supabase.from('scores').upsert({
    workout_id,
    division_id,
    user_id: user.id,
    value,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'workout_id,division_id,user_id' })

  revalidatePath(`/competitions/${competition_id}/submit`)
}
