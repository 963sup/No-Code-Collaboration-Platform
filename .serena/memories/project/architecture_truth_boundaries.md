# Project architecture truth boundaries

## Product and routing truth

- Start from `docs/README.md`; it routes Product, Ontology, current Architecture, gaps, operations, external benchmark evidence, and historical evidence.
- Absolute Product axiom: **Repository = No-Code Collaboration Container**. Repository Owner is `User | Organization`; canonical URL is `/{ownerSlug}/{repositorySlug}`; `/app` is authenticated discovery.
- GitHub is a semantic/UI benchmark, never implementation authority. Admit only collaboration meaning that survives removal of Code Domain assumptions.

## Architecture ownership

- Dependency direction is `apps/web -> packages/application -> packages/domain`; `packages/infrastructure/supabase` implements Application ports; `packages/ui/src` owns presentation primitives only.
- `packages/domain`: pure business invariants and Capability decisions.
- `packages/application`: use cases and provider-neutral ports.
- `packages/infrastructure/supabase`: provider clients, DTO mapping, SQL-facing projections, and generated DB types.
- `apps/web`: Next.js delivery/composition; provider wiring belongs only in `src/composition`.
- `supabase/schemas`: current desired database truth. `supabase/migrations`: one replaceable baseline while LocalOnly, then frozen baseline plus append-only transitions after first persistent application.
- Server/UI context never grants authority; authorization is re-established through Actor + stable Repository identity, Domain/Application explanation, and independent RLS enforcement.

## Memory ownership

- `.serena/memories` is this project's durable project-memory store. Keep only verified, stable, cross-task project facts that are expensive to rediscover.
- Project facts are distilled in place; do not append task logs, transient status, credentials, workstation preferences, or speculative conclusions.
- Codex local memory owns cross-project workstation and operating habits only. It must not duplicate or override Product, Domain, Architecture, URL, authorization, schema, or migration truth stored in this repository and Serena.
- Follow focused memories such as `mem:database/supabase_schema_lifecycle` for detailed lifecycle contracts.

## Verification commands

- Use `pnpm verify:fast` for normal changes, `pnpm verify:full` for integration/reachability changes, and `pnpm supabase:verify` for database replay/security/type consistency.
