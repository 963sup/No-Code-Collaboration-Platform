# Supabase scope

This subtree owns database truth and enforcement, not business truth. `packages/domain` remains authoritative for business concepts and invariants.

## Declarative schema workflow

- `schemas/` is the current desired database state. Make canonical schema changes there first.
- `migrations/` is append-only deployment history generated from reviewed declarative changes. Do not edit an already-deployed migration to change current truth.
- `seed.sql` contains deterministic local/test data only. Never copy production data or secrets into it.
- Generate migrations with `supabase db diff -f <descriptive-name>`, then review the SQL before applying it.
- Prove reproducibility with `pnpm supabase:reset`, then run `pnpm supabase:lint`.
- Regenerate `types/database.types.ts` from the applied local database after accepted schema changes. Generated types are a projection, not an authoring surface.
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

Local `start`, `status`, `reset`, linting, type generation, and declarative diffing are development operations. Linked or remote operations (`db push`, `db pull`, `db reset --linked`, remote SQL, production mutations) require explicit user intent because they cross the repository boundary.
