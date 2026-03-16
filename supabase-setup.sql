create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  type text not null check (type in ('work', 'study', 'personal')),
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  contact text not null,
  stage text not null check (stage in ('Lead', 'Quoted', 'Negotiation', 'Closing')),
  last_contact date,
  next_followup date,
  amount numeric(12, 2),
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_user_due_idx on public.tasks (user_id, due_date);
create index if not exists clients_user_followup_idx on public.clients (user_id, next_followup);

alter table public.tasks enable row level security;
alter table public.clients enable row level security;

-- RLS: each user can read only their own tasks.
create policy "tasks_select_own"
on public.tasks
for select
using (auth.uid() = user_id);

-- RLS: each user can insert only rows owned by themselves.
create policy "tasks_insert_own"
on public.tasks
for insert
with check (auth.uid() = user_id);

-- RLS: each user can update only their own tasks.
create policy "tasks_update_own"
on public.tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- RLS: each user can delete only their own tasks.
create policy "tasks_delete_own"
on public.tasks
for delete
using (auth.uid() = user_id);

-- RLS: each user can read only their own clients.
create policy "clients_select_own"
on public.clients
for select
using (auth.uid() = user_id);

-- RLS: each user can insert only rows owned by themselves.
create policy "clients_insert_own"
on public.clients
for insert
with check (auth.uid() = user_id);

-- RLS: each user can update only their own clients.
create policy "clients_update_own"
on public.clients
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- RLS: each user can delete only their own clients.
create policy "clients_delete_own"
on public.clients
for delete
using (auth.uid() = user_id);
