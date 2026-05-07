import { requireUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { registerAthlete } from './actions'

const inputStyle = { width: '100%', borderRadius: 10, border: '1px solid var(--border)', padding: '8px 12px', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const }

export default async function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requireUser()

  const [{ data: competition }, { data: divisions }, { data: profile }, { data: existing }] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    supabase.from('divisions').select('*').eq('competition_id', id).order('created_at'),
    supabase.from('profiles').select('name, affiliate').eq('id', user.id).single(),
    supabase.from('athletes').select('division_id').eq('competition_id', id).eq('user_id', user.id).maybeSingle(),
  ])

  if (!competition) notFound()
  if (competition.status !== 'open') redirect(`/competitions/${id}`)
  if (existing) redirect(`/competitions/${id}`)

  const deadlinePassed = competition.registration_deadline
    ? new Date(competition.registration_deadline) < new Date()
    : false
  if (deadlinePassed) redirect(`/competitions/${id}`)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <a href={`/competitions/${id}`} style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>← 대회 정보</a>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: '6px 0 2px' }}>참가 신청</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{competition.name}</p>
      </div>

      <form action={registerAthlete} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input type="hidden" name="competition_id" value={id} />

        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>이름</label>
          <input
            type="text"
            value={profile?.name ?? ''}
            disabled
            style={{ ...inputStyle, background: 'var(--surface-2)', color: 'var(--text-dim)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>소속 박스</label>
          <input
            name="affiliate"
            type="text"
            defaultValue={profile?.affiliate ?? ''}
            placeholder="CrossFit Anywhere"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>부문 선택 *</label>
          {!divisions?.length ? (
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>등록된 부문이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {divisions.map(d => (
                <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer' }}>
                  <input type="radio" name="division_id" value={d.id} required style={{ accentColor: 'var(--text)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{d.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!divisions?.length}
          style={{ width: '100%', padding: '12px 0', background: 'var(--text)', color: 'var(--bg)', fontSize: 14, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer', marginTop: 4, opacity: divisions?.length ? 1 : 0.4 }}
        >
          신청 완료
        </button>
      </form>
    </div>
  )
}
