## Goal
Replace the current minimal footer with a fuller, premium footer (3-col links + newsletter band + legal bar), move the homepage newsletter into the footer, and add `/privacy`, `/terms`, `/contact` pages plus a `contact_messages` table and admin view.

## Changes

### 1. New footer — `src/components/layout/Footer.tsx` (rewrite)
Three stacked sections, all in `surface-card`/dark aesthetic with hairline `border-foreground/[0.06]` dividers.

**Section 1 — three-column links** (`max-w-[1200px]`, `grid-cols-1 md:grid-cols-3`, py-14):
- **Brand column**: existing home-icon SVG + "RealToolbox.ai" wordmark (same markup as `Topbar`). Tagline below: "The AI toolkit built for real estate professionals. Curated weekly. No sponsored listings."
- **Quick Links column** (header "Quick Links", uppercase eyebrow style): MCPs, Skills, Agents, Resources, Blog, Submit a Tool.
- **Popular Categories column** (header "Popular Categories"): Image Generation, Video Creation, Automation, AI Writers, Virtual Staging, Commercial Real Estate — each linking to `/category/<slug>`.
- Link hover state: `hover:text-[hsl(229_94%_82%)]` (indigo accent already used in topbar).

**Section 2 — newsletter band**: render existing `<NewsletterCard />` inside the footer (top border separator). NewsletterCard's `source` prop defaults to `"homepage"`; add an optional `source?: string` prop and pass `source="footer"` here so submissions tag correctly. (Spec says `newsletter` — will use `"newsletter"` per spec.)

**Section 3 — legal bar**: thin row with `border-t border-foreground/[0.06]`, `py-5`, flex justify-between:
- Left: "© 2026 RealToolbox.ai. All rights reserved."
- Right: `Privacy Policy · Terms of Service · Contact` (middle-dot separators, each a Link).

### 2. Homepage cleanup — `src/pages/Index.tsx`
Remove `<NewsletterCard />` from the page body (it now lives in the footer on every page).

### 3. NewsletterCard — `src/components/home/NewsletterCard.tsx`
Add optional `source` prop (default `"homepage"`) used in the insert payload, so the footer can pass `"newsletter"`.

### 4. New pages
- **`src/pages/PrivacyPage.tsx`** at route `/privacy` — `AppLayout` wrapper, max-w prose layout. Standard real-estate-friendly copy: collects email for newsletter signup, anonymous analytics, doesn't sell data, cookies for basic functionality, third-party tool links go to external sites, contact email for questions.
- **`src/pages/TermsPage.tsx`** at route `/terms` — same layout. Standard "use at own risk, third-party tools, we curate but don't endorse, no warranties, may update terms" copy.
- **`src/pages/ContactPage.tsx`** at route `/contact`:
  - Headline "Get in touch", subhead "Tool to recommend? Feedback? Partnership idea? Drop a note."
  - Display email `patwilder@midwestinvestqc.com` (mailto link).
  - Form: Name, Email, Message — validated with zod (trim, max lengths, email format). Submits to `contact_messages` via supabase insert; on success show inline confirmation, clear form.

### 5. Routing — `src/App.tsx`
Add three routes: `/privacy`, `/terms`, `/contact`. Add `/admin/contact-messages` nested under `AdminLayout`.

### 6. Admin — contact messages
- **`src/pages/admin/ContactMessagesAdmin.tsx`** — same Table pattern as `SubmissionsAdmin`. Columns: created_at, name, email, message preview, read/unread badge. Row actions: "Mark read"/"Mark unread", "Delete". Loads `contact_messages` ordered by `created_at desc`.
- **`src/components/admin/AdminLayout.tsx`** — add `{ title: "Contact", url: "/admin/contact-messages", icon: MessageSquare }` to the sidebar `items` array.

### 7. Topbar tweak — `src/components/layout/Topbar.tsx`
Remove the "Newsletter" nav link (it lived as `/#newsletter` anchor; section is gone from homepage and now lives in the footer on every page). Remove the now-unused `handleNewsletter` helper.

### 8. Database migration
New table `contact_messages` with public insert + admin read, in the same migration that grants Data API access.

```sql
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name <> '' AND length(name) <= 100
    AND email ~* '^[^@]+@[^@]+\.[^@]+$' AND length(email) <= 255
    AND message <> '' AND length(message) <= 5000
  );

CREATE POLICY "Admins read contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete contact messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

### 9. Verification
- Every page renders the new footer (it's already inside `AppLayout`).
- Homepage no longer shows the standalone newsletter section above the footer.
- All footer links route correctly; category links land on existing `/category/<slug>` pages.
- `/privacy`, `/terms`, `/contact` render with `AppLayout`.
- Contact form submits a row, anon users can insert, admins can read in `/admin/contact-messages`.
- Mobile: footer collapses to single column stack; legal bar wraps cleanly.

## Out of scope
- Email notifications on contact submission.
- Real legal review of privacy/terms copy (placeholder only).
- Replacing the `NewsletterCard` visual design.
