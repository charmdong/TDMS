'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type Workout = { id: string; name: string; score_type: string }
type Athlete = { user_id: string; profile: { name: string; affiliate: string | null } | null }
type ScoreRow = { user_id: string; value: number; workout_id: string }

const MEDAL: Record<number, string> = { 1: '#D4AF37', 2: '#9E9E9E', 3: '#CD7F32' }

function calcRanked(athletes: Athlete[], workouts: Workout[], scores: ScoreRow[]) {
  const scoreMap: Record<string, Record<string, number>> = {}
  for (const s of scores) {
    if (!scoreMap[s.workout_id]) scoreMap[s.workout_id] = {}
    scoreMap[s.workout_id][s.user_id] = s.value
  }

  const rankPoints: Record<string, number> = {}
  for (const a of athletes) rankPoints[a.user_id] = 0

  for (const workout of workouts) {
    const wScores = scoreMap[workout.id] ?? {}
    const ranked = athletes
      .map(a => ({ userId: a.user_id, value: wScores[a.user_id] ?? null }))
      .filter(a => a.value !== null) as { userId: string; value: number }[]
    ranked.sort((a, b) =>
      workout.score_type === 'for_time' ? a.value - b.value : b.value - a.value
    )
    ranked.forEach((a, i) => { rankPoints[a.userId] += i + 1 })
    for (const a of athletes) {
      if (wScores[a.user_id] === undefined) rankPoints[a.user_id] += athletes.length + 1
    }
  }

  return athletes
    .map(a => ({
      userId: a.user_id,
      profile: a.profile,
      points: rankPoints[a.user_id] ?? 0,
      workoutScores: workouts.map(w => ({
        workoutId: w.id,
        scoreType: w.score_type,
        value: scoreMap[w.id]?.[a.user_id] ?? null,
      })),
    }))
    .sort((a, b) => a.points - b.points)
}

function formatScore(value: number | null, scoreType: string): string {
  if (value === null) return '—'
  if (scoreType === 'for_time') {
    const m = Math.floor(value / 60)
    const s = value % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }
  if (scoreType === 'max_weight') return `${value}kg`
  return `${value}`
}

type Props = {
  competitionId: string
  divisions: { id: string; name: string }[]
  workouts: Workout[]
  athletesByDivision: Record<string, Athlete[]>
  initialScoresByDivision: Record<string, ScoreRow[]>
}

export default function LeaderboardClient({ competitionId, divisions, workouts, athletesByDivision, initialScoresByDivision }: Props) {
  const [scoresByDivision, setScoresByDivision] = useState(initialScoresByDivision)
  const [live, setLive] = useState(false)

  const workoutIds = workouts.map(w => w.id)

  const refetch = useCallback(async () => {
    if (!workoutIds.length) return
    const supabase = createClient()
    const results = await Promise.all(
      divisions.map(async (div) => {
        const { data } = await supabase
          .from('scores')
          .select('user_id, value, workout_id')
          .in('workout_id', workoutIds)
          .eq('division_id', div.id)
          .eq('status', 'confirmed')
        return [div.id, data ?? []] as const
      })
    )
    setScoresByDivision(Object.fromEntries(results))
  }, [divisions, workoutIds.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`leaderboard:${competitionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, () => {
        refetch()
      })
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED')
      })
    return () => { supabase.removeChannel(channel) }
  }, [competitionId, refetch])

  if (!workouts.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {live && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a7a1a', display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: '#1a7a1a', fontWeight: 500 }}>LIVE</span>
        </div>
      )}

      {divisions.map(division => {
        const athletes = athletesByDivision[division.id] ?? []
        if (!athletes.length) return null
        const scores = scoresByDivision[division.id] ?? []
        const ranked = calcRanked(athletes, workouts, scores)

        return (
          <section key={division.id}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              {division.name}
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {ranked.map((athlete, i) => (
                <div key={athlete.userId} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: i < ranked.length - 1 ? '1px solid var(--border)' : 'none', minWidth: 0, overflowX: 'auto' }}>
                  <div style={{ width: 24, fontSize: 14, fontWeight: 500, color: MEDAL[i + 1] ?? 'var(--text-dim)', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', marginRight: 12, flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-dim)' }}>
                    {athlete.profile?.name?.slice(0, 1) ?? '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{athlete.profile?.name ?? '—'}</div>
                    {athlete.profile?.affiliate && (
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{athlete.profile.affiliate}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginLeft: 8 }}>
                    {athlete.workoutScores.map(ws => (
                      <span key={ws.workoutId} style={{ fontSize: 12, color: ws.value !== null ? 'var(--text-muted)' : 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatScore(ws.value, ws.scoreType)}
                      </span>
                    ))}
                    <span style={{ fontSize: 14, fontWeight: 500, color: i === 0 ? MEDAL[1] : 'var(--text)', fontVariantNumeric: 'tabular-nums', marginLeft: 4 }}>
                      {athlete.points}pt
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
