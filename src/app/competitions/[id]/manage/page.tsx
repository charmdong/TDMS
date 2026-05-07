import { requireOrganizer } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { addDivision, deleteDivision, addWorkout, deleteWorkout, toggleLeaderboard, updateStatus, updateCompetition, updateWorkout } from './actions'

const STATUSES = [
  { value: 'draft', label: '준비 중' },
  { value: 'open', label: '신청 가능' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'closed', label: '종료' },
]
const SCORE_TYPES = [
  { value: 'for_time', label: 'For Time' },
  { value: 'amrap', label: 'AMRAP' },
  { value: 'max_weight', label: 'Max Weight' },
]

const inputStyle = { width: '100%', borderRadius: 10, border: '1px solid var(--border)', padding: '8px 12px', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const }
const sectionStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }

export default async function ManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireOrganizer(id)

  const [{ data: competition }, { data: divisions }, { data: workouts }] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    supabase.from('divisions').select('*').eq('competition_id', id).order('created_at'),
    supabase.from('workouts').select('*').eq('competition_id', id).order('sort_order'),
  ])

  if (!competition) notFound()

  // datetime-local 입력 형식으로 변환 (초 제거)
  const toDatetimeLocal = (iso: string | null) => iso ? iso.slice(0, 16) : ''

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <a href={`/competitions/${id}`} style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>← 대회 정보</a>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: '6px 0 2px' }}>{competition.name}</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>대회 관리</p>
      </div>

      {/* Status */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>대회 상태</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STATUSES.map(s => (
            <form key={s.value} action={updateStatus}>
              <input type="hidden" name="competition_id" value={id} />
              <input type="hidden" name="status" value={s.value} />
              <button
                type="submit"
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid',
                  background: competition.status === s.value ? 'var(--text)' : 'var(--surface)',
                  color: competition.status === s.value ? 'var(--bg)' : 'var(--text-muted)',
                  borderColor: competition.status === s.value ? 'var(--text)' : 'var(--border)',
                }}
              >
                {s.label}
              </button>
            </form>
          ))}
        </div>
      </section>

      {/* Competition info edit */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 14 }}>대회 정보 수정</h2>
        <form action={updateCompetition} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="hidden" name="competition_id" value={id} />
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>대회명 *</label>
            <input name="name" required defaultValue={competition.name} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>장소</label>
            <input name="location" defaultValue={competition.location ?? ''} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>시작일 *</label>
              <input name="start_date" type="date" required defaultValue={competition.start_date} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>종료일 *</label>
              <input name="end_date" type="date" required defaultValue={competition.end_date} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>참가 신청 마감</label>
            <input name="registration_deadline" type="datetime-local" defaultValue={toDatetimeLocal(competition.registration_deadline)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>대회 소개</label>
            <textarea name="description" rows={3} defaultValue={competition.description ?? ''} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <button type="submit" style={{ padding: '9px 0', background: 'var(--text)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer' }}>저장</button>
        </form>
      </section>

      {/* Divisions */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>부문 (Division)</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {divisions?.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>{d.name}</span>
              <form action={deleteDivision} style={{ display: 'inline' }}>
                <input type="hidden" name="competition_id" value={id} />
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>×</button>
              </form>
            </div>
          ))}
        </div>
        <form action={addDivision} style={{ display: 'flex', gap: 8 }}>
          <input type="hidden" name="competition_id" value={id} />
          <input name="name" placeholder="예: Rx Male" required style={{ ...inputStyle, flex: 1 }} />
          <button type="submit" style={{ padding: '8px 16px', background: 'var(--text)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer' }}>추가</button>
        </form>
      </section>

      {/* Workouts */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>워크아웃</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {workouts?.map((w, i) => (
            <div key={w.id} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', background: 'var(--surface-2)' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{i + 1}. {w.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0' }}>{w.score_type.replace('_', ' ')}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <form action={toggleLeaderboard}>
                    <input type="hidden" name="competition_id" value={id} />
                    <input type="hidden" name="id" value={w.id} />
                    <input type="hidden" name="visible" value={String(w.leaderboard_visible)} />
                    <button type="submit" style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid', cursor: 'pointer', background: w.leaderboard_visible ? 'rgba(34,139,34,.1)' : 'var(--surface)', color: w.leaderboard_visible ? '#1a7a1a' : 'var(--text-dim)', borderColor: w.leaderboard_visible ? 'rgba(34,139,34,.25)' : 'var(--border)' }}>
                      {w.leaderboard_visible ? '공개 중' : '비공개'}
                    </button>
                  </form>
                  <form action={deleteWorkout}>
                    <input type="hidden" name="competition_id" value={id} />
                    <input type="hidden" name="id" value={w.id} />
                    <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-dim)' }}>삭제</button>
                  </form>
                </div>
              </div>
              {/* Edit form */}
              <form action={updateWorkout} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="hidden" name="competition_id" value={id} />
                <input type="hidden" name="id" value={w.id} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>이름</label>
                    <input name="name" required defaultValue={w.name} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>순서</label>
                    <input name="sort_order" type="number" defaultValue={w.sort_order} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>제출 마감</label>
                  <input name="submission_deadline" type="datetime-local" defaultValue={toDatetimeLocal(w.submission_deadline)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>설명</label>
                  <textarea name="description" rows={2} defaultValue={w.description ?? ''} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <button type="submit" style={{ padding: '7px 0', background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }}>수정 저장</button>
              </form>
            </div>
          ))}
        </div>

        <details>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--orange)', listStyle: 'none', userSelect: 'none' }}>+ 워크아웃 추가</summary>
          <form action={addWorkout} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="hidden" name="competition_id" value={id} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>이름 *</label>
                <input name="name" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>점수 유형 *</label>
                <select name="score_type" required style={inputStyle}>
                  {SCORE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>순서</label>
                <input name="sort_order" type="number" defaultValue={workouts?.length ?? 0} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>제출 마감</label>
                <input name="submission_deadline" type="datetime-local" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>설명</label>
              <textarea name="description" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <button type="submit" style={{ padding: '10px 0', background: 'var(--text)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer' }}>추가</button>
          </form>
        </details>
      </section>

      {/* Athletes link */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>참가자</h2>
        <a href={`/competitions/${id}/manage/athletes`} style={{ fontSize: 13, color: 'var(--orange)', textDecoration: 'none' }}>참가자 목록 →</a>
      </section>

      {/* Score confirmation link */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>점수 승인</h2>
        <a href={`/competitions/${id}/manage/scores`} style={{ fontSize: 13, color: 'var(--orange)', textDecoration: 'none' }}>대기 중인 점수 확인 →</a>
      </section>
    </div>
  )
}
