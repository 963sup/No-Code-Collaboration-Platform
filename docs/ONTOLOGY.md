# Product Ontology

- Status: Canonical semantic expansion
- Contract owner: `docs/PRODUCT.md`
- Scope: GitHub-derived collaboration semantics that survive the Product axiom
- Last reviewed: 2026-08-14

> This document expands `docs/PRODUCT.md`. It does not preserve superseded target semantics.

## 1. Axiom and admission rule

> **Repository = No-Code Collaboration Container**

Repository is the only accepted primary collaboration Container.

GitHub is used as evidence for mature collaboration and enterprise-organization semantics. A benchmark concept is admitted only when its collaboration problem, ownership/lifecycle, relationships, authorization meaning, URL/IA, and interaction semantics remain meaningful for arbitrary no-code collaboration.

A benchmark feature whose usefulness depends on excluded software-development implementation assumptions is not translated, renamed, or retained as a target candidate. It is simply outside this Product ontology.

## 2. Core semantic roles

```text
Actor
= who performs an action

Scope
= which ownership, administration, or governance boundary applies

Principal
= who may receive explicit authority

Container
= where collaboration has one stable boundary

Relationship
= how identities, owners, principals, scopes, and containers connect

Artifact
= collaborative work inside a Container

Process
= how an Artifact or Relationship may validly change
```

These are admission roles, not generic entities, packages, or tables.

Cross-cutting semantics:

```text
Authorization
= Role / Capability / Policy / Delegation / Effective Authorization

Presentation
= Context / Projection

Evidence
= Activity Event / future stronger Historical Evidence when independently proven
```

## 3. User — persistent human identity

Status: **Canonical.**

```text
User
= persistent human product identity
```

A User may independently be:

```text
request Actor
explicit-grant Principal
Repository Owner
Organization Member
Repository Collaborator (derived)
```

Therefore:

```text
User ≠ Member
User ≠ Collaborator
User ≠ Role
User ≠ Context
```

## 4. Organization — organizational identity and administration Scope

Status: **Canonical.**

```text
Organization
= persistent organizational identity
+ Membership boundary
+ administration Scope
+ possible Repository Owner
```

Organization may own zero or more Repositories.

```text
Organization ≠ Actor
Organization ≠ mandatory Repository parent
Organization ≠ primary collaboration Container
Organization ≠ selected UI Context
```

Ordinary Organization Membership does not create Repository access.

## 5. Repository Owner — typed ownership Relationship

Status: **Canonical.**

```text
Repository Owner
= exactly one User OR one Organization
```

```text
User ──────────┐
               ├── owns → Repository
Organization ──┘
```

Ownership is a Relationship fact, not a generic Principal subtype and not a fabricated direct Grant.

Invariants:

1. Exactly one Owner exists per Repository.
2. Accepted Owner kinds are User and Organization.
3. Ownership can contribute governance-derived Repository authority.
4. User-owned and Organization-owned Repositories use the same collaboration semantics.
5. A future transfer lifecycle must preserve stable Repository and contained Resource identities.

## 6. Owner Namespace — human routing identity

Status: **Canonical routing requirement.**

```text
/{ownerSlug}/{repositorySlug}
```

`ownerSlug` resolves either:

```text
User username
or
Organization slug
```

The namespace is globally unambiguous across both Owner kinds.

```text
ownerSlug
≠ Owner stable ID
≠ Repository stable ID
≠ Principal
≠ authorization fact
```

Repository slug is unique within one Owner namespace.

## 7. Repository — primary No-Code Collaboration Container

Status: **Canonical axiom.**

```text
Repository
= stable identity boundary
+ owner-scoped human namespace
+ collaboration boundary
+ authorization target boundary
+ Artifact containment boundary
+ Process scope
+ historical Evidence boundary
+ product workspace identity
```

Current executable Artifact family:

```text
Repository
└─ Page
```

A future capability must live inside Repository, project Repository-scoped facts, or first prove why Repository is insufficient. It cannot become a competing collaboration Container merely because GitHub exposes a separate surface for a similar concern.

## 8. Membership and Member — belonging Relationship

Status: **Canonical.**

```text
User
↕ Organization Membership
Organization
```

```text
Member(user, organization)
= EXISTS OrganizationMembership(user, organization)
```

Therefore:

```text
Member ≠ User subtype
Member ≠ Repository Collaborator
Membership ≠ Repository Grant
```

Organization Membership Roles describe Organization-scope administration. They are not Repository Roles.

## 9. Team — future Organization-scoped group Principal

Status: **Deferred.**

If a second shared authority source is proven necessary:

```text
Organization
└─ Team
   ├─ Team Membership → User
   └─ Repository Team Grant → Repository
```

Team would mean:

```text
Team
= Organization-scoped group Principal
```

Team is not an authenticated Actor, Repository Owner, Repository parent, Tenant, or collaboration Container.

Critical invariant:

```text
Selected Team
≠ persisted Team Principal resolution
```

Changing a UI Team filter cannot alter authorization when Actor, Repository, and persisted relationships are unchanged.

## 10. Collaborator and Outside collaborator — derived classifications

Status: **Derived.**

```text
Collaborator(user, repository)
= effective Repository authorization includes repository.view
```

For an Organization-owned Repository:

```text
OutsideCollaborator(user, organization)
= User has effective access to a Repository owned by organization
AND NOT Member(user, organization)
```

For a User-owned Repository there is no Organization Membership axis, so the outside-collaborator classification does not apply merely because another User has access.

No Collaborator or ExternalUser identity table follows from these labels.

## 11. Principal and Grant — explicit authority semantics

Status: **Canonical primitives; implemented Principal minimum = User.**

```text
Principal
= subject that may receive explicit authority
```

Current:

```text
Principal → User
```

Future only when proven:

```text
Principal → Team | App
```

```text
Grant
= Principal receives one Repository Role for one Repository
```

Ownership and Grant remain independent causal facts.

A Domain Principal abstraction does not justify a generic polymorphic persistence table.

## 12. Role and Capability — bundle vs decision primitive

Status: **Canonical.**

```text
Role
= named Capability bundle

Capability
= atomic authorization action on a defined target
```

Current Repository capabilities:

```text
repository.view
repository.manage
resource.view
resource.create
resource.update
resource.delete
member.manage
```

Capability decides authorization. Role supports assignment and explanation.

## 13. Effective Authorization — owner-neutral derived decision

Status: **Canonical.**

Accepted current authority sources:

1. User ownership of the target Repository.
2. Organization owner/admin relationship when that Organization owns the target Repository.
3. Direct User Repository Grant.
4. Public Repository visibility for accepted read semantics.

Ordinary Organization Membership contributes no Repository Role.

```text
Actor
→ stable Repository target
→ inspect Owner relationship
→ collect accepted governance authority
→ collect Principal Grants
→ add accepted visibility baseline
→ apply governance constraints
→ apply target-state preconditions
→ Capability decision
```

Application callers supply stable Actor and Repository identity. They do not inject an Organization ownership assumption.

Current visibility vocabulary:

```text
private | public
```

A future Organization-wide visibility/base-access mode requires an explicit effective-access contract before it can exist.

## 14. Resource and Page — accepted work Artifact

Status: **Resource canonical; Page is first accepted concrete kind.**

```text
Repository
└─ Resource
   └─ Page
```

A Resource has one stable Repository boundary. It cannot independently redefine ownership, authority, or history semantics.

Page currently proves:

```text
Create
Read
Update
Capability decision
optimistic concurrency
same-transaction historical evidence
user-visible projection
```

No additional Resource family is accepted from benchmark vocabulary alone.

## 15. Issue-style work item — candidate Artifact

Status: **Deferred candidate.**

Durable benchmark problem:

> track a Repository-scoped item that should be acted on, assigned, discussed, and completed.

If accepted:

```text
Issue-style work item
= Repository-scoped actionable Artifact
```

Its product name, states, assignment model, and lifecycle remain unaccepted until a real no-code use case proves them.

It is never a collaboration Container.

## 16. Discussion-style conversation — candidate Artifact

Status: **Deferred candidate.**

Durable benchmark problem:

> create a Repository-scoped conversation whose primary goal is shared understanding rather than committed execution.

If accepted:

```text
Discussion-style conversation
= Repository-scoped conversation/shared-understanding Artifact
```

It is distinct from an actionable work item and remains contained by Repository.

## 17. Project-style planning view — Projection

Status: **Deferred/derived.**

Durable benchmark problem:

> group, filter, prioritize, and plan already-existing work across one or more Repository sources.

If accepted:

```text
Project-style planning view
= Projection over accepted Repository-scoped Artifacts
```

It does not own the underlying Artifacts, become a Repository parent, or create an authorization boundary by itself.

Cross-Repository presentation does not create cross-Repository ownership.

## 18. App and Installation — machine identity and access Relationship

Status: **Deferred candidate.**

If integrations require non-human authority:

```text
App
= machine identity
= possible Actor and/or Principal

Installation
= explicit App access Relationship to accepted scopes/Repositories
```

App identity and Installation lifecycle are distinct. An integration is not an ordinary Repository Resource by default.

## 19. Enterprise — future cross-Organization Governance Scope

Status: **Deferred.**

```text
Enterprise
→ governs Organizations
→ constrains allowed organizational behavior
```

Enterprise does not become Repository Owner, Repository parent, collaboration Container, or implicit Repository Principal by implication.

A future Enterprise Policy may restrict Organization-owned Repository behavior. It must not silently grant Repository content authority.

`Enterprise-grade` is a product-quality goal, not evidence that an Enterprise Entity is already required.

## 20. Activity Event and projections — historical Evidence

Status: **Partially executable baseline.**

```text
Accepted action
→ Activity Event
├─ Activity Feed
├─ Notification
├─ Audit View
└─ Analytics
```

```text
Activity Event = historical Evidence
Feed / Notification / Audit / Analytics = Projections
```

The current Activity Event envelope is not automatically a complete enterprise audit store. Stronger completeness, retention, causality, rebuild, or regulatory guarantees require an independently accepted evidence contract.

## 21. Product relationship architecture and invariants

```text
                         future Enterprise
                               │ governs
                               ▼
                         Organization
                         │ Membership
                         │
User identity ───────────┼────────────────────┐
  │                      │                    │
  │ may own              │ may own            │ future Team Principal
  ▼                      ▼                    │
Repository Owner ─────> Repository <──────────┘ authority
(User or Organization)   Container
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
           Page          Processes         Evidence
                        accepted commands  Activity Event
                                               │
                                          Projections
```

The system is not one containment tree. Governance, membership, ownership, group authority, Artifact containment, and presentation are different relationships.

Canonical invariants:

1. Repository is the only accepted primary No-Code Collaboration Container.
2. Repository Owner is exactly one User or Organization.
3. Personal Repository ownership is first-class.
4. Organization is a Membership/administration Scope and possible Owner, not mandatory Repository parent.
5. Enterprise, if accepted, governs Organizations without becoming Repository Owner by implication.
6. User identity is distinct from Actor, Membership, Collaborator, Role, Principal, and Context meanings.
7. Membership is Relationship; Member is derived.
8. Team, if accepted, is Organization-scoped Principal; selected Team is never authority input by itself.
9. Collaborator and Outside collaborator remain derived.
10. Authentication establishes Actor identity only.
11. Ownership and explicit Grant remain separate authority facts.
12. Capability is the authorization decision primitive; Role is a bundle.
13. Policy may restrict authority but must not silently create content authority.
14. Every accepted collaborative Artifact belongs to exactly one Repository unless a future use case falsifies that rule.
15. Planning views, Workspace, Feed, Notification, Audit, and Analytics are Projections unless independent lifecycle proves otherwise.
16. Historical Evidence is append-oriented; Projection changes cannot rewrite source semantics.
17. Canonical Repository routing uses Owner namespace + Repository slug; stable IDs remain authorization/relationship targets.
18. A new benchmark surface cannot become a second Repository-equivalent Container without falsifying evidence.
19. Provider, framework, database, generated output, and UI composition project Product truth; they do not define it.
20. A benchmark capability is excluded when its value depends on implementation assumptions that do not survive the no-code collaboration model.

## 22. Domain, persistence, URL, UI, and validation projection rules

Do not mechanically create generic semantic-role persistence such as:

```text
actors
scopes
containers
relationships
artifacts
processes
principals(type,id)
```

Concrete rules:

- Model Repository ownership with typed User/Organization references.
- Maintain one globally unambiguous User/Organization owner namespace for `/{owner}/{repository}`.
- Keep authorization targets on stable IDs rather than URL names or UI selections.
- Derive Collaborator and Member classifications rather than creating identity subtypes.
- Keep User Grant persistence typed while User is the only accepted persisted Principal.
- Add Team only when a real second group authority source is required.
- Add Enterprise only when a real cross-Organization governance constraint is required.
- Add Issue-style or Discussion-style entities only after a real use case proves identity, lifecycle, invariants, and Repository reuse.
- Keep Project-style planning as a Projection unless independent lifecycle proves otherwise.
- Add App/Installation only when a real machine authority use case exists.
- Do not infer generic automation, policy, or plugin engines from benchmark feature catalogs.
- Keep Repository as authorization and containment boundary for accepted Artifacts unless a real counterexample proves insufficient.
- Keep Role/Capability meaning under one Domain owner; SQL and UI project it.
- Keep Context out of authorization inputs unless the selected value resolves a persisted fact that would be used independently of selection.
- Keep historical Evidence semantics distinct from presentation Projections.
- Prefer the mature GitHub owner/Repository URL and navigation mental model when the same target relationship exists.
- `/app` is a discovery/dashboard surface; it is not part of Repository identity.
- Canonical Repository presentation is owner/Repository header + primary navigation + one active content surface.
- A green browser suite is evidence only for journeys it explicitly covers.

Minimum discriminating tests:

1. User-owned and Organization-owned Repositories use the same collaboration semantics.
2. User and Organization owner slugs cannot collide.
3. The same Repository slug may exist under different Owner namespaces.
4. `/app` Repository card lands on `/{owner}/{repository}`.
5. Personal Owner gets Repository admin without a fabricated Grant.
6. Organization owner/admin authority applies only to Repositories owned by that Organization; ordinary members gain no Repository Role.
7. Changing UI Context does not change authorization for identical Actor/Repository/persisted relationships.
8. Direct User Grant independently contributes its Role/Capabilities.
9. Page create/update produces the expected state and historical Evidence in one accepted transaction boundary.
10. A second real Resource kind, when introduced, must reuse Repository containment/authorization while keeping subtype rules isolated.
11. Future Team must add a second Principal authority source without changing Actor/Context semantics.
12. Future Enterprise constraint must limit Organization behavior without owning Repository or granting Repository content access.
13. Feed/Notification/Audit/Planning projections may change without rewriting Artifact, authority, ownership, or source Evidence truth.

Compact semantic law:

> **User acts, User or Organization owns, Principal receives explicit authority, Repository contains collaboration, Relationship connects belonging and authority, Capability decides access, Artifact carries work, Process changes state, and Evidence records what happened.**
