# Domain Contract: Access Authority

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-16

## Problem owned and success condition

The platform must determine and explain:

> Which authenticated Actor may perform which accepted no-code action on which Repository-scoped target, through which authority source, under which constraints, and why?

This contract succeeds when User-owned and Organization-owned Repositories use one GitHub-derived Repository Role vocabulary, action-specific Capability decisions, and independently enforced Direct Grant lifecycle without treating ownership, Membership, selected Context, Role rank, or provider metadata as interchangeable authority facts.

## First-principles derivation

GitHub is evidence for mature Repository collaboration and access semantics, not an implementation template.

The derivation rule for Repository authorization is:

```text
GitHub Repository access behavior
− Source Code / Git / Pull Request / Branch / Actions / Release permissions
=
Surviving No-Code Repository authority semantics
```

The current surviving Repository Role vocabulary is:

```text
read | triage | write | maintain | admin
```

The roles remain distinct only because currently accepted no-code GitHub mechanisms remain distinct:

- Read can read and participate in ordinary Issue/Discussion collaboration.
- Triage can manage Issue work and moderate Discussions without general content write authority.
- Write can mutate Page/content and participate in an open locked Discussion.
- Maintain adds accepted non-sensitive Repository maintenance, currently Announcement creation.
- Admin owns sensitive Repository settings and Direct Repository access management.

Managing individual/team/outside-collaborator Repository access is Admin-only in the benchmark. The target therefore does not invent partial Direct Grant delegation for Maintain or any lower Role.

The superseded target vocabulary `viewer | contributor | manager | admin` and generic mutation capabilities `resource.create | resource.update | member.manage` are not current Domain truth. They collapsed heterogeneous Repository surfaces and produced target-only delegation behavior.

## Evidence ledger

### Observations

- Repository ownership is typed `User | Organization`.
- Database stores Direct User-to-Repository Grant relationships.
- Personal ownership and Organization owner/admin governance already derive Repository Admin without fabricated Grant rows.
- Ordinary Organization Membership contributes no Repository Role.
- Page, Issue, and Discussion are accepted no-code Repository Artifacts with distinct lifecycle semantics.
- RLS independently enforces row access; UI visibility is not sufficient enforcement.
- Direct Grant create/change/revoke now exists as an Application/SQL command lifecycle with same-transaction Activity Evidence.
- GitHub's Repository Role matrix distinguishes participation, work moderation, write authority, maintenance, and sensitive access/settings administration.

### Hard constraints

- Authentication and authorization remain separate.
- Repository ownership and explicit Grant remain separate Relationships.
- UI Context cannot alter server-side authorization facts.
- Domain/Application cannot depend on Supabase Rows/DTOs/clients/generated types.
- Database enforcement fails closed independently from Application explanation.
- Repository Roles cannot gain target-only permissions merely to preserve an old abstraction.
- A benchmark permission is excluded when its value depends on rejected Code/Git mechanics.
- Service credentials never become browser/end-user authority.
- An unaccepted Product operation is absent from current Capability vocabulary.
- A successful authority mutation cannot be recorded unless the actual state transition and required Evidence commit atomically.

### Assumptions

- GitHub's five Repository Roles are sufficient for current accepted no-code surfaces.
- Fixed Role bundles are sufficient until real use cases prove custom roles necessary.
- Additive authority sources are sufficient before explicit deny/policy caps are proven necessary.
- Repository remains the primary explicit Grant scope.
- Current Principal minimum is User.

### Unknowns

- Whether Team is required as a second shared Principal.
- Whether future Enterprise/Organization policy must cap otherwise granted Capabilities.
- Whether custom roles, temporary/conditional/resource-specific Grants, or explicit deny become necessary.
- Whether a future self-leave Repository lifecycle is required.
- Which additional GitHub Maintain/Admin behaviors survive once corresponding no-code Product surfaces are admitted.

### Value choices

- Preserve GitHub Role vocabulary when its no-code collaboration mechanism survives; do not rename it for target familiarity.
- Prefer action-specific Capability decisions over generic mutation categories.
- Prefer least privilege and fail closed.
- Prefer one semantic decision projected independently into Domain/Application/PostgreSQL/UI explanation.
- Prefer actual state transition Evidence over requested-command Evidence.

## Boundary and owner

This contract owns:

- Repository Role definitions as bundles of accepted no-code Capabilities;
- owner-scoped `repository.create` policy before a Repository identity exists;
- Direct Principal-to-Repository Grant semantics;
- ownership/governance-derived Repository authority sources;
- effective Capability calculation;
- Admin-only Direct Grant create/change/revoke rules;
- authorization explanations; and
- semantic consistency between Domain decisions and enforcement projections.

This contract does not own:

- authentication credential lifecycle;
- Repository creation mechanics or ownership lifecycle;
- Organization/Team Membership lifecycle;
- Page/Issue/Discussion subtype transition validity;
- Repository/Resource destructive lifecycle;
- UI navigation/selected Context;
- provider session transport;
- PostgreSQL syntax; or
- Audit/feed presentation.

## Semantic role mapping

```text
Actor
= authenticated User attempting action

Scope
= Repository Owner relationship + applicable Organization/future Enterprise governance scope

Principal
= subject eligible to receive explicit Repository authority; currently User

Container
= Repository

Relationship
= Repository ownership, Membership, Direct Grant; future Team/App only when proven

Artifact
= Repository-contained Page, Issue, Discussion, or future accepted work type

Process
= accepted authorization-sensitive command/transition, including Direct Grant mutation
```

`Role`, `Capability`, future Policy, Context, and Activity Evidence remain distinct cross-cutting semantics.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Actor | Authenticated User attempting an action |
| Repository Owner | User or Organization owning the target Repository |
| Principal | Subject eligible to receive explicit authority; currently User |
| Direct Grant | Principal ↔ Repository Relationship assigning one Repository Role |
| Governance authority source | Ownership/administration Relationship deriving Repository authority without a Grant |
| Role | GitHub-derived named Capability bundle |
| Capability | Specific accepted no-code action on a defined target |
| Effective Capabilities | Capabilities produced from accepted authority sources after constraints/state preconditions |
| Repository access management | Admin-only create/change/revoke/read-management of Direct Grants |
| Context | Selected navigation/filter/view; never an authority source |
| Collaborator | Derived User classification from effective Repository access |
| Authorization explanation | Trace of ownership/governance/Grant/visibility/constraint facts producing a decision |

## Authority sources

### Personal ownership

```text
Repository.owner = User U
Actor = U
→ Repository Admin
```

This is not a Direct Grant row.

### Organization governance

```text
Repository.owner = Organization O
Actor Membership in O = owner | admin
→ Repository Admin
```

This is not ordinary Organization-member access and not a Direct Grant row.

### Direct User Grant

```text
User Principal
→ Direct Grant
→ Repository Role
→ accepted Capabilities
```

### Public visibility

Public visibility contributes accepted read baseline semantics only. It does not create a Role, Principal Grant, mutation authority, or raw historical-evidence publication rule.

## Repository Roles and Capabilities

Current Capability vocabulary:

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

Current Role bundles:

| Role | Current no-code capabilities |
| --- | --- |
| Read | `repository.view`, `resource.view`, `issue.create`, `issue.comment`, `discussion.create`, `discussion.comment` |
| Triage | Read + `issue.manage`, `discussion.edit`, `discussion.moderate` |
| Write | Triage + `page.create`, `page.update`, `issue.edit`, `discussion.comment.locked` |
| Maintain | Write + `discussion.announce` |
| Admin | all current Repository Capabilities, including `repository.manage` and `repository.access.manage` |

`repository.create` remains a separate Owner-Scope Capability before a Repository identity exists. It is not inherited from any existing Repository Role.

Resource hard deletion remains unavailable and has no Capability.

Role rank may support highest-effective-role explanation. Rank does not determine delegation authority.

## Effective authorization

Conceptual chain:

```text
Actor
→ stable Repository target
→ inspect Repository Owner
→ collect ownership/governance authority
→ collect Direct Principal Grants
→ add accepted visibility baseline
→ apply governance constraints
→ apply target-state preconditions
→ Capability decision
```

Application authority readers accept stable `actorId + repositoryId`; callers cannot supply owner/Organization assumptions as authorization truth.

Repository creation is the pre-identity exception:

```text
Actor
→ requested typed Owner Scope
→ personal ownership or Organization Membership facts
→ repository.create policy
→ authorized Owner passed to creation mechanics
```

## Direct Grant lifecycle

```text
Absent
  └── Admin grants Read | Triage | Write | Maintain | Admin

Existing Direct Grant
  ├── Admin changes Role
  └── Admin revokes
```

Every transition requires:

1. authenticated Actor;
2. stable target Repository;
3. effective `repository.access.manage` Capability;
4. Actor and target User differ;
5. target User exists;
6. persisted target current Role equals command expected Role;
7. proposed Role is accepted; and
8. exactly one state transition commits with exactly one corresponding Activity Evidence fact.

Read, Triage, Write, and Maintain cannot manage Direct Grants, regardless of relative Role rank.

The Direct Grant management projection is Admin-only. A non-Admin actor must not use raw table SELECT to enumerate Direct Grant Role assignments.

## Compare-and-swap and historical Evidence

Optimistic concurrency belongs at the write boundary.

```text
Create
→ insert only if Grant is absent

Change
→ update only WHERE role = expected_role

Revoke
→ delete only WHERE role = expected_role
```

A pre-read alone is not sufficient. If the write affects zero rows because another command changed the Grant first:

```text
result = state-changed
Grant state = unchanged by stale command
Activity Evidence = none for stale command
```

Only an actual committed transition may emit:

```text
repository_grant.created
repository_grant.role_changed
repository_grant.revoked
```

Each fact records authenticated Actor, target User, Repository, actual previous/resulting Role, and timestamp without copying secrets.

## Surface-specific state rules

Authorization and target-state validity remain separate decisions.

Examples:

- A Read actor may comment on an ordinary open Discussion.
- Triage may moderate/lock a Discussion but does not gain Page write authority.
- An open locked Discussion blocks ordinary Read/Triage comments; Write/Maintain/Admin carry `discussion.comment.locked` and may continue commenting.
- Closed Discussion rejects new comments regardless of Role.
- Maintain may create Announcement because that GitHub maintenance responsibility survives no-code subtraction; it still cannot manage Repository access.
- Triage may manage Issue workflow/classification/responsibility while Issue body editing remains Write+.

The subtype Domain owns whether a requested transition is valid; Access Authority owns whether the Actor carries the required action Capability.

## Invariants

1. Valid Session proves identity only, never Repository access.
2. Authorization targets stable Repository/Resource IDs, not slug, tab, URL, or selected Context.
3. UI visibility is never sole enforcement.
4. Capability is authorization decision primitive; Role is bundle/explanation.
5. Direct Grant connects one Principal, one Repository, one Role.
6. Repository ownership and Direct Grants remain distinct facts.
7. Personal owner derives Repository Admin only for that User-owned Repository.
8. Organization owner/admin derives Repository Admin only for Repositories owned by that Organization.
9. Ordinary Organization Membership derives no Repository Role.
10. Public visibility grants only accepted read baseline semantics.
11. Current Repository Role vocabulary is `read | triage | write | maintain | admin`.
12. Current mutation Capabilities are surface-specific; generic `resource.create`, `resource.update`, and `member.manage` are not current authorization vocabulary.
13. Direct Repository access management is Admin-only.
14. Role rank never grants delegation authority by itself.
15. Direct Grant delegation cannot target the acting User.
16. Raw Data API cannot bypass the accepted Direct Grant command or fabricate `granted_by`.
17. Direct Grant target existence is checked only after Admin access-management authority is established.
18. Expected current Role is part of the actual DML precondition.
19. A stale Grant command changes no authority and emits no success Evidence.
20. A successful Grant create/change/revoke commits exactly one transition plus matching same-transaction Activity Evidence.
21. Domain/Application and PostgreSQL enforcement must agree; either being more permissive is a security defect.
22. Service/secret credentials never substitute for end-user authorization.
23. Context/Projection never grants authority.
24. Unaccepted Product operations are absent from current Capability bundles.
25. `repository.create` is decided against an Owner Scope and never inherited from an existing Repository Role.

## Rejected alternatives

### Target-friendly aliases for GitHub Repository Roles

Rejected. Viewer/Contributor/Manager renamed mature benchmark concepts and allowed target code to reinterpret Manager as an access delegator.

### Generic Resource mutation permissions

Rejected. Page, Issue, and Discussion already prove distinct action semantics; generic create/update erased Triage/Write/Maintain differences.

### Lower-role Direct Grant delegation

Rejected until an independent no-code Product problem and discriminating test prove a need. GitHub Repository access management is Admin-only.

### UI-only role filtering

Rejected because direct requests and alternate clients bypass presentation.

### Database-only Domain model

Rejected because RLS is enforcement projection, not provider-neutral Product explanation.

### Pre-read optimistic concurrency

Rejected because check-then-act can observe stale state under concurrency and can fabricate historical Evidence unless the expected value constrains the actual write.

## Falsification conditions

Reopen when:

- real no-code workflows require a Role/Capability combination the GitHub-derived matrix cannot express without repeated exceptions;
- a genuine collaboration need requires non-Admin Repository access delegation;
- fixed Role bundles cause pervasive exceptions;
- a second Principal type proves incompatible Grant/revocation semantics;
- policy caps require explicit deny; or
- Domain/Application/PostgreSQL cannot express the same decisions without contradictory logic.

## Minimum discriminating tests

1. Personal owner receives Repository Admin without fabricated Direct Grant.
2. Organization owner/admin receives Repository Admin for Organization-owned Repository; ordinary member does not.
3. Read can read and participate in ordinary Issue/Discussion collaboration but cannot update Page or manage Direct Grants.
4. Triage can manage Issue/Discussion state but cannot update Page or manage Direct Grants.
5. Write can update Page and comment on an open locked Discussion but cannot create Announcement or manage Direct Grants.
6. Maintain can create Announcement but cannot manage Direct Grants.
7. Admin can create/change/revoke Direct Grants to every accepted Repository Role.
8. Non-Admin management projection and raw Grant enumeration are unavailable.
9. Self-target Direct Grant mutation is rejected in Domain/Application and PostgreSQL.
10. Forged raw Grant mutation/attribution fails closed.
11. Stale expected Role changes zero rows, returns `state-changed`, and emits no success Evidence.
12. Successful create/change/revoke each change exactly one relationship and emit exactly one matching Activity Evidence fact.
13. Closed Discussion rejects all new comments; locked open Discussion admits only Roles carrying `discussion.comment.locked`.
14. Changing Context cannot change authority for identical Actor/Repository/persisted facts.
15. Any current Capability not backed by an accepted no-code action fails this contract and must be removed or independently justified.
