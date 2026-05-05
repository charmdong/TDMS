import { requireOrganizer } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { addDivision, deleteDivision, addWorkout, deleteWorkout, toggleLeaderboard, updateStatus } from './actions'

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

export default async function ManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireOrganizer(id)

  const [{ data: competition }, { data: divisions }, { data: workouts }] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    supabase.from('divisions').select('*').eq('competition_id', id).order('created_at'),
    supabase.from('workouts').select('*').eq('competition_id', id).order('sort_order'),
  ])

  if (!competition) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold">{competition.name}</h1>
        <p className="text-sm text-gray-500 mt-1">대회 관리</p>
      </div>

      {/* Status */}
      <section className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-700">대회 상태</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <form key={s.value} action={updateStatus}>
              <input type="hidden" name="competition_id" value={id} />
              <input type="hidden" name="status" value={s.value} />
              <button
                type="submit"
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  competition.status === s.value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                }`}
              >
                {s.label}
              </button>
            </form>
          ))}
        </div>
      </section>

      {/* Divisions */}
      <section className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
        <h2 className="font-semibold text-gray-700">부문 (Division)</h2>
        <div className="flex flex-wrap gap-2">
          {divisions?.map(d => (
            <div key={d.id} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
              <span>{d.name}</span>
              <form action={deleteDivision} className="inline">
                <input type="hidden" name="competition_id" value={id} />
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="ml-1 text-gray-400 hover:text-red-500 leading-none">×</button>
              </form>
            </div>
          ))}
        </div>
        <form action={addDivision} className="flex gap-2">
          <input type="hidden" name="competition_id" value={id} />
          <input
            name="name"
            placeholder="예: Rx Male"
            required
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700"
          >
            추가
          </button>
        </form>
      </section>

      {/* Workouts */}
      <section className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
        <h2 className="font-semibold text-gray-700">워크아웃</h2>
        <div className="space-y-2">
          {workouts?.map((w, i) => (
            <div key={w.id} className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{i + 1}. {w.name}</p>
                <p className="text-xs text-gray-400">{w.score_type.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <form action={toggleLeaderboard}>
                  <input type="hidden" name="competition_id" value={id} />
                  <input type="hidden" name="id" value={w.id} />
                  <input type="hidden" name="visible" value={String(w.leaderboard_visible)} />
                  <button
                    type="submit"
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                      w.leaderboard_visible
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {w.leaderboard_visible ? '공개 중' : '비공개'}
                  </button>
                </form>
                <form action={deleteWorkout}>
                  <input type="hidden" name="competition_id" value={id} />
                  <input type="hidden" name="id" value={w.id} />
                  <button type="submit" className="text-gray-400 hover:text-red-500 text-sm">삭제</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <details className="group">
          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 list-none">
            + 워크아웃 추가
          </summary>
          <form action={addWorkout} className="mt-3 space-y-3">
            <input type="hidden" name="competition_id" value={id} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">이름 *</label>
                <input
                  name="name"
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">점수 유형 *</label>
                <select
                  name="score_type"
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {SCORE_TYPES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">순서</label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={workouts?.length ?? 0}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">제출 마감</label>
                <input
                  name="submission_deadline"
                  type="datetime-local"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">설명</label>
              <textarea
                name="description"
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700"
            >
              추가
            </button>
          </form>
        </details>
      </section>

      {/* Score confirmation link */}
      <section className="bg-white border border-gray-200 rounded-2xl p-4">
        <h2 className="font-semibold text-gray-700 mb-2">점수 승인</h2>
        <a
          href={`/competitions/${id}/manage/scores`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          대기 중인 점수 확인 →
        </a>
      </section>
    </div>
  )
}
