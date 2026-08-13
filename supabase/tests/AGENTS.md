# Database Authorization Test Scope

This directory proves PostgreSQL grants, RLS, functions, triggers, and cross-row invariants through the real database boundary.

## Inviolable invariants

- Security fixes MUST include a regression test that represents the original attack path and fails without the enforcement change.
- Tests MUST run mutations as realistic `authenticated` actors with explicit JWT subjects rather than calling helper functions alone.
- Authorization matrices MUST cover INSERT, UPDATE, and DELETE where applicable, including both the existing role and proposed role.
- Self-escalation, mutation of peer or higher roles, forged actor attribution, cross-scope access, and last-owner removal are mandatory negative cases when affected.
- Every denied attack path requires at least one legitimate positive control through the same boundary.
- Cross-row ownership continuity MUST be tested for both rejection of the last-owner mutation and allowance when another owner remains.
- Tests MUST use transactions and rollback; they must not require or mutate any linked or remote Supabase project.

## pgTAP file contract

Each test file MUST be independently runnable and follow this lifecycle:

1. `begin;`
2. create/locate pgTAP in `extensions` and set a deterministic local `search_path`;
3. declare one exact `plan(N)`;
4. create deterministic, file-owned actors and fixtures;
5. set `role` plus `request.jwt.claim.sub` for realistic `authenticated` behavior;
6. assert negative attacks and legitimate positive controls through the same SQL/RPC boundary;
7. reset role/claims when changing trust boundary;
8. `select * from finish();`
9. `rollback;`

Maintain the plan count with every assertion change. Prefer `is`, `is_empty`, `results_eq`, `lives_ok`, and `throws_ok` according to observable behavior. Assert SQLSTATE and invariant outcomes instead of unstable provider error prose where possible.

## Coverage and isolation

- Grants/Data API reachability and RLS row authorization are distinct test surfaces; cover both when either changes.
- Querying a helper directly is insufficient when the real boundary is a table mutation or public RPC.
- Denied UPDATE/DELETE paths may return zero rows rather than throw; assert the row result and unchanged state.
- Test existing state with `USING`, proposed state with `WITH CHECK`, and cross-row/serialized trigger invariants with both rejection and valid continuation controls.
- Use unique deterministic UUID ranges per file. Do not depend on execution order, wall-clock races, external services, Studio state, `seed.sql`, or demo credentials.
- Tests run only against the disposable local stack when `projects: []`; no test helper may link, push, repair, reset, or execute SQL against a remote project.

## Development loop

Run the narrow file first with `supabase test db <path>`, confirm a security regression fails before its enforcement change, then run `pnpm supabase:test`. Before completion, run `pnpm supabase:verify` so the suite proves empty-database migration replay, seed compatibility, database lint, all pgTAP files, and generated-type consistency.
