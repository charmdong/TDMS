import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import AuthButton from '@/components/AuthButton'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TDMS — Throwdown Management System',
  description: '크로스핏 대회 관리 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${geist.className} antialiased bg-gray-50 text-gray-900`}>
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-gray-900">TDMS</a>
            <AuthButton />
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
