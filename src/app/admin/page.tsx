import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  draft: '준비 중', open: '신청 가능', in_progress: '진행 중', closed: '종료',
}
const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
}

export default async function AdminPage() {
  const { supabase } = await requireAdmin()
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">대회 관리</h1>
        <Link
          href="/admin/competitions/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          + 대회 만들기
        </Link>
      </div>

      <div className="space-y-2">
        {competitions?.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{c.name}</p>
              <p className="text-sm text-gray-500">{c.start_date} – {c.end_date}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status]}`}>
                {STATUS_LABEL[c.status]}
              </span>
              <div className="flex gap-3">
                <Link href={`/admin/competitions/${c.id}`} className="text-sm text-gray-500 hover:text-gray-700">
                  Organizer
                </Link>
                <Link href={`/competitions/${c.id}/manage`} className="text-sm text-blue-600 hover:text-blue-800">
                  관리 →
                </Link>
              </div>
            </div>
          </div>
        ))}
        {!competitions?.length && (
          <p className="text-center py-12 text-gray-400">대회가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
