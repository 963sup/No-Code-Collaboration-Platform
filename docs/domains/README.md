# Domains

A Domain exists only when a coherent business problem, vocabulary, ownership boundary, invariants, and lifecycle justify it. This directory is not a mirror of GitHub page names, package names, database tables, or the semantic-role lens itself.

Use [`DOMAIN_TEMPLATE.md`](./DOMAIN_TEMPLATE.md) when evidence supports a candidate contract.

## Benchmark admission before Domain admission

Before classifying a GitHub benchmark concept, prove that its collaboration or organizational problem remains meaningful for an arbitrary no-code Repository.

If the candidate's value depends on software-development-specific implementation assumptions rather than that durable problem, reject the candidate entirely. Do not create a renamed or generalized Domain candidate for it.

Only surviving semantics enter the role lens:

```text
Actor        = who acts
Scope        = which ownership or governance boundary applies
Principal    = who may receive authority
Container    = where collaboration has one stable boundary
Relationship = how actors, principals, scopes, owners, and containers connect
Artifact     = what collaborative work exists inside a container
Process      = how artifacts or relationships validly change
```

These roles are decomposition vocabulary, not bounded contexts. A single Domain contract may own several roles, and one product concept may play more than one role. Authorization (`Role`, `Capability`, `Policy`), presentation (`Context`, `Projection`), and historical evidence (`Activity Event`) remain explicit cross-cutting semantics.

A proposed Domain must still prove independent business ownership, lifecycle, invariants, failure behavior, and removal cost. Classification alone is not evidence for creating a package, schema, route, table, service, or bounded context.

## Contract states

- **Candidate**: falsifiable semantic model under validation. It does not create an architectural boundary by itself.
- **Accepted**: contract whose ownership, invariants, dependencies, and executable evidence have passed the applicable acceptance process.
- **Superseded**: historical contract that no longer defines current truth.

A package, schema file, route, or UI section does not prove a bounded context. Conversely, one accepted Domain may span several implementation boundaries.

A Candidate contract may intentionally lead executable behavior, but every observed mismatch must be recorded in [`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md). Candidate status is not permission to describe target behavior as already enforced.

## Catalog

### Candidate contracts

- [`identity-lifecycle.md`](./identity-lifecycle.md): Anonymous Human, verified provider identity, Session, Product Actor readiness, and identity-lifecycle invariants.
- [`repository-collaboration.md`](./repository-collaboration.md): typed User/Organization Repository ownership, Owner namespace, Resource containment, and collaboration-boundary invariants.
- [`access-authority.md`](./access-authority.md): Principal Grants, Role bundles, Capabilities, delegation, ownership/governance sources, and authorization explanation.
- [`page-resource.md`](./page-resource.md): first Page work unit, create/update transitions, optimistic concurrency, and required historical evidence.
- [`issue-resource.md`](./issue-resource.md): Repository-scoped actionable work identity, lifecycle, responsibility, classification, conversation, optimistic concurrency, and Activity Evidence.
- [`discussion-resource.md`](./discussion-resource.md): Repository-scoped shared-understanding lifecycle, fixed categories, moderation, flat conversation, and question Answer semantics.
- [`collaboration-projections.md`](./collaboration-projections.md): planning, notification, search, explore, integration-catalog, availability, and explicitly deferred governance projections.

### Accepted semantic envelopes with Candidate concrete lifecycles

- [`structured-data-change.md`](./structured-data-change.md): accepted meanings and safety boundary for Data Commit, Data Branch, Data Diff, and Change Proposal; identity, lifecycle, Capability, persistence, route, API, and UI remain Candidate.
- [`data-exchange.md`](./data-exchange.md): accepted meanings and safety boundary for Data Transfer and Data Capsule; endpoint, connector, lifecycle, Capability, persistence, route, API, and UI remain Candidate.

`Commit`, `Branch`, `Diff`, `Pull Request`, `Actions`, `Gist`, `Fork`, `Pull`, and `Push` are external benchmark aliases only. Source Code, Git mechanics, arbitrary execution, and a generic version-control or automation engine remain rejected.

### Accepted contracts

No bounded-context map or executable Data lifecycle is accepted by this catalog.

## Acceptance gate

Promote a candidate only when:

1. the owned problem and outcome are coherent and survive benchmark-admission rules;
2. canonical vocabulary removes rather than adds ambiguity;
3. semantic-role classification does not substitute for actual ownership/lifecycle evidence;
4. entities, relationships, states, invariants, and failure behavior are explicit;
5. dependencies have one-way ownership and translation boundaries;
6. known implementation gaps are registered, contained, and have explicit closure evidence;
7. at least one authorization-sensitive vertical slice proves the contract;
8. a second real use case can reuse the boundary without duplicated decisions or circular dependencies; and
9. an accepted ADR records any resulting major architecture boundary.

Domain acceptance does not require a microservice, independent datastore, or separate deployment.
