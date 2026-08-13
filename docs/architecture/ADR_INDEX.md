# Architecture Decision Index

Use this file to locate decision history. Current architecture truth lives in [`README.md`](./README.md); individual ADRs explain why a decision was made and may contain historical paths or implementation vocabulary that later ADRs superseded.

| ADR | Current status | Current effect |
| --- | --- | --- |
| [ADR-001](./ADR-001-architecture-truth-boundaries.md) | Accepted | Defines architecture/source-of-truth boundaries. |
| [ADR-002](./ADR-002-executable-application-baseline.md) | Accepted baseline | Establishes the executable apps/packages baseline; read later ADRs for evolved routing and persistence details. |
| [ADR-003](./ADR-003-repository-workspace-parallel-composition.md) | Accepted composition; routing examples superseded by ADR-010 | Repository workspace remains one shared Parallel Route layout with `children`, `@navigation`, `@workspace`, `@context`, and `@activity`. Historical UUID/Organization-prefixed route examples are not current URL truth. |
| [ADR-004](./ADR-004-authority-delegation-invariants.md) | Accepted | Separates operation capability from delegation authority and protects ownership continuity. |
| [ADR-005](./ADR-005-local-first-supabase-lifecycle.md) | Accepted | Separates schema truth, replayable migrations, provisioned environments, and applied-deployment evidence. |
| [ADR-006](./ADR-006-defer-destructive-container-deletion.md) | Accepted | Keeps Organization/Repository hard deletion unavailable until lifecycle semantics exist. |
| [ADR-007](./ADR-007-first-page-resource-vertical-slice.md) | Accepted; refined by ADR-009 | Defines the first Page collaboration slice; ADR-009 strengthens its write-command boundary. |
| [ADR-008](./ADR-008-repository-semantic-routing.md) | Historical; ownership/route identity superseded by ADR-010 | Preserved as evidence of the intermediate Organization-only semantic-route decision. Its `/app/{organizationSlug}/{repositorySlug}` route and mandatory Organization namespace are no longer current. Stable Repository UUID as authorization identity and `/pages` as concrete Page surface remain compatible with later decisions. |
| [ADR-009](./ADR-009-controlled-page-command-mutation-boundary.md) | Accepted | Requires command-specific invoker RPCs plus independent RLS for accepted Page writes. |
| [ADR-010](./ADR-010-repository-owner-namespace.md) | Accepted current ownership/routing identity | Makes `Repository Owner = User | Organization`, establishes a globally unambiguous owner namespace, makes `/{ownerSlug}/{repositorySlug}` canonical, removes inactive `organization` visibility semantics, and makes ownership-derived authorization owner-neutral. |

## Reading rule

- For **what the architecture is now**, read [`README.md`](./README.md) and executable contracts first.
- For **why a current rule exists**, start here, then open only the relevant ADR.
- Historical ADR examples may intentionally preserve earlier paths/assumptions. When they conflict with a later Accepted ADR or current architecture README, the later/current contract wins.
- Do not merge superseded and current representations into a hybrid model.
