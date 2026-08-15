# ADR-005: Local-first Supabase database lifecycle

- Status: Accepted
- Date: 2026-08-12
- Revalidated: 2026-08-15
- Decision owner: Repository owner
- Affected scopes: database contracts, migrations, local verification, CI, environment provisioning, deployment evidence, operations

## Decision

Develop and verify the repository database locally until an identified persistent environment is explicitly accepted and records the repository baseline as Applied.

The current accepted database execution environment is the disposable Supabase CLI stack used by developer workstations and GitHub Actions. Supabase Auth, PostgreSQL, RLS, and generated types are selected adapter mechanisms. A hosted Supabase provider project may exist independently, but provider-resource existence does not make it a Preview, Staging, or Production database environment and does not freeze the local-development baseline.

The database truth model is:

```text
Product and Domain contracts
        ↓
supabase/schemas
current desired database state
        ↓
reviewed schema diff / baseline compilation
        ↓
supabase/migrations
replayable database transitions
        ↓
local / CI database reset
        ↓
RLS, pgTAP, generated types, and browser evidence
```

A persistent environment adds a separate evidence boundary:

```text
Accepted migration files
        +
identified target environment
        +
authorized deployment
        ↓
environment migration ledger
        +
direct provider observation
        ↓
proof of Applied state
```

Migration states are explicit:

| State | Meaning |
| --- | --- |
| Draft | Generated or written transition still under review |
| Accepted | Versioned transition that passed the required local and CI replay checks |
| Applied | Transition recorded as applied in one identified persistent environment |

`Applied` is environment-specific. The same accepted migration may be applied to no durable environment, one environment, or several environments at different times. A hosted project with an empty or unrelated migration ledger is not evidence that the repository baseline is Applied.

Default package scripts and ordinary CI must operate only on the local stack. They must not contain remote project credentials or invoke `supabase link`, `supabase db push`, `supabase db pull`, `supabase db reset --linked`, remote SQL, or equivalent provider mutation.

A remote deployment path may be introduced only through a separate accepted change that defines:

- the persistent-environment requirement;
- environment and cost owner;
- project identity and region;
- credential and secret ownership;
- data classification;
- deployment authority;
- initial baseline review;
- backup and recovery expectations;
- stop conditions and rollback or forward-recovery behavior; and
- provider and migration-ledger evidence.

## Problem and success condition

The repository needs one model that remains correct across these distinct facts:

```text
Migration artifact ≠ Applied deployment

Selected provider ≠ Provisioned environment

Local verification ≠ Production validation

Hosted provider resource exists ≠ Repository environment is accepted
```

At adoption of this ADR, no Supabase Cloud project was observed for the work. On 2026-08-15, direct provider discovery found a healthy hosted Supabase project, while its migration ledger contained no repository migrations and the application schema was not established there. That change in provider-resource state does not invalidate the ADR; it demonstrates why environment acceptance must be defined by explicit lifecycle role plus Applied migration evidence rather than by project existence.

The current repository replay model contains one consolidated local-development baseline derived from `supabase/schemas`. It remains replaceable because no identified persistent environment has recorded it as Applied.

The decision succeeds when:

- an empty local database can be rebuilt from the accepted baseline and later accepted migrations;
- local and CI tests continue to verify schema, RLS, authorization, generated types, and browser behavior;
- documentation distinguishes hosted-provider existence from accepted persistent-environment state;
- ordinary scripts and CI cannot silently connect to or mutate a remote project;
- migration files remain available as replay and security evidence; and
- persistent environment classification/application has an explicit acceptance gate rather than emerging from convenience.

## Evidence ledger

### Observations

- `supabase/schemas` is the current desired database state and is compiled in deterministic order.
- `supabase/migrations/20260814190012_local_development_baseline.sql` is the sole current replay baseline.
- GitHub Actions starts disposable local Supabase stacks, resets them from migrations, runs database tests, and stops them.
- Ordinary package scripts contain local development and verification commands, not a remote deployment workflow.
- At ADR adoption, no hosted Supabase project was observed for this work.
- Direct provider observation on 2026-08-15 found a healthy hosted Supabase project, but no repository migration ledger entries or application schema were Applied there.
- No hosted project is currently accepted by this repository as Preview, Staging, or Production database runtime.

### Constraints

- `supabase/schemas` remains the current desired database state.
- Accepted migrations must continue to rebuild an empty database in deterministic order.
- Authorization and data-integrity regressions must remain reproducible through the real PostgreSQL boundary.
- Remote mutations require explicit user intent and must never be a side effect of ordinary verification.
- Secrets and remote project references must not enter source control.
- Provider-resource existence must not freeze migration history; only identified Applied migration evidence can do that.

### Assumptions

- A disposable local stack is sufficient for the current product-discovery and architecture-validation horizon.
- No current accepted collaboration capability requires shared persistent database state.
- Keeping one coherent local baseline is cheaper and safer than manufacturing deployment history before the first accepted persistent application.

### Unknowns

- Whether the first accepted persistent environment should be preview, staging, or production.
- Whether an already-existing hosted Supabase project should ever be adopted for this repository or remain unrelated/unclassified.
- Which region, service plan, backup policy, and recovery objectives will be required.
- Whether the first accepted persistent application should preserve the complete local replay baseline or use a separately reviewed secure baseline generated at that boundary.

### Value choices

- Prefer evidence-bearing local verification over premature environment adoption.
- Preserve Git commit history as development/security provenance instead of rewriting `main` merely to make history look clean.
- Keep current desired state compact while allowing Git and historical archives to retain how that state was reached.
- Make remote mutation impossible by default rather than relying on operator memory.
- Require environment-specific evidence before making deployment claims.

## Minimum sufficient model

```text
Schema
= desired state

Migration
= ordered transition artifact

Local stack
= disposable execution environment

CI pass
= replay and enforcement evidence

Hosted provider project
= external resource; not an environment role by itself

Accepted persistent environment
= identified provider resource + lifecycle role + approved authority

Migration ledger
= environment-specific Applied-state evidence
```

No persistent database environment is justified until a persistent collaboration or provider-validation requirement exists and the provisioning/application gate is satisfied.

## Initial remote baseline gate

Before classifying, linking, or applying the repository baseline to any hosted database:

1. identify the environment class and accountable owner;
2. state the requirement that disposable local infrastructure cannot satisfy;
3. review the accepted baseline from an empty database;
4. verify that no migration introduces an unsafe intermediate state;
5. choose whether to preserve the accepted replay history or create a separately reviewed secure initial baseline;
6. define credentials, backup, recovery, observability, data classification, and cost ownership;
7. verify the target project identity and current migration ledger without mutating it;
8. preview the exact migration set against the identified target through an approved mechanism;
9. record stop conditions and forward-recovery behavior; and
10. retain target project, migration ledger, deployment, and post-application verification evidence.

Creating a Cloud project, discovering an existing project, or obtaining a successful Vercel deployment does not satisfy this gate.

## Alternatives rejected

### Delete migrations until a persistent environment exists

This removes the replay mechanism used by local reset and CI and makes an empty database harder to reproduce.

### Link or push to an existing hosted project because it is available

This confuses provider-resource existence with environment acceptance and creates credential, cost, data-lifecycle, backup, and operational responsibilities without a demonstrated persistent-environment requirement.

### Treat migration files as deployment history everywhere

A file records an accepted transition in Git. It cannot prove that any particular database applied that transition.

### Let ordinary CI link and push when credentials become available

This turns verification into an infrastructure mutation boundary and allows repository configuration changes to affect a persistent environment without a separately accepted release contract.

### Use only declarative schema files

Declarative files explain current desired state, but they do not preserve ordered replay/deployment evidence or exercise the same transition model that a future environment will use.

### Rewrite `main` history to collapse development transitions

Current truth and historical provenance have different responsibilities. Rewriting already-shared `main` commits would invalidate commit/PR/CI references used as regression and security evidence. Keep `main` immutable; consolidate only the still-unapplied local database baseline and route closed implementation details to historical archives.

## Consequences

Benefits:

- the repository remains fully reproducible without accepting a hosted database runtime;
- a blank or unrelated hosted project cannot silently become staging/production;
- migration and deployment claims become precise;
- CI stays deterministic, disposable, and credential-free;
- future provider/environment selection remains reversible;
- security fixes retain executable transition and Git provenance evidence; and
- current-truth documents can stay compact without erasing history.

Costs:

- hosted-provider differences remain unmeasured until a durable environment is accepted;
- an existing hosted project may remain deliberately unused;
- future persistent application requires explicit baseline review and environment ownership;
- documentation and machine guardrails must distinguish provider resource, Accepted migration, and Applied environment state.

## Falsification conditions

Reopen this decision when:

- multiple developers need shared persistent data that local fixtures cannot represent;
- OAuth, webhook, email, storage, or other behavior requires a reachable hosted environment;
- real users need durable access;
- hosted Supabase behavior must be measured to validate a product or security assumption;
- local/CI execution cannot reproduce a relevant provider behavior; or
- the operational cost of replaying the accepted migration history exceeds its traceability value.

Do not reopen merely because Supabase Cloud is the selected adapter, a hosted project exists, or migration files already exist.

## Minimum discriminating tests

1. `pnpm supabase:reset` explicitly targets the local database and replays every accepted migration.
2. Database lint, pgTAP, generated-type consistency, and browser tests pass against disposable local stacks.
3. Root package scripts and ordinary GitHub Actions contain no remote Supabase command or remote credential identifier.
4. Documentation states that hosted-provider existence does not equal an accepted persistent environment and that no repository baseline is claimed Applied remotely without ledger evidence.
5. Documentation distinguishes Draft, Accepted, and environment-specific Applied migration states.
6. The sole local-development baseline remains replaceable until an identified persistent environment records it as Applied.
7. A future remote workflow cannot be added without updating this ADR, the runbook, operational guardrails, and environment evidence.
