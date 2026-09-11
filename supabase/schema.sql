-- ChoreMate V1 schema for Supabase (Postgres + Auth + RLS)
-- Run this in the Supabase SQL Editor after creating a project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Our family',
  setup_mode text not null check (setup_mode in ('quick', 'custom')),
  require_approval boolean not null default true,
  kid_access_code text not null unique,
  setup_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  role text not null check (role in ('parent', 'child')),
  avatar text not null default 'star',
  pin_hash text,
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  points integer not null check (points > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'one_off')),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  points_required integer not null check (points_required > 0),
  icon text not null default 'gift',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chore_completions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  chore_id uuid not null references public.chores (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  points integer not null check (points > 0),
  status text not null check (status in ('pending', 'approved', 'rejected')),
  completed_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id) on delete set null,
  note text
);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  reward_id uuid not null references public.rewards (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  points_spent integer not null check (points_spent > 0),
  status text not null check (status in ('pending', 'confirmed', 'rejected')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id) on delete set null,
  note text
);

create table if not exists public.point_ledger (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  delta integer not null,
  reason text not null,
  ref_type text,
  ref_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists households_owner_id_idx on public.households (owner_id);
create index if not exists households_kid_access_code_idx on public.households (kid_access_code);
create index if not exists members_household_id_idx on public.members (household_id);
create index if not exists chores_household_id_idx on public.chores (household_id);
create index if not exists rewards_household_id_idx on public.rewards (household_id);
create index if not exists chore_completions_household_status_idx
  on public.chore_completions (household_id, status);
create index if not exists chore_completions_member_idx
  on public.chore_completions (member_id, completed_at desc);
create index if not exists reward_redemptions_household_status_idx
  on public.reward_redemptions (household_id, status);
create index if not exists point_ledger_member_idx
  on public.point_ledger (member_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_household_owner(hid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.households h
    where h.id = hid
      and h.owner_id = auth.uid()
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists households_touch_updated_at on public.households;
create trigger households_touch_updated_at
before update on public.households
for each row execute function public.touch_updated_at();

drop trigger if exists members_touch_updated_at on public.members;
create trigger members_touch_updated_at
before update on public.members
for each row execute function public.touch_updated_at();

drop trigger if exists chores_touch_updated_at on public.chores;
create trigger chores_touch_updated_at
before update on public.chores
for each row execute function public.touch_updated_at();

drop trigger if exists rewards_touch_updated_at on public.rewards;
create trigger rewards_touch_updated_at
before update on public.rewards
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.households enable row level security;
alter table public.members enable row level security;
alter table public.chores enable row level security;
alter table public.rewards enable row level security;
alter table public.chore_completions enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.point_ledger enable row level security;

-- Households: owners only (child access goes through trusted server actions)
drop policy if exists households_select_owner on public.households;
create policy households_select_owner on public.households
  for select using (owner_id = auth.uid());

drop policy if exists households_insert_owner on public.households;
create policy households_insert_owner on public.households
  for insert with check (owner_id = auth.uid());

drop policy if exists households_update_owner on public.households;
create policy households_update_owner on public.households
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists households_delete_owner on public.households;
create policy households_delete_owner on public.households
  for delete using (owner_id = auth.uid());

-- Members
drop policy if exists members_all_owner on public.members;
create policy members_all_owner on public.members
  for all using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

-- Chores
drop policy if exists chores_all_owner on public.chores;
create policy chores_all_owner on public.chores
  for all using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

-- Rewards
drop policy if exists rewards_all_owner on public.rewards;
create policy rewards_all_owner on public.rewards
  for all using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

-- Completions
drop policy if exists completions_all_owner on public.chore_completions;
create policy completions_all_owner on public.chore_completions
  for all using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

-- Redemptions
drop policy if exists redemptions_all_owner on public.reward_redemptions;
create policy redemptions_all_owner on public.reward_redemptions
  for all using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

-- Ledger
drop policy if exists ledger_select_owner on public.point_ledger;
create policy ledger_select_owner on public.point_ledger
  for select using (public.is_household_owner(household_id));

drop policy if exists ledger_insert_owner on public.point_ledger;
create policy ledger_insert_owner on public.point_ledger
  for insert with check (public.is_household_owner(household_id));

-- ---------------------------------------------------------------------------
-- Public kid lookup (code only, no sensitive fields)
-- Used by a SECURITY DEFINER function so children never need auth.users accounts.
-- ---------------------------------------------------------------------------

create or replace function public.lookup_household_by_kid_code(code text)
returns table (
  id uuid,
  name text
)
language sql
stable
security definer
set search_path = public
as $$
  select h.id, h.name
  from public.households h
  where upper(h.kid_access_code) = upper(trim(code))
    and h.setup_completed = true
  limit 1;
$$;

create or replace function public.list_child_profiles_by_kid_code(code text)
returns table (
  id uuid,
  household_id uuid,
  name text,
  avatar text,
  points integer,
  has_pin boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id,
    m.household_id,
    m.name,
    m.avatar,
    m.points,
    (m.pin_hash is not null) as has_pin
  from public.members m
  join public.households h on h.id = m.household_id
  where upper(h.kid_access_code) = upper(trim(code))
    and h.setup_completed = true
    and m.role = 'child'
  order by m.created_at asc;
$$;

revoke all on function public.lookup_household_by_kid_code(text) from public;
revoke all on function public.list_child_profiles_by_kid_code(text) from public;
grant execute on function public.lookup_household_by_kid_code(text) to anon, authenticated;
grant execute on function public.list_child_profiles_by_kid_code(text) to anon, authenticated;
