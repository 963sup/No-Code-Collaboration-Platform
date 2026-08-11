# No-Code Collaboration Platform

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

GitHub is a semantic benchmark, not an implementation template. `Repository` is the collaboration boundary for data, pages, workflows, documents, tasks, settings, members, permissions, and activity history—not a Git code store.

## Executable architecture

```text
apps/web
├── packages/application
├── packages/infrastructure/supabase
└── packages/ui

packages/infrastructure/supabase ── implements ──> packages/application ports
packages/application ────────────────────────────> packages/domain
supabase/schemas ────────────────────────────────> PostgreSQL / RLS
```

- `packages/domain` owns business truth.
- `packages/application` owns commands, queries, and provider-neutral use-case ports.
- `packages/infrastructure/supabase` is the current infrastructure adapter. It maps Supabase DTOs and generated database projections to application/domain contracts without exposing Supabase clients or database types.
- `packages/ui` owns source-controlled shadcn/ui primitives and design tokens.
- `apps/web` is the Next.js delivery boundary and composition root.
- `supabase/schemas` owns current database truth; migrations are reviewed deployment history.

The dependency path is `Next.js Entry → Application → Port ← Supabase Adapter`. Supabase is the current infrastructure provider, not the system architecture.

## Next.js route groups

The web app uses one root layout and three route groups:

- `(public)` — public product surfaces, including `/`.
- `(auth)` — identity flows, including `/sign-in`.
- `(app)` — authenticated collaboration surfaces under the real `/app` URL segment.

Route groups clarify layout and access context but do not become URL segments or domain boundaries.

## Technology baseline

Node.js 24, pnpm, Turborepo, strict TypeScript, Next.js App Router, React, Tailwind CSS, source-owned shadcn/ui, Supabase Auth/PostgreSQL/RLS, Vitest, pgTAP, Playwright, oxfmt, oxlint, Knip, Lefthook, GitHub Actions, Vercel, and Supabase Cloud.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm hooks:install
pnpm env:check
pnpm verify:full

pnpm supabase:start
pnpm supabase:verify
pnpm test:e2e
pnpm supabase:stop
```

Product meaning is defined in [`docs/PRODUCT.md`](./docs/PRODUCT.md). Documentation starts at [`docs/README.md`](./docs/README.md), production operations at [`docs/operations/RUNBOOK.md`](./docs/operations/RUNBOOK.md), and Codex Desktop configuration at [`docs/CODEX_DESKTOP.md`](./docs/CODEX_DESKTOP.md).
