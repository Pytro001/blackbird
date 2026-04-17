-- Optional: legacy submissions table + storage (app no longer writes from the browser).
-- Adjust or remove if you do not use Supabase.

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

alter table public.scalp_submissions enable row level security;

drop policy if exists "Allow anon insert submissions" on public.scalp_submissions;
drop policy if exists "Allow public insert submissions" on public.scalp_submissions;
create policy "Allow public insert submissions"
  on public.scalp_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins select submissions" on public.scalp_submissions;
drop policy if exists "Admins update submissions" on public.scalp_submissions;

-- Storage bucket (legacy uploads)
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

drop table if exists public.admin_users cascade;
