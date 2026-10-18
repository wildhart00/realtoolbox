# Fixed Workspace feed — independent review checkpoint

Code/tests only. Single live-run authorization remains unused: **zero actual feed requests**. No live SQL, source/settings writes, deployment, site publication, article fetch, AI, email or schedule. Generic `transport.ts` / `pinnedHttps` unchanged; blocked newsroom paths unchanged.

## Narrow changed property
`fixedGoogleWorkspaceAtomWire` is injected only by `runManualAtom` when no synthetic test wire is supplied. It accepts only a URL whose href equals `https://feeds.feedburner.com/GoogleAppsUpdates` and passes that literal to Deno native fetch. No inbound headers/auth/cookies/body/user input is forwarded. GET; redirect:error; credentials:omit; fixed nonsecret Accept/User-Agent/Accept-Encoding:identity. No retries or destination selection by callers, feed entries or redirects.

This exception relies on **runtime DNS plus normal HTTPS certificate and hostname verification**. It performs **no resolved-public-IP validation or DNS pinning**, and **cannot guarantee no private TCP destination if DNS or the runtime is compromised**. Platform network controls remain. No TLS-disable/proxy/insecure security flags. This is an immutable trusted-host threat model, not a general SSRF-safe URL fetcher. The generic pinned transport is not repaired or activated in Deno.

Eight-second abort covers fetch headers through the complete streamed body. Byte accounting ignores Content-Length and rejects beyond 524288 before UTF-8 decoding. Body errors cancel the reader and abort; invalid UTF-8, non200, redirects, bad XML MIME and nonidentity encoding fail closed. XML parser rejects DTD/entities/malformed XML; unsafe output links are discarded, never fetched. At most two metadata drafts through the unchanged reservation/revision/finish path; no publication RPC.

## Offline validation commands and limitations
`deno test --no-check --cached-only --config=server/update-engine/deno-test-config.json server/update-engine/fixed-feed.deno.ts`

Deno 2.6.10; installed exact @xmldom/xmldom 0.9.12, no network permission. 12/12 passed: literal/options, altered URLs, redirect one-call, byte boundary/chunks/misleading length, deterministic 8000ms deadline firing before headers and mid-body, cancellation, HTTP/MIME/encoding, invalid UTF-8, upstream abort, XML/entity/date/output safety, whole native-wire mocked DB path, max2/no publish and pause cleanup including lost response. Timing test fires the captured actual deadline callback without waiting eight real seconds. One native permission-refusal test rejects before DNS/TCP; not a TLS claim.

Initial offline npm-cache resolution failed; using installed node_modules fixed resolution. Deno type checking could not resolve cached @types/node, so behavior tests explicitly use --no-check; no Deno typecheck success claimed. No package downloaded. Existing 177/177 Vitest regressions passed across 14 files; preexisting React warnings remain. SQL untouched; previous isolated SQL evidence preserved, not rerun.

Local TLS rejection fixture is in `server/update-engine/fixed-feed-tls.deno.ts`. It uses a throwaway self-signed localhost certificate and loopback-only network permission, normal certificate validation, no insecure flags. It does not use the fixed feed wire, call the feed or prove production Cloud networking compatibility. Actual result recorded in `local-validation/fixed-feed-tls-results.txt`.

## Review artifacts
`local-validation/fixed-feed-review-artifacts.sha256` pins current runtime/handler/parser, tests/config and unchanged RPC/source/generic transport artifacts. Previous approval-packet fingerprints are historical and superseded for changed code; independent root review must approve the diff before any live effects. No new keys, purchases or plan changes.

Handler still requires independent final settings readback after any future run; cleanup RPC response alone is not proof of final live pause, and process termination can defeat finally. Review does not grant activation.