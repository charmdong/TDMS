// 본인 Google 계정에 Admin 권한 부여
// Usage: node scripts/set-admin.mjs <user-id>
import { readFileSync } from 'fs'

readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...rest] = line.split('=')
  if (k && rest.length) process.env[k.trim()] = rest.join('=').trim()
})

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const userId = process.argv[2]

if (!userId) {
  console.error('Usage: node scripts/set-admin.mjs <user-id>')
  console.error('\nUser ID는 Supabase 대시보드 → Authentication → Users 또는')
  console.error('로그인 후 /admin 접속 시 URL에서 확인 가능합니다.')
  process.exit(1)
}

const res = await fetch(`${URL}/rest/v1/profiles?id=eq.${userId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Prefer': 'return=representation',
  },
  body: JSON.stringify({ is_admin: true }),
})

if (!res.ok) {
  console.error('❌ 실패:', await res.text())
  process.exit(1)
}

console.log(`✅ ${userId} 에 Admin 권한이 부여됐습니다.`)
