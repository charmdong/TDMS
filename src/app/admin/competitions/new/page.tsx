import { createCompetition } from '@/app/admin/actions'

const inputStyle = { width: '100%', borderRadius: 10, border: '1px solid var(--border)', padding: '8px 12px', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const }

export default function NewCompetitionPage() {
  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 24 }}>새 대회 만들기</h1>
      <form action={createCompetition} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="대회명 *" name="name" required />
        <Field label="장소" name="location" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="시작일 *" name="start_date" type="date" required />
          <Field label="종료일 *" name="end_date" type="date" required />
        </div>
        <Field label="참가 신청 마감" name="registration_deadline" type="datetime-local" />
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>대회 소개</label>
          <textarea name="description" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px 0', background: 'var(--text)', color: 'var(--bg)', fontSize: 14, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer', marginTop: 4 }}>
          대회 만들기
        </button>
      </form>
    </div>
  )
}

function Field({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</label>
      <input type={type} name={name} required={required} style={inputStyle} />
    </div>
  )
}
