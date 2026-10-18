# Pre-apply check — ABORTED, nothing applied (2026-10-18 ~16:22 UTC)

Target: project_id pcnsuyadfqrmythikwpa (supabase/config.toml) — matched.
Proposal sha256: f5eeeca0aa57f51dedb5e8ccd3b9326cd2545827269dff64a978434c1f1204f2 — matched.
Name collisions: none (0 of 9 relations, 0 of 5 functions exist).
Dependencies present: has_role(uuid, app_role), update_updated_at_column(), tools.id uuid.

## Blocking dependency difference
Live has a role `sandbox_exec` (BYPASSRLS = true, not superuser) that the local
validation stub did not have. Default privileges for objects created by
`postgres` in `public` grant it `ar` (SELECT, INSERT) on new tables and `rU` on
sequences. The approved REVOKE lists PUBLIC, anon, authenticated, service_role
only, so after apply `sandbox_exec` would keep SELECT+INSERT on every new private
engine table (candidates, review events, settings, job runs, watchlists,
preferences), and RLS would not restrict it. That contradicts the approved
access matrix, so the SQL cannot be applied unchanged.

Proposed minimal fix (needs review, not applied): add `sandbox_exec` to the
table REVOKE list (and, if it should appear in the matrix, document it as "none").
Functions are unaffected (default function ACLs do not include sandbox_exec).

## Pre-apply snapshot of existing tables (unchanged; for later comparison)
| table | policies | policy md5 |
|---|---|---|
| newsletter_subscribers | 2 | 8175635bee4d7696cbd90941e3d6950d |
| profiles | 3 | 83db0a3498a5b30d61347b00fec40771 |
| purchases | 1 | 6999834c542627bf35ec4cb3fd3b7e39 |
| saved_tools | 3 | 114ca1bbeb703f191fa05423d9be4405 |
| skills | 3 | a08bbdfdd9d316284c316fcfc3e57133 |
| subscriptions | 1 | 13348654895bdf234278ff95e33e3211 |
| tools | 2 | a8f058a2de359f31c6fd8d3e361e01dd |
| user_roles | 2 | 66a7b1b99125b0dd6ea7fe9eba1d3ae4 |

Rollback plan: unchanged (commented block at end of the proposal); not needed, nothing applied.
