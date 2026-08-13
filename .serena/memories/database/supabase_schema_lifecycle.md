# Supabase schema lifecycle and authorization evidence

## Current ownership and cutoff

- `supabase/schemas` is the canonical desired PostgreSQL state.
- `supabase/migrations/20260813145001_initial_collaboration_baseline.sql` is the immutable initial deployment and replay cutoff, compiled in `schema_paths` order from the 11 declarative schema files.
- The pre-baseline migrations were applied only to disposable local/CI databases and were consolidated before any persistent Supabase environment existed. Historical repository evidence may explain that consolidation, but those files are not current replay inputs.
- From the baseline cutoff forward, accepted migrations are append-only. Never rebaseline after a persistent environment has applied the baseline or any later migration.
- A destructive local reset or any future history rewrite still requires explicit approval after naming affected local data and environment evidence.

## `projects: []` environment state

- Supabase MCP returning `projects: []`, together with no local linked-project reference, establishes only the current `LocalOnly` state. It does not authorize creating, linking, or mutating a Cloud project.
- Use explicit local targets for reset, diff, lint, pgTAP, and type generation. A local ledger is replay evidence for that disposable database, never proof of remote application.
- Re-run provider discovery for work whose decision depends on remote state. A future persistent environment must pass the repository provisioning gate before link, push, pull, repair, or other remote mutation.

## Local demo seed

- `supabase/seed.sql` creates the public local-only credentials `sup@a-i.tw` / `Aa12341234` with stable user ID `00000000-0000-0000-0000-00000000d001` and one representative organization, repository, and Page.
- The Auth insert is deliberately pinned to the local GoTrue `v2.194.0` schema. Its legacy token fields use empty strings because password grant scans those fields as strings; revisit this coupling when the pinned CLI/Auth version changes.
- Verify the seed with a real local password grant after reset. Never print the returned tokens, use this seed in a persistent environment, or make pgTAP depend on its IDs or global row counts.
- A post-reset Kong `502` / `invalid upstream` can be caused by a stale disposable Auth container address. Confirm with bounded gateway/service logs, restart the affected local service, and retry before changing SQL.

## Grant invariant

The Data API roles `anon` and `authenticated` must not hold `MAINTAIN`, `REFERENCES`, `TRIGGER`, or `TRUNCATE` on collaboration tables. RLS does not replace this table-level least-privilege boundary.

`supabase/tests/authorization.test.sql` is the executable regression proof. Current table grants are declared by `supabase/schemas/99_rls.sql` and compiled into the baseline.

Do not rely on `supabase db diff` alone for grants: diff engines can miss or normalize ACL details. Verify grants through pgTAP against the real database boundary.

## Verification contract

A correct baseline must satisfy all of these:

- `supabase db reset --local` applies only `20260813145001_initial_collaboration_baseline.sql`.
- `supabase db diff --local --schema public,private` reports no changes against `supabase/schemas`.
- `pnpm supabase:test`, `pnpm supabase:lint`, and `pnpm supabase:types:check` pass.
- Future schema changes start in `supabase/schemas`, generate and review a new migration, then prove empty-database replay.

## Windows Node subprocesses

In repository Node scripts, execute the pinned workspace Supabase CLI as:

`spawnSync(process.execPath, [resolve(process.cwd(), 'node_modules/supabase/dist/supabase.js'), ...args])`

Do not use `spawnSync('pnpm', ...)` on Windows. PATH/PATHEXT can select a stale Bun `pnpm.exe` shim, while directly spawning `pnpm.cmd` returns `EINVAL` under the pinned Node 24 runtime.
