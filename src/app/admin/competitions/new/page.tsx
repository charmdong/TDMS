import { createCompetition } from '@/app/admin/actions'

export default function NewCompetitionPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-6">새 대회 만들기</h1>
      <form action={createCompetition} className="space-y-4">
        <Field label="대회명 *" name="name" required />
        <Field label="장소" name="location" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="시작일 *" name="start_date" type="date" required />
          <Field label="종료일 *" name="end_date" type="date" required />
        </div>
        <Field label="참가 신청 마감" name="registration_deadline" type="datetime-local" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">대회 소개</label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          대회 만들기
        </button>
      </form>
    </div>
  )
}

function Field({
  label, name, type = 'text', required = false
}: {
  label: string, name: string, type?: string, required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  )
}
