# Implementation Gap Register

- Status: Active current-gap register
- Register owner: Project maintainer until an explicit governance owner is assigned
- Last reviewed: 2026-08-15

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
8. External CI/provider failure is evidence about the execution environment, not automatically a Product/Domain regression. Classify the failing boundary before changing a gap's semantic status.

## Status model

- **Open**: mismatch exists and closure evidence is incomplete.
- **Contained**: mismatch exists, but verified control prevents unsafe/supported claims.
- **Closed**: executable behavior and required evidence match target contract; detail belongs in history.
- **Superseded**: another gap/contract replaces the framing; detail belongs in history.

## Open gaps

### GAP-COLLABORATION-SURFACES-001 — Accepted collaboration surfaces have truthful breadth while selected delivery remains Preview or Deferred

- Status: Contained
- Affected contracts: [`PRODUCT.md`](./PRODUCT.md), [`ONTOLOGY.md`](./ONTOLOGY.md), [`domains/repository-collaboration.md`](./domains/repository-collaboration.md), [`architecture/README.md`](./architecture/README.md), [ADR-011](./architecture/ADR-011-github-surface-parallel-composition.md)
- Affected invariants: Repository remains the only collaboration Container; Issue/Discussion stable identity and lifecycle are Repository-scoped; Project/Notification/Search/Explore/Integrations are non-owning Projections; availability is honest; code-product surfaces are absent
- Risk class: target/executable mismatch and misleading feature-readiness claims

#### Direct evidence

- [`.playwright-mcp/github-urls.json`](../.playwright-mcp/github-urls.json) indexes the sanitized URL-resource and component inventories plus 444 current screenshots across Desktop, Laptop, Tablet, and Mobile, including the target Issue comparison set.
- [`.playwright-mcp/github-ui-ux.md`](../.playwright-mcp/github-ui-ux.md) records canonical redirects, Dashboard/account context switching, Repository navigation, Issues, Projects attachment behavior, Discussions availability, Wiki/Page behavior, Activity, Security posture, Settings, Notifications, and governance surfaces.
- The accepted target URL set now includes Repository Issues, Projects attachment list, Discussions, Pages, Activity, Security posture, and Settings; actor-level Repository/Issue/Project/Discussion discovery, Notifications, Search, Organization governance, and personal Settings are separate resource/projection families rather than Repository children.
- The executable App Router now exposes the manifest-driven App shell and every admitted global, Repository, account, Organization-governance, settings, and integration-catalog route with explicit `live | preview | deferred` availability. Source Code, Git, Pull Request, Gist, Actions, and arbitrary execution surfaces are absent.
- Issue and Discussion now have executable Domain/Application/schema/adapter/Web command lifecycles with Repository-local numbering, optimistic concurrency, flat comments, Activity Evidence, question-only Answer selection, and independent Discussion moderation state. Notifications, Search, Explore, and Repository Projects are authorized read projections; Notification preference and inbox-state commands are live.
- The remaining delivery mismatch is explicit rather than product-semantic uncertainty: actor-wide `/issues` and `/discussions`, selected account/Organization/settings surfaces, and the provider-neutral integration catalog remain Preview; Team, Enterprise, and connector installation/connection remain Deferred by Product decision.

#### Predicted failure

Without containment, documentation or UI work could present target-only surfaces as available, copy GitHub aliases as canonical target resources, invent Issue/Discussion state in React components, create Repository-owned Project detail identity, duplicate Page through `/wiki`, or add Parallel slots without independent loading/recovery value.

#### Temporary containment

- Product admission is explicitly separated from implementation status in Product, Architecture, and Web instruction contracts.
- Every surface must declare `live | preview | deferred`; Preview may render routing, layout, query state, form shape, and control intent but cannot fabricate data, authorization, persistence, or success.
- Preview and Deferred surfaces expose no fabricated records, authority, persistence, installation, or successful controls. Raw Issue and Discussion table mutation paths fail closed; live changes pass through typed commands.
- Project remains a read/planning Projection; Repository `/projects` cannot establish Project ownership or independent authority.
- Source Code, Git refs/merge, code review, Code Search, executable payloads, CI/CD, and Git-backed Wiki history remain excluded even when visible in benchmark screenshots. Product/Ontology and ADR-013 accept the Data Commit, Data Branch, Data Diff, Change Proposal, Data Transfer, Data Capsule, and Repository Derivation semantic envelope, but no concrete identity, lifecycle, Capability, schema, API, route, or UI is thereby accepted. Executable behavior remains absent and fails closed until the Candidate concrete Domain lifecycles and discriminating tests are separately accepted.

#### Closure evidence

Close only after the same exact change set proves:

1. Issue and Discussion executable Domain/Application/schema/adapters prove the already accepted stable Repository-scoped lifecycle, authorization, comments/relationships, optimistic concurrency, and Activity Evidence without code-domain dependencies.
2. Application use cases and provider adapters preserve Repository authorization and do not place Domain decisions in React components.
3. The App Router implements accepted target routes with Server Components by default and only minimal interaction islands.
4. Every `@sidebar`, `@activity`, and `@modal` slot has `default.tsx`, explicit unmatched soft-navigation behavior, and a removal test proving independent responsibility.
5. Issue and Discussion modal/full-page modes share canonical URL and authorization; refresh, Back, and Forward behave identically for stable resource identity.
6. Projects stays an attachment/list Projection and owner-scoped Project detail does not appear under a Repository-owned detail path.
7. Wiki/Page knowledge has one canonical target identity and no Git-backed history semantics.
8. GitHub `/dashboard`, `/repos`, `/issues/assigned`, split Organization namespaces, and command paths are mapped to the target resource/query/process model without provider aliases becoming canonical Domain identity.
9. Notification access revocation leaks no title/snippet/count/URL; Search authorization precedes ranking/count/snippet; Project filters do not mutate Artifacts; Discussion Answer is question-only; Context switching does not change effective authorization.
10. Next DevTools reports no build, type, runtime, hydration, browser-log, or server-log errors for each implemented slice.
11. Playwright validates GitHub-aligned local behavior at `1440x900`, `1280x800`, `768x1024`, and `390x844` without credentials or private request material.

### GAP-OWNERSHIP-001 — Repository ownership and creation are implemented; latest exact-head closure evidence remains incomplete

- Status: Open
- Affected contracts: [`PRODUCT.md`](./PRODUCT.md), [`ONTOLOGY.md`](./ONTOLOGY.md), [`domains/repository-collaboration.md`](./domains/repository-collaboration.md), [`domains/access-authority.md`](./domains/access-authority.md), [`architecture/README.md`](./architecture/README.md), [ADR-010](./architecture/ADR-010-repository-owner-namespace.md)
- Affected invariants: `Repository Owner = User | Organization`, owner-neutral authorization, globally unambiguous Owner namespace, canonical `/{owner}/{repository}` routing, visibility vocabulary
- Risk class: incomplete exact-head integration evidence, not a known ownership-semantic defect

#### Direct evidence

The corrected target is implemented in current `main`:

- `packages/domain/src/repository/ownership.ts` defines typed User/Organization Repository Owner.
- `packages/domain/src/repository/repository.ts` exposes typed `owner` and `private | public` visibility with no Organization-only compatibility field.
- `packages/domain/src/access/authority.ts` resolves only `directRole + governanceRole`; the Organization-only authority fallback is removed.
- `packages/application/src/ports/repository-access-reader.ts` accepts stable `actorId + repositoryId`; the old Organization-specific authority Port is removed.
- `packages/infrastructure/supabase/src/access/supabase-repository-access-reader.ts` reads owner-neutral direct/governance sources.
- `supabase/schemas/30_repository.sql` models exactly one `owner_user_id XOR owner_organization_id`; the legacy `organization_id` ownership column is absent from current desired state.
- `packages/domain/src/access/repository-creation-policy.ts` defines the pre-identity, Owner-scoped `repository.create` decision independently of Repository Role bundles.
- `packages/application/src/policies/repository-creation-access-policy.ts` authorizes a requested typed Owner before the Repository command validates creation mechanics.
- `supabase/schemas/91_repository_access_projection.sql` declares owner-neutral authority-source projection and the database projection of the Owner-scoped creation policy.
- `supabase/schemas/95_repository_routing.sql` resolves one global User/Organization Owner namespace.
- `supabase/schemas/26_repository_owner_namespace_guardrails.sql` reserves command-route segments, including `organizations`, so canonical Repository identity cannot collide with `/organizations/new`.
- `supabase/schemas/99_rls.sql` permits creation only for the matching personal Owner or an Organization owner/admin, rejects an ordinary member, and preserves Actor attribution.
- `apps/web/src/app/(repository)/[ownerSlug]/[repositorySlug]/**` is the canonical Repository UI tree; the obsolete Organization-only tree is absent.
- `/new` supports personal ownership and eligible Organization ownership; `/organizations/new` establishes founder ownership through the accepted Organization creation path.
- PR [#27](https://github.com/963sup/No-Code-Collaboration-Platform/pull/27) is merged; its old Draft wording is historical and is not a current containment condition.
- Commit `108ccfc6ac546dcfa653105f6174d98618f93bee` passed Verify #438 with Workflow guardrails, Repository contracts, Supabase contracts, and Browser contracts; its Vercel status also succeeded.
- Current `main` commit `7423d82d558c904ba12cb6a1d83a5eb4941e6bfd` changes Serena tooling documentation rather than ownership/runtime behavior. Verify #439 passed Repository contracts and Workflow guardrails; local Supabase reset, lint, and all 10 pgTAP files / 183 assertions passed, but generated-type verification was interrupted by external ECR `toomanyrequests` while pulling `postgres-meta:v0.96.6`, so Browser contracts were skipped.

The latest failure is classified as environment evidence rather than ownership-regression evidence, but the project closure protocol still requires one latest exact head to complete the full required matrix before this gap moves to history.

#### Root cause

An early Organization-only executable shortcut was promoted into Product, Domain, authorization, persistence, and URL assumptions. Those assumptions then cited one another as evidence.

The invalid Product/Domain/Architecture/executable boundaries have been replaced. The remaining gap is evidence closure only.

#### Predicted failure

Until closure, a later non-ownership change could still hide an integration regression if no current exact SHA completes Repository, Supabase, Browser, and deployment evidence together.

#### Temporary containment

- Treat the typed User/Organization ownership model as current Product/Domain truth; do not reintroduce Organization-only compatibility semantics merely because this evidence gap is Open.
- Keep generated database types as projections; stale checked-in output remains a verification failure, never Product truth.
- Do not classify an external registry failure as permission to weaken database verification or to push the repository baseline to a hosted Supabase project.
- Do not claim production validation from prior local/CI evidence; ownership semantics and production readiness are separate questions.

#### Closure evidence

Close only after the same latest branch/main SHA proves all of the following:

1. Domain models typed `RepositoryOwner = User | Organization` and `private | public` visibility.
2. Application authority lookup accepts `actorId + repositoryId` without caller-supplied Organization ownership.
3. Supabase desired state and replay history end with typed XOR Owner FKs plus one globally unambiguous User/Organization Owner namespace and no legacy ownership column.
4. Personal Owner derives Repository admin without fabricated Grant; Organization admin/owner derives admin only for Organization-owned Repository; ordinary member does not.
5. Route RPCs/adapters resolve `ownerSlug + repositorySlug` for both Owner kinds.
6. Web canonical Repository URL is `/{ownerSlug}/{repositorySlug}`; `/app` is dashboard only; stable-ID compatibility routes redirect safely; no Organization-only Repository UI tree remains.
7. `/new` supports personal ownership and authorized Organization ownership through the Domain Owner-scoped `repository.create` policy and same-semantics RLS.
8. `/organizations/new` creates an Actor-attributed Organization, atomically establishes founder ownership, and exposes it as a valid Repository Owner without treating Organization Membership as Repository access.
9. Playwright explicitly navigates from `/app` to the canonical Repository route and completes accepted collaboration behavior through that route.
10. pgTAP proves Organization bootstrap, namespace collision rejection, typed ownership, creation/authorization matrix, legacy-column absence, and visibility semantics.
11. Generated DB types match the replayed desired schema, Repository verification succeeds, Supabase verification succeeds, Browser contracts succeed, and deployment status succeeds for the same latest SHA.

### GAP-IDENTITY-001 — Identity lifecycle remains incomplete after verified Session and recovery establishment

- Status: Open
- Affected contract: [`domains/identity-lifecycle.md`](./domains/identity-lifecycle.md)
- Affected invariants: Product Actor readiness, invitation continuity, credential/session security, and production provider evidence
- Risk class: Incomplete product entry, identity governance, and operational readiness

#### Direct evidence

- The executable slice implements password registration, email verification, ordinary Session establishment, current-Session sign-out, Profile creation through the existing `auth.users` trigger, password-recovery request, provider recovery proof, Recovery Session discrimination, and password reset.
- Recovery is intentionally single-purpose: `GetCurrentIdentity` excludes signed Sessions whose `amr` contains `recovery`; `/reset-password` requires recovery evidence; an ordinary password Session cannot use recovery reset; recovery creates no Membership, Grant, Capability, or Activity facts.
- `apps/web/e2e/auth.spec.ts` carries a local Mailpit path from registration/verification through recovery proof, recovery-only routing, reset, fresh ordinary sign-in, and rejection of ordinary Sessions from recovery page.
- No Application use case or human-facing route currently implements Organization invitation acceptance, email change, MFA, Session listing, selective revocation UI, or enterprise identity policy.
- Direct provider discovery on 2026-08-15 found a healthy hosted Supabase project, but no repository application schema or migration ledger is established there and it is not accepted as Preview, Staging, or Production. Hosted Auth redirect, SMTP, CAPTCHA/abuse protection, notification, and Session settings remain unverified.
- Open registration intentionally creates no Organization Membership or Repository Grant.

#### Predicted failure

A User can establish/recover the current local email/password credential flow, but cannot accept an Organization invitation or manage stronger account-security lifecycle operations through the product. Local success may not match hosted Auth delivery/security behavior.

#### Temporary containment

- Recovery is exposed only through the accepted single-purpose Recovery Session path; a recovery-authenticated request is not accepted as ordinary `/app` identity.
- Unsupported invitation, MFA, OAuth, SSO, Session-management, and broader account-security behavior is not described as available.
- Registration/recovery do not create collaboration authority; authenticated Users without persisted authority remain unauthorized by RLS.
- A hosted provider project is not treated as an accepted identity environment merely because it exists. Production identity readiness remains blocked until hosted configuration/delivery are directly verified.

#### Closure evidence

Close only after:

1. password recovery/reset are exact-head verified without account enumeration, ordinary-Session bypass, or Recovery-Session product access;
2. Product Actor readiness has one authoritative minimal model and does not manufacture an unnecessary onboarding state;
3. Organization invitations survive sign-in/registration/verification/recovery without implicit invalid Membership;
4. credential/Session security operations have explicit scope/reauthentication rules;
5. hosted Supabase redirect, SMTP, abuse-protection, template, notification, and Session settings are verified in an accepted environment; and
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
5. Distinguish Product/regression failure from external CI/provider failure before changing semantic status.
6. Change status only after evidence review, then move detailed entry to historical archive.
