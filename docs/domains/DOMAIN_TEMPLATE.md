# Domain Contract: Name

- Status: Candidate
- Contract owner:
- Last reviewed: YYYY-MM-DD

## Problem owned and success condition

What coherent business problem and outcome does this contract own? What observation would show the boundary is useful?

## Evidence ledger

### Observations

What has been directly observed in product behavior, implementation, or user need?

### Constraints

What must remain true?

### Assumptions

What is temporarily believed but not yet sufficiently proven?

### Unknowns

What unresolved information could change the model?

### Value choices

What trade-offs are intentionally preferred?

## Boundary and owner

Define what is inside, what is outside, which lifecycle this contract owns, and who may change the contract.

## Vocabulary

List canonical terms and any external aliases. Use one term per concept.

## Entities, relationships, and derived concepts

Describe persistent identities, relationships, cardinality, lifecycle ownership, and concepts that must remain derived rather than becoming entities.

## States and transitions

Define valid states, commands, transition rules, failure behavior, and concurrency requirements.

## Invariants

State conditions that must always hold regardless of UI, provider, or storage implementation.

## Actors, principals, contexts, and permissions

Separate authenticated actors, authority-bearing principals, selected contexts, resource targets, and server-side authorization facts.

## Events and workflows

List meaningful domain events, triggers, consumers, feedback loops, delays, and idempotency requirements.

## Dependencies and failure behavior

For every dependency, state direction, contract, trust boundary, timeout or unavailability behavior, and the owner of translation.

## Alternatives and removal test

Include the do-nothing model and simpler alternatives. State what breaks if this domain contract is removed.

## Falsification conditions

What evidence would show that the boundary, vocabulary, or causal model is wrong?

## Minimum discriminating tests

Define the smallest tests, thresholds, and stopping rules that can reject the leading assumptions or invariants.
