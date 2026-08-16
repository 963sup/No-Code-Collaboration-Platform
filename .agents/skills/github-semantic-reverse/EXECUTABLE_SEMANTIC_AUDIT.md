# Executable GitHub Semantic Audit — 2026-08-16

- Audit round: 3
- Development line: `first-principles/collaboration-relationship-kernel-repair`
- Audited parent: `522c191e1461e917c5a7511e0c1aef94dc71371e`
- Locked benchmark: `github/docs@81ade08c26f13325c0cde8a23cd3bfb85bd0778e`
- Scope: Product, Domain, Application, SQL/persistence, URL/IA, user-facing UI, fixtures, and tests visible through the connected GitHub repository
- Semantic result: **passed with two verification/deployment follow-ups; no excluded Product primitive found**

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
| `commit` | Page/Issue/Discussion commands mutate one current row under a stale-state precondition. Activity Event is separate same-transaction Evidence. No commit ID, message, author-owned change object, ancestry, or history graph exists. | Current State Transition + orthogonal Evidence | Passed |
| `branch` | No branch identity, default line, private line, divergence lifecycle, checkout, or convergence operation exists. Concurrent writes use `expectedUpdatedAt`, `expectedVersion`, transaction serialization, and stale-command rejection. | Current-state concurrency | Passed |
| `diff` | No Product/API/schema comparison object, patch, hunk, changed-line model, or comparison authority exists. State Comparison remains deferred derived presentation. | Deferred Projection only | Passed |
| `merge` | No operation combines separate state lines or histories. Stale commands fail closed. The executable `twMerge` symbol combines CSS class names only. | No Product primitive | Passed |
| `fork` | No upstream/source Repository relationship, shared history, repository network, inherited Grant, pull-back path, or synchronization contract exists. | Future independent duplication only | Passed |
| `rebase` | No history-rewrite operation, reorder/squash lifecycle, or retained-state command exists. | Rejected | Passed |
| `cherry-pick` | No history-node selection or cross-line copy exists. Future typed movement remains separately authorized and deferred. | Rejected | Passed |
| `tag` | Repository-scoped Labels classify work. No Label points to retained state or changes authority. | Label only | Passed |
| `HEAD` | Stable Repository/Resource identity resolves current storage truth. No movable current-state pointer or detached state exists. | Rejected | Passed |

## Current-state revision boundary

Current executable names include `version`, `expectedVersion`, `expected_version`, `updatedAt`, and `expectedUpdatedAt`.

They pass because each value is only a scalar concurrency precondition or current-row revision indicator:

- one value belongs to one authoritative current Resource row;
- it has no independent owner, URL, message, author, timestamped payload, ancestry, or lifecycle;
- it cannot select an alternate state line or grant authority;
- a stale value changes neither state nor success Evidence; and
- no retained snapshot is inferred from the scalar.

This is legitimate current-state concurrency, not a source-control Product model.

## Corrected `commit` scenario revalidation

Question:

> 使用者在 Repository 中儲存了一次 Page 變更，系統怎麼描述這個動作？

Executable answer:

> The Page Current State now contains the accepted title and body at the new server-managed revision.

Evidence:

- Web submits `expectedUpdatedAt` and reports only `Page saved.` or a stale-state error.
- Application sends one concrete `UpdatePage` command.
- `public.update_page` updates the existing Page row only when `updated_at = expected_updated_at`.
- a no-op or stale write returns no changed row;
- the resource activity trigger records immutable Evidence in the same database transaction; and
- no Product history node, snapshot object, change message, ancestry, or alternate state line is created.

Activity Event answers a separate audit question. It is not the Product description of the normal save.

## Product benchmark executable matrix

### Enterprise

- `/settings/enterprises` is explicitly `deferred`.
- No Enterprise identity, table, Owner relationship, Principal, Grant, or content authority is implemented.
- Result: passed as deferred governance Scope.

### Organization

- `organizations` and `organization_memberships` are separate persisted facts.
- Repository has exactly one typed `owner_user_id` or `owner_organization_id`.
- ordinary Membership is not read as a Repository Grant; only owner/admin governance contributes authority for an Organization-owned Repository.
- Result: passed.

### Team

- `/orgs/{organizationSlug}/teams` is explicitly `deferred`.
- No Team identity, Membership, nesting, Principal, Grant, Repository ownership, or collaboration Container exists.
- Result: passed as deferred group Principal.

### Collaborator

- Persistence stores `repository_user_grants`; access resolution derives effective authority.
- `Collaborator(user, repository)` is a derived classification after `repository.view` resolves.
- Round 3 removed two false causal uses: access management no longer labels Direct User Grants as “Direct collaborators,” and Issue presentation no longer labels every author as a collaborator.
- Outside collaborator remains derived from effective Repository access plus absence of Organization Membership.
- Result: passed after repair.

### User / Social

- User is the authenticated human identity and may independently be Actor, Owner, Principal, or Member.
- Owner profile returns identity-safe display data and access-filtered Repository routes.
- Stars is deferred; Projects tab is a non-owning Projection; tab selection changes no authority.
- Result: passed.

### Wiki

- `/wiki` lists and mutates Repository-contained Page Resources.
- It reuses Repository authorization, Page commands, current-state concurrency, and Activity Event Evidence.
- No Wiki aggregate, Git-backed file tree, separate Container, or Wiki history graph exists.
- Result: passed.

### Projects

- global, Owner, and Repository Project surfaces read `ProjectReader` projection items over already-authorized Page, Issue, and Discussion work.
- no Project owner, Grant, source Artifact, mutation command, table, or authority boundary exists.
- filters and rows cannot mutate source truth.
- Result: passed as planning Projection.

### Issues

- Issue is a Repository-scoped actionable Resource with local number, `open | closed` lifecycle, labels, assignees, comments, revision-aware commands, and Activity Event Evidence.
- assignment requires `issue.manage`; an assignee must already be able to view the Repository.
- assignment, mention, and participation create no Repository authority.
- Result: passed.

## Repository and authorization checks

- Repository remains the only primary collaboration and authorization Container.
- User/Organization ownership is typed and exactly-one.
- Organization never authenticates as the request Actor.
- Membership, ownership, Direct User Grant, derived collaborator classification, selected Context, responsibility, and participation remain separate facts.
- Page, Issue, and Discussion all resolve authority through stable Repository identity.
- Project, Search, Notification, Feed, Audit, profile tabs, and planning filters remain Projections.

## Repairs made from this audit

1. Replaced the Access Authority Domain contract with a smaller canonical model that makes `Grant` causal and `Collaborator` derived.
2. Renamed the access-management surface from `Direct collaborators` to `Direct User grants`.
3. Replaced `Add collaborator` with `Grant access` and removed collaborator-shaped username placeholder copy.
4. Replaced `Collaborator opened this Issue` with the actual author attribution `Opened by {issue.createdBy}`.
5. Added machine checks that reject reintroduction of those false causal labels.

## Remaining follow-ups

1. Full local verification is unavailable in this connector-only environment. Run `pnpm codex:check` and `pnpm verify:fast` from a complete checkout before integration.
2. GitHub Actions has no run for the direct branch commits. The visible Vercel failure predates this repair and reports build-rate limiting; it is external environment evidence, not semantic validation.
3. `supabase/schemas/30_repository.sql` still uses the noncanonical phrase `authorization/history boundary` in a table comment. The table shape contains no history object, so this is not a source-control primitive, but the comment should become `authorization/Evidence boundary` atomically with the local baseline when a complete checkout can regenerate and verify replay evidence.

## Conclusion

The executable model no longer contains an admitted source-control-shaped Product primitive. The remaining work is verification and one baseline-coupled schema-comment normalization, not Product-model redesign.
