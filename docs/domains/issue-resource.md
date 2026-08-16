# Domain Contract: Issue Resource

- Status: Accepted target; executable evidence tracked separately
- Contract owner: Product and Domain
- Last reviewed: 2026-08-16

## Problem owned and success condition

Issue owns actionable collaborative work inside one Repository. It succeeds when creation, responsibility, classification, conversation, editing, and completion remain Repository-contained, GitHub-derived Capability-authorized, optimistic-concurrency-safe, and accompanied by immutable Activity Evidence.

Issue has no Source Code, Git, Branch, Diff, code-review, CI/CD, or arbitrary-execution meaning.

## First-principles benchmark mapping

Removing software-development-specific content from GitHub Issues leaves a general no-code work mechanism:

```text
Read
→ create and comment on Issues

Triage
→ manage responsibility, classification, and open/closed workflow

Write+
→ additionally edit Issue title/body
```

The target preserves that distinction. It does not collapse every Issue mutation into generic `resource.update`.

## Boundary and identity

```text
Repository 1 -- contains --> * Issue
Issue stable human identity = Repository ID + issue number
Issue persistence identity = Issue UUID
```

The positive issue number is allocated atomically and monotonically within one Repository. Assignment, labels, comments, filters, and presentation modes do not create another Container or authorization boundary.

## State and relationships

- State is `open | closed`.
- Closed Issue has exactly one close reason: `completed | cancelled`, plus `closedBy` and `closedAt`.
- Reopen returns Issue to `open` and clears close reason/closed attribution.
- Title is trimmed, non-blank, at most 240 characters.
- Body is opaque collaborative text; it is displayed, never executed.
- Labels are Repository-scoped classifications.
- Assignees are Users who still have Repository access. Assignment is responsibility and grants no access.
- Comments form one flat chronological sequence.
- Nested replies, milestones, reactions, and hard deletion are not part of v1.

## Commands

| Command | Required Capability | GitHub-derived responsibility |
| --- | --- | --- |
| create | `issue.create` | ordinary Repository participation |
| comment | `issue.comment` | ordinary Repository participation |
| edit title/body | `issue.edit` | Write-or-greater content editing |
| assign / unassign | `issue.manage` | Triage-or-greater Issue management |
| label / unlabel | `issue.manage` | Triage-or-greater Issue management |
| close / reopen | `issue.manage` | Triage-or-greater workflow management |

All mutations use integer expected version. A stale request changes neither Issue state nor Evidence. Successful meaningful mutation increments version and writes one actor-attributed Activity Event in the same transaction. A no-op does not fabricate Evidence.

## Evidence

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

Evidence payloads contain identifiers and minimum transition facts. Notification, feed, Audit, analytics, search, and planning views are projections and cannot rewrite source state/Evidence.

## Authorization and failure behavior

- Authentication identifies Actor; it is not authorization.
- Application commands decide one action-specific Issue Capability using stable Actor/Repository IDs.
- RLS and command-specific PostgreSQL functions independently enforce the same action matrix.
- Read may create/comment but cannot edit/manage.
- Triage may manage assignment/labels/open-closed state but cannot edit title/body.
- Write/Maintain/Admin include Triage management and `issue.edit`.
- UI visibility and selected Context never grant authority.
- Raw authenticated table writes are not an alternate command API.
- Inaccessible Repository, stale version, invalid transition, ineligible assignee, cross-Repository label, or undefined operation fails closed without success Evidence.
- Reading public Repository content does not create mutation authority by visibility alone; mutation still resolves Role/Capability.

## Invariants

1. Every Issue belongs to exactly one Repository.
2. `(repositoryId, issueNumber)` is unique and stable.
3. Allocation is atomic and Repository-local.
4. Status and closed attribution remain consistent.
5. Assignment never grants access and cannot retain an assignee who no longer has Repository access.
6. Labels never cross Repository boundaries.
7. Comments remain flat and chronological.
8. `issue.create`, `issue.comment`, `issue.edit`, and `issue.manage` remain distinct authorization actions.
9. Read has create/comment; Triage adds management; Write adds title/body editing.
10. Every mutation uses expected version; meaningful success advances version.
11. Meaningful mutation and Activity Evidence commit atomically.
12. Hard deletion, nested replies, milestones, reactions, and code capabilities remain impossible in v1.

## Rejected alternatives

### Generic `resource.create` / `resource.update`

Rejected because GitHub separates ordinary participation, Triage management, and Write content editing. A generic mutation permission destroys that proven distinction.

### Make Triage a presentation label only

Rejected because GitHub Triage solves a durable operational problem: allowing work moderation/management without general Repository write authority.

### Assignment grants Repository access

Rejected. Responsibility and authority remain independent relationships.

## Minimum discriminating tests

1. Read can create/comment but cannot edit, assign, label, close, or reopen.
2. Triage can assign/unassign, label/unlabel, close/reopen but cannot edit title/body.
3. Write can edit and inherits Triage management.
4. Concurrent creation allocates distinct increasing Repository-local numbers.
5. Stale expected version changes no state and emits no Activity Event.
6. Assignment rejects User without current Repository read access and creates no Grant.
7. Label assignment rejects another Repository's label.
8. Close requires `completed | cancelled`; reopen clears close attribution.
9. Comments remain flat and ordered.
10. Raw INSERT/UPDATE/DELETE cannot bypass command functions.
11. Public/private reads remain Repository-authorized and canonical presentation uses the Repository URL identity.
12. No command/payload imports Source Code, Git, executable, or code-review capability.

## Falsification conditions

Reopen only if real no-code work cannot use Repository-local stable numbers, flat conversation, Repository-scoped responsibility/classification, or GitHub-derived Read/Triage/Write action split without repeated exceptions.
