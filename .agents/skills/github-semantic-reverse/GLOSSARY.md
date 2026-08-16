# Canonical GitHub-to-No-Code Semantic Glossary

## Authority and scope

This is the only mapping authority for repository-wide GitHub semantic repair. Product, Domain, Application, API, persistence, URL/IA, and user-facing UI must use the target semantics below. Benchmark evidence, repair specifications, audit reports, and Git/GitHub engineering workflow may name excluded external terms only to identify, reject, or operate the engineering repository.

A target term is not automatically an entity, table, package, route, capability, or feature. Persistence requires a separately accepted product invariant and discriminating use case.

## Core product vocabulary

| Canonical term | Meaning | Non-confusion rule |
|---|---|---|
| Repository | The only primary no-code collaboration and authorization boundary | Not a code store, folder, project, team, or generic tenant |
| State Transition | An authorized atomic change from one accepted current state to another | Not a version object or history line |
| Activity Event | Immutable evidence that an accepted action occurred | Not current state, a version object, notification, feed, or audit view |
| State Comparison | A derived presentation comparing two explicitly addressable authorized states | Not an owned artifact, change set, authority source, or default product capability |
| Expected Revision | A concurrency token used to reject stale writes | Not a user-visible history line or alternate state line |
| Repository Duplication | Creation of an independent Repository from an explicitly selected safe state | No continuing upstream authority, automatic synchronization, inherited grants, credentials, sessions, or secrets |
| Data Transfer | Typed movement between explicitly authorized endpoints | Not local/remote repository synchronization or history exchange |
| Label | User-facing classification of an accepted object | Not a named source-control reference |
| Current State | The authoritative state resolved by stable Repository/Resource identity | Not a movable pointer to a history node |

## Excluded external concepts and accepted outcomes

### `commit`

**Outcome:** no target Product primitive.

A normal save is an authorized `State Transition`. Actor, time, action, and target evidence belong to `Activity Event`. These two truths stay separate; neither becomes a renamed change-history object.

**Verification scenario:** a user saves a Page. The system describes the accepted new Page state and records an Activity Event. It does not create a user-visible ancestry node, message-bearing change set, or history graph.

### `branch`

**Outcome:** no target Product primitive.

Concurrent work is resolved through transaction serialization, real-time coauthoring, or `Expected Revision` rejection of stale writes. There is no default mainline, alternate line, or later convergence operation.

**Verification scenario:** two users edit the same Page. Each reads the same Repository-scoped object; stale writes are rejected or real-time operations are serialized. Neither user receives a private state line that must later return to a main line.

### `diff`

**Outcome:** optional `State Comparison` presentation only after two states are independently addressable for a proven product reason.

**Verification scenario:** a user compares two retained Page states. The UI explains domain-level state differences. The comparison owns no data, grants no authority, and is not expressed as line or patch operations.

### `merge`

**Outcome:** no target Product primitive.

The final state is established by an accepted transaction, expected-revision check, or real-time collaboration mechanism. Conflicting stale writes fail closed and are retried against current state.

**Verification scenario:** two users finish edits. The accepted Page state follows the concurrency contract; the system does not expose conflict markers, ancestry selection, or an operation that combines state lines.

### `fork`

**Outcome:** `Repository Duplication` only when an independent-copy use case is accepted.

The new Repository has its own identity, authority, lifecycle, and current state. Optional origin evidence may explain how it was created but creates no continuing upstream authority or synchronization contract.

**Verification scenario:** a user requests an editable copy. The system creates a new Repository from an allowlisted safe state, excludes grants/credentials/sessions/secrets, and never implies that changes can flow back to the source unless a separate Data Transfer capability is later accepted.

### `rebase`

**Outcome:** rejected with no target equivalent.

The target has no ancestry rewrite or alternate state-line model.

### `cherry-pick`

**Outcome:** rejected as a history operation.

A future proven need to copy selected typed objects would be modeled as explicit `Data Transfer`, with independent authorization and validation, not as history selection.

### `tag`

**Outcome:** rejected as a source-control reference.

User classification uses `Label`. A future named retained state would require a separate snapshot contract and cannot be admitted by analogy.

### `HEAD`

**Outcome:** rejected with no target equivalent.

`Current State` is resolved through stable Repository/Resource identity and accepted storage truth, not through a movable history pointer.

## Concurrency invariant

```text
Actor + Authority + Command + Expected Current State
↓
Accepted State Transition
↓
Current State + Activity Event
```

A failed transition produces neither a successful state change nor a success event.

## Repository duplication invariant

```text
Selected safe source state
+ explicit destination owner
+ destination authorization
↓
Independent Repository
```

The operation never copies authorization grants, secrets, credentials, sessions, external installation tokens, or source ownership authority.
