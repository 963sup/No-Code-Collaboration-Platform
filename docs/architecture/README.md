# Architecture

## Purpose

This directory owns current target architecture for a platform whose Product truth is defined by `docs/PRODUCT.md`.

GitHub supplies mature collaboration, ownership, organization, authorization, URL/IA, and interaction evidence. Architecture implements admitted Product/Domain semantics; it does not translate benchmark feature catalogs by default.

## Current invariants

1. Repository is the only primary no-code collaboration and authorization Container.
2. Repository ownership, Actor identity, Principal authority, Membership, Context, Resource containment, and authorization are distinct.
3. Every Repository has exactly one typed Owner: User or Organization.
4. Both ownership modes share collaboration, Resource, Capability, Process, and Evidence semantics.
5. Organization is a Membership/administration Scope and possible Owner, not an authenticated Actor or mandatory Repository parent.
6. Selected Context may filter or explain access but cannot alter persisted authorization facts.
7. Product/Domain contracts own semantics; generated diagrams, route trees, migrations, generated types, and implementation snapshots are projections.
8. No bounded context, service, datastore, integration, or generic abstraction exists until necessity and lifecycle ownership are demonstrated.
9. `packages/domain` owns business truth and pure decision logic.
10. `packages/application` owns use cases and provider-neutral Ports.
11. `packages/infrastructure/supabase` implements Ports and owns provider clients, DTO mapping, SQL-facing projections, and generated types.
12. `apps/web` owns delivery and composition only; provider wiring is limited to `apps/web/src/composition`.
13. `packages/ui` owns presentation primitives and cannot define Product semantics.
14. `supabase/schemas` is desired database truth; migrations are replayable transition history; generated database types are Infrastructure projections.
15. RLS and database constraints enforce concrete reachability and transitions but do not replace Domain/Application authorization explanation.
16. Operation Capability and delegation authority are distinct.
17. Hard deletion remains unavailable until lifecycle contracts define containment fate, retention, restore/redaction, Evidence, and recovery.
18. Page, Issue, and Discussion are Repository-contained Resource kinds with subtype-specific commands and invariants.
19. Canonical human routing uses one shared User/Organization Owner namespace.
20. Stable IDs remain authorization and relationship targets; public human URLs use Owner and Repository slugs.
21. Repository reads cannot inherit an authenticated-only wrapper while public visibility is accepted.
22. Route Groups, Parallel Routes, Intercepting Routes, layouts, dialogs, and filters are presentation mechanisms only.
23. Concrete Resource commands, Expected Revision where required, State Transition, Current State, and Activity Event form the collaboration mutation kernel.
24. A failed command changes neither state nor success Evidence.
25. Activity Event is historical Evidence, not current state, authority, Notification, or a user-authored history object.
26. State Comparison is an optional derived Projection only after retained states are independently justified.
27. No generic history graph, alternate state line, convergence operation, movable state pointer, or source-control-shaped Product primitive is accepted.
28. Typed transfer and Repository duplication are deferred until separate Product decisions prove authority, lifecycle, and safety.
29. Project planning, Notification, Search, Explore, Marketplace, and Audit are non-owning Projections.
30. Governance constrains future action; Audit explains or proves past action.

Current mutation architecture is owned by [ADR-014](./ADR-014-current-state-collaboration-kernel.md). [ADR-013](./ADR-013-core-no-code-data-semantic-envelope.md) is superseded history.

## Dependency direction

```text
apps/web
   │
   ├──────────────> packages/ui
   │
   ▼
packages/application
   │
   ▼
packages/domain

packages/infrastructure/supabase
   │              │
   └──────────────┴──> application/domain contracts
```

Domain and Application never depend on Web or Supabase implementation.

## Repository ownership architecture

```text
User ──────────┐
               ├── owns ──> Repository ── contains ──> Resource
Organization ──┘
```

Persistence target:

```text
repositories.owner_user_id         nullable FK → auth.users
repositories.owner_organization_id nullable FK → organizations
CHECK exactly one Owner reference is present
```

Do not replace strong typed references with weak generic Owner persistence without proven additional Owner kinds and equal integrity.

Human Owner namespace:

```text
User.username ───────┐
                     ├─ globally unambiguous Owner namespace
Organization.slug ───┘
```

Human names are routing identifiers. Authorization and historical relationships use stable IDs. Reserved root paths cannot be claimed as Owner slugs.

## Repository authority architecture

```text
Personal ownership
Repository.owner_user_id = Actor.userId
→ admin authority

Organization governance
Repository.owner_organization_id = Organization O
+ Actor Organization role ∈ {admin, owner}
→ admin authority for O-owned Repository

Direct User Grant
→ assigned Repository Role

Public visibility
→ accepted read baseline
```

Ordinary Organization Membership contributes no Repository Role.

Application authorization input:

```text
{ actorId, repositoryId }
```

The authority adapter resolves ownership from Repository facts. Callers do not supply `organizationId` as a premise.

Capability is decision truth. A highest Role may explain nested bundles but cannot independently grant delegation authority.

## Current-state collaboration architecture

```text
Browser / Server Action
→ Application command
→ Actor identity
→ RepositoryAccessReader(actorId, repositoryId)
→ Domain Capability decision
→ concrete Resource transition
→ Expected Revision check or accepted serialization strategy
→ command-specific provider adapter / PostgreSQL RPC
→ RLS + constraints + target preconditions
→ Current State mutation + required Activity Event
→ authorized read Projection
```

Required laws:

- command validation and authorization occur against current stable identity;
- stale revision fails closed;
- state and required success Evidence commit atomically;
- no UI hiding substitutes for enforcement;
- raw authenticated table writes are not an alternate command API;
- provider DTOs and generated database types remain Infrastructure details.

A Resource may adopt real-time coauthoring or transaction serialization instead of explicit Expected Revision only through its own accepted contract. That choice never creates another state line or Product history graph.

## Canonical Repository Web architecture

```text
/dashboard
/repos
/issues
/issues/assigned
/projects
/discussions
/notifications
/search?q=&type=&owner=&repository=&status=&sort=&page=
/explore?sort=&ownerType=&artifact=&page=
/marketplace?category=&page=

/{ownerSlug}
/{ownerSlug}?tab=repositories|stars|projects
/{ownerSlug}/{repositorySlug}
/{ownerSlug}/{repositorySlug}/issues
/{ownerSlug}/{repositorySlug}/issues/{issueNumber}
/{ownerSlug}/{repositorySlug}/projects
/{ownerSlug}/{repositorySlug}/discussions
/{ownerSlug}/{repositorySlug}/discussions/{discussionNumber}
/{ownerSlug}/{repositorySlug}/wiki
/{ownerSlug}/{repositorySlug}/wiki/{pageId}
/{ownerSlug}/{repositorySlug}/activity
/{ownerSlug}/{repositorySlug}/security
/{ownerSlug}/{repositorySlug}/settings

/orgs/{organizationSlug}/dashboard
/orgs/{organizationSlug}/people
/orgs/{organizationSlug}/teams
/organizations/{organizationSlug}/settings/profile
/organizations/{organizationSlug}/settings/audit-log
/organizations/{organizationSlug}/settings/custom-properties
```

Shared Owner namespace resolution:

```text
/{ownerSlug}
→ OwnerProfileReader
→ safe Owner projection
→ private.repository_owner_namespaces
→ exactly one { kind: user | organization, stableOwnerId }
```

URL shape never determines Owner kind. Owner profile existence does not disclose private Repository content.

Delivery ownership:

```text
apps/web/src/app/
├─ (public)/
├─ (auth)/
├─ (authenticated)/
│  ├─ dashboard/
│  ├─ repos/
│  ├─ issues/assigned/
│  ├─ projects/
│  ├─ discussions/
│  ├─ notifications/
│  ├─ orgs/[organizationSlug]/
│  └─ organizations/[organizationSlug]/settings/
└─ (owner)/
   └─ [ownerSlug]/
      ├─ page.tsx
      └─ [repositorySlug]/
         ├─ layout.tsx
         ├─ page.tsx
         ├─ issues/
         ├─ projects/
         ├─ discussions/
         ├─ wiki/
         ├─ activity/
         ├─ security/
         ├─ settings/
         ├─ @sidebar/
         └─ @modal/
```

Route Group names do not appear in Product URLs. `(authenticated)` is access composition. `(owner)` owns public Owner and nested Repository delivery and cannot inherit an authenticated-only wrapper.

`apps/web/src/routing` owns pure URL construction/parsing. `apps/web/src/navigation` owns IA/navigation manifests. Provider wiring remains in `apps/web/src/composition`.

Repository presentation is one Owner/Repository header, primary navigation, one active child resource surface, and only proven route-specific supporting regions.

```text
Owner / Repository      Visibility
----------------------------------
Overview   Issues   Projects   Discussions   Wiki   Activity   Security   Settings
----------------------------------
route-specific support | active child resource | route-specific support
```

Wiki is a presentation URL over Page/Knowledge. It creates no separate aggregate or history model. Stable Page IDs remain command and authorization targets.

No public stable-ID Repository compatibility namespace is established. A future compatibility route requires a demonstrated obligation and access-aware resolution.

## Projection architecture

- Project-style planning reads already-authorized work and owns no source Artifact.
- Notification delivery revalidates Repository access before title, count, snippet, or URL.
- Search filters by authorization before ranking, count, or snippet.
- Explore reads public Repository metadata only.
- Marketplace is reviewed catalog metadata; it exposes no connection success without App/Installation contracts.
- Activity, Audit, Feed, and Analytics project Evidence but cannot rewrite it.
- Query, tab, selected Context, comparison input, planning filter, and Notification state never create authority.

## Deferred architecture

No architecture is authorized yet for:

- Team Principal or Team Grant persistence;
- Enterprise cross-Organization governance;
- App/Installation, OAuth, credentials, connector execution, or webhook authority;
- Project entity or detail identity;
- generic State Comparison storage;
- typed Data Transfer;
- Repository duplication, upstream synchronization, or source ancestry;
- a generic version-control or automation engine;
- destructive Repository or Resource lifecycle beyond accepted contracts.

## Architecture update test

Before adding a boundary:

1. identify the independently owned problem;
2. prove current Product/Domain contracts cannot express it;
3. identify identity, owner, lifecycle, invariants, authority, failure behavior, and removal cost;
4. reject provider or benchmark vocabulary as authority;
5. design the smallest reversible boundary;
6. add a discriminating test that would fail if the boundary is unnecessary or unsafe; and
7. register any target-to-executable mismatch.

See [ADR index](./ADR_INDEX.md), [Product Contract](../PRODUCT.md), [Ontology](../ONTOLOGY.md), [Domain catalog](../domains/README.md), and [gap register](../IMPLEMENTATION_GAPS.md).
