# Architecture Decision Index

Use this file to locate decision history. Current architecture truth lives in [`README.md`](./README.md); ADRs explain why decisions exist or were replaced.

| ADR | Current status | Current effect |
| --- | --- | --- |
| [ADR-001](./ADR-001-architecture-truth-boundaries.md) | Accepted | Defines architecture/source-of-truth boundaries. |
| [ADR-002](./ADR-002-executable-application-baseline.md) | Accepted baseline | Establishes the executable apps/packages baseline; later ADRs own evolved routing and persistence details. |
| [ADR-003](./ADR-003-repository-workspace-parallel-composition.md) | Superseded | Former persistent multi-surface Repository composition is no longer current. Repository presentation is now one Owner/Repository header, primary navigation, and one active content surface. |
| [ADR-004](./ADR-004-authority-delegation-invariants.md) | Accepted | Separates operation Capability from delegation authority and protects ownership continuity. |
| [ADR-005](./ADR-005-local-first-supabase-lifecycle.md) | Accepted | Separates schema truth, replayable migrations, provisioned environments, and applied-deployment evidence. |
| [ADR-006](./ADR-006-defer-destructive-container-deletion.md) | Accepted | Keeps Organization/Repository destructive lifecycle unavailable until lifecycle semantics exist. |
| [ADR-007](./ADR-007-first-page-resource-vertical-slice.md) | Accepted; refined by ADR-009 | Defines the first Page collaboration slice; ADR-009 strengthens its write-command boundary. |
| [ADR-008](./ADR-008-repository-semantic-routing.md) | Historical; superseded by ADR-010 | Records the intermediate Organization-only Repository routing model. It is not current ownership or URL truth. |
| [ADR-009](./ADR-009-controlled-page-command-mutation-boundary.md) | Accepted | Requires command-specific invoker RPCs plus independent RLS for accepted Page writes. |
| [ADR-010](./ADR-010-repository-owner-namespace.md) | Accepted current ownership/routing identity | Makes `Repository Owner = User | Organization`, establishes one global Owner namespace, makes `/{ownerSlug}/{repositorySlug}` canonical, uses `private | public` visibility, and makes ownership-derived authorization owner-neutral. |

## Reading rule

- For **what the architecture is now**, read [`README.md`](./README.md), current Product/Domain contracts, and executable contracts first.
- For **why a current rule exists**, start here and open only the relevant Accepted ADR.
- A Superseded or Historical ADR cannot define current Product, Domain, URL, UI, or persistence truth.
- Do not combine obsolete and current representations into a hybrid model.
