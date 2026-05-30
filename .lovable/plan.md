## 1. Seed missing categories (migration)

Existing matches found in the `categories` table:
- **Automation** → already exists as `automation` (icon `Workflow`)
- **Image Generation** → already exists as `image-generators` (Image Generators)

Insert the 6 missing ones (idempotent, `ON CONFLICT (slug) DO NOTHING`):

| name | slug | icon | sort_order |
|---|---|---|---|
| Lead Generation | `lead-generation` | `Users` | 30 |
| Listing Marketing | `listing-marketing` | `Home` | 31 |
| Deal Analysis | `deal-analysis` | `Calculator` | 32 |
| CRM & Pipeline | `crm-pipeline` | `Database` | 33 |
| AI Writers | `ai-writers` | `PenLine` | 34 |
| Video Creation | `video-creation` | `Video` | 35 |

Sort orders placed at the end so existing UI ordering doesn't shift.

## 2. New component — `src/components/home/BrowseByTagSection.tsx`

Self-contained component. Hard-coded list of 8 cards (preserves user-specified order, labels, and icons), with resolved slugs:

```ts
const TAGS = [
  { label: "Lead Generation",  slug: "lead-generation",  icon: Users },
  { label: "Listing Marketing",slug: "listing-marketing",icon: Home },
  { label: "Deal Analysis",    slug: "deal-analysis",    icon: Calculator },
  { label: "CRM & Pipeline",   slug: "crm-pipeline",     icon: Database },
  { label: "AI Writers",       slug: "ai-writers",       icon: PenLine },
  { label: "Video Creation",   slug: "video-creation",   icon: Video },
  { label: "Image Generation", slug: "image-generators", icon: Image },
  { label: "Automation",       slug: "automation",       icon: Zap },
];
```

Tool counts via a new hook `useCategoryCounts()`:

```ts
const { data } = await supabase
  .from("tool_categories")
  .select("category_id, categories!inner(slug), tools!inner(status)")
  .eq("tools.status", "published");
// reduce to Map<slug, number>
```

Cached via react-query (`["category-counts"]`).

### Layout

Section container matches existing homepage sections (`max-w-[1100px]`, `px-6 lg:px-10`, `py-10`).

```
BROWSE BY TAG                              View all →
Find tools by what they do
────────────────────────────────────────────────────
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ◐ Lead Gen  ›│ │ ◐ Listings  ›│ │ ◐ Deal Anal ›│ │ ◐ CRM       ›│
│   12 tools   │ │   8 tools    │ │   Coming soon│ │   4 tools    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
┌ row 2 of 4 ┐ ...
```

Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`.

Card:
- `Link to={`/category/${slug}`}` (existing `CategoryPage` route, verify still works — it does, `/category/:slug` is wired in `App.tsx`)
- `surface-card hover:surface-card-hover` for base + accent border on hover (already in design system; matches other cards on the page)
- Icon in a 36px rounded square: `bg-foreground/[0.05] text-foreground/70 group-hover:text-[hsl(229_94%_82%)]`
- Name: `text-[14px] font-semibold text-foreground`
- Count: `text-[11px] text-foreground/40` — shows `"{n} tools"` or `"Coming soon"` if 0
- `ChevronRight` (Lucide), `text-foreground/30 group-hover:text-foreground/60 group-hover:translate-x-0.5 transition`

"View all →" top-right link: anchor to `/#browse` (scrolls to existing browse section on home — same target as `FeaturedStrip`'s old "View all"). Uses the existing pattern from `FeaturedStrip` (clears search + scrolls to `#browse`). Implemented as a button that calls `setQuery("")` + `document.getElementById("browse")?.scrollIntoView`.

## 3. Wire into `Index.tsx`

Insert between `BrowseSection` and `SkillsAnnouncementStrip`:

```tsx
<BrowseSection ... />
<BrowseByTagSection />
<SkillsAnnouncementStrip />
```

## 4. Out of scope

- Recategorizing existing tools onto the 6 new categories (admin task).
- Touching CategoryPage / category sidebar / existing nav.

## Execution order

1. Migration: insert 6 new categories.
2. Add `useCategoryCounts` to `useDirectory.ts`.
3. Create `BrowseByTagSection.tsx`.
4. Edit `Index.tsx`.
5. Visual QA at 980px (current viewport — should show 2 cols).
