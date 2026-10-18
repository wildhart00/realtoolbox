# Project rules

- Install the update-engine schema through the supported migration tool and seed its inactive singleton separately through the data-write tool; missing settings fail closed, so no seed DML belongs in schema migrations.
- Keep search discovery as a bounded, in-memory pre-evidence stage using the engine's canonicalization and risk rules; only vetted primary evidence may enter the existing revision pipeline, so search snippets cannot become publishable updates.