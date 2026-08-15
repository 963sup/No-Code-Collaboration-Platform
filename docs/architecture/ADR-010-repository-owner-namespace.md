# ADR-010: Repository Owner Namespace and Owner-Neutral Semantic Routing

- Status: Accepted
- Date: 2026-08-14
- Last reviewed: 2026-08-16
- Decision owner: Product and Architecture
- Affected scopes: Product ontology, Repository ownership, authorization, PostgreSQL schema/RLS, Application ports, Next.js routing, browser contracts

## Decision

Repository ownership is exactly one typed Owner:

```text
Repository Owner = User | Organization
```

User and Organization share one globally unambiguous human Owner namespace:

```text
/{ownerSlug}
/{ownerSlug}/{repositorySlug}
```

`/{ownerSlug}` resolves exactly one User or Organization identity. URL shape never determines kind. `/{ownerSlug}/{repositorySlug}` is the canonical human Repository identity. Stable Owner and Repository UUIDs remain the identities used by relationships, authorization, persistence, and historical evidence.

Ownership is an authority source; it is not represented by a fabricated direct Grant.

## Why this decision exists

The earlier executable baseline made Organization ownership mandatory and used an authenticated `/app` prefix as Repository human identity. That implementation shortcut was incorrectly promoted into Product meaning.

The Product axiom does not require an Organization parent:

> **Repository = No-Code Collaboration Container**

The mature GitHub owner/Repository mental model demonstrates that personal and Organization ownership can share one Repository interaction grammar. The target therefore models ownership independently from Repository containment and explicit Grants.

## Success condition

- User-owned and Organization-owned Repositories are first-class.
- Both ownership modes use one Repository collaboration/Resource/Capability model.
- User and Organization share one unambiguous top-level Owner namespace.
- Application authorization input is owner-neutral.
- Persistence preserves strong concrete Owner references.
- `/dashboard` is authenticated personal discovery and `/repos` is Repository discovery; neither is Repository identity.
- Canonical Repository presentation is one Owner/Repository header, primary navigation, and one active child content surface.
- Public Owner/Repository reads do not inherit an authenticated-only wrapper.
- No public stable-ID compatibility namespace exists without a demonstrated backward-compatibility obligation.

## Evidence ledger

### Observations

- Repository containment does not imply an Organization parent.
- User and Organization are durable Owner identities for the current target.
- Organization-only persistence previously leaked into routing and authorization call signatures.
- Ordinary Organization Membership currently creates no Repository read baseline.
- Current visibility vocabulary is therefore `private | public`.
- Page, Issue, and Discussion collaboration can be scoped to stable Repository identity independent from Owner kind.
- GitHub public User and Organization identity use the same top-level owner/login grammar while operational and governance Organization surfaces use separate URL families.

### Hard constraints

- Exactly one Owner per Repository.
- Ownership, Membership, Principal Grant, Context, and effective authorization remain distinct.
- Stable Repository identity remains the authorization/evidence target.
- Domain/Application remain provider-neutral.
- Current persistence preserves strong User/Organization references.
- Team and Enterprise remain Deferred until discriminating evidence exists.

### Assumptions under validation

- User and Organization are sufficient Owner kinds for the current product horizon.
- One global User/Organization Owner namespace is preferable to ambiguous human routing.
- `private | public` is sufficient until a real Organization-wide access baseline is proven.

### Unknowns

- Future ownership-transfer lifecycle and namespace reservation timing.
- Whether another real Owner kind later justifies an Owner supertype.
- Whether Organization-wide baseline access becomes necessary.

## Minimum sufficient model

```text
User ──────────┐
               ├── owns ──> Repository ── contains ──> Resource
Organization ──┘
```

Persistence target:

```text
repositories.owner_user_id         nullable FK
repositories.owner_organization_id nullable FK
CHECK exactly one Owner reference is active
```

Routing target:

```text
User.username ───────┐
                     ├─ one global Owner namespace → /{ownerSlug}
Organization.slug ───┘
                                           │
                                           └─ /{ownerSlug}/{repositorySlug}
```

Authority target:

```text
Personal Owner == Actor
→ Repository admin authority

Organization owns Repository
+ Actor Organization role owner/admin
→ Repository admin authority

Direct User Grant
→ assigned Repository Role

Public visibility
→ read baseline
```

Application authority query:

```text
(actorId, repositoryId)
```

The caller does not supply ownership as an assumption.

## Canonical Web projection

```text
apps/web/src/app/
├─ (authenticated)/
│  ├─ dashboard/page.tsx          # /dashboard
│  └─ repos/page.tsx              # /repos
└─ (owner)/
   └─ [ownerSlug]/
      ├─ page.tsx                 # /{ownerSlug}
      └─ [repositorySlug]/
         ├─ layout.tsx
         ├─ page.tsx
         ├─ wiki/
         └─ activity/
```

Route Group names do not appear in the Product URL. `(owner)` contains both the shared Owner identity projection and nested Repository identity because the first path segment is one persisted Owner namespace.

The Repository layout owns one shared Repository shell:

```text
Owner / Repository      Visibility
----------------------------------
Overview   Issues   Projects   Discussions   Wiki   Activity   Security   Settings
----------------------------------
active child content
```

`/dashboard` and `/repos` are discovery surfaces, not Repository identity.

There is no public stable-ID compatibility namespace. If a future compatibility obligation appears, it must be access-aware, redirect-only, and must never own a second Repository UI.

## Rejected alternatives

### Organization-only ownership

Rejected because it confuses one enterprise ownership mode with a Repository constraint and forces Organization into unrelated URL/authorization semantics.

### Nullable Organization plus ad hoc User field without an Owner contract

Rejected because it creates nullable ambiguity without a typed ownership invariant, namespace contract, authorization correction, or route correction.

### Generic polymorphic Owner persistence

Rejected while two concrete Owner types provide stronger relational integrity.

### Authenticated dashboard prefix as Repository identity

Rejected because dashboard delivery state is not part of Owner/Repository product identity and would incorrectly constrain public Repository reads.

### URL prefix as Owner-kind discriminator

Rejected because User and Organization share one Owner identity grammar. Kind is a persisted resolution result, not a URL convention.

## Consequences

Benefits:

- personal and organizational collaboration are symmetrical around Repository;
- URL/IA reflects Owner/Repository product ontology;
- authorization no longer requires callers to know Owner type;
- inactive visibility semantics are removed; and
- Repository presentation can follow the same interaction grammar across ownership modes.

Costs:

- database desired state and replay history require one shared namespace registry;
- generated database types and adapters project that registry;
- route trees and browser tests must preserve root-route reservations; and
- product identity requires a personal Owner namespace identifier.

Risks:

- User/Organization namespace migration can collide if not globally coordinated;
- root Product routes can collide with Owner slugs if reservations drift;
- personal Owner and Organization-governance authority can drift if not tested independently in Domain/RLS; and
- public Owner/Repository delivery can regress if it accidentally inherits an authenticated-only layout.

## Falsification conditions

Reopen if:

- a demonstrated third Owner kind cannot be represented safely by typed ownership;
- globally unique User/Organization Owner namespace is unacceptable for the target product;
- personal and Organization-owned Repositories require contradictory collaboration semantics; or
- `/{owner}/{repository}` cannot coexist with required top-level Product routes under explicit namespace reservation.

## Minimum discriminating test

1. User-owned and Organization-owned Repositories can use the same Repository slug under different Owner namespaces.
2. User username and Organization slug collisions are rejected.
3. `/{ownerSlug}` resolves persisted `kind: user | organization`; URL shape does not decide kind.
4. Personal Owner gets Repository admin without a Grant.
5. Organization admin/owner gets admin only on that Organization-owned Repository; ordinary member does not.
6. Repository card from `/dashboard` lands on `/{owner}/{repository}`.
7. No public stable-ID Repository route exists without an explicitly accepted compatibility obligation.
8. Every implemented child route supports direct hard navigation through the same Repository shell; current knowledge presentation is `/wiki` while Domain semantics remain Page/Knowledge.
