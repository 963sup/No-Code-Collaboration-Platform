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
- Declarative schema changes MUST be accompanied by an append-only accepted migration and attack-path regression tests before merge.
- Schema and migration files are local database contracts. Their presence MUST NOT be used as evidence that a Supabase Cloud project exists or that a remote deployment occurred.
- Organization, Repository, and Resource hard deletion MUST remain unavailable to end-user roles until accepted lifecycle contracts define retention, restore, redaction, containment or subtype fate, historical continuity, and recovery behavior.
- A missing lifecycle MUST fail closed through both table privileges and RLS policy absence; owner or administrator authority alone cannot make an undefined destructive transition valid.
- `GAP-LIFECYCLE-001` records the verified fail-closed boundary for Organization and Repository hard deletion.
- `GAP-LIFECYCLE-002` records the verified fail-closed boundary for Resource hard deletion; `resource.delete` remains authority vocabulary only and MUST NOT be treated as evidence that Page archive, restore, retention, purge, redaction, or historical guarantees are accepted.
- The accepted Page content projection MUST remain exactly one JSON object containing one string field named `body`; additional keys or non-string bodies are invalid.
- Page title enforcement MUST reject a title whose trimmed content is empty.
- `resources.updated_at` is server-managed Page concurrency evidence for accepted update paths; authenticated clients MUST NOT directly assign it.
- Accepted Page INSERT/UPDATE transitions MUST enter through command-specific `SECURITY INVOKER` RPCs. Raw authenticated Resource DML MUST fail RLS unless the statement carries the short-lived command context established by those RPCs.
- Page command context is execution provenance only: it MUST be restored before a successful RPC return and MUST NOT replace `auth.uid()`, Repository identity, or Capability checks.
- A no-op Page update MUST NOT advance `updated_at` or fabricate `resource.updated`.
- A meaningful Page create or update and its required immutable fact MUST commit in one PostgreSQL transaction. Fact failure MUST abort the Resource transition.
- `resource.updated` facts MUST attribute the current authenticated actor, MUST NOT duplicate Page body content, and MUST NOT be emitted for no-op updates.

## Projection rule

If Domain policy and SQL enforcement disagree, the change is incomplete. Correct the earliest invalid model; do not weaken either side to make a test pass.
