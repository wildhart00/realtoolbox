Update the SkillsAnnouncementStrip component on the homepage to reflect the live Skills page.

## Changes to `src/components/home/SkillsAnnouncementStrip.tsx`

**Content updates (keep purple gradient + layout exactly as-is):**

1. **Heading** — Change from `Claude Skills for Real Estate — coming soon` to `Real estate skills for any AI — now live`
2. **Body text** — Change from the existing waitlist copy to: `Done-for-you instruction files that turn any AI assistant (Claude, ChatGPT, Gemini) into a listing description writer, follow-up sequence writer, pricing strategist, and more. Free to download.`
3. **Button** — Change label from `Join the Waitlist` to `Browse the skills`, and update the `Link` destination from `/skills` (waitlist) to `/skills` (same path, new label).
4. **Remove** the `New` badge from inside the button label area — the section label context already implies this is a featured announcement.

No visual, layout, or styling changes. The purple gradient, rounded corners, decorative blur highlights, spacing, and typography tokens all stay exactly as they are.

No other files are affected.