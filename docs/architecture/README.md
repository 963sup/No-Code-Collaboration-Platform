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
22. Page is the first accepted Resource kind and owns an executable command lifecycle. Page create/update requires Domain Capability decision, independent RLS, exact content semantics, optimistic concurrency, and required same-transaction historical evidence.
23. Issue is the second proven Resource persistence lifecycle: its Repository-local number, status, closed attribution, query shape, and future conversation lifecycle justify a dedicated table. The current Issue slice is SELECT-only; undefined commands fail closed.
24. Shared Resource persistence remains acceptable for Page only while its exact subtype invariants remain explicit; Issue must not weaken the Page envelope into a generic JSON bucket.
25. Canonical human Repository routes use the globally unambiguous Owner/Repository namespace; route resolution produces stable Repository UUID for Application authorization/RLS/evidence.
26. `Resource` is a Domain abstraction, not a required public URL segment. Concrete accepted Resource kinds own product navigation surfaces.
27. Stable-ID Repository compatibility routes may redirect only after access-aware resolution and must not own a second Repository UI.
28. Accepted Page writes enter PostgreSQL through command-specific `SECURITY INVOKER` RPCs; raw authenticated table writes are not an alternate Page command API.
29. Repository authority resolution is owner-neutral: callers supply stable Actor + Repository identity; authority resolves personal ownership, Organization governance, direct Grant, visibility, and future constraints.
30. Current Repository visibility is `private | public`; no other visibility state is accepted without explicit effective-access semantics.
31. Current canonical Repository presentation is one Owner/Repository header, primary navigation, one active child resource surface, and only those route-specific supporting regions whose independent recovery, loading, or responsive behavior is proven.
32. Route Groups, Parallel Routes, Intercepting Routes, and framework layouts are presentation/access composition only. They do not create Product URL, Container, Artifact, or Domain boundaries.
33. Canonical Repository reads cannot inherit an authenticated-only wrapper because public Repository visibility is an accepted anonymous read baseline.
34. An obsolete Organization-only Repository UI tree may not coexist with canonical Owner routing.
35. Commit, Branch, Diff, Pull Request, Actions, and Gist names can enter architecture only through accepted structured-data change or controlled-data-exchange contracts; Source Code, executable transformation, git refs/merge, code review, CI/CD, secret-bearing payloads, and a second Container remain forbidden.

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

The target Web hierarchy normalizes GitHub's observed aliases before composing Repository routes:

```text
/app                                      # authenticated discovery; GitHub `/dashboard` is not copied
/repositories                             # Repository discovery; not GitHub `/repos`
/issues?scope=assigned                    # actor inbox Projection; `assigned` is query state
/projects                                 # planning discovery Projection
/discussions                              # discussion discovery Projection
/notifications                            # actor delivery Projection
/search?q=&type=&sort=&page=              # admitted-resource search; Code Search excluded
/organizations/{organizationSlug}/...     # one governance hierarchy; no split `/orgs` namespace
/settings/profile                         # actor profile management
/settings/organizations                   # Organization membership management
/settings/enterprises                     # Enterprise relationship projection; not Enterprise identity
/settings/appearance                      # presentation preferences
/settings/accessibility                   # accessibility preferences
/settings/billing                         # billing/subscription management
/settings/integrations                    # installed integration management
/settings/applications                    # delegated application authorization management
/settings/programmatic-access             # credential metadata/revocation only; never secret content
```

Repository creation/import and Organization creation are Process entry routes, not stable resource identities. Sign-out is a command, not a bookmarkable resource. Project detail, Team detail, and Enterprise identity routes are not accepted until their independent stable identity and lifecycle are proven.

Product URL:

```text
/{ownerSlug}/{repositorySlug}
/{ownerSlug}/{repositorySlug}/issues
/{ownerSlug}/{repositorySlug}/issues/{issueNumber}
/{ownerSlug}/{repositorySlug}/projects
/{ownerSlug}/{repositorySlug}/discussions
/{ownerSlug}/{repositorySlug}/discussions/{discussionNumber}
/{ownerSlug}/{repositorySlug}/pages
/{ownerSlug}/{repositorySlug}/pages/{pageId}
/{ownerSlug}/{repositorySlug}/activity
/{ownerSlug}/{repositorySlug}/security
/{ownerSlug}/{repositorySlug}/settings
```

Current executable Next.js delivery projection:

```text
apps/web/src/app/
├─ (app)/
│  └─ app/
│     └─ page.tsx                     # authenticated discovery/dashboard
│
├─ (repository)/
│  └─ [ownerSlug]/
│     └─ [repositorySlug]/
│        ├─ layout.tsx                # one Repository shell
│        ├─ page.tsx                  # Overview
│        ├─ issues/
│        │  ├─ page.tsx               # read-only list
│        │  └─ [issueNumber]/page.tsx # full-page detail
│        ├─ pages/
│        │  ├─ page.tsx
│        │  └─ [pageId]/page.tsx
│        ├─ activity/page.tsx
│        ├─ @sidebar/
│        │  ├─ default.tsx
│        │  └─ issues/**              # independent navigation/metadata
│        └─ @modal/
│           ├─ default.tsx
│           └─ (.)issues/[issueNumber]/page.tsx
│
└─ (auth)/                             # human/protocol identity surfaces
```

Route Group names do not appear in Product URLs.

`(app)` is authenticated-only because `/app` is Actor dashboard/discovery.

`(repository)` is not authenticated-only. Each Repository read is visibility/authority-aware; an authenticated mutation still re-establishes Actor identity and evaluates Capability.

Repository shell:

```text
Owner / Repository      Visibility
----------------------------------
Overview   Issues   Projects   Discussions   Pages   Activity   Security   Settings
----------------------------------
route-specific support | active child resource | route-specific support
```

Supporting regions are absent when the active route does not prove a separate navigation, metadata, loading, recovery, or responsive responsibility. They are not persistent workspace panes.

`Context` remains a presentation concept but does not require a permanent pane. Activity is a Repository-scoped projection with a canonical route; a privacy-safe Overview summary may be composed independently only under ADR-011's removal test.

ADR-011 defines the target `@sidebar`, `@activity`, and `@modal` composition. The Issue read slice now proves `@sidebar` as independent route navigation/metadata and `@modal` as canonical soft-navigation presentation; both define defaults and unmatched-navigation clearing behavior. Discussion and any `@activity` composition remain unimplemented. Framework composition mechanisms do not establish new Product responsibilities merely because the framework supports them.

## Compatibility routing

The only accepted Repository compatibility namespace is stable-ID based:

```text
/app/repositories/[repositoryId]/[[...legacyPath]]
```

It must:

1. perform access-aware resolution of the Repository before any redirect;
2. avoid leaking inaccessible private Repository names;
3. translate only supported child destinations;
4. redirect to the canonical Owner/Repository URL; and
5. contain no Repository presentation, business flow, or provider query tree beyond the redirect boundary.

An Organization-only semantic Repository route is not a valid compatibility UI because it encodes a false mandatory-owner assumption.

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
→ /app dashboard
→ click Repository card
→ /{owner}/{repository}
→ Pages
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

No final bounded-context map is declared. Domain modules require coherent business ownership/lifecycle evidence rather than symmetry with ontology labels.
