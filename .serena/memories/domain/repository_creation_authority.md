# Repository creation authority

## Stable semantic contract

- Repository owns **how a valid Repository is created**: its draft/command lifecycle, ownership shape, persistence contract, and resulting canonical identity.
- Access Authority owns **who may create for an Owner scope**. The authorization decision is the Domain capability `repository.create`; it is evaluated before draft construction or persistence.
- The authorization target is a typed Repository Owner, `User | Organization`. Organization is an ownership/administration Scope, not a mandatory Repository parent or authenticated Actor.

## Owner-scope policy

- A User Actor may create for the matching personal User Owner only.
- An Organization `owner` or `admin` may create for that Organization Owner.
- Organization `member`, non-member, mismatched User, malformed mixed Owner, and unauthenticated requests are denied.
- Membership supplies relationship facts; it does not itself grant creation authority. Infrastructure returns all candidate roles, including `member`; Domain policy filters authorized owners.

## Enforcement boundaries

- `packages/domain/src/access/repository-creation-policy.ts` owns the pure capability decision.
- `packages/application/src/policies/repository-creation-access-policy.ts` resolves authorized Owner candidates and guards the create use case.
- `packages/infrastructure/supabase` supplies provider facts and persistence adapters without owning role policy.
- PostgreSQL independently enforces the same Owner-scope invariant through `private.can_create_repository_for_owner` and the single Repository INSERT RLS policy; `created_by` must equal `auth.uid()`.
- UI owner options are a projection, never the enforcement boundary.

## Verification anchors

- Domain, Application, Infrastructure, and pgTAP tests cover the allow/deny matrix and forged Owner rejection.
- Playwright acceptance uses a fresh non-Demo Actor against local Supabase and proves `/app -> /new -> /{ownerSlug}/{repositorySlug}` for a legitimately administered Organization, plus a forged Organization denial.
