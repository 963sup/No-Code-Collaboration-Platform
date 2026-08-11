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
8. `packages/domain` owns business truth; `packages/application` orchestrates use cases; `apps/web` is delivery and composition only.
9. `packages/supabase` is an adapter; `supabase/schemas` owns database truth; migrations are deployment history; generated types are projections; grants and RLS enforce database access.
10. `packages/ui` owns source-controlled presentation primitives. shadcn/ui accelerates implementation without defining product semantics.
11. Next.js route groups express layout and access context only; they are neither URL segments nor business boundaries.

## Decision process

Use [`ADR_TEMPLATE.md`](./ADR_TEMPLATE.md) for decisions that change system boundaries, ownership, authorization, persistence, public contracts, or irreversible technology choices.

An accepted ADR must state the decision, evidence, constraints, assumptions, alternatives, consequences, falsification conditions, and validation plan. An ADR records why the model changed; it does not replace the canonical target contract that the decision updates.

## Accepted decisions

- [`ADR-001-architecture-truth-boundaries.md`](./ADR-001-architecture-truth-boundaries.md) defines the architecture graph and source-of-truth boundaries.
- [`ADR-002-executable-application-baseline.md`](./ADR-002-executable-application-baseline.md) defines the initial apps/packages graph, Next.js route groups, shadcn/ui role, and verification chain.

No final bounded-context map is declared yet. Domain modules must continue to be justified by coherent business problems rather than symmetry.
