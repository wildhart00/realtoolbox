## Quick Add for Tools

Add a fast path for adding tools to the admin so you don't have to fill out every field manually.

### What gets built

**1. New "Quick Add" button** on the Tools admin page, next to the existing "Add tool" button. The full form stays exactly as it is for editing/polishing later.

**2. Quick Add dialog with only these fields:**
- Name *
- Website URL *
- Pricing (free / freemium / paid)
- Category (multi-select dropdown from existing categories)
- Affiliate status: `Not signed up` / `Application pending` / `Approved`
  - If `Approved` → show an inline "Affiliate URL" input
- **[Generate]** button

**3. What happens on Generate:**
- Firecrawl scrapes the URL (markdown + branding format) → pulls page content, brand colors, logo, favicon
- Lovable AI (`google/gemini-2.5-flash`) takes the scraped content and returns structured JSON: `tagline`, `short description`, `full description`, `tags[]`, `use_cases[]`, `key_features[]`
- Banner color comes from Firecrawl's branding extraction (primary color)
- Logo URL comes from Firecrawl's branding
- Hero image: use the page's OG image from Firecrawl branding (no AI image gen needed, faster + cheaper)
- Slug: auto-generated from name (lowercase, hyphens)

**4. Preview step** — show the generated fields in the dialog so you can eyeball/edit before saving. Click **Save** → inserts into `tools` table with `status: published`, `re_only: true` (defaults).

**5. Affiliate side effect:**
- If status = `Application pending` → create row in `affiliate_programs` linked to the new tool, status `pending`
- If status = `Approved` → create row with status `approved` and the affiliate URL, and also write `affiliate_url` onto the tool row

**6. "Re-fetch from website" button** in the existing full edit form — re-runs the same scrape + AI fill on demand, useful if a tool rebrands.

### Technical bits (for reference)

- New edge function: `supabase/functions/quick-add-tool/index.ts`
  - Input: `{ url, name }`
  - Steps: Firecrawl scrape (formats: markdown, branding) → Lovable AI structured output via tool calling → return `{ tagline, description, full_description, tags, use_cases, key_features, logo_url, banner_color, hero_image_url }`
  - Auth: requires admin (verify JWT + check `has_role(uid, 'admin')`)
- Frontend: new `QuickAddDialog.tsx` in `src/pages/admin/`
- ToolsAdmin gets a second button; existing `ToolFormDialog` is untouched
- `affiliate_programs` insert logic in the same client-side save handler (no schema changes needed — table already exists)
- Firecrawl key (`FIRECRAWL_API_KEY`) and `LOVABLE_API_KEY` are already configured

### What you'll do per tool after this

1. Click Quick Add
2. Paste name + URL, pick pricing + category + affiliate status (≈15 seconds)
3. Click Generate, wait ~5-10 seconds
4. Glance at preview, click Save

That's it. Everything else stays editable in the full form whenever you want to polish.