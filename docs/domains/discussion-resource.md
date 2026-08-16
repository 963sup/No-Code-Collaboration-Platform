# Domain Contract: Discussion Resource

- Status: Accepted target; executable evidence tracked separately
- Contract owner: Product and Domain
- Last reviewed: 2026-08-16

## Problem owned and success condition

Discussion owns Repository-scoped shared understanding. It is not a forum Container and is not an Issue alias. It succeeds when conversation, category, answer selection, closure, lock moderation, and Announcement behavior remain inside one Repository and every mutation is GitHub-derived Capability-authorized, version-checked, and recorded as Activity Evidence.

## First-principles benchmark mapping

Removing Code/Git assumptions from GitHub Discussions leaves these durable no-code collaboration responsibilities:

```text
Read
→ create ordinary Discussion
→ comment on ordinary open Discussion

Triage
→ moderate Discussion state and Answers
→ edit Discussion content

Write
→ Triage + continue commenting on an open locked Discussion

Maintain
→ Write + create Announcement Discussion

Admin
→ includes all current Discussion capabilities
```

A lock is therefore a moderation boundary against ordinary participation, not a universal write embargo. GitHub permits Write-or-greater participants to continue commenting on locked Discussions; the target preserves that surviving mechanism.

## Identity and vocabulary

```text
Discussion stable human identity = Repository ID + discussion number
category = general | question | announcement
status = open | closed
locked = independent moderation state
```

`question` may select at most one of its own comments as Answer. `general` and `announcement` cannot select an Answer.

Comments are one flat chronological sequence. v1 has no nested replies, reactions, or hard deletion.

## Commands

| Command | Required Capability | GitHub-derived responsibility |
| --- | --- | --- |
| create general/question | `discussion.create` | Read-or-greater participation |
| create announcement | `discussion.announce` | Maintain/Admin maintenance |
| comment ordinary open | `discussion.comment` | Read-or-greater participation |
| comment open locked | `discussion.comment` + `discussion.comment.locked` | Write-or-greater trusted participation |
| edit | `discussion.edit` | Triage-or-greater Discussion management |
| close / reopen | `discussion.moderate` | Triage-or-greater moderation |
| select / clear answer | `discussion.moderate` | Triage-or-greater moderation; question-only target rule |
| lock / unlock | `discussion.moderate` | Triage-or-greater moderation |

All meaningful mutations increment integer version and write one actor-attributed Activity Event in the same transaction. Stale/no-op requests do not fabricate success Evidence.

## State rules

Commentability is determined by both authorization and Discussion state:

```text
closed
→ no new comment for any Role

open + unlocked
→ actor with discussion.comment may comment

open + locked
→ actor must have discussion.comment
  AND discussion.comment.locked
```

Current bundles mean Read/Triage cannot comment while locked; Write/Maintain/Admin can.

Reopen does not unlock. Unlock does not reopen. Status and lock remain independent state dimensions.

## Authorization and failure behavior

- Authentication identifies Actor; it is not authorization.
- Application selects action-specific Discussion Capability before persistence.
- PostgreSQL RLS/RPCs independently enforce the same Role/Capability matrix and the lock/closed target state.
- Announcement creation uses `discussion.announce`; it is not Repository access management and does not require `repository.access.manage`.
- Triage moderation does not create Page write or Repository access authority.
- Raw authenticated Discussion/comment DML is not an alternate command API.
- Inaccessible Repository, missing Capability, stale version, invalid category/state transition, cross-Discussion Answer, or undefined operation fails closed without success Evidence.

## Invariants

1. Every Discussion belongs to exactly one Repository.
2. `(repositoryId, discussionNumber)` is unique/stable; allocation is atomic and Repository-local.
3. Category is exactly `general | question | announcement`.
4. Status and lock are independent.
5. Only `question` can have one selected Answer, and that Answer is one of its own comments.
6. Closed Discussion rejects every new comment.
7. Open locked Discussion rejects ordinary Read/Triage comment authority but permits Roles carrying `discussion.comment.locked`.
8. `discussion.moderate` is Triage-or-greater and owns close/reopen/lock/unlock/Answer management.
9. `discussion.announce` is Maintain/Admin and is independent from sensitive Repository access management.
10. Every mutation uses expected version and commits state plus Activity Evidence atomically.
11. Comments remain flat and chronological.
12. Discussion owns neither Repository authority nor another collaboration Container.

## Rejected alternatives

### Locked means nobody may comment

Rejected. That target rule contradicted GitHub's mature locked-Discussion behavior and erased a real distinction between Triage and Write.

### Lock/unlock requires Repository Admin/settings authority

Rejected. Discussion moderation is a Triage responsibility; it is not Repository access/settings administration.

### Announcement uses `repository.manage`

Rejected. Announcement creation is one surviving Maintain responsibility and does not imply sensitive Repository settings authority.

### Generic `resource.create` / `resource.update`

Rejected because ordinary participation, moderation, locked participation, and Announcement maintenance are distinct GitHub-derived actions.

## Evidence

Accepted Discussion event families remain command-specific historical facts for create/edit/comment/transition/moderation/answer changes. Fact payloads contain minimum identifiers/transition state and do not create authority.

## Minimum discriminating tests

1. Read can create/comment on ordinary open Discussion but cannot moderate/edit/announce.
2. Triage can edit and moderate including lock/unlock and Answer selection, but cannot comment while locked and cannot announce.
3. Write can comment on an open locked Discussion and inherits Triage moderation, but cannot announce.
4. Maintain/Admin can create Announcement.
5. Closed Discussion rejects Read, Triage, Write, Maintain, and Admin comments.
6. Question-only Answer selection rejects general/announcement and cross-Discussion comment identity.
7. Stale expected version changes no state and emits no Activity Evidence.
8. Raw DML cannot bypass command functions/RLS.
9. Same-transaction Evidence accompanies every meaningful accepted mutation.
10. Public/private reads and canonical `/{owner}/{repository}/discussions/{number}` presentation remain Repository-authorized.

## Falsification conditions

Reopen only if a real no-code shared-understanding workflow cannot use the fixed categories, flat comments, one optional question Answer, independent lock/closed state, or GitHub-derived Read/Triage/Write/Maintain action split without repeated exceptions.
