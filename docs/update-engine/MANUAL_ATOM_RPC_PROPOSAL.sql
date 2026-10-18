-- PROPOSAL ONLY: feed-only manual run. No table/policy/global ACL changes.
-- Supersedes SHADOW_RPC_PROPOSAL.sql for this feed; do NOT apply both packets.
CREATE FUNCTION public.engine_begin_atom_run() RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE cfg public.update_engine_settings; src public.update_sources; rid uuid;
BEGIN
  SELECT * INTO cfg FROM public.update_engine_settings WHERE id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'settings_missing'; END IF;
  IF cfg.paused THEN RAISE EXCEPTION 'engine_paused'; END IF;
  IF cfg.template_auto_publish_tested THEN RAISE EXCEPTION 'manual_policy_required'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(782901);
  SELECT * INTO src FROM public.update_sources WHERE id='google-workspace-atom' FOR UPDATE;
  IF NOT FOUND OR NOT src.enabled THEN RAISE EXCEPTION 'source_disabled'; END IF;
  IF src.index_url <> 'https://feeds.feedburner.com/GoogleAppsUpdates' OR
     src.allowed_hosts <> ARRAY['workspaceupdates.googleblog.com']::text[] OR
     src.allowed_path_prefixes <> ARRAY['/']::text[] OR src.cadence_hours <> 24
    THEN RAISE EXCEPTION 'source_configuration_denied'; END IF;
  IF src.last_attempt_at > now()-interval '24 hours' THEN RAISE EXCEPTION 'source_cadence'; END IF;
  IF (SELECT count(*) FROM public.update_job_runs WHERE source_id=src.id AND
      started_at >= date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') >= 1
    THEN RAISE EXCEPTION 'daily_budget'; END IF;
  UPDATE public.update_sources SET last_attempt_at=now() WHERE id=src.id;
  INSERT INTO public.update_job_runs(source_id,outcome,detail,budget_used)
    VALUES(src.id,'partial','{"status":"reserved","submitted":[],"created":0}',
      '{"source_checks":1,"reserved_fetches":1}') RETURNING id INTO rid;
  RETURN rid;
END $$;

-- Narrow run-bound wrapper: lineage serialized under the source lock; the existing
-- reviewed engine_record_revision remains the ONLY candidate insertion mechanism.
CREATE FUNCTION public.engine_record_atom_draft(_run_id uuid,_canonical_url text,_content_hash text,
  _title text,_published timestamptz,_updated timestamptz,_checked_at timestamptz)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE cfg public.update_engine_settings; src public.update_sources; job public.update_job_runs;
  prior text; result text; cid text; flags text[];
BEGIN
  SELECT * INTO cfg FROM public.update_engine_settings WHERE id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'settings_missing'; END IF;
  IF cfg.paused THEN RAISE EXCEPTION 'engine_paused'; END IF;
  IF cfg.template_auto_publish_tested THEN RAISE EXCEPTION 'manual_policy_required'; END IF;
  SELECT * INTO src FROM public.update_sources WHERE id='google-workspace-atom' FOR UPDATE;
  IF NOT FOUND OR NOT src.enabled THEN RAISE EXCEPTION 'source_disabled'; END IF;
  SELECT * INTO job FROM public.update_job_runs WHERE id=_run_id FOR UPDATE;
  IF NOT FOUND OR job.source_id <> src.id OR job.detail->>'status' IS DISTINCT FROM 'reserved'
    THEN RAISE EXCEPTION 'run_not_reserved'; END IF;
  IF job.started_at < now()-interval '15 minutes' THEN RAISE EXCEPTION 'run_expired'; END IF;
  IF _content_hash IS NULL OR _content_hash !~ '^[a-f0-9]{64}$' OR _published IS NULL OR
     _updated IS NULL OR _checked_at IS NULL OR _updated < _published OR _updated > _checked_at OR
     _checked_at < job.started_at-interval '1 minute' OR _checked_at > now()+interval '1 minute' OR
     _canonical_url IS NULL OR _canonical_url !~ '^https://workspaceupdates[.]googleblog[.]com/[^?#[:space:]\\]*$' OR
     _canonical_url ~* '%(2e|2f|5c)' OR _title IS NULL OR length(_title) NOT BETWEEN 8 AND 200 OR _title ~ '[<>]'
    THEN RAISE EXCEPTION 'invalid_atom_metadata'; END IF;
  cid := src.id || ':' || _content_hash;
  IF NOT (job.detail->'submitted' ? cid) AND jsonb_array_length(job.detail->'submitted') >= 2
    THEN RAISE EXCEPTION 'draft_budget'; END IF;
  SELECT id INTO prior FROM public.update_candidates
    WHERE source_id=src.id AND canonical_url=_canonical_url AND content_hash<>_content_hash
    ORDER BY first_seen_at DESC,id DESC LIMIT 1;
  flags := ARRAY['feed_metadata_only','manual_review_required','hands_on_not_tested'];
  IF _published < _checked_at-interval '30 days' THEN flags:=flags||ARRAY['old_publication_not_new']; END IF;
  result := public.engine_record_revision(src.id,_canonical_url,_content_hash,prior,_title,
    (_published AT TIME ZONE 'UTC')::date,
    'Workspace Atom metadata: '||_title||'. Published: '||_published::text||'; updated: '||_updated::text||'. Manual review required; not hands-on tested.',
    'high',ARRAY['metadata_requires_manual_review'],flags,ARRAY[]::text[],_checked_at);
  IF NOT (job.detail->'submitted' ? cid) THEN
    UPDATE public.update_job_runs SET detail=jsonb_set(jsonb_set(detail,'{submitted}',
      (detail->'submitted')||jsonb_build_array(cid)),'{created}',
      to_jsonb((detail->>'created')::int + CASE WHEN result LIKE 'duplicate:%' THEN 0 ELSE 1 END)) WHERE id=_run_id;
  END IF;
  RETURN result;
END $$;

CREATE FUNCTION public.engine_finish_atom_run(_run_id uuid,_outcome text,_snapshot text,_requests int)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE cfg public.update_engine_settings; src public.update_sources; job public.update_job_runs; created int;
BEGIN
  SELECT * INTO cfg FROM public.update_engine_settings WHERE id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'settings_missing'; END IF;
  IF cfg.paused THEN RAISE EXCEPTION 'engine_paused'; END IF;
  SELECT * INTO src FROM public.update_sources WHERE id='google-workspace-atom' FOR UPDATE;
  IF NOT FOUND OR NOT src.enabled THEN RAISE EXCEPTION 'source_disabled'; END IF;
  SELECT * INTO job FROM public.update_job_runs WHERE id=_run_id FOR UPDATE;
  IF NOT FOUND OR job.source_id<>src.id OR job.detail->>'status' IS DISTINCT FROM 'reserved'
    THEN RAISE EXCEPTION 'run_not_reserved'; END IF;
  IF job.started_at < now()-interval '15 minutes' THEN RAISE EXCEPTION 'run_expired'; END IF;
  created := (job.detail->>'created')::int;
  IF _requests IS DISTINCT FROM 1 OR _outcome IS NULL OR _outcome NOT IN ('failed','partial','changed','no_change') OR
    (_outcome='changed' AND created=0) OR (_outcome='no_change' AND created<>0) OR
    (_outcome='failed' AND created<>0) OR (_outcome='partial' AND created=0) OR
    (_outcome IN ('changed','no_change') AND (_snapshot IS NULL OR _snapshot !~ '^[a-f0-9]{64}$')) OR
    (_outcome IN ('failed','partial') AND _snapshot IS NOT NULL) THEN RAISE EXCEPTION 'invalid_run'; END IF;
  UPDATE public.update_sources SET
    last_success_at=CASE WHEN _outcome IN ('changed','no_change') THEN now() ELSE last_success_at END,
    last_change_at=CASE WHEN created>0 THEN now() ELSE last_change_at END,
    last_good_snapshot_hash=CASE WHEN _outcome IN ('changed','no_change') THEN _snapshot ELSE last_good_snapshot_hash END,
    consecutive_failures=CASE WHEN _outcome IN ('changed','no_change') THEN 0 ELSE consecutive_failures+1 END,
    last_error=CASE WHEN _outcome IN ('changed','no_change') THEN NULL ELSE 'atom_incomplete' END WHERE id=src.id;
  UPDATE public.update_job_runs SET outcome=_outcome,detail=detail||'{"status":"finished"}'::jsonb,
    budget_used='{"source_checks":1,"reserved_fetches":1,"requests":1}' WHERE id=_run_id;
  RETURN _outcome;
END $$;
REVOKE ALL ON FUNCTION public.engine_begin_atom_run() FROM PUBLIC,anon,authenticated,service_role,sandbox_exec;
REVOKE ALL ON FUNCTION public.engine_record_atom_draft(uuid,text,text,text,timestamptz,timestamptz,timestamptz) FROM PUBLIC,anon,authenticated,service_role,sandbox_exec;
REVOKE ALL ON FUNCTION public.engine_finish_atom_run(uuid,text,text,int) FROM PUBLIC,anon,authenticated,service_role,sandbox_exec;
GRANT EXECUTE ON FUNCTION public.engine_begin_atom_run() TO service_role;
GRANT EXECUTE ON FUNCTION public.engine_record_atom_draft(uuid,text,text,text,timestamptz,timestamptz,timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.engine_finish_atom_run(uuid,text,text,int) TO service_role;
-- Rollback ONLY after approval, not executed on apply:
-- DROP FUNCTION public.engine_finish_atom_run(uuid,text,text,int);
-- DROP FUNCTION public.engine_record_atom_draft(uuid,text,text,text,timestamptz,timestamptz,timestamptz);
-- DROP FUNCTION public.engine_begin_atom_run();
