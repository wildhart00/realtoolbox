# Workspace Atom preparation — no activation

## Source allowlist PROPOSAL ONLY
- ID: `google-workspace-atom`, disabled.
- Fetch only `https://feeds.feedburner.com/GoogleAppsUpdates`: exact host
  `feeds.feedburner.com`, exact path `/GoogleAppsUpdates`. No redirect followed.
- Output provenance links: HTTPS `workspaceupdates.googleblog.com` only;
  no credentials, nondefault ports, query/fragment or encoded path ambiguity.
  These links are never fetched by this adapter.
- Do not use the blog's original atom.xml, whose redirect goes through HTTP.
- User-provided independent review: official Workspace blog offers Atom and
  https://knowledge.workspace.google.com/admin/releases/ways-to-track-new-releases
  supports RSS subscription. User reports feed returned 200 text/xml, 25 entries.
  Those findings were not re-fetched or independently verified in this slice.

Realtor remains disabled: independent review reports terms restricting automated
collection. AppFolio remains disabled: visible September 29 vs JSON-LD April 24
contradiction and alphabetical selection are unsuitable. Their code is not repaired
or used here. This proposal supersedes the prior two-newsroom activation suggestion.

## Implementation
`server/update-engine/atom.ts`: namespace-aware @xmldom/xmldom parser, strict XML
errors and DTD/entity declaration rejection. Reads only Atom id/title/published/
updated/alternate link. Ignores content HTML and summary; no efficacy or availability
inference. Sorts published timestamps descending, records updated separately,
labels publications older than 30 days background, deduplicates IDs/links and known
metadata hashes. Maximum two draft payloads, always flagged manual review/not tested.
Updated dates never make an old publication new. Metadata changes include updated
in the hash; caller must supply persisted known hashes for cross-run dedup.

`fetchAtom` uses existing pinned DNS HTTPS transport: 8 seconds, 512 KiB,
identity encoding, exact URL, no redirects. XML MIME whitelist is local to Atom;
the HTML collector still rejects XML. Shared Accept header now advertises both.
No article fetches, RPC calls, workers or handlers are added. `atomDrafts` prepares
arguments for the existing revision RPC only; it does not submit them.

## Remaining before a separately approved manual run
No source row or SQL allowlist has changed. Current proposed reservation RPC only
allows the two newsroom IDs; it cannot reserve this feed. A future reviewed change
must admit only the feed ID, separate fetch host from output provenance host in
the source configuration, preserve sandbox_exec denial and manual-only state, and
wire a server-only reservation/submission/finish caller. Recheck feed access terms
and robots as appropriate; RSS support does not grant arbitrary article scraping.
One manual fetch, zero article fetches, maximum two review drafts, no scheduling,
publication/email/AI/paid services. This document is not activation approval.

## Validation
Synthetic namespace/date/order/dedup/malicious-link/truncated-XML/content-isolation
and mocked XML-transport tests in `server/update-engine/atom.test.ts`.
Full suite: 165/165 passed (159 existing plus six Atom tests). No SQL suite rerun
needed because SQL was not changed; this is not live-source/runtime verification.
No frontend change, deployment, live fetch, SQL apply or paid call.

Atom implementation SHA256:
`7c6050168334ac34a1b56ec4d39aef28c4c0de0db34029de507b80692cd67525`.