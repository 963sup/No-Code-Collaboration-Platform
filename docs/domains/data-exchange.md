# Deferred Domain Candidate: Controlled Data Movement

- Status: Deferred; no accepted Product capability or concrete lifecycle
- Contract owner: future Product decision
- Last reviewed: 2026-08-16

## Problem statement

A future workflow may need to move typed Repository data to an explicitly approved destination. That problem is not yet sufficient to establish a Domain, entity, payload Artifact, connector model, or automation surface.

Current manual copy or purpose-specific import/export outside the Product remains preferable to a speculative generic transfer engine.

## Admission gate

A concrete use case must prove all of the following before this file can become a Candidate Domain contract:

1. one explicit typed source and destination;
2. independent source-read and destination-write authorization;
3. fixed schema validation and field mapping;
4. idempotency, retry ownership, timeout, cancellation, and redacted failure Evidence;
5. secret references rather than secret values;
6. provider translation isolated in Infrastructure;
7. no arbitrary URL, script, expression, template execution, chained user-defined step, CI/CD, build, test, or deployment semantics; and
8. a removal test proving manual or purpose-specific movement is insufficient.

## Non-confusion boundaries

```text
selected endpoint ≠ Principal
delivery participation ≠ authority
secret reference ≠ secret value
catalog entry ≠ successful connection
typed movement ≠ automation runtime
payload ≠ independent collaboration Container
```

Source and destination authority are revalidated server-side. A future machine Actor requires separately admitted App/Installation semantics.

## No current entities or states

No current Product or Domain meaning exists for:

- transfer request;
- payload capsule;
- endpoint;
- connector;
- mapping;
- delivery attempt;
- retry queue;
- provider callback;
- credential binding;
- import/export route; or
- transfer Capability.

No schema, migration, API, route, UI, event vocabulary, or availability claim may be derived from this document.

## Future minimum tests

If admitted later, tests must prove:

1. unauthorized source or destination access changes nothing and leaks no metadata;
2. duplicate idempotency keys create at most one externally visible delivery;
3. failure Evidence excludes payload and secret material;
4. unknown endpoints and executable transformations fail closed;
5. provider callbacks are untrusted Infrastructure input;
6. configuration authority and execution authority remain distinct; and
7. Repository authority is never expanded by data movement.
