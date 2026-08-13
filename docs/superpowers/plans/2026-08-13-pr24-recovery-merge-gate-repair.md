# PR #24 Recovery Merge-Gate Repair Implementation Plan

> **For agentic workers:** Use the Superpowers execution/TDD workflow task by task. This document records both completed repair steps and the remaining exact-head verification gates.

**Goal:** Restore truthful exact-head verification for PR #24 and prove the password-recovery lifecycle without expanding the open Identity gap.

**Architecture:** Keep Application provider-neutral. Use Supabase's provider-native PKCE recovery FlowState to establish signed recovery authority, preserve Human-action/scanner resistance at delivery, and verify authority again at the password mutation boundary.

**Tech Stack:** TypeScript, Next.js App Router/Server Actions, Supabase CLI 2.111.0/Auth, Playwright 1.62.1, oxfmt 0.42.0, GitHub Actions.

## Global constraints

- `packages/domain` remains provider-free business truth.
- `packages/application` remains provider-neutral and does not depend on Next.js or Supabase SDKs.
- Supabase-specific behavior remains in `packages/infrastructure/supabase` and composition.
- Server Actions revalidate authentication/authorization at the mutation boundary.
- `pnpm` is the only JavaScript package manager.
- `oxfmt` is the only formatter and `oxlint` the general JS/TS linter.
- `GAP-IDENTITY-001` remains Open after this slice.
- Do not add MFA, onboarding, invitation acceptance, Session-management UI, or hosted-provider claims.
- No merge to `main` is authorized by this plan.

---

### Task 1: Expose hidden Browser evidence — completed

**Files:**
- `apps/web/src/app/(auth)/recover-password/page.tsx`
- `apps/web/src/app/(auth)/recover-password/recovery-confirmation-form.tsx`
- design/plan documents

- [x] Fix the `oxfmt` blocker in `recover-password/page.tsx`.
- [x] Replace unsupported `<Button asChild>` usage with the repository's existing `Link + buttonVariants + cn` pattern.
- [x] Re-run exact-head CI until Repository contracts reached the Browser gate.

**Observed result:** Repository contracts became green and Browser contracts exposed a real authorization defect rather than a formatting/build symptom.

### Task 2: Correct the Recovery Session provider primitive — completed

**Files:**
- `packages/infrastructure/supabase/src/identity/supabase-identity-provider.ts`
- `packages/infrastructure/supabase/src/server/create-supabase-server-adapters.ts`
- `packages/infrastructure/supabase/tests/supabase-identity-provider.test.ts`

- [x] Trace Browser failure from `/app` reachability through `GetCurrentIdentity` to signed `amr` claims.
- [x] Verify against current Supabase Auth source that POST `verifyOtp(type='recovery')` creates an `otp` Session rather than preserving recovery FlowState authority.
- [x] Verify that Supabase PKCE recovery records `authentication_method=recovery` in FlowState and exchanges an auth code into a Session using that method.
- [x] Reject non-`pkce_` recovery proofs before provider exchange.
- [x] On explicit Human POST, call the provider GET verify endpoint with redirects disabled, extract the provider auth code, then call `exchangeCodeForSession`.
- [x] Require signed `amr=recovery` after exchange; if absent, remove the local Session and fail closed.
- [x] Keep `ResetPassword` revalidation immediately before `updateUser({ password })`.
- [x] Update canonical Supabase adapter tests for PKCE exchange and non-PKCE fail-closed behavior.

**Observed result:** Repository contracts and Supabase contracts pass. Browser contracts now pass scanner resistance, Human proof exchange, Recovery Session creation, and `/app` isolation, then reach the password form.

### Task 3: Finish deterministic Browser evidence — in progress

**Files:**
- `apps/web/e2e/auth.spec.ts`

- [x] Verify the old 61-second fallback assumption against Supabase Auth source.
- [x] Establish that signup confirmation uses `ConfirmationSentAt` while password recovery uses `RecoverySentAt`; registration does not consume the first recovery-send window.
- [x] Remove the fixed 61-second recovery retry path without weakening local `max_frequency`.
- [x] Use exact Playwright labels for `New password` and `Confirm new password`.
- [x] Add a post-reset negative path: before fresh ordinary sign-in, `/reset-password` must fail closed to `/forgot-password?error=invalid-recovery-session`.
- [ ] Push the Browser evidence repair and obtain a green Browser contract on the exact head.

Expected final browser chain:

```text
register + verify
→ sign out ordinary Session
→ one recovery request
→ scanner GET cannot consume fragment proof
→ Human POST
→ provider PKCE recovery Session
→ /app denied
→ reset password
→ Recovery Session no longer reusable
→ fresh ordinary sign-in with new password
→ /app allowed
→ ordinary Session denied from recovery-only page
```

### Task 4: Synchronize PR evidence with executable truth — remaining

**Target:** GitHub PR #24 description.

- [ ] Remove obsolete `/auth/recovery` and HttpOnly staging-cookie claims.
- [ ] Remove the direct `verifyOtp(type='recovery')` implementation claim.
- [ ] Describe the actual recovery handoff:

```text
/recover-password#token_hash=pkce_<opaque proof>
→ fragment omitted from HTTP GET
→ browser reads and clears fragment
→ explicit Human POST
→ server asks Supabase to verify the PKCE recovery proof
→ provider returns auth code
→ exchangeCodeForSession
→ signed Recovery Session (`amr=recovery`)
```

- [ ] Keep the evidence boundary explicit: no hosted Supabase project is connected, so hosted SMTP, redirect allowlists, abuse protection, notifications, and Session policy remain unverified.
- [ ] Keep `GAP-IDENTITY-001` Open for onboarding, invitations, MFA, Session management, and hosted-provider evidence.

### Task 5: Final security and merge-gate verification — remaining

- [ ] Re-run diff-scoped source → control → sink review over the final diff.
- [ ] Check recovery proof exposure, scanner behavior, PKCE verifier/code exchange, signed `amr=recovery`, password mutation, Session cleanup, redirect handling, account enumeration, and Product Actor isolation.
- [ ] Verify dependency assumptions against current Context7/Supabase documentation/source.
- [ ] Confirm the final exact head has Workflow guardrails, Repository contracts, Supabase contracts, Browser contracts, and Vercel all green.
- [ ] Keep PR Draft unless separately authorized to mark Ready for review.
- [ ] Do not merge to `main` without separate merge authorization.
