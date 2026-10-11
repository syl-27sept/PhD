-- Review version: single-owner private meetings + roadmap tables.
-- This architecture avoids browser authentication and keeps the data private by
-- scoping all rows to a trusted single-owner value while never exposing the
-- service-role secret in frontend code.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_key text NOT NULL DEFAULT 'single-owner',
  title text NOT NULL,
  date date NOT NULL,
  time text,
  supervisor_name text,
  agenda text,
  notes text,
  decisions text,
  action_items text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meetings_owner_key_not_empty CHECK (length(owner_key) > 0)
);

CREATE TABLE IF NOT EXISTS public.roadmap (
  id text PRIMARY KEY DEFAULT 'default',
  owner_key text NOT NULL DEFAULT 'single-owner',
  name text NOT NULL DEFAULT 'phd-roadmap',
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT roadmap_owner_key_not_empty CHECK (length(owner_key) > 0)
);

CREATE INDEX IF NOT EXISTS idx_meetings_owner_date
ON public.meetings (owner_key, date);

CREATE INDEX IF NOT EXISTS idx_meetings_owner_updated
ON public.meetings (owner_key, updated_at);

CREATE INDEX IF NOT EXISTS idx_roadmap_owner_updated
ON public.roadmap (owner_key, updated_at);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap ENABLE ROW LEVEL SECURITY;

-- Deny anonymous browser access completely.
CREATE POLICY "No anonymous access to meetings"
ON public.meetings
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "No anonymous access to roadmap"
ON public.roadmap
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Only the trusted server-side process for this single owner may access rows.
CREATE POLICY "Single owner can read meetings"
ON public.meetings
FOR SELECT
TO authenticated
USING (owner_key = 'single-owner');

CREATE POLICY "Single owner can insert meetings"
ON public.meetings
FOR INSERT
TO authenticated
WITH CHECK (owner_key = 'single-owner');

CREATE POLICY "Single owner can update meetings"
ON public.meetings
FOR UPDATE
TO authenticated
USING (owner_key = 'single-owner')
WITH CHECK (owner_key = 'single-owner');

CREATE POLICY "Single owner can delete meetings"
ON public.meetings
FOR DELETE
TO authenticated
USING (owner_key = 'single-owner');

CREATE POLICY "Single owner can read roadmap"
ON public.roadmap
FOR SELECT
TO authenticated
USING (owner_key = 'single-owner');

CREATE POLICY "Single owner can insert roadmap"
ON public.roadmap
FOR INSERT
TO authenticated
WITH CHECK (owner_key = 'single-owner');

CREATE POLICY "Single owner can update roadmap"
ON public.roadmap
FOR UPDATE
TO authenticated
USING (owner_key = 'single-owner')
WITH CHECK (owner_key = 'single-owner');

CREATE POLICY "Single owner can delete roadmap"
ON public.roadmap
FOR DELETE
TO authenticated
USING (owner_key = 'single-owner');

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meetings_updated_at ON public.meetings;
CREATE TRIGGER meetings_updated_at
BEFORE UPDATE ON public.meetings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS roadmap_updated_at ON public.roadmap;
CREATE TRIGGER roadmap_updated_at
BEFORE UPDATE ON public.roadmap
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
