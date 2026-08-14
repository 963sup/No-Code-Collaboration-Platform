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

### GAP-OWNERSHIP-001 — Repository ownership correction is implemented across current contracts, but creation and exact-head projection/verification evidence remain incomplete

- Status: Open
- Affected contracts: [`PRODUCT.md`](./PRODUCT.md), [`ONTOLOGY.md`](./ONTOLOGY.md), [`domains/repository-collaboration.md`](./domains/repository-collaboration.md), [`domains/access-authority.md`](./domains/access-authority.md), [`architecture/README.md`](./architecture/README.md), [ADR-010](./architecture/ADR-010-repository-owner-namespace.md)
- Affected invariants: `Repository Owner = User | Organization`, owner-neutral authorization, globally unambiguous Owner namespace, canonical `/{owner}/{repository}` routing, visibility vocabulary
- Risk class: incomplete ownership capability and incomplete exact-head evidence

#### Direct evidence

Current branch now implements the corrected target through these concrete projections:

- `packages/domain/src/repository/ownership.ts` defines typed User/Organization Repository Owner.
- `packages/domain/src/repository/repository.ts` exposes typed `owner` and `private | public` visibility with no Organization-only compatibility field.
- `packages/domain/src/access/authority.ts` resolves only `directRole + governanceRole`; the Organization-only authority fallback is removed.
- `packages/application/src/ports/repository-access-reader.ts` accepts stable `actorId + repositoryId`; the old Organization-specific authority Port is removed.
- `packages/infrastructure/supabase/src/access/supabase-repository-access-reader.ts` reads owner-neutral direct/governance sources.
- `supabase/schemas/30_repository.sql` models exactly one `owner_user_id XOR owner_organization_id`; the legacy `organization_id` ownership column is absent from current desired state.
- `supabase/schemas/91_repository_access_projection.sql` declares owner-neutral authority-source projection.
- `supabase/schemas/95_repository_routes.sql` resolves one global User/Organization Owner namespace.
- `supabase/schemas/99_rls.sql` has separate personal-owner and Organization-admin Repository creation policies and no Organization-only owner field.
- `supabase/migrations/20260814021000_remove_legacy_repository_organization_owner.sql` makes replayed final state drop the historical compatibility column.
- `apps/web/src/app/(repository)/[ownerSlug]/[repositorySlug]/**` is the only Repository UI tree; the obsolete Organization-only tree has been removed.
- `apps/web/src/routing/repository-routes.ts` builds canonical `/{owner}/{repository}` URLs; `/app` remains dashboard/discovery.
- `apps/web/e2e/page-collaboration.spec.ts` now clicks a Repository card from `/app`, lands on the canonical route, follows stable-ID compatibility redirects, and executes Page collaboration through the canonical path.
- pgTAP ownership contracts assert typed ownership, namespace collision rejection, personal/Organization authority separation, ordinary-Member non-authority, and absence of the legacy `repositories.organization_id` column.

Current incomplete evidence/capability:

- Human-facing Repository creation at `/new` is not implemented. Personal and Organization ownership can be represented/enforced by Domain/database contracts, but the Product does not yet expose one complete creation use case for both Owner kinds.
- Checked-in `packages/infrastructure/supabase/src/generated/database.types.ts` must be regenerated from the corrected replayed local database; it is a projection and cannot be hand-maintained as target truth.
- The same latest PR head has not yet produced successful Repository, Supabase, Browser, and deployment evidence after the full correction set.

#### Root cause

An early Organization-only executable shortcut was promoted into Product, Domain, authorization, persistence, and URL assumptions. Those assumptions then cited one another as evidence.

The earliest invalid boundaries have now been replaced. This gap remains Open only for missing creation capability and exact-head generated/runtime evidence; it must not continue describing the removed Organization-only implementation as current truth.

#### Predicted failure

Until closure:

- users cannot create a personal or Organization-owned Repository through the human Product UI;
- generated TypeScript database projections may lag the corrected desired/replayed schema; and
- ownership correction cannot be claimed exact-head verified across all CI/browser/deployment boundaries.

#### Temporary containment

- PR #27 remains Draft and must not be represented as production-ready while this gap is Open.
- No `/new` Repository creation capability is claimed as available.
- Unsupported creation paths fail closed because no incomplete Web/Application creation surface is exposed.
- Generated database types remain projections; stale checked-in output is treated as a verification failure, never as Product truth.

#### Closure evidence

Close only after the same exact PR head proves all of the following:

1. Domain models typed `RepositoryOwner = User | Organization` and `private | public` visibility.
2. Application authority lookup accepts `actorId + repositoryId` without caller-supplied Organization ownership.
3. Supabase desired state and replay history end with typed XOR Owner FKs plus one globally unambiguous User/Organization Owner namespace and no legacy ownership column.
4. Personal Owner derives Repository admin without fabricated Grant; Organization admin/owner derives admin only for Organization-owned Repository; ordinary member does not.
5. Route RPCs/adapters resolve `ownerSlug + repositorySlug` for both Owner kinds.
6. Web canonical Repository URL is `/{ownerSlug}/{repositorySlug}`; `/app` is dashboard only; stable-ID compatibility routes redirect safely; no Organization-only Repository UI tree remains.
7. `/new` supports personal ownership and authorized Organization ownership through explicit Application/Infrastructure contracts and RLS.
8. Playwright explicitly clicks a Repository card from `/app`, verifies canonical navigation, and completes accepted Page collaboration through that route.
9. pgTAP proves namespace collision rejection, typed ownership, creation/authorization matrix, legacy-column absence, and visibility semantics.
10. Generated DB types match the replayed desired schema, Repository verification succeeds, Supabase verification succeeds, Browser contracts succeed, and deployment status succeeds for the same latest head.

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
