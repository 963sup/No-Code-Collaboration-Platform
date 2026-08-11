# Declarative Schema Enforcement Scope

This directory owns current PostgreSQL schema truth and the database enforcement projection of accepted Domain invariants. It does not own the canonical business meaning of roles or capabilities.

## Inviolable invariants

- Grants determine API reachability; RLS and database constraints determine whether a concrete mutation is permitted.
- Authorization mutations MUST validate both sides of a transition: `USING` protects the existing row and `WITH CHECK` protects the proposed row.
- Membership or grant management MUST evaluate the target role in addition to the actor's operation capability.
- Organization admins MUST NOT create, modify, delete, or otherwise control owner relationships.
- Repository managers MUST NOT create, modify, or delete manager or admin grants.
- Any Organization that remains present MUST retain at least one owner. This cross-row invariant requires serialized database enforcement, not UI checks or a single-row RLS predicate.
- Actor attribution fields such as `granted_by` MUST be derived from or equal the authenticated actor and may not be client-forged.
- Authorization helper functions belong in a non-exposed schema. `SECURITY DEFINER` is permitted only for an explicit RLS boundary, with `search_path = ''`, fully qualified relations, caller-aware logic, and least-privilege `EXECUTE` grants.
- End-user authorization MUST never depend on service-role bypass, user-editable metadata, presentation context, or hidden UI controls.
- Organization and Repository hard deletion MUST remain unavailable to end-user roles until an accepted lifecycle contract defines retention, restore, redaction, containment fate, historical continuity, and recovery behavior.
- A missing lifecycle MUST fail closed through both table privileges and RLS policy absence; owner or administrator authority alone cannot make an undefined destructive transition valid.
- Declarative schema changes MUST be accompanied by an append-only migration and attack-path regression tests before merge.

## Projection rule

If Domain policy and SQL enforcement disagree, the change is incomplete. Correct the earliest invalid model; do not weaken either side to make a test pass.
