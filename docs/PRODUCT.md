# Product Contract

- Status: Canonical
- Contract owner: Repository owner
- Scope: Product meaning and semantic boundaries
- Last reviewed: 2026-08-12

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

## Purpose

The platform gives people a stable boundary in which they can create, organize, govern, and evolve collaborative work without requiring Git or code.

The product must answer one coherent question:

> Who acts, under which ownership boundary, inside which collaboration container, on what work unit, with what authority, and with what historical evidence?

The contract succeeds when the same semantic model can explain navigation, ownership, authorization, data design, user-visible behavior, audit history, and production recovery without redefining the same concept in each layer.

## Benchmark method

GitHub is evidence about mature collaboration mechanisms, not the target contract.

For every concept considered from GitHub or another product, record:

1. the root collaboration problem it solves;
2. whether it requires a persistent identity or is only a relationship, role, state, or view;
3. the scope that owns its lifecycle;
4. its relationships and invariants;
5. what breaks if it is removed; and
6. the minimum discriminating test that could reject the proposed model.

A familiar name is not evidence that the concept belongs in this platform.

## Minimum sufficient semantic model

| Term | Canonical meaning | Must not be confused with |
| --- | --- | --- |
| User | Authenticated human actor | Organization, Team, current UI context, or permission |
| Organization | Ownership and administration boundary for collaborative repositories | Authenticated actor or temporary navigation scope |
| Principal | A subject that may receive authority; the minimum implemented principal is a User | Actor identity, role, or selected context |
| Repository | No-code collaboration container and primary resource/authorization boundary | Git repository, source tree, page, or Organization |
| Resource | Repository-scoped unit of collaborative work | Repository itself or an unbounded JSON bucket |
| Grant | Relationship connecting a Principal to a Repository with a Role | User type or global permission |
| Role | Named bundle of Capabilities used for assignment and explanation | Authorization decision primitive |
| Capability | Permission to perform a specific action on a defined target | UI visibility or job title |
| Activity Event | Immutable historical fact produced by an action | Feed item, notification, metric, or mutable status |
| Context | Selected view, filter, or navigation scope | Identity, ownership, or server-side authorization fact |
| Collaborator | Derived label for a User with effective Repository access | Persistent User subtype or independent entity |

The currently implemented authority model has User principals, direct Repository grants, and one explicit governance-derived authority source: an Organization `owner` or `admin` derives Repository `admin` authority for Repositories owned by that Organization. Ordinary Organization membership does not create Repository access. Team/group principals, Organization-wide base permissions for ordinary members, policy caps, and other authority sources require separate evidence before they enter the accepted model.

## Core relationships

- A User may have a Membership relationship with an Organization.
- An Organization owns Repositories.
- A Principal may receive a Grant to a Repository.
- Organization owner/admin governance authority may derive Repository admin authority without fabricating a direct Grant.
- A Repository contains Resources.
- A Role expands into Capabilities.
- An authenticated User performs actions; accepted actions may produce Activity Events.
- Activity feeds, audit views, notifications, achievements, and analytics are projections of events rather than competing historical truths.

## Product invariants

1. `Repository` always means a no-code collaboration container. It never inherits Git semantics by default.
2. GitHub behavior is benchmark evidence. It cannot override an accepted target contract.
3. Every persistent entity must have a distinct identity, lifecycle, owner, invariants, and a demonstrated removal cost.
4. Every Resource belongs to exactly one Repository at a time until an explicit transfer or cross-repository model is accepted.
5. Organization ownership, User membership, Principal grants, Role bundles, and effective Capabilities remain separate relationships even when an accepted governance relationship contributes authority.
6. Authentication proves who the actor is; it does not prove access to a Repository or Resource.
7. Server-side authorization derives from accepted authority sources and constraints. A UI-selected context may filter or explain access but cannot change authorization facts.
8. Capability is the decision primitive. Role is an assignment and explanation mechanism.
9. `Collaborator` and `Outside collaborator` remain derived classifications unless evidence proves an independent lifecycle.
10. Activity Events are append-only historical facts. User-facing feeds and notifications may be rebuilt from them.
11. Domain semantics remain provider-neutral. Next.js, Supabase, PostgreSQL, Vercel, and UI libraries implement the model but do not define it.
12. A generated diagram, database projection, implementation snapshot, or agent output cannot silently become product truth.

## Repository as the collaboration boundary

A Repository may contain:

- data and records;
- pages and documents;
- tasks and workflows;
- settings and integrations;
- members, grants, and permission explanations; and
- activity and audit history.

This list describes possible resource families, not pre-approved entities. Each family must still prove its own behavior, lifecycle, invariants, and storage model.

The shared Resource envelope may carry identity, Repository ownership, kind, title, author, and timestamps. Resource-specific behavior remains explicit; the platform must not collapse every subtype into an opaque `type + json` structure merely for uniformity.

## Derived concepts and presentation projections

The following names may be useful without becoming independent domain entities:

- **Workspace**: the presentation of a Repository and its simultaneous navigation, context, work surface, and activity responsibilities.
- **Collaborator**: a User with effective Repository access.
- **Outside collaborator**: a User with Repository access who lacks the relevant Organization membership.
- **Current organization** or **current team**: a selected view used for filtering or explanation.

A projection becomes an entity only when it gains independent identity, lifecycle ownership, invariants, and behavior that cannot be derived from existing facts.

## Deferred concepts

These concepts are intentionally not accepted merely because mature products contain them:

- **Team**: introduce only when an Organization-scoped group principal needs its own membership lifecycle and grant behavior.
- **Enterprise**: introduce only when cross-Organization governance, policy, audit, billing, or lifecycle requires an independent boundary. “Enterprise-grade” is a quality requirement, not proof of an Enterprise entity.
- **Personal Repository namespace**: introduce only when ownership outside an Organization is a demonstrated use case.
- **Organization base permissions for ordinary members**: introduce only when ordinary membership must contribute Repository authority independently of a direct or group Grant.
- **Custom roles, explicit deny, nested groups, and policy precedence**: introduce only after capability union and simple policy constraints are insufficient.
- **Fork, branch, commit, pull request, and merge**: do not inherit these Git concepts without a no-code collaboration problem that requires them.
- **Generic plugin runtime**: do not create one before multiple integrations prove a stable extension contract.

## Non-goals

The platform is not:

- a Git hosting service;
- a visual clone of GitHub;
- a database table editor presented as a collaboration product;
- a collection of unrelated no-code tools under one navigation shell;
- a permission system whose truth exists only in UI conditions; or
- a distributed-systems architecture invented before independent deployment and scaling boundaries exist.

## Success model

The product model is working when:

- a User can identify the Repository in which work occurs;
- every Resource has an unambiguous collaboration and authorization boundary;
- the system can explain why an actor can or cannot perform an action;
- ownership, membership, grants, roles, capabilities, contexts, and events are not conflated;
- one product rule has one authoritative owner and matching executable evidence; and
- production observations can update the model without making undocumented runtime behavior the new contract.

## Falsification conditions

Reopen this contract when evidence shows that:

- the majority of valuable work cannot be contained or governed by a Repository boundary;
- Resources require independent cross-Repository identity as the normal case rather than an exception;
- Organization ownership cannot express the required ownership lifecycle;
- capability-based authorization cannot explain real decisions without pervasive special cases;
- event-derived history cannot meet required audit or recovery guarantees; or
- two real vertical slices require contradictory meanings for any canonical term.

## Contract update protocol

1. Record the observation, constraint, assumption, unknown, and value choice.
2. Use an ADR when the change affects ownership, system boundaries, authorization, persistence, public contracts, or an irreversible technology choice.
3. Update this product contract and any affected domain or architecture contract.
4. Update schema, code, policies, and tests as executable evidence.
5. Compare predicted behavior with production observations.
6. Preserve superseded decisions as history; do not rewrite them as if the former model never existed.

See the [documentation map](./README.md), [architecture contract](./architecture/README.md), [domain catalog](./domains/README.md), and [operations runbook](./operations/RUNBOOK.md).
