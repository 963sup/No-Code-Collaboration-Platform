# Architecture

## Purpose

This directory holds the current target architecture for a platform that reverse-engineers mature GitHub product semantics and rebuilds them from first principles, with Repository defined as a no-code collaboration container.

## Current invariants

1. `Repository` is the primary no-code collaboration Container, not a Git/code store.
2. Repository ownership, Actor identity, Principal authority, Membership, Context, Resource containment, and authorization are distinct concepts.
3. Every Repository has exactly one typed Owner: User or Organization.
4. User-owned and Organization-owned Repositories share the same collaboration, Resource, Capability, Process, and history semantics.
5. Organization is a membership/administration Scope and possible Repository Owner; it is not a mandatory Repository parent or collaboration Container.
6. Enterprise, if later accepted, governs Organizations and does not become a Repository Owner by implication.
7. A UI-selected Context may filter/explain access but cannot alter server-side authorization facts.
8. GitHub is a semantic benchmark. Domain/persistence semantics are independently derived; mature owner/repository URL, IA, navigation, and interaction conventions are preferred when the same target relationship exists and Git/code assumptions are absent.
9. Generated diagrams and implementation snapshots cannot override Product/Domain contracts.
10. No bounded context, service, datastore, integration, or generic abstraction exists until necessity/ownership is demonstrated.
11. Turbo projects the coarse application architecture graph from pnpm workspace packages/dependencies.
12. `packages/domain` owns business truth; `packages/application` owns use cases/Ports; `apps/web` is delivery/composition only.
13. `packages/infrastructure/supabase` is the selected adapter; `supabase/schemas` owns desired database state; migrations are replayable transition history; generated types are infrastructure projections; grants/RLS enforce DB reachability/access.
14. Supabase clients/DTOs/generated database types do not cross into Domain/Application/UI. Next.js wires adapters only at composition boundaries.
15. `packages/ui` owns presentation primitives; UI libraries do not define Product semantics.
16. Next.js Route Groups express layout/access presentation only; they are not URL/domain boundaries.
17. Next.js Parallel Route slots express simultaneous presentation responsibilities inside one Repository. They never create Domain entities, principals, authorization contexts, or independent Containers.
18. Every persistent Parallel Route slot, including implicit `children`, has a meaningful hard-navigation fallback.
19. Operation Capability and delegation authority are distinct; role mutation evaluates Actor authority, current Role, proposed Role, and governance invariants.
20. Organization owner continuity remains protected while an Organization exists.
21. Selected provider is not proof of provisioned environment; migration artifact is not proof of applied migration; local/CI verification is not production validation.
22. Organization, Repository, and Resource hard deletion remain unavailable to end-user roles until accepted lifecycle contracts define containment fate, retention, restore, redaction, history, and recovery.
23. Page is the first executable Resource kind. Page create/update requires Domain Capability decision, independent RLS, exact content semantics, optimistic concurrency, and same-transaction immutable historical facts.
24. Resource subtype shared persistence remains acceptable only while subtype invariants stay explicit and no second subtype proves an independent storage lifecycle.
25. Canonical human Repository routes use the globally unambiguous Owner/Repository namespace; route resolution produces stable Repository UUID for Application authorization/RLS/history.
26. `Resource` is a Domain abstraction, not a required public URL segment. Accepted concrete Resource kinds own their product navigation surface.
27. Legacy UUID Repository URLs may redirect only after access-aware resolution; inaccessible private Repository names must not leak through redirect resolution.
28. Accepted Page writes enter PostgreSQL through command-specific `SECURITY INVOKER` RPCs; raw authenticated Resource writes are not an alternate Page command API, and RLS requires command provenance plus ordinary Actor/Capability authorization.
29. Repository authority resolution is owner-neutral: callers supply stable Actor + Repository identity; the authority layer resolves whether personal ownership, Organization governance, direct Grant, visibility, and future constraints contribute to the decision.
30. `organization` Repository visibility is not current target truth because ordinary Organization Membership provides no accepted read baseline. Current target visibility is `private | public`.

## Repository ownership architecture

Repository ownership is a typed relationship:

```text
User ──────────┐
               ├── owns ──> Repository ── contains ──> Resource
Organization ──┘
```

Persistence target keeps strong concrete references:

```text
repositories.owner_user_id         nullable FK → auth.users
repositories.owner_organization_id nullable FK → organizations
CHECK exactly one owner reference is non-null
```

Do not replace this with a weak generic `owner_type + owner_id` unless later evidence proves a stable owner supertype with stronger integrity.

Human owner namespaces are globally unambiguous:

```text
User.username ───────┐
                     ├─ Repository owner namespace
Organization.slug ───┘
```

This namespace serves routing/presentation. Authorization and historical relationships target stable IDs.

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

The Application Port boundary is:

```text
readRepositoryAuthoritySources({ actorId, repositoryId })
```

not a caller-supplied `organizationId`, because ownership must be resolved from Repository facts rather than injected as an assumption.

## Canonical Repository Web composition

The Repository workspace remains one Next.js App Router Parallel Route composition. The semantic URL identifies one Repository; named slots render simultaneous presentation responsibilities inside that Container.

Canonical Product URL:

```text
/[ownerSlug]/[repositorySlug]/
├── page.tsx                 # implicit children: Repository header/overview
├── default.tsx              # hard-navigation recovery
├── layout.tsx               # renders persistent slots
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

Concrete URLs:

```text
/{owner}/{repository}
/{owner}/{repository}/pages
/{owner}/{repository}/pages/{pageId}
/{owner}/{repository}/activity
```

Examples:

```text
/alice/personal-crm
/acme/customer-success
```

`@slot` names are not URL segments. The first path segment resolves User username or Organization slug; it does not imply Organization ownership.

`/app` remains an authenticated dashboard/presentation surface. It may list accessible Repositories and creation affordances, but `/app` is not part of Repository identity. A dashboard Repository card must link to the canonical Owner/Repository URL.

The legacy `/app/repositories/[repositoryId]/**` namespace is compatibility-only. It resolves access then redirects to canonical Owner/Repository routes and must never own a second Repository UI/business-flow tree.

## Auth/Web ownership cleanup

Delivery code follows responsibility rather than repeated folder names:

```text
src/routing/auth-routes.ts
= auth URL classification / safe redirect policy

src/app/(auth)/**
= auth human/protocol route presentation

src/composition/**
= provider/session wiring
```

`/auth/confirm` remains the public protocol URL but is physically colocated under `(auth)/auth/confirm/route.ts`. A top-level `src/auth` helper directory is not an Auth Domain and should not exist merely because routing helpers contain the word auth.

## Repository creation surface

Authenticated creation is a delivery/use-case projection, not a reason to add a new collaboration Container.

Target `/new` surface:

- personal owner namespace;
- Organizations where Actor may administer Repository creation;
- Repository name/slug/optional description;
- `private | public` visibility.

Creating a Repository derives owner authority from ownership; it does not fabricate a direct User Grant for the owner.

## Next.js navigation behavior

```text
Soft navigation
→ update selected route surface while preserving active sibling slot state

Hard navigation / refresh
→ reconstruct every unmatched persistent slot through meaningful default.tsx recovery
```

Persistent Repository surfaces must recover a meaningful base surface or explicit failure state rather than silently disappear.

## Validation boundary

Green CI does not prove an untested user journey. The Browser contract must explicitly cover:

```text
Sign in / verified Actor
→ /app dashboard
→ click Repository card
→ /{owner}/{repository}
→ Pages
→ Page create/open/update
→ Activity
```

It must also cover personal and Organization ownership paths as they become executable.

## Decision process

Use [`ADR_TEMPLATE.md`](./ADR_TEMPLATE.md) for decisions changing ownership, public routing, authorization, persistence, system boundaries, or irreversible technology choices.

An accepted ADR records why the model changed. It does not replace the canonical Product/Domain/current Architecture contracts.

## Decision history

Read [`ADR_INDEX.md`](./ADR_INDEX.md) before individual ADRs.

- ADR-003 remains current for Parallel Route composition.
- ADR-008 is historical evidence of the intermediate Organization-only semantic-route decision.
- ADR-009 remains current for controlled Page write boundaries.
- ADR-010 owns current Repository ownership and canonical Owner/Repository route identity.

No final bounded-context map is declared. Domain modules continue to require coherent business ownership/lifecycle evidence rather than symmetry with ontology labels.
