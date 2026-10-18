-- DATA-WRITE PROPOSAL ONLY. Separate from DDL migration. Abort on collision.
-- allowed_hosts/path are OUTPUT provenance, NOT fetch authorization.
INSERT INTO public.update_sources(id,vendor,index_url,allowed_hosts,allowed_path_prefixes,enabled,cadence_hours)
VALUES('google-workspace-atom','Google Workspace','https://feeds.feedburner.com/GoogleAppsUpdates',
  ARRAY['workspaceupdates.googleblog.com'],ARRAY['/'],true,24);
-- No existing source rows changed. Keep settings paused=true/tested=false on install.
-- During one approved call ONLY, existing admin RPC set_update_engine_paused(false),
-- then always set_update_engine_paused(true). Handler's finally attempts repause.
-- Rollback: disable ONLY this source via separately approved data write; retain drafts/audits.
