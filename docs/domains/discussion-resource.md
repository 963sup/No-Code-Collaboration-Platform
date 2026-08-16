# Domain Contract: Discussion Resource

- Status: Accepted target; executable evidence tracked separately
- Contract owner: Product and Domain
- Last reviewed: 2026-08-16

## Problem owned and success condition

Discussion owns Repository-scoped shared understanding. It is not a second forum Container and is not an Issue alias. It succeeds when conversation, category, answer selection, closure, lock moderation, and Announcement behavior remain inside one Repository and Domain/Application/PostgreSQL agree on participation and state rules.

## GitHub benchmark derivation

Removing Code/Git assumptions from GitHub Discussions leaves four durable no-code mechanisms:

```text
Read / authenticated public participation
→ create ordinary Discussion
→ comment on ordinary open Discussion

Triage
→ edit/manage Discussion state
→ moderate lock and Answers

Write
→ Triage + continue commenting on an open locked Discussion

Maintain / Admin
→ create Announcement Discussion
```

GitHub Organization policy can restrict who may create Discussions beyond the default Read-level behavior. The target has not admitted that Organization policy yet. Therefore current `discussion.create` represents the documented default participation rule, not an immutable claim that future governance can never restrict it.

Announcement is a separate maintenance responsibility. It does not imply sensitive Repository settings/access authority.

## Identity and vocabulary

```text
Discussion human identity = Repository ID + discussion number
category = general | question | announcement
status = open | closed
locked = independent moderation state
```

`question` may select at most one of its own comments as Answer. `general` and `announcement` cannot select an Answer.

Comments are a flat chronological sequence. Nested replies, reactions, and hard deletion are not accepted in v1.

## Commands and authority

| Command | Required Capability | Rule |
| --- | --- | --- |
| create general/question | `discussion.create` | Read/default authenticated public participation |
| create announcement | `discussion.announce` | Maintain/Admin |
| comment ordinary open | `discussion.comment` | Read/default authenticated public participation |
| comment open locked | `discussion.comment` + `discussion.comment.locked` | Write-or-greater |
| edit | `discussion.edit` | Triage-or-greater |
| close / reopen | `discussion.moderate` | Triage-or-greater |
| select / clear answer | `discussion.moderate` | Triage-or-greater plus question-only target rule |
| lock / unlock | `discussion.moderate` | Triage-or-greater |

Public Repository authenticated participation may supply `discussion.create` and `discussion.comment` without fabricating a Repository Role. Anonymous public access remains read-only.

## State rules

```text
closed
→ no new comment for any Role

open + unlocked
→ actor with discussion.comment may comment

open + locked
→ actor must have discussion.comment
  AND discussion.comment.locked
```

Current static bundles mean Read/Triage cannot comment while locked; Write/Maintain/Admin can.

Reopen does not unlock. Unlock does not reopen. Status and lock remain independent state dimensions.

## Authorization and failure behavior

- Authentication identifies Actor; it is not private Repository authorization.
- Anonymous public Actor cannot create/comment.
- Authenticated public Actor may create/comment ordinary Discussion under the public participation baseline.
- Public participation does not produce a stored/explained Repository Role.
- Triage moderation does not create Page write or Repository access-management authority.
- Announcement creation requires `discussion.announce`, not `repository.manage` or `repository.access.manage`.
- PostgreSQL RLS/RPCs independently enforce Role/contextual authority plus closed/locked target state.
- Raw authenticated Discussion/comment DML is not an alternate command API.
- Inaccessible Repository, missing Capability, stale version, invalid category/state transition, cross-Discussion Answer, or undefined operation fails closed without success Evidence.

## Concurrency and Evidence

All meaningful mutations increment integer version and append one actor-attributed Activity Event in the same transaction. Stale/no-op requests do not fabricate success Evidence.

Accepted event families remain command-specific facts for create/edit/comment/status/moderation/Answer changes. Evidence payloads contain minimum identifiers/transition state and never create authority.

## Invariants

1. Every Discussion belongs to exactly one Repository.
2. `(repositoryId, discussionNumber)` is unique/stable; allocation is atomic and Repository-local.
3. Category is exactly `general | question | announcement`.
4. Status and lock are independent.
5. Only `question` can have one selected Answer, and that Answer must be one of its own comments.
6. Closed Discussion rejects every new comment.
7. Open locked Discussion rejects Read/Triage comments and permits actors carrying `discussion.comment.locked`.
8. `discussion.moderate` is Triage-or-greater and owns close/reopen/lock/unlock/Answer management.
9. `discussion.announce` is Maintain/Admin and remains independent from Repository access management.
10. Current `discussion.create` reflects GitHub's default Read-level creation rule; future governance may constrain it only through an explicit accepted policy.
11. Authenticated public participation never fabricates a Repository Role.
12. Every mutation uses expected version and commits state plus Activity Evidence atomically.
13. Discussion owns neither Repository authority nor another collaboration boundary.

## Rejected alternatives

### Locked means nobody may comment

Rejected. GitHub permits Write-or-greater participants to continue commenting on an open locked Discussion.

### Lock/unlock requires Repository Admin

Rejected. Discussion moderation is a Triage responsibility, not sensitive Repository access/settings administration.

### Announcement uses `repository.manage`

Rejected. Announcement is a surviving Maintain responsibility and does not imply sensitive settings authority.

### Public visibility means anonymous participation

Rejected. Public read visibility and authenticated participation are distinct trust states.

### Hard-code Read creation as forever unconstrained

Rejected. GitHub Organization policy proves creation eligibility can be narrowed; the target simply has not admitted that policy surface yet.

### Generic `resource.create` / `resource.update`

Rejected because participation, moderation, locked participation, and Announcement maintenance are distinct actions.

## Minimum discriminating tests

1. Authenticated public Actor with no Direct Grant can create/comment ordinary open Discussion.
2. Anonymous public Actor cannot create/comment.
3. Read can create/comment ordinary open Discussion but cannot edit/moderate/announce.
4. Triage can edit and moderate, cannot comment while locked, and cannot announce.
5. Write can comment on open locked Discussion and inherits Triage moderation, but cannot announce.
6. Maintain/Admin can create Announcement.
7. Closed Discussion rejects comments from every Role.
8. Question-only Answer selection rejects general/announcement and cross-Discussion comment identity.
9. Stale expected version changes no state and emits no success Evidence.
10. Raw DML cannot bypass command functions/RLS.
11. Changing selected Context does not change any authority result.

## Falsification conditions

Reopen if a real no-code shared-understanding workflow cannot use the current categories, flat comments, one optional Question Answer, independent lock/closed state, or documented participation/Triage/Write/Maintain split without repeated exceptions.
