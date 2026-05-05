import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) redirect('/')
  return { supabase, user }
}

export async function requireOrganizer(competitionId: string) {
  const { supabase, user } = await requireUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    const { data: org } = await supabase
      .from('organizers')
      .select('user_id')
      .eq('competition_id', competitionId)
      .eq('user_id', user.id)
      .single()
    if (!org) redirect('/')
  }

  return { supabase, user, isAdmin: profile?.is_admin ?? false }
}
