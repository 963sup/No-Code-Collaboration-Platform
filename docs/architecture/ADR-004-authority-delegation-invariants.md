# ADR-004: GitHub-derived Repository Roles and authority mutation

- Status: Accepted
- Date: 2026-08-16
- Decision owner: Repository owner
- Affected scopes: Product access semantics, Domain access policy, Application commands, Repository Grants, Supabase RLS/RPCs, Activity Evidence, authorization tests

## Decision

Repository authorization uses GitHub's mature Repository Role vocabulary after removing permissions whose value depends on Source Code, Git, Pull Requests, Branches, Actions, Releases, or other rejected software-development mechanics.

Current Repository Roles are therefore:

```text
read | triage | write | maintain | admin
```

Role names are not target inventions. Their accepted no-code meaning comes only from GitHub behaviors that survive the subtraction test against current product surfaces:

| Role | Surviving no-code responsibility in the current product |
| --- | --- |
| Read | read Repository content; participate in ordinary Issue/Discussion collaboration |
| Triage | Read + manage Issue workflow/classification/responsibility and moderate Discussions |
| Write | Triage + mutate Page/content and comment on open locked Discussions |
| Maintain | Write + accepted non-sensitive Repository maintenance, currently Announcement creation |
| Admin | all current capabilities + sensitive Repository settings and Direct Repository access management |

Direct User Repository access management is Admin-only. Read, Triage, Write, and Maintain do not create, change, revoke, or enumerate the Direct Grant management projection.

The old target Roles `viewer | contributor | manager | admin` and generic `resource.create | resource.update | member.manage` authorization vocabulary are superseded as current truth. They compressed heterogeneous GitHub surfaces into one artificial hierarchy and then used `member.manage` to manufacture a difference between Contributor and Manager. That abstraction created target-only delegation behavior that GitHub does not support.

## GitHub benchmark evidence

The decision is grounded in current GitHub Repository behavior rather than target naming preference:

- GitHub Organization repositories use the Repository roles Read, Triage, Write, Maintain, and Admin.
- Managing individual, team, and outside-collaborator access is an Admin permission; Maintain does not manage Repository access.
- Triage exists to manage work/conversation without general write authority, including Issue management and Discussion moderation.
- Write or greater can edit a private Repository wiki and can continue participating in a locked Discussion where ordinary participants cannot.
- Maintain/Admin can create Announcement-category Discussions.

Only those currently applicable no-code mechanisms are admitted. Code/Git-specific permissions remain rejected rather than renamed.

## Product semantics

### Role is assignment; Capability is decision truth

```text
Role
= named bundle of accepted actions

Capability
= one accepted authorization decision on one defined target/action
```

Current Capability families are deliberately surface-specific:

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

`resource.view` remains the shared read baseline for Repository-contained content. Mutation is not generic because Page, Issue, and Discussion have materially different GitHub-derived action semantics.

### Direct Grant lifecycle

```text
Absent
  └─ Admin grants Read | Triage | Write | Maintain | Admin

Existing Direct Grant
  ├─ Admin changes Role
  └─ Admin revokes
```

Direct Grant delegation cannot target the acting User. A future self-leave lifecycle is a separate Product operation and is not fabricated inside delegation.

Organization Membership remains a belonging/governance relationship and does not become Repository access by implication.

### Ownership/governance authority

Repository ownership remains a separate causal fact:

```text
User owns Repository
→ that User derives Repository Admin

Organization owns Repository
+ Actor is Organization owner/admin
→ Actor derives Repository Admin for that Repository
```

No synthetic Grant row is created for ownership/governance authority.

## Authority mutation integrity

A Direct Grant command is a state transition, not a blind row write.

The accepted mutation invariant is:

```text
authenticated Actor
∩ Repository Admin access-management authority
∩ Actor != target User
∩ target User exists
∩ persisted current Role == expected Role
∩ proposed Role is accepted
→ exactly one Grant transition
→ exactly one matching Activity Evidence fact
```

The expected current Role must be part of the persistence write precondition. A separate pre-read followed by unconditional UPDATE/DELETE is not optimistic concurrency.

For current PostgreSQL enforcement:

```text
Create
→ INSERT ... ON CONFLICT DO NOTHING
→ exactly one inserted row or state-changed

Change
→ UPDATE ... WHERE role = expected_role
→ exactly one updated row or state-changed

Revoke
→ DELETE ... WHERE role = expected_role
→ exactly one deleted row or state-changed
```

`ROW_COUNT != 1` means no accepted transition occurred. The command returns changed state and MUST NOT emit `repository_grant.created`, `repository_grant.role_changed`, or `repository_grant.revoked`.

Activity Evidence is written only after the actual transition succeeds, in the same transaction. Its previous/resulting Roles describe the transition that actually committed.

## Database enforcement

RLS remains an independent security boundary.

- Raw authenticated `repository_user_grants` INSERT/UPDATE/DELETE is not an accepted command path.
- Direct Grant management projection/table reads require `repository.access.manage`, so non-Admin roles cannot enumerate Direct Grant Roles through the Data API.
- Command-local PostgreSQL settings are execution provenance only; they never replace Actor identity or Capability checks.
- `granted_by` must equal `auth.uid()`.
- Grant target existence is checked only after Repository access-management authority is established; the Auth user table is not an unauthorised existence oracle.
- `SECURITY DEFINER` helpers use `search_path = ''`, fully qualified relations, caller-aware authorization, and selective grants.

## Organization delegation remains separate

This ADR does not collapse Organization governance roles into Repository Roles.

| Organization Actor | Membership Roles it may manage/assign |
| --- | --- |
| owner | member, admin, owner |
| admin | member, admin |
| member | none |

An Organization that remains present must retain at least one owner. The owner-continuity trigger serializes that cross-row invariant. ADR-006 independently keeps destructive Organization/Repository lifecycle unavailable to end users.

## Rejected alternatives

### Preserve `manager` by letting it manage lower Direct Grants

Rejected. This behavior was introduced only to differentiate an invented target Role after heterogeneous Repository actions had been collapsed into `resource.*` and `member.manage`. GitHub reserves individual/team/outside-collaborator access management to Admin.

### Rename GitHub Roles into target-friendly aliases

Rejected. Renaming Read/Triage/Write/Maintain into Viewer/Contributor/Manager discards benchmark semantics and encourages target-specific reinterpretation. URL terminology and Domain terminology may differ when there is a product reason; Repository Role semantics have no such reason here.

### Keep generic `resource.create` / `resource.update`

Rejected for authorization. Page, Issue, and Discussion mutations are not one permission in the GitHub model and already have different accepted lifecycles. Generic mutation capabilities caused Triage/Write/Maintain distinctions to disappear.

### Use Role rank as delegation policy

Rejected. Rank is useful for effective-role explanation, but access management is a specific Admin capability, not “any higher Role may manage lower Roles.”

### Check expected Role only before DML

Rejected. Under concurrent transactions, check-then-act can observe stale state. The expected Role must constrain the actual mutation, and affected-row count must decide success before Evidence is written.

### Enforce only in Application or only in RLS

Rejected. Application must explain the Product decision and PostgreSQL must independently prevent alternate-client bypass.

## Consequences

Benefits:

- Repository Roles now preserve GitHub's mature access vocabulary without importing Code/Git mechanics;
- Triage, Write, Maintain, and Admin differ because of real no-code surface responsibilities rather than invented delegation;
- Repository access management is unambiguously Admin-only;
- Page/Issue/Discussion authorization no longer aliases heterogeneous operations through generic mutation capabilities;
- stale concurrent Grant commands cannot fabricate immutable success Evidence; and
- Domain, Application, RLS, Web, and tests have one falsifiable matrix.

Costs:

- more explicit Capability names exist because materially different actions are no longer hidden behind generic `resource.*`;
- existing stored/test Role vocabulary must be migrated together in the LocalOnly baseline; and
- future GitHub-derived Role behavior must repeat the subtraction test instead of assuming that a Role name automatically imports all GitHub permissions.

## Falsification conditions

Reopen this ADR only when direct product evidence proves one of the following:

- a current no-code action cannot be represented by the GitHub-derived five-role matrix without repeated exceptions;
- a real no-code collaboration problem requires a non-Admin actor to manage Repository access;
- custom roles or explicit deny become necessary for observed workflows;
- a new Principal type requires incompatible Grant/delegation behavior; or
- PostgreSQL compare-and-swap enforcement cannot preserve the accepted authority/Evidence invariant.

Do not reopen merely to preserve old target names or because an implementation already contains them.

## Minimum discriminating tests

1. Read can participate in ordinary Issue/Discussion collaboration but cannot update Page or manage Repository access.
2. Triage can manage Issue and Discussion state but cannot update Page or manage Repository access.
3. Write can update Page and comment on an open locked Discussion but cannot create Announcement or manage Repository access.
4. Maintain can create Announcement and perform current non-sensitive maintenance but cannot manage Repository access.
5. Admin can create/change/revoke Direct Grants to every accepted Repository Role.
6. Every non-Admin Direct Grant management attempt fails independently in Domain/Application and PostgreSQL.
7. Self-target Direct Grant delegation fails in Domain/Application and PostgreSQL.
8. Raw Data API Grant mutation and non-Admin Grant enumeration fail closed.
9. A stale expected Role changes zero rows, returns `state-changed`, and emits no success Activity Evidence.
10. A successful create/change/revoke changes exactly one relationship and emits exactly one matching same-transaction Activity Evidence fact.
11. Organization admin cannot create/control Organization owner relationships; owner continuity remains enforced independently.
12. Any Domain/Application/RLS disagreement reopens the earliest inconsistent boundary.
