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
→ Recovery proof delivered to the Human
→ Human explicitly submits the proof
→ Provider-verified Recovery Session
→ Password reset
→ Recovery authority terminates
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

A provider-verified, single-purpose credential-recovery state whose signed authentication method is `recovery`. It authorizes only the accepted recovery operation. It does not establish ordinary Product Actor readiness, cannot enter `/dashboard`, and creates no Membership, Grant, Capability, or collaboration authority.

### Recovery proof handoff

The short-lived browser-local handoff between the recovery email and explicit provider proof exchange. The provider PKCE token hash is carried in the URL fragment, which is not transmitted in the HTTP GET request. The browser immediately removes the fragment from the visible URL and keeps the proof only in memory until the Human explicitly submits it. The server then asks the provider to verify that PKCE proof, exchanges the resulting provider auth code with the matching verifier, and accepts the Session only when signed claims contain `amr=recovery`.

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
      Recovery proof delivered
             │
      explicit Human POST
             │
             ▼
        Recovery Session
             │
             ▼
         Password reset
             │
             ▼
   Recovery authority ends
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
| `/recover-password` | Identity proof | Receive the browser-only recovery fragment and require explicit Human submission before provider verification |
| `/reset-password` | Recovery Session only | Establish a new password after recovery proof |
| `/auth/confirm` | Protocol endpoint | Exchange an email-verification token hash |
| `/auth/error` | Public | Present a stable, non-provider-specific failure |
| `/dashboard/**` | Ordinary authenticated Session | Enter the authenticated product surface |

A GET must not silently perform a single-use recovery transition when link prefetch is a realistic environment behavior. The recovery email therefore places the opaque token hash in the URL fragment. Fragments are not part of the HTTP request; the Human browser removes the fragment from the visible URL before the explicit confirmation Server Action exchanges the proof through the provider PKCE flow.

## Invariants

1. Authentication and authorization are independent decisions.
2. Registration never creates Organization membership, Team membership, Repository Grant, or Resource authority.
3. Email verification is a distinct transition; `signUp` success alone does not prove email control.
4. Provider identity and Product Profile remain separate records and ownership boundaries.
5. Application and Domain code do not expose Supabase-specific `verifyOtp`, `AuthError`, JWT, or User shapes.
6. Password creation policy applies to registration, recovery reset, and password change; sign-in validates only a syntactically valid identifier and a non-empty bounded credential.
7. Every post-auth `next` destination is a normalized same-origin path. External, protocol, anonymous-only, identity-proof, and recovery-only destinations fall back to `/dashboard`.
8. Auth errors exposed to the UI use stable product reason codes and do not reveal whether an arbitrary email is registered.
9. Ordinary `Sign out` revokes only the current Session. Other-session and all-session revocation are separate explicit operations.
10. Session cookies and cache-prevention headers remain synchronized across Proxy, Server Actions, and Route Handlers.
11. User-editable metadata is never an authorization source.
12. UI Context never changes Actor identity or persisted authority facts.
13. A Recovery Session is not accepted as `GetCurrentIdentity` and cannot enter `/dashboard`.
14. An ordinary authenticated Session is not accepted as recovery authority and cannot call the recovery-specific password reset operation.
15. Recovery proof, password material, and recovery token hashes never become Membership, Grant, Capability, Activity Event, or application persistence facts.
16. Merely GETting a recovery email link does not transmit the token hash to the application server, consume the provider proof, or create a Recovery Session.
17. The browser removes the recovery fragment from the visible URL before proof exchange and holds the proof only in memory until the explicit Human POST.
18. Recovery proof exchange accepts only the provider PKCE recovery form, and the resulting Session is accepted only when signed claims contain the recovery authentication method.
19. Password-recovery request outcomes, including account-specific delivery throttling, do not reveal whether the email belongs to an account.
20. After a successful password reset, the Recovery Session is not reusable as recovery authority; a fresh ordinary sign-in is required for Product Actor access.

## Password and email proof policy

P0 password creation requires at least eight characters and leaves character-class policy to the configured identity provider. The UI may explain the accepted minimum but must not pretend to know provider checks that are not configured or directly observed.

P0 email proof uses a six-digit one-time code. A token-hash endpoint remains available for controlled email-verification protocol flows. Codes and token hashes are never logged or persisted in application tables.

Password recovery uses a provider-issued opaque PKCE token hash delivered by the recovery template as:

```text
/recover-password#token_hash=pkce_<opaque proof>
```

The fragment is browser-local and is omitted from the HTTP GET request. Client code reads the fragment once, removes it with `history.replaceState`, and holds the proof in memory until the Human submits the recovery confirmation form. Only that explicit Server Action calls `VerifyPasswordRecovery`. The Supabase adapter then verifies the PKCE recovery proof with the provider, reads the provider auth code without following the redirect, exchanges that code with the matching PKCE verifier, and requires signed `amr=recovery` before establishing the Recovery Session and redirecting to clean `/reset-password`.

This confirmation boundary exists because enterprise email security systems may prefetch links. A GET-only scanner must not consume a single-use recovery proof before the intended Human acts.

Recovery-request delivery throttling and unknown-account behavior both map to the same accepted product response. A provider-wide outage remains explicit because the service cannot accept the operation at all. Proof-verification throttling may be shown after the Human is already participating in the proof flow.

## Failure behavior

- Invalid credentials return a generic failure.
- An existing but unverified identity is routed to the email proof flow without granting an ordinary Session.
- Duplicate registration behavior does not enumerate account existence.
- Password recovery requests return the same accepted product outcome for registered, unregistered, and delivery-throttled syntactically valid emails. Provider-wide outages remain explicit.
- A GET-only link-prefetch scanner receives `/recover-password` without the fragment and cannot consume the provider proof.
- A missing, malformed, or non-PKCE browser recovery fragment fails closed before provider exchange and offers a new recovery request.
- Expired and invalid proofs remain distinct product reasons only after the Human explicitly submits the proof.
- A provider code exchange that does not yield signed recovery claims is discarded and the local Session is removed.
- Missing or invalid Recovery Session evidence fails closed before password mutation.
- A recovery-authenticated request that targets `/dashboard` is treated as lacking ordinary Product Actor identity.
- After a successful password reset, the prior Recovery Session cannot be reused to perform another recovery mutation.
- Provider failures fail closed and do not create a local Actor or collaboration authority.
- Unsafe `next` input is replaced with `/dashboard`.
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
→ provider PKCE recovery flow creates the browser verifier and recovery FlowState
→ account state and delivery throttling collapse to accepted product outcome

Recovery email GET
→ HTTP request contains no token hash because the proof is in the URL fragment
→ no provider verification

Explicit recovery confirmation POST
→ VerifyPasswordRecovery
→ require a `pkce_` recovery proof
→ provider GET `/auth/v1/verify?token=<proof>&type=recovery` without following the redirect
→ extract provider auth code
→ auth.exchangeCodeForSession(code)
→ require signed `amr=recovery`
→ missing recovery authority removes the local Session and fails closed

GetPasswordRecoveryIdentity
→ auth.getClaims + signed `amr` recovery method

ResetPassword
→ require Recovery Session
→ auth.updateUser({ password })
→ terminate current Recovery Session before ordinary sign-in

GetCurrentIdentity
→ auth.getClaims excluding Recovery Sessions

SignOut(current session)
→ auth.signOut({ scope: 'local' })
```

This mapping is Infrastructure truth. It may change without changing the product vocabulary when the provider or SDK evolves.

## Security and privacy constraints

- Passwords, OTPs, recovery proofs, access tokens, refresh tokens, and provider secrets must not enter application-owned server GET URLs, logs, analytics, Activity Events, or application persistence.
- A recovery token hash may exist transiently in the email URL fragment, browser memory, the explicit recovery POST body, and the Supabase provider-owned verification protocol URL before provider verification. The application must not log, persist, reflect, or reuse it outside that bounded exchange.
- The browser receives only the Supabase publishable key. Secret or service-role keys remain outside browser code.
- Server Actions and Route Handlers validate their own inputs and do not rely on page rendering as an authorization boundary.
- Password reset re-verifies signed provider recovery evidence at the mutation boundary; a rendered reset page is not sufficient authority.
- Authenticated database access continues to rely on PostgreSQL grants and RLS; a valid ordinary Session is not sufficient row authorization.
- Email delivery in production requires verified redirect allowlists, trusted SMTP configuration, abuse protection, scanner-safe templates, and direct provider evidence.

## Falsifiable predictions

1. A new User who registers cannot enter `/dashboard` until the email proof succeeds.
2. A newly accepted registration creates the provider identity and existing Profile projection; completing the email proof creates the ordinary Session.
3. Registration and credential recovery do not create any Organization membership or Repository Grant.
4. A password shorter than the current creation minimum is rejected during sign-up or recovery reset, while sign-in does not reject a non-empty historical password solely because policy later changed.
5. Selecting an external, protocol, identity-proof, or recovery-only `next` value cannot redirect the User outside the application or into an Auth loop.
6. Header `Sign out` removes the current browser Session without requesting global revocation.
7. Domain/Application tests can execute all current identity use cases without importing Supabase.
8. Recovery for an unknown or delivery-throttled email does not expose account existence through the product response.
9. A GET-only email scanner cannot observe the recovery token in the application HTTP request, consume it, or create a Recovery Session.
10. A signed Recovery Session can reach `/reset-password` but cannot enter `/dashboard`.
11. An ordinary password Session cannot reset a credential through the recovery-specific operation.
12. A non-PKCE recovery proof cannot be converted into an ordinary OTP Session by the recovery-specific operation.
13. After a successful recovery reset and before fresh ordinary sign-in, the Recovery Session cannot be reused to enter `/reset-password`.
14. After ordinary sign-in with the new password, the User has a normal Product Actor Session and cannot enter the recovery-only page.

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
→ request password recovery once
→ observe recovery message in Mailpit
→ simulate an independent scanner GET of the email link without the fragment reaching HTTP
→ prove the provider token remains usable
→ open the same email link in the Human browser
→ remove the fragment from the visible URL before proof exchange
→ prove /dashboard remains inaccessible before explicit Human confirmation
→ explicitly confirm password recovery by POST
→ provider verifies PKCE proof and returns auth code
→ exchange auth code with matching PKCE verifier
→ require signed recovery Session
→ arrive at clean /reset-password
→ prove Recovery Session cannot enter /dashboard
→ update password
→ prove Recovery Session cannot re-enter /reset-password
→ require ordinary sign-in
→ sign in with the new password
→ prove ordinary Session cannot enter /reset-password
```

Required evidence:

- Application unit tests for registration, verification proofs, recovery, resend, and explicit sign-out scope;
- Supabase adapter tests for non-enumerating recovery request outcomes, PKCE recovery proof exchange, non-PKCE fail-closed behavior, signed recovery `amr` separation, mutation denial from ordinary Sessions, and Session scope;
- local Auth configuration with email confirmation and scanner-safe recovery template enabled;
- browser tests using the local Supabase and Mailpit stack, including unknown-account, scanner-prefetch, Product Actor isolation, post-reset recovery-disposal, and ordinary-session negative paths;
- no raw provider error, password, OTP, or recovery proof in application-owned server GET URLs or application persistence;
- hosted provider evidence remains a separate gate and is not implied by local success.

## Known implementation gaps

[`../IMPLEMENTATION_GAPS.md`](../IMPLEMENTATION_GAPS.md) records `GAP-IDENTITY-001`.

That register and executable/provider evidence exclusively own current implementation and environment status. Provider feature availability is never permission to infer supported identity behavior.
