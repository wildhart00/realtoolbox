## Admin Skills management

Mirror the Integrations admin pattern (table + dialog form). No public UI, no schema changes.

### Files to create
1. **`src/pages/admin/SkillsAdmin.tsx`** — table view: order, name (+tagline), audience, tier, access (with price for paid), downloads, published toggle, edit/delete actions, "New Skill" button.
2. **`src/pages/admin/SkillFormDialog.tsx`** — dialog form with all skill columns:
   - name, slug (auto-slug from name when blank)
   - tagline (input), description (textarea)
   - audience select (Agent / Investor / Both)
   - tier select (Quick Tool / Workflow / Business System)
   - access_level select (Free / Paid)
   - price number input — disabled when access_level !== 'paid'; auto-reset to 0 when switching back to Free
   - `.md` file upload → `skill-files` bucket, path `{slug}-{timestamp}.md`, stores public URL in `file_url`; shows current file link + Clear
   - is_published switch, sort_order number

### Files to edit
3. **`src/App.tsx`** — add lazy route `/admin/skills` → `SkillsAdmin` under existing `AdminLayout` route, gated like other admin routes.
4. **`src/components/admin/AdminLayout.tsx`** — add `{ title: "Skills", url: "/admin/skills", icon: Sparkles }` to the `items` array (right after Integrations).

### Notes
- Auth/admin gating is already inherited from `AdminLayout` — no extra check needed.
- Use `supabase.from("skills" as any)` cast (types regen on next save, same pattern used for `integrations`).
- No edits to public site, nav, or other tables.
