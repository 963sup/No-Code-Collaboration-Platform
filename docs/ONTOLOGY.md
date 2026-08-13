# Product Ontology

- Status: Canonical semantic expansion
- Contract owner: `docs/PRODUCT.md`
- Scope: GitHub semantic decomposition, ontology roles, non-confusion boundaries, and admission rules
- Last reviewed: 2026-08-14

> This document expands the Product Contract. `docs/PRODUCT.md` remains the root product contract. If this document and `docs/PRODUCT.md` disagree, update the earliest invalid Product rule rather than allowing two competing truths.

The project goal remains:

> 逆向 GitHub 產品語意，從第一性原理重建以 Repository 為無代碼協作容器的企業協作平台。

GitHub is a semantic benchmark, not an implementation template. The target is not Code Hosting:

```text
Repository
=
No-Code Collaboration Container
```

The durable mechanism to reverse-engineer is GitHub's **relationship structure**, not its feature names.

---

## 1. Core collaboration semantic roles

Every benchmark concept must first be reduced to the smallest applicable semantic roles:

```text
Actor
= who acts

Scope
= which ownership / governance boundary applies

Principal
= who may receive authority

Container
= where collaboration has one stable boundary

Relationship
= how identities / principals / scopes / containers are connected

Artifact
= collaborative work inside a Container

Process
= how Artifact / Relationship state may validly change
```

These are a **semantic admission lens**, not a seven-Entity, seven-package, seven-table, or seven-bounded-context architecture.

Cross-cutting semantics remain separate:

```text
Authorization
= Role / Capability / Policy / Delegation / Effective Authorization

Presentation
= Context / Workspace / Project-style view / Feed / other Projection

Evidence
= Activity Event / future stronger Collaboration Fact
```

A single concrete concept can play different semantic roles in different causal positions. A User may be the request Actor and also a direct-grant Principal. A future App may be a machine Actor and/or Principal.

---

## 2. Enterprise — candidate governance Scope

Current status: **Deferred Entity; canonical semantic meaning defined.**

If an Enterprise Entity is accepted in the future:

```text
Enterprise
→ governs Organizations
→ constrains allowed behavior
```

It must not become:

```text
Workspace
Repository owner by default
Repository content Container
implicit Repository Principal
implicit content-access source
```

The first discriminating case is a real cross-Organization governance rule that cannot be expressed without independent Enterprise identity/lifecycle.

```text
Enterprise policy
→ may constrain
→ must not silently grant
```

`Enterprise-grade` remains a quality requirement, not proof that an `Enterprise` Entity/table/domain is needed.

---

## 3. Organization — ownership / administration Scope

Current status: **Canonical product boundary.**

```text
Organization
=
Repository ownership namespace
+ Membership boundary
+ Administration / governance Scope
```

Canonical relationship:

```text
Organization
1 ── owns ── * Repository
```

Organization is not:

```text
Actor
Repository-equivalent Workspace
primary collaboration Container
selected UI Context
```

Boundary sentence:

> **Organization owns collaboration Containers; it is not itself the collaboration Container.**

Organization ownership and ordinary Membership are orthogonal. Ordinary Membership does not automatically create Repository collaboration authority in the current accepted model.

---

## 4. Repository — primary No-Code Collaboration Container

Current status: **Canonical core invariant.**

```text
Repository
= Stable Identity Boundary
+ Organization-owned Collaboration Boundary
+ Authorization Boundary
+ Artifact Containment Boundary
+ Process Scope
+ Historical Evidence Boundary
+ Product Workspace Boundary
```

Repository is not:

```text
Git repository by implication
folder
Project
Organization
Team space
generic database bucket
```

Repository is the place where ownership, authorization, work, state transition, and history converge.

Current minimum contained Artifact family:

```text
Repository
└─ Resource
   └─ Page   ← current executable Resource kind
```

Any future CRM, Document, Task, Database, Form, Workflow, Approval, Discussion, or AI-agent capability must either:

1. belong inside the Repository boundary;
2. be a Projection over Repository-scoped facts; or
3. prove with a falsifying use case why a second primary collaboration Container is actually necessary.

---

## 5. User and Actor — identity is not request role

Current status: **Canonical distinction.**

```text
User
= persistent human product identity

Actor
= who is performing the current request/action
```

A User may become the Actor when an authenticated request is established.

```text
User ≠ Member
User ≠ Collaborator
User ≠ Owner
User ≠ Admin
User ≠ Context
```

Membership, collaboration, ownership, and administration are Relationships/Roles around the User identity; they are not different human identity types.

Authentication establishes Actor identity. It does not establish Repository authorization.

---

## 6. Membership and Member — Relationship, not identity subtype

Current status: **Canonical Organization Relationship.**

```text
User
↕ Organization Membership
Organization
```

Derived label:

```text
Member(user, organization)
=
EXISTS accepted OrganizationMembership(user, organization)
```

Therefore:

```text
Member
≠ User subtype
≠ Repository Collaborator
≠ Repository Grant
```

Current Organization relationship Roles such as `member`, `admin`, and `owner` describe Membership/governance state at Organization Scope; they are not Repository Roles.

Team Membership, when accepted, remains a distinct Relationship and must not be encoded as Organization Membership role inflation.

---

## 7. Team — future Organization-scoped group Principal

Current status: **Deferred.**

The only currently justified semantic meaning is:

```text
Team
=
Organization-scoped group Principal
```

If accepted:

```text
Organization
└─ Team
   ├─ Team Membership → User
   └─ Repository Team Grant → Repository
```

Necessary invariants:

```text
Team.organization
= TeamMembership.organization
= Repository.organization
= RepositoryTeamGrant.organization
```

and:

```text
Team member
→ must already satisfy accepted Organization-membership rules
```

Team must not become:

```text
authenticated Actor identity
Tenant
Repository owner
Repository parent
primary collaboration Container
UI Context authority source
```

Critical rule:

```text
Selected Team
≠ Team Principal resolution
```

Changing the selected Team in UI may change filter/view/explanation. It must not change persisted authority facts.

---

## 8. Collaborator and Outside Collaborator — derived Repository access labels

Current status: **Derived classification.**

Do not create a `Collaborator` aggregate merely because GitHub uses the label.

```text
Collaborator(user, repository)
=
EffectiveAuthorization(user, repository)
includes repository.view
```

```text
OutsideCollaborator(user, organization)
=
EXISTS repository owned by organization
where Collaborator(user, repository)
AND NOT Member(user, organization)
```

Therefore:

```text
Collaborator
≠ User type
≠ Principal type
≠ Grant

Outside Collaborator
≠ Account type
≠ ExternalUser table
```

A materialized collaborator list may exist as a read Projection/cache, but canonical identity/authority still comes from User + persisted Relationships + effective authorization.

---

## 9. Principal — authority-receiving semantic role

Current status: **Canonical authorization primitive; implemented minimum = User Principal.**

```text
Principal
= subject that may receive authority
```

Current:

```text
Principal
└─ User
```

Future candidates:

```text
Principal
├─ User
├─ Team
└─ App
```

This is a Domain semantic abstraction, not proof that persistence should use a generic polymorphic table.

Do not introduce:

```text
principals(type, foreign_id)
```

until multiple accepted Principal types genuinely share lifecycle/integrity requirements and the abstraction improves rather than weakens referential integrity.

---

## 10. Role and Capability — bundle vs decision primitive

Current status: **Canonical authorization vocabulary.**

```text
Role
= named Capability bundle
```

```text
Capability
= permission to perform one specific action on a defined target
```

Current Repository capability families include:

```text
repository.view
repository.manage
resource.view
resource.create
resource.update
resource.delete
member.manage
```

Current Role names are assignment/explanation vocabulary. Capability is the authorization decision primitive.

```text
Role ≠ Authority truth
Role ≠ User type
Capability ≠ UI visibility
```

Scope-specific role names must remain distinguishable. `Organization Admin` and `Repository Admin` are not one global `admin` identity.

---

## 11. Effective Authorization — derived decision, not stored identity

Current accepted authority sources:

1. Direct User Repository Grant.
2. Organization owner/admin governance-derived Repository admin authority for Repositories owned by that Organization.
3. Public Repository visibility baseline for accepted read semantics.

Ordinary Organization Membership contributes no Repository Role in the current model.

Decision chain:

```text
Actor
→ Resolved Principals
→ Authority Sources
→ Candidate Capabilities
+ Visibility Baseline
− Governance Constraints
+ Target State Preconditions
→ Authorization Decision
```

Conceptual rule:

```text
Allowed(action)
=
requested Capability is available
AND governance constraints allow
AND target state permits transition
AND transition/delegation invariants hold
```

Future Team/App support adds Authority Sources; it must not rewrite Capability meanings.

Future Enterprise/Organization Policy constrains candidate behavior; it must not silently add Repository content authority.

`Highest Role` may remain a human-readable explanation Projection while current Role bundles form a nested order, but it is not permanent decision truth.

---

## 12. Issue — candidate actionable Artifact

Current status: **Deferred candidate semantics.**

If accepted:

```text
Issue
= Repository-scoped actionable work Artifact
```

It may represent:

```text
Task
Request
Bug
Incident
Approval
Feature
Follow-up
Question requiring tracked action
```

Issue is not a collaboration Container. Its ownership, authority, history, and normal containment remain Repository-scoped unless a real use case proves otherwise.

---

## 13. Discussion — candidate conversation Artifact

Current status: **Deferred candidate semantics.**

If accepted:

```text
Discussion
= Repository-scoped conversation / shared-understanding Artifact
```

Default semantic distinction:

```text
Discussion
→ something should be understood / decided

Issue
→ something should be done / tracked
```

A Discussion may later produce an Issue or Change Request through an explicit Process, but those lifecycle transitions must be accepted rather than inferred from GitHub UI behavior.

---

## 14. Pull Request → Change Request abstraction

Current status: **Git-specific name rejected as target default; durable mechanism preserved as candidate.**

GitHub Pull Request's reusable mechanism is:

```text
Proposed State Change
→ Review
→ Decision
→ Apply / Reject
```

If accepted, target vocabulary should prefer:

```text
Change Request
```

A Change Request can be modeled as:

```text
proposed-change Artifact
+
review / decision Process
```

Do not inherit by default:

```text
Git Branch
Git Commit
Git Merge
Git transport
code diff semantics
```

Those are implementation mechanisms only if a no-code product problem independently requires them.

---

## 15. Project — planning Projection, not Container

Current status: **Derived/deferred planning surface.**

If accepted:

```text
Project
= planning Projection / View over existing work/change Artifacts
```

Example:

```text
Repository A ─ Issue 1 ─┐
Repository A ─ Issue 2 ─┤
Repository B ─ Issue 8 ─┼─ Project View
Repository C ─ Change 4 ┘
```

Project must not automatically become:

```text
Artifact owner
Repository parent
ownership boundary
authorization boundary
primary collaboration Container
```

Cross-Repository presentation is not cross-Repository ownership.

---

## 16. Workflow — Artifact definition and Process execution

Current status: **Deferred candidate semantics.**

If accepted:

```text
Workflow Definition
= Repository-scoped Artifact
= Trigger + Conditions + Actions
```

```text
Workflow Run
= Process execution instance / outcome
```

Do not conflate definition and execution state.

Example:

```text
Issue created
→ if priority = high
→ assign Team
→ request approval
→ send notification
```

Workflow remains Repository-scoped unless an independent lifecycle/authority owner is proven.

---

## 17. App and Installation — machine identity plus access Relationship

Current status: **Deferred candidate semantics.**

If accepted:

```text
App
= machine identity
= possible Actor and/or Principal
```

```text
Installation
= App ↔ Organization/Repository access Relationship
```

App identity and Installation lifecycle must remain distinct.

An integration is not an ordinary Resource by default. Repository selection, granted capabilities, installation/revocation, and machine execution each require explicit semantics.

---

## 18. Activity Event — historical Evidence; Feed/Audit/Notification are Projections

Current status: **Partially executable historical fact baseline.**

Activity is not primarily a feed feature.

```text
Accepted Action / Process
→ Activity Event
├─ Activity Feed
├─ Notification
├─ Audit View
├─ Analytics
└─ future Automation input
```

Canonical rule:

```text
Event
= historical Evidence

Feed / Notification / Audit / Analytics
= Projections
```

Projection shape must not redefine the source fact, Repository identity, Artifact state, or authorization truth.

If future enterprise audit needs stronger guarantees—command identity, causation/correlation, per-Repository sequence, authority basis, retention class, lawful redaction, projection rebuild guarantees—promote to a deliberately stronger Collaboration Fact contract rather than pretending the current envelope already provides them.

---

## 19. Canonical non-confusion table

| GitHub / platform term | Target semantic meaning | Never assume |
| --- | --- | --- |
| Enterprise | Deferred cross-Organization governance Scope | Workspace / Repository owner / implicit access |
| Organization | Ownership + administration Scope | Collaboration Container |
| Repository | No-Code Collaboration Container | Git repository / folder / Project |
| User | Persistent human identity | Member / Collaborator / Role |
| Actor | Current executing subject | Persistent identity subtype |
| Member | Derived from Organization Membership | User type / Repository access |
| Team | Deferred Organization-scoped Principal | Tenant / Context / Container |
| Collaborator | Derived effective Repository access label | Identity / independent Grant |
| Outside Collaborator | Collaborator without Org Membership | External account type |
| Principal | Authority-receiving subject role | Actor / Role / Context |
| Grant | Principal ↔ Repository authority Relationship | Effective permission cache |
| Role | Capability bundle | Decision primitive |
| Capability | Atomic authorization action | UI visibility |
| Policy | Constraint | Grant / implicit authority source |
| Effective Authorization | Derived allow/deny decision | Canonical persisted identity row |
| Resource/Page | Repository-scoped Artifact | Container |
| Issue | Candidate actionable Artifact | Container |
| Discussion | Candidate conversation Artifact | Work item by default |
| Pull Request | GitHub benchmark surface | Required target entity |
| Change Request | Candidate proposed-change Artifact + review Process | Git branch/merge requirement |
| Project | Planning Projection | Ownership/authorization boundary |
| Workflow Definition | Candidate process-description Artifact | Workflow Run |
| Workflow Run | Process execution | Definition |
| App | Candidate machine Actor/Principal | User / ordinary Resource |
| Installation | App access Relationship | App identity |
| Activity Event | Historical Evidence | Feed/Notification |
| Activity Feed | Projection | source truth |
| Notification | Attention Projection | Event |
| Audit View | Governance Projection over sufficient evidence | automatically complete audit store |
| Context | Presentation selection/filter | Identity / Membership / Authorization |
| Workspace | Repository presentation composition | second Container |
| Branch / Commit / Merge | Deferred Git-specific mechanisms | mandatory no-code concepts |

---

## 20. Product relationship architecture

```text
                         future Enterprise Scope
                                  │ governs
                                  ▼
                            Organization Scope
                           /        │         \
                  Memberships     owns      future Teams
                      │             │             │
User identity ────────┘             ▼             │
  │                            Repository          │
  │ Actor                         Container         │ Principal
  │                                 │              │
  └────────────── authority ────────┼──────────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
                Artifacts        Processes        Evidence
                Resource/Page    Commands         Activity Event
                future Issue     State changes          │
                Discussion       Review/Workflow       ▼
                Change Request                   Projections
                Workflow Def.                 Feed/Notify/Audit
```

The platform does not form one containment hierarchy such as:

```text
Enterprise
└─ Organization
   └─ Team
      └─ Repository
```

because governance, ownership, group authority, and collaboration containment are different relationships.

Repository stays central because it is the stable point where:

```text
Organization ownership
+ Principal authority
+ Artifact containment
+ Process scope
+ Historical Evidence
```

converge.

---

## 21. Product invariants

1. Repository is the primary no-code collaboration Container.
2. GitHub is benchmark evidence, never implementation or target-contract authority.
3. Semantic roles do not imply generic persistence, packages, or bounded contexts.
4. Enterprise, if accepted, governs Organizations; it does not own Repository content by default.
5. Organization owns Repositories; it is not the primary collaboration Container.
6. User identity is distinct from Membership, Collaborator, Owner, Admin, and Context labels.
7. Membership is a Relationship; `Member` is a derived label.
8. Team, if accepted, is an Organization-scoped Principal; selected Team never becomes authorization input by itself.
9. Collaborator/Outside Collaborator remain derived classifications.
10. Authentication establishes Actor identity; authorization remains a separate decision.
11. Principal is distinct from Actor and Context.
12. Grant is an authority Relationship; Effective Authorization is derived state.
13. Capability is the authorization decision primitive; Role is an assignment/explanation bundle.
14. Policy constrains candidate authority/behavior; it must not silently grant content access.
15. Every normal collaborative Artifact belongs to exactly one Repository until an explicit cross-Repository model is accepted.
16. Project/Workspace/Feed/Notification/Audit/Analytics are Projections unless independent lifecycle evidence proves otherwise.
17. Workflow Definition and Workflow Run remain definition Artifact vs Process execution.
18. Historical Evidence is append-oriented; Projections may be rebuilt without redefining source semantics.
19. No GitHub-inspired feature may create a second Repository-equivalent Container without a falsifying use case.
20. Provider/framework/database models implement Product semantics; they cannot define or silently change them.

Any new feature violating an invariant must reopen the Product Contract before implementation rather than introducing a local exception.

---

## 22. Domain and persistence projection rules

The ontology must not mechanically produce modules/tables such as:

```text
packages/domain/src/actor/
packages/domain/src/scope/
packages/domain/src/container/
packages/domain/src/relationship/
packages/domain/src/artifact/
packages/domain/src/process/

actors
scopes
containers
relationships
artifacts
processes
principals(type, id)
```

Those words classify semantics; concrete business concepts own actual identity/lifecycle/invariants.

Rules:

- Do not create a `collaborator` Domain aggregate; derive Collaborator from effective Repository access.
- Do not create `Member` as a User subtype; Organization Membership owns belonging state.
- Keep User Grant persistence typed while User is the only accepted persisted Principal.
- Add Team only when a real second Organization-scoped Principal source is required.
- Add Enterprise only when real cross-Organization governance requires independent identity/lifecycle.
- Do not create Issue, Discussion, Change Request, Workflow, App, Project, Label, Milestone, Release, Branch, Commit, or Merge entities because GitHub exposes those names.
- Do not create a generic policy engine before multiple typed constraints prove stable repetition.
- Do not move authorization to individual Artifact types while Repository authorization remains the sufficient boundary.
- Keep Role/Capability mapping under one Domain owner; SQL/UI project the meaning rather than redefining it.
- Keep Context out of authorization inputs unless a selected value first resolves to an accepted persisted Relationship/State.
- Keep Evidence append semantics distinct from presentation Projections.

A new Domain contract is accepted because it owns a coherent business problem, identity/lifecycle, invariants, failure semantics, and reusable decisions—not because it maps to one ontology label.

---

## Compact semantic law

> **Enterprise governs, Organization owns, User acts, Principal receives authority, Repository contains collaboration, Relationship connects belonging and authority, Artifact carries work, Process changes state, Capability decides, and Event records what happened.**

The irreplaceable product center remains:

```text
Repository
=
No-Code Collaboration Container
```

## Minimum discriminating tests

1. **Second Artifact**: a behaviorally different Artifact reuses Repository ownership/authorization/history without redefining Repository.
2. **Second Principal**: a future Team Principal adds an authority source without changing Actor identity, Capability meanings, or Context rules.
3. **Cross-Organization governance**: a future Enterprise constraint limits Organization behavior without owning Repository or granting content access.
4. **Context invariance**: selected Organization/Team/Project changes presentation but not authorization for identical Actor/target/relationships/policies.
5. **Derived collaborator**: removing the final authority source removes future Collaborator classification without rewriting User identity/history.
6. **Change abstraction**: a reviewed no-code change works without requiring Git Branch/Commit/Merge semantics.
7. **Projection separation**: Feed/Notification/Audit/Project views evolve without changing canonical Artifact/authority/fact truth.
