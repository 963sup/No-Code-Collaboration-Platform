# Plugin Development Workflow

## Purpose

This contract applies when a development task needs connected Linear, GitHub, Notion, Context7, Codex Security, Vercel, Supabase, Sentry, or PostHog evidence. It routes tools by truth class while preserving repository authority; it does not choose or replace the active Product/Domain decision Skill.

```text
Repository contracts
        ↓
active task + narrow decision Skill
        ↓
implementation
        ↓
deterministic verification
        ↓
required security/provider evidence
        ↓
exact-head GitHub evidence
        ↓
integrate / deploy when authorized
        ↓
production observation when a real surface exists
```

Plugins are specialized evidence, execution, observation, and coordination surfaces. They are not competing Product truth sources.

## Non-negotiable rules

1. Current task, applicable `AGENTS.md`, canonical Product/Ontology/Domain/Architecture contracts, current gaps, and executable repository evidence remain authoritative in that order.
2. GitHub-derived Product decisions route through `github-semantics-first-principles`; broader/non-GitHub decisions route through `first-principles`.
3. A plugin may provide context, coordination, documentation, review evidence, provider observation, or telemetry. It may not silently redefine Product or Domain truth.
4. Route tools only when the question requires them. Never invoke every plugin ceremonially.
5. Read before external writes. External mutation remains a separate trust-boundary action and requires explicit intent.
6. Never commit access tokens, provider project references, private production data, `.env` files, connector credentials, or raw private Repository content.
7. Store stable pointers rather than duplicating large code, logs, telemetry, or canonical definitions across systems.
8. Local != CI != preview/staging != production. A green status at one layer never proves another layer.
9. Sentry/PostHog telemetry must be data-minimized and anchored to environment, release/deployment when available, and a time window before it is used as evidence.
10. Close a gap only from the closure evidence defined by the current repository contract.

## Tool ownership

| Tool | Primary responsibility | Must not become |
| --- | --- | --- |
| GitHub | Exact repository state, branch/diff/commit/CI and authorized publication | Durable Product knowledge base |
| Context7 | Current version-sensitive library/framework/provider documentation | Product/Domain authority |
| Codex Security | Adversarial review of security-sensitive diffs or repository security boundaries | General feature design or substitute for deterministic tests |
| Linear | Executable work graph, scope, priority, acceptance criteria, dependencies, progress | Product ontology or code truth |
| Notion | Durable human knowledge, research synthesis, accepted semantic/decision summaries | Current code/schema/CI truth or task-status authority |
| Supabase | PostgreSQL/Auth/RLS documentation and environment-specific database evidence | Domain architecture or proof of remote application from local files |
| Vercel | Exact web preview/deployment/runtime/log/promotion/rollback evidence | Database truth or duplicate deployment pipeline |
| Sentry | Production engineering evidence: errors, exceptions, traces/performance, release regressions | Product-value truth or deterministic verification |
| PostHog | Production product evidence: usage, funnels, cohorts, sessions, feature/experiment outcomes | Transactional/audit/authorization truth |

## Routing

### GitHub-derived Product semantics

```text
GitHub current repository contracts
+ locked github/docs evidence
+ $github-semantics-first-principles
        ↓
First Principles subtraction of code/source-control assumptions
        ↓
minimum no-code model
        ↓
root-level repository correction
```

Use the paired `github_semantics_first_principles` Codex agent only when bounded repository-local implementation is useful. Its workspace-write authority does not authorize Git publication, deployment, remote-provider mutation, or mirror writes.

Notion and Linear remain mirrors/coordination surfaces. For the semantic workflow, correction direction is always `code_and_docs → Linear → Notion`.

### Broader Product/Domain/Architecture decisions

Use `first-principles` as the decision method. Add Notion only when durable human knowledge is needed and Context7 only when an external mechanism materially affects the decision.

### Feature, bug, gap, or implementation

```text
existing Linear item when tracked
        ↓
current repository contract + executable evidence
        ↓
smallest sufficient reversible change
        ↓
verify-change
        ↓
exact-head GitHub CI
```

Linear points to canonical contracts/gaps instead of copying them.

### External dependency/provider behavior

Use Context7 for uncertain or version-sensitive external mechanisms:

```text
resolve library
→ query narrow current docs
→ retain only the mechanism needed by the task
→ implement against repository boundaries
```

Prefer provider-native documentation when it is the stronger source for provider behavior.

### Database, Auth, RLS, migration, or provider state

```text
Repository Domain/Application contract
→ supabase/schemas desired state
→ current Supabase documentation
→ local deterministic verification
→ persistent-environment observation only if such an environment actually exists
```

Remote Supabase mutation is never implied by schema work. For the current LocalOnly baseline, canonical schema changes and the single replay artifact must remain synchronized according to repository rules; do not create a supplemental correction migration merely to compensate for a stale baseline.

Authentication, authorization, ownership, membership, grant/delegation, RLS, SQL/RPC, privileged-function, secret, destructive-lifecycle, telemetry-sensitive, or external trust-boundary changes trigger Codex Security diff review.

### Web delivery/runtime

GitHub CI is the repository gate. Use Vercel only when a real Vercel project/deployment exists and exact preview/production artifact evidence is required. Do not create a second deployment pipeline merely to satisfy this workflow.

### Production engineering observation

Use Sentry only for a real deployed environment:

```text
exact deployment/release
→ error / exception / trace / performance signal
→ affected scope
→ regression/root-cause evidence
→ GitHub/Linear follow-up when action is required
```

Sentry does not prove Product value, database correctness, authorization correctness, or health of unobserved paths.

### Production product observation

Use PostHog only when an accepted Product hypothesis/capability has an intentional observation surface:

```text
accepted hypothesis/capability
→ deployment/exposure
→ event/funnel/cohort/session/experiment evidence
→ observed outcome
→ prediction error or validated learning
```

PostHog does not replace transactional facts, Activity Event/Audit evidence, security enforcement, or Product/Domain contracts.

## Security trigger matrix

Codex Security is required when the exact diff changes any of:

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
agent/tool authority expansion
```

Agent/tool authority expansion includes introducing a write-capable specialist or weakening command/approval boundaries. A clean review is evidence, not a substitute for deterministic checks.

## Standard lifecycle

### 1. Discover

Read the minimum current repository context:

```text
task
→ applicable AGENTS.md
→ docs/README.md
→ narrowest current contract
→ current gap if relevant
→ executable evidence
```

Then read only the external evidence required to resolve remaining uncertainty.

### 2. Define

When tracking is required, create/refine one executable work item containing objective, scope, non-goals, canonical contract/gap pointer, acceptance criteria, security invariants, required verification, and dependencies.

### 3. Research

Use Context7/provider documentation narrowly. Record mechanism and source pointer, not copied documentation.

### 4. Implement

Follow only the layers actually needed:

```text
Domain
→ Application
→ Infrastructure
→ Delivery
```

Fix the earliest wrong truth boundary first. Instrumentation is implementation: add only telemetry needed to discriminate an accepted hypothesis or failure mode.

### 5. Verify

Use `verify-change` and the narrowest repository commands that can falsify the change. Typical evidence includes:

```text
pnpm codex:check
pnpm verify:fast
pnpm verify:full when required
pnpm supabase:verify for database changes
Playwright for browser behavior
```

Unavailable checks remain explicitly unavailable. Provider/telemetry evidence never substitutes for this layer.

### 6. Attack

Run Codex Security when the trigger matrix applies. Findings/remediation must be tied to the exact diff/head being integrated.

### 7. Observe

Use only evidence surfaces that actually exist:

```text
Supabase local/CI = database reproducibility/enforcement evidence
Supabase persistent environment = environment migration/Auth/provider evidence
Vercel = exact deployed web artifact/runtime evidence
Sentry = production engineering observation
PostHog = production product-behavior observation
```

Do not infer one evidence class from another.

### 8. Integrate

A merge-ready packet should identify:

```text
tracked Linear issue if any
canonical contract/gap
exact candidate SHA
deterministic verification
Codex Security result when required
Supabase/Vercel evidence when required
remaining unknowns
```

Sentry/PostHog are not generic pre-merge gates. Include them only when an explicit acceptance criterion depends on already deployed observation or a prior production regression.

Do not publish or integrate unless that external action is explicitly authorized.

### 9. Learn

After accepted integration or production observation, compare actual evidence with the Product/Domain prediction. Update the earliest invalid repository truth/gap; then update Linear execution state and Notion durable knowledge when warranted.

## Cross-system identity

Prefer stable links/identifiers:

```text
Linear issue
→ canonical repository contract/gap
→ GitHub branch/PR/exact SHA/CI
→ provider deployment/environment evidence when relevant
→ Sentry/PostHog observation when relevant
```

Notion may link the same accepted decision but should not embed transient CI logs, source files, or raw telemetry.

## Degraded mode

When a plugin is unavailable:

1. continue with repository-local evidence when safe;
2. state which evidence/coordination surface is unavailable;
3. never fabricate external state;
4. never weaken repository contracts to compensate; and
5. never provision infrastructure or add speculative telemetry merely to make the workflow appear complete.

The workflow is complete when the task has the narrowest sufficient evidence, not when every plugin has been invoked.
