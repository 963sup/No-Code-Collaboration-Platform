# AI Truth Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce always-on AI context and eliminate duplicate legacy Repository representations without changing accepted product behavior.

**Architecture:** Current truth is routed through compact repository instructions, current Open/Contained gaps, and executable contracts. Closed gap evidence moves to a history archive. Legacy UUID Repository paths become one access-aware optional catch-all redirect into the canonical semantic Repository workspace.

**Tech Stack:** Next.js App Router, TypeScript, Node.js repository contract checkers, Playwright, GitHub Actions, Supabase local contracts.

## Global Constraints

- Do not rewrite existing `main` history or existing Supabase migrations.
- Do not change Product, Domain, authorization, RLS, or database schema semantics.
- Preserve compatibility for `/app/repositories/{repositoryId}`, `/resources`, and `/resources/{pageId}` through access-aware redirects.
- Keep `GAP-IDENTITY-001` Open and preserve exact closure evidence for `GAP-AUTH-001`, `GAP-LIFECYCLE-001`, `GAP-LIFECYCLE-002`, and `GAP-PAGE-001`.
- Do not mutate hosted Supabase state; no hosted Supabase project is currently connected.
- Keep `main` untouched; implementation occurs on `refactor/consolidate-ai-truth` and merge requires separate user intent.

---

### Task 1: Make consolidation machine-verifiable

**Files:**
- Modify: `tooling/check-architecture.mjs`
- Modify: `tooling/check-instruction-scopes.mjs`
- Modify: `tooling/check-documentation-contracts.mjs`

**Interfaces:**
- Consumes: existing canonical semantic Repository route, documentation hierarchy, and Node-based contract checker entry points.
- Produces: executable guards for one legacy compatibility route, compact Web instruction invariants, and separation of current versus closed gaps.

- [ ] **Step 1: Replace the three-file legacy route contract with one compatibility-route contract**

Require `apps/web/src/app/(app)/app/repositories/[repositoryId]/[[...legacyPath]]/page.tsx`, require access-aware Repository resolution plus canonical redirect helpers, and reject legacy layout/slot/query implementations.

- [ ] **Step 2: Remove the obsolete legacy-route instruction scope**

Delete `apps/web/src/app/(app)/app/repositories/[repositoryId]/AGENTS.md` from required instruction scopes and instead require `apps/web/AGENTS.md` to state the canonical semantic namespace, compatibility-only UUID namespace, Web-to-Application boundary, and Authentication/Authorization separation.

- [ ] **Step 3: Make the current gap register current-only**

Require `GAP-IDENTITY-001` to remain Open in `docs/IMPLEMENTATION_GAPS.md`; forbid full Closed gap entries there; require the four closed gap sections and their exact closure evidence in `docs/history/CLOSED_GAPS.md`.

- [ ] **Step 4: Run the narrow contract checks**

Run: `pnpm codex:check && pnpm architecture:check`

Expected: checks fail until Tasks 2–4 implement the new contracts, then pass.

### Task 2: Compress always-on AI instructions

**Files:**
- Modify: `AGENTS.md`
- Modify: `apps/web/AGENTS.md`

**Interfaces:**
- Consumes: `docs/README.md` truth routing and existing architecture boundaries.
- Produces: small always-on invariants; detailed framework behavior remains query-time documentation rather than permanent repository context.

- [ ] **Step 1: Compress root instructions to durable invariants**

Retain Product identity, architecture dependency direction, truth-source order, instruction layering, external-mutation safety, three review blockers, and verification entry points. Remove duplicated framework/tool explanations.

- [ ] **Step 2: Compress Web instructions to scope deltas**

Retain Delivery-only ownership, App Router presentation semantics, thin delivery adapters, provider isolation, Authn/Authz separation, semantic Repository route authority, compatibility-only legacy UUID routing, import-alias prohibition, and verification requirements.

- [ ] **Step 3: Verify instruction contracts**

Run: `pnpm codex:check`

Expected: PASS with the reduced instruction corpus.

### Task 3: Separate current gaps from historical closure evidence

**Files:**
- Modify: `docs/IMPLEMENTATION_GAPS.md`
- Create: `docs/history/CLOSED_GAPS.md`
- Modify: `docs/README.md`

**Interfaces:**
- Consumes: current `GAP-IDENTITY-001` and exact historical closure evidence already recorded in the register.
- Produces: one current gap register and one historical closure archive, with the documentation router selecting the correct source by question.

- [ ] **Step 1: Keep only Open/Contained gap detail in the current register**

Preserve the full current `GAP-IDENTITY-001`, status model, and closure protocol. Replace full closed entries with a concise archive index.

- [ ] **Step 2: Move four closed gap sections to the historical archive**

Preserve exact closing commit, PR, CI run, migration, test, and remote-boundary evidence. Adjust relative documentation links after moving the content under `docs/history/`.

- [ ] **Step 3: Update documentation routing**

State explicitly that current implementation mismatch questions use `IMPLEMENTATION_GAPS.md`, while closed-gap archaeology uses `history/CLOSED_GAPS.md`, ADRs, PRs, and commits.

- [ ] **Step 4: Verify documentation contracts**

Run: `node tooling/check-documentation-contracts.mjs`

Expected: PASS with one current Open gap and four archived Closed gaps.

### Task 4: Collapse the legacy Repository UI tree into one redirect adapter

**Files:**
- Create: `apps/web/src/app/(app)/app/repositories/[repositoryId]/[[...legacyPath]]/page.tsx`
- Delete: legacy `@activity`, `@context`, `@navigation`, `@workspace`, `_queries`, local layout/default/not-found files, and the obsolete local `AGENTS.md`
- Preserve: `apps/web/e2e/page-collaboration.spec.ts`

**Interfaces:**
- Consumes: `GetAccessibleRepositoryRouteById`, `repositoryPath`, `repositoryPagesPath`, `repositoryPagePath`.
- Produces: one compatibility adapter for the three already-supported UUID route shapes.

- [ ] **Step 1: Implement one optional catch-all Server Component**

Validate `repositoryId`, resolve an accessible semantic Repository route before disclosing canonical slugs, accept only no suffix, `resources`, or `resources/{pageId}`, validate Page UUID when present, and call `notFound()` for all other suffixes.

- [ ] **Step 2: Delete the obsolete legacy presentation tree**

After the catch-all exists, remove every legacy presentation slot, query, layout, fallback, local not-found page, and route-specific instruction file so the namespace cannot appear to be a second Repository workspace.

- [ ] **Step 3: Preserve existing browser compatibility evidence**

Do not weaken the Playwright flow that navigates all three legacy URLs and asserts canonical semantic URLs.

- [ ] **Step 4: Run Web and architecture verification**

Run: `pnpm architecture:check && pnpm typecheck && pnpm test && pnpm build && pnpm knip`

Expected: PASS and no duplicate legacy Repository UI implementation remains.

### Task 5: Review and merge-gate verification

**Files:**
- Review: complete branch diff against `main`
- Verify: `.github/workflows/verify.yml`

**Interfaces:**
- Consumes: final consolidation diff.
- Produces: evidence that the change reduces context/representation without widening security boundaries or changing database behavior.

- [ ] **Step 1: Review the final diff for scope**

Confirm no Supabase schema, migration, RLS, Domain capability, Application authorization, dependencies, or product features changed.

- [ ] **Step 2: Perform a security diff review**

Trace the legacy UUID request through UUID validation, access-aware route resolution, and redirect. Reject any implementation that exposes semantic slugs before authorization or introduces privileged provider access.

- [ ] **Step 3: Open one draft PR to trigger GitHub Actions**

The PR targets `main` from `refactor/consolidate-ai-truth`. Do not merge it.

- [ ] **Step 4: Require all merge gates**

Expected GitHub Actions jobs: Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts. Vercel preview evidence is supplemental and does not replace repository or Supabase contracts.
