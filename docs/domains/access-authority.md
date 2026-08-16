# Domain Contract: Access Authority

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-16

## Problem owned and success condition

The platform must determine and explain:

> Which Actor may perform which accepted no-code action on which Repository-scoped target, through which persisted relationship or public baseline, under which target-state and governance constraints, and why?

This contract succeeds only when Domain, Application, PostgreSQL/RLS, Web delivery, and tests give the same answer without treating Role, public visibility, ownership, Membership, Context, or target relationships as interchangeable facts.

## GitHub benchmark evidence boundary

The benchmark is the public `github/docs` repository, but its directories do not represent the same kind of truth.

```text
github/docs/content/**
= GitHub product-documentation source used as product-semantics evidence

github/docs/src/**
= implementation of docs.github.com content loading/rendering/testing
≠ GitHub.com product source code
```

Therefore this project reverse-engineers product behavior from `github/docs/content` and uses `github/docs/src` only to verify how the documentation source is processed. We never infer GitHub.com implementation architecture from the docs-site source tree.

The no-code derivation rule is:

```text
GitHub documented Repository behavior
− Code / Git / Branch / Pull Request / Actions / Release mechanics
=
Surviving no-code collaboration and authorization semantics
```

Current upstream evidence establishes these surviving facts:

- Organization-owned Repository roles are `read | triage | write | maintain | admin`.
- Managing individual, team, or outside-collaborator Repository access is Admin-only.
- Personal-account Repositories use owner/collaborator semantics; a collaborator has Write access rather than the Organization five-role assignment model.
- Public Repository participation allows authenticated actors to create/comment on ordinary Issues and Discussions without fabricating a Repository Role.
- Public Wiki editing is collaborator-sensitive: a public Repository collaborator may edit Wiki content even when their assigned Organization Repository role is Read; public visibility alone does not grant Wiki mutation.
- An Issue author may edit and close/reopen their own Issue independently from the general Triage/Write role thresholds.
- Triage can manage Issues and moderate Discussions without general Page write authority.
- Write-or-higher may continue commenting on an open locked Discussion.
- Announcement Discussions require Maintain or Admin.

## First-principles model

The central correction is:

```text
Role bundle
≠
complete Authorization Decision
```

The complete decision is:

```text
Actor trust state
+
Repository visibility
+
Repository ownership / governance-derived authority
+
Direct Grant Role
+
Target relationship facts
+
Target state
+
Future governance constraints
↓
Capability Decision
```

Role is still a named Capability bundle. It is not allowed to absorb public participation, authorship, selected Context, or other target-specific facts merely to keep a one-dimensional matrix simple.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Actor | Request-time identity state: anonymous or authenticated User |
| Principal | Subject eligible to receive explicit authority; currently User |
| Repository Owner | User or Organization owning the target Repository |
| Direct Grant | User Principal ↔ Repository relationship assigning an owner-kind-valid Repository Role |
| Role | Named baseline Capability bundle |
| Capability | Accepted atomic no-code action |
| Contextual authority | Capability produced by visibility/authentication/target relationship without fabricating a Role |
| Effective Role | Highest persisted/derived Repository Role used for assignment/explanation, never the whole decision |
| Effective Capabilities | Final allowed action set after baseline and contextual rules |
| Context | Navigation/query/presentation state; never an authority source |
| Activity Evidence | Historical fact emitted only by a successful accepted transition |

## Authority sources and contextual rules

### Personal owner

```text
Repository.owner = User U
Actor = U
→ effective Repository Admin
```

No Direct Grant row is fabricated.

### Organization governance

```text
Repository.owner = Organization O
Actor Membership in O = owner | admin
→ effective Repository Admin
```

Ordinary Organization Membership derives no Repository Role.

### Organization-owned Direct Grant

```text
User Principal
→ Direct Grant
→ Read | Triage | Write | Maintain | Admin
```

### User-owned Direct collaborator

```text
User Principal
→ Direct collaborator relationship
→ Write
```

A personal Repository may not assign Read, Triage, Maintain, or Admin as Direct Grant roles. Its owner already derives Admin from ownership.

### Public visibility and authenticated participation

Anonymous public baseline:

```text
repository.view
resource.view
```

Authenticated public baseline additionally includes ordinary participation:

```text
issue.create
issue.comment
discussion.create
discussion.comment
```

These capabilities do **not** create a stored or explained Repository Role.

### Public Wiki collaborator rule

```text
Repository.visibility = public
AND Actor has any persisted/derived Repository Role
→ page.create + page.update
```

The optional GitHub setting that lets every account edit a public Wiki is not admitted by this Product. Public visibility alone therefore remains insufficient for Page mutation.

### Issue author rule

```text
Actor = Issue.createdBy
→ may edit / close / reopen that Issue
```

This relationship-specific permission does not upgrade the Actor to Write or Triage and does not authorize assignment, labels, or moderation of other Issues.

## Static Repository Role bundles

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

Static role bundles are the private/default baseline:

| Role | Baseline no-code capabilities |
| --- | --- |
| Read | `repository.view`, `resource.view`, `issue.create`, `issue.comment`, `discussion.create`, `discussion.comment` |
| Triage | Read + `issue.manage`, `discussion.edit`, `discussion.moderate` |
| Write | Triage + `page.create`, `page.update`, `issue.edit`, `discussion.comment.locked` |
| Maintain | Write + `discussion.announce` |
| Admin | all current Repository Capabilities, including `repository.manage` and `repository.access.manage` |

Contextual rules may add a Capability for a specific target without mutating this static bundle. Examples: public Read collaborator Wiki editing and Issue-author edit/transition.

`repository.create` remains an Owner-Scope decision before a Repository identity exists and is not inherited from an existing Repository Role.

## Direct Grant lifecycle

Repository access management is Admin-only.

Organization-owned Repository:

```text
Absent
→ Admin grants Read | Triage | Write | Maintain | Admin

Existing
→ Admin changes to another accepted Organization Repository Role
→ Admin revokes
```

User-owned Repository:

```text
Absent
→ owner/Admin grants Write collaborator

Existing Write
→ owner/Admin revokes
```

Every transition requires:

1. authenticated Actor;
2. stable Repository target;
3. effective `repository.access.manage`;
4. Actor and target User differ;
5. target User exists;
6. proposed Role is valid for the Repository owner kind;
7. persisted current Role equals the command expected Role; and
8. exactly one state transition commits before matching Evidence is appended.

Read, Triage, Write, and Maintain cannot manage Direct Grants regardless of rank.

## Compare-and-swap and Evidence

```text
Create
→ insert only if Grant absent

Change
→ update WHERE role = expected_role

Revoke
→ delete WHERE role = expected_role
```

A stale write is not success:

```text
result = state-changed
Grant mutation = none
success Evidence = none
```

Only an actual committed transition may emit:

```text
repository_grant.created
repository_grant.role_changed
repository_grant.revoked
```

Raw Data API writes are independently constrained by command context, authenticated attribution, self-target rejection, Admin authority, owner-kind Role validity, and RLS.

## Evidence privacy

Public Repository visibility does not imply raw historical Evidence publication.

```text
Public content/participation baseline
≠
raw activity_events access
```

Raw Activity Evidence currently requires a persisted/derived Repository Role. A future public Activity surface must define an explicit redaction/privacy projection instead of exposing the evidence table.

## Invariants

1. Authentication proves identity/trust state only; it does not prove private Repository authority.
2. Repository is the primary Collaboration / Authorization Boundary.
3. `Context` never changes authority for identical Actor, target, and persisted relationships.
4. Capability is the decision primitive; Role is assignment/bundle/explanation.
5. Role bundle is not the complete Authorization Decision.
6. Public visibility never fabricates a Repository Role.
7. Anonymous public access is read-only.
8. Authenticated public participation may create/comment on ordinary Issues and Discussions.
9. Public Wiki mutation requires a Repository collaborator relationship; public visibility alone is insufficient.
10. Issue authorship may authorize edit/close/reopen of that Issue without granting a higher Repository Role.
11. Current Organization Repository Role vocabulary is `read | triage | write | maintain | admin`.
12. User-owned Direct collaborator assignment is Write-only.
13. Organization-owned Direct Grants may use all five accepted Repository Roles.
14. Direct Repository access management is Admin-only through `repository.access.manage`.
15. Role rank never grants delegation authority by itself.
16. Direct Grant mutation cannot target the acting User.
17. Expected current Role constrains the actual DML, not merely a pre-read.
18. A stale Grant command returns `state-changed`, mutates nothing, and emits no success Evidence.
19. Successful Grant mutation and required Evidence are atomic.
20. Domain/Application and PostgreSQL/RLS must agree; either being more permissive is a security defect.
21. Generic `resource.create`, `resource.update`, and `member.manage` are not current authorization vocabulary.
22. Service credentials never substitute for end-user authority.
23. Public Repository participation never implies raw Audit/Evidence publication.

## Rejected alternatives

### One five-role Direct Grant model for every owner kind

Rejected. It erases GitHub's documented difference between personal owner/collaborator access and Organization granular Repository roles.

### Role-only authorization

Rejected. Public participation, public-Wiki collaborator editing, and Issue-author permissions are documented counterexamples.

### Generic Resource mutation permissions

Rejected. Page, Issue, and Discussion already require distinct action and relationship semantics.

### Lower-role Direct Grant delegation

Rejected. GitHub Repository access management is Admin-only, and the target has no independent no-code need for partial delegation.

### Supplemental SQL correction files

Rejected. Canonical RLS policy belongs in `99_rls.sql`; downstream correction layers create multiple executable truths.

### UI-only enforcement

Rejected. Direct requests, RPCs, and alternative adapters must fail closed independently.

## Minimum discriminating tests

1. Anonymous public Actor can read public Repository content but cannot mutate collaboration artifacts.
2. Authenticated public Actor with no Direct Grant can create/comment on ordinary Issue/Discussion without receiving a Role.
3. Public Read collaborator can create/update Wiki/Page; private Read collaborator cannot.
4. Issue author with Read or public-participation access can edit/close/reopen their own Issue; unrelated Read actor cannot.
5. Triage can manage arbitrary Issue state and moderate Discussion without Page write authority.
6. Write can comment on an open locked Discussion but cannot create Announcement.
7. Maintain can create Announcement but cannot manage Direct Repository access.
8. Admin can manage Direct Grants.
9. Personal Repository accepts only Write Direct collaborator assignment; Organization Repository accepts all five roles.
10. Self-target, forged raw Grant writes, stale expected Role, and false Evidence all fail closed.
11. Raw Activity Evidence remains unavailable to a public actor who has no persisted/derived Repository Role.
12. Changing selected Context cannot change any decision above.
