# No-Code Collaboration Platform

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

GitHub is a semantic benchmark, not an implementation template. In this platform, a `Repository` is a no-code collaboration container and the collaboration boundary for data, pages, workflows, documents, tasks, settings, members, permissions, and activity history—not a Git code store.

## Truth boundaries

- `packages/domain` owns business truth: canonical concepts, invariants, state transitions, and domain decisions.
- `supabase/schemas` owns current database truth; `supabase/migrations` records reviewed deployment history.
- `turbo.json` and workspace package manifests express the executable application architecture graph.
- `types/database.types.ts` is generated from the applied database schema and is never edited as domain or schema truth.
- `AGENTS.md` and scoped instruction files own durable repository operating constraints.

## Development baseline

The repository uses Node.js 24, pnpm, Turborepo, strict TypeScript, Supabase CLI/PostgreSQL, oxfmt, oxlint, Knip, Lefthook, and Playwright. Codex Desktop is configured through the trusted project layer under `.codex/`, with bounded session context and read-only documentation sources for OpenAI, version-sensitive dependencies, and Supabase.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm hooks:install
pnpm env:check
pnpm codex:check
pnpm verify:full
```

Database work additionally requires a running Docker-compatible container runtime:

```sh
pnpm supabase:start
pnpm supabase:verify
pnpm supabase:stop
```

## Documentation

- [`docs/README.md`](./docs/README.md) — documentation map and authority order
- [`docs/CODEX_DESKTOP.md`](./docs/CODEX_DESKTOP.md) — Codex Desktop, MCP context routing, and trust boundaries
- [`docs/DEVELOPMENT_ENVIRONMENT.md`](./docs/DEVELOPMENT_ENVIRONMENT.md) — workstation bootstrap and verification contract
- [`docs/architecture/`](./docs/architecture/README.md) — target architecture and ADRs
- [`docs/domains/`](./docs/domains/README.md) — justified bounded-context vocabulary and ownership

Product concepts are added only after a real problem, owner, lifecycle, relationship model, invariant, and falsification condition justify them.
