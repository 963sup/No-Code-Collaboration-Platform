# PR #24 Recovery Merge-Gate Design

## Goal

Make PR #24 merge-safe by repairing the evidence chain for password recovery without expanding `GAP-IDENTITY-001` into MFA, hosted-provider configuration, onboarding, invitation acceptance, or general Session management.

## First-principles model

The capability under review is credential recovery, not Product Actor authorization.

```text
Recovery request
→ opaque provider proof delivered to the Human
→ explicit Human proof submission
→ provider-verified Recovery Session
→ credential mutation
→ Recovery authority terminates
→ fresh ordinary sign-in
→ Product Actor authority is evaluated independently
```

The implementation is acceptable only if each transition is independently enforced and the exact-head verification can falsify violations.

## Observed root causes

1. Repository verification is red because `apps/web/src/app/(auth)/recover-password/page.tsx` is not formatted by the repository's sole formatter, `oxfmt`.
2. Browser verification is consequently skipped, hiding a second defect in the evidence harness.
3. The recovery E2E combines product behavior with a repository-local Supabase email-frequency setting of `60s`, then compensates with a fixed `61_000ms` wait.
4. Playwright's normal per-test timeout is shorter than that fallback, while `webServer.timeout` governs server startup rather than test execution.
5. Supabase CLI `2.111.0`, which this repository pins, defines the local email `max_frequency` default as `1s`; the repository-local `60s` value is therefore an intentional production-like constraint accidentally coupled to a discriminating browser test.
6. The PR description still describes an obsolete `/auth/recovery` + HttpOnly-cookie bootstrap even though the exact implementation now uses a URL fragment, browser memory, `history.replaceState`, and an explicit Server Action.

## Design decisions

### 1. Reveal the real RED before fixing it

Fix only the formatter issue first. Do not change the email-frequency configuration in the same RED commit. This allows GitHub Actions to reach Browser contracts and prove whether the current 60-second coupling is the next failing boundary.

### 2. Make local/CI recovery evidence deterministic

Set local `auth.email.max_frequency` to `1s`, matching the pinned Supabase CLI development default. This value is evidence-harness configuration only and is not a production abuse-protection recommendation.

Remove the fixed 61-second retry path from the browser test. Continue to poll Mailpit for an observable recovery message within the existing bounded read window rather than sleeping for a provider policy interval.

### 3. Strengthen the post-reset invariant

After password reset succeeds and before any fresh ordinary sign-in, navigate to `/reset-password` and require fail-closed routing to `/forgot-password?error=invalid-recovery-session`. This directly proves the Recovery Session cannot be reused after credential mutation and cleanup.

Then sign in with the new password and retain the existing assertion that an ordinary Session is routed away from the recovery-only page.

### 4. Keep mutation authorization at the Server Action/provider boundary

Do not move reset authorization into UI or Proxy-only checks. `ResetPassword` must continue to require provider-signed recovery evidence immediately before `updateUser({ password })`. Proxy classification remains routing defense in depth, not the mutation authority owner.

### 5. Synchronize evidence narratives with executable truth

Update PR #24's description to describe the actual fragment handoff:

```text
/recover-password#token_hash=<opaque proof>
→ fragment omitted from HTTP GET
→ browser reads proof once
→ history.replaceState removes it from the visible URL
→ explicit Human POST
→ verifyOtp(type='recovery')
```

Do not claim `/auth/recovery`, an HttpOnly staging cookie, or hosted Supabase evidence.

### 6. Do not expand this slice

The following remain open under `GAP-IDENTITY-001` and are not merge requirements for this recovery slice:

- Product Actor readiness/onboarding
- Organization invitation acceptance
- email change
- MFA enrollment/challenge/recovery semantics
- Session listing/selective revocation UI
- hosted SMTP, CAPTCHA/abuse protection, redirect allowlists, notification templates, and Session policy

Password-changed notifications and MFA-aware recovery are legitimate later credential-security work, not opportunistic additions to this repair.

## Security invariants

- Recovery Session is never ordinary Product Actor identity.
- Ordinary Session cannot call the recovery-specific reset operation.
- A GET-only email scanner cannot receive the fragment proof in the HTTP request or consume it.
- Passwords and token hashes do not enter application persistence, Activity Events, analytics, or server GET URLs.
- Reset mutation revalidates provider-signed recovery evidence at the mutation boundary.
- After successful reset, recovery authority is not reusable.
- Recovery creates no Membership, Grant, Repository Capability, or collaboration authority.

## Verification gates

The PR remains Draft and must not merge until the same exact head has:

1. Workflow guardrails green.
2. Repository contracts green (`pnpm verify:full`).
3. Supabase contracts green.
4. Browser contracts green with no 61-second fixed wait.
5. Vercel status green or a separately evidenced explanation that is not masked by repository failure.
6. PR description synchronized with executable behavior.
7. Final diff-scoped security review with no surviving reportable finding.

Hosted Supabase remains explicitly unverified because the connected account currently exposes no project.
