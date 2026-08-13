# Product Contract

- Status: Canonical
- Contract owner: Repository owner
- Scope: Product meaning and semantic boundaries
- Last reviewed: 2026-08-14

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

## Purpose

The platform gives people a stable boundary in which they can create, organize, govern, and evolve collaborative work without requiring Git or code.

The product must answer one coherent question:

> Who acts, under which ownership or governance boundary, inside which collaboration container, on what work unit, with what authority, and with what historical evidence?

The contract succeeds when the same semantic model can explain identity, ownership, navigation, authorization, data design, user-visible behavior, audit history, and production recovery without redefining the same concept in each layer.

## Benchmark method

GitHub is evidence about mature collaboration mechanisms, not implementation authority.

The adaptation rule is intentionally asymmetric:

- **Domain / persistence / authorization semantics**: reverse-engineer the durable mechanism and independently justify the target model. Do not copy Git- or code-specific assumptions.
- **URL grammar / information architecture / navigation / interaction conventions**: prefer mature GitHub conventions when they express the same durable product relationship and do not depend on Git/code semantics. Do not invent a different mental model merely because the implementation uses Next.js or another framework.

For every concept considered from GitHub or another product, record:

1. the root collaboration problem it solves;
2. whether it requires a persistent identity or is only a relationship, role, state, process, evidence fact, or view;
3. which identity/scope owns its lifecycle;
4. its relationships and invariants;
5. what breaks if it is removed; and
6. the minimum discriminating test that could reject the proposed model.

A familiar name is not evidence that a Domain entity belongs in this platform. Conversely, a mature URL or interaction convention does not need to be discarded when the underlying target relationship is the same.

## Core collaboration semantic roles

Every benchmark concept must first be reduced to the smallest applicable semantic roles before it is considered as an Entity, Domain, package, table, or product surface.

| Semantic role | Question answered | Current/candidate examples |
| --- | --- | --- |
| Actor | Who is performing this action? | Authenticated User; future machine App while executing |
| Scope | Which ownership or governance boundary applies? | User/Organization owner namespace; Organization administration; future Enterprise governance |
| Principal | Which subject may receive authority? | User; future Team or App principal |
| Container | Where does collaboration have one stable boundary? | Repository |
| Relationship | How are identities, principals, scopes, owners, and containers connected? | Membership, Repository ownership, Grant, future Installation |
| Artifact | What collaborative work exists inside a Container? | Resource/Page; future validated work-item or conversation artifacts |
| Process | How may an Artifact or Relationship validly change? | Command/state transition; future workflow execution or reviewed change process |

These seven roles are a semantic admission lens, not a seven-entity, seven-package, seven-table, or seven-bounded-context architecture. A concept may play more than one role in different causal positions. A User may be persistent identity, request Actor, direct-grant Principal, and Repository Owner without those meanings becoming one type.

Cross-cutting semantics remain explicit:

- **Authorization**: Role, Capability, Policy, effective authorization, delegation.
- **Presentation**: Context, Workspace, Project-style views, other projections.
- **Evidence**: Activity Event and stronger historical-fact contracts when required.

## Minimum sufficient semantic model

| Term | Canonical meaning | Must not be confused with |
| --- | --- | --- |
| User | Persistent human product identity; may act, receive authority, and own Repositories | Membership, Role, selected context |
| Organization | Persistent organizational identity and membership/administration scope; may own Repositories | Mandatory Repository parent, Actor, collaboration Container |
| Repository Owner | Exactly one User or Organization that owns a Repository | Actor, Principal Grant, Enterprise governance |
| Owner Namespace | Human-readable globally unambiguous User username or Organization slug used as Repository URL namespace | Authorization, Repository identity |
| Principal | Subject that may receive authority; minimum implemented principal is User | Actor identity, owner, Role, selected context |
| Repository | No-code collaboration Container and primary Resource/authorization/history boundary | Git repository, source tree, folder, Project, Organization |
| Resource | Repository-scoped unit of collaborative work | Repository itself or unbounded JSON bucket |
| Grant | Relationship connecting a Principal to a Repository with a Role | Ownership relationship or effective permission cache |
| Role | Named bundle of Capabilities used for assignment and explanation | Authorization decision primitive |
| Capability | Permission to perform a specific action on a defined target | UI visibility or job title |
| Activity Event | Immutable historical fact produced by an accepted action | Feed item, notification, metric, mutable status |
| Context | Selected view, filter, or navigation scope | Identity, ownership, persisted relationship, authorization fact |
| Collaborator | Derived label for a User with effective Repository access | Persistent User subtype or independent entity |

## Repository ownership

Repository ownership is independent from Repository containment.

```text
Repository Owner
├─ User
└─ Organization

Repository Owner
── owns ──> Repository
── contains ──> Resource
```

Canonical invariants:

1. Every Repository has exactly one Owner at a time.
2. The accepted Owner kinds are User and Organization.
3. User-owned and Organization-owned Repositories share the same Repository collaboration semantics.
4. Ownership does not fabricate a direct Repository Grant row.
5. Ownership may contribute an explicit governance-derived authority source.
6. Repository stable identity is independent from owner slug and Repository slug.
7. Repository slug uniqueness is scoped to its Owner namespace.
8. User usernames and Organization slugs share one globally unambiguous URL-owner namespace when used in canonical Repository URLs.
9. Repository transfer, if accepted, changes ownership relationship without rewriting Repository stable identity or contained Resource identity.

Organization ownership is one ownership mode. It is not the definition of Repository.

## Core relationships

- An authenticated request establishes a User as the Actor.
- A User may have a Membership relationship with an Organization.
- A User or Organization may own a Repository.
- A Principal may receive a Grant to a Repository.
- A personal Repository owner derives Repository admin authority from ownership without fabricating a Grant.
- Organization owner/admin governance authority may derive Repository admin authority only for Repositories owned by that Organization.
- Ordinary Organization membership does not create Repository access.
- A Repository contains Resources/Artifacts.
- A Role expands into Capabilities.
- Accepted Processes change Artifact or Relationship state through explicit commands/transitions.
- Accepted actions may produce Activity Events.
- Activity feeds, audit views, notifications, achievements, analytics, and planning surfaces are projections unless an independent lifecycle proves otherwise.

## Effective authorization baseline

The current authority model is intended to resolve:

```text
Actor
→ Repository
→ ownership relationship
→ accepted Principal Grants
→ visibility baseline
→ governance constraints
→ target state preconditions
→ Capability decision
```

Accepted authority sources for the current target model:

1. Personal Repository ownership → Repository admin authority for that User owner.
2. Organization owner/admin relationship → Repository admin authority only when that Organization owns the Repository.
3. Direct User Repository Grant → assigned Repository Role.
4. Public Repository visibility → accepted read baseline.

Ordinary Organization membership contributes no Repository Role.

`organization` visibility is not part of the accepted target vocabulary unless an explicit Organization-wide read baseline is later defined and verified. A visibility label without effective-access semantics must not be kept as product truth.

## Canonical URL and information architecture

Repository public/human identity follows the owner namespace:

```text
/{ownerSlug}/{repositorySlug}
/{ownerSlug}/{repositorySlug}/pages
/{ownerSlug}/{repositorySlug}/pages/{pageId}
/{ownerSlug}/{repositorySlug}/activity
```

Examples:

```text
/alice/personal-crm
/acme/customer-success
```

The first path segment resolves a User or Organization Owner namespace. It does not imply Organization ownership.

`/app` may remain an authenticated dashboard/presentation route, but it is not part of Repository identity. Framework Route Groups, Parallel Route slots, and delivery folders never become URL/domain semantics by accident.

GitHub-inspired Repository surfaces may later extend the same namespace only after their target semantics are accepted, for example:

```text
/{owner}/{repository}/issues
/{owner}/{repository}/discussions
/{owner}/{repository}/changes
/{owner}/{repository}/workflows
/{owner}/{repository}/settings
```

## Product invariants

1. `Repository` always means a no-code collaboration Container. It never inherits Git semantics by default.
2. GitHub behavior is benchmark evidence. It cannot override an accepted target contract.
3. Actor, Scope, Principal, Container, Relationship, Artifact, and Process are semantic roles for decomposition, not a mandate to create generic entities, tables, packages, or bounded contexts.
4. Repository Owner is exactly one User or Organization; Organization ownership is not mandatory.
5. Ownership, Membership, Principal Grants, Roles, Capabilities, Context, and effective authorization remain separate facts/derivations.
6. Every Resource belongs to exactly one Repository at a time until an explicit transfer or cross-Repository model is accepted.
7. Authentication proves who the Actor is; it does not prove Repository or Resource access.
8. Server-side authorization derives from accepted authority sources and constraints. UI-selected Context may filter/explain but cannot change authorization facts.
9. Capability is the decision primitive. Role is assignment/explanation vocabulary.
10. `Collaborator` and `Outside collaborator` remain derived classifications unless evidence proves an independent lifecycle.
11. Activity Events are append-only historical facts. User-facing feeds and notifications may be rebuilt from sufficient evidence.
12. Domain semantics remain provider-neutral. Next.js, Supabase, PostgreSQL, Vercel, and UI libraries implement the model but do not define it.
13. Generated diagrams, database projections, implementation snapshots, migrations, and agent output cannot silently become Product truth.
14. A canonical Repository URL uses Owner namespace + Repository slug; an internal delivery prefix such as `/app` cannot become Repository identity.
15. User-owned and Organization-owned Repositories must reuse the same Resource, Process, history, and Capability semantics unless a falsifying use case proves a real difference.

## Repository as the collaboration boundary

A Repository may contain:

- data and records;
- pages and documents;
- tasks and workflows;
- settings and integrations;
- grants and permission explanations; and
- activity and audit history.

This list describes possible Resource families and supporting collaboration responsibilities, not pre-approved entities. Each family must still prove behavior, lifecycle, invariants, semantic role, and storage model.

The shared Resource envelope may carry identity, Repository ownership, kind, title, author, and timestamps. Resource-specific behavior remains explicit; the platform must not collapse every subtype into opaque `type + json` solely for uniformity.

## Derived concepts and presentation projections

- **Workspace**: presentation composition of one Repository; not a second Container.
- **Collaborator**: User with effective Repository access.
- **Outside collaborator**: for an Organization-owned Repository, a User with effective Repository access who lacks that Organization Membership.
- **Current organization / current team**: selected presentation/filter state only.
- **Project-style planning view**: projection over work; never ownership/authorization boundary by presentation alone.

A projection becomes an entity only when it gains independent identity, lifecycle ownership, invariants, and behavior that cannot be derived from existing facts.

## Deferred concepts

These concepts remain intentionally unaccepted until evidence requires them:

- **Team**: introduce when an Organization-scoped group Principal needs its own membership lifecycle and Repository Grant behavior.
- **Enterprise**: introduce when cross-Organization governance, policy, audit, billing, or lifecycle requires an independent boundary. Enterprise governs Organizations; it does not become a Repository owner by implication.
- **Issue, Discussion, Change Request, Workflow, App Principal/Installation, Project-style planning**: candidate/derived semantics until a real use case proves independent lifecycle or reusable Repository-scoped process/projection.
- **Organization-wide base permission for ordinary members**: introduce only when Membership must contribute Repository authority independently of direct/group Grant.
- **Custom roles, explicit deny, nested groups, policy precedence**: only after additive Capability sources and typed constraints prove insufficient.
- **Fork, branch, commit, pull request, merge**: do not inherit Git mechanisms without a no-code collaboration problem requiring them.
- **Generic plugin runtime**: do not create before multiple integrations prove a stable extension contract.

Personal Repository ownership is **not Deferred**. User and Organization ownership are both part of the corrected Repository ownership contract.

## Non-goals

The platform is not:

- a Git hosting service;
- a visual clone of GitHub;
- a database table editor presented as a collaboration product;
- a collection of unrelated no-code tools under one navigation shell;
- a permission system whose truth exists only in UI conditions; or
- a distributed-systems architecture invented before independent deployment/scaling boundaries exist.

## Success model

The product model is working when:

- a User can create/own a personal Repository and an authorized Organization administrator can create an Organization-owned Repository;
- both ownership modes use the same Repository collaboration semantics;
- every Resource has an unambiguous Repository boundary;
- the system can explain why an Actor can or cannot perform an action;
- `/app` or another dashboard can navigate to the canonical `/{owner}/{repository}` Repository URL;
- ownership, membership, grants, roles, capabilities, contexts, processes, and evidence are not conflated;
- new benchmark concepts are classified before persistence/architecture is introduced;
- one product rule has one authoritative owner and matching executable evidence; and
- production observations can update the model without making undocumented runtime behavior the new contract.

## Falsification conditions

Reopen this contract when evidence shows that:

- the majority of valuable work cannot be contained or governed by a Repository boundary;
- Resources require independent multi-Repository ownership as the normal case;
- User/Organization are insufficient Repository owner types for demonstrated use cases;
- capability-based authorization cannot explain real decisions without pervasive special cases;
- event-derived history cannot meet required audit/recovery guarantees;
- the semantic-role lens repeatedly hides rather than clarifies necessary product distinctions; or
- two real vertical slices require contradictory meanings for any canonical term.

## Contract update protocol

1. Record Observation, Hard Constraint, Assumption, Unknown, Value Choice, Convention, and Evidence State separately.
2. Identify the earliest truth boundary that is wrong before changing downstream projections.
3. Classify the candidate mechanism by Actor / Scope / Principal / Container / Relationship / Artifact / Process plus cross-cutting authorization/presentation/evidence semantics.
4. Use an ADR when ownership, public routing, authorization, persistence, system boundaries, or irreversible technology choices change.
5. Update Product and affected Domain/Architecture contracts before or atomically with executable projections.
6. Update schema, migrations, generated projections, code, policies, and tests as evidence.
7. Verify the minimum discriminating user journey, not merely the existence of green tests.
8. Compare predicted behavior with production/provider observations when such environments exist.
9. Preserve superseded decisions as history; do not leave contradictory current truth in canonical documents.

See the [ontology expansion](./ONTOLOGY.md), [documentation map](./README.md), [architecture contract](./architecture/README.md), [domain catalog](./domains/README.md), and [operations runbook](./operations/RUNBOOK.md).
