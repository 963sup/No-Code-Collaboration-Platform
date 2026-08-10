# Development Environment

The repository is optimized for Codex Desktop by minimizing tool choice and making instructions, session context, and verification machine-readable.

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

Repomix is intentionally on-demand only. It is useful for architecture snapshots or exporting repository context, but it should not replace direct repository retrieval.

## Bootstrap

1. Trust the repository in Codex so project `.codex/` configuration can load.
2. Enable Corepack on the workstation.
3. Run `pnpm install` to create or update `pnpm-lock.yaml` from the pinned root dependencies.
4. Run `pnpm hooks:install` once per clone.
5. Run `pnpm env:check` to verify required workstation tools with bounded JSON output.
6. Run `pnpm codex:check` to validate repository-owned Codex agents, skills, hooks, and instruction scopes.
7. Install the Playwright Chromium binary with `pnpm browser:install` only when E2E work begins.

Network access remains disabled inside the default Codex workspace sandbox. Dependency installation, browser installation, remote GitHub access, and mutable infrastructure operations should therefore be explicit operations rather than silent side effects. Codex web search uses indexed mode for current external evidence without turning shell networking on.

## Codex-native configuration

- Root and nested `AGENTS.md` files provide durable instruction layers. Confirm the active chain with `codex --ask-for-approval never "Summarize the current instructions."` from the intended directory.
- Project-scoped custom agents live in `.codex/agents/`: `architecture_auditor`, `change_reviewer`, and `openai_docs_researcher`.
- Repository skills live in `.agents/skills/`. In Codex CLI or the IDE extension, use `/skills` or type `$` to invoke one explicitly; matching descriptions also allow implicit activation.
- `.codex/hooks.json` runs a bounded `SessionStart` hook that reports lockfile and dependency availability. It supplies dynamic context only and is not a policy or architecture source.
- Codex detects skill changes automatically; restart Codex if new configuration, agents, hooks, or skills do not appear.

Use subagents selectively. They are valuable when independent read-only analysis lowers uncertainty; they are wasteful when a single deterministic check answers the question.

## Verification contract

Use only these default gates:

- `pnpm codex:check` — repository-owned Codex configuration contract.
- `pnpm verify:fast` — Codex contract, formatting, linting, and strict TypeScript checks.
- `pnpm verify:full` — fast verification plus dead-code and dependency analysis with Knip.
- `pnpm test:e2e` — Playwright behavioral verification when E2E tests exist.

`ast-grep` is installed but is not part of the default gate until the repository has a real architecture invariant worth encoding as a structural rule. Do not create rules merely to justify the tool.

## Database contract

Supabase CLI is installed as the database lifecycle tool. `supabase/schemas` is current database truth, while `supabase/migrations` records append-only deployment history. Once the local schema is applicable, generate `types/database.types.ts` with `pnpm supabase:types:local`; generated database types are projections and must not be hand-authored as substitutes for schema or domain contracts.

## Architecture graph

Turbo reads the pnpm workspace package graph as the application architecture graph. Package manifests own dependency direction; `turbo.json` owns task relationships. `packages/domain` is the business-truth boundary, application packages orchestrate use cases, and web packages deliver those use cases. Add a package or task edge only when a real responsibility and executable contract justify it.

Do not add ESLint, Prettier, Biome, Husky, lint-staged, Nx, Prisma, Drizzle, dependency-cruiser, or Madge unless a demonstrated gap cannot be solved by the existing toolchain.
