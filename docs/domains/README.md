# Domains

A Domain exists only when a coherent business problem, vocabulary, ownership boundary, invariants, lifecycle, and failure behavior justify it. This directory is not a mirror of GitHub pages, packages, database tables, or semantic roles.

Use [`DOMAIN_TEMPLATE.md`](./DOMAIN_TEMPLATE.md) only after benchmark admission succeeds.

## Benchmark admission before Domain admission

For a GitHub-derived concept:

1. identify the durable collaboration or organizational problem;
2. remove Source Code, source-control, arbitrary execution, CI/CD, build, test, and deployment assumptions;
3. reject the candidate if its value disappears;
4. classify the surviving Actor, Scope, Principal, Container, Relationship, Artifact, and Process roles;
5. keep Authorization, Presentation, and Evidence cross-cutting; and
6. prove independent owner, lifecycle, invariants, failure behavior, and removal cost.

Classification alone creates no package, schema, route, table, service, or bounded context.

## Contract states

- **Candidate**: falsifiable semantic model under validation; not architecture by itself.
- **Accepted**: ownership, invariants, dependencies, and executable evidence passed acceptance.
- **Deferred**: a possible problem exists, but evidence is insufficient to define Product or Domain semantics.
- **Superseded**: historical contract that no longer defines current truth.

Implementation may trail a Candidate only through an explicit current gap. Candidate status is not permission to claim unsupported behavior.

## Catalog

### Accepted contract

- [`repository-collaboration.md`](./repository-collaboration.md): primary collaboration and authorization Container, typed User/Organization ownership, Owner namespace, Artifact containment, identity, and shared authorization/Evidence invariants.

Acceptance does not imply a microservice, generic persistence supertype, or speculative lifecycle.

### Current Resource and cross-cutting candidates

- [`identity-lifecycle.md`](./identity-lifecycle.md): provider identity, Session, Product Actor readiness, and identity transitions.
- [`access-authority.md`](./access-authority.md): Principal Grants, Roles, Capabilities, delegation, ownership/governance sources, and authorization explanation.
- [`page-resource.md`](./page-resource.md): Page commands, concurrency, and Activity Event Evidence.
- [`issue-resource.md`](./issue-resource.md): actionable work identity, lifecycle, responsibility, classification, conversation, concurrency, and Evidence.
- [`discussion-resource.md`](./discussion-resource.md): shared-understanding lifecycle, categories, moderation, conversation, and Answer semantics.
- [`collaboration-projections.md`](./collaboration-projections.md): planning, Notification, Search, Explore, Marketplace, availability, and governance projections.

### Historical or deferred boundaries

- [`structured-data-change.md`](./structured-data-change.md): superseded historical candidate. Safe mutation is owned by concrete Resource commands, Expected Revision, State Transition, Current State, and Activity Event.
- [`data-exchange.md`](./data-exchange.md): deferred problem boundary only. No transfer, connector, endpoint, payload, credential-binding, lifecycle, or automation capability is accepted.

The external source-control concepts listed in the [canonical glossary](../../.agents/skills/github-semantic-reverse/GLOSSARY.md) remain benchmark or engineering vocabulary only and create no target Domain.

## Acceptance gate

Promote a candidate only when:

1. the owned problem survives benchmark subtraction;
2. canonical vocabulary reduces ambiguity rather than hiding an external mental model;
3. semantic classification does not substitute for ownership and lifecycle evidence;
4. entities, relationships, states, invariants, authority, and failure behavior are explicit;
5. dependencies have one-way ownership and translation boundaries;
6. implementation gaps are registered and contained;
7. one authorization-sensitive vertical slice proves the contract;
8. a second real use case reuses the boundary without duplicated decisions; and
9. a major architecture boundary has an accepted ADR and removal test.

Domain acceptance does not require a microservice, independent datastore, or separate deployment.
