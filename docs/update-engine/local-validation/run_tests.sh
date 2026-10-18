#!/bin/bash
# Runs SQL_TEST_SPEC cases against the LOCAL throwaway cluster (unix socket /tmp/pgt) only.
B=/nix/store/bzrk3v0ay4cs0hn656464iyzn6n334js-postgresql-16.13/bin
PSQL="env -i PATH=$B:/bin psql -h /tmp/pgt -U postgres -d t1 -At -X"
ADMIN=aaaaaaaa-0000-0000-0000-000000000001; MEMBER=bbbbbbbb-0000-0000-0000-000000000002
pass=0; fail=0
q() { # role uid sql
  local pre="SET ROLE $1;"; [ -n "$2" ] && pre="SET test.uid='$2'; $pre"
  $PSQL -c "$pre" -c "$3" 2>&1 | grep -v "^CONTEXT\|^SET$" | tail -n1
}
expect() { # name expected-regex role uid sql
  local out; out=$(q "$3" "$4" "$5")
  if [[ "$out" =~ $2 ]]; then pass=$((pass+1)); echo "PASS $1"; else fail=$((fail+1)); echo "FAIL $1 :: got [$out] want /$2/"; fi
}
sup() { $PSQL -c "$1" 2>&1 | tail -n1; }
REC="SELECT public.engine_record_revision('appfolio-newsroom', %s, %s, NULL, 'Synthetic AppFolio release title', '2026-10-01', 'Synthetic summary', 'low', '{}', '{}', '{}', %s)"
rec() { printf "$REC" "'$1'" "'$2'" "'$3'"; }

echo "== target check"; expect target_is_local_socket '^t\|/tmp/pgt/data$' postgres "" "SELECT inet_server_addr() IS NULL, current_setting('data_directory')"

echo "== setup (superuser, synthetic)"
sup "INSERT INTO public.update_sources (id, vendor, index_url, allowed_hosts, allowed_path_prefixes, enabled) VALUES ('appfolio-newsroom','AppFolio','https://www.appfolio.com/newsroom','{www.appfolio.com}','{/newsroom/}',true), ('off-src','Off','https://off.example/news','{off.example}','{/news/}',false)"

echo "== A. ACL matrix"
for t in update_engine_settings update_sources update_candidates update_review_events update_job_runs; do
  expect "anon_no_select_$t" 'permission denied' anon "" "SELECT count(*) FROM public.$t"
  expect "auth_no_insert_$t" 'permission denied' authenticated $ADMIN "INSERT INTO public.$t DEFAULT VALUES"
  expect "auth_no_update_$t" 'permission denied' authenticated $ADMIN "UPDATE public.$t SET id = id"
  expect "auth_no_delete_$t" 'permission denied' authenticated $ADMIN "DELETE FROM public.$t"
  expect "svc_no_delete_$t" 'permission denied' service_role "" "DELETE FROM public.$t"
done
expect svc_no_update_candidates 'permission denied' service_role "" "UPDATE public.update_candidates SET state='published'"
expect svc_no_update_settings 'permission denied' service_role "" "UPDATE public.update_engine_settings SET paused=false"
expect public_no_privs '^0$' postgres "" "SELECT count(*) FROM information_schema.role_table_grants WHERE grantee='PUBLIC' AND table_schema='public' AND (table_name LIKE 'update%' OR table_name IN ('user_watch_topics','user_preferences'))"
expect anon_only_public_views '^update_sources_public,updates_public$' postgres "" "SELECT string_agg(DISTINCT table_name, ',' ORDER BY table_name) FROM information_schema.role_table_grants WHERE grantee='anon' AND table_schema='public' AND (table_name LIKE 'update%' OR table_name IN ('user_watch_topics','user_preferences'))"
expect anon_grants_select_only '^SELECT$' postgres "" "SELECT string_agg(DISTINCT privilege_type, ',') FROM information_schema.role_table_grants WHERE grantee='anon' AND table_schema='public' AND table_name LIKE 'update%'"
expect member_reads_zero_candidates '^0$' authenticated $MEMBER "SELECT count(*) FROM public.update_candidates"
expect member_reads_zero_settings '^0$' authenticated $MEMBER "SELECT count(*) FROM public.update_engine_settings"
expect admin_reads_settings '^1$' authenticated $ADMIN "SELECT count(*) FROM public.update_engine_settings"
expect definer_search_path_empty '^0$' postgres "" "SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prosecdef AND p.proname IN ('review_update_candidate','publish_update_candidate','withdraw_update_candidate','set_update_engine_paused','engine_record_revision') AND coalesce(array_to_string(p.proconfig,','),'') <> 'search_path=\"\"'"
expect anon_no_exec_worker 'permission denied' anon "" "$(rec https://www.appfolio.com/newsroom/x h0 2026-10-18T10:00Z)"
expect auth_no_exec_worker 'permission denied' authenticated $ADMIN "$(rec https://www.appfolio.com/newsroom/x h0 2026-10-18T10:00Z)"
expect anon_no_exec_pause 'permission denied' anon "" "SELECT public.set_update_engine_paused(false)"
expect member_pause_not_admin 'not_admin' authenticated $MEMBER "SELECT public.set_update_engine_paused(false)"

echo "== C0. paused seed / missing config fail closed"
expect worker_blocked_when_seed_paused 'engine_paused' service_role "" "$(rec https://www.appfolio.com/newsroom/x h1 2026-10-18T10:00Z)"
expect seed_tested_policy_false '^t\|f$' postgres "" "SELECT paused, template_auto_publish_tested FROM public.update_engine_settings"
expect admin_unpause '^f$' authenticated $ADMIN "SELECT public.set_update_engine_paused(false)"

echo "== B. URL boundary"
for u in 'https://www.appfolio.com:443@evil.example/newsroom/x' 'https://user@www.appfolio.com/newsroom/x' 'https://www.appfolio.com:8443/newsroom/x' 'https://www.appfolio.com:443/newsroom/x' 'https://WWW.appfolio.com/newsroom/x' 'http://www.appfolio.com/newsroom/x' 'https://www.appfolio.com/newsroom/x?a=1' 'https://www.appfolio.com/newsroom/x#f' 'https://www.appfolio.com/newsroom/a\b' 'https://www.appfolio.com/newsroom/a b'; do
  expect "reject_canonical[$u]" 'url_not_canonical' service_role "" "$(rec "$u" hx 2026-10-18T10:00Z)"
done
for u in 'https://www.appfolio.com.evil.example/newsroom/x' 'https://evilwww.appfolio.com/newsroom/x'; do
  expect "reject_host[$u]" 'host_not_allowlisted' service_role "" "$(rec "$u" hx 2026-10-18T10:00Z)"
done
for u in 'https://www.appfolio.com/newsroomevil/x' 'https://www.appfolio.com/other/newsroom/x' 'https://www.appfolio.com'; do
  expect "reject_path[$u]" 'path_not_allowlisted' service_role "" "$(rec "$u" hx 2026-10-18T10:00Z)"
done
expect disabled_source 'source_disabled' service_role "" "SELECT public.engine_record_revision('off-src','https://off.example/news/x','h9',NULL,'Synthetic disabled source','2026-10-01','s','low','{}','{}','{}',now())"
expect no_rows_from_rejections '^0$' postgres "" "SELECT count(*) FROM public.update_candidates"

echo "== D. duplicates"
expect accept_insert '^queued$' service_role "" "$(rec https://www.appfolio.com/newsroom/x h1 2026-10-18T10:00Z)"
expect admin_approve '^approved$' authenticated $ADMIN "SELECT public.review_update_candidate('appfolio-newsroom:h1','approved','synthetic')"
expect dup_returns_state '^duplicate:approved$' service_role "" "$(rec https://www.appfolio.com/newsroom/x h1 2026-10-18T12:00Z)"
expect dup_older_no_regress '^duplicate:approved$' service_role "" "$(rec https://www.appfolio.com/newsroom/x h1 2026-10-18T08:00Z)"
expect dup_checked_advanced_state_kept '^approved\|2026-10-18 12:00:00\+00\|t$' postgres "" "SELECT state, source_checked_at, reviewed_at IS NOT NULL FROM public.update_candidates WHERE id='appfolio-newsroom:h1'"
expect dup_one_initial_audit '^1$' postgres "" "SELECT count(*) FROM public.update_review_events WHERE candidate_id='appfolio-newsroom:h1' AND from_state IS NULL"
# Concurrent duplicate insert: 8 parallel workers, same hash.
for i in 1 2 3 4 5 6 7 8; do (q service_role "" "$(rec https://www.appfolio.com/newsroom/y h2 2026-10-18T10:0${i}Z)" > /tmp/pgt/dup$i.out) & done; wait
expect concurrent_dup_one_row '^1$' postgres "" "SELECT count(*) FROM public.update_candidates WHERE content_hash='h2'"
expect concurrent_dup_one_audit '^1$' postgres "" "SELECT count(*) FROM public.update_review_events WHERE candidate_id='appfolio-newsroom:h2'"
n=$(grep -c '^queued$' /tmp/pgt/dup*.out); d=$(grep -c '^duplicate:queued$' /tmp/pgt/dup*.out | awk -F: '{s+=$NF} END{print s}')
n=$(cat /tmp/pgt/dup*.out | grep -c '^queued$'); d=$(cat /tmp/pgt/dup*.out | grep -c '^duplicate:queued$')
if [ "$n" = 1 ] && [ "$d" = 7 ]; then pass=$((pass+1)); echo "PASS concurrent_dup_returns 1 insert/7 dup"; else fail=$((fail+1)); echo "FAIL concurrent_dup_returns ins=$n dup=$d"; cat /tmp/pgt/dup*.out; fi

echo "== E. public projection"
expect public_none_before_publish '^0$' anon "" "SELECT count(*) FROM public.updates_public"
expect admin_publish '^published$' authenticated $ADMIN "SELECT public.publish_update_candidate('appfolio-newsroom:h1','synthetic')"
expect public_one_after_publish '^1$' anon "" "SELECT count(*) FROM public.updates_public"
expect public_view_no_raw_fields '^0$' postgres "" "SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='updates_public' AND column_name IN ('state','flags','risk','risk_reasons','contradictions','content_hash','revision_of')"
expect publish_unapproved_refused 'not_approved' authenticated $ADMIN "SELECT public.publish_update_candidate('appfolio-newsroom:h2','x')"
expect member_publish_refused 'not_admin' authenticated $MEMBER "SELECT public.publish_update_candidate('appfolio-newsroom:h2','x')"
expect withdraw_needs_note 'note_required' authenticated $ADMIN "SELECT public.withdraw_update_candidate('appfolio-newsroom:h1','')"
expect admin_withdraw '^withdrawn$' authenticated $ADMIN "SELECT public.withdraw_update_candidate('appfolio-newsroom:h1','synthetic')"
expect public_zero_after_withdraw '^0$' anon "" "SELECT count(*) FROM public.updates_public"
expect worker_cannot_set_published 'permission denied for function' service_role "" "SELECT public.review_update_candidate('appfolio-newsroom:h2','published','x')"

echo "== F. own-user rows"
expect own_pref_insert 'INSERT 0 1|^$' authenticated $MEMBER "INSERT INTO public.user_preferences (user_id) VALUES ('$MEMBER')"
expect other_user_pref_insert_denied 'row-level security' authenticated $MEMBER "INSERT INTO public.user_preferences (user_id) VALUES ('$ADMIN')"
expect other_user_pref_invisible '^0$' authenticated $ADMIN "SELECT count(*) FROM public.user_preferences"
expect anon_no_prefs 'permission denied' anon "" "SELECT count(*) FROM public.user_preferences"

echo "== C. concurrent pause serialization"
sup "SELECT 1" >/dev/null
# publish holds settings FOR SHARE for 3s; pause must wait.
expect admin_approve_h2 '^approved$' authenticated $ADMIN "SELECT public.review_update_candidate('appfolio-newsroom:h2','approved','synthetic')"
( $PSQL -c "SET test.uid='$ADMIN'" -c "SET ROLE authenticated" -c "BEGIN" -c "SELECT public.publish_update_candidate('appfolio-newsroom:h2','s')" -c "SELECT pg_sleep(3)" -c "COMMIT" > /tmp/pgt/c1.out 2>&1 ) &
sleep 1; t0=$(date +%s.%N); q authenticated $ADMIN "SELECT public.set_update_engine_paused(true)" > /tmp/pgt/c2.out; t1=$(date +%s.%N); wait
w=$(echo "$t1 - $t0" | bc)
if (( $(echo "$w > 1.5" | bc) )) && grep -q '^t$' /tmp/pgt/c2.out && grep -q published /tmp/pgt/c1.out; then pass=$((pass+1)); echo "PASS pause_waits_for_publish (${w}s)"; else fail=$((fail+1)); echo "FAIL pause_waits_for_publish w=$w"; cat /tmp/pgt/c1.out /tmp/pgt/c2.out; fi
expect worker_after_pause 'engine_paused' service_role "" "$(rec https://www.appfolio.com/newsroom/z h3 2026-10-18T10:00Z)"
expect admin_unpause2 '^f$' authenticated $ADMIN "SELECT public.set_update_engine_paused(false)"
# Worker holds lock, pause waits; then reverse: pause commits first, worker refused.
( $PSQL -c "SET ROLE service_role" -c "BEGIN" -c "$(rec https://www.appfolio.com/newsroom/z h4 2026-10-18T10:00Z)" -c "SELECT pg_sleep(3)" -c "COMMIT" > /tmp/pgt/c3.out 2>&1 ) &
sleep 1; t0=$(date +%s.%N); q authenticated $ADMIN "SELECT public.set_update_engine_paused(true)" > /tmp/pgt/c4.out; t1=$(date +%s.%N); wait
w=$(echo "$t1 - $t0" | bc)
if (( $(echo "$w > 1.5" | bc) )) && grep -q '^queued$' /tmp/pgt/c3.out; then pass=$((pass+1)); echo "PASS pause_waits_for_worker (${w}s)"; else fail=$((fail+1)); echo "FAIL pause_waits_for_worker w=$w"; cat /tmp/pgt/c3.out; fi
( $PSQL -c "SET test.uid='$ADMIN'" -c "SET ROLE authenticated" -c "BEGIN" -c "SELECT public.set_update_engine_paused(false)" -c "SELECT pg_sleep(2)" -c "ROLLBACK" > /tmp/pgt/c5.out 2>&1 ) &
sleep 0.5; q service_role "" "$(rec https://www.appfolio.com/newsroom/z h5 2026-10-18T10:00Z)" > /tmp/pgt/c6.out; wait
if grep -q engine_paused /tmp/pgt/c6.out; then pass=$((pass+1)); echo "PASS rolled_back_unpause_keeps_paused"; else fail=$((fail+1)); echo "FAIL rolled_back_unpause"; cat /tmp/pgt/c6.out; fi
# Deadlock smoke: 20 interleaved publish/record/pause calls.
expect admin_unpause3 '^f$' authenticated $ADMIN "SELECT public.set_update_engine_paused(false)"
for i in $(seq 1 20); do
  (q service_role "" "$(rec https://www.appfolio.com/newsroom/d d$i 2026-10-18T10:00Z)" >> /tmp/pgt/dl.out) &
  (q authenticated $ADMIN "SELECT public.set_update_engine_paused(false)" >> /tmp/pgt/dl.out) &
done; wait
if grep -qi deadlock /tmp/pgt/dl.out; then fail=$((fail+1)); echo "FAIL deadlock_seen"; else pass=$((pass+1)); echo "PASS no_deadlock_40_interleaved"; fi

echo "== G. missing settings (superuser deletes singleton in a rolled-back txn)"
out=$($PSQL -c "BEGIN" -c "DELETE FROM public.update_engine_settings" -c "SET LOCAL ROLE service_role" -c "$(rec https://www.appfolio.com/newsroom/m m1 2026-10-18T10:00Z)" -c "ROLLBACK" 2>&1)
if [[ "$out" =~ settings_missing ]]; then pass=$((pass+1)); echo "PASS worker_settings_missing"; else fail=$((fail+1)); echo "FAIL worker_settings_missing [$out]"; fi
out=$($PSQL -c "BEGIN" -c "DELETE FROM public.update_engine_settings" -c "SET LOCAL test.uid='$ADMIN'" -c "SET LOCAL ROLE authenticated" -c "SELECT public.set_update_engine_paused(false)" -c "ROLLBACK" 2>&1)
if [[ "$out" =~ settings_missing ]]; then pass=$((pass+1)); echo "PASS pause_settings_missing"; else fail=$((fail+1)); echo "FAIL pause_settings_missing [$out]"; fi
expect settings_restored_after_rollback '^1$' postgres "" "SELECT count(*) FROM public.update_engine_settings"

echo "TOTAL pass=$pass fail=$fail"
