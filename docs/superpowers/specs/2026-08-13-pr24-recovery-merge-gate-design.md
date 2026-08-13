# PR #24 Recovery Merge-Gate Design

## Goal

Make PR #24 merge-safe by repairing the executable password-recovery evidence chain without expanding `GAP-IDENTITY-001` into onboarding, invitations, MFA, general Session management, or hosted-provider configuration.

## First-principles model

Password recovery restores one credential. It is not Product Actor authentication and must not create collaboration authority.

```text
Recovery request
→ provider creates PKCE recovery flow
→ opaque `pkce_` proof is delivered to the Human
→ GET-only scanners cannot send URL fragments to the application
→ Human explicitly submits the proof
→ Supabase verifies the proof and returns a PKCE auth code
→ server exchanges the auth code with the stored PKCE verifier
→ provider-signed Session contains `amr=recovery`
→ credential mutation revalidates recovery authority
→ Recovery authority terminates
→ fresh ordinary sign-in
→ Product Actor authority is evaluated independently
```

Every transition must have executable evidence. A route redirect or UI state is defense in depth, not mutation authority.

## Root-cause findings

### 1. Repository red masked Browser evidence

`recover-password/page.tsx` violated the repository's `oxfmt` contract, so Repository contracts failed and Browser contracts were skipped.

### 2. UI implementation assumed an unsupported Button API

`RecoveryConfirmationForm` used `<Button asChild>`, but the repository Button contract has no `asChild` prop. The fix reuses the repository's existing `Link + buttonVariants + cn` pattern rather than expanding the UI primitive.

### 3. Direct `verifyOtp(type='recovery')` did not create recovery authority

The original adapter called `verifyOtp({ token_hash, type: 'recovery' })` after the Human POST and then trusted `amr=recovery` as the Session discriminator.

Current Supabase Auth source shows the POST `/verify` path creates the Session with the generic `otp` authentication method. Browser evidence confirmed the consequence: after proof exchange, the Session was accepted as ordinary identity and could enter `/app`.

This was an authorization-boundary defect, not a test-only failure.

### 4. Supabase PKCE is the provider-native recovery primitive

Supabase recovery in PKCE mode records `recovery` in the provider FlowState. Verifying the `pkce_` recovery proof through the provider GET endpoint returns an auth code; `exchangeCodeForSession` consumes the matching verifier and creates a Session from that FlowState. The resulting signed claims therefore preserve the recovery authentication method.

The application must fail closed for non-PKCE recovery proofs instead of falling back to direct `verifyOtp`.

### 5. The 61-second browser fallback was based on the wrong rate-limit model

The E2E assumed a signup confirmation email could consume the password-recovery email frequency window and therefore waited 61 seconds before retrying recovery.

Current Supabase Auth source uses `ConfirmationSentAt` for signup confirmation throttling and `RecoverySentAt` for password recovery throttling. These are separate timestamps. Registration therefore does not consume the first recovery-send window.

The fixed 61-second fallback is unnecessary and should be deleted. The repository's local `max_frequency = "60s"` can remain unchanged to model repeated recovery throttling; no test-environment weakening is required.

### 6. Browser locator ambiguity was a test defect

After the PKCE fix, Browser contracts passed scanner resistance, Human proof exchange, Recovery Session establishment, and `/app` isolation, then failed only because `getByLabel('New password')` also matched `Confirm new password`. Use exact labels so the test reaches the credential mutation and post-reset assertions.

### 7. PR narrative drifted from executable truth

The PR description still mentions an `/auth/recovery` bootstrap and HttpOnly staging cookie. The executable implementation uses a URL fragment, browser memory, `history.replaceState`, explicit Human POST, provider PKCE verification, and server-side auth-code exchange. The PR description must match this actual model.

## Design decisions

### Provider recovery exchange

`IdentityProvider` remains provider-neutral. The Supabase adapter owns the provider-specific exchange:

```text
Human POST with `pkce_...` proof
→ server-side GET /auth/v1/verify?token=<proof>&type=recovery
→ do not auto-follow the provider redirect
→ parse provider auth code
→ exchangeCodeForSession(code)
→ require signed `amr=recovery`
→ otherwise local sign-out and fail closed
```

No provider-specific DTO or client escapes `packages/infrastructure/supabase`.

### Scanner resistance

The recovery email links to:

```text
/recover-password#token_hash=<pkce proof>
```

The URL fragment is not sent in an HTTP GET request, so a GET-only scanner cannot obtain or consume it. Client code reads the fragment once, removes it from the visible URL with `history.replaceState`, and submits it only after explicit Human action.

### Mutation authority

`/reset-password` routing is not sufficient authorization. The Server Action invokes the Application use case, and the Supabase adapter revalidates signed recovery claims immediately before `updateUser({ password })`.

### Post-reset authority termination

The browser contract must prove that after successful password mutation and before any new ordinary sign-in, `/reset-password` fails closed to the recovery-request flow. A new-password ordinary sign-in is then required before `/app` becomes reachable.

### Deterministic browser evidence

- Send one recovery request for the test actor.
- Poll Mailpit for the observable recovery message.
- Do not sleep for a provider frequency interval or retry an indistinguishable recovery request.
- Use exact Playwright labels.

### Scope containment

The following remain open under `GAP-IDENTITY-001`:

- Product Actor readiness/onboarding
- Organization invitation acceptance
- email change
- MFA enrollment/challenge/recovery semantics
- Session listing/selective revocation UI
- hosted SMTP, CAPTCHA/abuse protection, redirect allowlists, notification templates, and Session policy

Password-changed notifications and MFA-aware recovery are legitimate later credential-security slices, not opportunistic additions to PR #24.

## Security invariants

- Recovery Session is never ordinary Product Actor identity.
- Ordinary Session cannot invoke the recovery-specific reset operation.
- Non-PKCE recovery proof fails closed.
- GET-only scanners cannot receive the fragment proof in the HTTP request.
- Passwords and recovery proofs do not enter application persistence, Activity Events, analytics, or server GET URLs.
- Provider-signed recovery authority is checked after code exchange and again at password mutation.
- After successful reset, recovery authority is not reusable.
- Recovery creates no Membership, Grant, Repository Capability, or collaboration authority.

## Verification gates

The PR remains Draft and must not merge until the same exact head has:

1. Workflow guardrails green.
2. Repository contracts green (`pnpm verify:full`).
3. Supabase contracts green.
4. Browser contracts green with scanner, Product Actor isolation, reset, and post-reset negative paths.
5. Vercel status green.
6. PR description synchronized with executable behavior.
7. Final diff-scoped security review with no surviving reportable finding.

Hosted Supabase remains explicitly unverified because the connected account currently exposes no project. Local/CI evidence must not be described as hosted or production evidence.
