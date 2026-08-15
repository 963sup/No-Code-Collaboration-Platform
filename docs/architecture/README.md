# Architecture

## Purpose

This directory holds current target architecture for a platform whose only Product axiom is:

> **Repository = No-Code Collaboration Container**

GitHub supplies mature collaboration, ownership, organization, authorization, URL/IA, and interaction evidence. Architecture implements the accepted Product/Domain model; it does not translate benchmark feature catalogs into architecture by default.

## Current invariants

1. `Repository` is the primary No-Code Collaboration Container.
2. Repository ownership, Actor identity, Principal authority, Membership, Context, Resource containment, and authorization are distinct concepts.
3. Every Repository has exactly one typed Owner: User or Organization.
4. User-owned and Organization-owned Repositories share the same collaboration, Resource, Capability, Process, and historical-evidence semantics.
5. Organization is a Membership/administration Scope and possible Repository Owner; it is not a mandatory Repository parent or collaboration Container.
6. Enterprise, if later accepted, governs Organizations and does not become a Repository Owner or content Principal by implication.
7. A UI-selected Context may filter/explain access but cannot alter server-side authorization facts.
8. GitHub is a semantic benchmark; target Domain/persistence semantics are independently admitted by Product contracts.
9. Generated diagrams, framework route trees, migrations, generated types, and implementation snapshots cannot override Product/Domain contracts.
10. No bounded context, service, datastore, integration, or generic abstraction exists until necessity and lifecycle ownership are demonstrated.
11. Turbo projects coarse workspace architecture from actual pnpm package dependencies; ontology labels do not create packages.
12. `packages/domain` owns business truth and pure decision logic.
13. `packages/application` owns use cases and provider-neutral Ports.
14. `packages/infrastructure/supabase` implements Ports and owns provider clients, DTO mapping, SQL-facing projections, and generated database types.
15. `apps/web` owns delivery/composition only; provider wiring is limited to `apps/web/src/composition`.
16. `packages/ui` owns presentation primitives and cannot define Product semantics.
17. `supabase/schemas` is desired database truth; migrations are replayable transition history; generated database types are projections.
18. Grants and RLS enforce database reachability/access but do not replace Domain/Application authorization explanation.
19. Operation Capability and delegation authority are distinct; authority mutation evaluates Actor authority, current Role, proposed Role, and governance invariants.
20. Selected provider is not proof of a provisioned environment; migration artifact is not proof of applied deployment; local/CI verification is not production validation.
21. Organization, Repository, and Resource hard deletion remain unavailable to end-user roles until lifecycle contracts define containment fate, retention, restore/redaction, history, and recovery.
22. Page is the first accepted Resource kind. Its command contract requires Domain Capability decision, independent RLS, exact content semantics, optimistic concurrency, and required same-transaction historical evidence.
23. Issue and Discussion are dedicated Repository-contained Resource lifecycles. Both use Repository-local atomic numbers, typed state, expected-version commands, Capability decisions, and same-transaction Activity Evidence; their subtype tables and relationships must not weaken the Page envelope.
24. Shared Resource persistence remains acceptable for Page only while its exact subtype invariants remain explicit; Issue must not weaken the Page envelope into a generic JSON bucket.
25. Canonical human routing uses the globally unambiguous shared User/Organization Owner namespace; /{ownerSlug} resolves Owner kind and stable identity, while /{ownerSlug}/{repositorySlug} resolves stable Repository UUID for Application authorization/RLS/evidence.
26. `Resource` is a Domain abstraction, not a required public URL segment. Concrete accepted Resource kinds own product navigation surfaces.
27. Stable Repository IDs remain internal authorization/data identities; no public stable-ID compatibility namespace exists without a demonstrated backward-compatibility obligation.
28. Accepted Page writes enter PostgreSQL through command-specific `SECURITY INVOKER` RPCs; raw authenticated table writes are not an alternate Page command API.
29. Repository authority resolution is owner-neutral: callers supply stable Actor + Repository identity; authority resolves personal ownership, Organization governance, direct Grant, visibility, and future constraints.
30. Current Repository visibility is `private | public`; no other visibility state is accepted without explicit effective-access semantics.
31. Current canonical Repository presentation is one Owner/Repository header, primary navigation, one active child resource surface, and only those route-specific supporting regions whose independent recovery, loading, or responsive behavior is proven.
32. Route Groups, Parallel Routes, Intercepting Routes, and framework layouts are presentation/access composition only. They do not create Product URL, Container, Artifact, or Domain boundaries.
33. Canonical Repository reads cannot inherit an authenticated-only wrapper because public Repository visibility is an accepted anonymous read baseline.
34. An obsolete Organization-only Repository UI tree may not coexist with canonical Owner routing.
35. Data Commit, Data Branch, Data Diff, Change Proposal, Data Transfer, Data Capsule, and Repository Derivation are accepted Product semantics but authorize no concrete lifecycle, persistence, API, route, Capability, or UI. Source Code, Git mechanics, arbitrary execution, and generic version-control/automation engines remain rejected.
36. Project planning, Notification delivery, Search, Explore, Integrations, Team explanation, Enterprise explanation, and Audit are non-owning Projections. They cannot own Repository Artifacts, authority, or source Evidence.
37. Structural containment, Data Branch selection, Change Proposal participation or approval, Project filters, Notification state, Context, and Projection cannot create or change authority.

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

Domain/Application never depend on Web or Supabase implementation.

## Repository ownership architecture

Repository ownership is a typed Relationship:

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

Do not replace these strong concrete references with weak generic Owner persistence unless later evidence proves a stable additional Owner abstraction with equal integrity.

Human Owner namespace:

```text
User.username ───────┐
                     ├─ globally unambiguous Repository owner namespace
Organization.slug ───┘
```

Human names are routing identifiers. Authorization and historical relationships target stable IDs.

Root product paths are reserved and cannot be claimed as Owner namespaces.

## Repository authority architecture

Current accepted sources:

```text
Personal ownership
Repository.owner_user_id = Actor.userId
→ Repository admin authority

Organization governance
Repository.owner_organization_id = Organization O
+ Actor Organization role ∈ {admin, owner}
→ Repository admin authority

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

The authority adapter resolves Repository ownership from Repository facts. Callers do not supply `organizationId` as an ownership premise.

Capability remains decision truth; a highest Role can only be an explanation projection while bundles remain nested.

## Canonical Repository Web architecture

The Web executable route tree preserves admitted GitHub URL/IA instead of inventing provider-neutral aliases. Domain vocabulary and URL vocabulary remain separate when the mature URL solves a presentation problem independently from Git or Code.

```text
/dashboard                              # authenticated personal dashboard
/repos                                  # authenticated Repository discovery
/issues                                 # entry alias
/issues/assigned                        # authenticated assigned-Issue inbox
/projects                               # planning Projection
/discussions                            # discussion discovery
/notifications                          # actor delivery Projection
/search?q=&type=&owner=&repository=&status=&sort=&page=
/explore?sort=&ownerType=&artifact=&page=
/marketplace?category=&page=

/{ownerSlug}                             # shared User/Organization public identity
/{ownerSlug}?tab=repositories|stars|projects
/{ownerSlug}/{repositorySlug}            # Repository identity
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

Shared Owner namespace resolution is a server-side read boundary:

```text
/{ownerSlug}
→ OwnerProfileReader
→ Supabase safe Owner projection
→ private.repository_owner_namespaces
→ exactly one { kind: user | organization, stableOwnerId }
→ render User or Organization identity projection
```

The URL shape never determines Owner kind. The safe projection exposes only public profile fields. Repository lists under an Owner profile are separately filtered by current Repository visibility/authority; profile existence never implies visibility of private Repository content.

Delivery ownership:

```text
apps/web/src/app/
├─ (public)/         # public static/discovery surfaces
├─ (auth)/           # identity/protocol surfaces
├─ (authenticated)/  # authenticated-only global GitHub-aligned surfaces
└─ (owner)/          # shared /{ownerSlug} identity and nested Repository delivery
   └─ [ownerSlug]/
      ├─ page.tsx
      └─ [repositorySlug]/
```

Route Group names do not appear in Product URLs. `(authenticated)` is access composition only. `(owner)` cannot inherit an authenticated-only wrapper because both public Owner profiles and public Repository visibility are accepted anonymous read baselines. Repository reads cannot inherit an authenticated-only wrapper when public Repository visibility is accepted.

`apps/web/src/routing` owns pure URL construction/parsing. `apps/web/src/navigation` owns IA/navigation manifests. Provider wiring remains in `apps/web/src/composition`; route code never receives a raw Supabase client or generated database type.

Repository shell:

```text
Owner / Repository      Visibility
----------------------------------
Overview   Issues   Projects   Discussions   Wiki   Activity   Security   Settings
----------------------------------
route-specific support | active child resource | route-specific support
```

Wiki is a presentation URL over the existing Page Resource family. It does not create a Wiki Domain aggregate. Page stable IDs remain command/authorization targets even when the presentation path uses `/wiki/{pageId}`.

No public stable-ID Repository compatibility namespace is currently established. Stable Repository UUIDs are internal Application/authorization/evidence identities, not human navigation. An Organization-only semantic Repository route is not a valid compatibility UI. If a future backward-compatibility obligation introduces a `legacyPath` redirect, it must perform access-aware resolution before disclosing or redirecting to canonical Owner/Repository identity and must never own a second Repository UI.

Creation remains `/new`. Organization creation remains `/organizations/new`; GitHub's intervening commercial plan-selection URL is intentionally not copied while Billing/Licensing is deferred.

## Page collaboration boundary

Accepted Page command path:

```text
Browser / Server Action
→ Application Page command
→ Actor identity
→ RepositoryAccessReader(actorId, repositoryId)
→ Domain Capability decision
→ Page writer
→ command-specific PostgreSQL RPC
→ RLS + target preconditions
→ Page state transition + required Activity Event
→ read projection
```

The Web never authorizes by hiding controls.

Provider DTO/row types remain inside Infrastructure.

## Auth/Web ownership

Delivery responsibilities:

```text
src/routing/auth-routes.ts
= identity URL classification and safe post-auth destination policy

src/app/(auth)/**
= human/protocol identity delivery surfaces

src/composition/**
= provider/session wiring
```

`/auth/confirm` is one protocol URL with one physical Route Handler. Duplicate physical handlers for the same URL are invalid.

A top-level `src/auth` helper directory is not an Identity Domain and should disappear once routing consumers use `src/routing/auth-routes.ts` directly.

## Repository creation surface

Target creation URL:

```text
/new
```

Creation is an authenticated delivery/use-case surface, not a new Container.

It must support:

- personal User Owner namespace;
- Organizations the Actor may administer for Repository ownership;
- Repository name and owner-scoped slug;
- optional description;
- `private | public` visibility.

Creating a Repository derives owner authority from the ownership Relationship. It does not create a synthetic direct Grant for the Owner.

Creation responsibility is intentionally split:

```text
Browser / Server Action
→ authenticated Actor
→ RepositoryCreationAccessReader returns Owner and Membership-role facts
→ Domain Access Policy evaluates repository.create on User | Organization Owner Scope
→ authorized Owner
→ Repository command validates and constructs the Repository draft
→ RepositoryWriter performs an authenticated INSERT
→ RLS independently enforces the same Owner-scoped policy
→ /{ownerSlug}/{repositorySlug}
```

The Access Policy owns **who may create**. Repository Collaboration owns **how a valid Repository is created**. The pre-identity `repository.create` Capability is not part of any existing Repository Role bundle.

## Database truth lifecycle

```text
Product / Domain contracts
        ↓
supabase/schemas              # desired state
        ↓
reviewed migration transition
        ↓
local PostgreSQL replay
        ↓
pgTAP / lint / generated types
        ↓
Infrastructure projection
```

Generated types are regenerated; never hand-edited as Product truth.

Security-definer helper functions remain in a non-exposed private schema with controlled grants/search path. RLS remains independent enforcement.

## Validation boundary

A green CI job proves only what its checks exercise.

Minimum Repository browser journey:

```text
verified Actor
→ /dashboard
→ click Repository card
→ /{owner}/{repository}
→ Wiki
→ Page create/open/update
→ Activity
```

Ownership validation must include both User-owned and Organization-owned Repository paths once creation is executable.

Database validation must prove:

- owner namespace uniqueness across User/Organization;
- personal Owner authority;
- Organization governance authority scoped only to Organization-owned Repositories;
- ordinary Organization Membership does not create Repository authority;
- public read baseline does not become write authority;
- required Page state/evidence atomicity; and
- generated database types match the replayed desired state.

## Decision process

Use `ADR_TEMPLATE.md` for decisions changing Product ownership projection, public routing, authorization, persistence, system boundaries, or irreversible technology choices.

Current Architecture truth is this README plus accepted current Domain/Product contracts and executable evidence. ADRs explain decision history; they never remain current merely because they were once accepted.

## Decision history

Read `ADR_INDEX.md` before individual ADRs.

- ADR-003 is superseded; its former four persistent workspace panes are not current Repository architecture.
- ADR-008 is historical evidence of the intermediate Organization-only semantic-route decision.
- ADR-009 remains current for controlled Page write boundaries.
- ADR-010 owns current Repository ownership and canonical Owner/Repository route identity.
- ADR-011 owns the admitted GitHub public presentation baseline and route-specific responsive Parallel/Intercepting Route composition.
- ADR-012 owns the accepted Issue/Discussion lifecycle persistence and the non-owning Project/Notification/Search/Explore/Integration projection boundaries; ADR-013 supersedes only its former rejection of no-code Data semantics.
- ADR-013 owns the Product-level semantic envelope for Data Change, Exchange, and Repository Derivation without authorizing implementation.

No final bounded-context map is declared. Domain modules require coherent business ownership/lifecycle evidence rather than symmetry with ontology labels.
