## 1. New `SpecialtyPage` — `src/pages/SpecialtyPage.tsx`

Mirrors `CategoryPage` but filters by tag (case-insensitive match against `tools.tags[]`). Hard-coded slug → tag + title + subtitle map:

```ts
const SPECIALTIES = {
  "listing-agents":    { tag: "Listing Agent",   title: "Listing Agents",         blurb: "Tools for residential listing, marketing, and client comms." },
  "investors":         { tag: "Investor",        title: "Real Estate Investors",  blurb: "Deal analysis, underwriting, and portfolio tools." },
  "property-managers": { tag: "Property Manager",title: "Property Managers",      blurb: "Tenant screening, maintenance, leasing, and owner reporting." },
  "content-creators":  { tag: "Content Creator", title: "Content Creators",       blurb: "Video, AI writing, image gen, and audience-building tools." },
};
```

Filter: `tools.filter(t => t.tags?.some(x => x.toLowerCase() === tag.toLowerCase()))`. 404 → fall through to NotFound on unknown slug.

Add route `<Route path="/specialty/:slug" element={<SpecialtyPage />} />` in `App.tsx`.

## 2. New homepage section — `src/components/home/BuiltForSpecialtySection.tsx`

Placed in `Index.tsx` directly below `<BrowseByTagSection />` and above `<SkillsAnnouncementStrip />`.

Container: `max-w-[1100px]`, `px-6 lg:px-10`, `py-10 lg:py-12`. Same eyebrow + headline + subhead pattern used by `BrowseByTagSection`, just with subhead added.

```
BUILT FOR YOUR SPECIALTY
Tools curated for how you work
Whether you list, invest, manage, or create content — we've sorted…
────────────────────────────────────────────────────
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  ▲▲▲    │ │  ▲▲▲    │ │  ▲▲▲    │ │  ▲▲▲    │
│  Icon   │ │  Icon   │ │  Icon   │ │  Icon   │
│         │ │         │ │         │ │         │
│ Listing │ │Investors│ │  PM     │ │Creators │
│ 12 tools│ │ 8 tools │ │ 4 tools │ │ 6 tools │
│ blurb…  │ │ blurb…  │ │ blurb…  │ │ blurb…  │
│         │ │         │ │         │ │         │
│Browse → │ │Browse → │ │Browse → │ │Browse → │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.

Card (`Link` to `/specialty/{slug}`):
- `group relative surface-card hover:surface-card-hover rounded-2xl p-5 flex flex-col gap-4 min-h-[280px] hover:-translate-y-0.5 transition-base`
- Icon block: `h-14 w-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[hsl(239_84%_60%)]/15 via-[hsl(252_84%_64%)]/10 to-[hsl(265_84%_60%)]/15 border border-[hsl(239_84%_67%)]/20`, icon size 28, color `text-[hsl(229_94%_82%)]`.
- Title: `font-display text-[22px] text-foreground tracking-tight leading-tight` (Fraunces — already wired via `font-display` per `tailwind.config.ts`).
- Tool count line: `text-[11px] uppercase tracking-[0.1em] text-foreground/40 font-semibold` showing `"{n} tools curated for you"` or `"Curating now"` when 0.
- Blurb: `text-[12.5px] text-muted-foreground leading-[1.6] line-clamp-4 flex-1`.
- "Browse →" footer pinned to bottom: `mt-auto text-[12px] text-foreground/70 group-hover:text-[hsl(229_94%_82%)] group-hover:translate-x-0.5 transition-base`.

Counts come from a new `useSpecialtyCounts()` hook (same react-query pattern as `useCategoryCounts`): one query reading `tools.tags` for published tools, then reduce client-side into `Record<lowercaseTag, number>`.

```ts
const { data } = await supabase
  .from("tools")
  .select("tags")
  .eq("status", "published");
const counts: Record<string, number> = {};
for (const row of data ?? []) {
  for (const tag of row.tags ?? []) counts[tag.toLowerCase()] = (counts[tag.toLowerCase()] ?? 0) + 1;
}
```

## 3. Confirm `font-display`

`tailwind.config.ts` already maps `font-display` to Fraunces (used by `CategoryPage` H1 and Hero). Reuse it — no new font wiring needed. I'll verify before writing the component; if missing, add `'display': ['Fraunces', ...]` to the theme.

## 4. Out of scope

- Re-tagging existing tools to populate specialties — admin task.
- Specialty cross-promotion on tool detail page.
- Sidebar nav additions.

## Execution order

1. Verify `font-display` token in `tailwind.config.ts`.
2. Create `SpecialtyPage.tsx`, add route in `App.tsx`.
3. Add `useSpecialtyCounts` (alongside `useCategoryCounts`, or co-locate inside the section component since it's only used here).
4. Create `BuiltForSpecialtySection.tsx`.
5. Insert into `Index.tsx`.
6. Visual QA at 980px (shows 2 cols).
