import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { addOrganizer } from '@/app/admin/actions'

export default async function AdminCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [{ data: competition }, { data: organizers }] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    supabase
      .from('organizers')
      .select('user_id, profiles(name)')
      .eq('competition_id', id),
  ])

  if (!competition) notFound()

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</a>
        <h1 className="text-xl font-bold mt-1">{competition.name}</h1>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-700">Organizer 배정</h2>
        <div className="space-y-1">
          {organizers?.map(o => {
            const profile = o.profiles as { name: string } | null
            return (
              <div key={o.user_id} className="text-sm text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {profile?.name ?? o.user_id}
              </div>
            )
          })}
          {!organizers?.length && <p className="text-sm text-gray-400">배정된 Organizer 없음</p>}
        </div>
        <form action={addOrganizer} className="flex gap-2 pt-2">
          <input type="hidden" name="competition_id" value={id} />
          <input
            name="user_id"
            placeholder="User UUID (Supabase 대시보드에서 확인)"
            required
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700"
          >
            배정
          </button>
        </form>
        <p className="text-xs text-gray-400">
          User UUID는 Supabase 대시보드 → Authentication → Users에서 확인하세요.
        </p>
      </section>

      <a
        href={`/competitions/${id}/manage`}
        className="block text-sm text-blue-600 hover:text-blue-800"
      >
        대회 관리 페이지 →
      </a>
    </div>
  )
}
