# Declarative Schema Enforcement Scope

This directory owns current PostgreSQL schema truth and the independent database enforcement projection of accepted Domain invariants. It does not own the canonical business meaning of Repository Roles or Capabilities.

## Repository authorization invariants

- Current Repository Roles are `read | triage | write | maintain | admin`; SQL must project the same accepted no-code capability matrix as Domain without importing Code/Git permissions.
- Grants determine API reachability; RLS, command-specific RPCs, and database constraints determine whether a concrete row transition is permitted.
- Page, Issue, Discussion, Repository settings, and Repository access are distinct authorization actions. Do not re-collapse them into generic `resource.create`, `resource.update`, or `member.manage` checks.
- Direct Repository Grant management is Admin-only. `read`, `triage`, `write`, and `maintain` MUST NOT create, change, revoke, or enumerate the Direct Grant management projection.
- A Direct Grant mutation MUST treat the expected current Role as a real compare-and-swap precondition at the DML statement. A stale Role changes zero rows, returns changed state, and emits no Activity Evidence.
- A Direct Grant command reports success only after exactly one accepted authority transition and its required Activity Evidence commit in the same transaction.
- Grant target existence must not be queried across the Auth boundary before Repository access-management authority is established.
- Actor attribution fields such as `granted_by` MUST equal the authenticated Actor and may not be client-forged.
- Direct Grant delegation cannot target the authenticated Actor itself.
- Repository raw Grant DML is not an alternate command API. Transaction-local command context, RLS, Actor checks, and capability checks must all agree.
- Organization admins MUST NOT create, modify, delete, or otherwise control owner relationships.
- Any Organization that remains present MUST retain at least one owner. This cross-row invariant requires serialized database enforcement, not UI checks or a single-row RLS predicate.
- Authorization helper functions belong in a non-exposed schema. `SECURITY DEFINER` is permitted only for an explicit enforcement boundary, with `search_path = ''`, fully qualified relations, caller-aware logic, and least-privilege `EXECUTE` grants.
- End-user authorization MUST never depend on service-role bypass, user-editable metadata, presentation Context, or hidden UI controls.

## Collaborative-surface invariants

- `read` participation, `triage` work/conversation management, `write` Page/content mutation, `maintain` non-sensitive maintenance, and `admin` sensitive settings/access must remain distinguishable through executable database tests.
- Locked Discussion is a moderation state, not a universal write embargo: an open locked Discussion rejects ordinary Read/Triage comments but accepts comments from a Role with `discussion.comment.locked` (currently Write, Maintain, Admin).
- Closed Discussion rejects new comments regardless of Role.
- Announcement creation requires `discussion.announce` (currently Maintain/Admin), not Repository access-management authority.
- Issue assignment/classification/state management uses `issue.manage`; Issue body editing uses `issue.edit`; ordinary Issue commenting uses `issue.comment`.
- Page creation/update use `page.create` / `page.update` and continue through command-specific `SECURITY INVOKER` RPCs.
- The accepted Page content projection remains exactly one JSON object containing one string field named `body`; additional keys or non-string bodies are invalid.
- Page title enforcement rejects trimmed-empty titles.
- `resources.updated_at` remains server-managed Page concurrency Evidence; authenticated clients MUST NOT directly assign it.
- A meaningful Page create/update and required immutable fact commit in one PostgreSQL transaction. No-op Page update advances neither state nor Evidence.
- Issue remains an independent Repository-contained projection identified by `(repository_id, issue_number)` with positive Repository-local numbering and complete closed-state attribution.

## Lifecycle and environment invariants

- Organization, Repository, and Resource hard deletion remain unavailable to end-user roles until accepted lifecycle contracts define retention, restore, redaction, containment/subtype fate, historical continuity, and recovery.
- A missing lifecycle fails closed through both table privileges and RLS policy absence; Administrator authority cannot make an undefined destructive transition valid.
- An authorization vocabulary entry is not lifecycle acceptance.
- Declarative schema changes require reviewed replay evidence and attack-path regression tests before merge: the one replaceable consolidated baseline while `LocalOnly`, or an append-only forward migration only after an identified persistent environment freezes that baseline.
- Schema/migration files, a hosted provider project, or successful local replay are not evidence of remote deployment.
- `seed.sql` is demo data, never schema truth or policy input.

## Projection rule

If Domain, Application, SQL command behavior, and RLS disagree, the change is incomplete. Correct the earliest invalid model; do not weaken a downstream layer to make tests pass.

## Local-only environment rule

`LocalOnly` means no identified persistent environment has recorded the repository baseline as Applied. A hosted Supabase project may exist independently and still remain outside the accepted database lifecycle. Continue authoring and verifying these schemas against local/shadow databases until the Runbook/ADR-005 persistent-environment gate is explicitly satisfied. Do not create, link, pull from, push to, or mutate a remote project merely to obtain schema truth.

## Modern declarative authoring

- Files run in `config.toml` `schema_paths` order. Keep dependencies visible: types/tables before foreign keys/policies, private helpers before consumers, grants/RLS after objects exist.
- Own application schemas only. Supabase-managed `auth`, `storage`, and extension internals are provider contracts unless an explicit customization decision says otherwise.
- Fully qualify relations inside privileged functions, use `search_path = ''`, revoke default access before selective grants, and keep privileged helpers out of exposed schemas.
- Declare the complete final grant set. RLS cannot protect `TRUNCATE`, `TRIGGER`, `REFERENCES`, or maintenance privileges, and grants alone cannot authorize rows.
- Prefer constraints and transactionally enforced invariants over UI checks. Prefer `SECURITY INVOKER`; justify each `SECURITY DEFINER` boundary with caller-aware logic and executable attack-path tests.
- Treat `db diff` as a compiler draft. Review unsupported DML, policy alterations, grants, view properties, publications, comments, extension behavior, and destructive normalization.
- A schema change is complete only with a reviewed baseline or forward migration, narrow pgTAP proof, empty-database replay, lint, generated-type consistency, and no substantive drift back to these files.
