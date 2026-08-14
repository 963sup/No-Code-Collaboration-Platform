# No-Code Collaboration Platform

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

> **Repository = No-Code Collaboration Container**

This is the Product's single non-negotiable axiom.

GitHub is the benchmark for mature ownership, organization, authority, URL/IA, navigation, and collaboration interaction semantics. It is not an implementation template. A GitHub benchmark concept is admitted only when the same collaboration or organizational problem remains valid for an arbitrary no-code Repository. If its value depends on software-development-specific implementation assumptions, the concept is excluded rather than renamed or generically wrapped.

The product uses seven semantic roles as a reasoning lens, not as an entity/package/table taxonomy:

```text
Actor        = who acts
Scope        = which ownership or governance boundary applies
Principal    = who may receive authority
Container    = where collaboration has one stable boundary
Relationship = how actors, principals, scopes, owners, and containers connect
Artifact     = what collaborative work exists inside a container
Process      = how artifacts or relationships validly change
```

Authorization (`Role`, `Capability`, `Policy`), presentation (`Context`, `Projection`), and evidence (`Activity Event`) remain cross-cutting semantics.

Canonical ownership and routing:

```text
Repository Owner = User | Organization
Repository URL   = /{ownerSlug}/{repositorySlug}
/app             = authenticated Repository discovery/dashboard
```

The root Product Contract is [`docs/PRODUCT.md`](./docs/PRODUCT.md). The canonical semantic expansion and admission rules are in [`docs/ONTOLOGY.md`](./docs/ONTOLOGY.md).

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

The only provisioned database runtime is the disposable Supabase CLI local stack used by developer workstations and GitHub Actions. No Supabase Cloud project is provisioned.

```text
supabase/schemas
= current desired database state

supabase/migrations
= accepted replayable database transition history

local db reset + tests
= reproducibility and enforcement evidence

remote migration ledger + provider evidence
= proof that a database transition was applied to that environment
```

A migration file may exist before any hosted database exists. Local or CI success does not imply preview or production deployment. Supabase Cloud remains a deferred durable-hosting candidate until a real persistent-environment requirement and the operational gates in the runbook justify provisioning it.

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
