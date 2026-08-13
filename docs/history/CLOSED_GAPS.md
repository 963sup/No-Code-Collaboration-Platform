# Closed Implementation Gap Archive

- Status: Historical closure evidence
- Current register: [`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md)
- Last consolidated: 2026-08-13

This file preserves evidence for gaps that no longer describe the current executable mismatch set. It is an audit and regression-archaeology source, not a current product, architecture, or implementation authority.

### GAP-PAGE-001 — Generic Data API mutation bypassed accepted Page commands

- Status: Closed
- Affected contracts: [`../domains/page-resource.md`](../domains/page-resource.md), [`../architecture/ADR-007-first-page-resource-vertical-slice.md`](../architecture/ADR-007-first-page-resource-vertical-slice.md), and [`../architecture/ADR-009-controlled-page-command-mutation-boundary.md`](../architecture/ADR-009-controlled-page-command-mutation-boundary.md)
- Risk class: Data integrity / collaboration concurrency / historical evidence
- Closed by: Pull request [#23](https://github.com/963sup/No-Code-Collaboration-Platform/pull/23)

#### Historical failure

At detection time on `main` commit `96eb996accc03409d0535a45c5ce15058305926b`, authenticated Contributors could use generic Resource Data API INSERT/UPDATE paths to bypass accepted `CreatePage` / `UpdatePage` transition semantics and optimistic-concurrency evidence while still producing Resource Activity facts.

#### Resolution

ADR-009 established concrete `create_page` and `update_page` RPCs as `SECURITY INVOKER` commands. Resource RLS now requires short-lived Page command provenance in addition to Actor/Repository Capability checks, and `SupabasePageRepository` writes through those RPCs. Raw authenticated Page DML therefore fails closed without adding service-role or privileged write bypasses.

#### Closure evidence

- Verified implementation head: [`a6bba75bb08cd0c6742ad6932e103698a9ab0bf2`](https://github.com/963sup/No-Code-Collaboration-Platform/commit/a6bba75bb08cd0c6742ad6932e103698a9ab0bf2)
- Pull request: [#23](https://github.com/963sup/No-Code-Collaboration-Platform/pull/23)
- Historical transition at the verified head: `supabase/migrations/20260812073000_enforce_page_command_boundary.sql`; current enforcement is replayed by `supabase/migrations/20260813145001_initial_collaboration_baseline.sql`.
- Page attack-path regression: `supabase/tests/page-resource.test.sql`, 28 assertions covering raw Contributor INSERT/UPDATE denial, command-context restoration, valid create/update, stale evidence, no-op stability, Viewer denial, outsider isolation, and Activity facts
- Full database regression: all four pgTAP suites passed with 85 total assertions
- Exact implementation-head verification: [GitHub Actions Verify #118](https://github.com/963sup/No-Code-Collaboration-Platform/actions/runs/31577420974)
- Passed gates: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts
- Remote boundary: no hosted Supabase database was accessed or mutated; this proves local/CI command enforcement, not an Applied preview, staging, or production migration

Closing this gap did not accept Page archive/delete/restore/idempotency semantics or a generic Resource command engine.

### GAP-LIFECYCLE-002 — Resource destructive lifecycle was not accepted

- Status: Closed
- Affected contract: [`../domains/repository-collaboration.md`](../domains/repository-collaboration.md)
- Risk class: Data integrity, audit continuity, and recovery
- Closed by: Pull request [#22](https://github.com/963sup/No-Code-Collaboration-Platform/pull/22)

#### Historical failure

Authenticated Repository authority could reach `DELETE public.resources` even though archive, restore, retention, purge, redaction, lawful erasure, user-visible consequences, and required historical facts had not been accepted as a Resource lifecycle.

#### Resolution

The unsafe executable capability was removed instead of inventing an incomplete soft-delete model. Authenticated roles no longer have Resource DELETE table reachability and no Resource DELETE RLS policy remains. `resource.delete` may remain authorization vocabulary without implying an executable destructive transition.

#### Closure evidence

- Verified implementation head: [`c5ab97474e8c3f538fd5966a70d40450048a1952`](https://github.com/963sup/No-Code-Collaboration-Platform/commit/c5ab97474e8c3f538fd5966a70d40450048a1952)
- Pull request: [#22](https://github.com/963sup/No-Code-Collaboration-Platform/pull/22)
- Historical transition at the verified head: `supabase/migrations/20260812050000_disable_destructive_resource_deletion.sql`; current enforcement is replayed by `supabase/migrations/20260813145001_initial_collaboration_baseline.sql`.
- Database regression: `supabase/tests/destructive-lifecycle.test.sql`, 13 assertions after the final defense-in-depth assertion was added
- Exact implementation-head verification: [GitHub Actions Verify #108](https://github.com/963sup/No-Code-Collaboration-Platform/actions/runs/31567572157)
- Passed gates: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts
- Database evidence: migration replay from an empty disposable local database, database lint, all four pgTAP suites with 79 total assertions, and generated-type consistency passed
- Remote boundary: no hosted Supabase database was accessed or mutated; this proves local/CI enforcement, not an Applied production migration

Closing this gap did not accept Resource archive, delete, restore, retention, purge, redaction, or lawful-erasure semantics.

### GAP-LIFECYCLE-001 — Destructive Organization and Repository lifecycle was not accepted

- Status: Closed
- Affected contracts: [`../PRODUCT.md`](../PRODUCT.md) and [`../domains/repository-collaboration.md`](../domains/repository-collaboration.md)
- Risk class: Data integrity, audit continuity, and recovery
- Closed by: Pull request [#16](https://github.com/963sup/No-Code-Collaboration-Platform/pull/16)

#### Historical failure

Organization and Repository hard-delete paths were reachable to authenticated actors while containment used cascading foreign keys and no accepted lifecycle defined the fate of Resources, grants, memberships, Activity Events, retention, redaction, restore, or recovery.

#### Resolution

ADR-006 accepted the minimum fail-closed model: Organization and Repository hard deletion are not end-user capabilities until an explicit lifecycle exists. Authenticated DELETE grants and policies were removed while privileged database cascade mechanics remained a separate implementation concern.

#### Closure evidence

- Verified implementation head: [`d8af47d0b3c6225c79efbd708106f42176e443ad`](https://github.com/963sup/No-Code-Collaboration-Platform/commit/d8af47d0b3c6225c79efbd708106f42176e443ad)
- Pull request: [#16](https://github.com/963sup/No-Code-Collaboration-Platform/pull/16)
- Historical transition at the verified head: `supabase/migrations/20260812000000_disable_destructive_container_deletion.sql`; current enforcement is replayed by `supabase/migrations/20260813145001_initial_collaboration_baseline.sql`.
- Database regression: `supabase/tests/destructive-lifecycle.test.sql`, 8 assertions at the time of closure
- Delegation regression: `supabase/tests/role-delegation.test.sql`, 19 assertions with end-user DELETE denial and privileged cascade-mechanics separation
- Exact implementation-head verification: [GitHub Actions Verify #76](https://github.com/963sup/No-Code-Collaboration-Platform/actions/runs/31524256329)
- Passed gates: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts
- Remote boundary: the connected Supabase account listed no project; no hosted database was accessed, provisioned, or mutated. Verification used disposable local CI stacks only

Closing this gap did not assert that the migration was Applied to production. Remote application remains governed by ADR-005 and environment-specific migration-ledger/provider evidence.

### GAP-AUTH-001 — Authority mutation conflated operation capability and delegation authority

- Status: Closed
- Affected contract: [`../domains/access-authority.md`](../domains/access-authority.md)
- Risk class: P0 authorization / privilege escalation
- Closed by: Pull request [#13](https://github.com/963sup/No-Code-Collaboration-Platform/pull/13)

#### Historical failure

Repository grant mutation and Organization membership mutation conflated permission to enter a management operation with authority to assign or remove any role. This enabled privilege-escalation paths and allowed client-controlled grant attribution.

#### Resolution

Domain delegation matrices now evaluate actor Role, current target Role, and proposed Role independently. The same ceilings are projected into Supabase RLS with `USING` for existing state and `WITH CHECK` for proposed state; `granted_by` is bound to the authenticated actor, and owner-continuity enforcement protects the last Organization owner.

#### Closure evidence

- Closing implementation head: [`02f33f4ba75cc250378a6fba38f4b926eb62c355`](https://github.com/963sup/No-Code-Collaboration-Platform/commit/02f33f4ba75cc250378a6fba38f4b926eb62c355)
- Pull request: [#13](https://github.com/963sup/No-Code-Collaboration-Platform/pull/13)
- Historical transition at the verified head: `supabase/migrations/20260811123000_prevent_role_escalation.sql`; current enforcement is replayed by `supabase/migrations/20260813145001_initial_collaboration_baseline.sql`.
- Domain regression matrix: `packages/domain/tests/delegation.test.ts`
- Database attack-path suite: `supabase/tests/role-delegation.test.sql`, including 19 negative and legitimate positive-control assertions
- Exact-head verification: [GitHub Actions Verify #44](https://github.com/963sup/No-Code-Collaboration-Platform/actions/runs/31505215295)
- Passed gates: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts
- Remote boundary: no linked or remote Supabase project was accessed or mutated; database verification used the disposable local CI stack

Closing this gap did not assert that a production deployment occurred. Production validation remains governed by [`../operations/RUNBOOK.md`](../operations/RUNBOOK.md) and its unresolved environment gates.
