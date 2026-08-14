# Supabase schema lifecycle

## Truth and environment boundary

- `supabase/schemas/*.sql` is the canonical desired PostgreSQL state and executes in `schema_paths` order.
- `packages/domain` owns business meaning; SQL projects accepted invariants and independent RLS enforcement. Generated database types are Infrastructure projections only.
- The repository contract is currently `LocalOnly`: use the disposable local/CI stack and never infer a Cloud deployment from files or local ledgers. Re-check provider/link evidence before any decision that depends on remote state.

## Migration phase rule

- Before any identified persistent environment applies a migration, `supabase/migrations` contains exactly one reviewed baseline compiled from the ordered declarative schemas.
- The current replay candidate is `supabase/migrations/20260814190012_local_development_baseline.sql`, an exact projection of 15 schema SQL files.
- Local-only schema evolution replaces that one consolidated baseline after review; Git retains development provenance.
- The first persistent application freezes the baseline. From that environment-ledger boundary onward, never rewrite applied history; later accepted transitions are append-only.
- A migration becomes Applied only through an identified environment's ledger plus direct provider evidence.

## Verified reconstruction contract

- `pnpm supabase:verify` explicitly resets the local database, lints SQL, runs all pgTAP suites, and checks generated database types.
- The consolidated baseline replay passed lint, 8 pgTAP files / 118 assertions, and generated-type consistency.
- The baseline must remain an exact ordered projection of `supabase/schemas/*.sql`; schema changes start in schemas, then update the baseline or add a post-freeze forward migration according to the phase rule.
- `seed.sql` is deterministic local/test data, not schema truth or production data.
