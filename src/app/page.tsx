import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { Database } from '@/types/supabase'

type Competition = Database['public']['Tables']['competitions']['Row']

const STATUS_LABEL: Record<string, string> = {
  draft: '준비 중', open: '신청 가능', in_progress: '진행 중', closed: '종료',
}

const cardAccents = [
  { bg: '#1a0f0a', pattern: 'radial-gradient(ellipse at 20% 50%, rgba(244,80,30,.25) 0%, transparent 60%)' },
  { bg: '#0a0e1a', pattern: 'radial-gradient(ellipse at 80% 50%, rgba(55,100,200,.2) 0%, transparent 60%)' },
  { bg: '#0a1a0f', pattern: 'radial-gradient(ellipse at 50% 20%, rgba(60,160,80,.2) 0%, transparent 60%)' },
  { bg: '#150a1a', pattern: 'radial-gradient(ellipse at 20% 80%, rgba(140,60,200,.2) 0%, transparent 60%)' },
]

function CompetitionCard({ c, idx }: { c: Competition; idx: number }) {
  const accent = cardAccents[idx % cardAccents.length]
  const start = new Date(c.start_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  const end = new Date(c.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  const dday = c.registration_deadline
    ? Math.ceil((new Date(c.registration_deadline).getTime() - Date.now()) / 86400000)
    : null
  const isUrgent = dday !== null && dday <= 7

  return (
    <Link href={`/competitions/${c.id}`} style={{ textDecoration: 'none' }}>
      <div className="card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
        {/* Banner */}
        <div style={{ height: 72, background: accent.bg, backgroundImage: accent.pattern, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.015) 0px, rgba(255,255,255,.015) 1px, transparent 1px, transparent 12px)' }} />
          {dday !== null && (
            <span style={{ fontSize: 10, fontWeight: 500, position: 'relative', color: isUrgent ? 'var(--orange)' : 'rgba(255,255,255,.3)', background: isUrgent ? 'rgba(244,80,30,.15)' : 'rgba(255,255,255,.06)', border: `1px solid ${isUrgent ? 'rgba(244,80,30,.35)' : 'rgba(255,255,255,.08)'}`, padding: '3px 8px', borderRadius: 4 }}>
              {dday > 0 ? `D-${dday}` : '마감'}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 4, background: c.status === 'in_progress' ? 'rgba(60,160,80,.15)' : c.status === 'open' ? 'rgba(55,100,200,.15)' : 'rgba(255,255,255,.06)', color: c.status === 'in_progress' ? '#7ab82e' : c.status === 'open' ? '#5b9fd4' : 'var(--text-dim)', letterSpacing: 0.3 }}>
              {STATUS_LABEL[c.status]}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 10, lineHeight: 1.4 }}>{c.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
            <Calendar size={11} color="var(--text-dim)" /> {start} – {end}
          </div>
          {c.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
              <MapPin size={11} color="var(--text-dim)" /> {c.location}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .order('start_date', { ascending: false })

  const active = competitions?.filter(c => c.status === 'in_progress' || c.status === 'open') ?? []
  const past = competitions?.filter(c => c.status === 'closed' || c.status === 'draft') ?? []
  const hero = active[0] ?? past[0]

  return (
    <div style={{ padding: 16 }}>
      {/* Hero */}
      {hero && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 90% 50%, rgba(244,80,30,.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
          {hero.registration_deadline && (() => {
            const d = Math.ceil((new Date(hero.registration_deadline).getTime() - Date.now()) / 86400000)
            return d > 0 && d <= 14 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)' }} />
                <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 500 }}>마감 임박 · D-{d}</span>
              </div>
            ) : null
          })()}
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', lineHeight: 1.35, marginBottom: 14 }}>
            {hero.name}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
              <Calendar size={12} color="var(--text-dim)" />
              {new Date(hero.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {hero.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                <MapPin size={12} color="var(--text-dim)" /> {hero.location}
              </div>
            )}
          </div>
          <Link href={`/competitions/${hero.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--orange)', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            대회 상세 보기 <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>진행 중 · 신청 가능</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {active.map((c, i) => <CompetitionCard key={c.id} c={c} idx={i} />)}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>지난 대회</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {past.map((c, i) => <CompetitionCard key={c.id} c={c} idx={active.length + i} />)}
          </div>
        </section>
      )}

      {!competitions?.length && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)', fontSize: 14 }}>
          등록된 대회가 없습니다.
        </div>
      )}
    </div>
  )
}
