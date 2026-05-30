## Goal
Build `/agents` page mirroring the `/mcps` structure with two distinct card styles for platforms and workflows.

## Files

### New: `src/pages/AgentsPage.tsx`
Wrapped in `AppLayout`, centered `max-w-[1200px]`. Sections:

1. **Hero**
   - Eyebrow chip: "AGENTS"
   - H1 (`font-display`, 5–6xl): "Agentic AI for real estate" with gradient accent on "real estate"
   - Subheadline paragraph (`text-muted-foreground`, max-w-3xl, supplied verbatim)
   - Three pill badges row beneath: "No code required" · "Works with Claude" · "Real workflows" — small rounded-full chips with subtle border/bg, separator dots between or as discrete pills

2. **Section 1 — "AGENT PLATFORMS"**
   - `SectionLabel` reused (extract to shared or inline-duplicate from MCPsPage — see Technical)
   - 5 cards in `md:grid-cols-2 lg:grid-cols-3` using a new `AgentPlatformCard` matching `MCPCard` style
   - Difficulty slot replaced with "pricing" badge (Open Source/Freemium/Paid) using the same color system:
     - Open Source: green (`bg-success/15 text-success border-success/20`)
     - Freemium: blue (`bg-accent/10 text-[hsl(229_94%_82%)] border-accent/25`)
     - Paid: neutral (`bg-foreground/[0.05] text-muted-foreground border-foreground/10`)
   - "Visit →" link footer (opens external)

3. **Section 2 — "REAL ESTATE AGENT WORKFLOWS"**
   - `SectionLabel`
   - 5 cards in `md:grid-cols-2` using a **different** card layout — `WorkflowCard`:
     - Larger horizontal-feeling card, rounded-2xl, surface-card
     - Top: workflow name (`font-display`, text-xl, semibold)
     - Tool stack as small pill badges in a flex-wrap row (each pill: `bg-foreground/[0.05] text-foreground/60 border border-foreground/10`, small monospace-ish)
     - Description paragraph (`text-[14px] text-muted-foreground leading-relaxed`)
     - Footer: "View Guide" button linking to `/blog` (uses `Button` variant outline or a custom inline anchor matching site style with ArrowRight icon)

4. **Bottom callout** — copy of MCPs callout pattern: "Running an agent workflow we should feature?" with "Tell us →" link to `/submit`

### New: `src/components/agents/AgentPlatformCard.tsx`
Mirrors `MCPCard` but accepts `pricing: "Open Source" | "Freemium" | "Paid"` instead of `difficulty`. Same Lucide icon tile + name + category subtext + description + footer with category badge + pricing badge + "Visit →" link.

### New: `src/components/agents/WorkflowCard.tsx`
New component. Props: `name`, `stack: string[]`, `description`, `guideHref` (defaults to `/blog`).

### Routing: `src/App.tsx`
- Add `import AgentsPage from "./pages/AgentsPage.tsx"`
- Replace `/agents` route element `<ComingSoonPage />` → `<AgentsPage />`

### SEO
`useEffect` sets `document.title` to "AI Agents for Real Estate — RealToolbox.ai" and meta description.

## Data
All entries hard-coded in `AgentsPage.tsx` as typed arrays `agentPlatforms` and `workflows`. Icons per platform:
- n8n → `Zap`
- Make.com → `Workflow` (Lucide)
- Zapier Agents → `Zap`
- Lindy → `Bot`
- Claude Code → `Terminal`

## Technical notes
- `SectionLabel` is currently local to `MCPsPage.tsx`. Inline-duplicate it in `AgentsPage.tsx` to avoid premature extraction (one more usage doesn't justify a shared module yet; if a 3rd page lands, extract to `src/components/shared/SectionLabel.tsx`).
- All colors via existing design tokens (`surface-card`, `gradient-accent`, `text-muted-foreground`, accent HSLs already used in MCPsPage). No new tokens needed.
- External links open in new tab with `rel="noreferrer noopener"`.

## Out of scope
- No DB tables — static content only
- No filtering/search
- `/skills` and `/resources` stay as ComingSoon stubs
- No real `/blog/<slug>` routing for workflow guides — all "View Guide" links go to `/blog` index
