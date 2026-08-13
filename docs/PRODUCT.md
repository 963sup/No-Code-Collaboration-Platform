# Product Contract

- Status: Canonical
- Contract owner: Repository owner
- Scope: Product meaning and semantic boundaries
- Last reviewed: 2026-08-14

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

## Core collaboration semantic roles

Every benchmark concept must first be reduced to the smallest applicable semantic roles before it is considered as an Entity, Domain, package, table, or product surface.

| Semantic role | Question answered | Current/candidate examples |
| --- | --- | --- |
| Actor | Who is performing this action? | Authenticated User; a future machine App while executing |
| Scope | Which ownership or governance boundary applies? | Organization; future Enterprise governance boundary |
| Principal | Which subject may receive authority? | User; future Team or App principal |
| Container | Where does collaboration have one stable boundary? | Repository |
| Relationship | How are actors, principals, scopes, and containers persistently connected? | Membership, ownership, Grant, future Installation |
| Artifact | What collaborative work exists inside a Container? | Resource/Page; future validated work-item or conversation artifacts |
| Process | How may an Artifact or Relationship validly change? | Command/state transition; future workflow execution or reviewed change process |

These seven roles are a semantic admission lens, not a seven-entity, seven-package, seven-table, or seven-bounded-context architecture. A concept may play more than one role in different causal positions: a User may be the Actor for a request and also a Principal receiving a Grant; an App may eventually act and also receive authority.

Cross-cutting semantics remain explicit instead of being forced into the seven roles:

- **Authorization**: Role, Capability, Policy, effective authorization, delegation.
- **Presentation**: Context, Workspace, Project-style views, other projections.
- **Evidence**: Activity Event and stronger historical-fact contracts when required.

GitHub surface names therefore remain candidate translations until independently proven. For example, Issue may become an actionable Artifact, Discussion a conversation Artifact, Pull Request a proposed-change Artifact plus review/decision Process, Project a planning Projection, Actions a process-definition/execution mechanism, and GitHub App a machine Actor/Principal plus Installation Relationship. None of those translations is accepted merely because GitHub has the feature.

## Minimum sufficient semantic model

| Term | Canonical meaning | Must not be confused with |
| --- | --- | --- |
| User | Persistent human product identity; becomes the Actor in an authenticated request | Organization, Team, current UI context, or permission |
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

- An authenticated request establishes a User as the Actor.
- A User may have a Membership relationship with an Organization.
- An Organization owns Repositories.
- A Principal may receive a Grant to a Repository.
- Organization owner/admin governance authority may derive Repository admin authority without fabricating a direct Grant.
- A Repository contains Resources/Artifacts.
- A Role expands into Capabilities.
- Accepted Processes change Artifact or Relationship state through explicit commands/transitions.
- Accepted actions may produce Activity Events.
- Activity feeds, audit views, notifications, achievements, analytics, and planning surfaces are projections rather than competing product truths unless an independent lifecycle proves otherwise.

## Product invariants

1. `Repository` always means a no-code collaboration container. It never inherits Git semantics by default.
2. GitHub behavior is benchmark evidence. It cannot override an accepted target contract.
3. Actor, Scope, Principal, Container, Relationship, Artifact, and Process are semantic roles for decomposition, not a mandate to create generic entities, tables, packages, or bounded contexts.
4. Every persistent entity must have a distinct identity, lifecycle, owner, invariants, and a demonstrated removal cost.
5. Every Resource belongs to exactly one Repository at a time until an explicit transfer or cross-repository model is accepted.
6. Organization ownership, User membership, Principal grants, Role bundles, and effective Capabilities remain separate relationships even when an accepted governance relationship contributes authority.
7. Authentication proves who the actor is; it does not prove access to a Repository or Resource.
8. Server-side authorization derives from accepted authority sources and constraints. A UI-selected context may filter or explain access but cannot change authorization facts.
9. Capability is the decision primitive. Role is an assignment and explanation mechanism.
10. `Collaborator` and `Outside collaborator` remain derived classifications unless evidence proves an independent lifecycle.
11. Activity Events are append-only historical facts. User-facing feeds and notifications may be rebuilt from them.
12. Domain semantics remain provider-neutral. Next.js, Supabase, PostgreSQL, Vercel, and UI libraries implement the model but do not define it.
13. A generated diagram, database projection, implementation snapshot, or agent output cannot silently become product truth.

## Repository as the collaboration boundary

A Repository may contain:

- data and records;
- pages and documents;
- tasks and workflows;
- settings and integrations;
- members, grants, and permission explanations; and
- activity and audit history.

This list describes possible resource families and supporting collaboration responsibilities, not pre-approved entities. Each family must still prove its own behavior, lifecycle, invariants, semantic role, and storage model.

The shared Resource envelope may carry identity, Repository ownership, kind, title, author, and timestamps. Resource-specific behavior remains explicit; the platform must not collapse every subtype into an opaque `type + json` structure merely for uniformity.

## Derived concepts and presentation projections

The following names may be useful without becoming independent domain entities:

- **Workspace**: the presentation of a Repository and its simultaneous navigation, context, work surface, and activity responsibilities.
- **Collaborator**: a User with effective Repository access.
- **Outside collaborator**: a User with Repository access who lacks the relevant Organization membership.
- **Current organization** or **current team**: a selected view used for filtering or explanation.
- **Project-style planning view**: a projection over work; it cannot become a competing ownership or authorization boundary by presentation alone.

A projection becomes an entity only when it gains independent identity, lifecycle ownership, invariants, and behavior that cannot be derived from existing facts.

## Deferred concepts

These concepts are intentionally not accepted merely because mature products contain them:

- **Team**: introduce only when an Organization-scoped group principal needs its own membership lifecycle and grant behavior.
- **Enterprise**: introduce only when cross-Organization governance, policy, audit, billing, or lifecycle requires an independent boundary. “Enterprise-grade” is a quality requirement, not proof of an Enterprise entity.
- **Issue, Discussion, Change Request, Workflow, App Principal/Installation, and Project-style planning**: keep their semantic translations as candidates until a real use case proves independent identity/lifecycle or a reusable Repository-scoped process/projection.
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
- ownership, membership, grants, roles, capabilities, contexts, processes, and events are not conflated;
- new benchmark concepts can be classified semantically before any persistence or architecture is introduced;
- one product rule has one authoritative owner and matching executable evidence; and
- production observations can update the model without making undocumented runtime behavior the new contract.

## Falsification conditions

Reopen this contract when evidence shows that:

- the majority of valuable work cannot be contained or governed by a Repository boundary;
- Resources require independent cross-Repository identity as the normal case rather than an exception;
- Organization ownership cannot express the required ownership lifecycle;
- capability-based authorization cannot explain real decisions without pervasive special cases;
- event-derived history cannot meet required audit or recovery guarantees;
- the semantic-role lens repeatedly hides rather than clarifies necessary product distinctions; or
- two real vertical slices require contradictory meanings for any canonical term.

## Contract update protocol

1. Record the observation, constraint, assumption, unknown, and value choice.
2. Classify the candidate mechanism by Actor / Scope / Principal / Container / Relationship / Artifact / Process roles and any cross-cutting authorization/presentation/evidence semantics.
3. Use an ADR when the change affects ownership, system boundaries, authorization, persistence, public contracts, or an irreversible technology choice.
4. Update this product contract and any affected domain or architecture contract.
5. Update schema, code, policies, and tests as executable evidence.
6. Compare predicted behavior with production observations.
7. Preserve superseded decisions as history; do not rewrite them as if the former model never existed.

See the [documentation map](./README.md), [architecture contract](./architecture/README.md), [domain catalog](./domains/README.md), and [operations runbook](./operations/RUNBOOK.md).
