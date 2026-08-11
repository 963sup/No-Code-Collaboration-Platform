# Domains

A domain exists only when a coherent business problem, vocabulary, ownership boundary, invariants, and lifecycle justify it. This directory is not a mirror of GitHub page names, package names, or database tables.

Use [`DOMAIN_TEMPLATE.md`](./DOMAIN_TEMPLATE.md) when evidence supports a candidate contract.

## Contract states

- **Candidate**: a falsifiable semantic model under validation. It does not create an architectural boundary by itself.
- **Accepted**: a contract whose ownership, invariants, dependencies, and executable evidence have been accepted through the applicable architecture decision process.
- **Superseded**: historical contract retained for traceability and linked to its replacement.

A package, schema file, route, or UI section does not prove a bounded context. Conversely, one accepted domain may span several implementation boundaries.

A Candidate contract may intentionally lead the executable baseline, but every observed mismatch must be recorded in [`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md). Candidate status is not permission to describe target behavior as already enforced.

## Catalog

### Candidate contracts

- [`repository-collaboration.md`](./repository-collaboration.md): Repository identity, ownership relation, Resource containment, and collaboration-boundary invariants.
- [`access-authority.md`](./access-authority.md): Principal grants, Role bundles, Capabilities, delegation, and authorization explanation.
- [`page-resource.md`](./page-resource.md): first Page work unit, create/update transitions, optimistic concurrency, and immutable transition facts.

### Accepted contracts

No bounded-context map is accepted yet.

## Acceptance gate

Promote a candidate only when:

1. the owned problem and outcome are coherent;
2. canonical vocabulary removes rather than adds ambiguity;
3. entities, relationships, states, invariants, and failure behavior are explicit;
4. dependencies have one-way ownership and translation boundaries;
5. known implementation gaps are registered, contained, and have explicit closure evidence;
6. at least one authorization-sensitive vertical slice proves the contract;
7. a second real use case can reuse the boundary without duplicated decisions or circular dependencies; and
8. an accepted ADR records any resulting major architecture boundary.

Domain acceptance does not require a microservice, independent datastore, or separate deployment.
