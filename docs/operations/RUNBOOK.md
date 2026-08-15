# Production Operations Runbook

- Status: Baseline; not yet production-validated
- Operational owner: Repository owner until an explicit on-call owner is assigned
- Last reviewed: 2026-08-15

## Purpose

This runbook defines the minimum durable procedure for provisioning, releasing, verifying, containing, recovering, and learning from production changes.

It is intentionally honest about current gaps. A written step is not operational truth until its preconditions and evidence have been verified in the real environment.

Development bootstrap and local commands belong in [`DEVELOPMENT_ENVIRONMENT.md`](../DEVELOPMENT_ENVIRONMENT.md). Product meaning belongs in [`PRODUCT.md`](../PRODUCT.md). Architecture ownership belongs in [`architecture/`](../architecture/README.md).

## Operating principles

1. Production reality is observed, not inferred from a successful build.
2. Product and architecture contracts define intended behavior; direct observation and telemetry reveal actual behavior.
3. A runtime difference is evidence to diagnose, not permission to silently redefine the target model.
4. Authorization and data-integrity failures fail closed.
5. Web rollback and database recovery are different operations.
6. An accepted migration file is replayable transition history; only an identified environment's migration ledger proves that it was applied there.
7. Every release and incident must leave enough evidence to identify actor, artifact, environment, time, result, and recovery action.
8. Destructive or provider-mutating actions require explicit operator intent.
9. A selected adapter or hosted provider resource is not evidence that a persistent environment has been accepted.
10. Local or CI verification is not preview or production validation.
11. Git history is provenance. Do not rewrite shared `main` commits merely to make the visible history cleaner; move stale current-state claims into historical archives while preserving commit/PR/CI references.

## Runtime boundaries

The current target baseline and observed provisioning status are:

| Boundary | Responsibility | Selected adapter | Provisioning status |
| --- | --- | --- | --- |
| GitHub | Source, review history, CI evidence, release commit identity | GitHub | Provisioned |
| Web delivery | Next.js application and composition root | Vercel | Preview deployment evidence exists; exact project/environment mapping remains unverified through the connected Vercel view |
| Identity | Authentication session and User identity | Supabase Auth | Local flow verified; hosted provider project exists but hosted Auth configuration is not accepted/verified as Preview, Staging, or Production |
| Data | PostgreSQL schema, records, grants, and activity history | Supabase PostgreSQL | Local stack is canonical; hosted provider project exists with no repository baseline claimed Applied |
| Row enforcement | Database row access | PostgreSQL grants and RLS | Verified against disposable local/CI databases |
| Generated projection | TypeScript view of the applied database schema | Supabase type generation | Generated from the local applied schema |

Provider names describe selected adapters. They do not redefine product or domain semantics, and they do not prove that a durable environment exists.

The only accepted repository database execution environment is the disposable Supabase CLI local stack used by developer workstations and GitHub Actions. A hosted Supabase project currently exists as a provider resource, but **no Supabase Cloud project is provisioned as an accepted persistent Preview, Staging, or Production database environment**, no repository migration is recorded as Applied there, and this repository is not linked to it for ordinary development or CI.

No background worker, queue, independent API service, or realtime-critical subsystem is accepted as a production boundary yet.

## Migration evidence model

Migration state is environment-specific:

| State | Evidence |
| --- | --- |
| Draft | Generated or written SQL still under review |
| Accepted | Versioned migration plus successful local/CI replay and required tests |
| Applied | Target-environment migration ledger plus provider/deployment evidence |

A migration may be Accepted without being Applied to any persistent environment. File presence, hosted-project existence, and CI success must never be reported as remote deployment evidence.

## Environment classes

### Local

Purpose: deterministic development and destructive verification against disposable infrastructure.

Evidence:

- environment check passes;
- local Supabase stack is isolated;
- schema reset, database tests, generated types, unit tests, and browser tests can run;
- accepted migrations replay from an empty local database;
- no production credentials or project references are present in repository scripts or ordinary CI.

### Preview

Purpose: validate one branch or pull request against non-production delivery infrastructure.

Required properties:

- isolated web deployment;
- no production service-role credentials;
- explicit data source and reset policy;
- artifact traceable to one commit;
- safe authentication and authorization test identities;
- identified database lifecycle role if persistent data is used; and
- migration-ledger evidence for any Applied database transition.

A Vercel preview is not a full-stack preview while no isolated persistent database environment has been accepted and verified. A blank or unclassified Supabase project must not be represented as evidence of hosted application behavior.

### Production

Purpose: serve real users and durable data.

No production database environment is accepted or has the repository baseline Applied. Production is considered operational only after the production gates at the end of this runbook are satisfied.

## Persistent database acceptance and application gate

Before classifying, linking, or applying the repository baseline to any hosted database:

1. State the demonstrated requirement that disposable local infrastructure cannot satisfy.
2. Identify the environment class, accountable owner, cost owner, project identity, and region.
3. Define credential ownership, secret storage, access controls, and operator authority.
4. Inspect the target's current migration ledger and schema without mutating it.
5. Review every accepted migration/baseline from an empty database.
6. Verify that no migration creates an unsafe intermediate authorization or data-integrity state.
7. Decide whether to preserve the complete accepted history or create a separately reviewed secure initial baseline.
8. Define backup coverage, recovery point objective, recovery time objective, and restore validation.
9. Define observability, data classification, retention, and deletion constraints.
10. Preview the exact migration set against the identified target through an approved mechanism.
11. Record stop conditions, rollback or forward-recovery behavior, and required provider evidence.

Creating or discovering a Supabase Cloud project does not by itself satisfy this gate.

## Release contract

### Release identity

Every release must identify:

- Git commit SHA;
- pull request or reviewed change set;
- CI run;
- web deployment identifier;
- database migration set, when changed;
- target environment and migration-ledger state, when a persistent database exists;
- operator;
- start and completion timestamps; and
- post-release verification result.

### Preconditions

Before any production release:

1. The change has an explicit owner and reviewed scope.
2. Required GitHub Actions checks are green for the exact commit.
3. Product, domain, architecture, schema, and runbook contracts affected by the change are updated.
4. No secret, `.env` file, service credential, private project reference, or production data is in the diff.
5. Database changes have reviewed declarative schema changes and the migration/baseline required by the current lifecycle phase.
6. Generated database types match the applied local schema when database shape changed.
7. Authorization-sensitive changes have Domain/Application tests and database enforcement tests.
8. The operator knows the stop condition and recovery path before mutation begins.
9. Backup and restore expectations are confirmed for any change with material data-loss risk.
10. External-provider status and maintenance windows have been checked when they can affect the release.
11. Any persistent target environment has passed the acceptance/application gate and is unambiguously identified.

If any precondition cannot be proven, stop rather than replacing evidence with assumption.

### Web release

Target procedure:

1. Select the reviewed commit.
2. Confirm the production environment and deployment target.
3. Deploy the exact artifact through the configured Vercel integration or approved deployment mechanism.
4. Record the deployment identifier and commit SHA.
5. Run post-release verification.
6. Promote or retain the deployment only after verification passes.

Stop when:

- the artifact cannot be tied to the intended commit;
- required environment configuration is missing or unexpected;
- authentication, Repository access, or a core route fails;
- error rate or latency materially regresses; or
- the deployment requires an undocumented production mutation.

### Database release

This procedure is deferred until a persistent database passes the acceptance/application gate.

Target procedure:

1. Modify `supabase/schemas/*.sql` as current database truth.
2. Produce and review the migration artifact appropriate to the current lifecycle phase: the replaceable baseline before first persistent application, or an append-only forward migration after freeze.
3. Reset the local database explicitly from migration history.
4. Run SQL lint, pgTAP authorization/invariant tests, generated-type consistency checks, and affected browser tests.
5. Identify lock, rewrite, backfill, data-loss, and RLS effects.
6. Confirm backup/recovery posture for the blast radius.
7. Identify the exact target project and compare its migration ledger with the reviewed source.
8. Preview the exact pending migration set.
9. Apply only the reviewed migration set through a separately accepted deployment workflow.
10. Record migration identifiers, target-environment ledger state, provider evidence, and operator.
11. Run post-release database and authorization verification.

Ordinary package scripts and the verification workflow must not perform steps 7–10.

Stop when:

- no persistent target environment has passed the acceptance/application gate;
- the target project cannot be unambiguously identified;
- migration history differs from the reviewed source;
- a destructive operation lacks explicit approval and recovery evidence;
- required RLS or grants would be absent during any transition;
- an operation can lock or rewrite material data without an accepted execution plan; or
- post-migration types or policies differ from the reviewed model.

Never edit or delete an already Applied migration to make history appear clean. An Accepted but never-Applied baseline may be replaced only while the lifecycle remains `LocalOnly`, with local replay and review preserving relevant security and architecture evidence. Git `main` history itself remains immutable provenance.

## Post-release verification

Verify the narrowest critical path first:

1. Public surface loads without server or client errors.
2. Sign-in establishes the intended authenticated actor.
3. An authorized User can list and open an accessible Repository.
4. An unauthorized User cannot infer or open a private Repository.
5. Repository navigation, context, workspace, and activity surfaces resolve for one known Repository.
6. A representative Resource read follows the Repository authorization boundary.
7. Database grants and RLS remain enabled on exposed tables.
8. Error, latency, authentication-failure, and database signals show no material regression.
9. The deployed artifact, schema, generated projection, and migration ledger correspond to the recorded release.

Record pass, fail, or not-yet-observable for every check. “No report” is not a pass.

## Recovery procedures

### Web rollback

Use when the web artifact is defective and the database contract remains backward-compatible.

1. Identify the last known-good deployment and commit.
2. Confirm that its expected schema and environment remain compatible.
3. Redirect production traffic through the approved Vercel rollback or promotion mechanism.
4. Verify authentication, Repository access, critical routes, and error signals.
5. Record the failed and restored deployment identifiers.

Do not roll back web code across an incompatible database migration without an explicit compatibility plan.

### Database forward recovery

Preferred when a migration has been applied and a safe corrective change is possible.

1. Contain writes or the affected capability when continued mutation increases damage.
2. Preserve evidence and identify the exact applied migration state.
3. Create a reviewed corrective declarative schema change and new append-only migration.
4. Validate against representative data and authorization tests.
5. Apply the corrective migration.
6. Reconcile data and verify invariants.
7. Record the incident and the model defect that allowed it.

### Database restore

Use only when forward recovery cannot meet the accepted data-integrity or recovery objective.

Before restore:

- identify the restore point and expected data loss;
- obtain explicit authority;
- isolate the target environment;
- preserve forensic evidence;
- verify provider backup availability;
- define how writes after the restore point will be reconciled; and
- communicate user-visible impact.

After restore, validate schema history, RLS, grants, identity references, Repository access, and representative data before reopening writes.

### Authorization incident

Examples include privilege escalation, unexpected Repository visibility, RLS bypass, leaked service credentials, or UI-only enforcement.

1. Contain the affected mutation or access path.
2. Revoke or rotate exposed credentials when applicable.
3. Preserve audit and provider evidence.
4. Identify affected actors, Principals, Repositories, Resources, and time window.
5. Compare Domain rules, Application decisions, grants, helper functions, and RLS.
6. Fix the earliest invalid authority boundary.
7. Add a regression test at every enforcement layer that could have prevented the incident.
8. Reconcile unauthorized grants or mutations.
9. Notify affected parties according to accepted legal and organizational requirements.

Availability restoration does not close an authorization incident until authority and data integrity are verified.

### External provider outage

1. Confirm the provider and affected boundary through official status and direct observation.
2. Stop retries or mutations that amplify load or duplicate work.
3. Preserve safe read-only behavior when the contract allows it.
4. Fail closed for identity and authorization uncertainty.
5. Communicate which capabilities are unavailable and which data remains safe.
6. Verify reconciliation and delayed work after recovery.

Do not introduce an unreviewed alternate provider during an incident unless a previously tested failover contract exists.

## Incident workflow

### Severity dimensions

Assess:

- unauthorized access or privilege escalation;
- data corruption or irreversible loss;
- authentication outage;
- Repository/Resource unavailability;
- breadth of affected users and Repositories;
- duration;
- regulatory or contractual impact; and
- availability of a tested containment path.

No fixed severity labels are accepted yet because response ownership and service objectives are not defined. Record the dimensions rather than inventing confidence.

### Response loop

```text
Detect
→ establish incident owner
→ contain
→ preserve evidence
→ diagnose the earliest invalid boundary
→ recover
→ verify
→ communicate
→ update contracts and tests
```

The incident owner records decisions and timestamps. Parallel responders should not independently mutate the same production boundary.

### Post-incident learning

A post-incident record must state:

- observed impact and time window;
- detection source;
- containment and recovery actions;
- root mechanism, not only triggering event;
- which assumption, invariant, test, or operational gate failed;
- whether the product, domain, architecture, executable contract, or runbook was wrong;
- follow-up owner and acceptance test; and
- evidence that the fix works.

## Data protection

Production readiness requires verified answers for:

- automated backup coverage;
- retention period;
- point-in-time recovery availability;
- restore authorization;
- encryption and key ownership;
- regional and residency constraints;
- recovery point objective;
- recovery time objective; and
- date and result of the latest restore exercise.

Provider marketing or configuration screenshots are not restore evidence. A restore exercise must recover representative data into an isolated environment and verify Repository ownership, grants, RLS, Resources, and Activity Events.

## Minimum observability

The production baseline should make these signals observable without exposing sensitive data:

- web availability and request failures;
- server-render and client runtime errors;
- authentication success/failure rate;
- authorization denials and unusual grant mutations;
- database connection, latency, lock, and error signals;
- RLS or permission errors;
- deployment and migration identifiers;
- Repository and Resource operation latency;
- backup and restore status; and
- external provider incidents.

Logs must not contain access tokens, passwords, service credentials, private Resource content, or unnecessary personal data.

Metrics and alerts become accepted only when each has an owner, threshold, response action, and false-positive review.

## Evidence retention

Retain links or identifiers for:

- merged change and commit;
- CI run;
- deployment;
- migrations;
- target-environment migration ledger;
- verification results;
- incident timeline;
- restore test; and
- superseding ADR or contract update.

Do not copy production secrets or private data into GitHub issues, pull requests, documentation, or agent context.

## Current production gates

The following remain unresolved and therefore must not be reported as production-validated:

- no hosted Supabase project is accepted/classified as the repository's persistent Preview, Staging, or Production database environment;
- the repository baseline is not evidenced as Applied in any accepted persistent environment migration ledger;
- production deployment ownership and approval path;
- exact Vercel project and environment mapping;
- exact Supabase production project and environment mapping;
- preview-data isolation;
- hosted Auth redirect, SMTP, abuse-protection, template, notification, and Session configuration;
- backup retention and point-in-time recovery configuration;
- tested restore procedure and measured recovery objectives;
- production secret rotation procedure;
- accepted service objectives and alert thresholds;
- incident communication and legal escalation owners;
- production telemetry sources and retention; and
- evidence that web rollback remains compatible with database evolution.

Close a gate only with direct provider evidence and a tested procedure. Update this runbook when reality changes.
