## Goal
Update the homepage hero subheadline, secondary button, and muted tagline. Keep all visual styling, fonts, layout, and the primary CTA exactly as-is.

## Changes

### `src/components/home/Hero.tsx`

1. **Subheadline paragraph** — Replace the current `<p>` (the one with `maxWidth: 640`) with:
   > "Ready-to-run AI workflows for real estate investors — built from real operator experience, not generic prompts. Load one into ChatGPT, Claude, or Gemini and get operator-grade answers on whether a deal works, what to offer, and when to walk away — in minutes."

2. **Secondary link** — Change the text from `"See the workflows →"` to `"See what's inside →"`. Replace the `<Link>` with an `<a>` or `<button>` that prevents default and calls `scrollIntoView({ behavior: "smooth" })` on `document.getElementById("journey-section")`. This matches the pattern already used in `BrowseByTagSection`.

3. **Muted tagline** — Replace the bottom `<p>` (the one with `text-muted-foreground/75`) with:
   > "ChatGPT doesn't know how a flip gets underwritten, what to safely offer, or when to walk away. These do — because an operator built them."

4. **Primary CTA** — Leave `"Start free — Deal Screen"` unchanged (text, style, gradient, and `/skills/deal-screen` link).

## Anchor target
The smooth-scroll link targets an element with `id="journey-section"`. This section does not yet exist on the page; you will add it next. If you prefer a different `id`, let me know before I implement.