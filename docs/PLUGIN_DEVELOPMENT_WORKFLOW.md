# Plugin Development Workflow

## Purpose

This contract standardizes how development agents use connected Linear, GitHub, Notion, Context7, Codex Security, Vercel, and Supabase tools while preserving the repository's existing truth model.

The plugins are not seven competing sources of truth. They are specialized evidence, execution, and coordination surfaces around the repository contracts.

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
          Linear close / Notion update
```

## Non-negotiable rules

1. The current task, applicable `AGENTS.md` chain, canonical Product/Ontology/Domain/Architecture contracts, current gap register, and executable repository evidence remain authoritative in that order.
2. A plugin may supply context, work tracking, external documentation, review evidence, or provider observation. It may not silently redefine Product or Domain truth.
3. Route tools by the question being answered. Never invoke all seven plugins merely because they are available.
4. Read before writing. External mutations remain separate trust-boundary actions and require the user's explicit intent for the mutation being performed.
5. Do not commit access tokens, provider project references, private production data, `.env` files, or connector credentials.
6. Store pointers across systems rather than duplicating large bodies of code, logs, provider output, or canonical definitions.
7. A green status in one system never substitutes for evidence at another layer: local != CI != preview/staging != production.
8. Close a gap only from the closure evidence defined by the current gap contract, not from a plugin status alone.

## Tool ownership

| Tool | Primary responsibility | Must not become |
| --- | --- | --- |
| Notion | Durable human knowledge, research synthesis, decision context, semantic summaries | Current code/schema/CI truth or task-status database |
| Linear | Executable work graph: issue scope, dependencies, priority, owner, acceptance criteria | Product ontology or implementation truth |
| Context7 | Current external library/framework/provider mechanism documentation | Product/Domain design authority |
| GitHub | Exact repository state, branches, PR diff, reviews, commits, CI and merge evidence | Durable product knowledge base |
| Codex Security | Adversarial review of security-sensitive diffs and repository security scans | General feature design or substitute for tests |
| Supabase | PostgreSQL/Auth/RLS/provider evidence and environment-specific database state | Domain architecture or proof of production when only local evidence exists |
| Vercel | Web build, preview, deployment, runtime/log and promotion evidence | Database truth or a duplicate deployment pipeline |

## Automatic routing

Start by classifying the task. Use only the matching routes.

### Product, ontology, domain, or architecture work

Use:

```text
GitHub current contracts/code
+ first-principles-architecture skill
+ Notion only when durable human knowledge is relevant
+ Context7 only for external mechanisms used by the decision
```

Do not let a Notion page or dependency documentation override a conflicting canonical repository contract. If the external evidence disproves a contract assumption, correct the earliest invalid repository truth boundary explicitly.

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

Use GitHub CI as the repository gate. Use Vercel for the exact deployed artifact, preview behavior, logs, promotion, rollback, and production observation when a Vercel project/deployment is available.

Do not add a second `vercel deploy` pipeline when Git integration already owns deployment unless an accepted delivery contract deliberately replaces that path.

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

### 6. Attack

Run Codex Security when the trigger matrix above applies. Findings and remediation belong to the same exact diff/head being evaluated.

### 7. Observe providers

Use Supabase and Vercel only for the provider layer that exists.

```text
Supabase local/CI
= reproducibility + database enforcement evidence

Supabase persistent environment
= environment migration/auth/provider evidence

Vercel preview
= exact web artifact/runtime evidence

Vercel production
= production deployment/runtime evidence
```

Do not infer one class from another.

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

Do not mark a Draft PR ready or merge unless the explicit integration action is authorized.

### 9. Learn

After accepted integration or observed production behavior:

- update Linear execution state;
- update Notion only if a durable semantic/decision summary changed and that write is intended;
- update `docs/IMPLEMENTATION_GAPS.md` only when current prediction error changed;
- move Closed/Superseded gap evidence to history only after its required closure evidence exists.

## Cross-system identity

Use stable links/identifiers instead of duplicated text.

Recommended linkage:

```text
Linear issue
-> canonical repository contract/gap
-> GitHub branch/PR
-> exact commit + CI
-> security/provider evidence
```

Notion may link to the same canonical contract and accepted decision, but should not embed current source files or transient CI logs.

## Degraded mode

Plugin availability is host- and connection-dependent.

When a plugin is unavailable:

1. continue with repository-local evidence when the task can still be completed safely;
2. state which evidence or coordination surface is unavailable;
3. do not fabricate Linear/Notion/provider state;
4. do not weaken repository contracts to compensate;
5. do not provision a new external environment merely to make the workflow look complete.

The workflow is complete when the task has the narrowest sufficient evidence, not when every plugin has been invoked.
