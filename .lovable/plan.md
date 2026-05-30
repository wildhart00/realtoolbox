## Goal
Build `/skills` page (hero + waitlist email capture + "what's coming" preview + submit callout), and add a Claude Skills announcement strip on the homepage between BrowseSection and NewsletterCard.

## Files

### New: `src/pages/SkillsPage.tsx`
Wrapped in `AppLayout`, centered `max-w-[1200px]`. Sections:

1. **Hero**
   - Eyebrow chip: "SKILLS"
   - H1 (`font-display`, 5–6xl, tracking-tight): "Real estate skills for Claude" with gradient accent on "Claude"
   - Subheadline paragraph (`text-muted-foreground`, lg, max-w-3xl) verbatim
   - **3-step row** below subheadline (md:grid-cols-3, surface-card styling, numbered accent badges + arrow between cards — mirror the visual pattern from `MCPsPage` "How it works"):
     - 1. Download the .md file (icon: `Download`)
     - 2. Upload to your Claude Project (icon: `Upload`)
     - 3. Reference it in any prompt (icon: `Sparkles`)

2. **Launching Soon — Email capture block**
   - Centered card, `rounded-2xl`, subtle gradient border + gradient bg using `from-foreground/[0.05] to-foreground/[0.01]`, with a top accent line `bg-gradient-to-r from-transparent via-[hsl(229_94%_82%)]/40 to-transparent`
   - Eyebrow: "EARLY ACCESS"
   - H2 (`font-display`, 2xl–3xl): "First skills launching soon — get early access"
   - Subhead: verbatim copy
   - Inline form: single email input + "Get Early Access" submit button (`variant="hero"`)
   - On submit: `supabase.from('newsletter_subscribers').insert({ email, source: 'skills_waitlist' })`
   - Use the existing `source` field on `newsletter_subscribers` (default `'homepage'`) — overriding to `'skills_waitlist'` segments these signups
   - Client-side validation with zod: trimmed email, valid format, max 255 chars
   - Loading/success/error states via the existing `toast` hook (`useToast` from `@/components/ui/use-toast` — check actual export); show success toast and replace form with "You're on the list ✓" inline message; on duplicate (Postgres unique violation or other error), show a friendly toast

3. **What's Coming — preview cards**
   - SectionLabel: "WHAT'S COMING"
   - `md:grid-cols-3` of 3 hard-coded `<SkillPreviewCard>` items:
     - Listing Description Writer — "Input property details, get MLS-ready copy in your voice" — audience pill "For Agents"
     - Deal Analyzer — "Input purchase price, rents and expenses, get a full investment scorecard" — "For Investors"
     - Weekly Market Report — "Input your MLS data, get a client-ready market update narrative" — "For Agents + Investors"
   - Each card displays a "Coming Soon" badge (top-right) instead of a CTA button; no fake pricing

4. **Bottom callout**
   - Same visual pattern as MCPs/Agents/Resources bottom callout
   - "Built your own real estate skill?" / "Share it with the community" / button "Share it" → Link to `/submit`

### New: `src/components/skills/SkillPreviewCard.tsx`
Static card. Props: `title`, `description`, `audience`. Layout:
- Top row: small audience pill on the left (`bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25`), "Coming Soon" badge on the right (`bg-foreground/[0.06] text-foreground/60 border-foreground/15`)
- Title (`font-display`, text-xl, semibold, tracking-tight)
- Description (`text-[14px] text-muted-foreground leading-[1.6]`)
- Footer: muted hint text "Drop your email above to be notified" (small, italic-feel, no button)

### New: `src/components/home/SkillsAnnouncementStrip.tsx`
Used on the homepage. Visually distinct full-width announcement (not a card-in-grid).

Structure:
- Outer wrapper `w-full px-6 lg:px-10 py-14`
- Inner: `mx-auto max-w-[1200px] rounded-2xl px-8 py-10 lg:px-14 lg:py-12` with **bold indigo→purple gradient** background using existing tokens: `bg-gradient-to-br from-[hsl(239_84%_67%)] via-[hsl(252_84%_70%)] to-[hsl(265_84%_67%)]`, plus subtle radial highlight (`before:` pseudo via inline style or a layered absolute div) and a `shadow-glow`/`shadow-elevated`-style shadow
- Layout: flex row on `lg`, column on mobile. Left side text; right side CTA button.
- Left:
  - Small uppercase eyebrow chip "NEW" — `bg-white/15 text-white border border-white/25 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.16em]`
  - H2 (`font-display`, 2xl–3xl, white): "Claude Skills for Real Estate — coming soon"
  - Description (white/80, max-w-2xl): supplied verbatim
- Right:
  - `Button` styled `bg-white text-[hsl(239_84%_55%)] hover:bg-white/90` with `asChild` linking to `/skills`, label "Join the Waitlist" + `ArrowRight` icon
- Use white text against the saturated gradient — this is the one place we deviate from semantic muted tones intentionally to make it pop as an announcement

### Edit: `src/pages/Index.tsx`
Import and insert `SkillsAnnouncementStrip` between `BrowseSection` and the next divider/NewsletterCard. Specifically:
- Add `import { SkillsAnnouncementStrip } from "@/components/home/SkillsAnnouncementStrip";`
- Place it after `<BrowseSection .../>` and before the divider that precedes `<NewsletterCard />`

### Edit: `src/App.tsx`
- Add `import SkillsPage from "./pages/SkillsPage.tsx"`
- Replace `/skills` route element from `<ComingSoonPage />` to `<SkillsPage />`

### SEO
`useEffect` in `SkillsPage`: sets `document.title` to "Claude Skills for Real Estate — RealToolbox.ai" and meta description.

## Data / Database
- Insert path: `supabase.from('newsletter_subscribers').insert({ email, source: 'skills_waitlist' })`
- Existing RLS already allows `anon`/`authenticated` INSERT with email format check — no migration needed
- No schema changes

## Technical notes
- `SectionLabel` re-inlined (same as MCPs/Agents/Resources) — keep until we have a 4th use, then extract
- For the gradient strip's accent button hover, use existing `transition-base` token
- Reuse the existing `NewsletterCard` form behavior as a reference for client-side validation + toast — but the skills form is a self-contained component (do NOT modify `NewsletterCard`)

## Out of scope
- No actual Skills products/downloads (everything is teaser)
- No new `skills` table — entries are hard-coded as 3 preview cards
- No admin filter UI for segmenting `newsletter_subscribers` by source
- No changes to `Topbar` (Skills nav link already points at `/skills`)
