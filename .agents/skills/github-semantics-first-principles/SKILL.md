---
name: github-semantics-first-principles
description: Use for continuous First Principles reverse-engineering, admission, implementation, review, audit, and repair of GitHub-derived Product semantics in this no-code platform under one locked evidence snapshot and canonical glossary.
---

# GitHub Semantics First Principles

## Ownership

This is the single repository Skill for GitHub-derived Product semantics and repository-wide semantic repair. Do not create, retain, or invoke a second overlapping Skill for the same responsibility.

Apply the root `AGENTS.md` Absolute Product axiom without reinterpretation:

```text
Repository = No-Code Collaboration Container
```

GitHub is mature-product evidence, never target implementation authority. This Skill owns the reasoning and repair workflow; `docs/PRODUCT.md`, `docs/ONTOLOGY.md`, the narrowest Domain contract, architecture contracts, executable code, and `supabase/schemas` remain the repository truth surfaces.

Use `first-principles` only for a separate broader or non-GitHub decision. Use `plugin-development-workflow` only for distinct external evidence, coordination, security, provider, deployment, or production-observation responsibilities.

## Mandatory evidence order

Before changing GitHub-derived Product semantics, read the narrowest applicable repository contract plus these Skill files in order:

1. `REFERENCE_SNAPSHOT.md`
2. `GLOSSARY.md`
3. `BENCHMARK_CONCEPT_MATRIX.md`
4. the latest report in `audit-reports/`
5. `docs/PRODUCT.md`, `docs/ONTOLOGY.md`, the narrowest Domain contract, and `docs/architecture/README.md`
6. executable evidence and `docs/IMPLEMENTATION_GAPS.md`

If the reference snapshot is missing, unlocked, overwritten, or incomplete, repair that boundary first and pause other semantic edits. A repair cycle uses one locked `github/docs` revision from start through convergence.

## Absolute no-code admission boundary

Reject a candidate when its value depends on code, source-control, arbitrary execution, CI/CD, build, test, deployment, or a second Repository-equivalent collaboration/authorization Container. Do not preserve a rejected capability through renaming, a Data-prefixed alias, metaphor, analogy, or a generic wrapper.

The exclusion is semantic, not a raw-word ban. Benchmark evidence, explicit rejection rules, audit reports, and engineering workflow may name external concepts to identify or reject them. Product, Domain, Application, API, persistence, URL/IA, and user-facing UI must express only the accepted no-code model.

`Activity Event` is immutable Evidence of an accepted action. It is not the Product description of a normal save, a current-state version object, or a disguised source-control history node. Current-state revision values are permitted only as scalar concurrency preconditions with no independent identity, ancestry, alternate state line, authority, or user-visible source-control lifecycle.

## Continuous reverse → implement cycle

### 0. Ground authority

State the exact decision, affected Repository boundary, success condition, and cost of error. Separate:

- observed repository facts;
- locked GitHub evidence;
- external/provider facts;
- constraints and invariants;
- assumptions;
- value choices; and
- unknowns.

Never upgrade an assumption or mirror record into repository truth.

### 1. Reverse the mature mechanism

Use only the locked `github/docs` snapshot for benchmark claims during the active cycle. For each GitHub concept, ask:

1. What underlying collaboration, ownership, governance, discovery, planning, knowledge, or coordination problem does it solve?
2. Which parts depend on software development, code, Git, source-control history, or execution infrastructure?
3. What problem survives after those assumptions are removed?
4. What observable user or enterprise behavior proves the surviving problem exists here?

Do not reverse-engineer surface names first. Reverse the causal problem and mechanism.

### 2. Rebuild the minimum no-code model

Classify only what is necessary using the repository semantic lens:

```text
Actor        = who acts
Scope        = which ownership/governance boundary applies
Principal    = who may receive authority
Container    = where collaboration has one stable boundary
Relationship = how identities, scopes, principals, owners, and Containers connect
Artifact     = collaborative work inside a Container
Process      = how Artifact/Relationship state validly changes
```

Keep Authorization, Presentation, and Evidence cross-cutting. Then answer for every candidate:

- What root problem remains?
- Is a new entity actually necessary?
- At which layer does it belong?
- What relationships, lifecycle, authority, and containment does it own?
- What invariant would removal break?
- Can Repository remain the only primary collaboration/authorization boundary?
- What is the smallest discriminating test that could falsify admission?

If removal breaks nothing necessary, do not admit the abstraction.

### 3. Translate excluded concepts once

`GLOSSARY.md` is the only mapping authority. Every excluded concept must have:

- a canonical target outcome or explicit rejection;
- data-versioning classification;
- a verification question;
- one required answer shape; and
- one forbidden answer shape.

A mapping fails when the answer still depends on actor/time/change-history narration for a normal save, alternate state lines, line/file patches, convergence of histories, history rewriting, movable history pointers, or continuing upstream authority.

Individual files may not invent local aliases. A glossary correction requires a formal revalidation of the affected benchmark and verification scenario.

### 4. Record the violation before repair

For repository-wide repair, write the violation into the current audit report before implementation. When Linear/Notion coordination is required, mirror the same authoritative finding there before repair.

Code and repository documentation are the authority. Linear and Notion are mirrors only. On mismatch, correction direction is always:

```text
code_and_docs → Linear → Notion
```

Never change Product, Domain, schema, UI, or tests merely to match a mirror record.

### 5. Correct the earliest wrong truth boundary

Use root-level correction, not additive explanation. Fix the earliest incorrect canonical definition first, then every downstream projection that depended on it:

```text
Product / Ontology
→ Domain
→ Architecture
→ Application / Infrastructure
→ schema / policy / command
→ UI / URL / presentation
→ tests / checkers
→ mirrors
```

Touch only layers required by the real causal error. Do not add speculative packages, tables, services, generic semantic-role persistence, or capability frameworks.

If Supabase database truth changes, start from `supabase/schemas`, preserve the repository's migration/baseline contract, regenerate derived database types when required, and never infer a remote database mutation from local schema work.

### 6. Verify the smallest falsifier first

Run the narrowest deterministic check that can falsify the change, then broaden by impact. For Skill/Codex changes, `pnpm codex:check` is mandatory. For normal code/configuration changes use `pnpm verify:fast`; use `pnpm verify:full` when build, exports, dependencies, or reachability change. Database changes require the repository-owned Supabase verification path.

Security-sensitive authentication, authorization, ownership, membership, grants/delegation, RLS, SQL/RPC, privileged-function, secret, telemetry, destructive-lifecycle, or external trust-boundary changes require Codex Security review through `plugin-development-workflow`.

Provider and telemetry evidence supplement deterministic checks. They never replace them.

### 7. Converge the audit

The latest dated audit report must classify work as:

- `newly_passed`;
- `maintained_passed`;
- `revoked`; and
- `not_passed`.

If `revoked` is empty, iterate only over `not_passed`. If an item is revoked, correct its verification criterion before changing implementation and revalidate it in the next round. After the same item is revoked in two consecutive rounds, stop automatic semantic redefinition and require an explicit Product decision.

The cycle is converged only when all required benchmark concepts are covered and both `revoked` and `not_passed` are empty.

### 8. Synchronize mirrors from authority

After repository truth changes, update Linear then Notion to match the actual code/docs state. Record every mismatch and correction direction in the audit report. A mirror marked Done while repository work is incomplete must be moved back to an active state; a repository implementation must never be altered merely to make a mirror appear correct.

### 9. Preserve publication boundaries

Repository-local implementation permission is not publication permission. This Skill never implies authorization to commit, push, merge, deploy, promote, mutate a remote Supabase project, change production flags, or modify external systems. Those remain explicit parent/user actions.

Do not integrate to `main` until the latest audit is converged, required deterministic verification is green on the exact candidate, security review has no release blocker when triggered, and required mirrors match code/docs.

## Paired Codex agent

The repository pair is `.codex/agents/github-semantics-first-principles.toml` with agent name `github_semantics_first_principles`.

That agent may edit only the repository workspace required to implement this Skill's accepted root correction. It must not independently publish Git changes, deploy, mutate remote providers, or treat external mirrors as authority. The Skill defines semantic method; the agent supplies bounded implementation capacity.

## Required output

- Exact target decision and success condition
- Evidence ledger: repository facts vs locked GitHub evidence vs inference
- Underlying collaboration problem after code/source-control subtraction
- Minimum sufficient no-code model and invariants
- Admission/rejection decision with Repository containment/authority proof
- Canonical glossary mapping and verification scenario when an excluded concept is involved
- Root-correction file list with before-problem → corrected truth
- Deterministic verification and security evidence
- Audit classification and remaining unknowns
- Linear/Notion source-of-truth synchronization record when repository-wide work is performed
