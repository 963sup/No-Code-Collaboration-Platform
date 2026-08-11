# Documentation Map

This directory separates product meaning, target design, domain semantics, operating procedures, implementation evidence, and decision history.

## Durable contract set

- [`PRODUCT.md`](./PRODUCT.md): canonical product meaning, semantic boundaries, invariants, deferred concepts, and falsification conditions.
- [`architecture/`](./architecture/README.md): target architecture, ownership and dependency boundaries, invariants, and accepted ADRs.
- [`domains/`](./domains/README.md): candidate and accepted problem contracts. A document here does not create a package, service, or bounded context by itself.
- [`operations/RUNBOOK.md`](./operations/RUNBOOK.md): production release, recovery, incident, data-protection, and validation procedures.
- [`DEVELOPMENT_ENVIRONMENT.md`](./DEVELOPMENT_ENVIRONMENT.md): workstation bootstrap and deterministic local verification entry points.
- [`CODEX_DESKTOP.md`](./CODEX_DESKTOP.md): Codex Desktop project configuration, MCP context routing, trust boundaries, and verification.

## Design-to-production truth model

```mermaid
flowchart TB
  product["Product Contract<br/>why the platform exists and what it means"]
  domain["Domain Contracts<br/>entities, relationships, states, invariants"]
  architecture["Architecture Contract<br/>ownership, boundaries, dependencies"]
  executable["Executable Contracts<br/>schema, code, policies, tests, CI"]
  production["Production Reality<br/>observations, telemetry, incidents"]
  adr["Decision Records<br/>why an accepted model changed"]
  runbook["Operations Runbook<br/>deploy, recover, and restore"]

  product --> domain
  domain --> architecture
  architecture --> executable
  executable --> production
  production -->|"evidence and prediction error"| product
  adr -.->|"updates accepted contracts"| product
  adr -.->|"updates accepted contracts"| domain
  adr -.->|"updates accepted contracts"| architecture
  runbook --> production
  production -->|"operational learning"| runbook
```

The diagram is a projection of the written contracts, not an independent source of truth.

## Question-specific authority

No single document is authoritative for every question.

| Question | Primary authority |
| --- | --- |
| What does the product mean? | `docs/PRODUCT.md` |
| What business problem, vocabulary, and invariants does a domain own? | Accepted domain contract, with Domain code and tests as implementation evidence |
| What are the target ownership and dependency boundaries? | `docs/architecture/README.md` and accepted ADRs |
| What is the current desired database structure? | `supabase/schemas/*.sql` |
| How did the database change over time? | Reviewed append-only migrations |
| What does the current implementation do? | Executable code, policies, and tests |
| What is actually happening in production? | Direct observation, provider telemetry, deployment evidence, and incident records |
| How should an operator release or recover the system? | `docs/operations/RUNBOOK.md`, after its preconditions are verified |
| How does an external dependency behave? | Current official documentation for that external system |

Generated diagrams, generated types, snapshots, agent output, and session context are projections or evidence. They cannot silently redefine the target model.

## Repository work instruction order

1. Current explicit task and the applicable `AGENTS.md` chain
2. Canonical product contract, accepted target contracts, and accepted ADRs
3. Executable code, schema, policies, migrations, and tests for current implementation behavior
4. Direct observations and current official external documentation
5. Generated projections and transient context

When target contracts and executable behavior disagree, do not hide the difference. Identify whether the contract is wrong, implementation is incomplete, or production has drifted; then update the earliest invalid truth boundary.

OpenAI Developer Docs, Context7, GitHub documentation, Supabase documentation, and other official sources answer questions about their respective external systems. They do not silently redefine this platform.
