# Architecture

## Purpose

This directory holds the target architecture for a platform that reverse-engineers mature GitHub product semantics and rebuilds them from first principles, with Repository defined as a no-code collaboration container.

## Current invariants

1. `Repository` is a collaborative resource boundary, not a Git code store.
2. Actor, principal, context, resource, ownership, membership, and authorization are distinct concepts.
3. A UI-selected context may filter or explain access, but it must not alter server-side authorization facts.
4. GitHub behavior is benchmark evidence, not the target contract.
5. Generated diagrams and implementation snapshots cannot override an accepted semantic contract.
6. No bounded context, service, datastore, or integration exists until its necessity and ownership are demonstrated.
7. Turbo projects the application architecture graph from pnpm workspace packages and their declared dependencies.
8. `packages/domain` owns business truth; `packages/application` orchestrates use cases and defines ports; `apps/web` is delivery and composition only.
9. `packages/infrastructure/supabase` is the selected infrastructure adapter; `supabase/schemas` owns current database truth; migrations are replayable transition history; generated types are infrastructure projections; grants and RLS enforce database access.
10. Supabase clients, DTOs, and generated database types do not cross into Domain, Application, or UI. Next.js wires provider adapters only at its composition boundary.
11. `packages/ui` owns source-controlled presentation primitives. shadcn/ui accelerates implementation without defining product semantics.
12. Next.js route groups express layout and access context only; they are neither URL segments nor business boundaries.
13. Next.js Parallel Route slots express simultaneous presentation responsibilities. They never create Domain entities, aggregates, principals, or authorization facts.
14. Every persistent Parallel Route slot, including implicit `children`, has a meaningful hard-navigation fallback.
15. Operation capability and role delegation are distinct. Every role mutation evaluates actor authority, current role, and proposed role.
16. Organization owner is protected governance authority, and every Organization that still exists retains at least one owner.
17. A selected infrastructure adapter is not evidence that an external environment has been provisioned.
18. A migration artifact proves a reviewed transition exists; only an environment-specific migration ledger and provider evidence prove that it was applied there.
19. Local and CI database verification prove reproducibility and enforcement against disposable infrastructure, not preview or production validation.
20. Default package scripts and verification workflows remain local-only until a separately accepted deployment boundary defines environment ownership, credentials, recovery, and evidence.
21. Organization and Repository hard deletion are unavailable to end-user roles until an accepted lifecycle defines containment fate, historical continuity, retention, restore, redaction, and recovery behavior.
22. Page is the first accepted Resource implementation; its create/update commands require explicit Domain Capability decisions, independent RLS enforcement, exact content shape, optimistic concurrency evidence, and same-transaction immutable facts.
23. A Resource subtype may use shared persistence only while its invariants remain explicit and no second subtype proves an independent storage lifecycle.
24. Resource hard deletion remains unaccepted while `GAP-LIFECYCLE-002` is open; the presence of `resource.delete` cannot make an undefined Page lifecycle valid.

## Decision process

Use [`ADR_TEMPLATE.md`](./ADR_TEMPLATE.md) for decisions that change system boundaries, ownership, authorization, persistence, public contracts, or irreversible technology choices.

An accepted ADR must state the decision, evidence, constraints, assumptions, alternatives, consequences, falsification conditions, and validation plan. An ADR records why the model changed; it does not replace the canonical target contract that the decision updates.

## Accepted decisions

- [`ADR-001-architecture-truth-boundaries.md`](./ADR-001-architecture-truth-boundaries.md) defines the architecture graph and source-of-truth boundaries.
- [`ADR-002-executable-application-baseline.md`](./ADR-002-executable-application-baseline.md) defines the initial apps/packages graph, Next.js route groups, shadcn/ui role, and verification chain.
- [`ADR-003-repository-workspace-parallel-composition.md`](./ADR-003-repository-workspace-parallel-composition.md) defines the first Repository Parallel Route workspace, meaningful hard-navigation recovery, and its authorization-aware read boundary.
- [`ADR-004-authority-delegation-invariants.md`](./ADR-004-authority-delegation-invariants.md) separates operation capability from role delegation and defines ownership continuity.
- [`ADR-005-local-first-supabase-lifecycle.md`](./ADR-005-local-first-supabase-lifecycle.md) separates database contracts, replayable migrations, provisioned environments, and applied deployment evidence.
- [`ADR-006-defer-destructive-container-deletion.md`](./ADR-006-defer-destructive-container-deletion.md) removes end-user Organization and Repository hard deletion until explicit lifecycle semantics are accepted.
- [`ADR-007-first-page-resource-vertical-slice.md`](./ADR-007-first-page-resource-vertical-slice.md) defines the first executable Page collaboration loop, explicit authority decision, typed persistence, optimistic concurrency, and immutable fact projection.

No final bounded-context map is declared yet. Domain modules must continue to be justified by coherent business problems rather than symmetry.
