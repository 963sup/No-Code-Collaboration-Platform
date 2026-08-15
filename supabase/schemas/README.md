# Database schemas

This directory is the source of truth for the current desired database shape. Schema files implement persistence and database enforcement without redefining business truth from `packages/domain`.

Author canonical database structure here first. While no identified persistent environment has applied the baseline, compile the ordered schemas into the one reviewed local-development baseline. After that baseline is frozen by persistent application, generate forward migrations with `supabase db diff -f <descriptive-name>`. Prove replay with `pnpm supabase:reset`, run `pnpm supabase:lint`, and regenerate TypeScript database types when the applied local schema changes their projection.

Schema files execute in lexicographic order by default. Start with a small number of coarse files and add explicit ordering only when real dependencies justify it; do not create empty domain-shaped SQL files for symmetry.

Reviewed schema changes update the sole consolidated baseline in `../migrations/` while the project remains `LocalOnly`. Once an identified persistent environment records that baseline as Applied, it becomes immutable and later accepted transitions are append-only. A migration file, hosted provider project, and successful local replay do not prove persistent application; Applied status belongs to the identified environment's migration ledger plus direct provider evidence.

While the status remains `LocalOnly`, run `pnpm supabase:baseline:compile` after reviewing declarative schema changes. The compiler accepts exactly one local-development baseline and concatenates every `.sql` schema in lexicographic order; it refuses to operate once the migration shape no longer matches that replaceable-baseline contract.

The current accepted execution target is the disposable Supabase CLI local stack. **No Supabase Cloud project is provisioned as an accepted persistent database environment**; a hosted provider resource may exist without the repository baseline being classified, linked, or Applied there. Generated `packages/infrastructure/supabase/src/generated/database.types.ts` is a projection of the applied local schema. Tables exposed through the Data API require explicit grants and RLS policies appropriate to their resource and ownership model.

Declarative diffing has known coverage gaps. DML and some PostgreSQL metadata or policy/view/grant changes may need explicit reviewed migration SQL. Generated migration output is never accepted without review.
