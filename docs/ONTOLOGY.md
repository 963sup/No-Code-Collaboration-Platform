# Product Ontology

- Status: Canonical semantic expansion
- Contract owner: `docs/PRODUCT.md`
- Scope: GitHub semantic decomposition, ownership, collaboration roles, authorization, evidence, URL/IA admission rules
- Last reviewed: 2026-08-14

> This document expands `docs/PRODUCT.md`. It must not preserve a contradictory older model. When implementation evidence conflicts with Product truth, fix the earliest invalid truth boundary rather than using the implementation as circular proof.

Project invariant:

> **Repository = No-Code Collaboration Container**

GitHub is used in two different ways:

```text
Domain / authorization / persistence
→ reverse-engineer durable mechanism
→ remove Git/code assumptions

URL / IA / navigation / interaction conventions
→ prefer the mature GitHub mental model
→ change only where Git/code semantics require it
```

The target is not a visual clone of GitHub, but it also does not invent different owner/repository navigation merely because the implementation stack is different.

---

## 1. Core semantic roles

```text
Actor
= who performs an action

Scope
= which ownership / administration / governance boundary applies

Principal
= who may receive explicit authority

Container
= where collaboration has one stable boundary

Relationship
= how identities / owners / principals / scopes / containers connect

Artifact
= collaborative work inside a Container

Process
= how Artifact / Relationship state may validly change
```

These are semantic admission roles, not generic Entity/package/table supertypes.

Cross-cutting semantics:

```text
Authorization
= Role / Capability / Policy / Delegation / Effective Authorization

Presentation
= Context / Workspace / Project-style View / Feed / other Projection

Evidence
= Activity Event / future stronger Historical Fact contract
```

One concrete concept may play several roles. A User can be persistent identity, request Actor, direct-grant Principal, and Repository Owner without those meanings collapsing into one abstraction.

---

## 2. Enterprise — future cross-Organization Governance Scope

Status: **Deferred Entity; semantic boundary defined.**

```text
Enterprise
→ governs Organizations
→ constrains allowed organizational behavior
```

Enterprise is not:

```text
Repository Owner by implication
personal Repository parent
collaboration Container
Workspace
implicit Repository Principal
implicit content-access source
```

A future Enterprise Policy may constrain Organization-owned Repository behavior. It must not silently grant Repository content authority.

`Enterprise-grade` is a product quality requirement, not proof that an Enterprise Entity/table is required.

---

## 3. User — persistent human identity and possible Repository Owner

Status: **Canonical.**

```text
User
= persistent human product identity
```

A User may occupy independent roles:

```text
User in authenticated request
→ Actor

User receiving direct Grant
→ Principal

User owning a Repository
→ Repository Owner
```

Therefore:

```text
User ≠ Member
User ≠ Collaborator
User ≠ Role
User ≠ Context
```

Personal Repository ownership is a first-class target capability, not Deferred.

A User participating in GitHub-style Repository URLs needs a globally unambiguous personal owner namespace, represented by a username/handle semantic rather than an Organization Membership.

---

## 4. Organization — persistent organizational identity + membership/admin Scope + possible Owner

Status: **Canonical.**

```text
Organization
= persistent organizational identity
+ Membership boundary
+ Administration / governance Scope
+ possible Repository Owner
```

Organization may own zero or more Repositories, but Repository does not require an Organization parent.

```text
Organization ≠ Actor
Organization ≠ Repository-equivalent Workspace
Organization ≠ mandatory collaboration Container parent
Organization ≠ selected UI Context
```

Boundary sentence:

> **Organization may own collaboration Containers; it is not itself the collaboration Container and it is not the only possible Owner.**

Ordinary Organization Membership remains orthogonal to Repository access.

---

## 5. Repository Owner — typed ownership Relationship

Status: **Canonical.**

```text
Repository Owner
= exactly one User OR one Organization
```

This is a Relationship role, not a new generic Actor/Principal type.

```text
User ──────────┐
               ├── owns → Repository
Organization ──┘
```

Invariants:

1. Exactly one Owner per Repository.
2. Owner type is User or Organization.
3. Ownership is not a direct Grant row.
4. Ownership can contribute explicit governance authority.
5. Changing owner, if transfer is accepted, does not rewrite Repository stable ID or contained Resource IDs.
6. User-owned and Organization-owned Repositories reuse the same collaboration semantics.

Do not implement ownership as an untyped `owner_type + owner_id` record when strong FKs can preserve both concrete owner types.

---

## 6. Owner Namespace — globally unambiguous human routing identity

Status: **Canonical routing requirement.**

Canonical Repository human URL:

```text
/{ownerSlug}/{repositorySlug}
```

Owner slug resolves either:

```text
User username
or
Organization slug
```

Examples:

```text
/alice/personal-crm
/acme/customer-success
```

The owner namespace must be globally unambiguous across User and Organization owners. It is human routing identity, not authorization truth.

```text
ownerSlug
≠ owner stable ID
≠ Repository stable ID
≠ Principal
≠ Context
```

Repository slug is unique within its Owner namespace.

---

## 7. Repository — primary No-Code Collaboration Container

Status: **Canonical core invariant.**

```text
Repository
= Stable Identity Boundary
+ Owner-scoped Human Namespace
+ Collaboration Boundary
+ Authorization Target Boundary
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
User account
generic database bucket
```

Current executable Artifact family:

```text
Repository
└─ Resource
   └─ Page
```

Any future CRM, Document, Task, Database, Form, Workflow, Approval, Discussion, or AI capability must either live inside Repository, project Repository-scoped facts, or prove why a second primary collaboration Container is necessary.

---

## 8. Membership and Member — belonging Relationship, not identity subtype

Status: **Canonical Organization Relationship.**

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

Organization Membership Roles (`member`, `admin`, `owner`) describe Organization-scope governance state. They are not Repository Roles.

---

## 9. Team — future Organization-scoped group Principal

Status: **Deferred.**

If accepted:

```text
Team
= Organization-scoped group Principal
```

```text
Organization
└─ Team
   ├─ Team Membership → User
   └─ Repository Team Grant → Repository
```

Team is not:

```text
authenticated Actor identity
Tenant
Repository Owner
Repository parent
primary collaboration Container
selected UI Context authority source
```

Critical invariant:

```text
Selected Team ≠ Team Principal resolution
```

---

## 10. Collaborator / Outside Collaborator — derived access labels

Status: **Derived classification.**

```text
Collaborator(user, repository)
= EffectiveAuthorization(user, repository)
  includes repository.view
```

For an Organization-owned Repository:

```text
OutsideCollaborator(user, organization)
= User has effective access to Repository owned by organization
AND NOT Member(user, organization)
```

For a User-owned Repository there is no Organization membership axis, so `Outside Collaborator` is not applicable merely because another User has access.

Do not create Collaborator/ExternalUser identity tables from these labels.

---

## 11. Principal and Grant — authority subject and explicit authority Relationship

Status: **Canonical authorization primitives; implemented Principal minimum = User.**

```text
Principal
= subject that may receive explicit authority
```

Current:

```text
Principal → User
```

Future candidates:

```text
Principal → Team | App
```

```text
Grant
= Principal ── receives Repository Role for ──> Repository
```

Ownership is not a Grant. A User may be both Owner and Principal, but those are independent causal relationships.

Do not create a generic `principals(type,id)` persistence table merely because Domain vocabulary has Principal abstraction.

---

## 12. Role and Capability — bundle vs decision primitive

Status: **Canonical.**

```text
Role
= named Capability bundle

Capability
= atomic authorization action on a defined target
```

Current Repository capabilities include:

```text
repository.view
repository.manage
resource.view
resource.create
resource.update
resource.delete
member.manage
```

```text
Role ≠ Authority truth
Capability ≠ UI visibility
Organization Admin ≠ Repository Admin identity
```

Capability remains decision truth; Role remains assignment/explanation vocabulary.

---

## 13. Effective Authorization — owner-neutral derived decision

Status: **Canonical decision model.**

Accepted target authority sources:

1. Personal Repository ownership → User owner gets Repository admin authority.
2. Organization owner/admin relationship → Repository admin only for Repository owned by that Organization.
3. Direct User Repository Grant → assigned Role.
4. Public visibility → accepted read baseline.

Ordinary Organization Membership contributes no Repository Role.

```text
Actor
→ Target Repository
→ inspect Owner relationship
→ resolve accepted governance authority
→ resolve Principal Grants
→ add accepted visibility baseline
→ apply governance constraints
→ apply target-state preconditions
→ Capability decision
```

Application callers pass stable Actor/Repository identity. They must not inject an `organizationId` assumption into authorization; the authority resolver reads Repository ownership itself.

`organization` visibility is rejected from current target truth because it has no accepted effective-access behavior. Future Organization-wide visibility/base permission requires its own contract.

`Highest Role` may explain nested fixed Role sources; it is not canonical persisted access truth.

---

## 14. Issue — candidate actionable Artifact

Status: **Deferred candidate semantics.**

```text
Issue
= Repository-scoped actionable work Artifact
```

May represent Task, Request, Bug, Incident, Approval, Feature, Follow-up, or tracked Question.

Issue is not a Container.

---

## 15. Discussion — candidate conversation/shared-understanding Artifact

Status: **Deferred candidate semantics.**

```text
Discussion
→ something should be understood / decided

Issue
→ something should be done / tracked
```

Discussion remains Repository-scoped unless evidence proves another lifecycle owner.

---

## 16. Pull Request benchmark → Change Request abstraction

Status: **Git-specific target name rejected; durable mechanism retained as candidate.**

```text
Proposed State Change
→ Review
→ Decision
→ Apply / Reject
```

Target candidate:

```text
Change Request
= proposed-change Artifact
+ review / decision Process
```

Do not inherit Branch, Commit, Merge, Git transport, or code-diff semantics by default.

---

## 17. Project — planning Projection, never competing Container

Status: **Derived/deferred planning surface.**

```text
Project
= planning Projection / View over existing Repository-scoped work/change Artifacts
```

Cross-Repository presentation does not create cross-Repository ownership or authority.

```text
Project ≠ Artifact owner
Project ≠ Repository parent
Project ≠ authorization boundary
Project ≠ primary collaboration Container
```

---

## 18. Workflow — definition Artifact + Process execution

Status: **Deferred candidate semantics.**

```text
Workflow Definition
= Repository-scoped Artifact describing Trigger + Conditions + Actions

Workflow Run
= Process execution instance / outcome
```

Definition and execution must remain distinct.

---

## 19. App and Installation — machine identity + access Relationship

Status: **Deferred candidate semantics.**

```text
App
= machine identity
= possible Actor and/or Principal

Installation
= App ↔ User/Organization/Repository access Relationship
```

App identity and Installation lifecycle are distinct. Integration is not an ordinary Repository Resource by default.

---

## 20. Activity Event and Projections — historical Evidence, not feed truth

Status: **Partially executable baseline.**

```text
Accepted Action / Process
→ Activity Event
├─ Activity Feed
├─ Notification
├─ Audit View
├─ Analytics
└─ future Automation input
```

```text
Event = historical Evidence
Feed / Notification / Audit / Analytics = Projections
```

Current Activity Event envelope is not automatically a complete enterprise audit store. Stronger completeness/retention/causality/rebuild guarantees require a deliberately stronger fact contract.

---

## 21. Product relationship architecture and invariants

```text
                         future Enterprise
                               │ governs
                               ▼
                         Organization
                         │ membership
                         │
User identity ───────────┼────────────────────┐
  │                      │                    │
  │ may own              │ may own            │ future Team Principal
  ▼                      ▼                    │
Repository Owner ─────> Repository <──────────┘ authority
(User or Org)             Container
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
         Artifacts        Processes        Evidence
         Resource/Page    Commands         Activity Event
         future work      State change          │
                                             Projections
```

The system is not one containment tree such as:

```text
Enterprise → Organization → Team → Repository
```

because governance, membership, ownership, group authority, containment, and presentation are different relationships.

Canonical invariants:

1. Repository is the primary no-code collaboration Container.
2. Repository Owner is exactly one User or Organization.
3. Personal ownership is first-class, not Deferred.
4. Organization may own Repositories but is not a mandatory Repository parent.
5. Enterprise, if accepted, governs Organizations and does not become Repository Owner by implication.
6. User identity is distinct from Actor, Membership, Collaborator, Role, Principal, and Context meanings.
7. Membership is Relationship; Member is derived label.
8. Team, if accepted, is Organization-scoped Principal; selected Team never becomes authority input by itself.
9. Collaborator/Outside Collaborator remain derived.
10. Authentication establishes Actor identity only.
11. Ownership and explicit Grant remain separate authority facts.
12. Capability is decision primitive; Role is bundle/explanation.
13. Policy constrains; it must not silently grant content access.
14. Every normal Artifact belongs to exactly one Repository until explicit cross-Repository model is accepted.
15. Project/Workspace/Feed/Notification/Audit/Analytics are Projections unless independent lifecycle proves otherwise.
16. Workflow Definition and Workflow Run remain Artifact definition vs Process execution.
17. Historical Evidence is append-oriented; Projection changes cannot rewrite source semantics.
18. No GitHub-inspired feature may create a second Repository-equivalent Container without falsifying evidence.
19. Canonical Repository URL is Owner namespace + Repository slug; internal implementation prefixes are not product identity.
20. Provider/framework/database projections cannot define or silently change Product truth.

---

## 22. Domain, persistence, URL, and UI projection rules

The ontology must not mechanically create:

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
principals(type,id)
```

Concrete rules:

- Model Repository ownership with typed User/Organization relationships, not an untyped polymorphic owner ID.
- Maintain globally unambiguous User/Organization owner slugs for `/{owner}/{repository}`.
- Do not create Collaborator aggregate; derive it from effective Repository access.
- Do not create Member as User subtype.
- Keep User Grant persistence typed while User is the only accepted persisted Principal.
- Add Team only when a second group authority source is actually required.
- Add Enterprise only when cross-Organization governance is actually required.
- Do not create Issue/Discussion/Change Request/Workflow/App/Project/Branch/Commit/Merge entities because GitHub exposes those names.
- Do not create generic policy engine before typed constraints repeat.
- Keep Repository as authorization/containment boundary for Artifacts unless a real counterexample proves insufficient.
- Keep Role/Capability mapping under one Domain owner; SQL/UI project it.
- Keep Context out of authorization inputs unless a selected value resolves to an accepted persisted fact that would be used independently of UI selection.
- Keep Evidence semantics distinct from presentation Projections.
- Prefer GitHub-style owner/repository URL and Repository navigation conventions when the target relationship is the same; do not let Next.js folder names create product URLs such as `/app/{owner}/{repository}`.
- A green browser suite is only evidence for journeys actually covered. Repository dashboard → card click → canonical Repository → Page → Activity must be an explicit browser contract.

A new Domain contract is accepted because it owns a coherent problem, identity/lifecycle, invariants, failure semantics, and reusable decisions—not because it maps to an ontology label.

---

## Compact semantic law

> **User acts and may own; Organization administers and may own; Enterprise may govern; Principal receives explicit authority; Repository contains collaboration; Relationship connects ownership/belonging/authority; Artifact carries work; Process changes state; Capability decides; Event records what happened.**

Irreplaceable center:

```text
Repository = No-Code Collaboration Container
```

Minimum discriminating tests:

1. Personal owner Repository and Organization owner Repository share the same Resource/authorization/history behavior.
2. User username and Organization slug cannot collide as canonical owner namespace.
3. `/app` Repository card click lands on `/{owner}/{repository}`.
4. Personal Owner adds authority without a fabricated Grant.
5. Organization admin authority applies only to Repositories owned by that Organization.
6. Future Team adds a second Principal source without changing Actor/Context semantics.
7. Future Enterprise constraint limits Organization behavior without owning Repository or granting content access.
8. A reviewed no-code change works without Branch/Commit/Merge semantics.
9. Feed/Notification/Audit/Project views can change without rewriting Artifact/authority/evidence truth.
