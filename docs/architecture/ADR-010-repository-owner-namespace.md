# ADR-010: Repository Owner Namespace and Owner-Neutral Semantic Routing

- Status: Accepted
- Date: 2026-08-14
- Decision owner: Product and Architecture
- Affected scopes: Product ontology, Repository ownership, authorization, PostgreSQL schema/RLS, Application ports, Next.js routing, browser contracts

## Decision

Repository ownership is exactly one typed Owner:

```text
Repository Owner = User | Organization
```

Canonical human Repository URLs use:

```text
/{ownerSlug}/{repositorySlug}
```

The Owner segment resolves one globally unambiguous User username or Organization slug. Repository stable UUID remains the identity used by relationships, authorization, and historical evidence.

Ownership is an authority source; it is not represented by a fabricated direct Grant.

## Why this decision exists

The earlier executable baseline made Organization ownership mandatory and used an authenticated `/app` prefix as Repository human identity. That implementation shortcut was incorrectly promoted into Product meaning.

The Product axiom does not require an Organization parent:

> **Repository = No-Code Collaboration Container**

The mature GitHub owner/Repository mental model demonstrates that personal and Organization ownership can share one Repository interaction grammar. The target therefore models ownership independently from Repository containment and explicit Grants.

## Success condition

- User-owned and Organization-owned Repositories are first-class.
- Both ownership modes use one Repository collaboration/Resource/Capability model.
- Owner/Repository URL is unambiguous across User and Organization Owner kinds.
- Application authorization input is owner-neutral.
- Persistence preserves strong concrete Owner references.
- `/app` is dashboard/discovery rather than Repository identity.
- Canonical Repository presentation is one Owner/Repository header, primary navigation, and one active child content surface.
- Public Repository reads do not inherit an authenticated-only dashboard wrapper.

## Evidence ledger

### Observations

- Repository containment does not imply an Organization parent.
- User and Organization are durable Owner identities for the current target.
- Organization-only persistence leaked into routing and authorization call signatures.
- Ordinary Organization Membership currently creates no Repository read baseline.
- Therefore the active visibility vocabulary is `private | public`.
- Page collaboration can be scoped to stable Repository identity independent from Owner kind.

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
                     ├─ one global Owner namespace → /{owner}/{repository}
Organization.slug ───┘
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
apps/web/src/app/(repository)/[ownerSlug]/[repositorySlug]/
├─ layout.tsx
├─ page.tsx
├─ pages/
└─ activity/
```

Route Group names do not appear in the Product URL.

The Repository layout owns one shared Repository shell:

```text
Owner / Repository      Visibility
----------------------------------
Overview   Issues   Projects   Discussions   Pages   Activity   Security   Settings
----------------------------------
active child content
```

`/app` remains authenticated Repository discovery/dashboard only.

A stable-ID compatibility namespace may perform access-aware resolution and redirect to canonical URL. It cannot own a second Repository UI.

## Rejected alternatives

### Organization-only ownership

Rejected because it confuses one enterprise ownership mode with a Repository constraint and forces Organization into unrelated URL/authorization semantics.

### Nullable Organization plus ad hoc User field without an Owner contract

Rejected because it creates nullable ambiguity without a typed ownership invariant, namespace contract, authorization correction, or route correction.

### Generic polymorphic Owner persistence

Rejected while two concrete Owner types provide stronger relational integrity.

### Authenticated dashboard prefix as Repository identity

Rejected because dashboard delivery state is not part of Owner/Repository product identity and would incorrectly constrain public Repository reads.

## Consequences

Benefits:

- personal and organizational collaboration are symmetrical around Repository;
- URL/IA reflects Owner/Repository product ontology;
- authorization no longer requires callers to know Owner type;
- inactive visibility semantics are removed; and
- Repository presentation can follow the same interaction grammar across ownership modes.

Costs:

- database desired state and replay history require ownership conversion;
- generated database types and adapters change;
- route trees and browser tests move; and
- product identity requires a personal Owner namespace identifier.

Risks:

- User/Organization namespace migration can collide if not globally coordinated;
- canonical child routes can fail hard navigation if they cannot independently resolve the Repository target;
- personal Owner and Organization-governance authority can drift if not tested independently in Domain/RLS; and
- public Repository delivery can regress if it accidentally inherits an authenticated-only layout.

## Falsification conditions

Reopen if:

- a demonstrated third Owner kind cannot be represented safely by typed ownership;
- globally unique User/Organization Owner namespace is unacceptable for the target product;
- personal and Organization-owned Repositories require contradictory collaboration semantics; or
- `/{owner}/{repository}` cannot coexist with required top-level Product routes under explicit namespace reservation.

## Minimum discriminating test

1. User-owned and Organization-owned Repositories can use the same Repository slug under different Owner namespaces.
2. User username and Organization slug collisions are rejected.
3. Personal Owner gets Repository admin without a Grant.
4. Organization admin/owner gets admin only on that Organization-owned Repository; ordinary member does not.
5. Repository card from `/app` lands on `/{owner}/{repository}`.
6. Stable-ID compatibility route redirects to that canonical URL.
7. Every implemented child route supports direct hard navigation through the same Repository shell; the accepted target set is Overview, Issues, Projects attachment list, Discussions, Pages, Activity, Security posture, and Settings.
8. Page create/update/activity continues through the owner-neutral route and authorization boundary.
