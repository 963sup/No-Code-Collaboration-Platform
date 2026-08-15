# Documentation Map

This directory separates current Product/Domain/Architecture truth from historical evidence so normal development does not need to interpret obsolete decisions.

## Durable contract set

- [`PRODUCT.md`](./PRODUCT.md): canonical root Product axiom, meanings, invariants, deferred concepts, and falsification conditions.
- [`ONTOLOGY.md`](./ONTOLOGY.md): canonical semantic expansion and GitHub benchmark-admission rules. It does not replace `PRODUCT.md` as the root Product Contract.
- [`IMPLEMENTATION_GAPS.md`](./IMPLEMENTATION_GAPS.md): current Open or Contained differences between target contracts and executable behavior, including risk, containment, and required closure evidence.
- [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md): historical closure evidence for Closed or Superseded gaps; never current implementation truth by itself.
- [`architecture/README.md`](./architecture/README.md): current target architecture, ownership/dependency boundaries, owner-neutral authorization, and canonical `/{owner}/{repository}` Web architecture.
- [`architecture/ADR_INDEX.md`](./architecture/ADR_INDEX.md): decision-history router showing Accepted, Historical, and Superseded architecture decisions.
- [`architecture/ADR-013-core-no-code-data-semantic-envelope.md`](./architecture/ADR-013-core-no-code-data-semantic-envelope.md): accepted no-code Data Change, Exchange, and Repository Derivation semantic envelope and its precise ADR-011/012 supersession boundary; it authorizes no implementation.
- [`domains/issue-resource.md`](./domains/issue-resource.md), [`domains/discussion-resource.md`](./domains/discussion-resource.md), and [`domains/collaboration-projections.md`](./domains/collaboration-projections.md): decision-complete v1 work, conversation, planning, delivery, search, discovery, catalog, and availability semantics.
- [`domains/structured-data-change.md`](./domains/structured-data-change.md) and [`domains/data-exchange.md`](./domains/data-exchange.md): accepted semantic envelopes with Candidate concrete lifecycles and explicit no-execution/authority boundaries.
- [`benchmarks/GITHUB_PUBLIC_URL_UI_UX.md`](./benchmarks/GITHUB_PUBLIC_URL_UI_UX.md): dated external evidence for the GitHub public and read-only authenticated test-account URL/IA/UI/UX benchmark, indexed by `.playwright-mcp/`; not Product or implementation truth.
- [`domains/`](./domains/README.md): candidate and accepted business problem contracts. A document here does not create a package, service, or bounded context by itself.
- [`PLUGIN_DEVELOPMENT_WORKFLOW.md`](./PLUGIN_DEVELOPMENT_WORKFLOW.md): development-agent orchestration contract for Linear, GitHub, Notion, Context7, Codex Security, Vercel, and Supabase. It routes tools by truth class without creating another source of truth.
- [`operations/RUNBOOK.md`](./operations/RUNBOOK.md): production release, recovery, incident, data-protection, environment-provisioning, and validation procedures.
- [`DEVELOPMENT_ENVIRONMENT.md`](./DEVELOPMENT_ENVIRONMENT.md): workstation bootstrap and deterministic local verification entry points.
- [`CODEX_DESKTOP.md`](./CODEX_DESKTOP.md): Codex Desktop project configuration, MCP context routing, trust boundaries, and verification.

## Design-to-production truth model

```mermaid
flowchart TB
  product["Product Contract<br/>Repository axiom and canonical meaning"]
  ontology["Product Ontology<br/>semantic admission and non-confusion"]
  domain["Domain Contracts<br/>relationships, states, invariants"]
  architecture["Current Architecture Contract<br/>ownership, authorization, delivery, persistence boundaries"]
  executable["Executable Contracts<br/>schema, code, policies, tests, CI"]
  production["Production Reality<br/>observations, telemetry, incidents"]
  gaps["Current Gap Register<br/>Open / Contained prediction error"]
  history["Historical Evidence<br/>closed gaps and superseded decisions"]
  runbook["Operations Runbook<br/>release, recover, restore"]

  product --> ontology
  ontology --> domain
  domain --> architecture
  architecture --> executable
  executable --> production
  executable -->|"prediction error"| gaps
  production -->|"observed drift"| gaps
  gaps -->|"verified closure"| history
  history -.->|"why / regression evidence"| executable
  production -->|"evidence and prediction error"| product
  runbook --> production
  production -->|"operational learning"| runbook
```

The diagram is a projection of the written contracts, not an independent source of truth.

## Question-specific authority

| Question | Primary authority |
| --- | --- |
| What does the Product mean? | `docs/PRODUCT.md` |
| How should a GitHub-inspired concept be admitted/classified before implementation? | `docs/ONTOLOGY.md`, constrained by `docs/PRODUCT.md` |
| What business problem, vocabulary, and invariants does a Domain own? | Narrowest relevant Domain contract plus Domain tests as executable evidence |
| What are current ownership, dependency, authorization, URL, and Repository presentation boundaries? | `docs/architecture/README.md` and executable route/checker contracts |
| Why was an architecture decision made, and is it still current? | `docs/architecture/ADR_INDEX.md`, then only the relevant ADR |
| Where does current executable behavior differ from target? | `docs/IMPLEMENTATION_GAPS.md`, backed by exact executable/provider evidence |
| How should development agents select Skills or route connected external tools? | `docs/CODEX_DESKTOP.md` Skill routing, then `docs/PLUGIN_DEVELOPMENT_WORKFLOW.md` only when external tools or evidence are needed |
| What is current desired database structure? | `supabase/schemas/*.sql` |
| How can an empty database be rebuilt? | Reviewed replayable migrations plus deterministic seed data |
| Which migrations are applied in a persistent environment? | That environment's migration ledger and direct provider evidence |
| What does current implementation do? | Executable code, policies, and tests |
| What is actually happening in production? | Direct observation, provider telemetry, deployment evidence, and incident records |
| How should an operator provision, release, or recover an environment? | `docs/operations/RUNBOOK.md` after verifying its preconditions |
| How does an external dependency behave? | Current official documentation for that external system |

Generated diagrams, generated types, snapshots, agent output, and session context are projections or evidence. They cannot silently redefine the target model.

A selected provider is not proof of a provisioned environment. A migration file is not proof of an applied migration. Local or CI verification is not production validation.

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
```

Canonical Repository presentation is one Owner/Repository header, primary navigation, one active child resource surface, and only proven route-specific supporting regions. See ADR-011 for responsive Parallel/Intercepting Route composition.

There is currently no public stable-ID Repository compatibility namespace. Stable Repository UUIDs remain internal authorization/data identities. A future compatibility obligation must be proven before adding any redirect namespace, and an Organization-only Repository UI tree is never a valid compatibility representation.

## Repository work instruction order

1. Current explicit task and the applicable `AGENTS.md` chain.
2. Canonical Product/Ontology, then the narrowest relevant Domain/current Architecture contract.
3. Current Open/Contained implementation gaps and their containment requirements.
4. Executable code, schema, policies, migrations, and tests for current behavior.
5. Direct observations and current official external documentation.
6. For decision history, read `architecture/ADR_INDEX.md` first and open only the relevant historical record when the task asks why or investigates a regression.
7. Generated projections and transient context.

When target contracts and executable behavior disagree, do not hide the difference. Determine whether the earliest invalid boundary is Product, Domain, Architecture, executable projection, or environment evidence, then correct that boundary and every affected downstream projection.

An open authorization or data-integrity gap is not a roadmap note. It blocks claims that the affected capability is production-validated until required closure evidence exists.

OpenAI Developer Docs, Context7, GitHub documentation, Supabase documentation, and other official sources answer questions about their respective external systems. They do not silently redefine this platform.
