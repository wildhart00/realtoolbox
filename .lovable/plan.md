## Plan: Copy-only updates to two promo elements

### Changes

1. **Homepage "Now Live" skills banner** (`src/components/home/SkillsHomeSection.tsx`)
   - Replace the body paragraph text only. Keep the banner layout, gradient, button, and heading exactly as-is.
   - New text: "Done-for-you instruction files that turn any AI assistant — ChatGPT, Claude, or Gemini — into a deal analyzer, seller-lead responder, or KPI strategist, built from real flipping and rental experience. Start free with the Deal Screen."

2. **Skills Page hero floating cards** (`src/pages/SkillsPage.tsx`)
   - These are the two decorative cards in the hero (not the data-driven skill grid below).
   - Card 1 (back card): change tag to "FREE", title to "Deal Screen", subtext to "Instant go/no-go on any deal."
   - Card 2 (front card): change tag to "FOR INVESTORS", title to "Deal Analyzer & Underwriter", subtext to "Full underwriting in minutes."
   - Keep all existing styling, rotation, glow, and layout.

### Technical notes
- Zero structural, theme, font, or component changes.
- No database, auth, admin, nav, or route modifications.
- Two line-range replacements in existing files only.
