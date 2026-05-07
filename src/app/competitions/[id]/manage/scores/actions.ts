'use server'

import { requireOrganizer } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function confirmScore(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)
  const score_id = formData.get('score_id') as string

  await supabase
    .from('scores')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', score_id)

  revalidatePath(`/competitions/${competition_id}/manage/scores`)
}

export async function rejectScore(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)
  const score_id = formData.get('score_id') as string

  await supabase.from('scores').delete().eq('id', score_id)
  revalidatePath(`/competitions/${competition_id}/manage/scores`)
}

export async function confirmAllByWorkout(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)
  const workout_id = formData.get('workout_id') as string
  const division_id = formData.get('division_id') as string

  await supabase
    .from('scores')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('workout_id', workout_id)
    .eq('division_id', division_id)
    .eq('status', 'pending')

  revalidatePath(`/competitions/${competition_id}/manage/scores`)
}
