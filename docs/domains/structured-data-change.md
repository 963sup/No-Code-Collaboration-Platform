# Historical Domain Candidate: Structured Data Change

- Status: Superseded by the current-state Resource command kernel
- Contract owner: `docs/PRODUCT.md`, concrete Resource contracts, and ADR-014
- Last reviewed: 2026-08-16

## Why this candidate is superseded

This file previously grouped several source-control-shaped concepts into an admitted Product envelope. The underlying needs were real—safe mutation, concurrency, accountability, review, and comparison—but the proposed Domain boundary was not necessary.

The minimum sufficient model is:

```text
Actor + Repository Authority + Concrete Resource Command + Expected Revision
↓
Accepted State Transition
↓
Authoritative Current State + Activity Event
```

Concrete Resource contracts already own valid commands, invariants, authorization, and concurrency. Activity Event owns historical Evidence. A generic structured-change Domain would duplicate those owners and preserve an unnecessary history/alternate-state mental model.

## Current ownership

- **Resource contract**: command vocabulary, input validation, transition, target-state preconditions, and concurrency strategy.
- **Access Authority**: Capability decision for Actor and Repository.
- **Application**: command orchestration and provider-neutral Ports.
- **Infrastructure**: transaction, Expected Revision enforcement, RLS, constraints, and atomic Evidence persistence.
- **Activity Event**: accepted action Evidence.
- **Projection**: optional read-authorized comparison only after retained states are independently justified.

## Current invariants

1. Every mutation targets one stable Repository and concrete Resource.
2. No generic patch, script, expression, executable payload, or unbounded operation language is accepted.
3. Expected Revision is a concurrency precondition, not a Product history identity.
4. A stale command changes neither state nor success Evidence.
5. An accepted transition and required Activity Event commit atomically.
6. Context, participation, review, approval, comparison selection, or UI mode creates no Capability.
7. A future multi-Resource transaction must preserve every constituent Resource invariant and authorization decision.
8. Secret values, credentials, tokens, and private provider configuration never enter command payloads or broad Evidence projections.

## Optional review or comparison

A future review workflow must first prove an independently owned Process that cannot be expressed through existing commands and ordinary collaboration. It cannot import alternate state lines, ancestry, convergence, or process-derived authority.

A future State Comparison is a derived read Projection over independently retained states. It owns no lifecycle, mutation, authority, or source truth.

## Removal test

Removing this candidate creates no executable gap. Current Resource commands, Expected Revision, State Transition, Current State, and Activity Event remain complete for accepted Page, Issue, and Discussion lifecycles.

Any future use case must enter through a new Product/Domain decision rather than reviving this historical envelope.
