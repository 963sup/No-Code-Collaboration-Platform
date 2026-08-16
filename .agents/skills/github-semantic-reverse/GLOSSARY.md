# Canonical GitHub-to-No-Code Semantic Glossary

## Authority and scope

This is the only mapping authority for repository-wide GitHub semantic repair. Product, Domain, Application, API, persistence, URL/IA, and user-facing UI must use the target semantics below. Benchmark evidence, repair specifications, audit reports, and Git/GitHub engineering workflow may name excluded external terms only to identify, reject, or operate the engineering repository.

A target term is not automatically an entity, table, package, route, Capability, or feature. Persistence requires a separately accepted Product invariant and discriminating use case.

Every excluded concept below has four mandatory parts:

1. target outcome;
2. data-versioning classification;
3. verification question; and
4. required answer plus forbidden answer shape.

A definition fails when its verification answer still requires an actor/time/change narrative, alternate state line, history-node selection, convergence operation, movable history pointer, or continuing upstream authority.

## Core Product vocabulary

| Canonical term | Meaning | Non-confusion rule |
| --- | --- | --- |
| Repository | The only primary no-code collaboration and authorization boundary | Not a code store, folder, project, team, or generic tenant |
| Current State | The authoritative state resolved by stable Repository/Resource identity | Not a movable pointer to a history node |
| State Revision | A scalar current-state concurrency value that changes when an accepted mutation changes the Resource | Not a retained snapshot identity, history node, branch, release number, or authority source |
| Expected Revision | A command precondition that must match the current State Revision when optimistic concurrency is used | Not a user-visible history line or alternate state line |
| State Transition | An authorized atomic change from one accepted Current State to another | Not a version object, message-bearing change set, or history line |
| Activity Event | Immutable Evidence that an accepted action occurred | Not the Product description of a save, Current State, a version object, Notification, Feed, or Audit view |
| State Comparison | A derived presentation comparing two independently retained and authorized states | Not an owned Artifact, change set, authority source, patch, or default Product capability |
| Repository Duplication | Creation of an independent Repository from explicitly selected safe source state | No continuing upstream authority, automatic synchronization, inherited Grants, credentials, Sessions, or secrets |
| Data Transfer | Typed movement between explicitly authorized endpoints | Not local/remote Repository synchronization, history exchange, or executable automation |
| Label | User-facing classification of an accepted object | Not a named source-control reference or retained-state pointer |

### Current implementation naming boundary

Existing `version`, `expectedVersion`, and `expected_version` identifiers are accepted only as technical projections of `State Revision` and `Expected Revision` while all of these conditions remain true:

- the value is one scalar on the authoritative current Resource row;
- it is used only for concurrency and stale-command rejection;
- it has no independent lifecycle, URL, owner, message, author, timestamp, ancestry, or retained snapshot payload;
- it cannot create an alternate state line, comparison authority, or user-visible history object; and
- changing the value without an accepted Resource transition is invalid.

This is legitimate current-state revisioning, not source-control Product semantics. A future retained data-state history requires a separate retention/recovery/audit decision and cannot be inferred from the scalar.

## Excluded external concepts and accepted outcomes

### `commit`

**Target outcome:** no target Product primitive.

**Data-versioning classification:** a normal save does not require a standalone retained snapshot or history object. Future retained data-state history, if proven, is a separate Product decision rather than a renamed external concept.

A normal save is one accepted `State Transition` that establishes `Current State`. The Product description of the save is only the resulting Current State. `Activity Event` may be required by a separate Evidence contract, but it is orthogonal: it is not the replacement for this external concept and is not part of the answer to the save-description question.

**Verification question:** 使用者在 Repository 中儲存了一次 Page 變更，系統怎麼描述這個動作？

**Required answer:** `The Page Current State now contains the accepted title and body at State Revision 12.`

**Forbidden answer shape:** any answer centered on who changed it, when it changed, a change message, a stored snapshot, ancestry, a history node, or a statement that the save “records an Activity Event.” Evidence may be inspected only in a separate audit question.

### `branch`

**Target outcome:** no target Product primitive.

**Data-versioning classification:** not replaced by a data-version line. Concurrent work is resolved through transaction serialization, real-time coauthoring, or `Expected Revision` rejection of stale commands.

There is no default mainline, private line of development, divergence lifecycle, or later convergence operation.

**Verification question:** 兩人同時編輯同一份 Page，各自看到什麼？

**Required answer:** `Both users address the same authorized Current State. Operations are serialized in real time, or a command is accepted only when its Expected Revision matches; a stale command is rejected.`

**Forbidden answer shape:** any private state line, default mainline, divergence, checkout, later return, or implication that either user must combine work back into a shared line.

### `diff`

**Target outcome:** optional `State Comparison` presentation only after two states are independently retained and addressable for a proven Product reason.

**Data-versioning classification:** a legitimate retained-state comparison may exist, but it is a read Projection over accepted domain states rather than a source-control comparison object.

**Verification question:** 使用者想知道先前保留的 Page 狀態與目前狀態在業務意義上有何不同，系統呈現什麼？

**Required answer:** `The comparison states that the Page status moved from Draft to Published and that the approved title is now “Launch Plan”; inaccessible values are omitted.`

**Forbidden answer shape:** changed lines, added/deleted hunks, patches, file operations, merge bases, changed-field inventory as an authority source, or an independently owned comparison Artifact.

### `merge`

**Target outcome:** no target Product primitive.

**Data-versioning classification:** not replaced by a data-version convergence operation. One accepted transaction, real-time serialization rule, or Expected Revision check establishes Current State.

A stale or conflicting command fails closed and is re-evaluated against Current State through the owning Resource workflow.

**Verification question:** 兩人各自完成 Page 編輯後，最終內容如何確定？

**Required answer:** `The Resource concurrency contract accepts one serialized operation or one command at the matching Expected Revision; any stale command is rejected and must be resubmitted against Current State.`

**Forbidden answer shape:** conflict markers, choosing one side, combining histories, selecting ancestor/base/head, or an operation that joins separate state lines.

### `fork`

**Target outcome:** `Repository Duplication` only when an independent-copy use case is separately accepted.

**Data-versioning classification:** not a data-history relationship. The destination begins from explicitly selected safe state and then owns an independent identity, authority, lifecycle, and Current State.

Optional origin Evidence may explain creation but creates no authority or synchronization contract.

**Verification question:** 使用者想擁有一份可以自由修改的 Repository，該副本與原 Repository 的關係是什麼？

**Required answer:** `The system creates a new independent Repository for an explicit destination Owner from allowlisted safe state. It has its own Grants and Current State and has no automatic synchronization or authority path back to the source.`

**Forbidden answer shape:** upstream/downstream authority, repository network, inherited Grants, shared history, pull-back flow, automatic synchronization, or copied credentials, Sessions, secrets, and installation tokens.

### `rebase`

**Target outcome:** rejected with no target equivalent.

**Data-versioning classification:** retained Evidence, if any, is not rewritten to make history appear different. Corrective work is a new authorized Resource command against Current State.

**Verification question:** 管理者想重排、合併或改寫過去的資料變更敘事，系統提供什麼？

**Required answer:** `No generic history-rewrite operation exists. The actor issues a new authorized command against Current State; immutable Evidence remains governed by its own retention and redaction contract.`

**Forbidden answer shape:** reordering history nodes, squashing prior changes, moving changes onto another line, amending past records, or running arbitrary commands against retained states.

### `cherry-pick`

**Target outcome:** rejected as a history-selection operation.

**Data-versioning classification:** a future need to copy selected typed data is modeled as explicit `Data Transfer`, not selection of a retained history node.

**Verification question:** 使用者想把另一個 Repository 的一筆允許資料複製到目前 Repository，系統如何處理？

**Required answer:** `If a typed transfer capability is separately accepted, it reauthorizes the source read and destination write, validates the selected data, and creates ordinary destination state through the destination Resource command.`

**Forbidden answer shape:** selecting a historical change object, copying a commit between state lines, inheriting source authority, or bypassing destination validation and authorization.

### `tag`

**Target outcome:** rejected as a source-control reference. User classification uses `Label`.

**Data-versioning classification:** a future named retained state would require a separate snapshot/retention contract; it is not admitted by analogy to a source-control reference.

**Verification question:** 使用者想替 Issue 加上一個可搜尋的業務分類，系統使用什麼？

**Required answer:** `The Issue receives a Repository-scoped Label whose only authority is classification and filtering.`

**Forbidden answer shape:** a name attached to a history node, a release/version pointer, a movable state reference, or a Label that changes authorization.

### `HEAD`

**Target outcome:** rejected with no target equivalent.

**Data-versioning classification:** `Current State` is resolved through stable Repository/Resource identity and accepted storage truth, not through a movable reference into retained history.

**Verification question:** 使用者開啟一個 Page 時，系統如何知道哪個內容是目前內容？

**Required answer:** `Stable Repository and Page identity resolve the authoritative Current State row and its State Revision.`

**Forbidden answer shape:** a current pointer, checked-out line, detached state, selected history node, or mutable reference that becomes an authorization input.

## Concurrency invariant

```text
Actor + Authority + Concrete Resource Command + Expected Revision
↓
Accepted State Transition
↓
Current State
```

A failed transition produces no successful state change. Required `Activity Event` Evidence is committed atomically by a separate Evidence invariant but never becomes the Product description of the save.

## Repository duplication invariant

```text
Selected safe source state
+ explicit destination Owner
+ destination authorization
↓
Independent Repository
```

The operation never copies authorization Grants, secrets, credentials, Sessions, external installation tokens, or source ownership authority.
