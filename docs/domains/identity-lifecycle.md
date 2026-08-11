# Identity Lifecycle

- Status: Candidate target contract
- Decision owner: Project maintainer until explicit identity governance is assigned
- Last reviewed: 2026-08-12

## Owned problem and outcome

This contract owns the transition from an anonymous human request to a verified authenticated Actor.

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
```

## Canonical vocabulary

### Human

The real person attempting to establish or recover an identity. Human is not a persisted product Entity in this contract.

### Provider identity

The provider-managed credential record and stable provider identifier. Supabase Auth is the current adapter, not the product vocabulary owner.

### Actor

The authenticated User performing a request. Actor is a request-time role established from a verified Session.

### Profile

The application projection used to present the Actor in the product. A Profile may contain display name and avatar data; it does not contain password material or become an authorization source.

### Session

A time-bounded proof that a provider identity has authenticated. Session lifecycle and revocation scope must be explicit.

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

The current executable slice ends at `Authenticated Session`. Product Actor onboarding, Organization invitation acceptance, credential recovery, and stronger authentication remain explicit gaps.

## Commands and queries

P0 provider-neutral use cases:

```text
RegisterWithPassword
SignInWithPassword
VerifyEmail
ResendEmailVerification
GetCurrentIdentity
SignOut(scope)
```

Future use cases are not implied to exist merely because the current provider supports them:

```text
RequestPasswordRecovery
ResetPassword
ChangeEmail
ChangePassword
EnrollMfaFactor
VerifyMfaChallenge
ListSessions
RevokeSession
ResolveActorReadiness
```

## Route contract

Human-facing routes and protocol endpoints have different responsibilities.

| Route | Access state | Responsibility |
| --- | --- | --- |
| `/sign-in` | Anonymous only | Prove an existing credential and establish a Session |
| `/sign-up` | Anonymous only | Enroll an email/password identity |
| `/verify-email` | Pending proof | Enter or resend the email verification code |
| `/auth/confirm` | Protocol endpoint | Exchange an opaque token hash for a verified Session |
| `/auth/error` | Public | Present a stable, non-provider-specific failure |
| `/app/**` | Authenticated | Enter the authenticated product surface |

Protocol endpoints must not become product pages. They validate protocol input, update the provider Session through the neutral Application boundary, remove secret-bearing query parameters through redirect, and return the User to a clean human-facing URL.

## Invariants

1. Authentication and authorization are independent decisions.
2. Registration never creates Organization membership, Team membership, Repository Grant, or Resource authority.
3. Email verification is a distinct transition; `signUp` success alone does not prove email control.
4. Provider identity and Product Profile remain separate records and ownership boundaries.
5. Application and Domain code do not expose Supabase-specific `verifyOtp`, `AuthError`, JWT, or User shapes.
6. Password creation policy applies to registration and password change; sign-in validates only a syntactically valid identifier and a non-empty bounded credential.
7. Every post-auth `next` destination is a normalized same-origin path. External, protocol, and anonymous-only destinations fall back to `/app`.
8. Auth errors exposed to the UI use stable product reason codes and do not reveal whether an arbitrary email is registered.
9. Ordinary `Sign out` revokes only the current Session. Other-session and all-session revocation are separate explicit operations.
10. Session cookies and cache-prevention headers remain synchronized across Proxy, Server Actions, and Route Handlers.
11. User-editable metadata is never an authorization source.
12. UI Context never changes Actor identity or persisted authority facts.

## Password and email proof policy

P0 password creation requires at least eight characters and leaves character-class policy to the configured identity provider. The UI may explain the accepted minimum but must not pretend to know provider checks that are not configured or directly observed.

P0 email proof uses a six-digit one-time code. A token-hash endpoint remains available for controlled email-template or future protocol flows. Codes and token hashes are never logged, persisted in application tables, or carried into the final product URL.

Rate limiting belongs to the provider boundary and is translated into the stable `rate-limited` product reason.

## Failure behavior

- Invalid credentials return a generic failure.
- An existing but unverified identity is routed to the email proof flow without granting a Session.
- Duplicate registration behavior does not enumerate account existence.
- Expired and invalid proofs remain distinct product reasons only after the User is already participating in the proof flow.
- Provider failures fail closed and do not create a local Actor.
- Unsafe `next` input is replaced with `/app`.
- Unsupported recovery, onboarding, invitation, MFA, or enterprise identity behavior is not linked or described as available.

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

GetCurrentIdentity
→ auth.getClaims

SignOut(current session)
→ auth.signOut({ scope: 'local' })
```

This mapping is Infrastructure truth. It may change without changing the product vocabulary when the provider or SDK evolves.

## Security and privacy constraints

- Passwords, OTPs, token hashes, access tokens, refresh tokens, and provider secrets must not enter logs, URLs after completion, analytics, Activity Events, or GitHub artifacts.
- The browser receives only the Supabase publishable key. Secret or service-role keys remain outside browser code.
- Server Actions and Route Handlers validate their own inputs and do not rely on page rendering as an authorization boundary.
- Authenticated database access continues to rely on PostgreSQL grants and RLS; a valid Session is not sufficient row authorization.
- Email delivery in production requires verified redirect allowlists, trusted SMTP configuration, abuse protection, and direct provider evidence.

## Falsifiable predictions

1. A new User who registers cannot enter `/app` until the email proof succeeds.
2. A newly accepted registration creates the provider identity and existing Profile projection; completing the email proof creates the Session.
3. Registration does not create any Organization membership or Repository Grant.
4. A password shorter than the current creation minimum is rejected during sign-up, while sign-in does not reject a non-empty historical password solely because policy later changed.
5. Selecting an external or protocol `next` value cannot redirect the User outside the application or back into an Auth protocol loop.
6. Header `Sign out` removes the current browser Session without requesting global revocation.
7. Domain/Application tests can execute all P0 use cases without importing Supabase.

## Evidence and minimum discriminating test

The P0 vertical slice is proven when a disposable local environment completes:

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

Required evidence:

- Application unit tests for registration, verification proofs, resend, and explicit sign-out scope;
- Supabase adapter tests for OTP/token-hash translation and Session scope;
- local Auth configuration with email confirmation enabled;
- browser test using the local Supabase and Mailpit stack;
- no raw provider error, password, OTP, or token in user-visible output or logs.

## Known implementation gaps

[`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md) records `GAP-IDENTITY-001`.

The following remain outside the current executable baseline:

- password recovery and reset;
- Product Actor readiness and onboarding;
- Organization invitation acceptance;
- email and password change;
- Session listing and selective revocation UI;
- MFA and step-up authentication;
- OAuth and enterprise SSO;
- production SMTP, CAPTCHA, redirect, notification, and hosted Session configuration evidence.

These gaps are not permission to infer support from Supabase feature availability.
