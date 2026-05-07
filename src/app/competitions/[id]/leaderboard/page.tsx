import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Trophy } from 'lucide-react'
import LeaderboardClient from './LeaderboardClient'

export default async function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: competition }, { data: divisions }, { data: workouts }] = await Promise.all([
    supabase.from('competitions').select('name, status').eq('id', id).single(),
    supabase.from('divisions').select('id, name').eq('competition_id', id).order('created_at'),
    supabase.from('workouts').select('id, name, score_type').eq('competition_id', id).eq('leaderboard_visible', true).order('sort_order'),
  ])

  if (!competition) notFound()

  const divisionList = divisions ?? []
  const workoutList = workouts ?? []
  const workoutIds = workoutList.map(w => w.id)

  // Fetch athletes and initial scores for all divisions in parallel
  const [athletesResults, scoresResults] = await Promise.all([
    Promise.all(
      divisionList.map(div =>
        supabase
          .from('athletes')
          .select('user_id, profiles(name, affiliate)')
          .eq('competition_id', id)
          .eq('division_id', div.id)
          .then(({ data }) => ({ divisionId: div.id, athletes: (data ?? []).map(a => ({ user_id: a.user_id, profile: a.profiles as { name: string; affiliate: string | null } | null })) }))
      )
    ),
    workoutIds.length
      ? Promise.all(
          divisionList.map(div =>
            supabase
              .from('scores')
              .select('user_id, value, workout_id')
              .in('workout_id', workoutIds)
              .eq('division_id', div.id)
              .eq('status', 'confirmed')
              .then(({ data }) => ({ divisionId: div.id, scores: data ?? [] }))
          )
        )
      : Promise.resolve(divisionList.map(div => ({ divisionId: div.id, scores: [] }))),
  ])

  const athletesByDivision = Object.fromEntries(athletesResults.map(r => [r.divisionId, r.athletes]))
  const initialScoresByDivision = Object.fromEntries(scoresResults.map(r => [r.divisionId, r.scores]))

  return (
    <div style={{ padding: 16, maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <a href={`/competitions/${id}`} style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>← 대회 정보</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Trophy size={16} color="var(--orange)" />
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0, color: 'var(--text)' }}>Leaderboard</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{competition.name}</p>
      </div>

      {!workoutList.length ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 13 }}>공개된 워크아웃이 없습니다.</div>
      ) : (
        <LeaderboardClient
          competitionId={id}
          divisions={divisionList}
          workouts={workoutList}
          athletesByDivision={athletesByDivision}
          initialScoresByDivision={initialScoresByDivision}
        />
      )}
    </div>
  )
}
