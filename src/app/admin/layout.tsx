import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <div>
      <div className="mb-4 pb-4 border-b border-gray-200 flex items-center gap-2">
        <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">ADMIN</span>
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700">대시보드</a>
      </div>
      {children}
    </div>
  )
}
