# Domain Contract: Issue Resource

- Status: Accepted target; executable evidence tracked separately
- Contract owner: Product and Domain
- Last reviewed: 2026-08-15

## Problem owned and success condition

Issue owns actionable collaborative work inside one Repository. It succeeds when creation, responsibility, classification, conversation, and completion remain Repository-contained, capability-authorized, optimistic-concurrency-safe, and accompanied by immutable Activity Evidence.

Issue has no Source Code, Git, branch, diff, code-review, CI/CD, or arbitrary-execution meaning.

## Boundary and identity

```text
Repository 1 -- contains --> * Issue
Issue stable human identity = Repository ID + issue number
Issue persistence identity = Issue UUID
```

The positive issue number is allocated atomically and monotonically within one Repository. Assignment, labels, comments, filters, and presentation modes do not create another Container or authorization boundary.

## State and relationships

- State is `open | closed`.
- A closed Issue has exactly one close reason: `completed | cancelled`, plus `closedBy` and `closedAt`.
- Reopen returns the Issue to `open` and clears the close reason and closed attribution.
- Title is trimmed, non-blank, and at most 240 characters.
- Body is opaque collaborative text. It is displayed, not parsed or executed.
- Labels are Repository-scoped classifications.
- Assignees are Users who still have Repository access. Assignment is a responsibility Relationship and grants no access.
- Comments form one flat chronological sequence. Nested replies, milestones, reactions, and hard deletion are not part of v1.

## Commands

| Command | Required capability | Required checks |
| --- | --- | --- |
| create | `resource.create` | valid Repository, title/body, atomic number allocation |
| edit | `resource.update` | matching expected version |
| comment | `resource.create` | open or closed Issue remains commentable; matching expected version |
| assign / unassign | `resource.update` | assignee is a User who can still read the Repository; matching expected version |
| label / unlabel | `resource.update` | label belongs to the same Repository; matching expected version |
| close | `resource.update` | current state `open`, valid close reason, matching expected version |
| reopen | `resource.update` | current state `closed`, matching expected version |
| moderate | `repository.manage` | may apply accepted moderation only; v1 defines no hard delete |

All mutations use an integer expected version. A stale request changes neither Issue state nor Evidence. A successful meaningful mutation increments the version and writes one actor-attributed Activity Event in the same transaction. A no-op does not fabricate Evidence.

## Evidence

Accepted event families are:

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

Evidence payloads contain only identifiers and minimum transition facts. Notification, feed, audit, analytics, search, and planning views are projections over accepted state/Evidence and cannot rewrite either.

## Authorization and failure behavior

- Authentication identifies the Actor; it is not authorization.
- Application commands explain the Capability decision using stable Actor and Repository IDs.
- RLS and command-specific PostgreSQL functions enforce the same boundary independently.
- UI visibility and selected Context never grant authority.
- Raw authenticated table writes are not an alternate command API.
- An inaccessible Repository, stale version, invalid transition, ineligible assignee, cross-Repository label, or undefined operation fails closed without a success event.
- Reading a public Repository may expose admitted Issue content but never creates mutation authority.

## Invariants

1. Every Issue belongs to exactly one Repository.
2. `(repositoryId, issueNumber)` is unique and stable.
3. Allocation is atomic and Repository-local.
4. Status and closed attribution are always consistent.
5. Assignment never grants access and cannot retain an assignee who no longer has Repository access.
6. Labels never cross Repository boundaries.
7. Comments are flat and chronological.
8. Every mutation uses expected version and meaningful success advances the version.
9. Every meaningful mutation and its Activity Event commit atomically.
10. Hard deletion, nested replies, milestones, reactions, and code capability are impossible in v1.

## Minimum discriminating tests

1. Concurrent creation allocates distinct increasing numbers within one Repository.
2. A stale expected version changes no state and emits no Activity Event.
3. Viewer and outsider mutations fail independently in Application and RLS/RPC enforcement.
4. Assignment rejects a User without current Repository read access and does not create a Grant.
5. Label assignment rejects a label from another Repository.
6. Close requires `completed | cancelled`; reopen clears all close attribution.
7. Comments remain flat and ordered.
8. Public/private reads remain Repository-authorized and modal/full-page presentation shares one canonical URL.
9. Raw INSERT/UPDATE/DELETE cannot bypass command functions.
10. All navigation and payloads remain free of Source Code, Git, executable, and code-review capability.

## Falsification conditions

Reopen this contract only if real no-code work cannot use Repository-local stable numbers, flat chronological conversation, Repository-scoped responsibility/classification, or the accepted capability/concurrency/evidence model.
