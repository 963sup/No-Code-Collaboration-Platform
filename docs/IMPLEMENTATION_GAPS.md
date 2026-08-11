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

### GAP-AUTH-001 — Repository grant mutation conflates operation and delegation authority

- Status: Open
- Affected contract: [`domains/access-authority.md`](./domains/access-authority.md)
- Affected invariants: Access Authority invariants 6, 8, 9, and 10
- Risk class: P0 authorization / privilege escalation

#### Direct evidence

- `packages/domain/src/access/capability.ts` defines Role-to-Capability bundles but the current baseline has no provider-neutral grant-transition policy that evaluates the target's current Role and proposed Role.
- `supabase/schemas/99_rls.sql` authorizes Repository grant INSERT, UPDATE, and DELETE through `member.manage` alone.
- The current RLS projection does not constrain which existing Role may be managed or which proposed Role may be assigned.

#### Predicted failure

A Repository Manager can use `member.manage` to create or change a direct grant to `admin`, then obtain `repository.manage`. The operation capability therefore becomes an unintended authority-minting capability.

#### Temporary containment

- Repository grant mutation is not production-validated while this gap is open.
- UI hiding is not containment and must not be represented as enforcement.
- A production gate must remain closed unless a verified server-side control blocks the attack path.

#### Closure evidence

1. A provider-neutral Domain delegation matrix evaluates actor Role, current target Role, and proposed Role.
2. Repository Manager may manage only the explicitly accepted lower Roles.
3. RLS uses existing-row checks for the current Role and new-row checks for the proposed Role.
4. Grant attribution is bound to the authenticated actor.
5. Domain tests and pgTAP tests reproduce the original escalation paths and legitimate positive controls.
6. Repository, database, and browser verification pass for the exact closing commit.

### GAP-LIFECYCLE-001 — Destructive Organization and Repository lifecycle is not accepted

- Status: Open
- Affected contracts: [`PRODUCT.md`](./PRODUCT.md) and [`domains/repository-collaboration.md`](./domains/repository-collaboration.md)
- Affected invariants: Product Activity Event durability and Repository containment/history invariants
- Risk class: Data integrity, audit continuity, and recovery

#### Direct evidence

- `supabase/schemas/99_rls.sql` exposes DELETE operations for Organizations and Repositories to authenticated actors who satisfy the current policies.
- Repository, Resource, grant, membership, and Activity Event foreign keys use cascading deletion across the containment graph.
- No accepted lifecycle contract currently defines tombstones, retention, redaction, restore behavior, event continuity, user-visible consequences, or recovery objectives for destructive deletion.

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

## Closure protocol

1. Reproduce the mismatch with the minimum discriminating test.
2. Fix the earliest invalid target or executable boundary.
3. Add regression evidence at every enforcement layer that could independently permit the failure.
4. Record the closing commit, pull request, CI run, migration identifiers when applicable, and operational evidence.
5. Change the status only after the evidence is reviewed.
