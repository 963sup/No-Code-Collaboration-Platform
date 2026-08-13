# PR #24 Recovery Merge-Gate Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore truthful exact-head verification for PR #24 and prove the password-recovery lifecycle without expanding the open Identity gap.

**Architecture:** Preserve the existing provider-neutral Application boundary and Supabase adapter. Repair the verification harness by separating local email-delivery timing from the recovery behavioral contract, then strengthen the browser post-condition that Recovery authority terminates before ordinary sign-in.

**Tech Stack:** TypeScript, Next.js App Router/Server Actions, Supabase CLI 2.111.0/Auth, Playwright 1.62.1, oxfmt 0.42.0, GitHub Actions.

## Global Constraints

- `packages/domain` remains provider-free business truth.
- `packages/application` remains provider-neutral and may depend on Domain, not Next.js or Supabase SDKs.
- Supabase-specific behavior remains in `packages/infrastructure/supabase` and composition.
- Server Actions revalidate authentication/authorization at the mutation boundary.
- `pnpm` is the only JavaScript package manager.
- `oxfmt` is the only formatter and `oxlint` the general JS/TS linter.
- `GAP-IDENTITY-001` remains Open after this slice.
- Do not add MFA, onboarding, invitation acceptance, Session-management UI, or hosted-provider claims.

---

### Task 1: Expose the hidden Browser RED

**Files:**
- Modify: `apps/web/src/app/(auth)/recover-password/page.tsx`
- Create: `docs/superpowers/specs/2026-08-13-pr24-recovery-merge-gate-design.md`
- Create: `docs/superpowers/plans/2026-08-13-pr24-recovery-merge-gate-repair.md`

**Interfaces:**
- Consumes: existing PR #24 recovery flow and GitHub Actions dependency graph.
- Produces: formatter-clean repository job so Browser contracts can execute.

- [ ] **Step 1: Apply only the oxfmt-equivalent multiline UI import to `recover-password/page.tsx`.**

```ts
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
```

- [ ] **Step 2: Commit and push without changing Supabase email frequency or the 61-second browser fallback.**

Expected GitHub outcome: Repository contracts progresses beyond `oxfmt`; Browser contracts becomes runnable. If Browser reaches the fallback, Playwright should expose the current timing defect rather than it remaining skipped.

- [ ] **Step 3: Inspect exact-head workflow jobs/logs.**

Evidence required: Repository contracts result plus Browser contracts result on the same pushed head.

### Task 2: Remove test-environment timing coupling

**Files:**
- Modify: `supabase/config.toml`
- Modify: `apps/web/e2e/auth.spec.ts`

**Interfaces:**
- Consumes: Supabase CLI 2.111.0 local Auth configuration and Mailpit message polling.
- Produces: deterministic recovery email delivery evidence without an arbitrary 61-second sleep.

- [ ] **Step 1: Set the local/CI email frequency to the pinned CLI development default.**

```toml
# Keep local/CI Auth delivery fast so browser contracts test recovery behavior rather than a
# production-like email-frequency interval. Hosted abuse-protection policy is a separate gate.
max_frequency = "1s"
```

- [ ] **Step 2: Delete `requestRecoveryAndReadTokenHash`'s catch/retry/fixed-wait behavior.**

Replace the helper body with:

```ts
async function requestRecoveryAndReadTokenHash(
  page: Page,
  request: APIRequestContext,
  email: string
) {
  await requestRecovery(page, email);
  return readRecoveryTokenHash(request, email);
}
```

- [ ] **Step 3: Strengthen the post-reset regression before ordinary sign-in.**

Immediately after the successful reset notice, add:

```ts
await page.goto('/reset-password');
await expect(page).toHaveURL(/\/forgot-password\?error=invalid-recovery-session$/u);

await page.goto('/sign-in?notice=password-reset');
```

Then continue with the existing new-password sign-in assertions.

- [ ] **Step 4: Commit the minimal GREEN change and inspect GitHub Actions.**

Expected: Repository, Supabase, and Browser contracts green. Browser execution must not contain a 61-second fixed wait.

### Task 3: Synchronize PR evidence with executable truth

**Files:**
- GitHub PR #24 description (metadata only)

**Interfaces:**
- Consumes: exact implementation after Task 2.
- Produces: review narrative that matches executable recovery handoff.

- [ ] **Step 1: Replace obsolete cookie/bootstrap claims.**

Required wording must describe:

```text
/recover-password#token_hash=<opaque proof>
→ fragment omitted from HTTP GET
→ browser reads and clears fragment
→ explicit Human POST
→ verifyOtp(type='recovery')
→ Recovery Session
```

- [ ] **Step 2: Keep the evidence boundary explicit.**

State that no hosted Supabase project is connected and that SMTP, redirect allowlists, abuse protection, notification templates, and Session policy are not proven by this PR.

- [ ] **Step 3: Keep `GAP-IDENTITY-001` open.**

Do not claim closure for onboarding, invitations, MFA, Session management, or hosted-provider evidence.

### Task 4: Final security and merge-gate verification

**Files:**
- No planned production changes unless verification produces a new evidence-backed finding.

**Interfaces:**
- Consumes: final PR diff and exact-head CI/status evidence.
- Produces: merge/no-merge decision.

- [ ] **Step 1: Re-run diff-scoped source → control → sink review.**

Check recovery proof input, Server Action entry points, `amr=recovery` discrimination, `updateUser` mutation, Session cleanup, redirect handling, token exposure, and Product Actor isolation.

- [ ] **Step 2: Verify external dependency assumptions against Context7/Supabase current docs.**

Required checks: Playwright test timeout semantics, Next.js Server Action authorization requirement, Supabase recovery `amr`, `verifyOtp(type='recovery')`, and local email-frequency behavior.

- [ ] **Step 3: Inspect exact-head GitHub checks and Vercel status.**

Do not mark Ready for review while any required check is red or skipped.

- [ ] **Step 4: Keep PR Draft unless all merge gates are satisfied.**

No merge to `main` is authorized by this repair plan.
