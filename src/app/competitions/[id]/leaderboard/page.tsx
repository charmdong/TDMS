import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Trophy } from 'lucide-react'

type ScoreRow = { user_id: string; value: number; workout_id: string }
const MEDAL: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' }

export default async function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: competition }, { data: divisions }, { data: workouts }] = await Promise.all([
    supabase.from('competitions').select('name, status').eq('id', id).single(),
    supabase.from('divisions').select('*').eq('competition_id', id).order('created_at'),
    supabase.from('workouts').select('*').eq('competition_id', id).eq('leaderboard_visible', true).order('sort_order'),
  ])

  if (!competition) notFound()

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

      {!workouts?.length && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 13 }}>공개된 워크아웃이 없습니다.</div>
      )}

      {divisions?.map(division => (
        <DivisionLeaderboard key={division.id} divisionId={division.id} divisionName={division.name} workouts={workouts ?? []} competitionId={id} />
      ))}
    </div>
  )
}

async function DivisionLeaderboard({ divisionId, divisionName, workouts, competitionId }: {
  divisionId: string; divisionName: string
  workouts: { id: string; name: string; score_type: string }[]; competitionId: string
}) {
  const supabase = await createClient()

  const { data: athletes } = await supabase
    .from('athletes').select('user_id, profiles(name, affiliate)').eq('competition_id', competitionId).eq('division_id', divisionId)

  if (!athletes?.length) return null

  const workoutIds = workouts.map(w => w.id)
  const { data: scores } = workoutIds.length
    ? await supabase.from('scores').select('user_id, value, workout_id').in('workout_id', workoutIds).eq('division_id', divisionId).eq('status', 'confirmed')
    : { data: [] as ScoreRow[] }

  const scoreMap: Record<string, Record<string, number>> = {}
  for (const s of scores ?? []) {
    if (!scoreMap[s.workout_id]) scoreMap[s.workout_id] = {}
    scoreMap[s.workout_id][s.user_id] = s.value
  }

  const rankPoints: Record<string, number> = {}
  for (const a of athletes) rankPoints[a.user_id] = 0

  for (const workout of workouts) {
    const wScores = scoreMap[workout.id] ?? {}
    const ranked = athletes.map(a => ({ userId: a.user_id, value: wScores[a.user_id] ?? null })).filter(a => a.value !== null)
    ranked.sort((a, b) => workout.score_type === 'for_time' ? (a.value as number) - (b.value as number) : (b.value as number) - (a.value as number))
    ranked.forEach((a, i) => { rankPoints[a.userId] = (rankPoints[a.userId] ?? 0) + (i + 1) })
    for (const a of athletes) {
      if (wScores[a.user_id] === undefined) rankPoints[a.user_id] = (rankPoints[a.user_id] ?? 0) + athletes.length + 1
    }
  }

  const ranked = athletes.map(a => ({
    userId: a.user_id,
    profile: a.profiles as { name: string; affiliate: string | null } | null,
    points: rankPoints[a.user_id] ?? 0,
    workoutScores: workouts.map(w => ({ workoutId: w.id, scoreType: w.score_type, value: scoreMap[w.id]?.[a.user_id] ?? null })),
  })).sort((a, b) => a.points - b.points)

  const formatScore = (value: number | null, scoreType: string) => {
    if (value === null) return '—'
    if (scoreType === 'for_time') return `${value}s`
    if (scoreType === 'max_weight') return `${value}kg`
    return `${value}`
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>{divisionName}</div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {ranked.map((athlete, i) => (
          <div key={athlete.userId} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: i < ranked.length - 1 ? '1px solid var(--surface-2)' : 'none', background: i === 0 ? 'rgba(255,215,0,.03)' : 'transparent' }}>
            <div style={{ width: 24, fontSize: 14, fontWeight: 500, color: MEDAL[i + 1] ?? 'var(--text-dim)', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', marginRight: 12, flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-dim)' }}>
              {athlete.profile?.name?.slice(0, 1) ?? '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{athlete.profile?.name ?? '—'}</div>
              {athlete.profile?.affiliate && <div style={{ fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{athlete.profile.affiliate}</div>}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginLeft: 8 }}>
              {athlete.workoutScores.map(ws => (
                <span key={ws.workoutId} style={{ fontSize: 12, color: ws.value !== null ? 'var(--text-muted)' : 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatScore(ws.value, ws.scoreType)}
                </span>
              ))}
              <span style={{ fontSize: 14, fontWeight: 500, color: i === 0 ? '#FFD700' : 'var(--text)', fontVariantNumeric: 'tabular-nums', marginLeft: 4 }}>{athlete.points}pt</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
