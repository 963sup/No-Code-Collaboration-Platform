# Implementation Gap Register

- Status: Active current-gap register
- Register owner: Project maintainer until an explicit governance owner is assigned
- Last reviewed: 2026-08-14

## Purpose

This register records current observed differences between accepted or candidate target contracts and the executable baseline.

It contains detailed entries only for **Open** or **Contained** gaps. Closed and Superseded gap evidence is historical and lives in [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md), so historical failure states do not compete with current truth during normal development.

A gap is not permission to redefine the target model, postpone an invariant silently, or treat unsafe behavior as supported. It is a bounded statement of prediction error with explicit containment and closure evidence.

## Register rules

1. Every current gap has a stable identifier, status, affected contract, direct evidence, risk, containment, owner, and closure evidence.
2. Evidence must name exact code, schema, policy, test, provider observation, or incident. Inference must be labeled.
3. Open authorization or data-integrity gaps block production-validation claims for the affected capability.
4. Temporary containment must fail closed where identity, authority, ownership, or data integrity is uncertain.
5. A merged implementation does not close a gap by itself. Required tests/runtime evidence must pass for the exact change.
6. Once a gap is Closed or Superseded, move detailed evidence to `history/CLOSED_GAPS.md` and retain only an index entry here.
7. If a gap proves target contract wrong, update the earliest invalid Product/Domain/Architecture boundary rather than weakening executable enforcement silently.

## Status model

- **Open**: mismatch exists and closure evidence is incomplete.
- **Contained**: mismatch exists, but verified control prevents unsafe/supported claims.
- **Closed**: executable behavior and required evidence match target contract; detail belongs in history.
- **Superseded**: another gap/contract replaces the framing; detail belongs in history.

## Open gaps

### GAP-OWNERSHIP-001 — Repository implementation still assumes Organization-only ownership and Organization-prefixed canonical routing

- Status: Open
- Affected contracts: [`PRODUCT.md`](./PRODUCT.md), [`ONTOLOGY.md`](./ONTOLOGY.md), [`domains/repository-collaboration.md`](./domains/repository-collaboration.md), [`domains/access-authority.md`](./domains/access-authority.md), [`architecture/README.md`](./architecture/README.md), [ADR-010](./architecture/ADR-010-repository-owner-namespace.md)
- Affected invariants: `Repository Owner = User | Organization`, owner-neutral authorization, globally unambiguous owner namespace, canonical `/{owner}/{repository}` routing, visibility vocabulary
- Risk class: Product-semantic drift, inaccessible personal ownership, authorization coupling, routing/UX mismatch

#### Direct evidence

- `supabase/schemas/30_repository.sql` currently requires `organization_id NOT NULL`, so a User cannot own a Repository directly.
- `packages/domain/src/repository/repository.ts` currently stores `organizationId` in every `RepositorySummary` and exposes `organization` visibility.
- `packages/application/src/ports/repository-authority-source-reader.ts` currently requires callers to provide `organizationId`, so Application authorization assumes the ownership answer instead of resolving it from Repository facts.
- `packages/infrastructure/supabase/src/access/supabase-repository-authority-source-reader.ts` currently reads Organization Membership for every Repository before combining a direct User Grant.
- `private.current_repository_role()` in `supabase/schemas/90_private_functions.sql` currently derives governance authority only through `repositories.organization_id`.
- `supabase/schemas/95_repository_routing.sql` currently resolves `organization_slug + repository_slug` rather than a User-or-Organization owner namespace.
- `apps/web/src/routing/repository-routes.ts` and the Repository route tree currently make `/app/{organizationSlug}/{repositorySlug}` the semantic Repository URL.
- `apps/web/e2e/page-collaboration.spec.ts` previously tested Page collaboration and UUID redirects but did not assert the `/app` Repository-card click journey. A new failing browser contract now requires `/app → click Repository → /{owner}/{repository}`.
- `repository_visibility` currently contains `organization`, while `private.can_view_repository()` gives special baseline access only to `public`; ordinary Organization Membership does not implement an Organization visibility baseline.
- GitHub Actions Verify run #189 on RED head `9d12b9b3c33cde89c842e61f064e2de911eb94db` fails `Repository contracts → Verify repository` because the new Domain test requires a missing `RepositoryOwner` type. This is intentional reproduction evidence.

#### Root cause

An implementation shortcut—Organization-only Repository ownership—was promoted from an early executable assumption into Product/Domain/URL invariants. Downstream schema, authorization, routes, and docs then cited one another, creating circular evidence.

The Product, Ontology, Repository Collaboration, Access Authority, current Architecture contract, and ADR index have been corrected first so the executable projection has one unambiguous target.

#### Predicted failure

Until executable closure:

- Users cannot create/own personal Repositories;
- Repository routing cannot resolve a User owner namespace;
- Page commands remain coupled to a caller-supplied Organization ID;
- personal-owner authority cannot be expressed without fabricating an Organization or Grant;
- `/app` dashboard URLs leak an implementation prefix and Organization-only assumption into Repository identity;
- `organization` visibility may be mistaken for an effective-access rule that does not exist.

#### Temporary containment

- PR #27 remains Draft and must not be represented as a production-ready ownership correction while this gap is Open.
- Canonical docs explicitly label the current Organization-only executable shape as a mismatch, not target truth.
- No User-owned Repository capability is claimed as executable until schema/Application/Web/browser evidence is complete.
- Existing authorization still fails closed for unsupported personal ownership because no such rows can currently exist.

#### Closure evidence

Close only after the same exact PR head proves all of the following:

1. Domain models typed `RepositoryOwner = User | Organization` and `private | public` visibility.
2. Application authorization source lookup accepts `actorId + repositoryId` without caller-supplied Organization ownership.
3. Supabase desired state and reviewed migration implement typed XOR owner FKs plus globally unambiguous User/Organization owner namespace.
4. Personal owner derives Repository admin without fabricated Grant; Organization admin/owner derives admin only for Organization-owned Repository; ordinary member does not.
5. Route RPCs and adapters resolve `ownerSlug + repositorySlug` for both owner kinds.
6. Web canonical Repository URL is `/{ownerSlug}/{repositorySlug}`; `/app` is dashboard only; legacy stable-ID routes redirect safely.
7. `/new` supports personal ownership and authorized Organization ownership without bypassing Application/RLS rules.
8. Playwright explicitly clicks a Repository card from `/app`, verifies canonical navigation, and completes Page create/update/activity on that route.
9. pgTAP proves owner-namespace collision rejection, typed ownership, authorization matrix, and visibility semantics.
10. Generated DB types match desired schema, repository verification succeeds, Supabase verification succeeds, Browser contracts succeed, and Vercel succeeds for the same latest head.

### GAP-IDENTITY-001 — Identity lifecycle remains incomplete after verified Session and recovery establishment

- Status: Open
- Affected contract: [`domains/identity-lifecycle.md`](./domains/identity-lifecycle.md)
- Affected invariants: Product Actor readiness, invitation continuity, credential/session security, and production provider evidence
- Risk class: Incomplete product entry, identity governance, and operational readiness

#### Direct evidence

- The executable slice implements password registration, email verification, ordinary Session establishment, current-Session sign-out, Profile creation through the existing `auth.users` trigger, password-recovery request, provider recovery proof, Recovery Session discrimination, and password reset.
- Recovery is intentionally single-purpose: `GetCurrentIdentity` excludes signed Sessions whose `amr` contains `recovery`; `/reset-password` requires recovery evidence; an ordinary password Session cannot use recovery reset; recovery creates no Membership, Grant, Capability, or Activity facts.
- `apps/web/e2e/auth.spec.ts` carries a local Mailpit path from registration/verification through recovery proof, recovery-only routing, reset, fresh ordinary sign-in, and rejection of ordinary Sessions from recovery page.
- No Application use case or human-facing route currently implements Product Actor readiness, onboarding, Organization invitation acceptance, email change, MFA, Session listing, selective revocation UI, or enterprise identity policy.
- Repository contains local Auth configuration/templates/Mailpit browser contracts, but no hosted Supabase project evidence. Production Auth redirect, SMTP, CAPTCHA, notification, and Session settings are unverified.
- Open registration intentionally creates no Organization Membership or Repository Grant.

#### Predicted failure

A User can establish/recover the current local email/password credential flow, but cannot complete Product Actor onboarding, accept an Organization invitation, or manage stronger account-security lifecycle operations through the product. Local success may not match hosted Auth delivery/security behavior.

#### Temporary containment

- Recovery is exposed only through the accepted single-purpose Recovery Session path; a recovery-authenticated request is not accepted as ordinary `/app` identity.
- Unsupported onboarding, invitation, MFA, OAuth, SSO, Session-management, and broader account-security behavior is not described as available.
- Registration/recovery do not create collaboration authority; authenticated Users without persisted authority remain unauthorized by RLS.
- Production identity readiness remains blocked until hosted configuration/delivery are directly verified.

#### Closure evidence

Close only after:

1. password recovery/reset are exact-head verified without account enumeration, ordinary-Session bypass, or Recovery-Session product access;
2. Product Actor readiness/onboarding have one authoritative state model;
3. Organization invitations survive sign-in/registration/verification/recovery without implicit invalid Membership;
4. credential/Session security operations have explicit scope/reauthentication rules;
5. hosted Supabase redirect, SMTP, abuse-protection, template, notification, and Session settings are verified; and
6. Application, adapter, browser, provider, and operational tests produce consistent evidence.

## Closed gap index

- `GAP-PAGE-001` — Closed by PR #23; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-page-001--generic-data-api-mutation-bypassed-accepted-page-commands).
- `GAP-LIFECYCLE-002` — Closed by PR #22; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-lifecycle-002--resource-destructive-lifecycle-was-not-accepted).
- `GAP-LIFECYCLE-001` — Closed by PR #16; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-lifecycle-001--destructive-organization-and-repository-lifecycle-was-not-accepted).
- `GAP-AUTH-001` — Closed by PR #13; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-auth-001--authority-mutation-conflated-operation-capability-and-delegation-authority).

## Closure protocol

1. Reproduce mismatch with minimum discriminating test.
2. Fix earliest invalid target/executable boundary.
3. Add regression evidence at every independently permissive enforcement layer.
4. Record closing commit/PR/CI/migration/operational evidence when applicable.
5. Change status only after evidence review, then move detailed entry to historical archive.
