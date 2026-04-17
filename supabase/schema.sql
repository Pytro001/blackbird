-- Run in Supabase SQL Editor after creating bucket "scalp-uploads" (public read recommended for dashboard thumbnails).

create extension if not exists "pgcrypto";

create table if not exists public.scalp_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  image_path text not null,
  scalp_result text not null default 'pending'
    check (scalp_result in ('pending', 'oily', 'dry')),
  created_at timestamptz not null default now()
);

create index if not exists scalp_submissions_created_at_idx on public.scalp_submissions (created_at desc);

-- Admins: add your auth.users.id here after you create the user in Authentication.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.scalp_submissions enable row level security;
alter table public.admin_users enable row level security;

-- Anyone can insert submissions (anon visitors OR logged-in users — JWT role must match)
drop policy if exists "Allow anon insert submissions" on public.scalp_submissions;
drop policy if exists "Allow public insert submissions" on public.scalp_submissions;
create policy "Allow public insert submissions"
  on public.scalp_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Authenticated admins can read all
drop policy if exists "Admins select submissions" on public.scalp_submissions;
create policy "Admins select submissions"
  on public.scalp_submissions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.admin_users a where a.user_id = auth.uid()
    )
  );

-- Authenticated admins can update (set oily / dry)
drop policy if exists "Admins update submissions" on public.scalp_submissions;
create policy "Admins update submissions"
  on public.scalp_submissions
  for update
  to authenticated
  using (
    exists (
      select 1 from public.admin_users a where a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users a where a.user_id = auth.uid()
    )
  );

-- Optional: admins can read admin_users
drop policy if exists "Admins read admin_users" on public.admin_users;
create policy "Admins read admin_users"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

-- Storage bucket (public URLs for dashboard thumbnails)
insert into storage.buckets (id, name, public)
values ('scalp-uploads', 'scalp-uploads', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Anon upload scalp uploads" on storage.objects;
drop policy if exists "Public upload scalp uploads" on storage.objects;
create policy "Public upload scalp uploads"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'scalp-uploads');

drop policy if exists "Public read scalp uploads" on storage.objects;
create policy "Public read scalp uploads"
  on storage.objects for select
  to public
  using (bucket_id = 'scalp-uploads');
