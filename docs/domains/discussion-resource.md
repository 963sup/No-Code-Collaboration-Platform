# Domain Contract: Discussion Resource

- Status: Accepted target; executable evidence tracked separately
- Contract owner: Product and Domain
- Last reviewed: 2026-08-15

## Problem owned and success condition

Discussion owns Repository-scoped shared understanding. It is not a forum Container and is not an Issue alias. It succeeds when conversation, category, answer selection, closure, and moderation remain inside one Repository and every mutation is capability-authorized, version-checked, and recorded as Activity Evidence.

## Identity and vocabulary

```text
Discussion stable human identity = Repository ID + discussion number
category = general | question | announcement
status = open | closed
locked = independent moderation state
```

`question` may select at most one of its own comments as Answer. `general` and `announcement` cannot select an Answer. `announcement` creation requires `repository.manage`.

Comments are one flat chronological sequence. v1 has no nested replies, reactions, or hard deletion.

## Commands

| Command | Required capability | Required checks |
| --- | --- | --- |
| create general/question | `resource.create` | valid title/body/category; atomic Repository-local number |
| create announcement | `repository.manage` | valid title/body; atomic Repository-local number |
| edit | `resource.update` | matching expected version |
| comment | `resource.create` | Discussion is open and unlocked; matching expected version |
| close / reopen | `resource.update` | valid current state; matching expected version |
| select / clear answer | `resource.update` | category is `question`; selected comment belongs to Discussion; matching expected version |
| lock / unlock | `repository.manage` | matching expected version |

A closed or locked Discussion accepts no new comment. Reopen and unlock restore commentability only when both state predicates allow it.

All meaningful mutations increment an integer version and write one actor-attributed Activity Event in the same transaction. Stale and no-op requests do not fabricate success Evidence.

## Invariants

1. Every Discussion belongs to exactly one Repository.
2. `(repositoryId, discussionNumber)` is unique and stable; allocation is atomic and Repository-local.
3. Category is exactly `general | question | announcement`.
4. Status and lock state are independent.
5. Only `question` can have one selected Answer, and that Answer is one of its own comments.
6. Closed or locked Discussions reject new comments.
7. Announcement creation and lock moderation require `repository.manage`.
8. Every mutation uses expected version and commits state plus Activity Evidence atomically.
9. Comments remain flat and chronological.
10. Discussion owns neither Repository authority nor another collaboration Container.

## Failure behavior and tests

Inaccessible Repository, missing capability, stale version, invalid category/state transition, cross-Discussion answer, or undefined operation fails closed. Tests must prove announcement and lock moderation, question-only Answer selection, closed/locked comment denial, reopen/unlock recovery, raw DML denial, same-transaction Evidence, public/private reads, and canonical full-page presentation at `/{owner}/{repository}/discussions/{number}`.

## Falsification conditions

Reopen this contract only if a real no-code shared-understanding workflow cannot use the fixed categories, flat comments, one optional question Answer, or the accepted capability/concurrency/evidence model.
