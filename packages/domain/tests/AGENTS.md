# Domain Test Scope

This directory proves canonical business invariants without frameworks or infrastructure.

## Inviolable invariants

- Authorization tests MUST include both legitimate controls and adversarial negative cases.
- Role-transition tests MUST cover the actor role, current target role, and proposed target role.
- Self-escalation, peer-role mutation, higher-role mutation, and empty/no-op transitions MUST be considered explicitly.
- A test that only confirms a role contains a capability is insufficient proof of delegation authority.
- Ownership-continuity tests MUST prove that zero remaining owners is invalid and one or more remaining owners is valid.
- Tests must exercise public Domain exports and remain deterministic, side-effect free, and provider neutral.
