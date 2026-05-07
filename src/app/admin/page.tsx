import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  draft: '준비 중', open: '신청 가능', in_progress: '진행 중', closed: '종료',
}
const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  draft:       { background: 'rgba(0,0,0,.05)',       color: 'var(--text-dim)' },
  open:        { background: 'rgba(55,100,200,.1)',   color: '#2255b0' },
  in_progress: { background: 'rgba(34,139,34,.1)',    color: '#1a7a1a' },
  closed:      { background: 'rgba(0,0,0,.05)',       color: 'var(--text-dim)' },
}

export default async function AdminPage() {
  const { supabase } = await requireAdmin()
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: 0 }}>대회 관리</h1>
        <Link href="/admin/competitions/new" style={{ padding: '8px 16px', background: 'var(--text)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, borderRadius: 10, textDecoration: 'none' }}>
          + 대회 만들기
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {competitions?.map(c => (
          <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{c.start_date} – {c.end_date}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 4, ...STATUS_STYLE[c.status] }}>
                {STATUS_LABEL[c.status]}
              </span>
              <div style={{ display: 'flex', gap: 14 }}>
                <Link href={`/admin/competitions/${c.id}`} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Organizer</Link>
                <Link href={`/competitions/${c.id}/manage`} style={{ fontSize: 13, color: 'var(--orange)', textDecoration: 'none' }}>관리 →</Link>
              </div>
            </div>
          </div>
        ))}
        {!competitions?.length && (
          <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 13 }}>대회가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
