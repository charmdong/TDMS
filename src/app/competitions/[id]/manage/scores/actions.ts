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
