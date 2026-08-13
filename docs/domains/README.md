# Domains

A domain exists only when a coherent business problem, vocabulary, ownership boundary, invariants, and lifecycle justify it. This directory is not a mirror of GitHub page names, package names, database tables, or the semantic-role lens itself.

Use [`DOMAIN_TEMPLATE.md`](./DOMAIN_TEMPLATE.md) when evidence supports a candidate contract.

## Semantic admission lens

Before proposing a Domain contract, classify the underlying collaboration mechanism with the smallest applicable roles:

```text
Actor        = who acts
Scope        = which ownership or governance boundary applies
Principal    = who may receive authority
Container    = where collaboration has one stable boundary
Relationship = how actors, principals, scopes, and containers are connected
Artifact     = what collaborative work exists inside a container
Process      = how artifacts or relationships validly change
```

These roles are decomposition vocabulary, not bounded contexts. A single Domain contract may own several roles, and one product concept may play more than one role. Authorization (`Role`, `Capability`, `Policy`), presentation (`Context`, `Projection`), and historical evidence (`Activity Event`) remain explicit cross-cutting semantics rather than being forced into one of the seven roles.

A proposed Domain must still prove independent business ownership, lifecycle, invariants, failure behavior, and removal cost. Classification alone is not evidence for creating a package, schema, route, table, service, or bounded context.

## Contract states

- **Candidate**: a falsifiable semantic model under validation. It does not create an architectural boundary by itself.
- **Accepted**: a contract whose ownership, invariants, dependencies, and executable evidence have been accepted through the applicable architecture decision process.
- **Superseded**: historical contract retained for traceability and linked to its replacement.

A package, schema file, route, or UI section does not prove a bounded context. Conversely, one accepted domain may span several implementation boundaries.

A Candidate contract may intentionally lead the executable baseline, but every observed mismatch must be recorded in [`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md). Candidate status is not permission to describe target behavior as already enforced.

## Catalog

### Candidate contracts

- [`identity-lifecycle.md`](./identity-lifecycle.md): Anonymous Human, verified provider identity, Session, Product Actor readiness, and identity-lifecycle invariants.
- [`repository-collaboration.md`](./repository-collaboration.md): Repository identity, ownership relation, Resource containment, and collaboration-boundary invariants.
- [`access-authority.md`](./access-authority.md): Principal grants, Role bundles, Capabilities, delegation, and authorization explanation.
- [`page-resource.md`](./page-resource.md): first Page work unit, create/update transitions, optimistic concurrency, and immutable transition facts.

### Accepted contracts

No bounded-context map is accepted yet.

## Acceptance gate

Promote a candidate only when:

1. the owned problem and outcome are coherent;
2. canonical vocabulary removes rather than adds ambiguity, and the semantic-role classification does not substitute for actual ownership/lifecycle evidence;
3. entities, relationships, states, invariants, and failure behavior are explicit;
4. dependencies have one-way ownership and translation boundaries;
5. known implementation gaps are registered, contained, and have explicit closure evidence;
6. at least one authorization-sensitive vertical slice proves the contract;
7. a second real use case can reuse the boundary without duplicated decisions or circular dependencies; and
8. an accepted ADR records any resulting major architecture boundary.

Domain acceptance does not require a microservice, independent datastore, or separate deployment.
