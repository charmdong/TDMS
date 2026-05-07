import { requireUser } from '@/lib/auth'
import { updateProfile } from './actions'

const inputStyle = { width: '100%', borderRadius: 10, border: '1px solid var(--border)', padding: '8px 12px', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const }

export default async function ProfilePage() {
  const { supabase, user } = await requireUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, affiliate')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: 0 }}>프로필</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{user.email}</p>
      </div>

      <form action={updateProfile} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>이름 *</label>
          <input name="name" required defaultValue={profile?.name ?? ''} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>소속 박스</label>
          <input name="affiliate" defaultValue={profile?.affiliate ?? ''} placeholder="CrossFit Anywhere" style={inputStyle} />
        </div>
        <button type="submit" style={{ padding: '10px 0', background: 'var(--text)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
          저장
        </button>
      </form>
    </div>
  )
}
