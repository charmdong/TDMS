'use server'

import { requireUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser()
  const name = (formData.get('name') as string).trim()
  const affiliate = (formData.get('affiliate') as string).trim()

  if (!name) return

  await supabase.from('profiles').update({
    name,
    affiliate: affiliate || null,
  }).eq('id', user.id)

  revalidatePath('/profile')
}
