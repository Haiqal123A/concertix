ALTER TABLE public.concerts
  ADD COLUMN IF NOT EXISTS artist_names text,
  ADD COLUMN IF NOT EXISTS venue_address text;

ALTER TABLE public.concerts
  ALTER COLUMN artist_id DROP NOT NULL,
  ALTER COLUMN venue_id DROP NOT NULL;

UPDATE public.concerts AS concert
SET artist_names = artist.name
FROM public.artists AS artist
WHERE concert.artist_id = artist.id
  AND concert.artist_names IS NULL;

UPDATE public.concerts AS concert
SET venue_address = venue.address
FROM public.venues AS venue
WHERE concert.venue_id = venue.id
  AND concert.venue_address IS NULL;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'concert-posters',
  'concert-posters',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
