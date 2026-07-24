# Setup Guide + MCP as first-class feature

## Part A — Setup guide as gated content

**Storage & delivery**
- Reuse the existing `skills` table + `get-skill-content` edge function (no new infra). Insert one skill row:
  - `slug: "setup-guide"`, `toolbox: null`, `access_level: "free"`, `is_published: true`
  - `title: "How to load a skill into any AI"`, category `"Setup"`
  - `file_url` → uploaded markdown in the `skill-files` private bucket
- Because it is `access_level: "free"`, the existing edge function will return it to anyone with a valid session (matches your "free account or above" requirement). No function changes needed.

**Where to paste the guide content:** once this plan is approved, upload the markdown to `skill-files/setup/setup-guide.md` (I'll do the upload as one step — you paste the markdown into chat and I'll write it to storage and insert the skill row).

**Rendering** — new page `src/pages/SetupGuidePage.tsx` at route `/setup-guide`:
- Signed-out → redirect to `/auth?next=/setup-guide`
- Signed-in → fetches via `get-skill-content` (same path `useSkillAccess` uses), renders with the existing `ReactMarkdown` pipeline used on `SkillDetailPage`
- "Copy entire guide" button (copies raw markdown to clipboard) + anchor links for major sections (auto-generated from H2s), including a `#connect` anchor for the MCP section
- Excluded from the toolbox library grid on `/toolbox` (filter out slug `setup-guide` in `ToolboxIndexPage` skill query so it doesn't appear twice)

**Entry points**
1. `WelcomePage.tsx` — add "Setup guide" primary button (shown for both purchase and free-signup states)
2. `SkillDetailPage.tsx` — small "First time? How to load a skill →" link right next to the Copy skill button (both paid and free skills, but not on the setup guide itself)
3. `ToolboxIndexPage.tsx` — add a "Setup guide" tile in the products row (next to Deal Screen), styled as a secondary/utility card

## Part B — MCP as headline feature

**New reusable component** `src/components/mcp/ConnectMcpBlock.tsx`
- Short copy: "Your toolbox plugs directly into your AI — always current, no copying."
- Read-only input showing the MCP URL: `https://pcnsuyadfqrmythikwpa.supabase.co/functions/v1/mcp` (built from `VITE_SUPABASE_PROJECT_ID` so it stays env-correct)
- Copy button + link to `/setup-guide#connect`
- `variant` prop (`"full"` for welcome/account, `"compact"` for inline uses)

**Placements**
1. `WelcomePage.tsx` — add `<ConnectMcpBlock variant="full" />` below the Setup Guide CTA
2. Account page — `src/pages/MembersPage.tsx` is the members/account surface today; add the block there. (If you'd rather have a distinct `/account` route, tell me.)

**Differentiator callout** — new small component `src/components/toolbox/McpDifferentiatorCallout.tsx`, single factual sentence:
> "The only real estate toolbox that connects directly to Claude, ChatGPT, and other AI apps — your skills load themselves and stay current automatically."
- Added to `InvestorToolboxPage.tsx` in the "what you get" area
- Added to `ToolboxIndexPage.tsx` near the top of the products section

**Pricing card feature bullets** — in `PricingSection.tsx` (and any mirrored feature lists on `InvestorToolboxPage` / `ToolboxIndexPage`), append one line to each toolbox card's feature list:
- "Connects directly to Claude & ChatGPT (MCP)"

## Technical notes

- No schema changes. No new edge functions. No new tables.
- Setup guide's `access_level = "free"` means `get-skill-content` returns content to any signed-in user; signed-out users are redirected to `/auth` client-side (consistent with current Deal Screen gating).
- `ToolboxIndexPage` skill grid gets a `.neq("slug", "setup-guide")` filter so the guide appears only as a product tile, not in the library.
- MCP URL is derived at build time from `import.meta.env.VITE_SUPABASE_PROJECT_ID` — no hardcoding, survives project moves.

## Deliverables checklist

- [ ] Upload `setup-guide.md` to `skill-files/setup/` and insert `skills` row
- [ ] `src/pages/SetupGuidePage.tsx` + route in `App.tsx`
- [ ] `ConnectMcpBlock` component
- [ ] `McpDifferentiatorCallout` component
- [ ] Edits to `WelcomePage`, `MembersPage`, `SkillDetailPage`, `ToolboxIndexPage`, `InvestorToolboxPage`, `PricingSection`

## Next step from you

Approve this plan. On approval I'll ask you to paste the setup guide markdown in chat, then upload it and wire everything above.
