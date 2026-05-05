-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  affiliate text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Competitions
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location text,
  start_date date not null,
  end_date date not null,
  registration_deadline timestamptz,
  status text not null default 'draft' check (status in ('draft', 'open', 'in_progress', 'closed')),
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now()
);

-- Organizers (per-competition role)
create table public.organizers (
  competition_id uuid references public.competitions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (competition_id, user_id)
);

-- Divisions
create table public.divisions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references public.competitions(id) on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now()
);

-- Workouts
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references public.competitions(id) on delete cascade not null,
  name text not null,
  description text,
  score_type text not null check (score_type in ('for_time', 'amrap', 'max_weight')),
  sort_order integer not null default 0,
  submission_deadline timestamptz,
  leaderboard_visible boolean not null default false,
  created_at timestamptz not null default now()
);

-- Athletes (registration)
create table public.athletes (
  competition_id uuid references public.competitions(id) on delete cascade,
  division_id uuid references public.divisions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  affiliate text,
  registered_at timestamptz not null default now(),
  primary key (competition_id, user_id)
);

-- Scores
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references public.workouts(id) on delete cascade not null,
  division_id uuid references public.divisions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  value numeric not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  submitted_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unique (workout_id, division_id, user_id)
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

create index on public.scores (workout_id, division_id, status);
create index on public.athletes (competition_id, division_id);
create index on public.workouts (competition_id, sort_order);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.competitions enable row level security;
alter table public.organizers enable row level security;
alter table public.divisions enable row level security;
alter table public.workouts enable row level security;
alter table public.athletes enable row level security;
alter table public.scores enable row level security;

-- profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- competitions
create policy "Competitions are viewable by everyone"
  on public.competitions for select using (true);

create policy "Only admins can create competitions"
  on public.competitions for insert
  with check ((select is_admin from public.profiles where id = auth.uid()));

create policy "Organizers and admins can update competitions"
  on public.competitions for update using (
    (select is_admin from public.profiles where id = auth.uid())
    or exists (
      select 1 from public.organizers
      where competition_id = competitions.id and user_id = auth.uid()
    )
  );

-- organizers
create policy "Organizers are viewable by everyone"
  on public.organizers for select using (true);

create policy "Admins can manage organizers"
  on public.organizers for all
  using ((select is_admin from public.profiles where id = auth.uid()));

-- divisions
create policy "Divisions are viewable by everyone"
  on public.divisions for select using (true);

create policy "Organizers and admins can manage divisions"
  on public.divisions for all using (
    (select is_admin from public.profiles where id = auth.uid())
    or exists (
      select 1 from public.organizers
      where competition_id = divisions.competition_id and user_id = auth.uid()
    )
  );

-- workouts
create policy "Workouts are viewable by everyone"
  on public.workouts for select using (true);

create policy "Organizers and admins can manage workouts"
  on public.workouts for all using (
    (select is_admin from public.profiles where id = auth.uid())
    or exists (
      select 1 from public.organizers
      where competition_id = workouts.competition_id and user_id = auth.uid()
    )
  );

-- athletes
create policy "Athlete registrations are viewable by everyone"
  on public.athletes for select using (true);

create policy "Users can register themselves before deadline"
  on public.athletes for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.competitions
      where id = competition_id
        and status = 'open'
        and (registration_deadline is null or registration_deadline > now())
    )
  );

create policy "Users can deregister themselves"
  on public.athletes for delete using (auth.uid() = user_id);

-- scores
create policy "Confirmed scores are viewable by everyone"
  on public.scores for select using (
    status = 'confirmed'
    or auth.uid() = user_id
    or exists (
      select 1 from public.workouts w
      join public.organizers o on o.competition_id = w.competition_id
      where w.id = scores.workout_id and o.user_id = auth.uid()
    )
    or (select is_admin from public.profiles where id = auth.uid())
  );

create policy "Athletes can submit their own scores"
  on public.scores for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.workouts w
      join public.athletes a on a.competition_id = w.competition_id
      where w.id = workout_id
        and a.user_id = auth.uid()
        and a.division_id = scores.division_id
        and (w.submission_deadline is null or w.submission_deadline > now())
    )
  );

create policy "Athletes can update their pending scores"
  on public.scores for update using (
    auth.uid() = user_id and status = 'pending'
  );

create policy "Organizers and admins can confirm scores"
  on public.scores for update using (
    (select is_admin from public.profiles where id = auth.uid())
    or exists (
      select 1 from public.workouts w
      join public.organizers o on o.competition_id = w.competition_id
      where w.id = scores.workout_id and o.user_id = auth.uid()
    )
  );

-- ============================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
