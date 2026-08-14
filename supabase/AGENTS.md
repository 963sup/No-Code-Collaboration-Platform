# Supabase database scope

This subtree owns declarative PostgreSQL schema truth and database enforcement. It is not the Supabase SDK adapter package and does not own business truth. `packages/domain` remains authoritative for business concepts and invariants; `packages/infrastructure/supabase` owns provider-specific TypeScript adapters.

The selected Supabase adapter and the provisioned database environment are separate facts. The current environment is the disposable local Supabase CLI stack; no Supabase Cloud project is provisioned.

## Environment state when `projects: []`

`projects: []` from the Supabase MCP is a time-scoped provider observation: the authenticated account currently exposes no Supabase Cloud project. Together with the absence of a local linked project reference, it means this repository is in `LocalOnly`, not `RemoteMissing` or implicitly authorized to provision infrastructure.

- Allowed work is explicit local work: `start`, `status`, `stop`, `db reset --local`, `db diff --local`, `migration up --local`, `test db`, `db lint --local`, and local type generation.
- Do not call remote MCP mutation tools, create a project, run `link`, `db pull`, `db push`, `db dump --linked`, `db reset --linked`, or repair a remote ledger merely to make local work possible.
- A local/CI migration ledger proves only replay in that disposable environment. It does not establish preview, staging, or production state.
- If a persistent environment is requested later, re-run provider discovery, identify its project ID and lifecycle role, pass the Operations Runbook/ADR-005 provisioning gate, preview the migration plan, and obtain explicit mutation intent before linking or applying anything.
- Provider absence can change. Re-check it at the start of any task whose decision depends on remote state; do not preserve `projects: []` as timeless truth.

## Declarative schema workflow

- `schemas/` is the current desired database state. Make canonical schema changes there first.
- `migrations/` has a two-phase lifecycle: before any persistent environment applies a migration, it contains one reviewed local-development baseline compiled from `schemas/`; after the first persistent application freezes that baseline, later accepted transitions are append-only.
- A migration file may be Draft or Accepted. It becomes Applied only for an identified environment whose migration ledger and provider evidence record it.
- File presence, local reset, or CI success MUST NOT be described as proof of remote deployment.
- `seed.sql` contains deterministic local/test data only. Never copy production data or secrets into it. A checked-in demo password is public test data, not a secret; label it local-only and never reuse or include it in a persistent environment.
- While the project is `LocalOnly`, regenerate the single baseline from the ordered declarative schemas and review the resulting SQL. After the baseline is frozen by persistent application, generate forward migrations with `supabase db diff -f <descriptive-name>` and review them before applying.
- Prove reproducibility with `pnpm supabase:reset`, which explicitly targets the local database, then run `pnpm supabase:lint`.
- Regenerate `packages/infrastructure/supabase/src/generated/database.types.ts` from the applied local database after accepted schema changes. Generated types are an Infrastructure projection, not an authoring surface.
- Treat schema diff output as a draft. DML, some grants, policy alterations, view properties, publications, comments, and other PostgreSQL details may require explicit reviewed migration SQL.

## Expert operating loop

1. Read the narrow current contract and inspect the pinned CLI version. For version-sensitive work, consult the current Supabase changelog/docs and discover CLI syntax with `--help`.
2. Establish the target explicitly. Prefer `--local`; never rely on defaults when a command also supports `--linked`.
3. Edit `schemas/` first. Do not make canonical changes in Studio or ad hoc SQL and expect declarative diffing to recover them.
4. If no persistent environment has applied the baseline, consolidate the ordered schemas into the one timestamped local-development baseline. Otherwise generate one forward Draft migration. Review all SQL and add unsupported PostgreSQL objects explicitly rather than assuming the diff engine captured them.
5. Review Data API reachability and row authorization separately: grants expose operations; RLS, constraints, triggers, and command functions enforce valid rows and transitions.
6. For views or privileged functions, verify invoker/definer semantics, `search_path`, ownership, default `PUBLIC` execute, and selective grants. Never solve a permission error by adding `SECURITY DEFINER` blindly.
7. Prove the change from an empty local database with `pnpm supabase:verify`; compare the accepted migration replay back to `schemas/`, inspect focused logs on failure, and regenerate types instead of hand-editing projections.
8. Keep the baseline or forward migration, schema files, pgTAP attack-path tests, and directly affected adapters/contracts in the same reviewed change. Stop when the observable contract is proven.

After a local reset, wait for the relevant containers to become healthy before testing through the API gateway. If the gateway returns `502` or `invalid upstream`, inspect bounded Kong and target-service logs; a stale local container address is an operations fault, not evidence that schema or seed data should change. Restart only the affected disposable local service (or the local stack) and repeat the same observable request.

## pgTAP operating model

pgTAP is the database behavior boundary, not a source-code snapshot test. A modern test starts a transaction, installs/uses pgTAP, declares an exact `plan`, builds only its own deterministic actors and rows, exercises the same role/JWT/RPC or Data API-facing SQL boundary as the application, calls `finish()`, and rolls back.

- Test grants and RLS separately. Use catalog/privilege assertions for reachability and realistic `anon`/`authenticated` statements for row behavior.
- For every denied attack path, include a legitimate positive control through the same boundary. Assert stable SQLSTATEs or outcomes; avoid brittle full error text unless it is itself a contract.
- Set `request.jwt.claim.sub` explicitly when acting as `authenticated`; reset role and claims before changing actor class.
- Security changes cover existing and proposed state, cross-scope isolation, forged attribution, peer/higher-role mutation, continuity invariants, and command provenance when relevant.
- Test files may run after `seed.sql`, but MUST NOT depend on its demo IDs or row counts. Transactions and rollback keep suites order-independent and leave local demo data unchanged.
- Run the narrow file first while developing, then `pnpm supabase:test`, followed by reset/lint/types in `pnpm supabase:verify`.

## Seed contract

Seed execution occurs after migrations. It may create stable local identities and representative collaboration data, but it must be deterministic, minimal, fully qualified, and compatible with the pinned local Auth schema. Login-capable Auth rows are an internal-schema coupling: verify them with a real local password grant after reset and revisit them when upgrading Supabase CLI/GoTrue. Never use `--include-seed` for production or treat seeded credentials as authorization evidence.

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
