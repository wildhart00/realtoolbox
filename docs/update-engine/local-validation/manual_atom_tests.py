"""Socket-only PG16.13 synthetic SQL validation. No live backend."""
import subprocess,time
B='/nix/store/bzrk3v0ay4cs0hn656464iyzn6n334js-postgresql-16.13/bin'
C=[B+'/psql','-h','/tmp/pgt','-p','5432','-U','postgres','-d','t1','-At','-X','-v','ON_ERROR_STOP=1'];passed=0
def q(s,r='postgres'):
 p=subprocess.run(C+['-c','SET ROLE '+r,'-c',s],capture_output=True,text=True);return p.returncode,'\n'.join(x for x in (p.stdout+p.stderr).splitlines() if x!='SET').strip()
def ok(s,r='postgres'):
 rc,t=q(s,r);assert rc==0,(s,t);return t
def check(n,s,e,r='postgres',err=False):
 global passed
 rc,t=q(s,r);assert (rc!=0 if err else rc==0) and e in t,(n,rc,t,e);passed+=1;print('PASS',n,flush=True)
check('local socket before SQL',"SELECT inet_server_addr() IS NULL AND current_setting('data_directory')='/tmp/pgt/data'",'t')
check('version','SELECT version()','PostgreSQL 16.13')
for f in ['stubs.sql','../INSTALL_DDL.sql','../INSTALL_SETTINGS.sql','../MANUAL_ATOM_RPC_PROPOSAL.sql']:
 p=subprocess.run(C+['-1','-f',f],capture_output=True,text=True);assert p.returncode==0,(f,p.stderr)
start='SELECT public.engine_begin_atom_run()'
for sig in ['engine_begin_atom_run()','engine_record_atom_draft(uuid,text,text,text,timestamptz,timestamptz,timestamptz)','engine_finish_atom_run(uuid,text,text,int)']:
 for role in ['anon','authenticated','service_role','sandbox_exec']:
  check(sig+' ACL '+role,f"SELECT has_function_privilege('{role}','public.{sig}','EXECUTE')",'t' if role=='service_role' else 'f')
for r in ['anon','sandbox_exec']:check('private logs '+r,'SELECT * FROM public.update_job_runs','permission denied',r,True)
check('service direct writes','UPDATE public.update_sources SET enabled=true','permission denied','service_role',True)
check('paused',start,'engine_paused','service_role',True)
ok('DELETE FROM public.update_engine_settings')
for s in [start,"SELECT public.engine_finish_atom_run(gen_random_uuid(),'failed',NULL,1)","SELECT public.engine_record_atom_draft(gen_random_uuid(),'x','x','title',now(),now(),now())"]:check('missing settings',s,'settings_missing','service_role',True)
ok('INSERT INTO public.update_engine_settings(id,paused) VALUES(true,false)')
ok("INSERT INTO public.update_sources(id,vendor,index_url,allowed_hosts,allowed_path_prefixes,enabled) VALUES('google-workspace-atom','Google Workspace','https://feeds.feedburner.com/GoogleAppsUpdates','{workspaceupdates.googleblog.com}','{/}',false)")
check('disabled',start,'source_disabled','service_role',True)
ok("UPDATE public.update_sources SET enabled=true,index_url='https://evil.example/'")
check('exact URL',start,'source_configuration_denied','service_role',True)
ok("UPDATE public.update_sources SET index_url='https://feeds.feedburner.com/GoogleAppsUpdates'; UPDATE public.update_engine_settings SET template_auto_publish_tested=true")
check('manual policy',start,'manual_policy_required','service_role',True)
ok('UPDATE public.update_engine_settings SET template_auto_publish_tested=false')
rid=ok(start,'service_role')
def rec(h='a',u='https://workspaceupdates.googleblog.com/2026/synthetic.html'):
 return f"SELECT public.engine_record_atom_draft('{rid}','{u}',repeat('{h}',64),'Synthetic Workspace release',now()-interval '2 days',now()-interval '1 day',now())"
def finish(o,s='NULL',n=1):return f"SELECT public.engine_finish_atom_run('{rid}','{o}',{s},{n})"
check('cadence',start,'source_cadence','service_role',True)
for u in ['https://evil.example/x','https://workspaceupdates.googleblog.com.evil.example/x','https://user@workspaceupdates.googleblog.com/x','http://workspaceupdates.googleblog.com/x','https://workspaceupdates.googleblog.com:443/x','https://workspaceupdates.googleblog.com/%2fetc','https://workspaceupdates.googleblog.com/x?q=x']:
 check('URL negative '+u,rec(u=u),'invalid_atom_metadata','service_role',True)
workers=[subprocess.Popen(C+['-c','SET ROLE service_role','-c',rec()],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True) for _ in range(8)];out=[]
for p in workers:
 a,b=p.communicate();assert p.returncode==0,b;out.append(a)
assert sum('\nqueued\n' in a for a in out)==1 and sum('duplicate:queued' in a for a in out)==7
passed+=1;print('PASS concurrent 1 insert 7 duplicate',flush=True)
check('one audit','SELECT count(*) FROM public.update_review_events','1')
check('server created count',f"SELECT detail->>'created' FROM public.update_job_runs WHERE id='{rid}'",'1')
check('no self lineage','SELECT revision_of IS NULL FROM public.update_candidates','t')
check('new version',rec('b'),'queued','service_role')
check('lineage',"SELECT revision_of='google-workspace-atom:'||repeat('a',64) FROM public.update_candidates WHERE content_hash=repeat('b',64)",'t')
check('max two',rec('c'),'draft_budget','service_role',True)
check('manual drafts',"SELECT bool_and(state='queued' AND risk='high' AND evidence_level='vendor_announced' AND 'hands_on_not_tested'=ANY(flags)) FROM public.update_candidates",'t')
check('public zero','SELECT count(*) FROM public.updates_public','0','anon')
check('invalid finish',finish('changed'),'invalid_run','service_role',True)
check('one fetch cap',finish('changed',"repeat('f',64)",2),'invalid_run','service_role',True)
check('changed finish',finish('changed',"repeat('f',64)"),'changed','service_role')
check('double finish',finish('changed',"repeat('f',64)"),'run_not_reserved','service_role',True)
ok('UPDATE public.update_sources SET last_attempt_at=NULL')
check('daily budget',start,'daily_budget','service_role',True)
ok('DELETE FROM public.update_job_runs');rid=ok(start,'service_role')
check('duplicate next run',rec(),'duplicate:queued','service_role')
check('nochange finish',finish('no_change',"repeat('e',64)"),'no_change','service_role')
check('health not freshness',"SELECT last_success_at>last_change_at AND last_good_snapshot_hash=repeat('e',64) FROM public.update_sources",'t')
ok('DELETE FROM public.update_job_runs; UPDATE public.update_sources SET last_attempt_at=NULL');rid=ok(start,'service_role')
check('failure',finish('failed'),'failed','service_role')
check('last good retained',"SELECT last_good_snapshot_hash=repeat('e',64) AND consecutive_failures=1 FROM public.update_sources",'t')
ok('DELETE FROM public.update_job_runs; UPDATE public.update_sources SET last_attempt_at=NULL')
p=subprocess.Popen(C+['-c',"BEGIN; SET ROLE service_role; SELECT public.engine_begin_atom_run(); SELECT pg_sleep(1); COMMIT"],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True);time.sleep(.2)
check('pause serialized',"SET lock_timeout='100ms'; UPDATE public.update_engine_settings SET paused=true",'lock timeout',err=True)
a,b=p.communicate();assert p.returncode==0,b
ok('UPDATE public.update_engine_settings SET paused=true')
check('postpause finish',"SELECT public.engine_finish_atom_run(gen_random_uuid(),'failed',NULL,1)",'engine_paused','service_role',True)
check('empty search paths',"SELECT count(*) FROM pg_proc WHERE proname IN ('engine_begin_atom_run','engine_record_atom_draft','engine_finish_atom_run') AND proconfig=ARRAY['search_path=\"\"']",'3')
ok('DROP FUNCTION public.engine_finish_atom_run(uuid,text,text,int); DROP FUNCTION public.engine_record_atom_draft(uuid,text,text,text,timestamptz,timestamptz,timestamptz); DROP FUNCTION public.engine_begin_atom_run()')
check('rollback',"SELECT count(*) FROM pg_proc WHERE proname IN ('engine_begin_atom_run','engine_record_atom_draft','engine_finish_atom_run')",'0')
print(f'{passed} manual Atom SQL checks passed; 0 failures',flush=True)
