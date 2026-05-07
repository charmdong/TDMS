# 경로 목록 (Routes)

각 경로의 접근 권한, 주요 기능, Server Action을 정리합니다.

## 접근 권한 정의

| 역할 | 조건 |
|---|---|
| **Spectator** | 누구나 (비로그인 포함) |
| **User** | 로그인한 사용자 (`requireUser`) |
| **Athlete** | 해당 대회에 참가 신청한 User |
| **Organizer** | 해당 대회의 organizers 테이블에 등록된 User, 또는 Admin (`requireOrganizer`) |
| **Admin** | `profiles.is_admin = true` (`requireAdmin`) |

---

## Public

### `GET /`
- **권한**: Spectator
- **기능**: 전체 대회 목록. 진행 중·신청 가능 대회와 지난 대회를 분리하여 표시. 가장 최근 active 대회를 Hero 섹션에 노출.

### `GET /login`
- **권한**: Spectator
- **기능**: Google OAuth 로그인 페이지.
- **Actions**: `signInWithGoogle()`, `signOut()`

### `GET /auth/callback`
- **권한**: Spectator
- **기능**: OAuth 리다이렉트 처리. 세션 쿠키를 설정하고 `/`로 이동.

---

## 대회 (Competition)

### `GET /competitions/[id]`
- **권한**: Spectator (로그인 여부에 따라 CTA 버튼이 달라짐)
- **기능**: 대회 상세 정보, 신청 마감 D-day, 부문 목록, 워크아웃 목록.
  - 미로그인: "로그인 후 참가 신청" 버튼
  - 로그인 + 미신청 + 신청 가능: "참가 신청하기" 버튼
  - 신청 완료: 신청 부문 표시 + 취소 버튼
  - 진행 중·종료: Leaderboard 링크, 점수 제출 링크(신청자에게만)
- **Actions**: `unregister()` (신청 취소)

### `GET /competitions/[id]/register`
- **권한**: User (미신청, 신청 기간 내, 상태 `open` 인 경우만 접근 가능. 조건 불충족 시 대회 상세로 redirect)
- **기능**: 부문 선택 및 소속 박스 입력 후 참가 신청.
- **Actions**: `registerAthlete()` — athletes 행 삽입, profiles.affiliate 업데이트, 완료 후 대회 상세로 redirect

### `GET /competitions/[id]/submit`
- **권한**: Athlete (해당 대회 신청자, 대회 상태 `in_progress` 인 경우만)
- **기능**: 워크아웃별 점수 제출·수정. for_time은 `mm:ss` 입력, max_weight는 `kg`, amrap은 `회`. 제출 마감된 워크아웃은 입력 불가. 기존 제출 점수와 승인 상태 표시.
- **Actions**: `submitScore()` — scores upsert (status: `pending`). for_time은 `mm:ss` → 초 변환 후 저장.

### `GET /competitions/[id]/leaderboard`
- **권한**: Spectator
- **기능**: 부문별 순위표. `leaderboard_visible = true` 인 워크아웃의 `confirmed` 점수만 집계. 랭크 포인트 방식 (각 워크아웃 내 순위합, 낮을수록 유리). for_time은 `mm:ss` 형식 표시.

---

## 대회 관리 (Organizer)

### `GET /competitions/[id]/manage`
- **권한**: Organizer
- **기능**:
  - 대회 상태 변경 (`draft` / `open` / `in_progress` / `closed`)
  - 부문 추가·삭제
  - 워크아웃 추가·삭제, 리더보드 공개 토글
  - 참가자 목록·점수 승인 페이지 링크
- **Actions**: `updateStatus()`, `addDivision()`, `deleteDivision()`, `addWorkout()`, `deleteWorkout()`, `toggleLeaderboard()`

### `GET /competitions/[id]/manage/athletes`
- **권한**: Organizer
- **기능**: 부문별 참가자 목록. 이름, 소속 박스, 신청일 표시. 부문별 인원수 및 전체 총원 표시.

### `GET /competitions/[id]/manage/scores`
- **권한**: Organizer
- **기능**: `pending` 상태 점수 목록. 선수명, 소속, 워크아웃, 부문, 점수값, 제출 시각 표시. 승인 또는 거절 처리.
- **Actions**: `confirmScore()` — status를 `confirmed`로 변경, `rejectScore()` — scores 행 삭제

---

## 어드민 (Admin)

### `GET /admin`
- **권한**: Admin
- **기능**: 전체 대회 목록. 각 대회의 상태 표시. Organizer 배정 페이지·관리 페이지 링크.

### `GET /admin/competitions/new`
- **권한**: Admin
- **기능**: 대회 생성 폼. 대회명, 장소, 시작·종료일, 신청 마감, 대회 소개 입력.
- **Actions**: `createCompetition()` — competitions 행 삽입 (status: `draft`), 완료 후 관리 페이지로 redirect

### `GET /admin/competitions/[id]`
- **권한**: Admin
- **기능**: Organizer 배정. User UUID 입력으로 organizers 테이블에 추가.
- **Actions**: `addOrganizer()`

---

## 공통

### Middleware (`src/middleware.ts`)
- 정적 파일·이미지를 제외한 모든 경로에 적용.
- Supabase 세션 쿠키를 갱신하는 역할만 담당. 경로별 접근 제어는 각 페이지의 `requireUser` / `requireOrganizer` / `requireAdmin` 에서 처리.
