# Plugin Development Workflow

## Purpose

This contract applies when a development task needs connected Linear, GitHub, Notion, Context7, Codex Security, Vercel, Supabase, Sentry, or PostHog tools. It standardizes external tool and evidence routing while preserving the repository's existing truth model; it does not choose or replace the task's domain or decision Skill.

The plugins are not competing sources of truth. They are specialized evidence, execution, observation, and coordination surfaces around the repository contracts.

```text
Repository contracts
Product / Ontology / Domain / Architecture / Gaps
                    |
                    v
            Development task
                    |
          route by truth class
                    |
    +---------------+----------------+
    |               |                |
 knowledge       execution        external facts
 Notion          Linear/GitHub    Context7
    |               |                |
    +---------------+----------------+
                    |
                    v
              implementation
                    |
          +---------+---------+
          |         |         |
        Codex    Supabase   Vercel
       Security   evidence   evidence
          |         |         |
          +---------+---------+
                    |
                    v
          exact-head GitHub evidence
                    |
             integrate / deploy
                    |
          +---------+---------+
          |                   |
       Sentry              PostHog
 engineering evidence   product evidence
          |                   |
          +---------+---------+
                    |
                    v
           production learning
                    |
          Linear close / Notion update
```

Sentry and PostHog enter only after a real runtime or production observation surface exists. They do not replace deterministic tests, exact-head CI, Supabase enforcement evidence, or Vercel deployment identity.

## Non-negotiable rules

1. The current task, applicable `AGENTS.md` chain, canonical Product/Ontology/Domain/Architecture contracts, current gap register, and executable repository evidence remain authoritative in that order.
2. A plugin may supply context, work tracking, external documentation, review evidence, provider observation, engineering telemetry, or product telemetry. It may not silently redefine Product or Domain truth.
3. Route tools by the question being answered. Never invoke every connected plugin merely because it is available.
4. Read before writing. External mutations remain separate trust-boundary actions and require the user's explicit intent for the mutation being performed.
5. Do not commit access tokens, provider project references, private production data, `.env` files, or connector credentials.
6. Store pointers across systems rather than duplicating large bodies of code, logs, provider output, telemetry, or canonical definitions.
7. A green status in one system never substitutes for evidence at another layer: local != CI != preview/staging != production.
8. Close a gap only from the closure evidence defined by the current gap contract, not from a plugin status alone.
9. Production telemetry must be data-minimized. Never intentionally capture credentials, auth tokens, secrets, or raw private Repository content merely to improve observability or analytics.
10. Sentry and PostHog observations must be anchored to the relevant environment, release/deployment when available, and observation window before they are used as evidence.

## Tool ownership

| Tool | Primary responsibility | Must not become |
| --- | --- | --- |
| Notion | Durable human knowledge, research synthesis, decision context, semantic summaries | Current code/schema/CI truth or task-status database |
| Linear | Executable work graph: issue scope, dependencies, priority, owner, acceptance criteria | Product ontology or implementation truth |
| Context7 | Current external library/framework/provider mechanism documentation | Product/Domain design authority |
| GitHub | Exact repository state, branches, PR diff, reviews, commits, CI and merge evidence | Durable product knowledge base |
| Codex Security | Adversarial review of security-sensitive diffs and repository security scans | General feature design or substitute for tests |
| Supabase | PostgreSQL/Auth/RLS/provider evidence and environment-specific database state | Domain architecture or proof of production when only local evidence exists |
| Vercel | Web build, preview, deployment, runtime/log, promotion, and rollback evidence | Database truth or a duplicate deployment pipeline |
| Sentry | Production engineering evidence: exceptions, errors, traces/performance, affected requests/users, and release regressions | Product-value truth, Product/Domain authority, or substitute for deterministic tests |
| PostHog | Production product evidence: usage events, funnels, cohorts, session behavior, feature/experiment outcomes when accepted | Database/audit truth, authorization evidence, or Product/Domain authority |

## Automatic routing

Start by classifying the task. Use only the matching routes.

### Product, ontology, domain, or architecture work

Use:

```text
GitHub current contracts/code
+ active decision Skill selected by narrowest ownership
  - github-semantic-reverse for GitHub-derived Product decisions
  - first-principles for broader or non-GitHub decisions
+ Notion only when durable human knowledge is relevant
+ Context7 only for external mechanisms used by the decision
```

Do not let a Notion page or dependency documentation override a conflicting canonical repository contract. If the external evidence disproves a contract assumption, correct the earliest invalid repository truth boundary explicitly.

Sentry/PostHog production observations can reveal prediction error that motivates a contract correction, but the correction still occurs in the canonical repository truth boundary; telemetry itself never becomes the Product or Domain contract.

### Feature, bug, gap, or implementation work

Use:

```text
Existing Linear issue when one exists
        |
        v
GitHub current contract + executable evidence
        |
        v
Implement smallest sufficient change
        |
        v
verify-change skill
        |
        v
Draft PR / exact-head CI
```

Create or update Linear work only when the current workflow is being tracked there or the user explicitly requests it. The issue should point to the canonical repository contract or gap; it should not copy the contract.

### External dependency or provider behavior

Use Context7 when version-sensitive external behavior is material.

```text
resolve library
-> query current docs
-> keep only the mechanism needed by the task
-> implement against repository boundaries
```

Prefer a provider's official connected documentation surface when the plugin exposes one with stronger authority, such as Supabase documentation for Supabase behavior. Context7 remains external evidence, not Product truth.

### Database, Auth, RLS, migration, or provider-state work

Use:

```text
Repository Domain/Application contract
-> supabase/schemas desired state
-> current Supabase documentation
-> local deterministic verification
-> provider observation only when a persistent environment actually exists
```

Security-sensitive Auth/RLS/privileged-function changes also trigger Codex Security diff review.

Remote Supabase mutation is never implied by local schema work. A migration artifact is not proof that any remote environment applied it.

### Web delivery and runtime work

Use GitHub CI as the repository gate. Use Vercel for the exact deployed artifact, preview behavior, deployment identity, logs, promotion, rollback, and production runtime evidence when a Vercel project/deployment is available.

Do not add a second `vercel deploy` pipeline when Git integration already owns deployment unless an accepted delivery contract deliberately replaces that path.

### Production engineering observation

Use Sentry when the question is about what failed or degraded in a real deployed environment:

```text
exact deployment / release
-> error / exception / trace / performance signal
-> affected request or user scope
-> regression or root-cause evidence
-> GitHub/Linear follow-up when action is required
```

Sentry evidence is environment-specific engineering observation. It does not prove product value, database correctness, authorization correctness, or that an unobserved path is healthy.

### Production product observation

Use PostHog when the question is about what users actually did or whether a delivered behavior produced the expected product outcome:

```text
accepted product hypothesis / capability
-> deployment or feature exposure
-> event / funnel / cohort / session behavior
-> observed outcome
-> prediction error or validated learning
-> Notion/Linear/repository gap update when action is required
```

PostHog evidence is product-behavior observation. It does not replace transactional database facts, historical audit evidence, security enforcement, or Product/Domain contracts.

### Security-sensitive changes

Trigger Codex Security diff review for changes involving any of:

```text
authentication
authorization
ownership
membership
grant/delegation
RLS
SQL/RPC
SECURITY DEFINER / SECURITY INVOKER
secret handling
routing disclosure
external trust boundaries
destructive lifecycle
telemetry capture of sensitive data
```

Use a repository-wide security scan for a major release, newly exposed public boundary, or large security-architecture change when the host supports it.

A scan finding must still be validated against actual source and current threat boundaries. A clean scan does not replace deterministic functional and database tests.

## Standard lifecycle

### 1. Discover

Read the minimum current repository context first:

```text
task
-> applicable AGENTS.md
-> docs/README.md
-> narrowest current contract
-> current gap if relevant
-> executable evidence
```

Then use Notion only for durable supporting knowledge and Linear only for existing work context.

When the task originates from a production symptom or product outcome, read only the narrowest relevant Sentry/PostHog observation needed to establish the current prediction error; do not bulk-copy telemetry into repository contracts.

### 2. Define

Create or refine one executable work item when tracking is needed.

Minimum issue packet:

```text
objective
scope
non-goals
canonical contract / gap pointer
acceptance criteria
security invariants
required verification
dependencies
```

For a production-driven task, include the stable Sentry issue/event or PostHog insight/query pointer and the environment/observation window instead of copying raw telemetry.

### 3. Research

Use Context7 or the provider-native documentation plugin only when an external behavior is uncertain, version-sensitive, or materially affects the design.

Record the mechanism and source pointer; do not copy full external documentation into repository contracts.

### 4. Implement

GitHub/repository code is the executable truth surface.

Follow:

```text
Domain
-> Application
-> Infrastructure
-> Delivery
```

only for the layers actually required by the change. Preserve the smallest sufficient reversible diff.

Instrumentation is also implementation. Add only events, spans, tags, or capture needed to discriminate an accepted hypothesis or failure mode; do not instrument speculative data exhaust.

### 5. Verify

Use the `verify-change` skill.

Typical evidence:

```text
pnpm codex:check
pnpm verify:fast
pnpm verify:full when required
pnpm supabase:verify for database changes
Playwright for browser behavior
```

Unavailable checks remain explicitly unavailable.

Sentry/PostHog signals never replace this deterministic verification layer.

### 6. Attack

Run Codex Security when the trigger matrix above applies. Findings and remediation belong to the same exact diff/head being evaluated.

Telemetry changes that can capture identity, Repository content, request payloads, headers, URLs, or session data are external trust-boundary changes and require the same security/privacy scrutiny.

### 7. Observe providers and production telemetry

Use only the provider or observation layer that actually exists.

```text
Supabase local/CI
= reproducibility + database enforcement evidence

Supabase persistent environment
= environment migration/auth/provider evidence

Vercel preview
= exact web artifact/runtime evidence

Vercel production
= production deployment/runtime identity and evidence

Sentry production
= engineering failure/performance/regression evidence

PostHog production
= product usage/behavior/outcome evidence
```

Do not infer one evidence class from another. A healthy Vercel deployment does not prove zero Sentry failures. Zero Sentry failures does not prove users obtained value. A PostHog conversion does not prove authorization or data integrity.

### 8. Integrate

A merge-ready evidence packet should identify:

```text
Linear issue, if tracked
canonical contract / gap
GitHub PR + exact head SHA
deterministic verification
Codex Security result when required
Supabase evidence when required
Vercel evidence when required
remaining unknowns or blocked evidence
```

Sentry/PostHog are not generic pre-merge gates. Include them only when an explicit acceptance criterion depends on an already deployed environment, a prior production regression, or a controlled post-release observation.

Do not mark a Draft PR ready or merge unless the explicit integration action is authorized.

### 9. Learn

After accepted integration or observed production behavior:

- use Sentry for engineering regressions/failure evidence when a production runtime exists;
- use PostHog for product behavior/outcome evidence when the relevant events or experiments are intentionally defined;
- compare observations with the contract's prediction and acceptance criteria rather than optimizing metrics without a product hypothesis;
- update Linear execution state;
- update Notion only if a durable semantic/decision summary changed and that write is intended;
- update `docs/IMPLEMENTATION_GAPS.md` only when current prediction error changed;
- move Closed/Superseded gap evidence to history only after its required closure evidence exists.

The feedback loop is:

```text
Contract prediction
-> Build
-> deterministic evidence
-> deploy/release
-> Sentry engineering observation + PostHog product observation
-> prediction error
-> earliest invalid contract/gap correction
```

## Cross-system identity

Use stable links/identifiers instead of duplicated text.

Recommended linkage:

```text
Linear issue
-> canonical repository contract/gap
-> GitHub branch/PR
-> exact commit + CI
-> Vercel deployment/release
-> Supabase environment evidence when relevant
-> Sentry issue/release/environment when relevant
-> PostHog insight/event/cohort/experiment when relevant
```

Notion may link to the same canonical contract and accepted decision, but should not embed current source files, transient CI logs, or raw production telemetry.

## Degraded mode

Plugin availability is host- and connection-dependent.

When a plugin is unavailable:

1. continue with repository-local evidence when the task can still be completed safely;
2. state which evidence or coordination surface is unavailable;
3. do not fabricate Linear/Notion/provider/telemetry state;
4. do not weaken repository contracts to compensate;
5. do not provision a new external environment or add speculative instrumentation merely to make the workflow look complete.

The workflow is complete when the task has the narrowest sufficient evidence, not when every plugin has been invoked.
