# ADR-005: Local-first Supabase database lifecycle

- Status: Accepted
- Date: 2026-08-12
- Decision owner: Repository owner
- Affected scopes: database contracts, migrations, local verification, CI, environment provisioning, deployment evidence, operations

## Decision

Develop and verify the database locally before provisioning any Supabase Cloud project.

The current provisioned database environment is the disposable Supabase CLI stack used by developer workstations and GitHub Actions. Supabase Auth, PostgreSQL, RLS, and generated types are selected adapter mechanisms; Supabase Cloud is not a current runtime fact.

The database truth model is:

```text
Product and Domain contracts
        ↓
supabase/schemas
current desired database state
        ↓
reviewed schema diff
        ↓
supabase/migrations
replayable database transitions
        ↓
local / CI database reset
        ↓
RLS, pgTAP, generated types, and browser evidence
```

A future durable environment adds a separate evidence boundary:

```text
Accepted migration files
        +
identified target environment
        +
authorized deployment
        ↓
environment migration ledger
        +
provider observation
        ↓
proof of applied state
```

Migration states are explicit:

| State | Meaning |
| --- | --- |
| Draft | Generated or written transition still under review |
| Accepted | Versioned transition that passed the required local and CI replay checks |
| Applied | Transition recorded as applied in one identified persistent environment |

`Applied` is environment-specific. The same accepted migration may be applied to no durable environment, one environment, or several environments at different times.

Default package scripts and verification workflows must operate only on the local stack. They must not contain remote project credentials or invoke `supabase link`, `supabase db push`, `supabase db pull`, `supabase db reset --linked`, remote SQL, or equivalent provider mutation.

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

Two accepted migrations exist even though no Supabase Cloud project has been provisioned. This is valid because the migrations currently serve a different responsibility: they rebuild disposable local databases and preserve reviewed transition history.

The model fails when any of these concepts are conflated:

```text
Migration artifact
≠ Applied deployment

Selected provider
≠ Provisioned environment

Local verification
≠ Production validation
```

The decision succeeds when:

- an empty local database can be rebuilt from accepted migrations;
- local and CI tests continue to verify schema, RLS, authorization, generated types, and browser behavior;
- documentation does not imply that a hosted Supabase database exists;
- ordinary scripts and CI cannot silently connect to or mutate a remote project;
- migration files remain available as replay and security evidence; and
- future remote provisioning has an explicit acceptance gate rather than emerging from convenience.

## Evidence ledger

### Observations

- The repository contains declarative schema files and two accepted migrations.
- GitHub Actions starts disposable local Supabase stacks, resets them from migrations, runs database tests, and stops them.
- The ordinary package scripts contain local development and verification commands, not a remote deployment workflow.
- No Supabase Cloud project is currently provisioned for this work.
- The initial migration establishes the collaboration database baseline; the second migration preserves the reviewed P0 role-escalation repair.

### Constraints

- `supabase/schemas` remains the current desired database state.
- Accepted migrations must continue to rebuild an empty database in deterministic order.
- Authorization and data-integrity regressions must remain reproducible through the real PostgreSQL boundary.
- Remote mutations require explicit user intent and must never be a side effect of ordinary verification.
- Secrets and remote project references must not enter source control.

### Assumptions

- A disposable local stack is sufficient for the current product-discovery and architecture-validation horizon.
- Hosted Supabase behavior does not yet need to be measured for a real user-facing or shared persistent workflow.
- Keeping two reviewed migrations is cheaper and safer than replacing them with a new baseline now.

### Unknowns

- Whether the first durable environment should be preview, staging, or production.
- Whether Supabase Cloud will remain the selected hosted provider after durable-environment requirements are known.
- Which region, service plan, backup policy, and recovery objectives will be required.
- Whether the initial remote baseline should preserve the complete accepted transition history or use a separately reviewed secure squash before any durable deployment.

### Value choices

- Prefer evidence-bearing local verification over premature infrastructure provisioning.
- Preserve reviewed security history while it remains small and useful.
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

Cloud project
= optional durable environment

Migration ledger
= environment-specific applied-state evidence
```

No additional database environment is justified until a persistent collaboration or provider-validation requirement exists.

## Initial remote baseline gate

Before the first persistent database is created or linked:

1. identify the environment class and accountable owner;
2. review every accepted migration from an empty database;
3. verify that no migration introduces an unsafe intermediate state;
4. choose whether to preserve the complete history or create a separately reviewed secure initial baseline;
5. define credentials, backup, recovery, observability, and cost ownership;
6. preview the exact migration set against the identified target;
7. record stop conditions and forward-recovery behavior; and
8. retain target project, migration ledger, deployment, and verification evidence.

Creating a Cloud project does not itself satisfy this gate.

## Alternatives rejected

### Delete migrations until Cloud exists

This removes the replay mechanism used by local reset and CI, discards the P0 security repair history, and makes an empty database harder to reproduce.

### Provision Supabase Cloud immediately

This creates credentials, cost, region, data-lifecycle, backup, and operational responsibilities without a demonstrated persistent-environment requirement.

### Treat migration files as deployment history everywhere

A file records an accepted transition in Git. It cannot prove that any particular database applied that transition.

### Let ordinary CI link and push when credentials become available

This turns verification into an infrastructure mutation boundary and allows repository configuration changes to affect a persistent environment without a separately accepted release contract.

### Use only declarative schema files

Declarative files explain current desired state, but they do not preserve ordered transition evidence or exercise the same deployment path that a future environment will use.

## Consequences

Benefits:

- the repository remains fully reproducible without Cloud infrastructure;
- migration and deployment claims become precise;
- CI stays deterministic, disposable, and credential-free;
- future provider selection remains reversible;
- security fixes retain executable transition and regression evidence.

Costs:

- hosted-provider differences remain unmeasured until a durable environment is justified;
- future provisioning requires an explicit baseline review;
- documentation and machine guardrails must distinguish accepted from applied migrations.

## Falsification conditions

Reopen this decision when:

- multiple developers need shared persistent data that local fixtures cannot represent;
- OAuth, webhook, email, storage, or other behavior requires a reachable hosted environment;
- real users need durable access;
- hosted Supabase behavior must be measured to validate a product or security assumption;
- local/CI execution cannot reproduce a relevant provider behavior; or
- the operational cost of replaying the accepted migration history exceeds its traceability value.

Do not reopen merely because Supabase Cloud is the selected candidate provider or because migration files already exist.

## Minimum discriminating tests

1. `pnpm supabase:reset` explicitly targets the local database and replays every accepted migration.
2. Database lint, pgTAP, generated-type consistency, and browser tests pass against disposable local stacks.
3. Root package scripts and ordinary GitHub Actions contain no remote Supabase command or remote credential identifier.
4. Documentation states that no Supabase Cloud project is provisioned.
5. Documentation distinguishes Draft, Accepted, and environment-specific Applied migration states.
6. The two existing migration files remain unchanged and replayable.
7. A future remote workflow cannot be added without updating this ADR, the runbook, operational guardrails, and environment evidence.
