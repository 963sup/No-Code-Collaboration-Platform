# Database schemas

This directory is the source of truth for the current desired database shape. Schema files implement persistence and database enforcement without redefining business truth from `packages/domain`.

Author canonical database structure here first. Generate a migration with `supabase db diff -f <descriptive-name>`, review the generated SQL, prove the full accepted transition history with `pnpm supabase:reset`, run `pnpm supabase:lint`, and regenerate TypeScript database types when the applied local schema changes their projection.

Schema files execute in lexicographic order by default. Start with a small number of coarse files and add explicit ordering only when real dependencies justify it; do not create empty domain-shaped SQL files for symmetry.

Reviewed schema changes produce append-only accepted replayable transitions in `../migrations/`. A migration file and successful local replay do not prove that a persistent environment applied the transition; Applied status belongs to the identified environment's migration ledger and provider evidence.

The current execution target is the disposable Supabase CLI local stack. No Supabase Cloud project is provisioned. Generated `packages/infrastructure/supabase/src/generated/database.types.ts` is a projection of the applied local schema. Tables exposed through the Data API require explicit grants and RLS policies appropriate to their resource and ownership model.

Declarative diffing has known coverage gaps. DML and some PostgreSQL metadata or policy/view/grant changes may need explicit reviewed migration SQL. Generated migration output is never accepted without review.
