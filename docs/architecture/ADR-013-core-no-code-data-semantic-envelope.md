# ADR-013: Core no-code data semantic envelope

- Status: Superseded by ADR-014
- Original date: 2026-08-15
- Superseded: 2026-08-16

## Historical context

This decision attempted to resolve contradictory terminology by accepting a seven-part no-code data envelope derived from source-control and code-product benchmark concepts. It separated semantic acceptance from implementation and correctly preserved Repository authorization and no-execution constraints.

The decision nevertheless made an invalid first-principles leap:

```text
real need to change, compare, review, move, or copy data
≠
proof that source-control-shaped Product primitives are necessary
```

Renaming external mechanics with generic or Data-prefixed vocabulary preserved their mental model: history nodes, alternate state lines, comparison objects, proposal convergence, packaged payload Artifacts, and continuing source provenance.

## Superseding decision

[ADR-014](./ADR-014-current-state-collaboration-kernel.md) replaces this current Product conclusion with the minimum sufficient model:

- concrete Resource commands;
- optional Expected Revision concurrency precondition;
- accepted State Transition;
- authoritative Current State;
- separate Activity Event Evidence;
- optional derived State Comparison only after independent retention evidence;
- future typed transfer and Repository duplication only through separate admission.

## Historical value retained

The following constraints remain valid and are carried forward by ADR-014:

- Repository remains the only primary collaboration and authorization Container.
- Presentation, participation, approval, filters, and selected Context create no authority.
- Resource validation and authorization cannot be bypassed.
- Secrets, credentials, Sessions, and Grants cannot be copied as ordinary content.
- Arbitrary code, script, expression, CI/CD, and generic automation remain excluded.
- Product semantic acceptance never follows from benchmark naming alone.

## Current effect

None. This ADR is decision history only. It cannot define current Product, Domain, architecture, persistence, route, Capability, API, or UI truth.

Current readers must use `docs/PRODUCT.md`, `docs/ONTOLOGY.md`, [ADR-014](./ADR-014-current-state-collaboration-kernel.md), and `docs/architecture/README.md`.
