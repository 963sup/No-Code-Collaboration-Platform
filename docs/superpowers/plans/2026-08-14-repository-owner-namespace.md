# Repository Owner Namespace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct PR #27 so User and Organization are first-class Repository owners, canonical Repository URLs use `/{owner}/{repository}`, ownership-aware authorization is executable, and the `/app` Repository click path is covered by browser tests.

**Architecture:** Keep Repository as the only primary collaboration Container. Model Repository ownership as a typed XOR (`User | Organization`), use a concrete owner-namespace reservation to guarantee global URL-owner uniqueness, derive owner authority without fabricating Grants, and keep Web routing/provider concerns outside Domain/Application.

**Tech Stack:** TypeScript strict, Vitest, Next.js App Router, Supabase/PostgreSQL declarative schemas, RLS, pgTAP, Playwright, pnpm/Turborepo.

## Global Constraints

- Repository remains the primary No-Code Collaboration Container.
- `Repository Owner = User | Organization`.
- No polymorphic `owner_type + owner_id` persistence.
- No Team/Enterprise/Issue/Discussion/Workflow acceptance in this correction.
- Canonical Repository URL is `/{ownerSlug}/{repositorySlug}`.
- Capability remains the authorization decision primitive; ownership is an authority source, not a Grant row.
- Ordinary Organization Membership grants no Repository authority.
- Latest-head GitHub Actions and Vercel must pass before completion is claimed.

---

### Task 1: Failing semantic ownership contracts

**Files:**
- Create: `packages/domain/tests/repository.test.ts`
- Modify: `packages/application/tests/repository-route-queries.test.ts`
- Create: `supabase/tests/repository-ownership.test.sql`
- Modify: `apps/web/e2e/page-collaboration.spec.ts`

**Interfaces:**
- Produces desired `RepositoryOwner`, `ownerSlug` route key, `private|public` visibility, owner-namespace persistence, and `/app` card-click behavior.

- [ ] Write tests that require `RepositoryOwner = User | Organization` and exactly `private | public` visibility.
- [ ] Change semantic route tests from `organizationSlug` to `ownerSlug`.
- [ ] Add pgTAP assertion that `repository_owner_namespaces` exists.
- [ ] Add Playwright assertion that clicking an `/app` Repository card lands on `/{owner}/{repository}`.
- [ ] Run the PR Verify workflow and confirm the exact-head tests fail because these behaviors do not exist yet.

### Task 2: Canonical Product/Domain correction

**Files:**
- Modify: `docs/PRODUCT.md`
- Modify: `docs/ONTOLOGY.md`
- Modify: `docs/domains/repository-collaboration.md`
- Modify: `docs/domains/access-authority.md`
- Modify: `docs/architecture/README.md`
- Modify: `docs/architecture/ADR-008-repository-semantic-routing.md`
- Modify: `apps/web/AGENTS.md`
- Modify: `apps/web/src/app/AGENTS.md`
- Modify: `.agents/skills/github-product-semantics/SKILL.md`

**Interfaces:**
- Produces one non-conflicting Product truth: User/Organization ownership, owner-neutral authority, GitHub-style semantic URLs.

- [ ] Remove every statement that makes Organization ownership mandatory.
- [ ] Remove `Personal Repository namespace` from Deferred concepts.
- [ ] Define Owner as a separate Repository relationship/role with concrete User and Organization variants.
- [ ] Correct URL/IA contracts from `/app/[organizationSlug]/[repositorySlug]` to `/{ownerSlug}/{repositorySlug}`.
- [ ] State that GitHub URL/IA/UI conventions are preferred benchmark mechanisms unless they depend on Git/code semantics.

### Task 3: Domain and Application ownership model

**Files:**
- Modify: `packages/domain/src/repository/repository.ts`
- Modify: `packages/domain/src/access/authority.ts`
- Modify: `packages/domain/src/index.ts`
- Modify: `packages/domain/tests/authority.test.ts`
- Modify: `packages/application/src/ports/repository-authority-source-reader.ts`
- Modify: `packages/application/src/ports/repository-route-reader.ts`
- Create: `packages/application/src/ports/repository-writer.ts`
- Create: `packages/application/src/queries/list-repository-owner-choices.ts`
- Create: `packages/application/src/commands/create-repository.ts`
- Modify: `packages/application/src/commands/create-page.ts`
- Modify: `packages/application/src/commands/update-page.ts`
- Modify: `packages/application/src/index.ts`
- Add/modify corresponding Application tests.

**Interfaces:**
- `RepositoryOwner = { kind: 'user'; userId: string } | { kind: 'organization'; organizationId: string }`
- `RepositorySummary.owner: RepositoryOwner`
- `RepositoryRouteKey.ownerSlug: string`
- `RepositoryAuthoritySourceQuery = { actorId; repositoryId }`
- `RepositoryAuthoritySources` has direct Role plus owner/governance authority evidence.
- `CreateRepository` accepts one typed owner, slug/name/description/visibility.

- [ ] Implement owner union and visibility correction.
- [ ] Make effective authority owner-neutral.
- [ ] Remove caller-supplied `organizationId` from authority resolution.
- [ ] Add owner-choice query and Repository creation command with tests.

### Task 4: Supabase desired-state ownership and authorization

**Files:**
- Modify: `supabase/schemas/10_identity.sql`
- Modify: `supabase/schemas/20_organization.sql`
- Modify: `supabase/schemas/30_repository.sql`
- Modify: `supabase/schemas/90_private_functions.sql`
- Modify: `supabase/schemas/95_repository_routing.sql`
- Modify: `supabase/schemas/99_rls.sql`
- Modify: `supabase/seed.sql`
- Add a new reviewed migration under `supabase/migrations/`.
- Regenerate: `packages/infrastructure/supabase/src/generated/database.types.ts`

**Interfaces:**
- `profiles.username` required and format-validated.
- `repository_owner_namespaces` globally reserves User usernames and Organization slugs.
- `repositories.owner_user_id XOR owner_organization_id`.
- `repository_visibility = private | public`.
- SQL route RPCs return `owner_kind`, `owner_id`, `owner_slug`.
- Personal owner and Organization admin/owner contribute Repository admin authority.

- [ ] Add namespace reservation and typed owner constraints.
- [ ] Update triggers so Auth User and Organization lifecycle reserve/update owner namespace transactionally.
- [ ] Rewrite current Repository role calculation for both owner types.
- [ ] Rewrite route RPCs around `owner_slug`.
- [ ] Update RLS Repository insert policy for personal owner or permitted Organization owner.
- [ ] Update seed/test fixtures and regenerate DB types.
- [ ] Expand pgTAP tests for collision, ownership, authorization, visibility, and creation.

### Task 5: Supabase adapters

**Files:**
- Modify: `packages/infrastructure/supabase/src/mappers/supabase-repository-mapper.ts`
- Modify: `packages/infrastructure/supabase/src/repositories/supabase-repository-reader.ts`
- Modify: `packages/infrastructure/supabase/src/repositories/supabase-repository-route-reader.ts`
- Modify: `packages/infrastructure/supabase/src/access/supabase-repository-authority-source-reader.ts`
- Create: `packages/infrastructure/supabase/src/repositories/supabase-repository-writer.ts`
- Modify: `packages/infrastructure/supabase/src/server/create-supabase-server-adapters.ts`
- Modify: `packages/infrastructure/supabase/src/index.ts`
- Add/modify adapter tests.

- [ ] Map typed owners from DB rows/RPCs.
- [ ] Resolve authority by Repository ID without caller-supplied Organization.
- [ ] Implement Repository writer and owner-choice read projection.
- [ ] Verify no generated DB Row type leaks to Application/Domain.

### Task 6: Web route ownership and GitHub-style URLs

**Files:**
- Move: `apps/web/src/auth/auth-navigation.ts` → `apps/web/src/routing/auth-routes.ts`
- Move: `apps/web/src/app/auth/confirm/route.ts` → `apps/web/src/app/(auth)/auth/confirm/route.ts`
- Create: `apps/web/src/routing/route-params.ts`
- Modify: `apps/web/src/routing/repository-routes.ts`
- Move Repository workspace from `apps/web/src/app/(app)/app/[organizationSlug]/[repositorySlug]/**` to `apps/web/src/app/(app)/[ownerSlug]/[repositorySlug]/**` and update params/imports.
- Keep `apps/web/src/app/(app)/app/repositories/[repositoryId]/[[...legacyPath]]/page.tsx` as compatibility redirect.
- Modify: `apps/web/src/app/(app)/app/page.tsx`
- Create: `apps/web/src/app/(app)/new/page.tsx`
- Create: `apps/web/src/app/(app)/new/actions.ts`
- Modify Auth imports and `apps/web/src/proxy.ts` as required.

- [ ] Make Repository path builders owner-neutral and remove `/app` from canonical Repository identity.
- [ ] Add `/new` owner selector and creation form.
- [ ] Ensure Repository dashboard links navigate to canonical URLs.
- [ ] Preserve auth/protocol public URLs while removing duplicate top-level `src/auth` and `src/app/auth` ownership.

### Task 7: Browser and full-contract verification

**Files:**
- Modify: `apps/web/e2e/page-collaboration.spec.ts`
- Add focused Repository creation/routing browser coverage if needed.
- Modify PR description with exact latest-head evidence only after successful CI.

- [ ] Verify sign-up with username and email verification.
- [ ] Verify personal Repository creation through `/new` and canonical navigation.
- [ ] Verify Organization-owned creation with eligible owner choice.
- [ ] Verify `/app` card click.
- [ ] Verify legacy stable-ID redirects.
- [ ] Verify Page create/update/activity under `/{owner}/{repository}`.
- [ ] Verify `pnpm verify:fast`, Supabase contracts, Browser contracts, and full GitHub Actions `Verify` on latest head.
- [ ] Verify Vercel latest-head status.
- [ ] Keep PR Draft; do not mark ready or merge without separate instruction.