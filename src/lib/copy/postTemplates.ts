/**
 * Starter bodies for the two post shapes this blog is built for.
 *
 * These are scaffolds, not content. Every factual slot is a TODO — no tool names,
 * prices, ratings, or market claims are pre-filled, because a template that ships
 * with plausible-looking specifics is a template that eventually gets published
 * with them still in it.
 *
 * Markdown supported by the renderer (see components/blog/PostBody.tsx):
 *   ## H2 · ### H3 · --- rule · | tables | · - bullets · 1. numbers
 *   > quote · **bold** · *italic* · `code` · [text](/internal-or-https-url)
 */

export const ROUNDUP_TEMPLATE = `TODO: One paragraph on the job these tools do and who is trying to do it. Name the decision the reader is stuck on.

TODO: One paragraph on how you picked. What you tested, what you ignored, and what would disqualify a tool outright.

## The short version

| Tool | Best for | Watch out for |
| --- | --- | --- |
| TODO | TODO | TODO |
| TODO | TODO | TODO |
| TODO | TODO | TODO |

## TODO: Tool one

**Best for:** TODO
**Pricing:** TODO — confirm on the vendor's site before publishing; do not state a price you have not checked today.

TODO: What it actually does, in two or three sentences.

- TODO: what it does well
- TODO: what it does badly
- TODO: who should skip it

---

## TODO: Tool two

**Best for:** TODO
**Pricing:** TODO

TODO: Same structure as above.

---

## How to choose

1. TODO: the first question that eliminates most of the list
2. TODO: the second
3. TODO: the tiebreaker

## What this doesn't solve

TODO: Be straight about the limits of the category. Software that finds or organises deals still doesn't decide on them — that's the natural bridge to the toolbox, and it only works if it's true and stated plainly.
`;

export const COMPARISON_TEMPLATE = `TODO: One paragraph naming the two tools and the exact decision the reader is making between them.

> TODO: The one-line verdict. Say who each tool is right for, so a reader in a hurry can stop here.

## How they compare

| | TODO: Tool A | TODO: Tool B |
| --- | --- | --- |
| Best for | TODO | TODO |
| Pricing | TODO | TODO |
| Learning curve | TODO | TODO |
| Where it breaks | TODO | TODO |

## The criteria that actually decide it

TODO: Two or three paragraphs. Feature-count comparisons are noise — write about the two or three things that change the answer.

## Where TODO: Tool A wins

TODO.

## Where TODO: Tool B wins

TODO.

## Who should pick which

- **Pick TODO: Tool A if** — TODO
- **Pick TODO: Tool B if** — TODO
- **Pick neither if** — TODO

## The part neither one does

TODO: Both of these help you handle deals. Neither underwrites one. Bridge to the toolbox here — honestly, in one short paragraph.
`;

export const POST_TEMPLATES: { key: string; label: string; body: string }[] = [
  { key: "roundup", label: "Tool roundup", body: ROUNDUP_TEMPLATE },
  { key: "comparison", label: "Head-to-head comparison", body: COMPARISON_TEMPLATE },
];
