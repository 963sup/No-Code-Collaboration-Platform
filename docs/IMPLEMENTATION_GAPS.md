# Implementation Gap Register

- Status: Active evidence register
- Register owner: Project maintainer until an explicit governance owner is assigned
- Last reviewed: 2026-08-11

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

### GAP-LIFECYCLE-001 — Destructive Organization and Repository lifecycle is not accepted

- Status: Open
- Affected contracts: [`PRODUCT.md`](./PRODUCT.md) and [`domains/repository-collaboration.md`](./domains/repository-collaboration.md)
- Affected invariants: Product Activity Event durability and Repository containment/history invariants
- Risk class: Data integrity, audit continuity, and recovery

#### Direct evidence

- `supabase/schemas/99_rls.sql` still exposes Organization and Repository DELETE operations to authenticated actors who satisfy the narrowed owner or Repository-admin authority policies.
- Repository, Resource, grant, membership, and Activity Event foreign keys use cascading deletion across the containment graph.
- No accepted lifecycle contract currently defines tombstones, retention, redaction, restore behavior, event continuity, user-visible consequences, or recovery objectives for destructive deletion.
- ADR-004 narrows Organization DELETE authority to owner-only as least-privilege containment; it explicitly does not accept destructive deletion as a product lifecycle.

#### Predicted failure

A permitted hard delete can erase contained Resources, grants, and Activity Events even though the target product model treats Activity Events as historical facts and requires destructive transitions to preserve accepted audit and recovery guarantees.

#### Temporary containment

- Organization and Repository hard deletion are not production-validated capabilities while this gap is open.
- No UI, API, runbook, or operator procedure may describe destructive deletion as supported merely because a database policy currently permits it.
- Production readiness remains blocked until the delete path is removed or an explicit lifecycle contract is accepted and verified.

#### Closure evidence

Choose and verify one coherent model:

1. **Remove the capability**: revoke or deny destructive deletion until a demonstrated lifecycle requires it; or
2. **Accept the lifecycle**: define authority, confirmation, idempotency, containment fate, historical retention or lawful redaction, tombstones, restore behavior, backup expectations, concurrency, user communication, and audit evidence.

In either model, schema constraints, RLS, Domain/Application behavior, pgTAP tests, recovery tests, and production gates must agree.

## Closed gaps

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
