# Implementation Gap Register

- Status: Active current-gap register
- Register owner: Project maintainer until an explicit governance owner is assigned
- Last reviewed: 2026-08-16

## Purpose

This register records current observed differences between accepted or Candidate target contracts and executable behavior.

It contains detail only for **Open** or **Contained** gaps. Closed and Superseded evidence lives in [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md).

A gap cannot redefine the target model, silently postpone an invariant, or present unsafe behavior as supported.

## Register rules

1. Every current gap has a stable identifier, status, affected contract, direct evidence, risk, containment, owner, and closure evidence.
2. Evidence names exact code, schema, policy, test, provider observation, or incident; inference is labeled.
3. Open authorization or data-integrity gaps block production-validation claims.
4. Temporary containment fails closed where identity, authority, ownership, or integrity is uncertain.
5. A merged change does not close a gap without exact verification evidence.
6. Closed or Superseded detail moves to history.
7. If evidence proves the target wrong, correct the earliest Product/Domain/Architecture boundary.
8. External CI/provider failure is environment evidence, not automatically Product regression.

## Status model

- **Open**: mismatch exists and closure evidence is incomplete.
- **Contained**: mismatch exists, but verified control prevents unsafe or misleading claims.
- **Closed**: executable behavior and evidence match target; detail belongs in history.
- **Superseded**: another gap or contract replaces the framing; detail belongs in history.

## Current gaps

### GAP-COLLABORATION-SURFACES-001 — Accepted collaboration surfaces have truthful breadth while selected delivery remains Preview or Deferred

- Status: Contained
- Affected contracts: [`PRODUCT.md`](./PRODUCT.md), [`ONTOLOGY.md`](./ONTOLOGY.md), [`domains/repository-collaboration.md`](./domains/repository-collaboration.md), [`architecture/README.md`](./architecture/README.md), [ADR-011](./architecture/ADR-011-github-surface-parallel-composition.md), [ADR-014](./architecture/ADR-014-current-state-collaboration-kernel.md)
- Risk class: target/executable mismatch and misleading readiness claims

#### Direct evidence

- [`.playwright-mcp/github-urls.json`](../.playwright-mcp/github-urls.json) indexes sanitized benchmark URL/component inventories and responsive screenshots.
- The executable App Router exposes GitHub-aligned `/dashboard`, `/repos`, `/issues/assigned`, shared `/{ownerSlug}` identity, canonical `/{ownerSlug}/{repositorySlug}`, `/wiki`, split Organization route families, and `live | preview | deferred` availability.
- Issue and Discussion have typed Domain/Application/schema/adapter/Web command lifecycles with Repository-local numbering, concurrency preconditions, flat comments, and Activity Event Evidence.
- Notifications, Search, Explore, and Repository Projects are authorized read Projections; selected routes remain Preview and Team, Enterprise, and connector installation remain Deferred.
- Source Code, arbitrary execution, and source-control-shaped Product surfaces are absent.

#### Predicted failure

Without containment, documentation or UI could fabricate availability, invent state in React components, create Repository-owned Project detail identity, duplicate Page/Knowledge identity, leak inaccessible projection data, or restore a rejected data-history mental model.

#### Temporary containment

- Product admission and implementation status remain separate.
- Every surface declares `live | preview | deferred`.
- Preview and Deferred surfaces create no fabricated records, authority, persistence, installation, or success.
- Project remains a read/planning Projection.
- `/wiki` remains Page/Knowledge presentation without a second aggregate or history model.
- Current mutation is limited to concrete Resource commands, Expected Revision where required, authoritative Current State, and separate Activity Event Evidence.
- No alternate state line, generic history graph, proposal-convergence process, data capsule, Repository ancestry, typed transfer, or copying lifecycle is accepted or implemented.
- Any future State Comparison, typed transfer, or Repository duplication requires a separate Product decision and discriminating tests.

#### Closure evidence

Close only after the same exact change set proves:

1. Issue and Discussion executable lifecycles remain Repository-scoped and authorization-equivalent across presentation modes.
2. Application use cases and adapters keep Domain decisions out of React components.
3. accepted routes use Server Components by default and minimal interaction islands;
4. every retained supporting slot has independent responsibility and safe unmatched behavior;
5. modal/full-page modes share canonical identity and authorization;
6. Project remains a Projection with no Repository-owned detail identity;
7. `/wiki` remains Page/Knowledge presentation without another aggregate or history model;
8. benchmark URLs remain stable without Domain-driven renaming;
9. Notification, Search, planning, Discussion Answer, and Context invariants pass adversarial tests;
10. build and browser logs report no type, runtime, or hydration regression; and
11. Playwright validates accepted responsive behavior without credentials or private request material.

### GAP-IDENTITY-001 — Identity lifecycle remains incomplete after verified Session and recovery establishment

- Status: Open
- Affected contract: [`domains/identity-lifecycle.md`](./domains/identity-lifecycle.md)
- Risk class: incomplete product entry, identity governance, and hosted-provider readiness

#### Direct evidence

- The executable slice implements password registration, verification, ordinary Session establishment, sign-out, Profile creation, password recovery, Recovery Session discrimination, and password reset.
- Recovery is single-purpose and does not create Membership, Grant, Capability, or Activity authority.
- No Application use case or human route implements Organization invitation acceptance, email change, MFA, Session listing, selective revocation, or enterprise identity policy.
- A hosted Supabase project was observed, but its application schema, migration ledger, Auth delivery, SMTP, abuse protection, templates, and Session settings are not accepted environment evidence.
- Open registration creates no Organization Membership or Repository Grant.

#### Predicted failure

A User can establish and recover the local email/password flow but cannot complete invitation or stronger account-security lifecycles. Hosted behavior may differ from local evidence.

#### Temporary containment

- Recovery Session cannot enter `/dashboard` as an ordinary Product Session.
- Unsupported invitation, MFA, OAuth, SSO, Session-management, and enterprise identity behavior is not described as available.
- Registration and recovery create no collaboration authority.
- Provider existence is not accepted as Preview, Staging, or Production readiness.

#### Closure evidence

Close only after:

1. recovery/reset is exact-head verified without enumeration, ordinary-Session bypass, or Recovery-Session Product access;
2. Product Actor readiness has one authoritative minimum model;
3. Organization invitations survive identity transitions without invalid implicit Membership;
4. credential and Session operations have explicit reauthentication and scope;
5. hosted redirect, SMTP, abuse, template, notification, and Session settings are verified in an accepted environment; and
6. Application, adapter, browser, provider, and operational evidence agree.

## Closed gap index

- `GAP-OWNERSHIP-001` — Closed; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-ownership-001--repository-ownership-and-creation-required-owner-neutral-executable-alignment).
- `GAP-PAGE-001` — Closed; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-page-001--generic-data-api-mutation-bypassed-accepted-page-commands).
- `GAP-LIFECYCLE-002` — Closed; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-lifecycle-002--resource-destructive-lifecycle-was-not-accepted).
- `GAP-LIFECYCLE-001` — Closed; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-lifecycle-001--destructive-organization-and-repository-lifecycle-was-not-accepted).
- `GAP-AUTH-001` — Closed; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-auth-001--authority-mutation-conflated-operation-capability-and-delegation-authority).

## Closure protocol

1. Reproduce the mismatch with the minimum discriminating test.
2. Fix the earliest invalid target or executable boundary.
3. Add regression evidence at every independently permissive enforcement layer.
4. Record exact commit, PR, CI, migration, and operational evidence when applicable.
5. Classify Product regression separately from external CI/provider failure.
6. Change status only after evidence review, then move detail to history.
