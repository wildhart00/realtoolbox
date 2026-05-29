# Full Admin Dashboard

Turn `/admin` into a real control panel so you never need to touch the database directly. Everything below is admin-only (gated by the existing `has_role(auth.uid(), 'admin')` check already in place).

## Layout

A new admin shell with a collapsible left sidebar and a top header. The current "Refresh tool card images" panel moves under **Tools → Maintenance**.

```text
/admin
├── Dashboard          (quick stats: tools, pending submissions, subscribers, clicks)
├── Tools              (list, search, add, edit, delete, featured/editor's pick toggles)
├── Submissions        (review /submit entries: approve → creates tool, or reject)
├── Blog               (list, create, edit, publish/unpublish posts)
├── Reviews            (moderate user reviews, delete abusive ones)
├── Categories         (add/rename/reorder categories)
├── Analytics          (click_events: top tools, recent clicks, time range)
├── Subscribers        (newsletter list + CSV export)
└── Maintenance        (the existing Firecrawl image refresh tool)
```

## Sections in detail

**Dashboard** — at-a-glance counts and the 5 most recent submissions / reviews / signups.

**Tools** — table of every tool with inline edit dialog: name, slug, tagline, description, full description, website URL, affiliate URL, pricing, tags, categories, hero/logo images, founder info, and the `is_featured` / `is_editors_pick` / `is_verified` / `re_only` toggles. "Add tool" button opens the same dialog blank. Delete with confirm.

**Submissions** — pending queue first. Each row shows submitter info, the proposed tool, and three actions:
- **Approve** → opens a pre-filled tool form, saving creates the tool and marks submission `approved`
- **Reject** → marks `rejected` with optional admin note
- **Delete** → removes the submission

**Blog** — list of posts with publish toggle. Create/edit dialog for title, slug, excerpt, body (textarea — markdown rendered on the public side), tags, cover image, reading minutes.

**Reviews** — list all reviews with tool name + user, rating, body, date. Delete button for moderation.

**Categories** — add/rename/reorder, edit icon and description.

**Analytics** — total clicks, clicks per tool (top 20), filter by 7/30/90 days. Charts using recharts.

**Subscribers** — list of `newsletter_subscribers` with email, source, signup date. "Export CSV" button.

**Maintenance** — keeps the existing batch image-refresh UI as-is.

## Technical notes

- All pages are subroutes of `/admin/*` rendered inside an `AdminLayout` with shadcn `Sidebar`.
- Access is already protected — the `AdminPage` checks `has_role` and existing RLS policies allow admins full CRUD on every relevant table, so **no database changes are needed**.
- Image uploads for tool logos/hero/blog covers use the existing `tool-logos` and `blog-images` storage buckets.
- Submission approval is a client-side flow: read submission → insert into `tools` → update submission status. No edge function needed.
- Charts via `recharts` (already in the project).

## Out of scope (can add later)

- Editing other users' profiles / promoting users to admin from the UI
- Email notifications to submitters on approve/reject
- Audit log of admin actions
