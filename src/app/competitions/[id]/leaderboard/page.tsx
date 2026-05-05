import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type ScoreRow = {
  user_id: string
  value: number
  workout_id: string
}

export default async function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: competition }, { data: divisions }, { data: workouts }] = await Promise.all([
    supabase.from('competitions').select('name, status').eq('id', id).single(),
    supabase.from('divisions').select('*').eq('competition_id', id).order('created_at'),
    supabase.from('workouts')
      .select('*')
      .eq('competition_id', id)
      .eq('leaderboard_visible', true)
      .order('sort_order'),
  ])

  if (!competition) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <a href={`/competitions/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← 대회 정보</a>
        <h1 className="text-xl font-bold mt-1">Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{competition.name}</p>
      </div>

      {!workouts?.length && (
        <p className="text-center py-12 text-gray-400">공개된 워크아웃이 없습니다.</p>
      )}

      {divisions?.map(division => (
        <DivisionLeaderboard
          key={division.id}
          divisionId={division.id}
          divisionName={division.name}
          workouts={workouts ?? []}
          competitionId={id}
        />
      ))}
    </div>
  )
}

async function DivisionLeaderboard({
  divisionId,
  divisionName,
  workouts,
  competitionId,
}: {
  divisionId: string
  divisionName: string
  workouts: { id: string; name: string; score_type: string }[]
  competitionId: string
}) {
  const supabase = await createClient()

  const { data: athletes } = await supabase
    .from('athletes')
    .select('user_id, profiles(name, affiliate)')
    .eq('competition_id', competitionId)
    .eq('division_id', divisionId)

  if (!athletes?.length) return null

  const workoutIds = workouts.map(w => w.id)
  const { data: scores } = workoutIds.length
    ? await supabase
        .from('scores')
        .select('user_id, value, workout_id')
        .in('workout_id', workoutIds)
        .eq('division_id', divisionId)
        .eq('status', 'confirmed')
    : { data: [] as ScoreRow[] }

  // Group scores by workout
  const scoreMap: Record<string, Record<string, number>> = {}
  for (const s of scores ?? []) {
    if (!scoreMap[s.workout_id]) scoreMap[s.workout_id] = {}
    scoreMap[s.workout_id][s.user_id] = s.value
  }

  // Calculate rank points per workout per athlete
  const rankPoints: Record<string, number> = {}
  for (const athlete of athletes) {
    rankPoints[athlete.user_id] = 0
  }

  for (const workout of workouts) {
    const wScores = scoreMap[workout.id] ?? {}
    const athleteScores = athletes
      .map(a => ({ userId: a.user_id, value: wScores[a.user_id] ?? null }))
      .filter(a => a.value !== null)

    // Sort by score type
    athleteScores.sort((a, b) =>
      workout.score_type === 'for_time'
        ? (a.value as number) - (b.value as number)
        : (b.value as number) - (a.value as number)
    )

    athleteScores.forEach((a, i) => {
      rankPoints[a.userId] = (rankPoints[a.userId] ?? 0) + (i + 1)
    })

    // Athletes with no score get rank = athletes.length + 1
    for (const athlete of athletes) {
      if (wScores[athlete.user_id] === undefined) {
        rankPoints[athlete.user_id] = (rankPoints[athlete.user_id] ?? 0) + athletes.length + 1
      }
    }
  }

  const ranked = athletes
    .map(a => ({
      userId: a.user_id,
      profile: a.profiles as { name: string; affiliate: string | null } | null,
      points: rankPoints[a.user_id] ?? 0,
      workoutScores: workouts.map(w => ({
        workoutId: w.id,
        scoreType: w.score_type,
        value: scoreMap[w.id]?.[a.user_id] ?? null,
      })),
    }))
    .sort((a, b) => a.points - b.points)

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{divisionName}</h2>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 w-8">#</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">선수</th>
                {workouts.map((w, i) => (
                  <th key={w.id} className="px-3 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">
                    W{i + 1}
                  </th>
                ))}
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">합계</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ranked.map((athlete, i) => (
                <tr key={athlete.userId} className={i === 0 ? 'bg-yellow-50' : ''}>
                  <td className="px-4 py-3 text-gray-500 font-medium">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{athlete.profile?.name ?? '—'}</p>
                    {athlete.profile?.affiliate && (
                      <p className="text-xs text-gray-400">{athlete.profile.affiliate}</p>
                    )}
                  </td>
                  {athlete.workoutScores.map(ws => (
                    <td key={ws.workoutId} className="px-3 py-3 text-center text-gray-700">
                      {ws.value === null ? (
                        <span className="text-gray-300">—</span>
                      ) : ws.scoreType === 'for_time' ? (
                        `${ws.value}s`
                      ) : ws.scoreType === 'max_weight' ? (
                        `${ws.value}kg`
                      ) : (
                        `${ws.value}`
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{athlete.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
