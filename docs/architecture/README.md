# Architecture

## Purpose

This directory holds the target architecture for a platform that reverse-engineers mature GitHub product semantics and rebuilds them from first principles, with Repository defined as a no-code collaboration container.

## Current invariants

1. `Repository` is a collaborative resource boundary, not a Git code store.
2. Actor, principal, context, resource, ownership, membership, and authorization are distinct concepts.
3. A UI-selected context may filter or explain access, but it must not alter server-side authorization facts.
4. GitHub behavior is benchmark evidence, not the target contract.
5. Generated diagrams and implementation snapshots cannot override an accepted semantic contract.
6. No bounded context, service, datastore, or integration exists until its necessity and ownership are demonstrated.

## Decision process

Use [`ADR_TEMPLATE.md`](./ADR_TEMPLATE.md) for decisions that change system boundaries, ownership, authorization, persistence, public contracts, or irreversible technology choices.

An accepted ADR must state the decision, evidence, constraints, assumptions, alternatives, consequences, falsification conditions, and validation plan. An ADR records why the model changed; it does not replace the canonical target contract that the decision updates.

## Current status

No final bounded-context map or implementation architecture is declared yet. Preserve this explicit unknown rather than inventing structure prematurely.
