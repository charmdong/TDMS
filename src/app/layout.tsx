import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TDMS — Throwdown Management System',
  description: '크로스핏 대회 관리 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={geist.className} style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
        <header style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.5px', color: 'var(--text)', textDecoration: 'none' }}>
              TDMS
            </Link>
            <AuthButton />
          </div>
        </header>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: '0 0 80px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
