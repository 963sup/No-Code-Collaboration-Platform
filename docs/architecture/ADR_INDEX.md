# Architecture Decision Index

Use this file to locate decision history. Current architecture truth lives in [`README.md`](./README.md); individual ADRs explain why a decision was made and may contain historical paths or implementation vocabulary that later ADRs superseded.

| ADR | Current status | Current effect |
| --- | --- | --- |
| [ADR-001](./ADR-001-architecture-truth-boundaries.md) | Accepted | Defines architecture/source-of-truth boundaries. |
| [ADR-002](./ADR-002-executable-application-baseline.md) | Accepted baseline | Establishes the executable apps/packages baseline; read later ADRs for evolved routing and persistence details. |
| [ADR-003](./ADR-003-repository-workspace-parallel-composition.md) | Accepted composition; partially superseded by ADR-008 | The Repository workspace remains a shared Next.js Parallel Route layout with `children`, `@navigation`, `@workspace`, `@context`, and `@activity`. Its original UUID route identity and `/resources` examples are historical; ADR-008 owns the current semantic namespace and `/pages` vocabulary. |
| [ADR-004](./ADR-004-authority-delegation-invariants.md) | Accepted | Separates operation capability from delegation authority and protects ownership continuity. |
| [ADR-005](./ADR-005-local-first-supabase-lifecycle.md) | Accepted | Separates schema truth, replayable migrations, provisioned environments, and applied-deployment evidence. |
| [ADR-006](./ADR-006-defer-destructive-container-deletion.md) | Accepted | Keeps Organization/Repository hard deletion unavailable until lifecycle semantics exist. |
| [ADR-007](./ADR-007-first-page-resource-vertical-slice.md) | Accepted; refined by ADR-009 | Defines the first Page collaboration slice; ADR-009 strengthens its write-command boundary. |
| [ADR-008](./ADR-008-repository-semantic-routing.md) | Accepted current route identity | Makes `/app/{organizationSlug}/{repositorySlug}` canonical, keeps UUIDs as authorization identity, and makes `/pages` the first concrete child surface. |
| [ADR-009](./ADR-009-controlled-page-command-mutation-boundary.md) | Accepted | Requires command-specific invoker RPCs plus independent RLS for accepted Page writes. |

## Reading rule

- For **what the architecture is now**, read [`README.md`](./README.md) and executable contracts first.
- For **why a current rule exists**, start here, then open only the relevant ADR.
- When an ADR's historical example conflicts with a later accepted ADR or current architecture README, the later/current contract wins; do not merge both representations into a new design.
