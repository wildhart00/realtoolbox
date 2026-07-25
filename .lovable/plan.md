
## 1. Setup guide markdown (`skill-files/setup/setup-guide.md`)

Full scan of the current file. Only one first-person / founder reference exists — the closing paragraph. All other uses of "we" / "our" are brand-level (e.g. "We run a built-in integration", "When we improve a skill you own") and stay per the exception noted in the last sweep.

### Change

Replace the final paragraph:

> Built by an operator. The skills are conservative on purpose — a tool that tells you what you want to hear is worse than no tool at all.

with a new section:

> ## Why the skills behave this way
>
> RealToolbox skills are built to never invent comps, tax bills, rents, or records, to flag any number that hasn't been verified, and to refuse a verdict when the inputs aren't good enough to support one. Every skill is torture-tested across ChatGPT, Claude, Gemini, and Meta until they converge on the same answer before it ships. Conservative by design — a tool that tells you what you want to hear is worse than no tool at all.

Implementation: download the current markdown via signed URL, apply the replacement locally, re-upload to `skill-files/setup/setup-guide.md` via the storage upload tool (upsert). No DB change needed — the `skills.setup-guide` row already points to that path.

## 2. Skills DB scan — REPORT ONLY, no edits until approved

Scanned `tagline`, `overview`, and `description` on every published skill plus the `setup-guide` row. Below is every phrase that could plausibly count as first-person, founder reference, or experience claim. Nothing borderline is being edited yet.

### Hits worth your review

**Deal Analyzer & Underwriter** — `overview`
- "It underwrites like an operator protecting capital — not a salesperson trying to make the deal look good."
- (`description`) "…from the perspective of an operator who reviews deals before money goes in."

Note: "operator" is on your leave-alone list as a standard/reader descriptor, but these two phrases personify the tool as an operator, which reads closer to a founder claim than to describing the reader. Flagging so you decide.

**Deal Screen** — `overview`
- "…get a straight verdict from an operator's perspective"
- "That's the difference between a gut-check from someone who's run deals and a chatbot telling you what you want to hear."
- (`description`) "…using the same adjusted-ARV math seasoned operators use to avoid overpaying."

The "someone who's run deals" line is the clearest experience claim of the batch. "Seasoned operators" is plural / generic but still implies human authorship experience.

**Strategy / Path Picker** — `overview`
- Section heading: "**The operator move most beginners miss**"
- "That's the judgment that separates investors who finish deals from ones who stall halfway in."

Reads as reader-facing framing rather than a founder claim — flagged only because "operator move" personifies.

### Clean (no hits)

- Buy Box Builder
- Deal Assumption Trust Audit
- Deep Deal Triage
- Walk-Away / Red-Flag Checklist
- setup-guide row (`tagline` / `overview` / `description`)

### No hits found for

`I`, `my`, `we built`, `Pat`, `12 years`, `12+ years`, `operator-built`, `by an operator`, `prompt hobbyist`, `founder` — none appear anywhere in the eight rows.

### Next step

Mark each flagged line "rewrite" or "leave" and I'll send back proposed rewrites for the ones you want changed, still for your approval before any DB write.

## Technical details

- Storage: `skill-files` is a private bucket; use `supabase--storage_upload` with `upsert: true` at path `setup/setup-guide.md`, `contentType: text/markdown`. The public `file_url` stored on the `setup-guide` skill row keeps working because the download flow uses signed URLs, not public reads.
- No code, route, or schema changes.
- No changes to Stacks copy, `AffiliateDisclosure`, or anywhere else touched in the previous sweep.
