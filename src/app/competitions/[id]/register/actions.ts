'use server'

import { requireUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function registerAthlete(formData: FormData) {
  const { supabase, user } = await requireUser()
  const competition_id = formData.get('competition_id') as string
  const division_id = formData.get('division_id') as string
  const affiliate = formData.get('affiliate') as string

  // Update profile affiliate if provided
  if (affiliate) {
    await supabase.from('profiles').update({ affiliate }).eq('id', user.id)
  }

  const { error } = await supabase.from('athletes').insert({
    competition_id,
    division_id,
    user_id: user.id,
    affiliate: affiliate || null,
  })

  if (error) throw error

  revalidatePath(`/competitions/${competition_id}`)
  redirect(`/competitions/${competition_id}`)
}

export async function unregister(formData: FormData) {
  const { supabase, user } = await requireUser()
  const competition_id = formData.get('competition_id') as string

  await supabase
    .from('athletes')
    .delete()
    .eq('competition_id', competition_id)
    .eq('user_id', user.id)

  revalidatePath(`/competitions/${competition_id}`)
  redirect(`/competitions/${competition_id}`)
}
