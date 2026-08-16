# Product Ontology

- Status: Canonical semantic expansion
- Contract owner: `docs/PRODUCT.md`
- Scope: GitHub-derived collaboration semantics that survive the Product axiom
- Last reviewed: 2026-08-16

> This document expands `docs/PRODUCT.md`. It does not preserve superseded target semantics.

## 1. Axiom and admission rule

Repository is the only accepted primary no-code collaboration and authorization Container.

GitHub supplies evidence for mature collaboration and enterprise-organization semantics. A benchmark concept is admitted only when its underlying problem, identity, ownership, lifecycle, relationships, authorization effect, URL/IA, and interaction remain meaningful for arbitrary no-code collaboration.

A feature whose usefulness depends on Source Code, source-control, arbitrary execution, CI/CD, build, test, or deployment assumptions is rejected rather than translated, renamed, or generalized.

The only repository-wide mapping authority is the [canonical glossary](../.agents/skills/github-semantic-reverse/GLOSSARY.md).

## 2. Core semantic roles

```text
Actor        = who performs an action
Scope        = which ownership, administration, or governance boundary applies
Principal    = who may receive explicit authority
Container    = where collaboration has one stable boundary
Relationship = how identities, owners, principals, scopes, and containers connect
Artifact     = collaborative work inside a Container
Process      = how an Artifact or Relationship may validly change
```

These are admission roles, not generic entities, packages, tables, or bounded contexts.

Cross-cutting semantics:

```text
Authorization = Role / Capability / Policy / Delegation / Effective Authorization
Presentation  = Context / Projection
Evidence      = Activity Event / future stronger Evidence when independently proven
```

## 3. User — persistent human identity

Status: **Canonical.**

```text
User
= persistent human Product identity
```

A User may independently be a request Actor, explicit-grant Principal, Repository Owner, Organization Member, or derived Repository Collaborator.

```text
User ≠ Member
User ≠ Collaborator
User ≠ Role
User ≠ selected Context
```

`Account` is the surface family through which a User or Organization manages settings and administration. It is not a generic Entity and never replaces User, Organization, Actor, Owner, Principal, or Scope.

Identity establishes a trusted User Actor. Access resolves effective Capability for that Actor and target. An authenticated Session is identity evidence, not Repository authorization.

## 4. Organization — identity and administration Scope

Status: **Canonical.**

```text
Organization
= persistent organizational identity
+ Membership boundary
+ administration Scope
+ possible Repository Owner
```

```text
Organization ≠ Actor
Organization ≠ mandatory Repository parent
Organization ≠ collaboration Container
Organization ≠ selected UI Context
```

Ordinary Organization Membership creates no Repository access.

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

Ownership is a Relationship fact, not a fabricated direct Grant.

Invariants:

1. Exactly one Owner exists per Repository.
2. Accepted Owner kinds are User and Organization.
3. Ownership may contribute governance-derived Repository authority.
4. Both ownership modes use the same collaboration semantics.
5. A future transfer must preserve stable Repository and Resource identities.

## 6. Owner Namespace

Status: **Canonical routing requirement.**

```text
/{ownerSlug}
/{ownerSlug}?tab=repositories|stars|projects
/{ownerSlug}/{repositorySlug}
```

`ownerSlug` resolves exactly one persisted Owner namespace entry:

```text
ownerSlug
→ User username
or
→ Organization slug
```

URL shape never determines kind. Resolution returns `kind: user | organization` plus stable identity. Query tabs change Presentation Context only.

Repository slug is unique inside one Owner namespace. Stable IDs remain authorization and relationship targets.

```text
ownerSlug
≠ Owner stable ID
≠ Repository stable ID
≠ Principal
≠ authority fact
```

`/orgs/{organizationSlug}/...` and `/organizations/{organizationSlug}/settings/...` are operational and governance surfaces, not alternative Organization identities.

## 7. Repository — primary collaboration Container

Status: **Canonical.**

```text
Repository
= stable identity boundary
+ typed Owner Relationship
+ collaboration boundary
+ primary authorization target
+ Artifact containment boundary
+ Process scope
+ historical Evidence boundary
+ human workspace identity
```

Current accepted Artifact family:

```text
Repository
├─ Page
├─ Issue
└─ Discussion
```

A future capability must live inside Repository, project Repository-scoped facts, or prove why Repository is insufficient. It cannot become a competing Container because a benchmark exposes a separate surface.

## 8. Membership and Member — belonging Relationship

Status: **Canonical.**

```text
Member(user, organization)
= EXISTS OrganizationMembership(user, organization)
```

```text
Member ≠ User subtype
Member ≠ Repository Collaborator
Membership ≠ Repository Grant
```

Organization Membership Roles describe Organization-scope administration, not Repository Roles.

## 9. Team — deferred group Principal

Status: **Not established.**

Team may be reconsidered only when a real workflow must grant the same durable group of Users authority across Repositories.

A future Team would be an Organization-scoped Principal. It would not be an authenticated Actor, Repository Owner, Repository parent, tenant, or collaboration Container.

Selected Team Context never supplies authority.

## 10. Collaborator and Outside collaborator — derived classifications

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

Neither classification creates an identity subtype or persistence table.

## 11. Principal and Grant — explicit authority

```text
Principal
= subject that may receive explicit authority
```

Current persisted Principal:

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

Ownership and Grant remain independent causal facts. A Domain Principal abstraction does not justify generic polymorphic persistence.

## 12. Role and Capability — bundle versus decision

```text
Role
= named Capability bundle

Capability
= atomic authorization action on a defined target
```

Current Repository Roles:

```text
read | triage | write | maintain | admin
```

Current Capability families remain surface-specific:

```text
Repository
repository.view
repository.manage
repository.access.manage

Page / Knowledge
resource.view
page.create
page.update

Issue
issue.create
issue.comment
issue.edit
issue.manage

Discussion
discussion.create
discussion.comment
discussion.comment.locked
discussion.edit
discussion.moderate
discussion.announce
```

Direct Repository access management is Admin-only. Role rank supports explanation and selection; it never grants delegation authority.

## 13. Effective Authorization

Accepted authority sources:

1. User ownership of the target Repository.
2. Organization owner/admin relationship when that Organization owns the target Repository.
3. Direct User Repository Grant.
4. Public visibility for accepted read semantics.

```text
Actor
→ stable Repository target
→ inspect typed Owner
→ collect ownership/governance authority
→ collect explicit Grants
→ add visibility baseline
→ apply governance constraints
→ apply target-state preconditions
→ Capability decision
```

Ordinary Membership contributes no Repository Role. Application callers supply stable Actor and Repository identity, not an Organization assumption.

Current visibility:

```text
private | public
```

## 14. Resource, Page, Issue, and Discussion

```text
Repository
└─ Resource
   ├─ Page
   ├─ Issue
   └─ Discussion
```

Every Resource has one stable Repository boundary and cannot redefine ownership, authority, or Evidence semantics.

Page proves create/read/update, Capability decision, optimistic concurrency, same-transaction Activity Event, and user-visible Projection.

Issue is actionable work with Repository-local number, assignment, classification, flat conversation, and explicit completion state. Assignment is responsibility, not authority.

Discussion is shared understanding with Repository-local number, fixed categories, flat conversation, independent closed/locked state, and optional question Answer. Participation is not authority.

GitHub Wiki presentation remains `/wiki` while Page/Knowledge remains the Domain family. No Git-backed history model or second Artifact family is introduced.

## 15. State Transition — authoritative current-state mutation

Status: **Canonical Process.**

```text
Actor + Authority + Concrete Command + Expected Revision
↓
Accepted State Transition
↓
Current Resource State + Activity Event
```

A Resource command owns validation and transition semantics. Expected Revision is an optional concurrency precondition, not an Artifact or history identity.

A failed command produces neither a successful state change nor a success event.

Concurrency is solved through transaction serialization, real-time coauthoring, or stale-command rejection. It does not create named alternate state lines, a default mainline, later convergence, or a generic history graph.

## 16. Activity Event — historical Evidence

Status: **Canonical Evidence.**

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

An Activity Event records sufficient actor, action, target, and time evidence for its accepted contract. It is not current Resource state, a mutable status, a notification, or a user-authored history object.

Governance constrains future actions. Audit explains or proves past actions. Neither creates Repository authority.

## 17. Project-style planning and collaboration projections

Project-style planning is a Projection over accepted Repository-scoped work. It owns no underlying Artifact, Repository, Principal, Grant, or authority boundary.

Notification is Actor-specific delivery state derived from source Evidence and explicit recipient relationships. Every read revalidates Repository access.

Search authorizes before ranking, count, or snippet. Explore reads public Repository metadata only. Marketplace is a reviewed catalog Projection with no installation authority.

Changing planning filters, Notification state, tabs, selected Context, or comparison inputs never changes effective authorization.

## 18. State Comparison — optional derived presentation

Status: **Deferred; no standalone Product capability.**

A State Comparison may be admitted only when a concrete workflow independently requires two retained states and both are already addressable under an accepted retention/evidence contract.

If admitted:

```text
State Comparison
= derived read Projection(state A, state B, Actor authority)
```

It owns no lifecycle, mutation, authority, patch language, or source truth. It cannot reveal a field inaccessible in either compared state.

A comparison need does not imply a version-control model.

## 19. Typed data movement — deferred

Status: **No accepted Domain or lifecycle.**

A future typed transfer must independently prove:

- one explicit source and destination contract;
- source-read and destination-write authorization;
- fixed schema validation;
- idempotency and retry ownership;
- secret references instead of secret values;
- redacted Evidence; and
- no arbitrary URL, script, expression, or user-defined executable transformation.

Until then, import, export, migration, delivery, endpoint, connector, and payload semantics remain unaccepted and unavailable.

## 20. Repository duplication — deferred independent creation

Status: **No accepted lifecycle.**

A future duplication use case may create a new independent Repository from an explicitly selected safe source state.

```text
Selected safe source state
+ explicit destination Owner
+ destination authorization
↓
Independent Repository
```

The destination has its own stable identity, Owner, Grants, lifecycle, current state, and Evidence. It never inherits authority, credentials, Sessions, secrets, installation tokens, automatic synchronization, or a continuing upstream relationship.

Origin Evidence, if later retained, explains creation only and grants nothing.

## 21. App, Installation, Enterprise, Billing, and Licensing

App and Installation remain unaccepted until an external machine must act as a typed Principal on a Repository. No OAuth, credential store, binding, arbitrary endpoint, or connector execution exists by implication.

Enterprise remains unaccepted until a real constraint spans multiple Organizations without granting Repository content access. It never becomes Repository Owner or content Principal by implication.

Billing and Licensing describe commercial entitlement and administration, never Repository ownership or content authority.

## 22. Product relationship architecture

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
                ┌────────────┼─────────────┐
                ▼            ▼             ▼
              Page         Issue       Discussion
                │            │             │
                └──── commands / State Transitions ────┐
                                                       ▼
                                                Activity Event
                                                       │
                                                read Projections
```

The system is not one containment tree. Membership, ownership, governance, authority, Artifact containment, mutation, and presentation are distinct relationships.

## 23. Projection rules

- Model Repository ownership with typed User/Organization references.
- Maintain one globally unambiguous Owner namespace for `/{ownerSlug}` and `/{ownerSlug}/{repositorySlug}`.
- URL shape never determines Owner kind or authority.
- Model cross-Repository assigned Issues at `/issues/assigned`; assignment is responsibility, not authority.
- `/dashboard` is authenticated personal discovery; `/repos` is Repository discovery.
- Keep command entry routes outside stable resource identity.
- Authorize by stable IDs rather than URL names or UI selection.
- Derive Member, Collaborator, and Outside collaborator classifications.
- Keep User Grant persistence typed while User is the only accepted persisted Principal.
- Keep Project-style planning as a Projection.
- Keep Role/Capability meaning under one Domain owner; SQL and UI project it.
- Keep Context out of authorization inputs.
- Keep historical Evidence distinct from current state and delivery Projections.
- There is no public stable-ID Repository compatibility namespace.
- Repository reads cannot inherit an authenticated-only wrapper while public visibility exists.
- GitHub URL vocabulary may survive Product admission independently from Domain vocabulary.
- Current-state mutation belongs to concrete Resource commands; do not create a generic history or patch aggregate.
- No data-movement or Repository-copy model exists until a concrete use case passes admission.
- A green browser suite is evidence only for journeys it covers.

## 24. Minimum discriminating tests

1. User-owned and Organization-owned Repositories use the same collaboration semantics.
2. User and Organization Owner slugs cannot collide.
3. The same Repository slug may exist under different Owner namespaces.
4. `/dashboard` Repository cards land on `/{ownerSlug}/{repositorySlug}`.
5. Personal Owner receives admin authority without a fabricated Grant.
6. Organization owner/admin authority applies only to Repositories owned by that Organization.
7. Ordinary Membership creates no Repository Role.
8. Changing UI Context does not change authorization for identical Actor, Repository, and persisted relationships.
9. Direct User Grant independently contributes its Role and Capabilities.
10. A Resource command with a stale Expected Revision fails without state or success Evidence.
11. An accepted Resource command changes current state and records required Activity Event atomically.
12. Issue and Discussion reuse Repository containment and authorization while retaining subtype invariants.
13. Feed, Notification, Audit, Search, Explore, and planning Projections cannot rewrite source state or Evidence.
14. A future State Comparison reveals only independently authorized retained states and owns no authority.
15. A future typed transfer rejects executable transformation, secret material, and authority bypass.
16. A future Repository duplication creates independent ownership and excludes inherited Grants, credentials, Sessions, secrets, and synchronization.

Compact semantic law:

> **User acts, User or Organization owns, Principal receives explicit authority, Repository contains collaboration, Capability decides access, concrete commands transition current state, Activity Event records accepted action, and Projection presents authorized truth.**
