# Documentation Map

This directory separates current Product/Domain/Architecture truth from benchmark evidence, implementation status, and decision history.

## Durable contract set

- [`PRODUCT.md`](./PRODUCT.md): root Product axiom, canonical meanings, invariants, deferred concepts, and falsification conditions.
- [`ONTOLOGY.md`](./ONTOLOGY.md): canonical semantic expansion and GitHub benchmark-admission rules.
- [`IMPLEMENTATION_GAPS.md`](./IMPLEMENTATION_GAPS.md): current Open or Contained target-to-executable mismatches.
- [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md): historical closure evidence only.
- [`architecture/README.md`](./architecture/README.md): current ownership, dependency, authorization, mutation, persistence, and Web boundaries.
- [`architecture/ADR_INDEX.md`](./architecture/ADR_INDEX.md): decision-history router.
- [`architecture/ADR-014-current-state-collaboration-kernel.md`](./architecture/ADR-014-current-state-collaboration-kernel.md): accepted current-state mutation and Evidence kernel.
- [`architecture/ADR-013-core-no-code-data-semantic-envelope.md`](./architecture/ADR-013-core-no-code-data-semantic-envelope.md): superseded decision history with no current effect.
- [`domains/`](./domains/README.md): accepted, candidate, deferred, and superseded business-problem contracts.
- [`benchmarks/GITHUB_PUBLIC_URL_UI_UX.md`](./benchmarks/GITHUB_PUBLIC_URL_UI_UX.md): dated external URL/IA/UI/UX evidence, not Product truth.
- [`PLUGIN_DEVELOPMENT_WORKFLOW.md`](./PLUGIN_DEVELOPMENT_WORKFLOW.md): connected-tool routing by truth class.
- [`operations/RUNBOOK.md`](./operations/RUNBOOK.md): environment, release, recovery, and incident procedures.
- [`DEVELOPMENT_ENVIRONMENT.md`](./DEVELOPMENT_ENVIRONMENT.md): deterministic workstation bootstrap and verification.
- [`CODEX_DESKTOP.md`](./CODEX_DESKTOP.md): Codex context, trust, Skill routing, and verification.

## Truth model

```text
Product
↓
Ontology
↓
Narrow Domain contract
↓
Current Architecture
↓
Executable code / schema / policies / tests
↓
Environment and production observation

Mismatch → IMPLEMENTATION_GAPS
Verified closure → history/CLOSED_GAPS
```

Generated diagrams, types, snapshots, agent output, and session context are projections or evidence. They cannot silently redefine target truth.

A selected provider is not proof of a provisioned environment. A migration file is not proof of an applied migration. Local or CI verification is not production validation.

## Question-specific authority

| Question | Primary authority |
| --- | --- |
| What does the Product mean? | `docs/PRODUCT.md` |
| How is a GitHub-derived concept admitted? | `docs/ONTOLOGY.md` plus the locked semantic Skill evidence |
| What business problem and lifecycle does a Domain own? | Narrowest current Domain contract |
| What are current ownership, mutation, dependency, authorization, URL, and presentation boundaries? | `docs/architecture/README.md` |
| Why was a decision made, and is it still current? | `docs/architecture/ADR_INDEX.md`, then the relevant ADR |
| Where does executable behavior differ from target? | `docs/IMPLEMENTATION_GAPS.md` plus exact evidence |
| What is current implementation behavior? | Code, schema, policies, and tests |
| What is actually happening in an environment? | Direct provider/deployment observation |
| How should connected tools be routed? | `docs/CODEX_DESKTOP.md` then `docs/PLUGIN_DEVELOPMENT_WORKFLOW.md` |

## Current Repository truth

```text
Repository = No-Code Collaboration Container
Repository Owner = User | Organization
Owner identity URL = /{ownerSlug}
Canonical Repository URL = /{ownerSlug}/{repositorySlug}
Authenticated discovery = /dashboard
Repository discovery = /repos
Assigned Issue inbox = /issues/assigned
Repository knowledge = /{ownerSlug}/{repositorySlug}/wiki
Mutation = concrete Resource command + Expected Revision when required
Accepted result = Current State + Activity Event
```

Canonical Repository presentation is one Owner/Repository header, primary navigation, one active child resource surface, and only proven route-specific supporting regions.

There is currently no public stable-ID Repository compatibility namespace. Stable UUIDs remain internal authorization and data identities.

## Work instruction order

1. Current task and applicable `AGENTS.md` chain.
2. Product/Ontology, then the narrowest Domain and current Architecture contract.
3. Current Open/Contained gaps and containment.
4. Executable code, schema, policies, migrations, and tests.
5. Direct observations and current official external documentation.
6. Decision history only when the task asks why or investigates regression.
7. Generated projections and transient context.

When target and executable behavior disagree, identify the earliest wrong boundary and correct every downstream projection. An open authorization or data-integrity gap blocks production-validation claims.
