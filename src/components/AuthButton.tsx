import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'

export default async function AuthButton() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)' }}>
        로그인
      </Link>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, is_admin')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {profile?.is_admin && (
        <Link href="/admin" style={{ fontSize: 10, fontWeight: 600, color: 'var(--orange)', background: 'var(--orange-dim)', border: '1px solid var(--orange-border)', padding: '3px 8px', borderRadius: 4, textDecoration: 'none', letterSpacing: 0.5 }}>
          ADMIN
        </Link>
      )}
      <Link href="/profile" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>{profile?.name}</Link>
      <form action={signOut}>
        <button type="submit" style={{ fontSize: 12, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          로그아웃
        </button>
      </form>
    </div>
  )
}
