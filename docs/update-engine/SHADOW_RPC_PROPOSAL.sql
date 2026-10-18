-- PROPOSAL ONLY. No live apply. Reuses installed engine tables; no new tables/grants.
-- Daily reservation is global (two source checks/day), one source check per 24h.
CREATE FUNCTION public.engine_begin_shadow_run(_source_id text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE cfg public.update_engine_settings; src public.update_sources; rid uuid;
BEGIN
  SELECT * INTO cfg FROM public.update_engine_settings WHERE id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'settings_missing'; END IF;
  IF cfg.paused THEN RAISE EXCEPTION 'engine_paused'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(782901);
  SELECT * INTO src FROM public.update_sources WHERE id=_source_id FOR UPDATE;
  IF NOT FOUND OR NOT src.enabled THEN RAISE EXCEPTION 'source_disabled'; END IF;
  IF _source_id NOT IN ('realtor-mediaroom','appfolio-newsroom') THEN RAISE EXCEPTION 'source_not_shadow_allowlisted'; END IF;
  IF src.last_attempt_at > now() - interval '24 hours' THEN RAISE EXCEPTION 'source_cadence'; END IF;
  IF (SELECT count(*) FROM public.update_job_runs WHERE started_at >= date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') >= 2
    THEN RAISE EXCEPTION 'daily_budget'; END IF;
  UPDATE public.update_sources SET last_attempt_at=now() WHERE id=_source_id;
  INSERT INTO public.update_job_runs(source_id,outcome,detail,budget_used)
    VALUES(_source_id,'partial','{"status":"reserved"}','{"source_checks":1}') RETURNING id INTO rid;
  RETURN rid;
END $$;

CREATE FUNCTION public.engine_finish_shadow_run(_run_id uuid,_outcome text,_snapshot text,_requests int,_created int)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE cfg public.update_engine_settings; src public.update_sources; job public.update_job_runs; sid text;
BEGIN
  SELECT * INTO cfg FROM public.update_engine_settings WHERE id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'settings_missing'; END IF;
  IF cfg.paused THEN RAISE EXCEPTION 'engine_paused'; END IF;
  SELECT source_id INTO sid FROM public.update_job_runs WHERE id=_run_id;
  SELECT * INTO src FROM public.update_sources WHERE id=sid FOR UPDATE;
  IF NOT FOUND OR NOT src.enabled THEN RAISE EXCEPTION 'source_disabled'; END IF;
  SELECT * INTO job FROM public.update_job_runs WHERE id=_run_id FOR UPDATE;
  IF job.detail->>'status' IS DISTINCT FROM 'reserved' THEN RAISE EXCEPTION 'run_not_reserved'; END IF;
  IF job.started_at < now()-interval '15 minutes' THEN RAISE EXCEPTION 'run_expired'; END IF;
  IF _outcome IS NULL OR _outcome NOT IN ('failed','partial','changed','no_change') OR
     _requests IS NULL OR _requests NOT BETWEEN 0 AND 3 OR _created IS NULL OR _created NOT BETWEEN 0 AND 2 OR
     (_outcome='changed' AND _created=0) OR (_outcome='no_change' AND _created<>0) OR
     (_outcome IN ('changed','no_change') AND (_snapshot IS NULL OR _snapshot !~ '^[a-f0-9]{64}$')) OR
     (_outcome IN ('failed','partial') AND _snapshot IS NOT NULL)
     THEN RAISE EXCEPTION 'invalid_run'; END IF;
  UPDATE public.update_sources SET
    last_success_at=CASE WHEN _outcome IN ('changed','no_change') THEN now() ELSE last_success_at END,
    last_change_at=CASE WHEN _created>0 THEN now() ELSE last_change_at END,
    last_good_snapshot_hash=CASE WHEN _outcome IN ('changed','no_change') THEN _snapshot ELSE last_good_snapshot_hash END,
    consecutive_failures=CASE WHEN _outcome IN ('changed','no_change') THEN 0 ELSE consecutive_failures+1 END,
    last_error=CASE WHEN _outcome IN ('changed','no_change') THEN NULL ELSE 'shadow_incomplete' END WHERE id=sid;
  UPDATE public.update_job_runs SET outcome=_outcome,
    detail=jsonb_build_object('status','finished','created',_created),
    budget_used=jsonb_build_object('source_checks',1,'requests',_requests) WHERE id=_run_id;
  RETURN _outcome;
END $$;
REVOKE ALL ON FUNCTION public.engine_begin_shadow_run(text) FROM PUBLIC,anon,authenticated,service_role,sandbox_exec;
REVOKE ALL ON FUNCTION public.engine_finish_shadow_run(uuid,text,text,int,int) FROM PUBLIC,anon,authenticated,service_role,sandbox_exec;
GRANT EXECUTE ON FUNCTION public.engine_begin_shadow_run(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.engine_finish_shadow_run(uuid,text,text,int,int) TO service_role;
-- Rollback (manual, NOT executed by migration):
-- DROP FUNCTION public.engine_finish_shadow_run(uuid,text,text,int,int);
-- DROP FUNCTION public.engine_begin_shadow_run(text);