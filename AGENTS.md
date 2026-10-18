# Project rules

- Install the update-engine schema through the supported migration tool and seed its inactive singleton separately through the data-write tool; missing settings fail closed, so no seed DML belongs in schema migrations.
- Keep search discovery as a bounded, in-memory pre-evidence stage using the engine's canonicalization and risk rules; only vetted primary evidence may enter the existing revision pipeline, so search snippets cannot become publishable updates.
- Keep generic shadow collection in server-only library modules with pinned public DNS addresses and manual redirects; no browser import or deployed handler, so preparation cannot activate collection. The manual Workspace Atom path alone uses its dedicated immutable-URL native fetch wire, never the generic transport.
- Parse Atom with a namespace-aware XML library that throws on malformed XML and forbids DTDs; keep feed transport allowlists separate from output-link provenance, so article links are never fetched implicitly.
- Keep manual Atom runtime modules independent of browser/source-registry imports and stage handlers outside supabase/functions until activation approval, because function-path changes can deploy automatically.
- Bind feed draft submission to a narrow reservation wrapper around the installed revision RPC; source locks serialize lineage and job counters without changing the reviewed candidate writer or table ACLs.
- Never use the Node HTTPS pinned-lookup transport in Deno: Deno 2.6.10 rejects ClientRequest.options.lookup. The dedicated Workspace wire relies on runtime DNS and normal HTTPS certificate/hostname verification, not resolved-IP validation; stage it outside deployed function paths pending independent review.
