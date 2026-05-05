import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { registerAthlete } from './actions'

export default async function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requireUser()

  const [{ data: competition }, { data: divisions }, { data: profile }, { data: existing }] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    supabase.from('divisions').select('*').eq('competition_id', id).order('created_at'),
    supabase.from('profiles').select('name, affiliate').eq('id', user.id).single(),
    supabase.from('athletes').select('division_id').eq('competition_id', id).eq('user_id', user.id).maybeSingle(),
  ])

  if (!competition) notFound()
  if (competition.status !== 'open') redirect(`/competitions/${id}`)
  if (existing) redirect(`/competitions/${id}`)

  const deadlinePassed = competition.registration_deadline
    ? new Date(competition.registration_deadline) < new Date()
    : false
  if (deadlinePassed) redirect(`/competitions/${id}`)

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <a href={`/competitions/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← 대회 정보</a>
        <h1 className="text-xl font-bold mt-1">참가 신청</h1>
        <p className="text-sm text-gray-500 mt-1">{competition.name}</p>
      </div>

      <form action={registerAthlete} className="space-y-4">
        <input type="hidden" name="competition_id" value={id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            value={profile?.name ?? ''}
            disabled
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">소속 박스</label>
          <input
            name="affiliate"
            type="text"
            defaultValue={profile?.affiliate ?? ''}
            placeholder="CrossFit Anywhere"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">부문 선택 *</label>
          {!divisions?.length ? (
            <p className="text-sm text-gray-400">등록된 부문이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {divisions.map(d => (
                <label key={d.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 has-[:checked]:border-gray-900 has-[:checked]:bg-gray-50">
                  <input type="radio" name="division_id" value={d.id} required className="accent-gray-900" />
                  <span className="text-sm font-medium text-gray-900">{d.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!divisions?.length}
          className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          신청 완료
        </button>
      </form>
    </div>
  )
}
