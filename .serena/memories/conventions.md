# Conventions

- Read the complete applicable `AGENTS.md` chain before editing; use `docs/README.md` to route to the narrowest current contract.
- Keep TypeScript strict. Format with oxfmt and lint with oxlint; preserve repository naming and package boundaries.
- Architecture direction is Web -> Application -> Domain, with Infrastructure implementing Application ports. Domain/Application remain provider- and framework-neutral; Supabase wiring belongs in Infrastructure and `apps/web/src/composition`.
- Capability is the authorization decision primitive. Authentication, UI visibility, selected context, membership, and provider metadata never substitute for authorization.
- Database authoring starts in `supabase/schemas`; migrations are replayable transition evidence; generated `database.types.ts` is never an authoring surface.
- Prefer the smallest correct change, preserve unrelated dirty work, and stage explicit paths only. No speculative abstractions or unrelated cleanup.
