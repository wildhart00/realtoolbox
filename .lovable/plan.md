## Goal
Replace the "View Guide" blog link on every Real Estate Agent Workflow card with an honest "Notify me" CTA that opens an email-capture modal, mirroring the Skill download pattern.

## Changes

### 1. Database (migration)
Add a nullable `workflow_name` column to `newsletter_subscribers` so workflow waitlist signups can be attributed without a separate table.

```sql
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN workflow_name text;
```

Existing RLS policies (anyone can insert, admins can read) already cover this — no policy changes needed.

### 2. New component: `src/components/agents/WorkflowNotifyDialog.tsx`
Mirror `SkillDownloadDialog`:
- Props: `open`, `onOpenChange`, `workflowName`.
- Heading: **"Get this workflow guide"**.
- Subtext: *"We'll email you when the {workflowName} build guide drops."*
- zod email validation (same schema as the skill dialog).
- On submit: `insert` into `newsletter_subscribers` with `{ email, source: 'workflow_waitlist', workflow_name }`.
- Treat Postgres duplicate (code `23505`) as success — no error toast.
- Success toast: *"You're on the list. We'll email you when it's ready."*
- Close dialog + reset email on success.

### 3. `src/components/agents/WorkflowCard.tsx`
- Remove the `Link` to `item.guideHref ?? "/blog"`.
- Replace footer block with:
  - Small muted label: **"Guide coming soon"** (`text-[11px] text-muted-foreground`).
  - Button **"Notify me"** styled identically to the previous View Guide button (same border, padding, font, bell or arrow icon — keep ArrowRight for visual parity) that sets local `open` state.
- Render `<WorkflowNotifyDialog>` controlled by that state, passing `item.name`.
- Keep `mt-auto pt-5` bottom-pinning, card styling, and overall layout untouched.
- `guideHref` field on `WorkflowItem` becomes unused — leave the type field optional (already is) so no other call sites break, but stop reading it.

### 4. `src/pages/AgentsPage.tsx`
No changes needed — the workflow items already lack `guideHref`, and the card handles its own modal state.

## Out of scope
- No changes to `AgentPlatformCard`, hero copy, section order, grid layout, or the Skill download flow.
- No new admin UI for viewing waitlist entries (admins can already read `newsletter_subscribers`; the new `workflow_name` column will surface there once the existing admin view is updated separately).
