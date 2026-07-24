# Publish the Setup Guide

The frontend (`/setup-guide` route, `SetupGuidePage`, `ConnectMcpBlock`, MCP callouts, "First time?" links, guide tile on `/toolbox`) is already built and waiting on the content. This plan ships the markdown you just pasted and confirms end-to-end delivery.

## Steps

1. **Upload the markdown** to the private `skill-files` bucket at `setup/setup-guide.md` using the pasted content verbatim (headings preserved so the in-page anchor nav auto-generates from H2s).

2. **Insert the `skills` row** for the guide so `get-skill-content` serves it to any signed-in user:
   - `slug`: `setup-guide`
   - `name`: `Setup guide — Load a skill into any AI`
   - `tagline`: `One guide, every skill, any AI.`
   - `access_level`: `free`
   - `toolbox`: `null`
   - `tier`: `free`
   - `is_published`: `true`
   - `file_url`: storage path to `setup/setup-guide.md`
   - `overview`: short marketing blurb (first paragraph)
   - `sort_order`: high value so it never appears in library grids (already filtered by slug on `/toolbox`, but a large sort_order is belt-and-suspenders)

3. **Verify delivery**:
   - Hit `/setup-guide` while signed in → guide renders, anchor nav lists H2s, "Copy entire guide" works.
   - Confirm `#connect` scroll target lands on the MCP section (the H2 "Connect your toolbox via MCP" slugifies to `connect-your-toolbox-via-mcp`, not `connect`). Adjust either the anchor href in `ConnectMcpBlock` / `SetupGuidePage`'s "Jump to MCP connection" link, or add an explicit `#connect` anchor at that section, so both jump links land correctly.
   - Confirm `/toolbox` hides the guide from the library grid and shows it as the dedicated tile.
   - Confirm `SkillDetailPage`'s "First time? How to load a skill →" link opens `/setup-guide`.

## Technical notes

- The pasted markdown uses H2s (`##`) which the page's anchor nav extracts via regex — no changes needed to the renderer.
- `get-skill-content` already allows any authenticated user to fetch `access_level: 'free'` content; the guide inherits the same auth-gate as the free Deal Screen, which matches the requirement ("available to anyone with a free account or above").
- No schema changes. No new edge functions. No component changes beyond the possible anchor-target fix in step 3.
