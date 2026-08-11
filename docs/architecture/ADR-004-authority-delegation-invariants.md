# ADR-004: Authority delegation and ownership continuity

- Status: Accepted
- Date: 2026-08-11
- Decision owner: Repository owner
- Affected scopes: Domain access policy, Organization membership, Repository grants, Supabase RLS, database triggers, authorization tests

## Decision

Separate operation capability from delegation authority.

`member.manage` means an actor may enter the member-management use case. It does not mean the actor may assign, modify, or remove every role. Every membership or grant mutation must evaluate:

```text
Actor authority
+
Target current role
+
Target proposed role
+
Cross-row governance invariants
```

The accepted delegation scopes are:

| Scope | Actor | Existing roles it may manage | Roles it may assign |
|---|---|---|---|
| Organization | owner | member, admin, owner | member, admin, owner |
| Organization | admin | member, admin | member, admin |
| Organization | member | none | none |
| Repository | admin | viewer, contributor, manager, admin | viewer, contributor, manager, admin |
| Repository | manager | viewer, contributor | viewer, contributor |
| Repository | contributor/viewer | none | none |

Organization owner is a protected governance role. An Organization that still exists must retain at least one owner. Repository grant attribution must identify the authenticated actor.

ADR-005 removes Organization and Repository hard deletion from end-user authority until a separate lifecycle contract is accepted. The parent-cascade case retained by this ADR is only a privileged database-mechanics test proving that the owner-continuity trigger does not falsely block deletion of a parent row that no longer exists. It is not a product authorization path.

## Problem and success condition

The original capability model correctly distinguished Repository manager from admin for `repository.manage`, but it gave manager `member.manage`. Database RLS then projected that single capability as unrestricted mutation access to `repository_user_grants`. A manager could therefore change a grant to `admin` and acquire `repository.manage`.

Organization membership policies similarly treated `admin` and `owner` as one management class. An admin could create owner authority, alter an owner relationship, or reach the then-exposed Organization DELETE path.

The decision succeeds when:

- operation capability cannot be converted into higher authority;
- Organization admins cannot control owners;
- Repository managers cannot control manager or admin grants;
- the last Organization owner cannot be removed under concurrent transactions;
- legitimate lower-role delegation remains available;
- Domain decisions and database enforcement return the same answers for the same transition matrix;
- the owner-continuity trigger permits a privileged parent cascade without implying end-user deletion authority; and
- delegation semantics remain independent from lifecycle acceptance.

## Evidence ledger

### Observations

- Domain role bundles describe what an effective role may do but did not describe what authority it may delegate.
- Existing RLS checked only the actor capability and did not constrain the current or proposed target role.
- Existing tests covered read visibility and basic capability bundles but not self-escalation or higher-role mutation.
- Organization deletion historically used the same admin-or-owner predicate as ordinary administration.
- The product lifecycle contract does not accept destructive Organization or Repository deletion.

### Constraints

- Domain remains provider neutral.
- RLS is a database enforcement boundary, not the owner of business semantics.
- Public table privileges and RLS remain separate controls.
- User-facing mutations must not depend on service-role bypass.
- Schema files remain current database truth; migrations remain append-only history.
- This authorization decision cannot define, close, or weaken destructive lifecycle semantics.

### Assumptions

- Fixed role bundles and explicit delegation ceilings are sufficient for the current horizon.
- No deny-precedence engine, custom-role system, or external authorization service is required for this repair.

### Unknowns

- Whether future product requirements need a distinct self-leave use case.
- Whether Enterprise policy will later cap Organization or Repository delegation.
- Whether ownership transfer will later require approval, recovery, or multi-party controls.

### Value choices

- Prefer authority conservation over rank-based convenience.
- Prefer an explicit role-transition matrix over implicit “manager can manage members” interpretation.
- Enforce the same invariant in Domain, RLS, and database concurrency controls.
- Keep access authority and destructive lifecycle acceptance as separate decisions.

## Minimum sufficient model

```text
Capability
→ may initiate an operation category

Delegation policy
→ which current and proposed roles are within scope

RLS
→ enforces old-row and new-row transition constraints

Database trigger
→ serializes and preserves cross-row owner continuity
```

The authorization predicate is:

```text
Can mutate
=
Has operation capability
∩ Can manage current role
∩ Can assign proposed role
∩ Preserves governance invariants
```

## Enforcement projection

Domain owns pure functions for Organization and Repository delegation. SQL helper functions in the private schema project those decisions for RLS.

For UPDATE:

```text
USING
→ validates the existing target role

WITH CHECK
→ validates the proposed target role
```

For INSERT, `WITH CHECK` validates the proposed role and authenticated actor attribution. For DELETE, `USING` validates the existing membership or grant role when that relationship deletion is an accepted operation.

Owner continuity is cross-row and concurrency sensitive. A trigger locks the owning Organization row before removing or demoting an owner, then verifies that another owner remains. Cascading membership deletion caused by a privileged database deletion of the Organization is allowed at the database mechanism boundary because the governed Organization no longer exists. That mechanism test prevents a false-positive continuity failure; ADR-005 independently denies Organization and Repository hard deletion to end-user roles.

## Alternatives rejected

- Remove `member.manage` from Repository manager: closes escalation but also removes legitimate viewer/contributor administration and avoids defining the real delegation problem.
- Compare only numeric role ranks: conflates capability order with delegation policy and cannot express protected governance roles cleanly.
- Enforce only in Application code: leaves direct Data API and alternate adapters vulnerable.
- Enforce only in RLS: protects storage but leaves the canonical Domain model unable to explain or test the business rule.
- Add a separate authorization service: introduces a new distributed authority without evidence that PostgreSQL plus the modular monolith is insufficient.
- Require UI role filtering: hides dangerous choices but does not secure the mutation boundary.
- Treat owner authority as lifecycle acceptance: confuses access delegation with retention, audit continuity, recovery, and user-visible lifecycle behavior.

## Consequences

Benefits:

- authority cannot be minted from a lower management capability;
- owner and admin become semantically distinct;
- database enforcement matches the Domain transition matrix;
- negative attack-path tests become part of the authorization contract;
- parent-cascade mechanics remain testable without exposing a product DELETE path; and
- destructive lifecycle decisions remain independently reviewable.

Costs:

- role changes require explicit old/new-role reasoning;
- owner continuity requires a database lock and trigger;
- future role additions must update Domain, SQL projection, migration, and tests together; and
- Organization and Repository hard deletion remain unavailable to end users until a separate lifecycle decision is accepted.

## Falsification conditions

Reopen this decision if a real use case cannot be represented without duplicated exceptions, if fixed roles cease to be sufficient, or if measured contention on Organization ownership transitions makes the row-lock strategy unacceptable.

Do not reopen merely because another product uses different role names. Reopen only when observed collaboration requirements invalidate the current delegation matrix.

## Minimum discriminating test

The model is accepted only if all of the following hold through the appropriate boundaries:

- Organization admin self-promotion to owner is denied.
- Organization admin mutation or deletion of an owner relationship is denied.
- Repository manager self-promotion or promotion of another grant to admin is denied.
- Repository manager can still create viewer and contributor grants.
- Repository admin can create an admin grant.
- Removing or demoting the last owner is denied.
- Removing an owner when another owner remains is allowed.
- A privileged parent cascade is not falsely blocked by the continuity trigger.
- Organization and Repository hard deletion remain denied to end-user roles under ADR-005.
- forged `granted_by` attribution is denied.

Any mismatch between Domain tests and pgTAP enforcement tests reopens the earliest inconsistent boundary.
