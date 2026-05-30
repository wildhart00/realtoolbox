# Remove personal contact info

I searched the codebase for "Pat Wilder", "patwilder", and "midwestinvestqc". Your name does not appear anywhere. Your email `patwilder@midwestinvestqc.com` appears in exactly three places — all on public-facing pages.

## Changes

**1. `src/pages/ContactPage.tsx`**
Remove the `mailto:patwilder@midwestinvestqc.com` link block under the page intro. The contact form itself stays (submissions go to the `contact_messages` admin table), so visitors still have a way to reach you — just without exposing the address publicly.

**2. `src/pages/PrivacyPage.tsx`**
In the "Your rights" section, replace "by emailing patwilder@midwestinvestqc.com" with "by using our [contact page](/contact)."

**3. `src/pages/TermsPage.tsx`**
In the "Changes" section, replace "Email patwilder@midwestinvestqc.com" with "reach out via our [contact page](/contact)."

## Not changing

- Database, admin tools, footer, and all other pages — no references found.
- The contact form submission flow remains intact.

If you'd later like to swap in a non-personal address (e.g. `hello@realtoolbox.ai`), just say the word and I'll wire it in everywhere.
