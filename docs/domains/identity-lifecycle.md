# Identity Lifecycle

- Status: Candidate target contract
- Decision owner: Project maintainer until explicit identity governance is assigned
- Last reviewed: 2026-08-13

## Owned problem and outcome

This contract owns the transition from an anonymous human request to a verified authenticated Actor, including bounded credential recovery.

The intended outcome is:

> A human can establish and recover a provider-backed identity, prove control of the required credential, obtain an explicitly scoped Session, and become a Product Actor without implicitly receiving Organization, Team, Repository, or Resource authority.

This contract does not own Repository authorization. Authentication establishes who is acting; Memberships, Grants, Capabilities, and governance constraints determine what that Actor may do.

## First-principles model

The minimum causal chain is:

```text
Anonymous Human
→ Credential enrollment or proof
→ Verified provider identity
→ Authenticated Session
→ Product Actor readiness
→ Membership and Grant resolution
→ Repository authorization
```

Credential recovery is a separate branch:

```text
Anonymous Human
→ Recovery requested
→ Recovery proof
→ Recovery Session
→ Password reset
→ Ordinary sign-in
```

The boundaries are intentionally distinct:

```text
Authentication
≠ Authorization

Provider identity
≠ Product profile

Registration
≠ Onboarding

Verified email
≠ Organization membership

Session
≠ Repository authority

Recovery Session
≠ Product Actor Session
```

## Canonical vocabulary

### Human

The real person attempting to establish or recover an identity. Human is not a persisted product Entity in this contract.

### Provider identity

The provider-managed credential record and stable provider identifier. Supabase Auth is the current adapter, not the product vocabulary owner.

### Actor

The authenticated User performing a request. Actor is a request-time role established from an ordinary verified Session.

### Profile

The application projection used to present the Actor in the product. A Profile may contain display name and avatar data; it does not contain password material or become an authorization source.

### Session

A time-bounded proof that a provider identity has authenticated. Session lifecycle and revocation scope must be explicit.

### Recovery Session

A provider-verified, single-purpose credential-recovery state. It authorizes only the accepted recovery operation. It does not establish ordinary Product Actor readiness, cannot enter `/app`, and creates no Membership, Grant, Capability, or collaboration authority.

### Email verification

Proof that the Human controls an email address used by the identity flow. Registration success does not imply that this proof has completed.

### Registration policy

The product rule that determines who may create an identity:

```text
open
invitation-only
approved-domain
enterprise-sso-only
```

The P0 policy is open identity registration with no automatic Organization or Repository access.

## P0 state model

```text
Anonymous
   │
   ├── Sign in with an existing credential
   │         │
   │         ├── verified credential ──────────────┐
   │         └── verification required ───────┐    │
   │                                          │    │
   └── Register with email and password       │    │
             │                                │    │
             ▼                                │    │
      Pending Email Verification ◀────────────┘    │
             │                                     │
             ▼                                     │
       Verified Identity                           │
             │                                     │
             └────────── Authenticated Session ◀───┘
```

Recovery is independently modeled:

```text
Anonymous
   │
   └── Request password recovery
             │
             ▼
      Recovery proof pending
             │
             ▼
        Recovery Session
             │
             ▼
         Password reset
             │
             ▼
        Ordinary sign-in
```

The current executable slice reaches ordinary verified Session establishment and password recovery/reset. Product Actor readiness, Organization invitation acceptance, and stronger account-security management remain explicit gaps.

## Commands and queries

Current provider-neutral use cases:

```text
RegisterWithPassword
SignInWithPassword
VerifyEmail
ResendEmailVerification
RequestPasswordRecovery
VerifyPasswordRecovery
GetPasswordRecoveryIdentity
ResetPassword
GetCurrentIdentity
SignOut(scope)
```

Future use cases are not implied to exist merely because the current provider supports them:

```text
ResolveActorReadiness
AcceptOrganizationInvitation
ChangeEmail
ChangePassword
EnrollMfaFactor
VerifyMfaChallenge
ListSessions
RevokeSession
```

## Route contract

Human-facing routes and protocol endpoints have different responsibilities.

| Route | Access state | Responsibility |
| --- | --- | --- |
| `/sign-in` | Anonymous only | Prove an existing credential and establish an ordinary Session |
| `/sign-up` | Anonymous only | Enroll an email/password identity |
| `/verify-email` | Pending proof | Enter or resend the email verification code |
| `/forgot-password` | Anonymous only | Request a recovery proof without enumerating account existence |
| `/reset-password` | Recovery Session only | Establish a new password after recovery proof |
| `/auth/confirm` | Protocol endpoint | Exchange an opaque token hash for a verified email or Recovery Session |
| `/auth/error` | Public | Present a stable, non-provider-specific failure |
| `/app/**` | Ordinary authenticated Session | Enter the authenticated product surface |

Protocol endpoints must not become product pages. They validate protocol input, update the provider Session through the neutral Application boundary, remove secret-bearing query parameters through redirect, and return the User to a clean human-facing URL.

## Invariants

1. Authentication and authorization are independent decisions.
2. Registration never creates Organization membership, Team membership, Repository Grant, or Resource authority.
3. Email verification is a distinct transition; `signUp` success alone does not prove email control.
4. Provider identity and Product Profile remain separate records and ownership boundaries.
5. Application and Domain code do not expose Supabase-specific `verifyOtp`, `AuthError`, JWT, or User shapes.
6. Password creation policy applies to registration, recovery reset, and password change; sign-in validates only a syntactically valid identifier and a non-empty bounded credential.
7. Every post-auth `next` destination is a normalized same-origin path. External, protocol, anonymous-only, identity-proof, and recovery-only destinations fall back to `/app`.
8. Auth errors exposed to the UI use stable product reason codes and do not reveal whether an arbitrary email is registered.
9. Ordinary `Sign out` revokes only the current Session. Other-session and all-session revocation are separate explicit operations.
10. Session cookies and cache-prevention headers remain synchronized across Proxy, Server Actions, and Route Handlers.
11. User-editable metadata is never an authorization source.
12. UI Context never changes Actor identity or persisted authority facts.
13. A Recovery Session is not accepted as `GetCurrentIdentity` and cannot enter `/app`.
14. An ordinary authenticated Session is not accepted as recovery authority and cannot call the recovery-specific password reset operation.
15. Recovery proof, password material, and recovery token hashes never become Membership, Grant, Capability, Activity Event, or application persistence facts.

## Password and email proof policy

P0 password creation requires at least eight characters and leaves character-class policy to the configured identity provider. The UI may explain the accepted minimum but must not pretend to know provider checks that are not configured or directly observed.

P0 email proof uses a six-digit one-time code. A token-hash endpoint remains available for controlled email-template protocol flows. Codes and token hashes are never logged, persisted in application tables, or carried into the final product URL.

Password recovery uses a provider-issued opaque token hash delivered by the recovery template. `/auth/confirm` exchanges that proof for a Recovery Session and immediately redirects to `/reset-password`; the token hash does not survive in the human-facing URL.

Rate limiting belongs to the provider boundary and is translated into the stable `rate-limited` product reason.

## Failure behavior

- Invalid credentials return a generic failure.
- An existing but unverified identity is routed to the email proof flow without granting an ordinary Session.
- Duplicate registration behavior does not enumerate account existence.
- Password recovery requests return the same accepted product outcome for registered and unregistered syntactically valid emails unless a provider-wide rate limit or outage prevents the request.
- Expired and invalid proofs remain distinct product reasons only after the User is already participating in the proof flow.
- Missing or invalid Recovery Session evidence fails closed before password mutation.
- A recovery-authenticated request that targets `/app` is treated as lacking ordinary Product Actor identity.
- Provider failures fail closed and do not create a local Actor or collaboration authority.
- Unsafe `next` input is replaced with `/app`.
- Unsupported onboarding, invitation, MFA, or enterprise identity behavior is not linked or described as available.

## Provider projection

The current Supabase adapter projects this contract as follows:

```text
RegisterWithPassword
→ auth.signUp

SignInWithPassword
→ auth.signInWithPassword

VerifyEmail(code)
→ auth.verifyOtp({ email, token, type: 'email' })

VerifyEmail(token hash)
→ auth.verifyOtp({ token_hash, type: 'email' })

ResendEmailVerification
→ auth.resend({ type: 'signup', email })

RequestPasswordRecovery
→ auth.resetPasswordForEmail

VerifyPasswordRecovery
→ auth.verifyOtp({ token_hash, type: 'recovery' })

GetPasswordRecoveryIdentity
→ auth.getClaims + signed `amr` recovery method

ResetPassword
→ require Recovery Session
→ auth.updateUser({ password })

GetCurrentIdentity
→ auth.getClaims excluding Recovery Sessions

SignOut(current session)
→ auth.signOut({ scope: 'local' })
```

This mapping is Infrastructure truth. It may change without changing the product vocabulary when the provider or SDK evolves.

## Security and privacy constraints

- Passwords, OTPs, token hashes, access tokens, refresh tokens, and provider secrets must not enter logs, final product URLs, analytics, Activity Events, or GitHub artifacts.
- The browser receives only the Supabase publishable key. Secret or service-role keys remain outside browser code.
- Server Actions and Route Handlers validate their own inputs and do not rely on page rendering as an authorization boundary.
- Password reset re-verifies signed provider recovery evidence at the mutation boundary; a rendered reset page is not sufficient authority.
- Authenticated database access continues to rely on PostgreSQL grants and RLS; a valid ordinary Session is not sufficient row authorization.
- Email delivery in production requires verified redirect allowlists, trusted SMTP configuration, abuse protection, and direct provider evidence.

## Falsifiable predictions

1. A new User who registers cannot enter `/app` until the email proof succeeds.
2. A newly accepted registration creates the provider identity and existing Profile projection; completing the email proof creates the ordinary Session.
3. Registration and credential recovery do not create any Organization membership or Repository Grant.
4. A password shorter than the current creation minimum is rejected during sign-up or recovery reset, while sign-in does not reject a non-empty historical password solely because policy later changed.
5. Selecting an external, protocol, or recovery-only `next` value cannot redirect the User outside the application or into an Auth protocol/recovery loop.
6. Header `Sign out` removes the current browser Session without requesting global revocation.
7. Domain/Application tests can execute all current identity use cases without importing Supabase.
8. Recovery for an unknown email does not expose account existence through the product response.
9. A signed Recovery Session can reach `/reset-password` but cannot enter `/app`.
10. An ordinary password Session cannot reset a credential through the recovery-specific operation.
11. After a successful recovery reset and ordinary sign-in, the new password establishes a normal Product Actor Session.

## Evidence and minimum discriminating test

The registration and verification slice is proven when a disposable local environment completes:

```text
Open protected Repository URL anonymously
→ redirect to sign-in with preserved next
→ move to sign-up
→ register
→ observe verification code in Mailpit
→ verify code
→ observe the authenticated Session and existing Profile projection
→ return to the safe next destination
→ sign out current Session
→ protected route is inaccessible again
```

The recovery slice is proven when the same disposable environment completes:

```text
Create and verify a disposable identity
→ sign out ordinary Session
→ request password recovery
→ observe recovery message in Mailpit
→ exchange recovery token hash at /auth/confirm
→ arrive at clean /reset-password URL
→ prove Recovery Session cannot enter /app
→ update password
→ require ordinary sign-in
→ sign in with the new password
→ prove ordinary Session cannot enter /reset-password
```

Required evidence:

- Application unit tests for registration, verification proofs, recovery, resend, and explicit sign-out scope;
- Supabase adapter tests for OTP/token-hash translation, recovery `amr` separation, mutation denial from ordinary Sessions, and Session scope;
- local Auth configuration with email confirmation and recovery template enabled;
- browser tests using the local Supabase and Mailpit stack;
- no raw provider error, password, OTP, or token in user-visible output or logs;
- hosted provider evidence remains a separate gate and is not implied by local success.

## Known implementation gaps

[`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md) records `GAP-IDENTITY-001`.

The following remain outside the current executable baseline:

- Product Actor readiness and onboarding;
- Organization invitation acceptance;
- email and ordinary authenticated password change;
- Session listing and selective revocation UI;
- MFA and step-up authentication;
- OAuth and enterprise SSO;
- production SMTP, CAPTCHA, redirect, notification, and hosted Session configuration evidence.

These gaps are not permission to infer support from Supabase feature availability.
