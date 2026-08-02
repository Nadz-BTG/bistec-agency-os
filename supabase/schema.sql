-- Agency OS — Supabase schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING throughout.

create extension if not exists "pgcrypto";

-- ============ TEAM MEMBERS ============
-- One row per signed-up user. Created automatically by the trigger below
-- the moment someone signs up — nobody creates these by hand anymore.
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid unique references auth.users(id) on delete cascade,
  name text not null default 'New teammate',
  initials text,
  role text default 'Account lead',
  color text default '#14377D',
  "textColor" text default '#fff'
);

alter table public.team_members enable row level security;
drop policy if exists "team_members_all" on public.team_members;
create policy "team_members_all" on public.team_members for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create or replace function public.handle_new_user()
returns trigger as $$
declare
  handle text := coalesce(nullif(split_part(new.email, '@', 1), ''), 'New teammate');
begin
  insert into public.team_members (id, "userId", name, initials, role, color, "textColor")
  values (gen_random_uuid(), new.id, initcap(handle), upper(left(handle, 2)), 'Account lead', '#14377D', '#fff');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ CLIENTS ============
create table if not exists public.clients (
  id text primary key,
  name text not null,
  tagline text,
  stage text default 'DISCOVERY',
  lead uuid references public.team_members(id) on delete set null,
  started date,
  "nextCheckInDate" date,
  brief text,
  positioning text,
  icps jsonb not null default '[]',
  "neverSay" jsonb not null default '[]',
  contacts jsonb not null default '[]',
  narrative jsonb not null default '{"text":"","updatedAgo":""}',
  "stageProgress" jsonb not null default '["current","empty","empty","empty","empty"]',
  files jsonb not null default '[]'
);
alter table public.clients enable row level security;
drop policy if exists "clients_all" on public.clients;
create policy "clients_all" on public.clients for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ PROJECTS ============
create table if not exists public.projects (
  id text primary key,
  "clientId" text references public.clients(id) on delete cascade,
  name text not null,
  owner uuid references public.team_members(id) on delete set null,
  done int not null default 0,
  total int not null default 0,
  status text not null default 'active',
  note text
);
alter table public.projects enable row level security;
drop policy if exists "projects_all" on public.projects;
create policy "projects_all" on public.projects for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ TASKS ============
-- "owner" stays free TEXT, not a foreign key: when ownerType is 'client' or
-- 'external' it holds a plain contact name, not a team_members.id.
create table if not exists public.tasks (
  id text primary key,
  "clientId" text references public.clients(id) on delete cascade,
  "projectId" text references public.projects(id) on delete set null,
  title text not null,
  owner text,
  "ownerType" text not null default 'team',
  priority text not null default 'Med',
  "dueDate" date,
  "askedDate" date,
  "waitingOn" text,
  blocks text,
  "chasedCount" int not null default 0,
  cold boolean not null default false,
  "column" text not null default 'backlog',
  status text not null default 'open',
  progress int,
  note text,
  done boolean not null default false,
  "assignedBy" uuid references public.team_members(id) on delete set null,
  snoozed boolean not null default false
);
alter table public.tasks enable row level security;
drop policy if exists "tasks_all" on public.tasks;
create policy "tasks_all" on public.tasks for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ CHECK-INS ============
create table if not exists public.checkins (
  id text primary key,
  "clientId" text references public.clients(id) on delete cascade,
  "weekStart" date,
  status text not null default 'draft',
  "wentOut" jsonb not null default '[]',
  "cameIn" jsonb not null default '[]',
  outstanding jsonb not null default '[]',
  "nextPriority" text,
  notes text,
  "loggedBy" uuid references public.team_members(id) on delete set null
);
alter table public.checkins enable row level security;
drop policy if exists "checkins_all" on public.checkins;
create policy "checkins_all" on public.checkins for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============ STORAGE (client file uploads) ============
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', true)
on conflict (id) do nothing;

drop policy if exists "client_files_read" on storage.objects;
create policy "client_files_read" on storage.objects for select
  using (bucket_id = 'client-files');

drop policy if exists "client_files_write" on storage.objects;
create policy "client_files_write" on storage.objects for insert
  with check (bucket_id = 'client-files' and auth.role() = 'authenticated');

drop policy if exists "client_files_delete" on storage.objects;
create policy "client_files_delete" on storage.objects for delete
  using (bucket_id = 'client-files' and auth.role() = 'authenticated');

-- ============ REALTIME ============
-- Lets every signed-in browser see other people's changes live. Each table
-- is wrapped separately with a broad exception catch: if the publication is
-- already FOR ALL TABLES (some project templates default to this), adding a
-- table explicitly errors even though realtime already covers it — either
-- way the table ends up streamed, so any error here is safe to ignore.
do $$ begin alter publication supabase_realtime add table public.team_members; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.clients; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.projects; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.tasks; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.checkins; exception when others then null; end $$;
