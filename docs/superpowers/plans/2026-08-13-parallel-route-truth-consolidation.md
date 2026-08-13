# Parallel Route Truth Consolidation Implementation Plan

> **For agentic workers:** preserve the accepted Next.js Parallel Route architecture. This plan changes architecture routing/documentation and machine guards only; it does not flatten the Repository workspace or change database behavior.

**Goal:** Make the semantic Repository Parallel Route structure the unambiguous current Web architecture while preserving ADR history.

**Architecture:** Current truth lives in `docs/architecture/README.md`, `docs/architecture/ADR_INDEX.md`, scoped App Router instructions, and executable route/checker contracts. ADR-003 remains historical evidence for the composition decision; ADR-008 owns the later semantic route identity.

**Tech Stack:** Next.js 16.3 App Router, Parallel Routes, TypeScript, Node contract checkers, Supabase local contracts, GitHub Actions.

## Global constraints

- Preserve `children + @navigation + @workspace + @context + @activity`.
- Preserve meaningful `default.tsx` recovery for persistent slots.
- Keep `/app/[organizationSlug]/[repositorySlug]` canonical.
- Keep `/app/repositories/[repositoryId]/**` compatibility-only.
- Do not change Domain, Application authorization, Supabase schema/RLS/migrations, dependencies, or product features.
- Keep PR #25 Draft; do not merge.

### Task 1: Route ADR history explicitly

**Files:**
- Create: `docs/architecture/ADR_INDEX.md`
- Modify: `docs/architecture/ADR-003-repository-workspace-parallel-composition.md`
- Modify: `docs/architecture/README.md`
- Modify: `docs/README.md`

- [ ] Add a compact ADR status table distinguishing current effects from superseded historical details.
- [ ] Mark ADR-003 as accepted for Parallel Route composition but partially superseded by ADR-008 for URL identity and `/resources` vocabulary.
- [ ] Add one canonical Parallel Route tree to architecture README.
- [ ] Route historical “why” questions through ADR index before individual ADRs.

### Task 2: Make the Parallel Route structure an instruction invariant

**Files:**
- Modify: `apps/web/src/app/AGENTS.md`
- Modify: `tooling/check-instruction-scopes.mjs`

- [ ] State the canonical semantic Repository route and exact four named slots.
- [ ] State that soft navigation may update one workspace surface while persistent sibling slots remain part of the same Repository shell.
- [ ] State that hard navigation must reconstruct unmatched persistent slots through meaningful defaults.
- [ ] Require these invariants in the instruction checker.

### Task 3: Make ADR/current-truth separation machine-verifiable

**Files:**
- Modify: `tooling/check-documentation-contracts.mjs`

- [ ] Require `docs/architecture/ADR_INDEX.md`.
- [ ] Require ADR-003 to reference ADR-008 as the route-identity superseding decision.
- [ ] Require architecture README to name the canonical semantic route and all four Parallel Route slots.
- [ ] Preserve all existing product, gap, Supabase, and operations documentation checks.

### Task 4: Verify the existing executable Parallel Route architecture remains unchanged

**Files:**
- Review only: `apps/web/src/app/(app)/app/[organizationSlug]/[repositorySlug]/**`
- Review only: `tooling/check-architecture.mjs`
- Review only: `apps/web/e2e/*.spec.ts`

- [ ] Confirm no canonical route source file is removed or behaviorally modified.
- [ ] Confirm architecture checker still requires layout, persistent defaults, `/pages`, Page detail, actions, activity, and redirect-only legacy namespace.
- [ ] Confirm no Supabase schema/migration diff exists.

### Task 5: Security and exact-head verification

- [ ] Review the diff for authorization or namespace-disclosure changes; expected result is no changed authorization data flow.
- [ ] Run the existing GitHub Actions Verify workflow on the updated PR head.
- [ ] Require Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts to pass.
- [ ] Treat Vercel preview as supplemental evidence only; if the Vercel connector remains unavailable, use the GitHub Vercel commit status without mutating deployment configuration.
