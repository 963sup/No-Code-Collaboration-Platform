# Domain Contract: Structured Data Change

- Status: Candidate
- Contract owner: Product and Domain
- Last reviewed: 2026-08-15

## Problem owned and success condition

Repository collaborators may need to group related structured-data changes, compare them with an accepted state, isolate unfinished work, and request review before applying it. Those needs remain valid without Source Code or Git mechanics.

This contract owns the meaning and safety boundary of Data Commit, Data Branch, Data Diff, and Change Proposal. It succeeds only when every change is typed, attributable, Repository-scoped, authorization-equivalent to the direct Resource commands it represents, and incapable of executing code or creating a second collaboration Container.

## Evidence ledger

### Observations

- Page already has typed create/update transitions, optimistic-concurrency evidence, and actor-attributed immutable Activity Events.
- GitHub demonstrates mature names and interaction patterns for grouped change evidence, isolated state, comparison, and review, but its Source Code and Git implementation is not target authority.
- The user explicitly requires Commit, Branch, Diff, and Pull Request to be available only as data-transfer/change semantics with no code capability.

### Constraints

- `Repository = No-Code Collaboration Container` remains absolute.
- Source Code, git refs/merge, code review, Code Search, executable payloads, shell/script/expression runtimes, CI/CD, build, test, deploy, Package, and Release source capabilities remain excluded.
- A structured change may affect only Resources already authorized inside one Repository.
- A grouped or proposed change cannot bypass the Capability, Policy, validation, concurrency, or evidence rules of its constituent Resource commands.
- Opaque text remains data and is never parsed or executed as code.

### Assumptions

- At least one future Resource workflow will need multiple related changes to be reviewed or applied together.
- A named isolated data-state line can be useful without Git ancestry or merge semantics.
- A field/record comparison can be derived without becoming an independently mutable Artifact.

### Unknowns

- Whether the first real use case needs Data Branch, Change Proposal, or only grouped Data Commit evidence.
- Identity, retention, conflict, rebase-equivalent, approval, cancellation, rollback, and archival rules.
- Whether change application must be atomic across several Resource kinds.
- Which Capabilities govern creation, review, approval, and application.
- Whether numeric, UUID, or Repository-local sequence identity best serves each concept.

### Value choices

- Prefer explicit typed operations over a generic patch language.
- Prefer the target Resource's existing command contract over a parallel mutation API.
- Prefer derived comparison over stored mutable Diff state.
- Prefer a small, reversible candidate model until a concrete multi-change workflow proves the lifecycle.

## Boundary and owner

This contract owns:

- grouping accepted structured-data operations into one immutable Data Commit;
- naming an isolated Repository-scoped Data Branch when independently justified;
- deriving a Data Diff between authorized structured states; and
- reviewing and applying a bounded Change Proposal.

It does not own Resource subtype invariants, Repository ownership, Membership, Grants, Roles, Capabilities, connector delivery, secrets, persistence technology, routes, or UI composition. Each target Resource remains the owner of its own valid commands and state transitions.

## Vocabulary

| Canonical term | External alias | Meaning |
| --- | --- | --- |
| Data Commit | Commit | Immutable actor-attributed batch of accepted structured-data operations and their evidence |
| Data Branch | Branch | Named isolated line of Repository data state; never an authority Scope or Container |
| Data Diff | Diff | Authorization-filtered derived comparison of typed fields or records |
| Change Proposal | Pull Request | Request to review and apply one bounded structured-data change set |
| Change operation | — | Typed reference to a Resource command and its validated input, never executable code |
| Base evidence | — | Stable concurrency/version evidence against which a change was prepared |

## Entities, relationships, and derived concepts

```text
Repository 1 ── contains ── * Data Commit
Repository 1 ── may name ── * Data Branch
Data Branch 1 ── orders ── * Data Commit
Change Proposal 1 ── proposes ── 1 bounded change set
Data Diff = derived comparison(base evidence, proposed state, Actor authority)
```

Data Commit and Change Proposal are candidate persistent identities. Data Branch remains candidate state-line identity. Data Diff is always derived and cannot own lifecycle, authority, or content. None is a Repository, Resource owner, Membership Scope, Principal, Grant, or independent visibility boundary.

## States and transitions

Only the minimum candidate lifecycle is admitted:

```text
Prepared change set
  └── RecordDataCommit ──> Immutable Data Commit

Open Change Proposal
  ├── ApproveProposal ──> Approved
  ├── RejectProposal ───> Rejected
  ├── CloseProposal ────> Closed
  └── ApplyProposal ────> Applied, only if every target command remains valid and authorized
```

Approval never substitutes for apply authorization. Applying a proposal revalidates Actor identity, effective authority, target Resource state, schema, concurrency evidence, and every constituent invariant. Concrete Data Branch creation/archive and conflict-resolution transitions remain unknown and therefore unavailable.

## Invariants

1. Every Data Commit, Data Branch, and Change Proposal belongs to exactly one Repository.
2. A change set cannot reference or mutate a Resource outside that Repository.
3. Every operation uses a known typed Resource command; no generic script, expression, executable payload, or unbounded patch language is accepted.
4. Applying through a Change Proposal yields the same authorization and validation result as issuing the equivalent direct commands at the same state.
5. Approval is historical/process evidence, not a Capability Grant.
6. Data Diff reveals only fields and records the requesting Actor may read in both compared states.
7. Data Diff is derived, immutable to clients, and never a source of authority or truth.
8. Branch selection is Context; it cannot alter Membership, Grant, Role, Capability, visibility, or Repository ownership.
9. A Data Commit is immutable historical evidence; correction occurs through a later authorized change, not mutation of prior evidence.
10. Secret values, credentials, tokens, authorization headers, and private connector configuration never enter change payloads, Data Diff, or historical evidence.

## Actors, principals, contexts, and permissions

- The authenticated User is the Actor who prepares, proposes, reviews, or applies a change.
- Authority-bearing Principals and effective Capabilities come from Access Authority, not from proposal participation or selected Branch Context.
- Data Branch is presentation/work-state Context only.
- The server resolves target Repository and Resources from stable identity and reauthorizes each operation at apply time.
- Review, approval, and apply are distinct operations; their exact Capabilities remain unresolved until a concrete workflow supplies discriminating evidence.

## Events and workflows

Candidate facts include `data_commit.recorded`, `change_proposal.opened`, `change_proposal.reviewed`, `change_proposal.applied`, and `change_proposal.closed`. Exact event names and payloads are not accepted yet.

Any eventual workflow must be idempotent by stable command/proposal identity, preserve actor attribution, avoid copying sensitive Resource content into broad Activity projections, and commit required Resource state plus historical evidence atomically.

## Dependencies and failure behavior

- **Repository Collaboration**: missing or mismatched Repository identity fails closed.
- **Access Authority**: unresolved or insufficient authority prevents read, review, or apply; selected UI Context never fills the gap.
- **Target Resource contract**: unknown command kind, invalid schema, stale concurrency evidence, or failed invariant rejects the affected apply operation.
- **Historical Evidence**: required evidence failure aborts the state transition.
- **Persistence**: cannot introduce an opaque executable patch store or provider-specific Git model into Domain.
- **Delivery**: routes and dialogs may project the same stable proposal identity but never define it.

Atomicity across multiple Resources remains an unresolved requirement. Until it is specified, no partial-apply behavior is accepted.

## Known implementation gaps

No executable mismatch is registered because Product explicitly defers the concrete lifecycle, identity, Capability, persistence, URL, and conflict contracts for these concepts. Inspection of `packages/domain`, `packages/application`, Supabase schemas, and Web routes found no claimed Structured Data Change capability. That absence is intentional containment, not an implementation gap.

If a concrete slice is accepted, any partial implementation must be registered in [`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md) before it is presented as supported.

## Alternatives and removal test

### Keep only direct Resource commands

This remains the default and is sufficient until a real workflow proves the need for grouped, isolated, or reviewed changes.

### Reuse Git directly

Rejected because Git identity, refs, merge, textual patch, and code-history assumptions would redefine the Product boundary.

### Add one generic version-control engine

Rejected because it would hide Resource-specific invariants behind an unbounded patch model and prematurely couple four distinct semantics.

### Treat proposal approval as authority

Rejected because process participation cannot create Capability.

Removing this candidate contract changes nothing executable today. If future users need multi-change review or isolated data-state work, its removal would force those rules into UI or provider adapters and duplicate authorization decisions.

## Falsification conditions

Reopen or split this boundary when:

- no real no-code workflow needs grouped or isolated structured-data changes;
- one of the four concepts has an independent owner/lifecycle that cannot remain in this contract;
- atomic multi-Resource change is impossible or unsafe;
- Resource-specific validation cannot be preserved through a shared proposal process; or
- the only useful implementation requires Source Code, executable expressions, Git refs/merge, or CI/CD.

## Minimum discriminating tests

1. A real non-code Resource workflow proves why one direct command is insufficient.
2. A Data Commit contains only known typed operations for one Repository and is immutable after recording.
3. Cross-Repository and unauthorized operations fail before state or evidence changes.
4. Applying a Change Proposal produces the same validation and authorization result as equivalent direct commands.
5. Concurrent authority revocation or Resource change causes apply to fail closed.
6. Data Diff redacts fields unavailable to the requesting Actor and cannot be client-authored.
7. Branch selection changes work-state projection but never effective authority.
8. Script, shell, executable expression, source file, git ref/merge, and secret-bearing payload fixtures are rejected.

