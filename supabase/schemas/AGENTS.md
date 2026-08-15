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
- Declarative schema changes MUST be accompanied by a reviewed replay projection and attack-path regression tests before merge: the one consolidated baseline while `LocalOnly`, or an append-only forward migration after persistent application freezes that baseline.
- Schema and migration files are local database contracts. Their presence, a hosted provider project, or successful local replay MUST NOT be used as evidence of remote deployment.
- Organization, Repository, and Resource hard deletion MUST remain unavailable to end-user roles until accepted lifecycle contracts define retention, restore, redaction, containment or subtype fate, historical continuity, and recovery behavior.
- A missing lifecycle MUST fail closed through both table privileges and RLS policy absence; owner or administrator authority alone cannot make an undefined destructive transition valid.
- An authorization vocabulary entry is not lifecycle acceptance. Undefined archive, restore, retention, purge, redaction, or historical guarantees remain unavailable and fail closed.
- The accepted Page content projection MUST remain exactly one JSON object containing one string field named `body`; additional keys or non-string bodies are invalid.
- Page title enforcement MUST reject a title whose trimmed content is empty.
- `resources.updated_at` is server-managed Page concurrency evidence for accepted update paths; authenticated clients MUST NOT directly assign it.
- Accepted Page INSERT/UPDATE transitions MUST enter through command-specific `SECURITY INVOKER` RPCs. Raw authenticated Resource DML MUST fail RLS unless the statement carries the short-lived command context established by those RPCs.
- Page command context is execution provenance only: it MUST be restored before a successful RPC return and MUST NOT replace `auth.uid()`, Repository identity, or Capability checks.
- A no-op Page update MUST NOT advance `updated_at` or fabricate `resource.updated`.
- A meaningful Page create or update and its required immutable fact MUST commit in one PostgreSQL transaction. Fact failure MUST abort the Resource transition.
- `resource.updated` facts MUST attribute the current authenticated actor, MUST NOT duplicate Page body content, and MUST NOT be emitted for no-op updates.
- Issue is an independent Repository-contained projection identified by `(repository_id, issue_number)`. Its reads and mutations must follow the accepted Issue command, concurrency, authorization, and historical-evidence contracts; unaccepted transitions remain unavailable through both privileges and RLS.
- Issue constraints MUST preserve positive Repository-local numbering, non-blank bounded title, and complete closed-state attribution. Seed or migration data is not an Issue-number allocation or mutation contract.

## Projection rule

If Domain policy and SQL enforcement disagree, the change is incomplete. Correct the earliest invalid model; do not weaken either side to make a test pass.

## Local-only environment rule

`LocalOnly` means no identified persistent environment has recorded the repository baseline as Applied. A hosted Supabase project may exist independently and still remain outside the accepted database lifecycle. Continue authoring and verifying these schemas against local/shadow databases until the Runbook/ADR-005 persistent-environment gate is explicitly satisfied. Do not create, link, pull from, push to, or mutate a remote project merely to obtain schema truth.

## Modern declarative authoring

- Files run in `config.toml` `schema_paths` order. Keep dependencies visible: types/tables before foreign keys and policies, private helpers before consumers, grants/RLS after objects exist.
- Own application schemas only. Supabase-managed `auth`, `storage`, and extension internals are provider contracts, not declarative authoring surfaces unless an explicit customization decision says otherwise.
- Fully qualify relations inside privileged functions, use `search_path = ''`, revoke default access before selective grants, and keep privileged helpers out of exposed schemas.
- Declare the complete final grant set. RLS cannot protect `TRUNCATE`, `TRIGGER`, `REFERENCES`, or maintenance privileges, and grants alone cannot authorize rows.
- Prefer constraints and transactionally enforced invariants over UI checks. Prefer `SECURITY INVOKER`; justify each `SECURITY DEFINER` boundary with caller-aware logic and executable attack-path tests.
- Treat `db diff` as a compiler draft. Review unsupported DML, policy alterations, grants, view properties, publications, comments, extension behavior, and destructive normalization.
- A schema change is complete only with a reviewed baseline or forward migration, narrow pgTAP proof, empty-database replay, lint, generated-type consistency, and no substantive drift back to these files.

`seed.sql` is not schema truth. Demo identities and rows must never influence policies, defaults, constraints, migrations, or pgTAP expectations.
