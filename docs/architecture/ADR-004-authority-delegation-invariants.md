# ADR-004: GitHub-derived Repository authority and Direct Grant integrity

- Status: Accepted
- Date: 2026-08-16
- Decision owner: Repository owner
- Affected scopes: Product semantics, Domain authority, Application commands, Repository Grants, Supabase RLS/RPCs, Activity Evidence, tests

## Decision

Repository authorization is derived from documented GitHub product behavior after subtracting Code/Git-specific mechanics. The current target does **not** treat one Role matrix as the whole decision.

```text
Role-derived baseline
+
Actor trust / Repository visibility
+
target relationships
+
target state
+
future governance constraints
↓
Capability Decision
```

For Organization-owned Repositories, current Repository Roles are:

```text
read | triage | write | maintain | admin
```

Managing individual/team/outside-collaborator Repository access is Admin-only through `repository.access.manage`.

For User-owned personal Repositories, Direct access follows GitHub owner/collaborator semantics: a Direct collaborator is assigned Write. Read/Triage/Maintain/Admin are not valid personal-Repository Direct Grant assignments; the personal owner derives Admin from ownership.

## Evidence boundary: `github/docs/content` vs `github/docs/src`

This ADR uses the public `github/docs` repository as benchmark evidence with a strict boundary:

```text
github/docs/content/**
= product-documentation source
= evidence for documented GitHub product semantics

github/docs/src/**
= docs.github.com implementation
= content rendering/loading/testing code
≠ GitHub.com product implementation source
```

The inspected upstream snapshot was `github/docs` commit `81ade08c26f13325c0cde8a23cd3bfb85bd0778e`.

Relevant product evidence lives under `github/docs/content`, including:

- Organization Repository roles and permission matrix;
- personal-account Repository permission levels;
- Wiki access permissions;
- Issue creation/edit behavior;
- Discussion participation/moderation; and
- Organization Discussion creation policy.

Relevant `github/docs/src` evidence is used only to verify that `content/**` is the documentation source processed by the docs-site render pipeline.

## No-code subtraction

```text
GitHub documented Repository behavior
− Source Code
− Git / Branch / Pull Request
− Actions / Releases
− code-specific administration
=
surviving no-code Repository mechanism
```

Surviving current mechanisms:

| Mechanism | No-code authority consequence |
| --- | --- |
| Organization Repository roles | Read/Triage/Write/Maintain/Admin baseline vocabulary |
| Admin manages people/team/outside-collaborator access | Direct Grant management is Admin-only |
| Personal Repository collaborator | User-owned Direct collaborator assignment is Write-only |
| Public Repository participation | authenticated actor may create/comment ordinary Issue/Discussion without fabricated Role |
| Public Wiki collaborator editing | public collaborator may mutate Page even with Read Role |
| Issue author actions | author may edit/close/reopen own Issue without Role promotion |
| Triage | arbitrary Issue management + Discussion moderation without general Page write |
| Locked Discussion | Write+ may continue commenting while locked |
| Announcement Discussion | Maintain/Admin may create Announcement |

Permissions whose meaning depends on rejected Code/Git surfaces are not renamed into target Capabilities.

## Role is assignment; Capability is decision truth

```text
Role
= named baseline bundle

Capability
= one accepted action decision
```

Current Capability families:

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

Generic `resource.create`, `resource.update`, and `member.manage` are rejected current vocabulary because they erase material differences among Page, Issue, Discussion, and access management.

## Contextual authority

Static Role bundles do not encode every documented decision.

### Public trust baseline

```text
anonymous + public Repository
→ repository.view + resource.view

authenticated + public Repository
→ public read
+ issue.create / issue.comment
+ discussion.create / discussion.comment
```

No Repository Role is fabricated by visibility or authentication.

### Public Wiki collaborator rule

```text
public Repository
+ any persisted/derived Repository Role
→ page.create + page.update
```

The optional GitHub setting allowing every account to edit a public Wiki is deferred and not accepted.

### Issue author rule

```text
Actor == Issue.createdBy
→ edit / close / reopen that Issue
```

Authorship never upgrades Role and never grants assignment/labels/access management.

## Direct Grant assignment by owner kind

### Organization-owned Repository

```text
Absent
→ Admin grants Read | Triage | Write | Maintain | Admin

Existing
→ Admin changes to another accepted Role
→ Admin revokes
```

### User-owned Repository

```text
Absent
→ owner/Admin grants Write collaborator

Existing Write
→ owner/Admin revokes
```

The database protects this owner-kind invariant independently with a trigger/helper in addition to Application policy.

## Ownership/governance authority

Ownership remains separate from Direct Grants:

```text
User owns Repository
→ User derives Admin

Organization owns Repository
+ Actor Organization role = owner | admin
→ Actor derives Admin for that Repository
```

Ordinary Organization Membership contributes no Repository Role.

## Authority mutation integrity

A Direct Grant command is compare-and-swap, not a blind row write.

```text
authenticated Actor
∩ repository.access.manage
∩ Actor != target User
∩ target User exists
∩ proposed Role valid for owner kind
∩ persisted Role == expected Role
→ exactly one relationship transition
→ exactly one matching Activity Evidence fact
```

Persistence rules:

```text
Create
→ INSERT ... ON CONFLICT DO NOTHING

Change
→ UPDATE ... WHERE role = expected_role

Revoke
→ DELETE ... WHERE role = expected_role
```

Affected-row count decides success. `ROW_COUNT != 1` returns `state-changed` and emits no success Evidence.

Evidence is appended only after exactly one transition succeeds and remains in the same database transaction.

## Database enforcement

`99_rls.sql` is the single canonical RLS source. Supplemental correction policies are rejected.

- Raw authenticated Grant INSERT/UPDATE/DELETE requires command context `app.repository_grant_command = mutate`.
- `granted_by` on create must equal `auth.uid()`.
- Self-target Direct Grant mutation fails closed.
- RLS independently requires Admin access-management authority.
- INSERT/UPDATE resulting Role must satisfy Repository owner-kind policy.
- Non-Admin raw Grant enumeration is unavailable.
- Target existence lookup happens only after `repository.access.manage` is established.
- `SECURITY DEFINER` helpers use an empty `search_path`, fully qualified relations, and selective execution grants.

Public content participation does not expose raw Activity Evidence. `activity_events` requires a persisted/derived Repository Role until a separate public-redaction projection is accepted.

## Organization delegation remains separate

Organization governance roles are not Repository Roles.

| Organization Actor | Membership Roles it may manage |
| --- | --- |
| owner | member, admin, owner |
| admin | member, admin |
| member | none |

An existing Organization must retain at least one owner. Cross-row owner continuity remains independently serialized/enforced.

## Rejected alternatives

### One five-role Grant model for User and Organization owners

Rejected. GitHub documents different personal owner/collaborator and Organization granular-role semantics.

### Role-only authorization

Rejected. Public participation, public Wiki collaborator editing, and Issue author behavior are documented counterexamples.

### Preserve target `manager` by giving it lower-role delegation

Rejected. It was invented to differentiate an artificial target hierarchy and contradicts Admin-only GitHub access management.

### Generic Resource mutation permissions

Rejected. Page, Issue, Discussion, and Direct Grant transitions have different mechanisms.

### Role rank as delegation policy

Rejected. Rank may summarize effective Role; it does not create `repository.access.manage`.

### Pre-read-only concurrency

Rejected. Expected Role must constrain actual DML before success Evidence can exist.

### Supplemental RLS correction file

Rejected. Current policy truth belongs in `99_rls.sql` only.

### Enforce only in Application or only in RLS

Rejected. Product explanation and database defense-in-depth are both required.

## Consequences

Benefits:

- upstream GitHub semantics are traceable to actual `github/docs/content` evidence;
- docs-site `github/docs/src` is no longer mistaken for GitHub.com implementation evidence;
- personal and Organization Repository access no longer collapse into one invented assignment model;
- public participation and authorship no longer force fake Role promotions;
- Direct access remains Admin-only and concurrency-safe;
- raw public participation cannot leak historical Evidence; and
- Domain/Application/PostgreSQL/Web/tests share one falsifiable causal model.

Costs:

- the decision model is intentionally richer than a single role rank;
- target-state/relationship facts must be loaded for relationship-sensitive commands such as Issue author editing; and
- future GitHub behavior must repeat the subtraction test before being admitted.

## Minimum discriminating tests

1. Anonymous public Actor reads but cannot mutate.
2. Authenticated public Actor with no Grant creates/comments ordinary Issue/Discussion without receiving a Role.
3. Public Read collaborator edits Page; private Read collaborator cannot.
4. Issue author edits/closes/reopens own Issue without Role promotion; unrelated Read actor cannot.
5. Triage manages arbitrary Issue/Discussion state but cannot mutate private Page.
6. Write comments on an open locked Discussion but cannot create Announcement.
7. Maintain creates Announcement but cannot manage Repository access.
8. Organization Repository Admin manages all five Direct Grant roles.
9. Personal Repository accepts only Write Direct collaborator assignment.
10. Every non-Admin Direct Grant management attempt fails in Application and PostgreSQL.
11. Self-target and raw forged Grant mutations fail closed.
12. Stale expected Role returns `state-changed`, changes zero rows, and records no success Evidence.
13. Successful Grant create/change/revoke changes exactly one relationship and records exactly one matching same-transaction Evidence fact.
14. Public actor without persisted/derived Role cannot query raw Activity Evidence.
15. Context changes never change authority for identical Actor/target/relationships.

## Falsification conditions

Reopen only when observed no-code collaboration requires a permission relationship the documented GitHub-derived model cannot represent without repeated exceptions, or when a newly accepted Principal/policy mechanism changes the causal model. Do not reopen to preserve old target names or existing accidental implementation.
