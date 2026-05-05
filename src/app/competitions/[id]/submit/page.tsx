import { requireUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { submitScore } from './actions'
import { CheckCircle, Clock } from 'lucide-react'

const SCORE_TYPE_LABEL: Record<string, string> = {
  for_time: 'For Time', amrap: 'AMRAP', max_weight: 'Max Weight',
}
const SCORE_UNIT: Record<string, string> = {
  for_time: '초', amrap: '회', max_weight: 'kg',
}

export default async function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requireUser()

  const { data: competition } = await supabase.from('competitions').select('name, status').eq('id', id).single()
  if (!competition) notFound()
  if (competition.status !== 'in_progress') redirect(`/competitions/${id}`)

  const { data: registration } = await supabase.from('athletes').select('division_id, divisions(name)').eq('competition_id', id).eq('user_id', user.id).single()
  if (!registration) redirect(`/competitions/${id}`)

  const division = registration.divisions as { name: string } | null
  const { data: workouts } = await supabase.from('workouts').select('*').eq('competition_id', id).order('sort_order')
  const workoutIds = workouts?.map(w => w.id) ?? []

  const { data: myScores } = workoutIds.length && registration.division_id
    ? await supabase.from('scores').select('workout_id, value, status').in('workout_id', workoutIds).eq('division_id', registration.division_id).eq('user_id', user.id)
    : { data: [] }

  const scoreMap = Object.fromEntries((myScores ?? []).map(s => [s.workout_id, s]))

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <a href={`/competitions/${id}`} style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>← 대회 정보</a>
        <h1 style={{ fontSize: 18, fontWeight: 500, margin: '8px 0 2px', color: 'var(--text)' }}>점수 제출</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{competition.name} · {division?.name}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {workouts?.map((w, i) => {
          const existing = scoreMap[w.id]
          const deadlinePassed = w.submission_deadline ? new Date(w.submission_deadline) < new Date() : false

          return (
            <div key={w.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 500, fontSize: 13, flexShrink: 0 }}>0{i + 1}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: '0 0 2px' }}>{w.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>{SCORE_TYPE_LABEL[w.score_type]}</p>
                  </div>
                </div>
                {existing && (
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, background: existing.status === 'confirmed' ? 'rgba(60,160,80,.15)' : 'rgba(244,180,0,.1)', color: existing.status === 'confirmed' ? '#7ab82e' : '#d4a500', border: `1px solid ${existing.status === 'confirmed' ? 'rgba(60,160,80,.3)' : 'rgba(244,180,0,.2)'}` }}>
                    <CheckCircle size={10} />
                    {existing.status === 'confirmed' ? '승인됨' : '검토 중'}
                  </span>
                )}
              </div>

              {deadlinePassed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-dim)' }}>
                  <Clock size={12} color="var(--text-dim)" /> 제출 마감됨
                </div>
              ) : existing?.status === 'confirmed' ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  제출 점수: <strong style={{ color: 'var(--text)' }}>{existing.value}{SCORE_UNIT[w.score_type]}</strong>
                </p>
              ) : (
                <form action={submitScore} style={{ display: 'flex', gap: 8 }}>
                  <input type="hidden" name="competition_id" value={id} />
                  <input type="hidden" name="workout_id" value={w.id} />
                  <input type="hidden" name="division_id" value={registration.division_id!} />
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input name="value" type="number" step="0.1" min="0" required defaultValue={existing?.value ?? ''} placeholder="0"
                      style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 40px 10px 12px', fontSize: 14, color: 'var(--text)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-dim)' }}>{SCORE_UNIT[w.score_type]}</span>
                  </div>
                  <button type="submit" style={{ padding: '10px 18px', background: 'var(--orange)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                    {existing ? '수정' : '제출'}
                  </button>
                </form>
              )}

              {w.submission_deadline && !deadlinePassed && (
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '10px 0 0' }}>
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
