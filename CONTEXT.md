# TDMS — Domain Context

TDMS (Throwdown Management System) is a CrossFit competition management platform. It lets organizers run competitions, athletes register and submit scores, and spectators follow live leaderboards. Competitions can only be created by a system-level Admin.

## Glossary

### Competition
A named CrossFit event with a defined schedule, one or more Divisions, and one or more Workouts. A Competition has a lifecycle: `draft → open → in_progress → closed`.

### Division
A category within a Competition that determines which athletes compete against each other and share a Leaderboard. Divisions are freely defined by the Organizer per Competition (e.g. "Rx Male", "Scaled Female", "Masters 40+"). There is no system-wide fixed list.

### Workout
A single scored exercise event within a Competition. Each Workout has a score type:
- **For Time** — lower elapsed time ranks higher
- **AMRAP** — higher rep count ranks higher
- **Max Weight** — higher load ranks higher

Fields: name, description (markdown), score type, order (integer), submission deadline. Leaderboard visibility is toggled separately by the Organizer.

### Score
A result submitted by an Athlete for a specific Workout within a specific Division. A Score has two states:
- `pending` — submitted by the Athlete, awaiting Organizer confirmation
- `confirmed` — approved by the Organizer; reflected in the Leaderboard

Only `confirmed` Scores appear on the Leaderboard.

### Leaderboard
A ranked list of Athletes within a single Division, calculated from their Scores across all Workouts. Final ranking is determined by the sum of per-Workout rank points (lower = better). The Organizer controls visibility per Workout.

### Admin
A system-level role (not per-Competition). Only Admins can create Competitions. Admins may also assign Organizers to Competitions. "Admin" is an account attribute, distinct from the per-Competition Organizer role.

### Organizer
A User who has organizer-level permission for a specific Competition, assigned by an Admin. "Organizer" is not an account attribute — it is a per-Competition role. The same User can be an Organizer of one Competition and an Athlete in another.

### Athlete
A User who is registered to compete in a specific Competition under a specific Division. Registration is open to any authenticated User until the Competition's registration deadline; no Organizer approval is required. Profile fields collected at registration: name, affiliate (box name).

### Spectator
Any visitor (authenticated or not) who views a Competition's Leaderboard or results without having a competitive role in it.

### User
An authenticated account. Authentication is via social login (Google). A User can hold different roles across different Competitions.

## Entity fields (MVP)

**Competition**: name, start date, end date, location, description (markdown), registration deadline.

**Workout**: name, description (markdown), score type (For Time / AMRAP / Max Weight), order (integer), submission deadline, leaderboard_visible (boolean).

**Athlete profile**: name, affiliate (box name).

## Key invariants

- A Score only affects the Leaderboard for the Division the Athlete registered under.
- Leaderboard visibility is toggled per Workout by the Organizer, not per Competition.
- Athlete registration is confirmed immediately (no Organizer approval step) until the registration deadline.
- Admin accounts are assigned via direct DB edit in MVP; no Admin management UI exists.
- Tiebreaks are not supported in MVP.
- Payment is not supported in MVP.

## Design principles

- **Mobile-first**: Score submission and Leaderboard views are optimized for smartphones. Organizer management screens are desktop-friendly but not desktop-only.

## Tech stack

- **Frontend**: Next.js (App Router)
- **Backend/DB**: Supabase (PostgreSQL + Realtime + Auth)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
