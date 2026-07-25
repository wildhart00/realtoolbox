# premium_resources investigation

Report first, no changes yet.

## 1. Row and object counts

- **Table `premium_resources`**: 4 rows
  - "20 ChatGPT Prompts for Listing Descriptions" → `20-chatgpt-prompts-listing-descriptions.pdf`
  - "AI Workflow Guide for Transaction Coordinators" → `ai-workflow-guide-transaction-coordinators.pdf`
  - "The AI Lead Generation Playbook" → `ai-lead-generation-playbook.pdf`
  - "AI-Powered Property Valuation Cheatsheet" → `ai-property-valuation-cheatsheet.pdf`
- **Bucket `premium-resources`** (private): 4 objects, matching filenames above. Sizes 3–6 KB each — these are placeholder PDFs, not real paid content.

## 2. Codebase references

- `src/pages/MembersPage.tsx` — renders a "Premium content" tab that lists rows and downloads via `supabase.storage.from("premium-resources").download(path)`.
- `src/hooks/useDirectory.ts` — `usePremiumResources()` query hook feeding MembersPage.
- `src/integrations/supabase/types.ts` — generated types (auto).
- `supabase/migrations/20260420043241_...sql` — original creation migration.

**Critical finding: `/members` is not a registered route in `src/App.tsx`.** MembersPage is orphaned — not reachable from navigation (Topbar comments confirm the links were removed), not routed in the router. `ResetPasswordPage.tsx` still redirects to `/members`, which would 404 today. `usePremiumResources` is only consumed by the orphaned page.

## 3. Origin and history

- Created **2026-04-20** as part of the original All-Access subscription build. The "Members view premium resources" policy (`USING (true)` for any authenticated user) reflects that model: a $39/mo signed-in member could read everything. When the subscription model was retired for one-time Toolbox purchases, MembersPage and this table were left behind — the code was unlinked from the router but the DB surface stayed live.

## 4. Storage contents

Placeholder PDFs (3–6 KB — realistic content would be much larger). No evidence they were ever real deliverables. The current paid product is the Toolbox skills, which live in the separate (already-locked-down) `skill-files` bucket.

## Recommendation: **drop it entirely**

Not "lock to service_role" and not "wire real entitlement checks":
- There is no product surface that sells or delivers these resources today. Locking to service_role would leave dead tables/buckets/policies and dead code that a future edit could accidentally revive.
- Wiring entitlement checks would be work for content that doesn't exist as a product line. The Toolbox model doesn't include a "premium PDFs" tier.
- Same disposition class as other retired-subscription leftovers we've cleaned up.

## Proposed cleanup (for a follow-up plan, not this turn)

1. Delete the 4 objects from the `premium-resources` bucket, then drop the bucket.
2. Migration: `DROP TABLE public.premium_resources CASCADE` (drops the two table policies with it); drop the four `storage.objects` policies scoped to `premium-resources`.
3. Delete `src/pages/MembersPage.tsx` and the `usePremiumResources` export in `src/hooks/useDirectory.ts`.
4. Fix `src/pages/ResetPasswordPage.tsx` to redirect somewhere real (likely `/` or `/toolbox`) instead of `/members`.
5. Regenerated `types.ts` will drop `premium_resources` automatically after migration.
6. Re-run security scan; `MISSING_ENTITLEMENT_CHECK` finding should clear. Publish.

Confirm this direction (drop) and I'll produce the executable cleanup plan.
