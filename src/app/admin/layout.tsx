import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
      <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(220,38,38,.1)', color: '#b91c1c', padding: '3px 8px', borderRadius: 20 }}>ADMIN</span>
        <a href="/admin" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>대시보드</a>
      </div>
      {children}
    </div>
  )
}
