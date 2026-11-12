ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS description text;

NOTIFY pgrst, 'reload schema';
