'use server'

import { requireOrganizer } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function addDivision(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)
  const name = formData.get('name') as string

  await supabase.from('divisions').insert({ competition_id, name })
  revalidatePath(`/competitions/${competition_id}/manage`)
}

export async function deleteDivision(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)
  const id = formData.get('id') as string

  await supabase.from('divisions').delete().eq('id', id)
  revalidatePath(`/competitions/${competition_id}/manage`)
}

export async function addWorkout(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)

  await supabase.from('workouts').insert({
    competition_id,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    score_type: formData.get('score_type') as string,
    sort_order: Number(formData.get('sort_order') ?? 0),
    submission_deadline: (formData.get('submission_deadline') as string) || null,
  })
  revalidatePath(`/competitions/${competition_id}/manage`)
}

export async function deleteWorkout(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)
  const id = formData.get('id') as string

  await supabase.from('workouts').delete().eq('id', id)
  revalidatePath(`/competitions/${competition_id}/manage`)
}

export async function toggleLeaderboard(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)
  const id = formData.get('id') as string
  const visible = formData.get('visible') === 'true'

  await supabase.from('workouts').update({ leaderboard_visible: !visible }).eq('id', id)
  revalidatePath(`/competitions/${competition_id}/manage`)
}

export async function updateCompetition(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)

  await supabase.from('competitions').update({
    name: formData.get('name') as string,
    location: (formData.get('location') as string) || null,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    registration_deadline: (formData.get('registration_deadline') as string) || null,
    description: (formData.get('description') as string) || null,
  }).eq('id', competition_id)

  revalidatePath(`/competitions/${competition_id}/manage`)
  revalidatePath(`/competitions/${competition_id}`)
  revalidatePath('/')
}

export async function updateWorkout(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)
  const id = formData.get('id') as string

  await supabase.from('workouts').update({
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    sort_order: Number(formData.get('sort_order') ?? 0),
    submission_deadline: (formData.get('submission_deadline') as string) || null,
  }).eq('id', id)

  revalidatePath(`/competitions/${competition_id}/manage`)
}

export async function updateStatus(formData: FormData) {
  const competition_id = formData.get('competition_id') as string
  const { supabase } = await requireOrganizer(competition_id)
  const status = formData.get('status') as string

  await supabase.from('competitions').update({ status }).eq('id', competition_id)
  revalidatePath(`/competitions/${competition_id}/manage`)
  revalidatePath(`/competitions/${competition_id}`)
  revalidatePath('/')
}
