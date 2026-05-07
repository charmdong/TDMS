import { requireOrganizer } from '@/lib/auth'
import { notFound } from 'next/navigation'

export default async function AthletesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireOrganizer(id)

  const [{ data: competition }, { data: divisions }, { data: athletes }] = await Promise.all([
    supabase.from('competitions').select('name').eq('id', id).single(),
    supabase.from('divisions').select('id, name').eq('competition_id', id).order('created_at'),
    supabase
      .from('athletes')
      .select('user_id, affiliate, registered_at, division_id, profiles(name)')
      .eq('competition_id', id)
      .order('registered_at'),
  ])

  if (!competition) notFound()

  const byDivision = Object.fromEntries((divisions ?? []).map(d => [d.id, [] as typeof athletes]))
  const unassigned: typeof athletes = []
  for (const a of athletes ?? []) {
    if (a.division_id && byDivision[a.division_id]) {
      byDivision[a.division_id]!.push(a)
    } else {
      unassigned.push(a)
    }
  }

  const total = athletes?.length ?? 0

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <a href={`/competitions/${id}/manage`} style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>← 대회 관리</a>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: 0 }}>참가자 목록</h1>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>총 {total}명</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{competition.name}</p>
      </div>

      {total === 0 ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 13 }}>아직 신청자가 없습니다.</p>
      ) : (
        <>
          {(divisions ?? []).map(division => {
            const list = byDivision[division.id] ?? []
            if (!list.length) return null
            return (
              <section key={division.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{division.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '1px 7px', borderRadius: 10 }}>{list.length}명</span>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  {list.map((a, i) => {
                    const profile = a.profiles as { name: string } | null
                    const registeredAt = new Date(a.registered_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                    return (
                      <div key={a.user_id} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: 28, fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{profile?.name ?? '—'}</span>
                          {a.affiliate && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{a.affiliate}</span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>{registeredAt}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {unassigned.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>부문 미정</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '1px 7px', borderRadius: 10 }}>{unassigned.length}명</span>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {unassigned.map((a, i) => {
                  const profile = a.profiles as { name: string } | null
                  return (
                    <div key={a.user_id} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: i < unassigned.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 28, fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{profile?.name ?? '—'}</span>
                        {a.affiliate && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{a.affiliate}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
