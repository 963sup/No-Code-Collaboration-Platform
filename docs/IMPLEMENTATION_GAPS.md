# Implementation Gap Register

- Status: Active current-gap register
- Register owner: Project maintainer until an explicit governance owner is assigned
- Last reviewed: 2026-08-13

## Purpose

This register records current observed differences between accepted or candidate target contracts and the executable baseline.

It contains detailed entries only for **Open** or **Contained** gaps. Closed and Superseded gap evidence is historical and lives in [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md), so historical failure states do not compete with current truth during normal development.

A gap is not permission to redefine the target model, postpone an invariant silently, or treat unsafe behavior as supported. It is a bounded statement of prediction error with explicit containment and closure evidence.

## Register rules

1. Every current gap has a stable identifier, status, affected contract, direct evidence, risk, containment, owner, and closure evidence.
2. Evidence must name the exact code, schema, policy, test, provider observation, or incident. Inference must be labeled as inference.
3. Open authorization or data-integrity gaps block claims of production validation for the affected capability.
4. Temporary containment must fail closed where identity, authority, or data integrity is uncertain.
5. A merged implementation does not close a gap by itself. Required tests and runtime evidence must pass for the exact change.
6. Once a gap is Closed or Superseded, move its detailed evidence to `history/CLOSED_GAPS.md` and retain only an index entry here.
7. If a gap proves the target contract wrong, update the earliest invalid product, domain, or architecture boundary rather than weakening executable enforcement silently.

## Status model

- **Open**: the mismatch exists and closure evidence is incomplete.
- **Contained**: the mismatch still exists, but a verified control prevents the affected behavior from being treated as supported or production-safe.
- **Closed**: executable behavior and required evidence match the target contract; detail belongs in the historical archive.
- **Superseded**: another gap or contract replaces this framing; detail belongs in the historical archive.

## Open gaps

### GAP-IDENTITY-001 — Identity lifecycle remains incomplete after verified Session and recovery establishment

- Status: Open
- Affected contract: [`domains/identity-lifecycle.md`](./domains/identity-lifecycle.md)
- Affected invariants: Product Actor readiness, invitation continuity, credential/session security, and production provider evidence
- Risk class: Incomplete product entry, identity governance, and operational readiness

#### Direct evidence

- The executable slice implements password registration, email verification, ordinary Session establishment, current-Session sign-out, Profile creation through the existing `auth.users` trigger, password-recovery request, provider recovery proof, Recovery Session discrimination, and password reset.
- Recovery is intentionally single-purpose: `GetCurrentIdentity` excludes signed Sessions whose `amr` contains `recovery`; `/reset-password` requires recovery evidence; an ordinary password Session cannot use the recovery reset operation; and recovery does not create Membership, Grant, Capability, or Activity facts.
- `apps/web/e2e/auth.spec.ts` carries a local Mailpit discriminating path from registration and verification through recovery proof, recovery-only routing, password reset, fresh ordinary sign-in, and rejection of ordinary Sessions from the recovery page.
- No Application use case or human-facing route currently implements Product Actor readiness, onboarding, Organization invitation acceptance, email change, MFA, Session listing, selective revocation UI, or enterprise identity policy.
- The repository contains local Auth configuration, confirmation and recovery templates, and Mailpit browser contracts, but the connected Supabase tool reports no hosted project. Production Auth provider settings, redirect allowlists, SMTP, CAPTCHA, notification templates, and Session policies therefore have no direct environment evidence.
- Open registration intentionally creates no Organization membership or Repository Grant.

#### Predicted failure

A User can establish and recover the current local email/password credential flow, but cannot complete Product Actor onboarding, accept an Organization invitation, or manage stronger account-security lifecycle operations through the product. A local passing flow could also be incorrectly described as production-ready even when hosted Auth delivery, abuse protection, redirect behavior, or Session policy differs.

#### Temporary containment

- Recovery is exposed only through the accepted single-purpose Recovery Session path; a recovery-authenticated request is not accepted as ordinary `/app` identity.
- Unsupported onboarding, invitation, MFA, OAuth, SSO, Session-management, and broader account-security behavior is not described as available.
- Registration and recovery do not create collaboration authority; authenticated Users without persisted Memberships or Grants remain unauthorized by RLS.
- Production identity readiness remains blocked until hosted configuration and delivery are directly verified.

#### Closure evidence

Close this gap only after:

1. password recovery and reset are exact-head verified without account enumeration, ordinary-Session reset bypass, or Recovery-Session product access;
2. Product Actor readiness and onboarding have one authoritative state model;
3. Organization invitations survive sign-in, registration, verification, and recovery without implicitly granting invalid Memberships;
4. credential and Session security operations have explicit scope and reauthentication rules;
5. hosted Supabase redirect, SMTP, abuse-protection, template, notification, and Session settings are verified against the intended production project; and
6. Application, adapter, browser, provider, and operational tests produce consistent evidence.

## Closed gap index

Detailed closure evidence is historical and is intentionally excluded from the normal current-state context.

- `GAP-PAGE-001` — Closed by PR #23; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-page-001--generic-data-api-mutation-bypassed-accepted-page-commands).
- `GAP-LIFECYCLE-002` — Closed by PR #22; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-lifecycle-002--resource-destructive-lifecycle-was-not-accepted).
- `GAP-LIFECYCLE-001` — Closed by PR #16; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-lifecycle-001--destructive-organization-and-repository-lifecycle-was-not-accepted).
- `GAP-AUTH-001` — Closed by PR #13; see [`history/CLOSED_GAPS.md`](./history/CLOSED_GAPS.md#gap-auth-001--authority-mutation-conflated-operation-capability-and-delegation-authority).

## Closure protocol

1. Reproduce the mismatch with the minimum discriminating test.
2. Fix the earliest invalid target or executable boundary.
3. Add regression evidence at every enforcement layer that could independently permit the failure.
4. Record the closing commit, pull request, CI run, migration identifiers when applicable, and operational evidence.
5. Change the status only after the evidence is reviewed, then move the detailed entry to the historical archive.
