Cleanup: Remove AI-tool-directory clutter from public-facing pages to focus the site on investor skills.

All underlying routes, components, Supabase data, and /admin remain untouched. Only hide/remove elements from nav, homepage, and footer.

---

## 1. Topbar (`src/components/layout/Topbar.tsx`)

- Keep nav links: Skills, Resources, Blog.
- Remove from nav links array: Browse, Integrations, Agents.
- Remove "Updated weekly" indicator (green dot + text).
- Remove "Submit a Tool" button.
- Add a "Start free" primary button (same gradient-hero style as hero CTA) that opens `CaptureDialog` in `free-skill` mode with source `nav_deal_screen`.
- Keep Sign in / user dropdown logic exactly as-is.
- Apply the same changes to the mobile menu.

## 2. Homepage (`src/pages/Index.tsx`)

- Remove imports and usage of: `FeaturedSection`, `BrowseByTagSection`, `BuiltForSpecialtySection`.
- Keep: `Hero`, `ChooseYourStageSection`, `SkillsHomeSection`.
- No changes to `AppLayout` or any page-level logic.

## 3. Footer (`src/components/layout/Footer.tsx`)

- **Tagline**: replace current paragraph with:
  "The AI toolkit built for real estate investors and operators — workflows drawn from real flipping and rental experience."
- **Quick Links**: keep only Skills, Resources, Blog. Remove Integrations, Agents, Submit a Tool.
- **By Stage column**: replace "Popular Categories" with a "By Stage" header and list:
  - First Deal → /skills
  - Actively Investing → /skills
  - Scaling → /skills
- **Newsletter band** (inside `NewsletterCard` via `source` prop, or edit `NewsletterCard` if props aren't sufficient):
  - Change heading from "New tools, every month" to "New investor skills, every month"
  - Change body from current text to: "New AI workflows for real estate investors — built from real operator experience. Drop your email to hear when they land."
  - Keep email input and button styling unchanged.

## Technical notes
- Reuse existing `CaptureDialog` component. Add `nav_deal_screen` source.
- No database changes. No theme/font/component changes.
- All existing routes (`/browse`, `/integrations`, `/agents`, `/submit`, etc.) remain in `App.tsx` and are accessible by direct URL — only removed from public navigation surfaces.

## Files touched
- `src/components/layout/Topbar.tsx`
- `src/pages/Index.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/home/NewsletterCard.tsx` (if copy lives there; otherwise may only need prop changes in Footer)