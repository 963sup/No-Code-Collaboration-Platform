# Generated Database Projection Scope

- Files in this directory are generated projections of the applied local database, not authoring surfaces or Product contracts.
- Never hand-edit generated database types. Change `supabase/schemas`, produce the required replayable migration, reset the local database, then run `pnpm supabase:types:local`.
- Verify checked-in output with `pnpm supabase:types:check`.
- Generated provider shapes remain inside Supabase Infrastructure and must not leak into Domain, Application, or UI APIs.
