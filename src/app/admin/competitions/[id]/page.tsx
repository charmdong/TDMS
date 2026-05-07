import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { addOrganizer } from '@/app/admin/actions'

export default async function AdminCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [{ data: competition }, { data: organizers }] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    supabase.from('organizers').select('user_id, profiles(name)').eq('competition_id', id),
  ])

  if (!competition) notFound()

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <a href="/admin" style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>← 대시보드</a>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: '6px 0 0' }}>{competition.name}</h1>
      </div>

      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Organizer 배정</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {organizers?.map(o => {
            const profile = o.profiles as { name: string } | null
            return (
              <div key={o.user_id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a7a1a', flexShrink: 0 }} />
                {profile?.name ?? o.user_id}
              </div>
            )
          })}
          {!organizers?.length && <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0 }}>배정된 Organizer 없음</p>}
        </div>
        <form action={addOrganizer} style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <input type="hidden" name="competition_id" value={id} />
          <input
            name="user_id"
            placeholder="User UUID (Supabase 대시보드에서 확인)"
            required
            style={{ flex: 1, borderRadius: 10, border: '1px solid var(--border)', padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: 'var(--text)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer' }}>배정</button>
        </form>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>
          User UUID는 Supabase 대시보드 → Authentication → Users에서 확인하세요.
        </p>
      </section>

      <a href={`/competitions/${id}/manage`} style={{ fontSize: 13, color: 'var(--orange)', textDecoration: 'none' }}>
        대회 관리 페이지 →
      </a>
    </div>
  )
}
