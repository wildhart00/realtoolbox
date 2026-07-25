Two small copy/link fixes — no structural changes.

## 1. Footer Product column: remove duplicate "Toolbox"
File: `src/components/layout/Footer.tsx`

Current `product` array lists "Toolbox" twice. Replace the duplicate entry with:
- Label: `Setup guide`
- Link: `/setup-guide`

Keep all other footer columns and styling unchanged.

## 2. Skill detail setup block: lead with MCP option
File: `src/pages/SkillDetailPage.tsx`

In the "How to set it up for continuous use" section, insert one new paragraph before the existing `<ol>` step list:

> Fastest way: connect your toolbox once via MCP and your AI loads any skill you own on demand — see the setup guide

- Link the text "setup guide" to `/setup-guide#connect-your-toolbox-via-mcp`.
- Preserve the existing 4 copy-paste steps exactly as they are beneath it.
- Match existing text/link styling (text-[hsl(229_94%_82%)] underline, etc.).

No other page or component changes.