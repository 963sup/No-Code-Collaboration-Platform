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

`Account` is the product-surface family through which a User or Organization manages identity, settings, administration, and commercial concerns. Account is not a generic Entity and never replaces User, Organization, Actor, Owner, Principal, or Scope.

```text
Identity establishes a trusted User Actor.
Access resolves effective Capability for that Actor and target.
```

An authenticated Session is Identity evidence, not Repository authorization.

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

## 9. Team — excluded milestone concept

Status: **Explicitly not established in this milestone.**

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

No Team identity, Membership, Repository Grant, detail route, or table exists. Organization Teams presentation shows an explicit deferred state only. Team may be reconsidered only when a real workflow must grant the same durable group of Users authority across Repositories. Team is never an authenticated Actor, Repository Owner, Repository parent, Tenant, or collaboration Container.

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
member.manage
```

An operation that is not accepted by the Product lifecycle is not carried as a latent Capability. Resource hard deletion is currently unavailable and therefore absent from the authorization vocabulary.

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

Status: **Resource canonical; Page, Issue, and Discussion are accepted concrete kinds.**

```text
Repository
└─ Resource
   ├─ Page
   ├─ Issue
   └─ Discussion
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

Issue and Discussion are admitted because their no-code problems, stable identities, and lifecycles are distinct from Page. Their v1 lifecycle, authorization, concurrency, relationship, and Evidence semantics are decision-complete in their Domain contracts; executable status remains a separate gap/code/test fact. No additional Resource family is accepted from benchmark vocabulary alone.

GitHub Knowledge and Wiki semantics map to Page as the Repository knowledge surface. They do not create a Git-backed history model, second Artifact family, or separate collaboration Container.

## 15. Issue — accepted actionable Artifact

Status: **Accepted target semantic and lifecycle.**

Durable benchmark problem:

> track a Repository-scoped item that should be acted on, assigned, discussed, and completed.

```text
Issue
= Repository-scoped actionable Artifact
stable identity = Repository ID + issue number
```

Issue owns `open | closed` state, `completed | cancelled` close reason, Repository-scoped labels, access-eligible User assignees, and flat chronological comments. Assignment is responsibility, not authority. Create/edit/comment/assign/label/close/reopen use Repository Capabilities, expected version, and same-transaction Activity Evidence. Hard delete, nested replies, milestones, and reactions are excluded from v1.

It is never a collaboration Container.

## 16. Discussion — accepted conversation Artifact

Status: **Accepted target semantic and lifecycle.**

Durable benchmark problem:

> create a Repository-scoped conversation whose primary goal is shared understanding rather than committed execution.

```text
Discussion
= Repository-scoped conversation/shared-understanding Artifact
stable identity = Repository ID + discussion number
```

It is distinct from actionable Issue work and remains contained by Repository. Categories are fixed to `general | question | announcement`; status is `open | closed`; locked is an independent moderation state. Comments are flat and chronological. A `question` may select one of its own comments as Answer; other categories cannot. Announcement creation and lock moderation require `repository.manage`. Every mutation uses expected version and same-transaction Activity Evidence. Hard delete, nested replies, and reactions are excluded from v1.

## 17. Project-style planning view — Projection

Status: **Accepted derived Projection; persistence as an independent ownership boundary is rejected.**

Durable benchmark problem:

> group, filter, prioritize, and plan already-existing work across one or more Repository sources.

```text
Project-style planning view
= Projection over accepted Repository-scoped Artifacts
```

It does not own the underlying Artifacts, become a Repository parent, or create an authorization boundary by itself.

Cross-Repository presentation does not create cross-Repository ownership.

v1 creates no Project entity, table, command, saved view, or detail identity. Global and Repository planning screens derive rows from already-authorized Issue, Discussion, and Page state; URL filters cannot mutate their sources.

## 18. No-code Data Change, Exchange, and Derivation

Status: **Accepted semantic envelope; concrete lifecycles and implementation deferred.**

| Canonical concept | Semantic role | Repository relationship | Authority rule |
| --- | --- | --- | --- |
| Data Commit | immutable historical Evidence for one typed change batch | belongs to exactly one Repository | Actor attribution records action; it grants nothing |
| Data Branch | isolated data-state line and selectable Context | exists inside one Repository | selection cannot change Membership, Grant, Role, or Capability |
| Data Diff | derived Projection | compares read-authorized states in one Repository | filters fields and records before comparison output |
| Change Proposal | propose/review/decide/apply Process | applies only to typed changes in one Repository | participation, review, and approval grant no Capability; apply reauthorizes |
| Data Transfer | typed transfer Process | source and destination authority are checked independently | only allowlisted connectors/endpoints and mappings are permitted |
| Data Capsule | finite typed-data Artifact | contained by exactly one Repository | visibility cannot exceed Repository authority |
| Repository Derivation | provenance-preserving creation Process | creates a distinct Repository from a source Repository | destination has independent Owner and authority |

Repository Derivation copies only explicitly admitted data. Secrets, Sessions, and Grants are excluded by default. Provenance does not make the source an Owner, Principal, Container parent, or continuing authority source for the derived Repository.

`Commit`, `Branch`, `Diff`, `Pull Request`, `Actions`, `Gist`, `Fork`, `Pull`, and `Push` are external benchmark aliases only. `Pull` and `Push` may describe Data Transfer direction; no alias creates a canonical route, Entity, Capability, or generic version-control/automation engine.

The shared envelope does not prove one generic `version_control` or `automation` aggregate. Source Code, file trees, Git refs/merge, code review, executable payloads, arbitrary expressions, CI/CD, build, test, deploy, Package, and Release remain rejected.

Concrete identity, lifecycle, persistence, Capability, URL, API, and UI remain unavailable until the narrowest Domain contract and discriminating tests accept them.

## 19. App and Installation — machine identity and access Relationship

Status: **Explicitly not established in this milestone.**

If integrations require non-human authority:

```text
App
= machine identity
= possible Actor and/or Principal

Installation
= explicit App access Relationship to accepted scopes/Repositories
```

No App identity, Installation, OAuth, credential store, Repository binding, arbitrary endpoint, or connector execution exists. Reconsider only when an external machine must act as a typed Principal on a Repository.

`Workflow` and `Run` may later describe an admitted orchestration definition and one execution record. They do not imply a script runtime, arbitrary execution, authority, persistence, or route; those concrete decisions remain deferred.

## 20. Enterprise — future cross-Organization Governance Scope

Status: **Explicitly not established in this milestone.**

```text
Enterprise
→ governs Organizations
→ constrains allowed organizational behavior
```

Enterprise does not become Repository Owner, Repository parent, collaboration Container, or implicit Repository Principal by implication.

A future Enterprise Policy may restrict Organization-owned Repository behavior. It must not silently grant Repository content authority.

`Enterprise-grade` is a product-quality goal, not evidence that an Enterprise Entity is required. `/settings/enterprises` is explanatory governance Projection only. Reconsider Enterprise only for a real constraint spanning multiple Organizations that grants no Repository content access.

Billing and Licensing describe commercial offerings, entitlements, and administration. They never imply Repository ownership or content authority, and their concrete identity, persistence, routes, Capabilities, and lifecycle remain deferred.

## 21. Activity Event and projections — historical Evidence

Status: **Canonical Evidence/Projection boundary.**

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

Governance constrains future actions through Policy and accepted authority rules. Audit explains or proves past actions from sufficient historical Evidence. Governance is not Audit; Audit is not an authority source.

Notification recipients are limited to explicit watch, Issue assignment, mention, or unmuted prior participation; the initiating Actor is excluded. Threads aggregate by recipient + Repository + Artifact, revalidate Repository access before any content/count/URL, and keep `unread | read | archived` delivery state independent from source Evidence.

Search authorizes before ranking/count/snippet and covers only Repository metadata, Page, Issue, Discussion, and planning projections through PostgreSQL full-text search. Explore uses public Repository metadata only. Integration discovery is a reviewed catalog Projection with no connection success controls. Full query and ranking contracts live in [`domains/collaboration-projections.md`](./domains/collaboration-projections.md).

The current Activity Event envelope is not automatically a complete enterprise audit store. Stronger completeness, retention, causality, rebuild, or regulatory guarantees require an independently accepted evidence contract.

Public Repository visibility does not automatically publish the raw historical-evidence envelope. Current raw Activity access requires authenticated Repository read authority; a future anonymous Activity surface requires an explicit privacy/redaction projection contract.

## 22. Product relationship architecture and invariants

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
             ┌───────────────┼───────────────────────┐
             ▼               ▼                       ▼
          Resource        Processes                Evidence
       ┌─────┼─────┐      commands/change/transfer Activity Event + Data Commit
       ▼     ▼     ▼                                    │
     Page  Issue Discussion                         Projections
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
21. Data Commit, Data Branch, Data Diff, Change Proposal, Data Transfer, Data Capsule, and Repository Derivation are admitted only inside the accepted typed-data envelope and cannot introduce code execution, secrets, independent authority, or another Container.
22. Structural containment, Branch selection, Proposal participation or approval, Project filters, and Notification state cannot change effective authority.
23. A derived Repository has independent ownership and authority; provenance cannot copy secrets, Sessions, or Grants by default.

## 23. Domain, persistence, URL, UI, and validation projection rules

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
- Use `/{ownerSlug}` as the canonical User-or-Organization identity projection and `/organizations/{organizationSlug}/...` only for Organization governance resources; do not copy GitHub's split `/orgs/...` and `/organizations/.../settings/...` histories into the target.
- Model cross-Repository assigned Issues as `/issues?scope=assigned`, because assignment is a projection/filter rather than a child resource.
- Keep command/process entry routes such as Repository creation, import, and Organization creation outside the canonical resource hierarchy; sign-out is a command rather than a bookmarkable resource.
- Keep authorization targets on stable IDs rather than URL names or UI selections.
- Derive Collaborator and Member classifications rather than creating identity subtypes.
- Keep User Grant persistence typed while User is the only accepted persisted Principal.
- Add Team only when a real second group authority source is required.
- Add Enterprise only when a real cross-Organization governance constraint is required.
- Add or change Issue/Discussion persistence only through their accepted lifecycle, invariant, authorization, Evidence, and Repository-reuse contracts; executable status remains a gap/code/test fact.
- Keep Project-style planning as a Projection unless independent lifecycle proves otherwise.
- Add App/Installation only when a real machine authority use case exists.
- Do not infer a generic version-control or automation engine from benchmark feature catalogs. Data Change/Transfer semantics require explicit schema, Repository authorization, no-execution, endpoint, secret, conflict, retention, and Evidence contracts.
- Keep Repository as authorization and containment boundary for accepted Artifacts unless a real counterexample proves insufficient.
- Keep Role/Capability meaning under one Domain owner; SQL and UI project it.
- Keep Context out of authorization inputs unless the selected value resolves a persisted fact that would be used independently of selection.
- Keep historical Evidence semantics distinct from presentation Projections.
- After semantic admission, preserve the sanitized public and read-only authenticated owner/Repository information architecture, navigation, responsive composition, and interaction behavior in `.playwright-mcp/github/` unless an explicit target Product reason and discriminating test justify a deviation. Preserve resource relationships, not GitHub's historical route aliases.
- `/app` is a discovery/dashboard surface; it is not part of Repository identity.
- Canonical Repository presentation is owner/Repository header + primary navigation + one active child resource surface. Route-specific supporting navigation, metadata, activity, or modal composition may render beside that surface without becoming a Container, Artifact, authority source, or URL identity.
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
10. Issue and Discussion reuse Repository containment/authorization while keeping subtype lifecycle rules isolated; any later Resource kind must pass the same test.
11. Future Team must add a second Principal authority source without changing Actor/Context semantics.
12. Future Enterprise constraint must limit Organization behavior without owning Repository or granting Repository content access.
13. Feed/Notification/Audit/Planning projections may change without rewriting Artifact, authority, ownership, or source Evidence truth.
14. A Data Change/Transfer flow rejects executable or untyped payloads, rechecks source/target Repository Capabilities, filters Diff by read authority, never exposes secret values, and cannot execute user-provided code.
15. Repository Derivation retains provenance while establishing an independent Owner/authority boundary and excluding secrets, Sessions, and Grants by default.

Compact semantic law:

> **User acts, User or Organization owns, Principal receives explicit authority, Repository contains collaboration, Relationship connects belonging and authority, Capability decides access, Artifact carries work, Process changes state, and Evidence records what happened.**
