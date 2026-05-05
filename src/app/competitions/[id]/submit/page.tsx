import { requireUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { submitScore } from './actions'

const SCORE_TYPE_LABEL: Record<string, string> = {
  for_time: 'For Time', amrap: 'AMRAP', max_weight: 'Max Weight',
}
const SCORE_UNIT: Record<string, string> = {
  for_time: '초', amrap: '회', max_weight: 'kg',
}

export default async function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requireUser()

  const { data: competition } = await supabase
    .from('competitions')
    .select('name, status')
    .eq('id', id)
    .single()

  if (!competition) notFound()
  if (competition.status !== 'in_progress') redirect(`/competitions/${id}`)

  const { data: registration } = await supabase
    .from('athletes')
    .select('division_id, divisions(name)')
    .eq('competition_id', id)
    .eq('user_id', user.id)
    .single()

  if (!registration) redirect(`/competitions/${id}`)

  const division = registration.divisions as { name: string } | null

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('competition_id', id)
    .order('sort_order')

  // Fetch existing scores for this athlete
  const workoutIds = workouts?.map(w => w.id) ?? []
  const { data: myScores } = workoutIds.length && registration.division_id
    ? await supabase
        .from('scores')
        .select('workout_id, value, status')
        .in('workout_id', workoutIds)
        .eq('division_id', registration.division_id)
        .eq('user_id', user.id)
    : { data: [] }

  const scoreMap = Object.fromEntries((myScores ?? []).map(s => [s.workout_id, s]))

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <a href={`/competitions/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← 대회 정보</a>
        <h1 className="text-xl font-bold mt-1">점수 제출</h1>
        <p className="text-sm text-gray-500 mt-0.5">{competition.name} · {division?.name}</p>
      </div>

      <div className="space-y-4">
        {workouts?.map((w, i) => {
          const existing = scoreMap[w.id]
          const deadlinePassed = w.submission_deadline
            ? new Date(w.submission_deadline) < new Date()
            : false

          return (
            <div key={w.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{i + 1}. {w.name}</h3>
                  <p className="text-xs text-gray-400">{SCORE_TYPE_LABEL[w.score_type]}</p>
                </div>
                {existing && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    existing.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {existing.status === 'confirmed' ? '승인됨' : '검토 중'}
                  </span>
                )}
              </div>

              {deadlinePassed ? (
                <p className="text-sm text-gray-400">제출 마감됨</p>
              ) : existing?.status === 'confirmed' ? (
                <p className="text-sm text-gray-500">
                  제출 점수: <strong>{existing.value}{SCORE_UNIT[w.score_type]}</strong>
                </p>
              ) : (
                <form action={submitScore} className="flex gap-2">
                  <input type="hidden" name="competition_id" value={id} />
                  <input type="hidden" name="workout_id" value={w.id} />
                  <input type="hidden" name="division_id" value={registration.division_id!} />
                  <div className="flex-1 relative">
                    <input
                      name="value"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      defaultValue={existing?.value ?? ''}
                      placeholder="0"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-400">{SCORE_UNIT[w.score_type]}</span>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700"
                  >
                    {existing ? '수정' : '제출'}
                  </button>
                </form>
              )}

              {w.submission_deadline && !deadlinePassed && (
                <p className="mt-2 text-xs text-gray-400">
                  마감: {new Date(w.submission_deadline).toLocaleString('ko-KR')}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
