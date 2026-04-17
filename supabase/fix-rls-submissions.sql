-- Run once in Supabase SQL Editor if you get:
-- "new row violates row-level security policy" on /email
--
-- Cause: insert was only allowed for role "anon". If you are logged into
-- the app as an admin (or any auth user), the client uses "authenticated"
-- and the old policy blocked the insert.
--
-- This replaces those policies so both visitors and logged-in users can submit.

drop policy if exists "Allow anon insert submissions" on public.scalp_submissions;
drop policy if exists "Allow public insert submissions" on public.scalp_submissions;

create policy "Allow public insert submissions"
  on public.scalp_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anon upload scalp uploads" on storage.objects;
drop policy if exists "Public upload scalp uploads" on storage.objects;

create policy "Public upload scalp uploads"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'scalp-uploads');
