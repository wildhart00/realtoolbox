-- ============================================================================
-- PROPOSAL ONLY — NOT APPLIED. Lives outside supabase/migrations on purpose.
-- Target: this project's single Lovable Cloud backend (the same instance serves
-- preview AND the live site, so applying this is a live change).
-- Additive only: new tables, no changes to existing tables, policies or jobs.
-- Requires separate written approval before it is applied.
-- ============================================================================

-- Reused, unchanged: public.tools (vendor/tool link), public.saved_tools
-- (tool watchlist; already own-user RLS), public.user_roles + has_role()
-- (admin checks), public.newsletter_subscribers (insert-only; admin read).

-- 1. Sources (admin-managed allowlist) ---------------------------------------
CREATE TABLE public.update_sources (
  id text PRIMARY KEY,
  tool_id uuid REFERENCES public.tools(id) ON DELETE SET NULL,
  vendor text NOT NULL,
  index_url text NOT NULL CHECK (index_url ~ '^https://'),
  allowed_hosts text[] NOT NULL,
  allowed_path_prefixes text[] NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  cadence_hours int NOT NULL DEFAULT 24 CHECK (cadence_hours BETWEEN 6 AND 168),
  stale_after_hours int NOT NULL DEFAULT 72,
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  last_change_at timestamptz,
  consecutive_failures int NOT NULL DEFAULT 0,
  last_error text,
  last_good_snapshot_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.update_sources TO authenticated;
GRANT ALL ON public.update_sources TO service_role;
ALTER TABLE public.update_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sources" ON public.update_sources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Safe public projection of sources (no health internals / errors).
CREATE VIEW public.update_sources_public WITH (security_invoker = false) AS
  SELECT id, vendor, index_url, last_success_at FROM public.update_sources WHERE enabled;
GRANT SELECT ON public.update_sources_public TO anon, authenticated;

-- 2. Private candidates + evidence -------------------------------------------
CREATE TABLE public.update_candidates (
  id text PRIMARY KEY,
  source_id text NOT NULL REFERENCES public.update_sources(id) ON DELETE CASCADE,
  canonical_url text NOT NULL,
  content_hash text NOT NULL,
  title text NOT NULL CHECK (length(title) BETWEEN 8 AND 200),
  published_date date NOT NULL,
  draft_summary text NOT NULL,
  evidence_level text NOT NULL DEFAULT 'vendor_announced'
    CHECK (evidence_level IN ('vendor_announced','editorially_checked','hands_on_tested')),
  risk text NOT NULL CHECK (risk IN ('low','high')),
  risk_reasons text[] NOT NULL DEFAULT '{}',
  flags text[] NOT NULL DEFAULT '{}',
  contradictions text[] NOT NULL DEFAULT '{}',
  state text NOT NULL DEFAULT 'queued'
    CHECK (state IN ('queued','needs_correction','approved','rejected','auto_eligible','published','withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, content_hash)
);
GRANT SELECT, INSERT, UPDATE ON public.update_candidates TO authenticated;
GRANT ALL ON public.update_candidates TO service_role;
ALTER TABLE public.update_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage candidates" ON public.update_candidates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.update_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id text NOT NULL REFERENCES public.update_candidates(id) ON DELETE CASCADE,
  from_state text, to_state text NOT NULL, note text,
  reviewer_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.update_review_events TO authenticated;
GRANT ALL ON public.update_review_events TO service_role;
ALTER TABLE public.update_review_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read review events" ON public.update_review_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write own review events" ON public.update_review_events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND reviewer_id = auth.uid());

-- 3. Private job logs ----------------------------------------------------------
CREATE TABLE public.update_job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text REFERENCES public.update_sources(id) ON DELETE SET NULL,
  outcome text NOT NULL, detail jsonb NOT NULL DEFAULT '{}',
  budget_used jsonb NOT NULL DEFAULT '{}', started_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.update_job_runs TO authenticated;
GRANT ALL ON public.update_job_runs TO service_role;
ALTER TABLE public.update_job_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read job runs" ON public.update_job_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- Workers write via service_role inside a server function only; no new credentials.

-- 4. Engine controls (pause flag) --------------------------------------------
CREATE TABLE public.update_engine_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  paused boolean NOT NULL DEFAULT true,
  template_auto_publish_tested boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.update_engine_settings TO authenticated;
GRANT ALL ON public.update_engine_settings TO service_role;
ALTER TABLE public.update_engine_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage engine settings" ON public.update_engine_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Public cards: published, non-withdrawn only ------------------------------
CREATE VIEW public.updates_public WITH (security_invoker = false) AS
  SELECT c.id, s.vendor, c.title, c.draft_summary AS summary, c.canonical_url AS source_url,
         c.published_date, c.updated_at AS checked_at, c.evidence_level
  FROM public.update_candidates c JOIN public.update_sources s ON s.id = c.source_id
  WHERE c.state = 'published';
GRANT SELECT ON public.updates_public TO anon, authenticated;

-- 6. Own-user topic watchlist & preferences (tools reuse saved_tools) ---------
CREATE TABLE public.user_watch_topics (
  user_id uuid NOT NULL, topic text NOT NULL CHECK (length(topic) BETWEEN 2 AND 60),
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, topic)
);
GRANT SELECT, INSERT, DELETE ON public.user_watch_topics TO authenticated;
GRANT ALL ON public.user_watch_topics TO service_role;
ALTER TABLE public.user_watch_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own topics read" ON public.user_watch_topics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own topics add" ON public.user_watch_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own topics remove" ON public.user_watch_topics FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY,
  audience text NOT NULL DEFAULT 'both' CHECK (audience IN ('investor','agent','both')),
  last_seen_updates_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own prefs read" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own prefs insert" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own prefs update" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.update_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.update_candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Not included (deliberately): digest consent and analytics tables. Existing
-- newsletter_subscribers stays as is; consent + delivery wait for a verified
-- marketing email provider. No anon access to subscribers or analytics.

-- ============================================================================
-- ROLLBACK (run only if the above was applied and must be reverted)
-- ============================================================================
-- DROP VIEW IF EXISTS public.updates_public;
-- DROP VIEW IF EXISTS public.update_sources_public;
-- DROP TABLE IF EXISTS public.user_preferences;
-- DROP TABLE IF EXISTS public.user_watch_topics;
-- DROP TABLE IF EXISTS public.update_engine_settings;
-- DROP TABLE IF EXISTS public.update_job_runs;
-- DROP TABLE IF EXISTS public.update_review_events;
-- DROP TABLE IF EXISTS public.update_candidates;
-- DROP TABLE IF EXISTS public.update_sources;
