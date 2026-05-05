// Run: node scripts/seed.mjs
import { readFileSync } from 'fs'

// Load .env.local
readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...rest] = line.split('=')
  if (k && rest.length) process.env[k.trim()] = rest.join('=').trim()
})

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'return=representation',
}

async function rest(method, path, body) {
  const res = await fetch(`${URL}/rest/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

async function adminPost(path, body) {
  const res = await fetch(`${URL}/auth/v1/admin${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${text}`)
  return JSON.parse(text)
}

async function main() {
  console.log('🌱 Seeding TDMS...\n')

  // ── 1. 테스트 유저 2명 생성 ──────────────────────────────────
  console.log('1. 유저 생성...')

  let adminUser, athleteUser
  try {
    adminUser = await adminPost('/users', {
      email: 'admin@tdms.test',
      password: 'testpassword123!',
      email_confirm: true,
      user_metadata: { full_name: '김관리자' },
    })
    console.log(`   ✓ Admin: ${adminUser.email} (${adminUser.id})`)
  } catch (e) {
    if (e.message.includes('already been registered')) {
      const list = await fetch(`${URL}/auth/v1/admin/users?email=admin@tdms.test`, { headers }).then(r => r.json())
      adminUser = list.users?.[0]
      console.log(`   ↩ Admin already exists: ${adminUser?.id}`)
    } else throw e
  }

  try {
    athleteUser = await adminPost('/users', {
      email: 'athlete@tdms.test',
      password: 'testpassword123!',
      email_confirm: true,
      user_metadata: { full_name: '이선수' },
    })
    console.log(`   ✓ Athlete: ${athleteUser.email} (${athleteUser.id})`)
  } catch (e) {
    if (e.message.includes('already been registered')) {
      const list = await fetch(`${URL}/auth/v1/admin/users?email=athlete@tdms.test`, { headers }).then(r => r.json())
      athleteUser = list.users?.[0]
      console.log(`   ↩ Athlete already exists: ${athleteUser?.id}`)
    } else throw e
  }

  if (!adminUser?.id || !athleteUser?.id) throw new Error('유저 ID를 가져올 수 없습니다.')

  // ── 2. 프로필 설정 (Admin 플래그) ───────────────────────────
  console.log('\n2. 프로필 설정...')
  await rest('PATCH', `/profiles?id=eq.${adminUser.id}`, { is_admin: true, affiliate: 'TDMS HQ' })
  await rest('PATCH', `/profiles?id=eq.${athleteUser.id}`, { affiliate: 'CrossFit Seoul' })
  console.log('   ✓ Admin 권한 설정 완료')

  // ── 3. 대회 생성 ─────────────────────────────────────────────
  console.log('\n3. 대회 생성...')

  const [comp1] = await rest('POST', '/competitions', [{
    name: '2026 Seoul CrossFit Throwdown',
    description: '서울 최대 크로스핏 대회. Rx·Scaled·Masters 부문으로 진행됩니다.',
    location: '서울 강남구 삼성동 COEX',
    start_date: '2026-06-14',
    end_date: '2026-06-15',
    registration_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    created_by: adminUser.id,
  }])

  const [comp2] = await rest('POST', '/competitions', [{
    name: '2026 강남 박스 배틀',
    description: '강남 지역 박스 간 팀 대결. 현재 진행 중입니다.',
    location: '서울 강남구 역삼동',
    start_date: '2026-05-03',
    end_date: '2026-05-04',
    registration_deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    created_by: adminUser.id,
  }])

  console.log(`   ✓ "${comp1.name}" (${comp1.status})`)
  console.log(`   ✓ "${comp2.name}" (${comp2.status})`)

  // ── 4. Organizer 배정 ────────────────────────────────────────
  console.log('\n4. Organizer 배정...')
  await rest('POST', '/organizers', [
    { competition_id: comp1.id, user_id: adminUser.id },
    { competition_id: comp2.id, user_id: adminUser.id },
  ])
  console.log('   ✓ 완료')

  // ── 5. Division 생성 ─────────────────────────────────────────
  console.log('\n5. Division 생성...')
  const divisions1 = await rest('POST', '/divisions', [
    { competition_id: comp1.id, name: 'Rx 남성' },
    { competition_id: comp1.id, name: 'Rx 여성' },
    { competition_id: comp1.id, name: 'Scaled 남성' },
    { competition_id: comp1.id, name: 'Scaled 여성' },
  ])
  const divisions2 = await rest('POST', '/divisions', [
    { competition_id: comp2.id, name: 'Rx 남성' },
    { competition_id: comp2.id, name: 'Scaled 남성' },
  ])
  console.log(`   ✓ comp1: ${divisions1.map(d => d.name).join(', ')}`)
  console.log(`   ✓ comp2: ${divisions2.map(d => d.name).join(', ')}`)

  // ── 6. Workout 생성 ──────────────────────────────────────────
  console.log('\n6. Workout 생성...')
  await rest('POST', '/workouts', [
    {
      competition_id: comp1.id,
      name: 'Workout 1 — Open 24.1',
      description: '21-15-9\n- Thrusters (43/29kg)\n- Chest-to-Bar Pull-ups',
      score_type: 'for_time',
      sort_order: 1,
      submission_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      leaderboard_visible: false,
    },
    {
      competition_id: comp1.id,
      name: 'Workout 2 — AMRAP 12',
      description: '12분 AMRAP:\n- 10 Deadlifts (100/70kg)\n- 20 Box Jumps (60/50cm)\n- 30 Double-Unders',
      score_type: 'amrap',
      sort_order: 2,
      submission_deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      leaderboard_visible: false,
    },
  ])

  const workouts2 = await rest('POST', '/workouts', [
    {
      competition_id: comp2.id,
      name: 'Workout 1 — Fran',
      description: '21-15-9\n- Thrusters (43kg)\n- Pull-ups',
      score_type: 'for_time',
      sort_order: 1,
      submission_deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      leaderboard_visible: true,
    },
    {
      competition_id: comp2.id,
      name: 'Workout 2 — Max Snatch',
      description: '6분 안에 스내치 최대 중량 달성',
      score_type: 'max_weight',
      sort_order: 2,
      submission_deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      leaderboard_visible: true,
    },
  ])
  console.log('   ✓ Workout 생성 완료')

  // ── 7. 선수 등록 (comp2에 athlete 등록) ──────────────────────
  console.log('\n7. 선수 등록...')
  const rxDiv = divisions2.find(d => d.name === 'Rx 남성')
  await rest('POST', '/athletes', [{
    competition_id: comp2.id,
    division_id: rxDiv.id,
    user_id: athleteUser.id,
    affiliate: 'CrossFit Seoul',
  }])
  console.log(`   ✓ 이선수 → ${comp2.name} / ${rxDiv.name}`)

  // ── 8. 점수 제출 (pending + confirmed) ───────────────────────
  console.log('\n8. 점수 제출...')
  const w1 = workouts2.find(w => w.sort_order === 1)
  const w2 = workouts2.find(w => w.sort_order === 2)

  await rest('POST', '/scores', [{
    workout_id: w1.id,
    division_id: rxDiv.id,
    user_id: athleteUser.id,
    value: 187,
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
  }])
  await rest('POST', '/scores', [{
    workout_id: w2.id,
    division_id: rxDiv.id,
    user_id: athleteUser.id,
    value: 80,
    status: 'pending',
  }])
  console.log('   ✓ Workout1: 187초 (confirmed), Workout2: 80kg (pending)')

  // ── 완료 ─────────────────────────────────────────────────────
  console.log('\n✅ Seed 완료!\n')
  console.log('테스트 계정:')
  console.log(`  Admin:   admin@tdms.test / testpassword123!`)
  console.log(`  Athlete: athlete@tdms.test / testpassword123!`)
  console.log('\n⚠️  위 계정은 이메일/비밀번호 로그인입니다.')
  console.log('  Supabase 대시보드 → Authentication → Providers에서')
  console.log('  Email provider를 활성화해야 로그인됩니다.')
  console.log('\n또는 본인 Google 계정으로 로그인 후 아래 명령어로 Admin 권한 부여:')
  console.log(`  node scripts/set-admin.mjs <your-user-id>`)
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1) })
