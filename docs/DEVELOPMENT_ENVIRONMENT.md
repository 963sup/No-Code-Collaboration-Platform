# Development Environment

The repository is optimized for Codex Desktop by minimizing tool choice and making verification machine-readable.

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

1. Enable Corepack on the workstation.
2. Run `pnpm install` to create/update `pnpm-lock.yaml` from the pinned root dependencies.
3. Run `pnpm hooks:install` once per clone.
4. Run `pnpm env:check` to verify required workstation tools with bounded JSON output.
5. Install the Playwright Chromium binary with `pnpm browser:install` only when E2E work begins.

Network access remains disabled inside the default Codex workspace sandbox. Dependency installation, browser installation, remote GitHub access, and mutable infrastructure operations should therefore be explicit operations rather than silent side effects.

## Verification contract

Use only these default gates:

- `pnpm verify:fast` — formatting, linting, and strict TypeScript checks.
- `pnpm verify:full` — fast verification plus dead-code/dependency analysis with Knip.
- `pnpm test:e2e` — Playwright behavioral verification when E2E tests exist.

`ast-grep` is installed but is not part of the default gate until the repository has a real architecture invariant worth encoding as a structural rule. Do not create rules merely to justify the tool.

## Database contract

Supabase CLI is installed as the database lifecycle tool. Once a local Supabase schema exists, generate TypeScript types with `pnpm supabase:types:local`. Generated database types are evidence derived from schema and must not be hand-authored as substitutes for a missing schema.

## Scaling rule

Do not add Turbo while the repository has a single package/workspace. Introduce task orchestration only after two or more independently buildable workspaces create a real dependency graph or affected-build problem.

Do not add ESLint, Prettier, Biome, Husky, lint-staged, Nx, Prisma, Drizzle, dependency-cruiser, or Madge unless a demonstrated gap cannot be solved by the existing toolchain.
