import { requireOrganizer } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { confirmScore, rejectScore, confirmAllByWorkout } from './actions'

function formatValue(value: number, scoreType: string) {
  if (scoreType === 'for_time') {
    const m = Math.floor(value / 60)
    const s = value % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }
  if (scoreType === 'max_weight') return `${value}kg`
  return `${value}회`
}

type ScoreRow = {
  id: string
  value: number
  submitted_at: string
  workouts: { id: string; name: string; score_type: string } | null
  divisions: { id: string; name: string } | null
  profiles: { name: string; affiliate: string | null } | null
}

export default async function ScoresPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ division?: string }>
}) {
  const { id } = await params
  const { division: selectedDivision } = await searchParams
  const { supabase } = await requireOrganizer(id)

  const [{ data: competition }, { data: divisions }, { data: pending }] = await Promise.all([
    supabase.from('competitions').select('name').eq('id', id).single(),
    supabase.from('divisions').select('id, name').eq('competition_id', id).order('created_at'),
    supabase
      .from('scores')
      .select('id, value, submitted_at, workouts(id, name, score_type, competition_id), divisions(id, name), profiles(name, affiliate)')
      .eq('status', 'pending')
      .eq('workouts.competition_id', id)
      .order('submitted_at'),
  ])

  if (!competition) notFound()

  // workouts.competition_id 필터가 join 레벨이라 workouts가 null인 행 제거
  const scores = (pending?.filter(s => s.workouts !== null) ?? []) as ScoreRow[]

  // 부문 필터 적용
  const activeDivision = selectedDivision ?? divisions?.[0]?.id
  const filtered = activeDivision ? scores.filter(s => s.divisions?.id === activeDivision) : scores

  // 워크아웃별 그룹핑 (순서 유지)
  const workoutOrder: string[] = []
  const grouped: Record<string, ScoreRow[]> = {}
  for (const s of filtered) {
    const wid = s.workouts!.id
    if (!grouped[wid]) { grouped[wid] = []; workoutOrder.push(wid) }
    grouped[wid].push(s)
  }

  const totalPending = scores.length
  const divisionPending = filtered.length

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <a href={`/competitions/${id}/manage`} style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>← 대회 관리</a>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: 0 }}>점수 승인</h1>
          {totalPending > 0 && (
            <span style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 500 }}>{totalPending}건 대기</span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{competition.name}</p>
      </div>

      {/* Division tabs */}
      {(divisions?.length ?? 0) > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {divisions!.map(div => {
            const count = scores.filter(s => s.divisions?.id === div.id).length
            const isActive = (activeDivision === div.id) || (!selectedDivision && div.id === divisions![0].id)
            return (
              <a
                key={div.id}
                href={`/competitions/${id}/manage/scores?division=${div.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  textDecoration: 'none', border: '1px solid',
                  background: isActive ? 'var(--text)' : 'var(--surface)',
                  color: isActive ? 'var(--bg)' : 'var(--text-muted)',
                  borderColor: isActive ? 'var(--text)' : 'var(--border)',
                }}
              >
                {div.name}
                {count > 0 && (
                  <span style={{ fontSize: 11, background: isActive ? 'rgba(255,255,255,.2)' : 'var(--orange-dim)', color: isActive ? 'var(--bg)' : 'var(--orange)', padding: '0 5px', borderRadius: 8 }}>
                    {count}
                  </span>
                )}
              </a>
            )
          })}
        </div>
      )}

      {/* Content */}
      {divisionPending === 0 ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 13 }}>대기 중인 점수가 없습니다.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {workoutOrder.map(wid => {
            const workoutScores = grouped[wid]
            const workout = workoutScores[0].workouts!
            const division = workoutScores[0].divisions!

            return (
              <section key={wid}>
                {/* Workout header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{workout.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '1px 7px', borderRadius: 10 }}>
                      {workoutScores.length}건
                    </span>
                  </div>
                  <form action={confirmAllByWorkout}>
                    <input type="hidden" name="competition_id" value={id} />
                    <input type="hidden" name="workout_id" value={wid} />
                    <input type="hidden" name="division_id" value={division.id} />
                    <button type="submit" style={{ fontSize: 12, padding: '4px 12px', background: 'rgba(34,139,34,.1)', color: '#1a7a1a', border: '1px solid rgba(34,139,34,.25)', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
                      전체 승인
                    </button>
                  </form>
                </div>

                {/* Score cards */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  {workoutScores.map((s, i) => {
                    const profile = s.profiles
                    const displayValue = formatValue(s.value, workout.score_type)
                    return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: i < workoutScores.length - 1 ? '1px solid var(--border)' : 'none', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{profile?.name ?? '—'}</span>
                            {profile?.affiliate && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{profile.affiliate}</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                            <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{displayValue}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                              {new Date(s.submitted_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <form action={confirmScore}>
                            <input type="hidden" name="competition_id" value={id} />
                            <input type="hidden" name="score_id" value={s.id} />
                            <button type="submit" style={{ padding: '6px 14px', background: 'rgba(34,139,34,.1)', color: '#1a7a1a', border: '1px solid rgba(34,139,34,.25)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                              승인
                            </button>
                          </form>
                          <form action={rejectScore}>
                            <input type="hidden" name="competition_id" value={id} />
                            <input type="hidden" name="score_id" value={s.id} />
                            <button type="submit" style={{ padding: '6px 14px', background: 'var(--surface)', color: 'var(--text-dim)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                              거절
                            </button>
                          </form>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
