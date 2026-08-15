# Conventions

- Read the complete applicable `AGENTS.md` chain before editing; route through `docs/README.md` to the narrowest current contract.
- Keep TypeScript strict; format with oxfmt and lint with oxlint. Preserve existing naming and package boundaries.
- Architecture direction: Web -> Application -> Domain; Infrastructure implements Application ports. Domain/Application remain provider- and framework-neutral; Supabase wiring belongs in Infrastructure and `apps/web/src/composition`.
- Capability is the authorization decision primitive. Authentication, UI visibility, selected Context, Membership, and provider metadata never substitute for authorization.
- Database authoring starts in `supabase/schemas`; migrations are reviewed replayable transition evidence; generated `database.types.ts` is never an authoring surface.
- Prefer the smallest correct change, preserve unrelated dirty work, and stage explicit paths only. Do not add speculative abstractions or unrelated cleanup.
