# Architecture Documentation Scope

- This subtree describes target architecture and durable decisions, not current implementation status.
- Major boundary, ownership, authorization, persistence, or irreversible technology decisions require an ADR.
- Every architecture claim must identify its evidence, assumptions, invariants, alternatives, and falsification condition.
- Diagrams are projections of the written contract, not independent authority.
- Do not invent services, bounded contexts, databases, queues, APIs, or abstractions for symmetry.
- A downstream code or diagram patch cannot silently close an upstream model defect.
