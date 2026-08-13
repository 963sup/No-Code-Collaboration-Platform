# No-Code Collaboration Platform

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

GitHub is a semantic benchmark, not an implementation template. `Repository` is the primary no-code collaboration container—not a Git code store. GitHub concepts are adapted by their underlying relationship structure rather than copied by feature name.

The product uses seven core collaboration semantic roles as a reasoning lens, not as an entity/package/table taxonomy:

```text
Actor        = who acts
Scope        = which ownership or governance boundary applies
Principal    = who may receive authority
Container    = where collaboration has one stable boundary
Relationship = how actors, principals, scopes, and containers are connected
Artifact     = what collaborative work exists inside a container
Process      = how artifacts or relationships validly change
```

Authorization (`Role`, `Capability`, `Policy`), presentation (`Context`, `Projection`), and evidence (`Activity Event`) remain cross-cutting semantics. One product concept may play more than one semantic role in different causal positions.

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
- `packages/infrastructure/supabase` is the selected infrastructure adapter. It maps Supabase DTOs and generated database projections to application/domain contracts without exposing Supabase clients or database types.
- `packages/ui` owns source-controlled shadcn/ui primitives and design tokens.
- `apps/web` is the Next.js delivery boundary and composition root.
- `supabase/schemas` owns current database truth.
- `supabase/migrations` contains reviewed, replayable database transitions. An environment's migration ledger—not the presence of a file—proves that a transition was applied there.

The dependency path is `Next.js Entry → Application → Port ← Supabase Adapter`. Supabase is an infrastructure choice, not the system architecture.

## Database lifecycle

The only provisioned database runtime is the disposable Supabase CLI local stack used by developer workstations and GitHub Actions. No Supabase Cloud project is provisioned.

```text
supabase/schemas
= current desired database state

supabase/migrations
= accepted replayable transition history

local db reset + tests
= reproducibility and enforcement evidence

remote migration ledger + provider evidence
= proof that a migration was applied to that environment
```

A migration file may exist before any hosted database exists. Local or CI success does not imply preview or production deployment. Supabase Cloud remains a deferred durable-hosting candidate until a real persistent-environment requirement and the operational gates in the runbook justify provisioning it.

## Next.js route groups

The web app uses one root layout and three route groups:

- `(public)` — public product surfaces, including `/`.
- `(auth)` — identity flows, including `/sign-in`.
- `(app)` — authenticated collaboration surfaces under the real `/app` URL segment.

Route groups clarify layout and access context but do not become URL segments or domain boundaries.

## Technology baseline

Node.js 24, pnpm, Turborepo, strict TypeScript, Next.js App Router, React, Tailwind CSS, source-owned shadcn/ui, Supabase CLI local Auth/PostgreSQL/RLS, Vitest, pgTAP, Playwright, oxfmt, oxlint, Knip, Lefthook, GitHub Actions, and Vercel.

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
