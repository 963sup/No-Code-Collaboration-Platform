# Supabase database scope

This subtree owns declarative PostgreSQL schema truth and database enforcement. It is not the Supabase SDK adapter package and does not own business truth. `packages/domain` remains authoritative for business concepts and invariants; `packages/infrastructure/supabase` owns provider-specific TypeScript adapters.

The selected Supabase adapter and the provisioned database environment are separate facts. The current environment is the disposable local Supabase CLI stack; no Supabase Cloud project is provisioned.

## Declarative schema workflow

- `schemas/` is the current desired database state. Make canonical schema changes there first.
- `migrations/` is append-only accepted replayable transition history generated from reviewed declarative changes.
- A migration file may be Draft or Accepted. It becomes Applied only for an identified environment whose migration ledger and provider evidence record it.
- File presence, local reset, or CI success MUST NOT be described as proof of remote deployment.
- `seed.sql` contains deterministic local/test data only. Never copy production data or secrets into it.
- Generate migrations with `supabase db diff -f <descriptive-name>`, then review the SQL before applying it.
- Prove reproducibility with `pnpm supabase:reset`, which explicitly targets the local database, then run `pnpm supabase:lint`.
- Regenerate `packages/infrastructure/supabase/src/generated/database.types.ts` from the applied local database after accepted schema changes. Generated types are an Infrastructure projection, not an authoring surface.
- Treat schema diff output as a draft. DML, some grants, policy alterations, view properties, publications, comments, and other PostgreSQL details may require explicit reviewed migration SQL.

## Security invariants

- Every table exposed through the Data API must have deliberate grants and appropriate RLS.
- `TO authenticated` proves authentication only; policies must still constrain ownership, membership, repository scope, or capability.
- UPDATE policies require both visibility and post-update constraints when ownership or scope must remain invariant.
- Never use user-editable metadata as an authorization source.
- Prefer `SECURITY INVOKER`. If `SECURITY DEFINER` is necessary, keep the function out of exposed schemas, make the privilege boundary explicit, constrain execution grants, and verify the caller inside the function where applicable.
- Never expose service-role or secret keys to browser code.
- Index columns used repeatedly in authorization lookups once the corresponding access path exists; do not invent indexes before a real query or policy requires them.

## External boundaries

Local `start`, `status`, `reset --local`, linting, type generation, testing, and declarative diffing are development operations.

Default package scripts and ordinary CI MUST NOT contain remote project credentials or invoke `supabase link`, `supabase db push`, `supabase db pull`, `supabase db reset --linked`, remote SQL, or equivalent persistent-environment mutation.

Creating, linking, or mutating a Supabase Cloud project requires explicit user intent plus the provisioning and initial-baseline gates in the Operations Runbook and ADR-005.
