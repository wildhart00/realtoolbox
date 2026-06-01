## Homepage Copy Edits

Three small text changes — no layout or styling adjustments.

### 1. Hero credibility line
**File:** `src/components/home/Hero.tsx`

Insert a single understated line directly below the hero subhead (`<p>`) and above the search `<form>`. Small, muted, lower-contrast gray, centered.

**Text:**
> Built by a real estate investor who's been flipping houses since 2014 — every tool here is hand-picked on merit.

Styling: `text-[13px] text-muted-foreground/70 text-center mx-auto` with max-width matching the subhead, using `mt-3` spacing.

### 2. Footer about blurb
**File:** `src/components/layout/Footer.tsx`

Replace the existing brand description paragraph:

**From:**
> The AI toolkit built for real estate professionals. Curated weekly. No sponsored listings.

**To:**
> The AI toolkit built for real estate professionals. Hand-curated weekly — picks are earned, not bought.

### 3. Newsletter box description
**File:** `src/components/home/NewsletterCard.tsx`

Replace the description paragraph inside the newsletter card:

**From:**
> The latest AI tools for real estate and beyond. No sponsored content — just what's actually useful.

**To:**
> The latest AI tools for real estate and beyond — hand-picked on merit, just what's worth your time.

No other content, layout, or styling changes.