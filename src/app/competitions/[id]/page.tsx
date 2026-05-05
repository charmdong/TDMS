import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { unregister } from './register/actions'

const STATUS_LABEL: Record<string, string> = {
  draft: '준비 중', open: '참가 신청', in_progress: '진행 중', closed: '종료',
}
const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
}
const SCORE_TYPE_LABEL: Record<string, string> = {
  for_time: 'For Time', amrap: 'AMRAP', max_weight: 'Max Weight',
}

export default async function CompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: competition }, { data: divisions }, { data: workouts }, { data: registration }] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    supabase.from('divisions').select('*').eq('competition_id', id).order('created_at'),
    supabase.from('workouts').select('*').eq('competition_id', id).order('sort_order'),
    user
      ? supabase.from('athletes').select('division_id, divisions(name)').eq('competition_id', id).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (!competition) notFound()

  const start = new Date(competition.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const end = new Date(competition.end_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const deadline = competition.registration_deadline
    ? new Date(competition.registration_deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null
  const deadlinePassed = competition.registration_deadline
    ? new Date(competition.registration_deadline) < new Date()
    : false

  const isRegistered = !!registration
  const canRegister = competition.status === 'open' && !deadlinePassed && !!user && !isRegistered
  const registeredDivision = registration?.divisions as { name: string } | null

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[competition.status]}`}>
            {STATUS_LABEL[competition.status]}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{competition.name}</h1>
        <div className="mt-2 space-y-1 text-sm text-gray-500">
          <p>{start} – {end}</p>
          {competition.location && <p>{competition.location}</p>}
          {deadline && <p>신청 마감: {deadline}</p>}
        </div>
        {competition.description && (
          <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">{competition.description}</p>
        )}
      </div>

      {/* Registration CTA */}
      {isRegistered ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-green-800">참가 신청 완료</p>
            <p className="text-xs text-green-600 mt-0.5">부문: {registeredDivision?.name}</p>
          </div>
          <form action={unregister}>
            <input type="hidden" name="competition_id" value={id} />
            <button type="submit" className="text-xs text-red-500 hover:text-red-700">취소</button>
          </form>
        </div>
      ) : canRegister ? (
        <Link
          href={`/competitions/${id}/register`}
          className="block w-full py-3 bg-gray-900 text-white text-center font-medium rounded-2xl hover:bg-gray-700 transition-colors"
        >
          참가 신청하기
        </Link>
      ) : competition.status === 'open' && !user ? (
        <Link
          href="/login"
          className="block w-full py-3 border border-gray-300 text-gray-700 text-center text-sm font-medium rounded-2xl hover:bg-gray-50"
        >
          로그인 후 참가 신청
        </Link>
      ) : null}

      {/* Leaderboard link */}
      {(competition.status === 'in_progress' || competition.status === 'closed') && (
        <Link
          href={`/competitions/${id}/leaderboard`}
          className="block w-full py-3 border border-gray-300 text-gray-700 text-center text-sm font-medium rounded-2xl hover:bg-gray-50"
        >
          Leaderboard 보기 →
        </Link>
      )}

      {/* Score submit link */}
      {isRegistered && competition.status === 'in_progress' && (
        <Link
          href={`/competitions/${id}/submit`}
          className="block w-full py-3 border border-blue-300 text-blue-700 text-center text-sm font-medium rounded-2xl hover:bg-blue-50"
        >
          점수 제출하기 →
        </Link>
      )}

      {/* Divisions */}
      {divisions && divisions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">부문</h2>
          <div className="flex flex-wrap gap-2">
            {divisions.map(d => (
              <span key={d.id} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700">
                {d.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Workouts */}
      {workouts && workouts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">워크아웃</h2>
          <div className="space-y-3">
            {workouts.map((w, i) => (
              <div key={w.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{i + 1}. {w.name}</h3>
                  <span className="text-xs text-gray-400">{SCORE_TYPE_LABEL[w.score_type]}</span>
                </div>
                {w.description && (
                  <p className="text-sm text-gray-600 whitespace-pre-line">{w.description}</p>
                )}
                {w.submission_deadline && (
                  <p className="mt-2 text-xs text-gray-400">
                    제출 마감: {new Date(w.submission_deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
