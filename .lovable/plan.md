# Affiliate program tracker

New admin-only section at `/admin/affiliates` for tracking every affiliate program you've signed up for, with live click counts and monthly earnings history.

## Database

Two new tables (both admin-only via RLS — only `has_role(auth.uid(), 'admin')` can read/write):

**`affiliate_programs`**
- `tool_id` (uuid, nullable — links to existing tool so we can auto-count clicks)
- `program_name` (text)
- `network` (text — Impact / PartnerStack / Own / ShareASale / etc.)
- `affiliate_url` (text)
- `status` (enum: applied / pending / approved / declined / paused)
- `commission_rate` (text — free-form like "30% recurring")
- `signup_date`, `approval_date` (date, nullable)
- `notes` (text, nullable)

**`affiliate_earnings`**
- `program_id` → affiliate_programs (cascade delete)
- `month` (date — first of month)
- `reported_earnings` (numeric)
- `payment_received` (numeric, nullable)
- `payment_date` (date, nullable)
- `notes` (text, nullable)
- Unique on (program_id, month)

## UI

**Summary cards** at top: clicks this month, reported earnings this month, payments received YTD, program counts by status.

**Main table** — one row per program:
- Tool / program name
- Network (badge)
- Status (color-coded badge)
- Commission rate
- Clicks (live from `click_events`, toggle: last 30d / all time)
- Latest reported earnings (most recent month)
- Last payment (date + amount)
- Affiliate link (copy + open)
- Actions: Edit, View history, Delete

**Program dialog** — add/edit all program fields.

**History drawer** — opens when clicking a program row, lists monthly entries with inline add for new month.

## Sidebar

Add "Affiliates" item (DollarSign icon) to `AdminLayout` sidebar between Submissions and Blog.

## Out of scope

- Auto-importing earnings from network APIs
- Currency conversion
- CSV export
- Per-program click charts over time
