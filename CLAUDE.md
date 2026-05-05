# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TDMS (Throwdown Management System) — a CrossFit competition management platform. See `CONTEXT.md` for the full domain glossary and `docs/adr/` for architectural decisions.

## Tech stack

- **Frontend**: Next.js (App Router)
- **Backend/DB**: Supabase (PostgreSQL + Realtime + Auth)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## Commands

```bash
npm run dev        # dev server (Turbopack)
npm run build      # production build
npm run lint       # ESLint
npx supabase start # start local Supabase (requires Docker)
npx supabase db push  # apply migrations to local DB
npx supabase gen types typescript --local > src/types/supabase.ts  # regenerate DB types
```

## Architecture

### Role model

Roles are **per-Competition**, not account-level. A User can be an Organizer of one Competition and an Athlete in another.

- `Admin` — system-level flag on the User record. Only Admins can create Competitions. Assigned via DB in MVP.
- `Organizer` — junction record between User and Competition. Assigned by Admin.
- `Athlete` — junction record between User and Competition+Division. Self-registered until the registration deadline.
- `Spectator` — any visitor viewing public pages; no DB record.

### Score flow

```
Athlete submits → Score.status = "pending"
Organizer confirms → Score.status = "confirmed"
Leaderboard only reads confirmed scores
```

### Leaderboard calculation

Rank points are assigned per Workout within a Division (1st = 1 pt, 2nd = 2 pt, …). Final ranking = sum of rank points across all Workouts (lower = better). Tiebreaks are not supported in MVP.

### Supabase Realtime

Leaderboard pages subscribe to `confirmed` Score changes for the relevant Division. Use Supabase Realtime channels scoped to `competition_id + division_id`.

## Key MVP constraints

- No payment
- No tiebreaks
- No Workout publish scheduling (Organizer manually toggles `leaderboard_visible`)
- No Admin management UI (set `is_admin = true` directly in DB)
- No image uploads

## Agent skills

### Issue tracker

Issues live in GitHub Issues (uses the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` + `docs/adr/` at the root. See `docs/agents/domain.md`.
