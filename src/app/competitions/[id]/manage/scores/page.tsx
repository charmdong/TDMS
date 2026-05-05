import { requireOrganizer } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { confirmScore, rejectScore } from './actions'

export default async function ScoresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireOrganizer(id)

  const { data: competition } = await supabase
    .from('competitions')
    .select('name')
    .eq('id', id)
    .single()

  if (!competition) notFound()

  const { data: pending } = await supabase
    .from('scores')
    .select(`
      id, value, submitted_at,
      workouts ( name, score_type, competition_id ),
      divisions ( name ),
      profiles ( name, affiliate )
    `)
    .eq('status', 'pending')
    .eq('workouts.competition_id', id)
    .order('submitted_at')

  const filtered = pending?.filter(s => s.workouts !== null) ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <a href={`/competitions/${id}/manage`} className="text-sm text-gray-500 hover:text-gray-700">← 대회 관리</a>
        <h1 className="text-xl font-bold mt-1">점수 승인 — {competition.name}</h1>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-gray-400">대기 중인 점수가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const workout = s.workouts as { name: string; score_type: string } | null
            const division = s.divisions as { name: string } | null
            const profile = s.profiles as { name: string; affiliate: string | null } | null
            const displayValue = workout?.score_type === 'for_time'
              ? `${s.value}초`
              : workout?.score_type === 'max_weight'
              ? `${s.value}kg`
              : `${s.value}회`

            return (
              <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{profile?.name}</p>
                    {profile?.affiliate && <p className="text-xs text-gray-400">{profile.affiliate}</p>}
                    <p className="text-sm text-gray-600 mt-1">
                      {workout?.name} · {division?.name}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{displayValue}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(s.submitted_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <form action={confirmScore}>
                      <input type="hidden" name="competition_id" value={id} />
                      <input type="hidden" name="score_id" value={s.id} />
                      <button
                        type="submit"
                        className="w-full px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700"
                      >
                        승인
                      </button>
                    </form>
                    <form action={rejectScore}>
                      <input type="hidden" name="competition_id" value={id} />
                      <input type="hidden" name="score_id" value={s.id} />
                      <button
                        type="submit"
                        className="w-full px-4 py-1.5 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50"
                      >
                        거절
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
