import { signInWithGoogle } from '@/app/auth/actions'

export default function LoginPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 16px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>TDMS</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 0.5 }}>THROWDOWN MANAGEMENT SYSTEM</div>
          </div>
          <form action={signInWithGoogle} style={{ width: '100%' }}>
            <button type="submit" className="btn-hover" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 0', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--text)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              <GoogleIcon />
              Google로 계속하기
            </button>
          </form>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', margin: 0 }}>
            로그인 시 서비스 이용약관에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" />
    </svg>
  )
}
