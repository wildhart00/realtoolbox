
Two positioning changes. Design tokens, components, and layout unchanged — copy and section order only.

## A. MCP as the headline mechanism

### 1. Homepage hero — rewrite around MCP (non-superlative)

`src/components/home/Hero.tsx` — new copy, same structure and CTAs:

- Eyebrow pill: "Plugs into ChatGPT, Claude, and other AI apps"
- H1: "Your real estate skills, plugged straight into your AI." with the italic accent phrase: "loaded on demand, always the current version."
- Sub: "Other real estate AI products hand you files to copy and paste. RealToolbox connects your toolbox directly to Claude, ChatGPT, and other AI apps — so your skills load themselves, stay current automatically, and are always the real version. Copy-paste still works everywhere as a universal fallback."
- Primary CTA unchanged ("See the Toolboxes"). Secondary link becomes: "How the connection works →" jumping to the new three-beat section (`#how-connection-works`). Directory browse link is removed from the hero.
- Trailing trust line (currently the "operator, not a prompt hobbyist" line) → replaced by the three impersonal claims (see section B).

### 2. New "How the connection works" section on the homepage

Add `src/components/home/HowConnectionWorks.tsx` with id `how-connection-works`, placed **directly under Hero** in `src/pages/Index.tsx` (before `WhatThisIsSection`). Reuses the three-beat card pattern already in `WhatThisIsSection` (same `surface-card` classes, numbered chip, lucide icon):

1. **Connect once** — Plug your toolbox into Claude, ChatGPT, or any MCP-capable AI once. (icon: Plug)
2. **Ask your AI to load any skill you own** — In plain language: "Load the deal screen." (icon: MessageSquare)
3. **It pulls the current version, gated to your account** — Always the real, up-to-date skill. Only what you own. (icon: ShieldCheck)

Footer link on the section: "See the full connect walkthrough →" pointing to `/setup-guide#connect-your-toolbox-via-mcp`.

`WhatThisIsSection` stays where it is (below the new section) — it explains what a skill is, which is complementary.

### 3. Promote the MCP block above the feature list

- `src/pages/InvestorToolboxPage.tsx`: move `<McpDifferentiatorCallout />` out of the "What you get" card (lines 192–194) and render it as its own section **immediately below the hero** (before "The arc" section). Keeps the callout, drops it from inside the feature list.
- `src/pages/ToolboxIndexPage.tsx`: the MCP callout already sits directly under the hero (lines 119–122). Leave the placement, only refresh its copy (below).

### 4. Non-superlative rewrite of `McpDifferentiatorCallout`

`src/components/toolbox/McpDifferentiatorCallout.tsx` — replace the "The only real estate toolbox that connects directly to…" body with:

> "Your toolbox connects directly to Claude, ChatGPT, and other AI apps — so your skills load themselves, stay current automatically, and are always the real version. Copy-paste still works everywhere as a fallback."

Eyebrow stays "MCP built-in". Link label becomes "How the connection works →" pointing to `/setup-guide#connect-your-toolbox-via-mcp` (fixes the current `/setup-guide#connect` broken anchor).

Site-wide grep confirms this is the only occurrence of the "The only real estate toolbox…" line.

## B. Depersonalize marketing copy

Replace every founder/first-person credibility signal with these three claims (used together where the founder line used to sit; short-form variants OK where space is tight):

- **Behavior** — "Skills are built to never invent comps, taxes, rents, or records — they flag unverified inputs and refuse a verdict when the data isn't good enough."
- **Process** — "Every skill is torture-tested across ChatGPT, Claude, Gemini, and Meta until they converge on the same verdict before it ships."
- **Origin** — "Built from real flips, rentals, and closings. Conservative by design."

Brand "we" is fine. No invented staff. Stacks' "Why this one" note bodies stay first-person, but the label changes.

### Files to change in the sweep

**Meta / global**
- `index.html` — title, meta description, og/twitter description: drop "12+ years"/"operator-grade" personal framing. New description: "Real estate AI skills that plug directly into Claude, ChatGPT, and other AI apps. Built from real flips, rentals, and closings. Conservative by design."

**Homepage**
- `src/components/home/Hero.tsx` — rewrites in A.1 above; removes "Built by an operator, not a prompt hobbyist" and "12+ years"; replaces sub-copy and trailing trust line with the three claims (compact form).
- `src/components/home/WhatThisIsSection.tsx` — beat #3 title "Get an operator-grade answer" → "Get a conservative, defensible answer"; body "the way an operator would" → "the way a careful investor would".
- `src/components/home/DealScreenStrip.tsx` — "operator-grade Deal Screen" → "conservative Deal Screen".
- `src/components/home/SkillsHomeSection.tsx` — "operator-grade deal partner" → "conservative deal partner"; "Built from real flipping and rental experience" → "Built from real flips, rentals, and closings."
- `src/components/home/PricingSection.tsx` — "operator-grade ARV and offer math" → "conservative ARV and offer math" (component still exists though unused on home).

**Toolbox pages**
- `src/pages/ToolboxIndexPage.tsx` — hero sub loses "Built and torture-tested by a 12-year operator" line and gains the three-claim strip below the hero (small text row); feature bullet "7 operator-grade skills" → "7 conservative deal skills"; page title meta stays "Toolbox — Real estate AI skills…" (drop "Operator-grade").
- `src/pages/InvestorToolboxPage.tsx` — hero sub "Built and torture-tested by a 12-year operator" removed and replaced by the three claims; FAQ answer at line 32 "operator-grade prompts and guardrails" → "conservative prompts and guardrails"; bullet "7 operator-grade skills" (line 53) → "7 conservative deal skills"; SEO description (line 90) rewritten without "operator-grade"; sentence at line 114 "Seven operator-grade AI skills" → "Seven conservative AI skills"; the trailing footer line 241 → "Built from real flips, rentals, and closings. Conservative by design."; also the "operators actually work a deal" phrasing (line 148) → "the way a deal actually gets worked".
- `src/pages/AgentToolboxPage.tsx` — hero sub "written by someone who's actually worked the phones, walked the listings…" → replaced with the three claims (short form); SEO description at line 72 loses "operator-grade"; trailing line 214 → same as investor.

**Skills / setup**
- `src/pages/SkillsPage.tsx` — SEO description and page header remove "Operator-grade workflows" → "Conservative AI workflows"; description text updated to drop the label.
- `src/pages/SkillDetailPage.tsx` — default description fallbacks (lines 79, 216) drop "Operator-grade"/"operator workflow" wording.
- `src/components/skills/HowToUseSteps.tsx` — step 3 "Get operator-grade output" / "The numbers and judgment of someone who's run the deals" → "Get a conservative, defensible answer" / "Numbers you can defend, guardrails that refuse a bad verdict".

**Stacks**
- `src/pages/StackPage.tsx` — investor description "The exact toolset I'd run…" → "The toolset RealToolbox recommends for a real estate investor today — deal finding, analysis, skip tracing, CRM, rehab, and back office. Curated, not a directory dump."; agent description "The tools I'd hand a new real estate agent…" → "The tools RealToolbox recommends for a new real estate agent on day one — CRM, listing marketing, transactions, AI content, and client communication."; "operator skills that run these tools for you" (line 313) → "AI skills that run these tools for you".
- `src/components/stacks/StacksHomeStrip.tsx` — titles "If I were starting today — the tools I'd run" → "The investor stack — the tools to run today"; "The tools I'd hand a new agent on day one" → "The agent stack — day-one tools for a new agent".
- `src/components/stacks/StackToolCard.tsx` — label "Why this one" → **"Why it's in the stack"** (per exception clause). Card body copy (author-written per entry) is unchanged.
- `src/pages/admin/StackEntryDialog.tsx` — helper label "Why this one (first-person)" → "Why it's in the stack (editorial note)".
- `src/pages/admin/StacksAdmin.tsx` — placeholder "Operator-voice intro. Blank lines separate paragraphs." → "Editorial intro. Blank lines separate paragraphs."

**Directory / affiliate / newsletter / blog / resources**
- `src/components/affiliate/AffiliateDisclosure.tsx` — "based on real operator use, not commission rates" → "based on hands-on use, not commission rates".
- `src/components/home/NewsletterCard.tsx` — "built from real operator experience" → "built from real flips, rentals, and closings".
- `src/pages/BlogPage.tsx` — "written by operators, for operators" → "written for real estate operators — investors, agents, and teams putting AI to work".
- `src/pages/ResourcesPage.tsx` — headline "Tools for the serious real estate operator" is a role descriptor, not first-person; leave as-is (operator here = the visitor's role, not the author).
- `src/components/layout/Footer.tsx` — brand blurb "operator-grade skill toolboxes built from real flipping and rental experience" → "AI skill toolboxes built from real flips, rentals, and closings. Conservative by design."

### What is intentionally NOT changed

- The `setup-guide` markdown stored in Supabase Storage is user-authored content and may contain first-person passages; I won't rewrite it in this pass unless asked (the plan touches only frontend copy per the UI-change convention). Flagging this so you can decide whether to re-upload a depersonalized guide.
- Skill `overview` and `description` fields in the `skills` DB rows may still contain "operator" language. Same reason — DB content edits are out of scope unless requested.
- The word "operator" as a *visitor role descriptor* ("for real estate operators", "the serious real estate operator") is kept where it clearly refers to the reader, not the author.
- Stacks "Why this one" note bodies remain first-person by design (exception clause). Only the label changes.

## Verification

- After edits, `rg -n -i "12\+ years|12-year|prompt hobbyist|built by an operator|the only real estate|Pat Wilder|\bPat Wilder\b"` returns zero hits in `src/` and `index.html`.
- `rg -n "operator-grade" src/` returns zero hits.
- `rg -n "I'd |I've |someone who's actually" src/` returns zero hits outside `StackToolCard` note bodies (author copy).
- Manually diff the Homepage, `/toolbox`, `/toolbox/investor`, `/toolbox/agent`, `/stacks/investor` visually.
- Type-check.

## Deliverable

At the end of the build, I'll paste a bulleted list of every file changed in the depersonalization sweep so you can spot-check.
