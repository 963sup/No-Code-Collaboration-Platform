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
24. Resource hard deletion is unavailable to end-user roles until an accepted Resource lifecycle defines archive/delete meaning, retention, restore, redaction, historical continuity, subtype consequences, and recovery; the presence of `resource.delete` in authority vocabulary does not create an executable destructive transition.
25. Human-facing Repository routes use the Organization/Repository slug namespace; route resolution produces the stable Repository UUID used by Application authorization and RLS.
26. `Resource` is a Domain abstraction, not a required user-facing URL segment. Accepted concrete Resource kinds own their product navigation surface.
27. Legacy UUID Repository URLs may redirect only after access-aware resolution; inaccessible private Repository names must not be disclosed through redirects.
28. Accepted Page create/update transitions enter PostgreSQL through command-specific `SECURITY INVOKER` RPCs; raw authenticated Resource INSERT/UPDATE is not an alternate Page command API, and RLS requires both short-lived command provenance and ordinary Actor/Capability authorization.

## Canonical Repository Web composition

The current Repository workspace is a Next.js App Router **Parallel Route** composition. The semantic URL identifies one Repository collaboration context; the named slots render simultaneous presentation responsibilities inside that context.

```text
/app/[organizationSlug]/[repositorySlug]/
├── page.tsx                 # implicit children: Repository header
├── default.tsx              # children hard-navigation recovery
├── layout.tsx               # renders all persistent slots
├── @navigation/
│   └── default.tsx
├── @workspace/
│   ├── default.tsx
│   ├── pages/
│   │   ├── page.tsx
│   │   └── [pageId]/page.tsx
│   └── activity/page.tsx
├── @context/
│   └── default.tsx
└── @activity/
    └── default.tsx
```

The layout contract is:

```text
children + @navigation + @workspace + @context + @activity
```

`@slot` names are not URL segments. Concrete child URLs such as `/pages`, `/pages/{pageId}`, and `/activity` select a product surface while the shared Repository layout continues to compose the persistent sibling surfaces.

Next.js navigation behavior is part of the delivery contract:

```text
Soft navigation
→ update the selected route surface while preserving active sibling slot state

Hard navigation / refresh
→ reconstruct every unmatched persistent slot through meaningful default.tsx recovery
```

The repository intentionally uses a stricter rule than a generic nullable Parallel Route fallback: persistent Repository surfaces must recover a meaningful base surface or explicit failure state rather than silently disappear.

The legacy `/app/repositories/[repositoryId]/**` namespace is compatibility-only. It resolves access first and redirects into the semantic namespace; it must never own another Parallel Route workspace.

## Decision process

Use [`ADR_TEMPLATE.md`](./ADR_TEMPLATE.md) for decisions that change system boundaries, ownership, authorization, persistence, public contracts, or irreversible technology choices.

An accepted ADR must state the decision, evidence, constraints, assumptions, alternatives, consequences, falsification conditions, and validation plan. An ADR records why the model changed; it does not replace the canonical target contract that the decision updates.

## Decision history

Use [`ADR_INDEX.md`](./ADR_INDEX.md) before opening individual ADRs. It identifies which decision effects remain current and which historical details were superseded by later decisions.

Current architecture truth is this README plus executable contracts. ADR bodies are decision history and may intentionally retain the route names, implementation vocabulary, or constraints that existed when the decision was made. When a historical ADR example conflicts with a later accepted decision or this current architecture contract, the later/current contract wins.

In particular, [ADR-003](./ADR-003-repository-workspace-parallel-composition.md) remains accepted for Parallel Route composition, while [ADR-008](./ADR-008-repository-semantic-routing.md) supersedes its original UUID route identity and `/resources` vocabulary with the semantic slug namespace and `/pages` surface.

No final bounded-context map is declared yet. Domain modules must continue to be justified by coherent business problems rather than symmetry.
