# Repository Ownership and Semantic Routing Design

- Status: Approved correction for PR #27
- Date: 2026-08-14
- Root product authority: `docs/PRODUCT.md`

## Problem

The executable baseline and PR #27 incorrectly promoted an implementation shortcut—Organization-only Repository ownership—into Product truth. That caused ownership, authorization, routing, and UI to assume every Repository has an Organization parent.

This correction starts from the product invariant:

```text
Repository = No-Code Collaboration Container
```

Ownership answers a different question from collaboration containment.

## First-principles model

A Repository needs exactly one persistent owner. The currently accepted owner types are:

```text
Repository Owner = User | Organization
```

A User may therefore occupy different semantic roles without conflation:

```text
persistent User identity
→ request Actor
→ direct-grant Principal
→ possible Repository Owner
```

An Organization is a membership/administration scope and may also own Repositories. It is not the mandatory parent of every Repository.

Enterprise remains a future governance Scope over Organizations and does not become a Repository owner by implication.

## Typed persistence

Repository ownership stays strongly typed rather than using a polymorphic `owner_type + owner_id` pair:

```text
repositories.owner_user_id         nullable FK → auth.users
repositories.owner_organization_id nullable FK → organizations
CHECK exactly one owner FK is non-null
```

Repository slug uniqueness is scoped independently to each concrete owner:

```text
UNIQUE(owner_user_id, slug) where owner_user_id is not null
UNIQUE(owner_organization_id, slug) where owner_organization_id is not null
```

## Owner namespace

GitHub-style semantic URLs require User and Organization owner names to share one globally unambiguous first path segment:

```text
/{ownerSlug}/{repositorySlug}
```

User identity therefore gains a required `username`; Organization continues to have a `slug`. A concrete `repository_owner_namespaces` reservation/index table enforces global uniqueness across those two typed owner families. It is not a generic Scope/Principal table and does not replace User or Organization identity.

The namespace reservation is maintained transactionally from User-profile and Organization lifecycle triggers. Repository rows keep typed owner FKs; the namespace table is used for global slug uniqueness and semantic-route resolution.

## Visibility

The executable authorization baseline currently gives special read semantics only to `public`. `organization` visibility is therefore removed rather than retained as a label with no effective-access semantics.

Current accepted visibility becomes:

```text
private | public
```

A future Organization-wide visibility/baseline permission may be added only with an explicit authority contract and discriminating test.

## Authority

Repository admin authority sources become owner-neutral:

1. Personal owner: `repository.owner_user_id == actor.userId` → Repository admin authority.
2. Organization-owned Repository: Organization `owner` / `admin` relationship → Repository admin authority.
3. Direct User Repository Grant → assigned Repository Role.
4. Public visibility → accepted unauthenticated/authenticated read baseline only.

Ordinary Organization Membership still grants no Repository authority.

Application authority queries accept `actorId + repositoryId`; they must not require `organizationId` from the caller.

## URL and UI

Canonical Repository URL:

```text
/{ownerSlug}/{repositorySlug}
/{ownerSlug}/{repositorySlug}/pages
/{ownerSlug}/{repositorySlug}/pages/{pageId}
/{ownerSlug}/{repositorySlug}/activity
```

`/app` remains the authenticated dashboard for this correction, not part of Repository identity. Repository cards on `/app` must navigate to the canonical owner/repository URL.

Legacy `/app/repositories/{repositoryId}/...` URLs remain compatibility redirects to canonical semantic URLs.

The Repository shell keeps one Repository collaboration boundary. Parallel Route slots are presentation projections only.

## Repository creation

The Web must expose creation rather than relying on seed/API fixtures. `/new` is an authenticated creation surface with:

- Owner selector: personal namespace plus Organizations where the actor is `admin` or `owner`.
- Repository name.
- Repository slug.
- Optional description.
- Visibility: Private or Public.

Creation does not fabricate a direct Grant for the owner. Owner authority is derived from ownership.

## Auth structure correction

`apps/web/src/auth/auth-navigation.ts` is routing policy, not an Auth domain. Move it to `apps/web/src/routing/auth-routes.ts`.

`/auth/confirm` belongs physically under the `(auth)` Route Group while preserving the public URL:

```text
apps/web/src/app/(auth)/auth/confirm/route.ts
```

## Required discriminating tests

1. User and Organization owner namespaces cannot collide globally.
2. A User-owned and Organization-owned Repository can use the same Repository slug because the owner namespaces differ.
3. Personal owner receives Repository admin authority without a fabricated Grant.
4. Organization admin/owner receives admin authority only for Organization-owned Repositories.
5. Ordinary Organization member receives no Repository authority from membership alone.
6. Public visibility supplies read baseline; private does not.
7. `/app` Repository card click reaches `/{owner}/{repository}`.
8. Legacy stable-ID route redirects to the same canonical URL.
9. Personal Repository creation through `/new` succeeds.
10. Organization-owned Repository creation through `/new` succeeds only for Organization admin/owner.
11. Existing Page create/read/update/activity behavior works under canonical owner-neutral routes.
12. Auth callback and post-auth URLs remain unchanged after folder ownership cleanup.

## Non-goals

This correction does not accept Team, Enterprise, Issue, Discussion, Change Request, Workflow, App, Project, custom roles, explicit deny, or Organization-wide ordinary-member Repository access.