# Development Environment

The repository is optimized for Codex Desktop by minimizing tool choice and making instructions, session context, workspace topology, and verification machine-readable.

## Required workstation tools

- Node.js 24.x
- pnpm 11.20.0 through Corepack
- Git
- ripgrep (`rg`) for low-cost repository search
- jq for bounded JSON inspection

Recommended workstation tools:

- GitHub CLI (`gh`) for local GitHub inspection
- Serena for semantic symbol navigation and refactoring
- JetBrains IDE with the Serena JetBrains backend when semantic refactors justify the startup cost

Repomix is intentionally on-demand only. It is useful for architecture snapshots or exporting repository context, but it must not replace direct repository retrieval.

## Bootstrap

1. Trust the repository in Codex so project `.codex/` configuration can load.
2. Enable Corepack on the workstation.
3. Run `pnpm install --frozen-lockfile` for a deterministic install from the committed `pnpm-lock.yaml`.
4. Run `pnpm hooks:install` once per clone.
5. Run `pnpm env:check` to verify required workstation tools with bounded JSON output.
6. Run `pnpm codex:check` to validate repository-owned Codex agents, skills, hooks, scoped instructions, and workspace contracts.
7. Install the Playwright Chromium binary with `pnpm browser:install` only when E2E work begins.

Network access remains disabled inside the default Codex workspace sandbox. Dependency installation, browser installation, remote GitHub access, and mutable infrastructure operations are explicit operations rather than silent side effects. Codex web search uses indexed mode for current external evidence without enabling shell networking.

## Codex project boundaries

- `project_root_markers` anchors Codex at the directory containing `pnpm-workspace.yaml`, `turbo.json`, and `.git`, including when a session starts inside a workspace package.
- The shell environment policy applies Codex's automatic KEY, SECRET, and TOKEN name exclusions before commands run. Required credentials must be provided only through an explicit, approved boundary.
- Root and nested `AGENTS.md` files provide durable instruction layers. A workspace package receives the root instructions plus the nearest package instructions.
- Project-scoped custom agents live in `.codex/agents/`: `architecture_auditor`, `change_reviewer`, and `openai_docs_researcher`.
- Repository skills live in `.agents/skills/`. Use `workspace-impact-analysis` when package manifests, workspace patterns, Turbo tasks, or cross-package dependencies change.
- `.codex/hooks.json` runs one bounded `SessionStart` hook. It reports the branch, changed-path count, lockfile/dependency availability, and up to twelve workspace packages. It supplies observations only and is never a product or architecture authority.

Use subagents selectively. They are useful when independent read-only analysis lowers uncertainty; they are wasteful when a deterministic check already answers the question.

## Verification contract

Use these default gates:

- `pnpm codex:check` — repository-owned Codex and workspace configuration contract.
- `pnpm verify:fast` — Codex contract, formatting, linting, and strict TypeScript checks.
- `pnpm verify:full` — fast verification plus dead-code and dependency analysis with Knip.
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

`packages/domain` is the business-truth boundary. Application packages orchestrate use cases; web packages deliver them. Add a package or dependency edge only when a real responsibility and executable contract justify it.

## Database contract

Supabase CLI is the database lifecycle tool. `supabase/schemas` is current database truth, while `supabase/migrations` records append-only deployment history. Once the local schema is applicable, generate `types/database.types.ts` with `pnpm supabase:types:local`; generated database types are projections and must not be hand-authored as substitutes for schema or domain contracts.

Do not add ESLint, Prettier, Biome, Husky, lint-staged, Nx, Prisma, Drizzle, dependency-cruiser, or Madge unless a demonstrated gap cannot be solved by the existing toolchain.
