-- ============================================================================
-- PROPOSAL ONLY — NOT APPLIED. Lives outside supabase/migrations on purpose.
-- Revision 2 (after audit of 230f04ec).
--
-- Target: the backend named by `project_id` in supabase/config.toml. That single
-- Lovable Cloud instance serves BOTH preview and the live site, so applying this
-- is a live change. Confirm the target again at deployment time.
--
-- Additive only. No existing table, policy, function, job or billing object is
-- altered. Requires separate written approval before it is applied.
--
-- Security model, stated candidly:
--   * Clients (anon/authenticated) get NO direct INSERT/UPDATE/DELETE on engine
--     tables. Admin state changes go only through SECURITY DEFINER functions that
--     check has_role() server-side, validate the transition, and write the audit
--     event in the same transaction.
--   * service_role BYPASSES RLS entirely. Granting it table access cannot be made
--     "insert-only" by policy. The only boundary for a future worker is the narrow
--     worker function below plus server-side code review; the worker must call
--     those functions and nothing else. No new credentials are introduced.
--   * Direct publication by any client is impossible: there is no grant for it,
--     and publish_update_candidate() refuses when settings are missing or paused.
-- ============================================================================

-- Reused, unchanged: public.tools, public.saved_tools (own-user RLS),
-- public.user_roles + public.has_role(), public.newsletter_subscribers,
-- public.update_updated_at_column().

-- 1. Settings singleton, seeded fail-closed ---------------------------------
CREATE TABLE public.update_engine_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  paused boolean NOT NULL DEFAULT true,
  template_auto_publish_tested boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.update_engine_settings TO authenticated;
GRANT SELECT ON public.update_engine_settings TO service_role;
ALTER TABLE public.update_engine_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read engine settings" ON public.update_engine_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.update_engine_settings (id, paused, template_auto_publish_tested) VALUES (true, true, false);

-- 2. Sources --------------------------------------------------------------
CREATE TABLE public.update_sources (
  id text PRIMARY KEY,
  tool_id uuid REFERENCES public.tools(id) ON DELETE SET NULL,
  vendor text NOT NULL,
  index_url text NOT NULL CHECK (index_url ~ '^https://'),
  allowed_hosts text[] NOT NULL CHECK (cardinality(allowed_hosts) > 0),
  allowed_path_prefixes text[] NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  cadence_hours int NOT NULL DEFAULT 24 CHECK (cadence_hours BETWEEN 6 AND 168),
  stale_after_hours int NOT NULL DEFAULT 72,
  last_attempt_at timestamptz,
  last_success_at timestamptz,          -- health (includes no-change checks)
  last_change_at timestamptz,           -- freshness (new content only)
  consecutive_failures int NOT NULL DEFAULT 0,
  last_error text,
  last_good_snapshot_hash text,         -- committed only after a complete batch
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.update_sources TO authenticated;
GRANT SELECT ON public.update_sources TO service_role;
ALTER TABLE public.update_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read sources" ON public.update_sources FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE VIEW public.update_sources_public AS
  SELECT id, vendor, index_url, last_success_at FROM public.update_sources WHERE enabled;
GRANT SELECT ON public.update_sources_public TO anon, authenticated;

-- 3. Candidates (one row per source + content revision) --------------------
CREATE TABLE public.update_candidates (
  id text PRIMARY KEY,                               -- source_id || ':' || content_hash
  source_id text NOT NULL REFERENCES public.update_sources(id) ON DELETE RESTRICT,
  canonical_url text NOT NULL,
  content_hash text NOT NULL,
  revision_of text REFERENCES public.update_candidates(id),
  title text NOT NULL CHECK (length(title) BETWEEN 8 AND 200),
  published_date date NOT NULL,                      -- vendor's own date
  draft_summary text NOT NULL,
  evidence_level text NOT NULL DEFAULT 'vendor_announced'
    CHECK (evidence_level IN ('vendor_announced','editorially_checked','hands_on_tested')),
  risk text NOT NULL CHECK (risk IN ('low','high')),
  risk_reasons text[] NOT NULL DEFAULT '{}',
  flags text[] NOT NULL DEFAULT '{}',
  contradictions text[] NOT NULL DEFAULT '{}',
  state text NOT NULL DEFAULT 'queued'
    CHECK (state IN ('queued','needs_correction','approved','rejected','auto_eligible','published','withdrawn')),
  source_checked_at timestamptz NOT NULL,            -- last fetch that saw this exact content
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,                          -- editorial publication time
  withdrawn_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),     -- row bookkeeping ONLY, never shown as "checked"
  UNIQUE (source_id, content_hash)
);
GRANT SELECT ON public.update_candidates TO authenticated;
GRANT SELECT ON public.update_candidates TO service_role;
ALTER TABLE public.update_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read candidates" ON public.update_candidates FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.update_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id text NOT NULL REFERENCES public.update_candidates(id) ON DELETE RESTRICT,
  from_state text, to_state text NOT NULL, note text,
  actor_id uuid,                                     -- null = worker
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.update_review_events TO authenticated;
ALTER TABLE public.update_review_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read review events" ON public.update_review_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.update_job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text REFERENCES public.update_sources(id) ON DELETE SET NULL,
  outcome text NOT NULL CHECK (outcome IN ('skipped','failed','no_change','changed','partial')),
  detail jsonb NOT NULL DEFAULT '{}', budget_used jsonb NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.update_job_runs TO authenticated;
ALTER TABLE public.update_job_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read job runs" ON public.update_job_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.update_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.update_candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Server-controlled review transition + atomic audit -----------------
CREATE OR REPLACE FUNCTION public.review_update_candidate(_id text, _to text, _note text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.update_candidates; ok boolean;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not_admin'; END IF;
  IF _to IN ('published','withdrawn') THEN RAISE EXCEPTION 'use_publish_or_withdraw_function'; END IF;
  SELECT * INTO c FROM public.update_candidates WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
  ok := (c.state, _to) IN (
    ('queued','approved'),('queued','rejected'),('queued','needs_correction'),
    ('needs_correction','queued'),('needs_correction','rejected'),
    ('auto_eligible','approved'),('auto_eligible','queued'),('auto_eligible','rejected'),
    ('approved','queued'));
  IF NOT ok THEN RAISE EXCEPTION 'invalid_transition:%->%', c.state, _to; END IF;
  IF _to IN ('rejected','needs_correction') AND coalesce(btrim(_note),'') = '' THEN RAISE EXCEPTION 'note_required'; END IF;
  IF _to = 'approved' AND cardinality(c.flags) > 0 AND coalesce(btrim(_note),'') = '' THEN RAISE EXCEPTION 'note_required_for_flagged'; END IF;
  UPDATE public.update_candidates SET state = _to, reviewed_at = now() WHERE id = _id;
  INSERT INTO public.update_review_events (candidate_id, from_state, to_state, note, actor_id)
    VALUES (_id, c.state, _to, _note, auth.uid());
  RETURN _to;
END $$;

CREATE OR REPLACE FUNCTION public.publish_update_candidate(_id text, _note text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.update_candidates; s public.update_engine_settings;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not_admin'; END IF;
  SELECT * INTO s FROM public.update_engine_settings WHERE id;
  IF NOT FOUND THEN RAISE EXCEPTION 'settings_missing'; END IF;
  IF s.paused THEN RAISE EXCEPTION 'engine_paused'; END IF;
  SELECT * INTO c FROM public.update_candidates WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR c.state <> 'approved' THEN RAISE EXCEPTION 'not_approved'; END IF;
  UPDATE public.update_candidates SET state = 'published', published_at = now() WHERE id = _id;
  INSERT INTO public.update_review_events (candidate_id, from_state, to_state, note, actor_id)
    VALUES (_id, 'approved', 'published', _note, auth.uid());
  RETURN 'published';
END $$;

CREATE OR REPLACE FUNCTION public.withdraw_update_candidate(_id text, _note text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.update_candidates;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not_admin'; END IF;
  IF coalesce(btrim(_note),'') = '' THEN RAISE EXCEPTION 'note_required'; END IF;
  SELECT * INTO c FROM public.update_candidates WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR c.state <> 'published' THEN RAISE EXCEPTION 'not_published'; END IF;
  UPDATE public.update_candidates SET state = 'withdrawn', withdrawn_at = now() WHERE id = _id;
  INSERT INTO public.update_review_events (candidate_id, from_state, to_state, note, actor_id)
    VALUES (_id, 'published', 'withdrawn', _note, auth.uid());
  RETURN 'withdrawn';
END $$;

-- Admin pause/resume (server-checked, audited via updated_at only).
CREATE OR REPLACE FUNCTION public.set_update_engine_paused(_paused boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not_admin'; END IF;
  UPDATE public.update_engine_settings SET paused = _paused, updated_at = now() WHERE id;
  IF NOT FOUND THEN RAISE EXCEPTION 'settings_missing'; END IF;
  RETURN _paused;
END $$;
-- template_auto_publish_tested has NO client setter; changing it needs a reviewed migration.

REVOKE ALL ON FUNCTION public.review_update_candidate(text,text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.publish_update_candidate(text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.withdraw_update_candidate(text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_update_engine_paused(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_update_candidate(text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_update_candidate(text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.withdraw_update_candidate(text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_update_engine_paused(boolean) TO authenticated;

-- 5. Narrow worker entry point (service_role only; NOT activated) ----------
-- Enforces the boundary in SQL: settings present + not paused, source enabled,
-- item URL host on that source's allowlist, insert-or-touch by exact revision.
-- It can never set state beyond queued/auto_eligible and never publishes.
CREATE OR REPLACE FUNCTION public.engine_record_revision(
  _source_id text, _canonical_url text, _content_hash text, _revision_of text,
  _title text, _published_date date, _draft_summary text, _risk text, _risk_reasons text[],
  _flags text[], _contradictions text[], _source_checked_at timestamptz)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.update_engine_settings; src public.update_sources; host text; st text; cid text;
BEGIN
  SELECT * INTO s FROM public.update_engine_settings WHERE id;
  IF NOT FOUND THEN RAISE EXCEPTION 'settings_missing'; END IF;
  IF s.paused THEN RAISE EXCEPTION 'engine_paused'; END IF;
  SELECT * INTO src FROM public.update_sources WHERE id = _source_id;
  IF NOT FOUND OR NOT src.enabled THEN RAISE EXCEPTION 'source_disabled'; END IF;
  host := lower(substring(_canonical_url from '^https://([^/:?#]+)'));
  IF host IS NULL OR NOT host = ANY (src.allowed_hosts) THEN RAISE EXCEPTION 'host_not_allowlisted'; END IF;
  cid := _source_id || ':' || _content_hash;
  IF EXISTS (SELECT 1 FROM public.update_candidates WHERE id = cid) THEN
    UPDATE public.update_candidates SET source_checked_at = greatest(source_checked_at, _source_checked_at) WHERE id = cid;
    RETURN 'duplicate';
  END IF;
  st := CASE WHEN s.template_auto_publish_tested AND _risk = 'low' AND cardinality(_flags) = 0 THEN 'auto_eligible' ELSE 'queued' END;
  INSERT INTO public.update_candidates (id, source_id, canonical_url, content_hash, revision_of, title, published_date,
    draft_summary, risk, risk_reasons, flags, contradictions, state, source_checked_at)
  VALUES (cid, _source_id, _canonical_url, _content_hash, _revision_of, _title, _published_date,
    _draft_summary, _risk, _risk_reasons, _flags, _contradictions, st, _source_checked_at);
  INSERT INTO public.update_review_events (candidate_id, from_state, to_state, note, actor_id)
    VALUES (cid, NULL, st, 'worker', NULL);
  RETURN st;
END $$;
REVOKE ALL ON FUNCTION public.engine_record_revision(text,text,text,text,text,date,text,text,text[],text[],text[],timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.engine_record_revision(text,text,text,text,text,date,text,text,text[],text[],text[],timestamptz) TO service_role;
-- Snapshot/health updates would get a similar narrow function before activation.

-- 6. Public cards: published only, real source-check time ------------------
CREATE VIEW public.updates_public AS
  SELECT c.id, s.vendor, c.title, c.draft_summary AS summary, c.canonical_url AS source_url,
         c.published_date AS source_published_date,
         c.source_checked_at,
         c.published_at,
         c.evidence_level
  FROM public.update_candidates c JOIN public.update_sources s ON s.id = c.source_id
  WHERE c.state = 'published';
GRANT SELECT ON public.updates_public TO anon, authenticated;

-- 7. Own-user topics and preferences (tools reuse saved_tools) ------------
CREATE TABLE public.user_watch_topics (
  user_id uuid NOT NULL, topic text NOT NULL CHECK (length(topic) BETWEEN 2 AND 60),
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, topic)
);
GRANT SELECT, INSERT, DELETE ON public.user_watch_topics TO authenticated;
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
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own prefs read" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own prefs insert" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own prefs update" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Deliberately excluded: digest consent and analytics tables (need a verified
-- marketing email provider and analytics design). No anon read of subscribers.

-- ============================================================================
-- ROLLBACK (only if applied and must be reverted)
-- ============================================================================
-- DROP VIEW IF EXISTS public.updates_public;
-- DROP VIEW IF EXISTS public.update_sources_public;
-- DROP FUNCTION IF EXISTS public.engine_record_revision(text,text,text,text,text,date,text,text,text[],text[],text[],timestamptz);
-- DROP FUNCTION IF EXISTS public.set_update_engine_paused(boolean);
-- DROP FUNCTION IF EXISTS public.withdraw_update_candidate(text,text);
-- DROP FUNCTION IF EXISTS public.publish_update_candidate(text,text);
-- DROP FUNCTION IF EXISTS public.review_update_candidate(text,text,text);
-- DROP TABLE IF EXISTS public.user_preferences;
-- DROP TABLE IF EXISTS public.user_watch_topics;
-- DROP TABLE IF EXISTS public.update_job_runs;
-- DROP TABLE IF EXISTS public.update_review_events;
-- DROP TABLE IF EXISTS public.update_candidates;
-- DROP TABLE IF EXISTS public.update_sources;
-- DROP TABLE IF EXISTS public.update_engine_settings;
