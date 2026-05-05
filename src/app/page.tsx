import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Database } from '@/types/supabase'

type Competition = Database['public']['Tables']['competitions']['Row']

const STATUS_LABEL: Record<string, string> = {
  draft: '준비 중',
  open: '참가 신청',
  in_progress: '진행 중',
  closed: '종료',
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .order('start_date', { ascending: false })

  const active = competitions?.filter(c => c.status === 'in_progress' || c.status === 'open') ?? []
  const past = competitions?.filter(c => c.status === 'closed' || c.status === 'draft') ?? []

  return (
    <div className="space-y-8">
      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">진행 중 · 신청 가능</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map(c => <CompetitionCard key={c.id} competition={c} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">지난 대회</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {past.map(c => <CompetitionCard key={c.id} competition={c} />)}
          </div>
        </section>
      )}

      {!competitions?.length && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">등록된 대회가 없습니다.</p>
        </div>
      )}
    </div>
  )
}

function CompetitionCard({ competition: c }: { competition: Competition }) {
  const start = new Date(c.start_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  const end = new Date(c.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })

  return (
    <Link
      href={`/competitions/${c.id}`}
      className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 leading-snug">{c.name}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status]}`}>
          {STATUS_LABEL[c.status]}
        </span>
      </div>
      <div className="mt-2 space-y-1">
        <p className="text-sm text-gray-500">{start} – {end}</p>
        {c.location && <p className="text-sm text-gray-500">{c.location}</p>}
      </div>
    </Link>
  )
}
