## Goal
Replace `/mcps` "Coming soon" stub with a full content page using static, hard-coded MCP data (no DB).

## Files

### New: `src/pages/MCPsPage.tsx`
Sections, top to bottom, wrapped in `AppLayout` and centered with `max-w-[1200px]` like other pages:

1. **Hero**
   - "Coming from Claude?" style small eyebrow chip: "MCP DIRECTORY"
   - H1 (`font-display`, ~5–6xl, tracking-tight): "Connect Claude to anything"
   - Sub: full paragraph supplied by user, `text-muted-foreground` lg, max-w-3xl

2. **How it works — 3-column row**
   - Three steps with numbered circle (accent), title, short line
   - Grid `md:grid-cols-3`, surface-card-lite styling (border + subtle bg)
   - "Install an MCP server" → "Connect it to Claude" → "Talk to your tools in plain English"
   - Arrow separators on `md+` (chevron between cards)

3. **Section 1 — "PURPOSE-BUILT FOR REAL ESTATE"**
   - Section label: uppercase tracking-wider, muted, with a small accent dot
   - 6 cards in `md:grid-cols-2 lg:grid-cols-3`

4. **Section 2 — "CONNECT YOUR EXISTING STACK"**
   - Same label style, 8 cards same grid

5. **Submit callout**
   - Centered rounded card, "Know an MCP we missed?" + "Submit it →" linking to `/submit`

### New: `src/components/mcps/MCPCard.tsx`
Reusable card matching `ToolCard` visual language (rounded-2xl, surface-card, hover lift). Layout:
- Top row: icon tile (40px, gradient-accent bg with a Lucide icon — pick per category) + name + small category text underneath
- Description paragraph (`text-[13px] muted, line-clamp-2`)
- Footer row: category badge (`bg-foreground/[0.05]`) + difficulty badge (color-coded) + spacer + "Install →" link (external, opens new tab)

Difficulty colors via inline classes:
- Beginner: `bg-success/15 text-success border-success/20` (or green-tinted hsl)
- Intermediate: `bg-yellow-500/15 text-yellow-400 border-yellow-500/25`
- Advanced: `bg-orange-500/15 text-orange-400 border-orange-500/25`

Icon mapping (Lucide) by category fallback per MCP name:
- Real Estate / Property Data → `Home`
- Prospecting → `Target`
- Analytics → `BarChart3`
- Investing → `TrendingUp`
- CRM → `Users`
- Communication → `Mail` (Gmail/Slack)
- Productivity → `Calendar`
- Storage → `FolderOpen`
- Organization → `LayoutGrid`
- Automation → `Zap`

### Routing: `src/App.tsx`
- Add `import MCPsPage from "./pages/MCPsPage.tsx"`
- Replace `/mcps` route element from `<ComingSoonPage />` to `<MCPsPage />`. Leave the other three (`/skills`, `/agents`, `/resources`) on `ComingSoonPage`.

### SEO
Inside `MCPsPage`, set `document.title` to "MCPs for Real Estate — RealToolbox.ai" and a meta description via simple `useEffect`. Single H1 already covered.

## Data
All MCP entries hard-coded in `MCPsPage.tsx` as two typed arrays (`realEstateMcps`, `stackMcps`). No DB writes; the `resources` table isn't used here since this isn't a "resource" — it's the MCPs directory.

## Out of scope
- No database table for MCPs (keeping it static and editable in code for now; can migrate to DB later if needed)
- No filtering/search on this page
- `/skills`, `/agents`, `/resources` stay as the existing ComingSoon stubs
