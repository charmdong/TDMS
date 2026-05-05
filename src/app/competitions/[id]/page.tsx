import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar, Clock, Zap, Users, ArrowRight, CheckCircle } from 'lucide-react'
import { unregister } from './register/actions'

const STATUS_LABEL: Record<string, string> = {
  draft: '준비 중', open: '신청 가능', in_progress: '진행 중', closed: '종료',
}
const SCORE_TYPE_LABEL: Record<string, string> = {
  for_time: 'For Time', amrap: 'AMRAP', max_weight: 'Max Weight',
}

const infoCell = (Icon: React.ElementType, label: string, val: string, hot = false) => (
  <div key={label} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
      <Icon size={10} color="var(--text-dim)" /> {label}
    </div>
    <div style={{ fontSize: 13, fontWeight: 500, color: hot ? 'var(--orange)' : 'var(--text)' }}>{val}</div>
  </div>
)

export default async function CompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: competition }, { data: divisions }, { data: workouts }, { data: registration }] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    supabase.from('divisions').select('*').eq('competition_id', id).order('created_at'),
    supabase.from('workouts').select('*').eq('competition_id', id).order('sort_order'),
    user
      ? supabase.from('athletes').select('division_id, divisions(name)').eq('competition_id', id).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (!competition) notFound()

  const start = new Date(competition.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const end = new Date(competition.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  const deadlinePassed = competition.registration_deadline
    ? new Date(competition.registration_deadline) < new Date()
    : false
  const dday = competition.registration_deadline
    ? Math.ceil((new Date(competition.registration_deadline).getTime() - Date.now()) / 86400000)
    : null

  const isRegistered = !!registration
  const canRegister = competition.status === 'open' && !deadlinePassed && !!user && !isRegistered
  const registeredDivision = registration?.divisions as { name: string } | null

  return (
    <div style={{ padding: 16, maxWidth: 680, margin: '0 auto' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 100% 0%, rgba(244,80,30,.08) 0%, transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 4, background: competition.status === 'in_progress' ? 'rgba(60,160,80,.15)' : competition.status === 'open' ? 'var(--orange-dim)' : 'rgba(255,255,255,.06)', color: competition.status === 'in_progress' ? '#7ab82e' : competition.status === 'open' ? 'var(--orange)' : 'var(--text-dim)' }}>
              {STATUS_LABEL[competition.status]}
            </span>
            {dday !== null && dday > 0 && dday <= 14 && (
              <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 4, color: 'var(--orange)', background: 'var(--orange-dim)', border: '1px solid var(--orange-border)' }}>D-{dday}</span>
            )}
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{competition.name}</div>
          {competition.description && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 10, whiteSpace: 'pre-line' }}>{competition.description}</div>
          )}
        </div>

        {/* Info grid */}
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {infoCell(Calendar, '일시', `${start} – ${end}`)}
            {competition.location && infoCell(MapPin, '장소', competition.location)}
            {competition.registration_deadline && infoCell(Clock, '신청 마감', dday !== null && dday > 0 ? `D-${dday}` : '마감', dday !== null && dday <= 7 && dday > 0)}
          </div>
        </div>

        {/* Registration state */}
        {isRegistered ? (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(60,160,80,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} color="#7ab82e" />
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#7ab82e', margin: 0 }}>참가 신청 완료</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>{registeredDivision?.name}</p>
              </div>
            </div>
            <form action={unregister}>
              <input type="hidden" name="competition_id" value={id} />
              <button type="submit" style={{ fontSize: 11, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>취소</button>
            </form>
          </div>
        ) : canRegister ? (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <Link href={`/competitions/${id}/register`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', background: 'var(--orange)', color: '#fff', padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              참가 신청하기 <ArrowRight size={15} />
            </Link>
          </div>
        ) : competition.status === 'open' && !user ? (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '12px 0', borderRadius: 10, fontSize: 13, textDecoration: 'none' }}>
              로그인 후 참가 신청
            </Link>
          </div>
        ) : null}

        {/* CTA buttons */}
        {(competition.status === 'in_progress' || competition.status === 'closed') && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <Link href={`/competitions/${id}/leaderboard`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid var(--orange-border)', color: 'var(--orange)', padding: '10px 0', borderRadius: 10, fontSize: 13, textDecoration: 'none', background: 'var(--orange-dim)' }}>
              Leaderboard →
            </Link>
            {isRegistered && competition.status === 'in_progress' && (
              <Link href={`/competitions/${id}/submit`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '10px 0', borderRadius: 10, fontSize: 13, textDecoration: 'none' }}>
                점수 제출 →
              </Link>
            )}
          </div>
        )}

        {/* Divisions */}
        {divisions && divisions.length > 0 && (
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>부문</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {divisions.map(d => (
                <span key={d.id} style={{ fontSize: 12, padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-muted)', background: 'var(--surface-2)' }}>
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Workouts */}
        {workouts && workouts.length > 0 && (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Zap size={11} color="var(--orange)" /> WOD 종목
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {workouts.map((w, i) => (
                <div key={w.id} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: i < workouts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 500, fontSize: 13, flexShrink: 0, minWidth: 20 }}>0{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: w.description ? 4 : 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{w.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{SCORE_TYPE_LABEL[w.score_type]}</span>
                    </div>
                    {w.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{w.description}</p>}
                    {w.submission_deadline && (
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' }}>
                        제출 마감: {new Date(w.submission_deadline).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
