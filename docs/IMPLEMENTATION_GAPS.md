# Implementation Gap Register

- Status: Active evidence register
- Register owner: Project maintainer until an explicit governance owner is assigned
- Last reviewed: 2026-08-12

## Purpose

This register records observed differences between accepted or candidate target contracts and the current executable baseline.

A gap is not permission to redefine the target model, postpone an invariant silently, or treat unsafe behavior as supported. It is a bounded statement of prediction error with explicit containment and closure evidence.

The register answers:

> Where does executable behavior differ from the intended contract, what risk does that create, how is the risk contained, and what evidence is required to close the difference?

## Register rules

1. Every gap has a stable identifier, status, affected contract, direct evidence, risk, containment, owner, and closure evidence.
2. Evidence must name the exact code, schema, policy, test, provider observation, or incident. Inference must be labeled as inference.
3. Open authorization or data-integrity gaps block claims of production validation for the affected capability.
4. Temporary containment must fail closed where identity, authority, or data integrity is uncertain.
5. A merged implementation does not close a gap by itself. Required tests and runtime evidence must pass for the exact change.
6. Closed gaps remain in this file for traceability and identify the closing commit, pull request, and verification evidence.
7. If a gap proves the target contract wrong, update the earliest invalid product, domain, or architecture boundary rather than weakening executable enforcement silently.

## Status model

- **Open**: the mismatch exists and closure evidence is incomplete.
- **Contained**: the mismatch still exists, but a verified control prevents the affected behavior from being treated as supported or production-safe.
- **Closed**: executable behavior and required evidence match the target contract.
- **Superseded**: another gap or contract replaces this framing; historical evidence remains linked.

## Open gaps

### GAP-IDENTITY-001 — Identity lifecycle stops after verified Session establishment

- Status: Open
- Affected contract: [`domains/identity-lifecycle.md`](./domains/identity-lifecycle.md)
- Affected invariants: recoverability, Product Actor readiness, invitation continuity, and production provider evidence
- Risk class: Identity availability, incomplete product entry, and operational readiness

#### Direct evidence

- The executable slice implements password registration, email verification, Session establishment, current-Session sign-out, and Profile creation through the existing `auth.users` trigger.
- No Application use case or human-facing route currently implements password recovery, password reset, Product Actor readiness, onboarding, Organization invitation acceptance, email change, MFA, Session listing, or selective revocation UI.
- The repository contains local Auth configuration and a Mailpit browser contract, but the connected Supabase tool reports no hosted project. Production Auth provider settings, redirect allowlists, SMTP, CAPTCHA, notification templates, and Session policies therefore have no direct environment evidence.
- Open registration intentionally creates no Organization membership or Repository Grant.

#### Predicted failure

A User who loses a credential, requires onboarding, or arrives through an Organization invitation cannot complete that lifecycle through the current product. A local passing flow could also be incorrectly described as production-ready even when hosted Auth delivery and redirect behavior differ.

#### Temporary containment

- The product exposes only the implemented registration, verification, sign-in, and current-Session sign-out paths.
- Unsupported recovery, onboarding, invitation, MFA, OAuth, SSO, and account-security behavior is not linked or described as available.
- Registration does not create collaboration authority; authenticated Users without persisted Memberships or Grants remain unauthorized by RLS.
- Production identity readiness remains blocked until hosted configuration and delivery are directly verified.

#### Closure evidence

Close this gap only after:

1. password recovery and reset are implemented and verified without account enumeration;
2. Product Actor readiness and onboarding have one authoritative state model;
3. Organization invitations survive sign-in, registration, and verification without implicitly granting invalid Memberships;
4. credential and Session security operations have explicit scope and reauthentication rules;
5. hosted Supabase redirect, SMTP, abuse-protection, template, notification, and Session settings are verified against the intended production project; and
6. Application, adapter, browser, provider, and operational tests produce consistent evidence.

## Closed gaps

### GAP-LIFECYCLE-002 — Resource destructive lifecycle was not accepted

- Status: Closed
- Affected contract: [`domains/repository-collaboration.md`](./domains/repository-collaboration.md)
- Affected invariants: Resource lifecycle, historical evidence, retention, and recovery
- Risk class: Data integrity, audit continuity, and recovery
- Closed by: Pull request [#22](https://github.com/963sup/No-Code-Collaboration-Platform/pull/22)

#### Direct evidence

At detection time:

- `supabase/schemas/99_rls.sql` granted `DELETE` on `public.resources` to `authenticated` and defined `resources_delete_manager` through the `resource.delete` capability.
- The Repository Collaboration contract listed `resource.deleted` only as a candidate event and required deletion to have explicit idempotency, failure, and audit behavior before acceptance.
- Repository search found no executable `resource.deleted` fact or event implementation outside the candidate contract.
- No accepted Resource lifecycle defined archive, restore, retention, lawful redaction, purge, confirmation, or user-visible consequences.

#### Predicted failure

An authenticated actor with `resource.delete` could hard-delete a Resource even though the product could not explain whether the action meant archive, deletion, purge, or redaction, and no required historical fact or recovery contract proved what must survive.

#### Resolution

The executable-capability-removal alternative was selected instead of inventing an incomplete generic soft-delete lifecycle:

- `supabase/schemas/99_rls.sql` no longer grants authenticated `DELETE` on `public.resources` and no longer defines any Resource DELETE RLS policy.
- `supabase/migrations/20260812050000_disable_destructive_resource_deletion.sql` revokes the previously reachable table privilege and drops `resources_delete_manager` as an append-only replayable transition.
- `supabase/tests/destructive-lifecycle.test.sql` proves both fail-closed layers: `authenticated` lacks the table DELETE privilege and `pg_catalog.pg_policies` contains no Resource DELETE policy.
- The same regression proves Repository admin authority may still resolve the `resource.delete` capability as authority vocabulary while the unaccepted concrete destructive transition remains unavailable.
- An authenticated Repository administrator attempting `DELETE public.resources` receives SQLSTATE `42501`, and the denied transition preserves the Resource and historical Activity Events.
- Non-destructive Organization, Repository, and Page administration remains independently available; no archive, tombstone, restore, purge, or generic lifecycle engine was introduced.
- Type-generation verification now connects directly to the already-running local PostgreSQL database through the Supabase CLI `--db-url` path, removing a nonessential `postgres-meta` image pull that had made exact-head CI evidence depend on an external container-registry rate limit.

#### Temporary containment

The former temporary containment is now the executable product boundary itself: end-user roles cannot invoke Resource hard DELETE. `resource.delete` remains a capability name for future authorization modeling, not proof that any Page delete/archive/purge transition exists.

#### Closure evidence

- Verified implementation head: [`c5ab97474e8c3f538fd5966a70d40450048a1952`](https://github.com/963sup/No-Code-Collaboration-Platform/commit/c5ab97474e8c3f538fd5966a70d40450048a1952)
- Pull request: [#22](https://github.com/963sup/No-Code-Collaboration-Platform/pull/22)
- Migration: `supabase/migrations/20260812050000_disable_destructive_resource_deletion.sql`
- Database regression: `supabase/tests/destructive-lifecycle.test.sql`, 13 assertions after the final defense-in-depth assertion was added
- Exact implementation-head verification: [GitHub Actions Verify #108](https://github.com/963sup/No-Code-Collaboration-Platform/actions/runs/31567572157)
- Passed gates: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts
- Database evidence: migration replay from an empty disposable local database, database lint, all four pgTAP suites with 79 total assertions, and generated-type consistency passed
- Browser evidence: production build, local Auth/Repository/Page collaboration flows, and Playwright behavior passed on the same implementation head
- Remote boundary: no hosted Supabase database was accessed or mutated; this proves local/CI enforcement, not an Applied production migration

Closing this executable gap does **not** accept Resource archive, delete, restore, retention, purge, redaction, or lawful-erasure semantics. A future destructive lifecycle must enter through a new evidence-backed contract and transition rather than restoring the old DELETE grant or policy implicitly.

### GAP-LIFECYCLE-001 — Destructive Organization and Repository lifecycle was not accepted

- Status: Closed
- Affected contracts: [`PRODUCT.md`](./PRODUCT.md) and [`domains/repository-collaboration.md`](./domains/repository-collaboration.md)
- Affected invariants: Product Activity Event durability and Repository containment/history invariants
- Risk class: Data integrity, audit continuity, and recovery
- Closed by: Pull request [#16](https://github.com/963sup/No-Code-Collaboration-Platform/pull/16)

#### Direct evidence

At detection time:

- `supabase/schemas/99_rls.sql` exposed Organization and Repository DELETE operations to authenticated actors who satisfied the narrowed owner or Repository-admin authority policies.
- Repository, Resource, grant, membership, and Activity Event foreign keys used cascading deletion across the containment graph.
- No accepted lifecycle contract defined tombstones, retention, redaction, restore behavior, event continuity, user-visible consequences, or recovery objectives for destructive deletion.
- ADR-004 had already separated destructive lifecycle acceptance from delegation authority.

#### Predicted failure

A permitted hard delete could erase contained Resources, grants, and Activity Events even though the target product model treats Activity Events as historical facts and requires destructive transitions to preserve accepted audit and recovery guarantees.

#### Resolution

- ADR-006 accepts the minimum fail-closed model: Organization and Repository hard deletion are not end-user product capabilities until a later lifecycle defines containment fate, retention, restore, redaction, recovery, and user-visible consequences.
- `supabase/schemas/99_rls.sql` removes `DELETE` from authenticated Organization and Repository table grants and removes the matching DELETE policies.
- `supabase/migrations/20260812000000_disable_destructive_container_deletion.sql` reproduces the accepted transition from the prior baseline.
- `supabase/tests/destructive-lifecycle.test.sql` proves non-destructive Organization/Repository updates still work, authenticated deletes fail with SQLSTATE `42501`, and denied Repository deletion preserves the Repository, contained Page Resource, and Activity Events.
- `supabase/tests/role-delegation.test.sql` separately proves the owner-continuity trigger permits privileged parent-cascade mechanics without exposing that privileged DML as an end-user authorization path.
- Resource hard deletion remained a separate unresolved lifecycle at this gap's closure and was later closed independently by `GAP-LIFECYCLE-002` through the same fail-closed principle.

#### Temporary containment

The temporary containment is now the executable product boundary itself: end-user roles cannot invoke Organization or Repository hard DELETE. A future lifecycle must introduce a new accepted contract rather than silently restoring the old grants or policies.

#### Closure evidence

- Verified implementation head: [`d8af47d0b3c6225c79efbd708106f42176e443ad`](https://github.com/963sup/No-Code-Collaboration-Platform/commit/d8af47d0b3c6225c79efbd708106f42176e443ad)
- Pull request: [#16](https://github.com/963sup/No-Code-Collaboration-Platform/pull/16)
- Migration: `supabase/migrations/20260812000000_disable_destructive_container_deletion.sql`
- Database regression: `supabase/tests/destructive-lifecycle.test.sql`, 8 assertions at the time of closure
- Delegation regression: `supabase/tests/role-delegation.test.sql`, 19 assertions with end-user DELETE denial and privileged cascade-mechanics separation
- Exact implementation-head verification: [GitHub Actions Verify #76](https://github.com/963sup/No-Code-Collaboration-Platform/actions/runs/31524256329)
- Passed gates: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts
- Remote boundary: the connected Supabase account listed no project; no hosted database was accessed, provisioned, or mutated. Verification used disposable local CI stacks only.

Closing this executable gap does not assert that the migration is Applied to production. Remote application remains governed by ADR-005 and environment-specific migration-ledger/provider evidence.

### GAP-AUTH-001 — Authority mutation conflated operation capability and delegation authority

- Status: Closed
- Affected contract: [`domains/access-authority.md`](./domains/access-authority.md)
- Affected invariants: Access Authority invariants 6, 7, 8, 9, and 10
- Risk class: P0 authorization / privilege escalation
- Closed by: Pull request [#13](https://github.com/963sup/No-Code-Collaboration-Platform/pull/13)

#### Direct evidence

At detection time:

- `packages/domain/src/access/capability.ts` defined Role-to-Capability bundles but no provider-neutral role-transition policy evaluated the target's current Role and proposed Role.
- `supabase/schemas/99_rls.sql` authorized Repository grant INSERT, UPDATE, and DELETE through `member.manage` alone.
- Organization membership policies treated `admin` and `owner` as one management class.
- Repository grant attribution could be supplied by the client without requiring `granted_by = auth.uid()`.

#### Predicted failure

- A Repository Manager could use `member.manage` to create or change a direct grant to `admin`, then obtain `repository.manage`.
- An Organization Admin could create owner authority, promote itself to owner, or alter an existing owner relationship.
- A grant mutation could falsely attribute the action to another User.

#### Resolution

- `packages/domain/src/access/delegation.ts` now owns explicit Organization and Repository delegation matrices over actor Role, current target Role, and proposed target Role.
- Repository Managers may manage only Viewer and Contributor grants; Organization Admins may manage only Member and Admin relationships.
- `supabase/schemas/90_private_functions.sql` projects the same role ceilings through private, caller-aware helper functions.
- `supabase/schemas/99_rls.sql` uses `USING` for the existing target Role and `WITH CHECK` for the proposed Role, and binds Repository grant attribution to the authenticated actor.
- A serialized owner-continuity trigger protects the last Organization owner while allowing valid owner transfer and database cascade mechanics.
- Scoped `AGENTS.md` contracts and machine checks make the authority, RLS, test, and migration invariants durable.

#### Temporary containment

The privilege-escalation path is closed by the accepted delegation matrix and database enforcement. Future authority sources must preserve the same current/proposed-role distinction rather than bypassing it.

#### Closure evidence

- Closing implementation head: [`02f33f4ba75cc250378a6fba38f4b926eb62c355`](https://github.com/963sup/No-Code-Collaboration-Platform/commit/02f33f4ba75cc250378a6fba38f4b926eb62c355)
- Migration: `supabase/migrations/20260811123000_prevent_role_escalation.sql`
- Domain regression matrix: `packages/domain/tests/delegation.test.ts`
- Database attack-path suite: `supabase/tests/role-delegation.test.sql`, including 19 negative and legitimate positive-control assertions
- Exact-head verification: [GitHub Actions Verify #44](https://github.com/963sup/No-Code-Collaboration-Platform/actions/runs/31505215295)
- Passed gates: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts
- Remote boundary: no linked or remote Supabase project was accessed or mutated; database verification used the disposable local CI stack

Closing this executable gap does not assert that a production deployment has occurred. Production validation remains governed by [`operations/RUNBOOK.md`](./operations/RUNBOOK.md) and its unresolved environment gates.

## Closure protocol

1. Reproduce the mismatch with the minimum discriminating test.
2. Fix the earliest invalid target or executable boundary.
3. Add regression evidence at every enforcement layer that could independently permit the failure.
4. Record the closing commit, pull request, CI run, migration identifiers when applicable, and operational evidence.
5. Change the status only after the evidence is reviewed.
