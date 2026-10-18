"""Only the disposable /tmp/pgt Unix socket. No credentials/JWT or live backend."""
import subprocess, time
from pathlib import Path
B = '/nix/store/bzrk3v0ay4cs0hn656464iyzn6n334js-postgresql-16.13/bin'
CMD = [B+'/psql','-h','/tmp/pgt','-p','5432','-U','postgres','-d','t1','-At','-X','-v','ON_ERROR_STOP=1']
passed = 0
def query(sql, role='postgres'):
    r = subprocess.run(CMD+['-c', 'SET ROLE '+role, '-c', sql], capture_output=True, text=True)
    return r.returncode, '\n'.join(x for x in (r.stdout+r.stderr).splitlines() if x != 'SET')
def check(name, sql, expected, role='postgres'):
    global passed
    rc, text = query(sql,role)
    assert expected in text, (name, rc, text, expected)
    passed += 1; print('PASS',name,flush=True)
def ok(sql):
    rc, text=query(sql); assert rc==0,(sql,text); return text.strip()
check('verified local socket',"SELECT inet_server_addr() IS NULL AND current_setting('data_directory')='/tmp/pgt/data'",'t')
check('PG16.13', 'SELECT version()', 'PostgreSQL 16.13')
for name,sig in [('begin','engine_begin_shadow_run(text)'),('finish','engine_finish_shadow_run(uuid,text,text,integer,integer)')]:
    for role in ['anon','authenticated','sandbox_exec','service_role']:
        check(name+' ACL '+role,f"SELECT has_function_privilege('{role}','public.{sig}','EXECUTE')",'t' if role=='service_role' else 'f')
check('empty search path',"SELECT count(*) FROM pg_proc WHERE proname LIKE 'engine_%shadow_run' AND proconfig=ARRAY['search_path=\"\"']",'2')
BEGIN="SELECT public.engine_begin_shadow_run('appfolio-newsroom')"
ok('DELETE FROM public.update_job_runs; UPDATE public.update_sources SET last_attempt_at=NULL; UPDATE public.update_engine_settings SET paused=true')
check('paused denial',BEGIN,'engine_paused','service_role')
ok('DELETE FROM public.update_engine_settings')
check('missing settings denial',BEGIN,'settings_missing','service_role')
ok('INSERT INTO public.update_engine_settings(id,paused) VALUES(true,false); UPDATE public.update_sources SET enabled=false WHERE id=\'appfolio-newsroom\'')
check('disabled source denial',BEGIN,'source_disabled','service_role')
ok("UPDATE public.update_sources SET enabled=true WHERE id='appfolio-newsroom'")
rc,rid=query(BEGIN,'service_role'); assert rc==0,(rc,rid); rid=rid.strip()
check('reservation consumes quota',"SELECT detail->>'status' FROM public.update_job_runs WHERE id='"+rid+"'",'reserved')
check('cadence denial',BEGIN,'source_cadence','service_role')
finish=lambda outcome,snap,requests=2,created=0: f"SELECT public.engine_finish_shadow_run('{rid}','{outcome}',{snap},{requests},{created})"
check('invalid success fails atomically',finish('changed','NULL'),'invalid_run','service_role')
check('reservation unchanged after refusal',f"SELECT detail->>'status' FROM public.update_job_runs WHERE id='{rid}'",'reserved')
check('failure completes',finish('failed','NULL'),'failed','service_role')
check('failure preserves snapshot',"SELECT last_good_snapshot_hash='before' FROM public.update_sources WHERE id='appfolio-newsroom'",'t')
check('double finish denied',finish('failed','NULL'),'run_not_reserved','service_role')
ok("UPDATE public.update_sources SET last_attempt_at=NULL; DELETE FROM public.update_job_runs")
rc,rid=query(BEGIN,'service_role'); assert rc==0; rid=rid.strip()
check('no change completes',finish('no_change',"'"+'a'*64+"'"),'no_change','service_role')
check('health not freshness',"SELECT last_success_at IS NOT NULL AND last_change_at='2026-01-01Z' AND last_good_snapshot_hash=repeat('a',64) FROM public.update_sources WHERE id='appfolio-newsroom'",'t')
ok("UPDATE public.update_sources SET last_attempt_at=NULL; DELETE FROM public.update_job_runs")
rc,rid=query(BEGIN,'service_role'); assert rc==0; rid=rid.strip()
check('partial completes',finish('partial','NULL',3,1),'partial','service_role')
check('partial preserves snapshot',"SELECT last_good_snapshot_hash=repeat('a',64) FROM public.update_sources WHERE id='appfolio-newsroom'",'t')
ok("UPDATE public.update_sources SET last_attempt_at=NULL; INSERT INTO public.update_job_runs(source_id,outcome) VALUES('appfolio-newsroom','partial')")
check('two daily reservations cap',BEGIN,'daily_budget','service_role')
check('raw logs denied', 'SELECT * FROM public.update_job_runs','permission denied','anon')
check('sandbox raw logs denied','SELECT * FROM public.update_job_runs','permission denied','sandbox_exec')
# Settings SHARE lock holds for the whole worker transaction: pause must wait.
ok('DELETE FROM public.update_job_runs; UPDATE public.update_sources SET last_attempt_at=NULL')
p=subprocess.Popen(CMD+['-c',"BEGIN; SET ROLE service_role; SELECT public.engine_begin_shadow_run('appfolio-newsroom'); SELECT pg_sleep(1.5); COMMIT"],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
time.sleep(.3)
check('pause serialized',"SET lock_timeout='200ms'; UPDATE public.update_engine_settings SET paused=true",'lock timeout')
out,err=p.communicate(); assert p.returncode==0,(out,err)
ok('UPDATE public.update_engine_settings SET paused=true')
check('post pause blocked',BEGIN,'engine_paused','service_role')
ok('DROP FUNCTION public.engine_finish_shadow_run(uuid,text,text,int,int); DROP FUNCTION public.engine_begin_shadow_run(text)')
check('proposal rollback',"SELECT count(*) FROM pg_proc WHERE proname LIKE 'engine_%shadow_run'",'0')
print(f'{passed} shadow SQL checks passed; 0 failures',flush=True)