# No-Code Collaboration Platform

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

> **Repository = No-Code Collaboration Container**

This is the Product's single non-negotiable axiom.

The root Product Contract is [`docs/PRODUCT.md`](./docs/PRODUCT.md). It alone owns the axiom, accepted meanings, and non-confusion laws. [`docs/ONTOLOGY.md`](./docs/ONTOLOGY.md) expands those semantics, while [`docs/README.md`](./docs/README.md) routes architecture, Domain, executable-gap, evidence, and operations questions. GitHub remains benchmark evidence, never implementation authority.

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
- `packages/infrastructure/supabase` is the selected infrastructure adapter. It maps provider DTOs and generated database projections to application/domain contracts without exposing provider clients or database types.
- `packages/ui` owns project-controlled UI primitives and design tokens.
- `apps/web` is the Next.js delivery boundary and composition root.
- `supabase/schemas` owns current desired database truth.
- `supabase/migrations` contains reviewed, replayable database transitions. An environment's migration ledger—not the presence of a file—proves that a transition was applied there.

The dependency path is `Next.js Entry → Application → Port ← Supabase Adapter`. Supabase is an infrastructure choice, not the system architecture.

## Database lifecycle

The canonical database execution boundary remains the disposable Supabase CLI local stack used by developer workstations and GitHub Actions. A hosted Supabase provider project may exist independently, but **no Supabase Cloud project is provisioned as an accepted persistent Preview, Staging, or Production database environment**, and the repository database baseline has not been established as Applied there.

```text
supabase/schemas
= current desired database state

supabase/migrations
= accepted replayable database transition history

local db reset + tests
= reproducibility and enforcement evidence

identified persistent environment
+ migration ledger
+ direct provider evidence
= proof that a database transition was applied there
```

Provider-resource existence is not environment acceptance. A migration file, a blank hosted project, or local/CI success does not imply preview or production deployment. Classifying, linking, or mutating a hosted database remains a separate operational decision governed by [`docs/operations/RUNBOOK.md`](./docs/operations/RUNBOOK.md) and ADR-005.

## Next.js route groups

The web app uses one root layout and four delivery groups:

- `(public)` — public product surfaces, including `/`.
- `(auth)` — identity pages and protocol handling.
- `(app)` — authenticated Repository discovery/dashboard under `/app`.
- `(repository)` — canonical `/{ownerSlug}/{repositorySlug}` Repository presentation; read access is resolved by Repository visibility/authority rather than inherited from the authenticated dashboard layout.

Route Group names do not appear in URLs and do not become Domain boundaries.

Canonical Repository presentation is one Owner/Repository header, primary navigation, one active canonical child-resource surface, and only route-specific supporting regions that independently justify their data, navigation, loading, recovery, or modal behavior.

## Technology baseline

Node.js 24, pnpm, Turborepo, strict TypeScript, Next.js App Router, React, Tailwind CSS, project-owned shadcn/ui primitives, Supabase CLI local Auth/PostgreSQL/RLS, Vitest, pgTAP, Playwright, oxfmt, oxlint, Knip, Lefthook, GitHub Actions, and Vercel.

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

Documentation starts at [`docs/README.md`](./docs/README.md), production operations at [`docs/operations/RUNBOOK.md`](./docs/operations/RUNBOOK.md), and Codex Desktop configuration at [`docs/CODEX_DESKTOP.md`](./docs/CODEX_DESKTOP.md).
