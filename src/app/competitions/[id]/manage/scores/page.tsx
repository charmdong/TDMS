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
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <a href={`/competitions/${id}/manage`} style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>← 대회 관리</a>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: '6px 0 0' }}>점수 승인 — {competition.name}</h1>
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 13 }}>대기 중인 점수가 없습니다.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{profile?.name}</p>
                  {profile?.affiliate && <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0' }}>{profile.affiliate}</p>}
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>{workout?.name} · {division?.name}</p>
                  <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: '4px 0 0' }}>{displayValue}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' }}>
                    {new Date(s.submitted_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <form action={confirmScore}>
                    <input type="hidden" name="competition_id" value={id} />
                    <input type="hidden" name="score_id" value={s.id} />
                    <button type="submit" style={{ width: '100%', padding: '6px 16px', background: 'rgba(34,139,34,.1)', color: '#1a7a1a', border: '1px solid rgba(34,139,34,.25)', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                      승인
                    </button>
                  </form>
                  <form action={rejectScore}>
                    <input type="hidden" name="competition_id" value={id} />
                    <input type="hidden" name="score_id" value={s.id} />
                    <button type="submit" style={{ width: '100%', padding: '6px 16px', background: 'var(--surface)', color: 'var(--text-dim)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                      거절
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
