# ADR-002: Executable modular-monolith application baseline

## Status

Accepted

## Decision

Implement the first deployable system as a TypeScript modular monolith with one Next.js application and four coarse-grained package responsibilities:

- `apps/web` — delivery and composition root;
- `packages/domain` — business truth;
- `packages/application` — use-case orchestration and provider-neutral ports;
- `packages/infrastructure/supabase` — current infrastructure adapters and generated database projection;
- `packages/ui` — source-controlled design-system primitives.

Use a single Next.js root layout. Organize delivery contexts with `(public)`, `(auth)`, and `(app)` route groups. Keep a real `/app` segment under `(app)` so the protected application does not collide with the public `/` route.

Adopt shadcn/ui as a source generator and component baseline, not as a black-box runtime framework. Add only primitives required by current flows and keep feature components in `apps/web` until another real consumer justifies extraction.

Use Supabase declarative schemas as current database truth, generated migrations as reviewed deployment history, generated TypeScript types as an infrastructure projection inside `packages/infrastructure/supabase`, and PostgreSQL RLS as database enforcement.

Define system capabilities in `packages/application` before selecting provider implementations. Next.js routes call Application use cases; `apps/web/src/composition` wires those ports to Supabase adapters. Supabase clients, SDK types, DTOs, and `database.types.ts` remain internal to the infrastructure package.

## First-principles basis

The system presently has five distinct change reasons: delivery, business rules, use-case orchestration, infrastructure adaptation, and reusable presentation primitives. These are sufficient to justify five workspace nodes but not enough to justify microservices, one package per domain noun, an independent API app, or a worker app.

Route groups solve layout and access-context organization only. They do not model Organization, Team, Repository, Resource, or authorization.

shadcn/ui reduces primitive implementation time while preserving source ownership, accessibility review, and the ability to simplify or replace components without migrating away from an opaque component library.

Supabase is replaceable infrastructure. Abstracting provider APIs would preserve the wrong boundary; the system instead abstracts capabilities such as `RepositoryReader` and `IdentityProvider`, then lets a Supabase-specific adapter implement them.

## Alternatives rejected

- A single unstructured `src/` tree: lower initial ceremony but no executable dependency direction.
- One package per domain noun: package explosion before bounded contexts are proven.
- Multiple Next.js root layouts: unnecessary full page reloads between groups and duplicated application chrome.
- A separate backend/API app: no independent deployment or public API requirement exists yet.
- Direct Supabase clients in Next.js routes: couples delivery code to provider DTOs, session mechanics, and persistence details.
- A provider-shaped Application API: renames Supabase concepts without defining system capabilities.
- Prisma or Drizzle: would create another competing database-schema authoring surface.
- A prebuilt dashboard template: imports surface design and product assumptions that have not been justified.

## Consequences

- Turbo can schedule real package tasks over an explicit dependency graph.
- Domain and application tests run without Next.js or Supabase.
- Browser, server, and future admin clients remain separate infrastructure concerns.
- Next.js composition creates request-scoped adapters without exposing raw provider clients to routes.
- Database rows and generated database types cannot leak into domain, application, or UI packages.
- UI development starts from accessible primitives but product-specific composition remains local to the app.

## Falsification conditions

Revisit this decision when a new runtime requires independent deployment/scaling, a second app consumes shared delivery contracts, a package has no stable public API or independent change reason, or route groups stop matching actual layout/access contexts.

## Validation

- Unit tests prove role/capability and application-port behavior.
- Architecture checks reject reversed workspace dependencies, provider imports outside composition, and generated-type leakage.
- Supabase tests prove private/public Repository and Resource access behavior.
- Playwright proves `/`, `/sign-in`, and unauthenticated `/app` behavior.
- A clean GitHub Actions run proves deterministic install, build, migration replay, type generation, and browser execution.
