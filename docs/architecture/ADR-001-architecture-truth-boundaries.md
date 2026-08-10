# ADR-001: Architecture graph and truth boundaries

- Status: Accepted
- Date: 2026-08-11
- Decision owner: Repository owner
- Affected scopes: pnpm workspaces, Turbo, domain, application, web, Supabase, generated database types

## Decision

Use Turbo as the application architecture graph over pnpm workspace packages. `packages/domain` owns business truth; `supabase/schemas` owns current database truth; migrations record deployment history; `types/database.types.ts` is a generated projection; RLS enforces database row access; application code orchestrates use cases; and web code delivers those use cases.

## Problem and success condition

The repository needs stable ownership and dependency direction before feature code creates accidental coupling. The decision succeeds when the first implemented vertical slice places each rule, schema change, enforcement policy, orchestration step, and delivery adapter in exactly one responsible boundary, and Turbo exposes the declared package graph without reverse dependencies.

## Evidence ledger

### Observations

- The repository already uses pnpm workspaces, Supabase CLI, strict TypeScript, and repository-owned verification.
- Supabase initialization creates a declarative schema entry point, migration history, and generated-type workflow with distinct purposes.
- No bounded-context internals, application package, or web application have yet been accepted.

### Constraints

- `Repository` remains a no-code collaboration container.
- Domain code must not depend on Supabase, application orchestration, or web delivery.
- Grants and RLS are separate database controls, and exposed tables require deliberate access policies.
- Generated artifacts and migration history cannot silently become current business or database truth.

### Assumptions

- A modular monolith with explicit package dependencies is sufficient for the current horizon.
- The first delivery mechanism will benefit from use-case orchestration that is separate from domain decisions.

### Unknowns

- The first accepted bounded context and vertical slice.
- Whether application and web require one package each or several packages after real responsibilities emerge.
- Which database schemas beyond the initial declarative entry point will be necessary.

### Value choices

- Prefer explicit ownership and one-way dependencies over delayed structural cleanup.
- Prefer an initially sparse graph over empty packages invented for symmetry.

## Minimum sufficient model

The dependency direction is `web -> application -> domain`. Delivery translates external requests; application coordinates a use case; domain makes business decisions. Persistence adapters translate between application/domain contracts and Supabase. Declarative SQL in `supabase/schemas` is the current database model. Reviewed changes generate append-only migrations, applied schema generates TypeScript types, grants expose APIs, and RLS enforces row access. Turbo reads workspace manifests and task declarations; it does not own business semantics.

The principal trust boundary is between public delivery code and server/database authority. Web clients never receive secret or service-role credentials and never bypass reviewed application and database authorization boundaries.

## Alternatives and counterfactuals

- Delay package boundaries until multiple deployables exist: cheaper immediately, but predicts business, orchestration, delivery, and persistence rules will accumulate without a stable owner.
- Treat database schema as the domain model: reduces translation code, but makes persistence constraints the owner of business language and weakens portability and testability.
- Scaffold domain, application, and web packages immediately: makes the desired picture visible, but creates empty abstractions before a real use case can validate their contracts.

The chosen intervention establishes only the domain and database truth boundaries now; application and web packages appear when executable responsibilities exist.

## Consequences

Benefits include explicit ownership, one-way dependency review, reproducible task-graph inspection, and clear separation of current truth, history, enforcement, and projections. Costs include translation across boundaries and maintaining schema, migrations, types, and policies consistently. The decision is reversible at package boundaries before substantial implementation, but moving established business truth into persistence or delivery later would have a larger blast radius.

## Falsification conditions

Reopen this decision if two real vertical slices cannot follow the declared dependency direction without duplicated business decisions, circular package dependencies, or application code that merely forwards database operations without orchestration. Reopen the package granularity if independently buildable responsibilities cannot be represented without unrelated packages changing together.

## Minimum discriminating test

Implement one authorization-sensitive vertical slice. Require one domain invariant, one declarative schema change, explicit grants and RLS, one generated-type update, one application use case, and one web delivery path. The test passes when Turbo reports an acyclic package graph, domain tests run without Supabase or web, and the behavioral flow passes through application and database enforcement. Stop and reopen the earliest invalid boundary on any reverse dependency or duplicated decision.

## Follow-up contract changes

- Root `AGENTS.md` owns the truth-boundary invariants.
- `docs/DEVELOPMENT_ENVIRONMENT.md` owns the operational graph and generation commands.
- `pnpm-workspace.yaml` and `turbo.json` expose the executable graph.
- `supabase/config.toml` points at `supabase/schemas/*.sql`.
- Future application and web package manifests must declare dependency direction explicitly.
