# Executable GitHub Semantic Audit — 2026-08-17

- Audit round: 4
- Development line: `first-principles/collaboration-relationship-kernel-repair`
- Verified commit: `342284745b71d1428d368af2e1635e8a4cf26110`
- Verification run: `31983106845`
- Locked benchmark: `github/docs@81ade08c26f13325c0cde8a23cd3bfb85bd0778e`
- Scope: Product, Domain, Application, SQL/persistence, URL/IA, user-facing UI, fixtures, tests, and direct branch verification
- Semantic result: **passed; no excluded Product primitive found**

## Method

This audit is context-aware. A word hit is not a failure by itself.

A hit fails only when Product, Domain, Application, API, persistence, URL/IA, or user-facing UI uses an excluded source-control concept as a target capability, identity, owner, lifecycle, authority source, interaction model, or mental model.

The following contexts may name external concepts without admitting them:

- locked GitHub benchmark evidence;
- explicit exclusion and repair contracts;
- superseded decision history;
- Git/Codex engineering workflow for this source repository;
- SQL transaction syntax; and
- unrelated implementation vocabulary such as CSS class composition.

## Excluded-concept executable matrix

| External concept | Executable finding | Classification | Result |
| --- | --- | --- | --- |
| `commit` | Page/Issue/Discussion commands mutate authoritative Current State under stale-state preconditions. Activity Event is separate same-transaction Evidence. No commit ID, message, ancestry, or Product history graph exists. | Current State Transition + orthogonal Evidence | Passed |
| `branch` | No branch identity, default line, private line, checkout, divergence lifecycle, or convergence operation exists. Concurrent writes use scalar Expected Revision / timestamp preconditions and stale-command rejection. | Current-state concurrency | Passed |
| `diff` | No Product/API/schema patch, hunk, changed-line model, or comparison authority exists. State Comparison remains a derived presentation candidate only. | Deferred Projection | Passed |
| `merge` | No operation combines separate Product state lines or histories. Owning Resource commands establish Current State; stale commands fail closed. | No Product primitive | Passed |
| `fork` | No upstream/source Repository relationship, shared history network, inherited Grant, pull-back path, or synchronization contract exists. | Future independent duplication only | Passed |
| `rebase` | No history rewrite, reorder, or squash lifecycle exists. | Rejected | Passed |
| `cherry-pick` | No history-node selection exists. Future typed movement, if accepted, is separately authorized. | Rejected | Passed |
| `tag` | Repository Labels classify work; no Label points to retained state or changes authority. | Classification only | Passed |
| `HEAD` | Stable Repository/Resource identity resolves authoritative Current State. No movable current pointer exists. | Rejected | Passed |

## Current-state revision boundary

Current executable names include `version`, `expectedVersion`, `expected_version`, `updatedAt`, and `expectedUpdatedAt`.

They pass because each value is only a scalar concurrency precondition or current-row revision indicator:

- one value belongs to one authoritative current Resource row;
- it has no independent Owner, URL, message, author-owned change object, ancestry, or lifecycle;
- it cannot select an alternate state line or grant authority;
- a stale value changes neither state nor success Evidence; and
- no retained snapshot is inferred from the scalar.

This is current-state concurrency, not source-control Product semantics.

## Corrected `commit` scenario revalidation

Question:

> 使用者在 Repository 中儲存了一次 Page 變更，系統怎麼描述這個動作？

Required Product answer:

> The Page Current State now contains the accepted title and body at the new server-managed revision.

Activity Event answers a separate Evidence question. It is not the Product description or replacement for the normal save.

## Product benchmark executable matrix

### Enterprise

- Enterprise remains deferred cross-Organization governance Scope.
- No Enterprise identity, table, Repository Owner relationship, Principal, Grant, or content authority is admitted.
- Result: passed as deferred governance Scope.

### Organization

- Organization is a canonical administration/ownership Scope and possible Repository Owner.
- Repository has exactly one typed User or Organization Owner.
- Organization never authenticates as the request Actor.
- Result: passed.

### Team

- Team remains deferred Organization-scoped group Principal.
- No Team identity, Membership, nesting, Grant, Repository ownership, or collaboration Container exists merely because GitHub has Teams.
- Result: passed as deferred Principal.

### Collaborator

- Persistence stores Direct User Grants; access resolution derives effective authority.
- `Collaborator(user, repository)` is a derived classification after Repository access resolves.
- Direct User Grant is causal; Collaborator is not a stored Grant relationship or mutation command.
- Result: passed.

### User / Social

- User is authenticated human identity and may independently be Actor, Owner, Principal, or Member.
- Profile/social surfaces do not create Repository authority.
- Result: passed.

### Wiki

- `/wiki` lists and mutates Repository-contained Page Resources.
- It reuses Repository authorization, Page commands, current-state concurrency, and Activity Event Evidence.
- No Wiki aggregate, separate Container, or history graph exists.
- Result: passed.

### Projects

- Project surfaces are non-owning planning Projections over already-authorized Repository work.
- They own no source Artifact, Repository, Grant, or mutation authority.
- Result: passed.

### Issues

- Issue is a Repository-scoped actionable Resource with Repository-local number, lifecycle, labels, assignees, comments, revision-aware commands, and Activity Event Evidence.
- Assignment requires Issue-specific authority and creates no Repository access.
- Result: passed.

## Repository and authorization checks

- Repository remains the only primary collaboration and authorization Container.
- User/Organization ownership is typed and exactly-one.
- Membership, ownership, Direct User Grant, derived Collaborator, selected Context, responsibility, authorship, and participation remain separate facts.
- Public visibility can contribute read/participation capabilities without manufacturing a persisted Repository Role.
- Page, Issue, and Discussion resolve authority through stable Repository identity and action-specific Capabilities.
- Project, Search, Notification, Feed, Audit, profile tabs, and planning filters remain Projections / presentation surfaces and do not own collaborative truth.
- Direct User Grant management remains Admin-only and separate from ordinary content mutation authority.

## Round-4 root corrections

1. `apps/web/e2e/repository-grant-lifecycle.spec.ts` now locates the actual `Grant access` command instead of the retired `Add collaborator` label.
2. `tooling/check-access-authority.mjs` now enforces the same canonical user-facing command.
3. The two-User lifecycle test no longer assumes Search must expose account chrome: it proves authorized Search visibility, then navigates to `/dashboard` before the independent sign-out action.
4. Repository schema and the unique LocalOnly baseline both use `authorization/Evidence boundary`.

These repairs change test/verification assumptions to follow Product truth; they do not weaken Domain, Application, RLS, or grant-delegation enforcement.

## Executable verification evidence

GitHub Actions run `31983106845` on commit `342284745b71d1428d368af2e1635e8a4cf26110` completed successfully:

- Workflow guardrails — success
- Repository contracts — success
- Supabase contracts — success
- Browser contracts — success
- Browser result — **29 passed**

The Supabase job successfully started the local stack, replayed the unique LocalOnly baseline, executed the repository database verification chain, and stopped cleanly. The Browser job built the application and passed all 29 contracts against the replayed local state.

This is repository CI/reproducibility evidence. It is not evidence that a hosted Supabase or Vercel environment has applied or deployed this branch.

## Authorization / Evidence boundary

`supabase/schemas/30_repository.sql` and `supabase/migrations/20260814190012_local_development_baseline.sql` both describe Repository as the primary `Resource/authorization/Evidence boundary`.

That wording matches the current-state kernel:

- authorization decides whether a future action is allowed;
- Current State stores accepted state;
- Activity Event explains accepted past action as orthogonal Evidence;
- no Product history node is introduced to connect those concerns.

## Convergence

The 2026-08-17 Round-4 report records:

- all nine excluded concepts passed;
- all eight Product benchmark concepts passed;
- `revoked`: None;
- `not_passed`: None.

No source-control-shaped Product primitive remains admitted through naming, persistence, route structure, UI mental model, or authorization semantics.

## Conclusion

The collaboration-relationship kernel is semantically converged at the repository authority layer. The next operation is mirror synchronization to Linear and Notion, followed by normal integration review. This document does not authorize or perform a merge to `main`.
