# Supabase Database Scope

This subtree owns declarative PostgreSQL truth, replayable transitions, local seed data, Auth templates, and independent database enforcement. Domain owns business truth; `packages/infrastructure/supabase` owns TypeScript provider adapters.

## Environment boundary

- The selected adapter and a provisioned environment are separate facts. At the current verified LocalOnly boundary, no Supabase Cloud project is provisioned; re-check provider state whenever a remote decision depends on it.
- File presence, local reset, migration replay, or CI success MUST NOT be described as proof of remote deployment.
- Default package scripts and ordinary CI MUST NOT contain remote credentials or invoke remote link, pull, push, reset, SQL, or equivalent persistent-environment mutation.
- Creating, linking, or mutating a persistent environment requires explicit user intent, current provider discovery, an identified lifecycle role, and the Operations Runbook/ADR-005 gates.

## Ownership and workflow

- `schemas/` is current desired database truth. Author accepted changes there first.
- `migrations/` is replayable transition history. Its local-baseline versus frozen append-only lifecycle is owned by its nested instructions.
- `tests/` proves grants, RLS, constraints, triggers, commands, and attack paths through the real SQL boundary.
- `templates/` owns provider-rendered Auth presentation only. `seed.sql` contains minimal deterministic local/test data and never production data or reusable credentials.
- Generated database types are Infrastructure projections. Regenerate them from the applied local database; never hand-edit them.
- Prove accepted changes from an empty local database with `pnpm supabase:verify`. Keep directly affected schema, migration, pgTAP, generated types, and adapter contracts consistent.

## Shared security invariants

- Data API reachability and row authorization are separate: grants expose operations; RLS and database constraints enforce valid rows and transitions.
- Authentication is not authorization. Never derive authority from user-editable metadata or presentation context.
- UPDATE protection must constrain both visible existing state and permitted proposed state where ownership or scope must remain invariant.
- Prefer invoker semantics. Any privileged function must have an explicit trust boundary, safe `search_path`, selective execution grants, and caller validation where applicable.
- Never expose service-role or secret keys to browser code, logs, fixtures, templates, or telemetry.
