import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'

export default async function AuthButton() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
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
    <div className="flex items-center gap-3">
      {profile?.is_admin && (
        <Link href="/admin" className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full hover:bg-red-200">
          ADMIN
        </Link>
      )}
      <span className="text-sm text-gray-700">{profile?.name}</span>
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          로그아웃
        </button>
      </form>
    </div>
  )
}
