# Development Environment

The repository is optimized for Codex Desktop by minimizing tool choice and making instructions, session context, workspace topology, database lifecycle, and verification machine-readable.

## Required workstation tools

- Node.js 24.x
- pnpm 11.20.0 through Corepack
- Git
- ripgrep (`rg`) for low-cost repository search
- jq for bounded JSON inspection
- Supabase CLI 2.111.0 from the pinned workspace dependency
- A running Docker-compatible container runtime for the local Supabase stack

Recommended workstation tools:

- GitHub CLI (`gh`) for local GitHub inspection
- Serena for semantic symbol navigation and refactoring
- JetBrains IDE with the Serena JetBrains backend when semantic refactors justify the startup cost

Repomix is intentionally on-demand only. It is useful for architecture snapshots or exporting repository context, but it must not replace direct repository retrieval.

## Bootstrap

1. Trust the repository in Codex so project `.codex/` configuration, rules, hooks, and agents can load.
2. Enable Corepack on the workstation.
3. Run `pnpm install --frozen-lockfile` for a deterministic install from the committed `pnpm-lock.yaml`.
4. Start a Docker-compatible container runtime before database work.
5. Run `pnpm hooks:install` once per clone.
6. Run `pnpm env:check` to verify required workstation tools with bounded JSON output.
7. Run `pnpm codex:check` to validate repository-owned Codex agents, skills, hooks, scoped instructions, and workspace contracts.
8. Run `pnpm supabase:start` only when local database work begins.
9. Install the Playwright Chromium binary with `pnpm browser:install` only when E2E work begins.

Network access remains disabled inside the default Codex workspace sandbox. Dependency installation, browser installation, remote GitHub access, linked Supabase operations, and mutable infrastructure operations are explicit operations rather than silent side effects. Codex web search uses indexed mode for current external evidence without enabling shell networking.

## Current database environment

The only provisioned database runtime is the disposable Supabase CLI local stack used by developer workstations and GitHub Actions.

- No Supabase Cloud project is provisioned.
- `supabase/config.toml` configures local services; its `project_id` distinguishes local containers and is not a Cloud project reference.
- The sole checked-in migration is a reviewed replay candidate, not evidence of remote deployment. `20260814190012_local_development_baseline.sql` remains replaceable while the project is purely local; the first identified persistent application freezes it, after which future accepted changes append migrations.
- A future persistent environment requires the provisioning gate in [`operations/RUNBOOK.md`](./operations/RUNBOOK.md) and the decision in [`architecture/ADR-005-local-first-supabase-lifecycle.md`](./architecture/ADR-005-local-first-supabase-lifecycle.md).

## Codex project boundaries

- `project_root_markers` anchors Codex at the directory containing `pnpm-workspace.yaml`, `turbo.json`, and `.git`, including when a session starts inside a workspace package.
- Project `.codex/config.toml` is loaded only after the repository is trusted; machine-local auth, provider, profile, notification, and telemetry settings stay outside the repository.
- The shell environment policy keeps Codex's automatic KEY, SECRET, and TOKEN name exclusions active before commands run. Required credentials must be provided only through an explicit, approved boundary.
- Root and nested `AGENTS.md` files provide durable instruction layers. Codex walks from the project root to the current directory and loads at most one instruction file per directory; nearer instructions override broader guidance.
- Project-scoped custom agents live in `.codex/agents/`: `architecture_auditor`, `change_reviewer`, and `openai_docs_researcher`.
- `openai_docs_researcher` uses the official OpenAI Developer Docs MCP server as a read-only evidence source for version-sensitive Codex and OpenAI behavior.
- Repository skills live in `.agents/skills/`. Use `workspace-impact-analysis` when package manifests, workspace patterns, Turbo tasks, or cross-package dependencies change.
- `.codex/hooks.json` runs one bounded `SessionStart` hook. It reports the branch, changed-path count, lockfile/dependency availability, and up to twelve workspace packages. It supplies observations only and is never a product or architecture authority.
- Project-local `.codex/rules/` encode command approval boundaries. Read-only inspection may be allowed; linked or destructive Supabase mutations remain approval-gated or forbidden.

Use subagents selectively. They are useful when independent read-only analysis lowers uncertainty; they are wasteful when a deterministic check already answers the question.

## Verification contract

Use these default gates:

- `pnpm codex:check` — repository-owned Codex and workspace configuration contract.
- `pnpm verify:fast` — Codex contract, formatting, linting, and strict TypeScript checks.
- `pnpm verify:full` — fast verification plus dead-code and dependency analysis with Knip.
- `pnpm supabase:verify` — explicitly rebuild the local database from accepted migrations, then run database linting, pgTAP, and generated-type consistency checks. Requires the local Supabase stack prerequisites.
- `pnpm supabase:types:local` — regenerate the TypeScript projection from the applied local schema after accepted schema changes.
- `pnpm test:e2e` — Playwright behavioral verification when E2E tests exist.
- `pnpm turbo:graph` — bounded workspace package discovery before cross-package changes.

`ast-grep` remains outside the default gate until the repository has a proven architecture invariant worth encoding as a structural rule. Do not create rules merely to justify the tool.

## Workspace and task graph

The pnpm workspace root is always included; `pnpm-workspace.yaml` lists only child package patterns. Workspace cycles and unmatched filters fail instead of becoming warnings or silent no-ops.

Package manifests own architecture nodes and dependency direction. Internal package dependencies use the `workspace:` protocol. `turbo.json` owns task relationships over that package graph and includes shared TypeScript and lint configuration in task hashes.

A package receives a Turbo task only when its `package.json` exposes a real executable script. Do not add placeholder build, lint, typecheck, or test scripts to make the graph appear complete. Before a cross-package change:

1. run `pnpm turbo:graph`;
2. inspect only the affected manifests and scoped instructions;
3. identify direct dependencies and dependents;
4. run the narrowest package tasks that can falsify the change.

`packages/domain` is the business-truth boundary. `packages/application` orchestrates use cases and defines provider-neutral ports. `packages/infrastructure/supabase` implements those ports for the selected adapter. `apps/web` delivers use cases and wires adapters only in its composition boundary. Add a package or dependency edge only when a real responsibility and executable contract justify it.

## Database contract

Supabase CLI is the local database lifecycle tool.

```text
supabase/schemas
= current desired database state

supabase/migrations before persistent application
= one consolidated local-development baseline

supabase/migrations after persistent application
= frozen baseline plus append-only accepted transitions

local migration ledger
= transitions applied to the current disposable local database

remote migration ledger
= future environment-specific applied-state evidence
```

Do not alternate between declarative and imperative schema authoring on a per-change basis.

For a normal schema change:

1. Read `supabase/AGENTS.md` and edit the appropriate file under `supabase/schemas/`.
2. Generate the migration from the declared state with `supabase db diff -f <descriptive-name>`.
3. Review the generated SQL as a Draft. Schema diffing does not reliably capture every PostgreSQL object or DML change.
4. Run `pnpm supabase:reset` to prove accepted migrations recreate the local database from scratch.
5. Run `pnpm supabase:lint`.
6. Regenerate `packages/infrastructure/supabase/src/generated/database.types.ts` with `pnpm supabase:types:local` when the applied local schema affects generated types.
7. Commit the declarative schema and reviewed migration together; the merged file is Accepted, not remotely Applied.

Do not make canonical schema changes through Studio, the SQL editor, or ad hoc local SQL and then expect declarative diffing to recover them.

Default package scripts and ordinary CI are local-only. They must not include remote project credentials or invoke `supabase link`, `supabase db push`, `supabase db pull`, `supabase db reset --linked`, remote SQL, or equivalent persistent-environment mutation. Adding a remote path requires a separately accepted deployment workflow, explicit user intent, and the runbook provisioning gate.

Tables exposed through the Data API require deliberate grants and RLS. Authentication is not authorization: `TO authenticated` must still be paired with predicates that enforce resource ownership or capabilities. Never use user-editable metadata as an authorization source, never expose service-role credentials to public clients, and treat `SECURITY DEFINER` as a privileged exception rather than a permission workaround.

Once the local schema is applicable, generate `packages/infrastructure/supabase/src/generated/database.types.ts` instead of hand-authoring substitutes; generated database types are projections and must not become schema or domain truth.

Do not add ESLint, Prettier, Biome, Husky, lint-staged, Nx, Prisma, Drizzle, dependency-cruiser, or Madge unless a demonstrated gap cannot be solved by the existing toolchain.
