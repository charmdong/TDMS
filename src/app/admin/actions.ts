'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCompetition(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const registration_deadline = formData.get('registration_deadline') as string

  const { data, error } = await supabase.from('competitions').insert({
    name,
    description: description || null,
    location: location || null,
    start_date,
    end_date,
    registration_deadline: registration_deadline || null,
    created_by: user.id,
    status: 'draft',
  }).select('id').single()

  if (error) throw error
  redirect(`/competitions/${data.id}/manage`)
}

export async function addOrganizer(formData: FormData) {
  const { supabase } = await requireAdmin()
  const competition_id = formData.get('competition_id') as string
  const user_id = formData.get('user_id') as string

  await supabase.from('organizers').upsert({ competition_id, user_id })
  revalidatePath(`/competitions/${competition_id}/manage`)
}

export async function updateCompetitionStatus(formData: FormData) {
  const { supabase } = await requireAdmin()
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  await supabase.from('competitions').update({ status }).eq('id', id)
  revalidatePath(`/competitions/${id}/manage`)
}
