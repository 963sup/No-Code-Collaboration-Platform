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

No open authorization or data-integrity gaps are currently registered. This does not imply production validation: no Supabase Cloud project is provisioned, and persistent-environment, release, recovery, and operational evidence remain governed by [`operations/RUNBOOK.md`](./operations/RUNBOOK.md).

## Closed gaps

### GAP-LIFECYCLE-001 — Destructive Organization and Repository lifecycle was not accepted

- Status: Closed
- Affected contracts: [`PRODUCT.md`](./PRODUCT.md) and [`domains/repository-collaboration.md`](./domains/repository-collaboration.md)
- Affected invariants: Product Activity Event durability and Repository containment/history invariants
- Risk class: Data integrity, audit continuity, and recovery
- Closed by: Pull request [#16](https://github.com/963sup/No-Code-Collaboration-Platform/pull/16)

#### Direct evidence

At detection time:

- `supabase/schemas/99_rls.sql` granted Organization and Repository DELETE operations to authenticated actors who satisfied owner or Repository-admin authority policies.
- Repository, Resource, grant, membership, and Activity Event foreign keys used cascading deletion across the containment graph.
- No accepted lifecycle contract defined tombstones, retention, redaction, restore behavior, event continuity, user-visible consequences, or recovery objectives for destructive deletion.
- ADR-004 narrowed Organization DELETE authority as least-privilege containment but explicitly did not accept destructive deletion as a product lifecycle.

#### Predicted failure

A permitted hard delete could erase contained Resources, grants, and Activity Events even though the target product model treats Activity Events as historical facts and requires destructive transitions to preserve accepted audit and recovery guarantees.

#### Temporary containment

Before closure:

- Organization and Repository hard deletion were not production-validated capabilities.
- No UI, API, runbook, or operator procedure could describe destructive deletion as supported merely because a database policy permitted it.
- Production readiness remained blocked until the delete path was removed or an explicit lifecycle was accepted and verified.

#### Resolution

The capability-removal alternative was selected rather than inventing an incomplete soft-delete lifecycle:

- [`architecture/ADR-006-defer-destructive-container-deletion.md`](./architecture/ADR-006-defer-destructive-container-deletion.md) defines Organization and Repository hard deletion as unaccepted transitions.
- `supabase/schemas/99_rls.sql` no longer grants `DELETE` on `public.organizations` or `public.repositories` to `authenticated` and no longer defines DELETE policies for those boundaries.
- `supabase/migrations/20260812000000_disable_destructive_container_deletion.sql` revokes the existing privileges and drops the existing policies as an append-only accepted replayable transition.
- `supabase/tests/destructive-lifecycle.test.sql` proves Organization and Repository non-destructive administration remains available while authenticated hard deletion fails with SQLSTATE `42501` and preserves the Repository, contained Page Resource, Activity Events, and Organization.
- `supabase/tests/role-delegation.test.sql` now separates authenticated lifecycle authorization from privileged parent-cascade mechanics, preserving the owner-continuity trigger contract without reintroducing an end-user DELETE path.
- `supabase/schemas/AGENTS.md` and the architecture catalog make the fail-closed lifecycle boundary durable.

#### Closure evidence

- Closing executable head: [`d6c6f36477d0082e10f116069dfb5b2a33d13179`](https://github.com/963sup/No-Code-Collaboration-Platform/commit/d6c6f36477d0082e10f116069dfb5b2a33d13179)
- Migration: `supabase/migrations/20260812000000_disable_destructive_container_deletion.sql`
- Lifecycle regression suite: `supabase/tests/destructive-lifecycle.test.sql`, including 8 negative and legitimate positive-control assertions
- Delegation compatibility suite: `supabase/tests/role-delegation.test.sql`, including 19 authority, continuity, attribution, and privileged cascade-mechanics assertions
- Exact-head verification: [GitHub Actions Verify #56](https://github.com/963sup/No-Code-Collaboration-Platform/actions/runs/31514573942)
- Passed gates: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts
- Database evidence: accepted migrations replayed from an empty disposable local database; database lint, all pgTAP suites, and generated database type consistency passed
- Remote boundary: no linked or remote Supabase project was accessed, provisioned, or mutated; the migration is Accepted replayable history, not evidence of an Applied remote deployment

Closing this executable gap removes an unsafe product capability; it does not accept archive, restore, purge, redaction, legal hold, or destructive lifecycle semantics. A future lifecycle requirement must reopen the model through a new evidence-backed decision and complete transition, retention, recovery, and user-communication contracts.

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
- A serialized owner-continuity trigger protects the last Organization owner while allowing valid owner transfer and privileged database cascade mechanics.
- Scoped `AGENTS.md` contracts and machine checks make the authority, RLS, test, and migration invariants durable.

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
