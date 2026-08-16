# Domain Contract: Issue Resource

- Status: Accepted target; executable evidence tracked separately
- Contract owner: Product and Domain
- Last reviewed: 2026-08-16

## Problem owned and success condition

Issue owns actionable collaborative work inside one Repository. It succeeds when creation, conversation, responsibility, classification, author editing, general moderation, and completion remain Repository-contained, optimistic-concurrency-safe, and authorized by the same rules in Domain/Application/PostgreSQL.

Issue has no Source Code, Git, Branch, Diff, code-review, CI/CD, or arbitrary-execution meaning.

## GitHub benchmark derivation

After subtracting software-development-specific content, GitHub Issues preserve three independent no-code authority mechanisms:

```text
Read / authenticated public participation
→ create and comment

Issue author relationship
→ edit own Issue
→ close/reopen own Issue

Triage-or-greater
→ manage arbitrary Issue responsibility, classification, and workflow

Write-or-greater
→ edit arbitrary Issue title/body
```

The key rule is:

```text
Issue author
≠
higher Repository Role
```

Authorship is a target relationship that may authorize a specific transition without changing the Actor's Repository Role.

## Boundary and identity

```text
Repository 1 -- contains --> * Issue
Issue human identity = Repository ID + issue number
Issue persistence identity = Issue UUID
```

The positive issue number is allocated atomically and monotonically inside one Repository. Assignment, labels, comments, filters, and planning views do not create another ownership or authorization boundary.

## State and relationships

- State is `open | closed`.
- Closed Issue has one close reason: `completed | cancelled`, plus `closedBy` and `closedAt`.
- Reopen returns Issue to `open` and clears close attribution.
- Title is trimmed, non-blank, at most 240 characters.
- Body is opaque collaborative text; it is displayed, never executed.
- Labels are Repository-scoped classifications.
- Assignees are Users who still have Repository read access. Assignment grants no access.
- Comments form one flat chronological sequence.
- Nested replies, milestones, reactions, and hard deletion are not accepted in v1.

## Commands and authority

| Command | Baseline Capability | Contextual rule |
| --- | --- | --- |
| create | `issue.create` | authenticated public Repository participation may supply it without a Role |
| comment | `issue.comment` | authenticated public Repository participation may supply it without a Role |
| edit title/body | `issue.edit` | Issue author may edit their own Issue even without `issue.edit` |
| assign / unassign | `issue.manage` | no author exception |
| label / unlabel | `issue.manage` | no author exception |
| close / reopen | `issue.manage` | Issue author may close/reopen their own Issue |

Static Role baseline:

```text
Read
→ issue.create + issue.comment

Triage
→ Read + issue.manage

Write
→ Triage + issue.edit

Maintain/Admin
→ inherit Write/Triage Issue authority
```

Public Repository authenticated participation adds `issue.create` and `issue.comment` without fabricating Read.

## Command decision chain

```text
Authenticated Actor
→ stable Repository
→ static/contextual Repository authority
→ required Issue Capability
→ if denied and command is edit/close/reopen:
     load stable Issue target
     compare Actor with Issue.createdBy
→ target-state validation
→ command-specific persistence + RLS
→ state transition + Evidence
```

The client never supplies trusted authorship. Application loads the persisted Issue target by stable Repository ID + Issue UUID before using the author rule.

## Concurrency and Evidence

Every mutation uses an integer expected version. A stale request changes neither Issue state nor Evidence. Meaningful success increments version and writes one actor-attributed Activity Event in the same transaction. A no-op fabricates no Evidence.

Accepted event families:

```text
issue.created
issue.edited
issue.commented
issue.assigned
issue.unassigned
issue.labeled
issue.unlabeled
issue.closed
issue.reopened
```

Notification, Activity, Audit, Search, analytics, and Project views are projections over accepted source state/Evidence.

## Authorization and failure behavior

- Authentication identifies Actor; it does not grant private Repository access.
- Anonymous public access is read-only.
- Authenticated Actor may create/comment in a public Repository under the public participation baseline.
- Public participation does not fabricate a Repository Role.
- Read can create/comment in private Repository when explicitly assigned Read.
- Issue author can edit/close/reopen their own accessible Issue without being promoted to Triage or Write.
- Triage can manage assignment, labels, close/reopen for any accessible Issue but does not gain arbitrary title/body editing.
- Write/Maintain/Admin can edit arbitrary Issue title/body and inherit Triage management.
- Author exception never grants assignment, label management, Direct Grant management, or another Issue's mutation.
- UI visibility and selected Context never grant authority.
- Raw authenticated table writes are not an alternate command API.
- Inaccessible Repository, stale version, invalid transition, ineligible assignee, cross-Repository label, or undefined operation fails closed without success Evidence.

## Invariants

1. Every Issue belongs to exactly one Repository.
2. `(repositoryId, issueNumber)` is unique and stable.
3. Number allocation is atomic and Repository-local.
4. Status and closed attribution remain consistent.
5. Assignment never grants Repository access.
6. Labels never cross Repository boundaries.
7. Comments remain flat and chronological.
8. `issue.create`, `issue.comment`, `issue.edit`, and `issue.manage` remain distinct actions.
9. Triage manages arbitrary Issue workflow/classification/responsibility without general content write authority.
10. Issue author may edit/close/reopen only their own Issue; authorship does not mutate Role.
11. Authenticated public participation may create/comment but does not imply `issue.edit` or `issue.manage`.
12. Every meaningful mutation uses expected version and advances it once.
13. Meaningful mutation and Activity Evidence commit atomically.
14. Hard deletion, nested replies, milestones, reactions, and code capabilities remain unavailable in v1.

## Rejected alternatives

### Role-only Issue authorization

Rejected. GitHub explicitly gives Issue authors actions on their own Issue that cannot be represented faithfully by one static Repository Role matrix.

### Generic `resource.create` / `resource.update`

Rejected. Ordinary participation, authorship, Triage management, and Write editing are different mechanisms.

### Make Triage a presentation label

Rejected. It solves the durable problem of work moderation without general Repository write authority.

### Assignment grants access

Rejected. Responsibility and authority are independent relationships.

## Minimum discriminating tests

1. Authenticated public Actor with no Direct Grant can create and comment on an Issue.
2. The same Actor cannot edit another User's Issue without `issue.edit`.
3. Issue author can edit their own Issue without Triage or Write.
4. Issue author can close/reopen their own Issue without `issue.manage`.
5. Triage can assign/unassign, label/unlabel, close/reopen arbitrary Issue but cannot edit arbitrary title/body.
6. Write can edit arbitrary Issue and inherits Triage management.
7. Stale expected version changes no state and emits no Activity Event.
8. Assignment rejects User without current Repository read access and creates no Grant.
9. Label assignment rejects another Repository's label.
10. Raw INSERT/UPDATE/DELETE cannot bypass command functions/RLS.
11. Anonymous public actor cannot mutate Issue.
12. No Issue command imports Code/Git/executable behavior.

## Falsification conditions

Reopen if real no-code work cannot use Repository-local stable numbers, flat conversation, Repository-scoped responsibility/classification, or the documented participation/authorship/Triage/Write split without repeated exceptions.
