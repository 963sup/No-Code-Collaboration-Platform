# ADR-011: GitHub surface constitution and responsive composition

- Status: Accepted
- Date: 2026-08-14
- Last reviewed: 2026-08-16
- Decision owner: Product and Web architecture
- Affected scopes: Product benchmark rule, canonical Owner/Repository presentation, App Router composition

## Current relation

ADR-014 owns current-state mutation and Evidence semantics. This ADR owns URL/IA and responsive presentation only. It admits no source-control-shaped data-history, alternate-state, proposal-convergence, or Repository ancestry model.

## Decision

For a GitHub-derived surface that passes no-code semantic admission, observed GitHub public and read-only authenticated URL hierarchy, information architecture, navigation, responsive composition, and interaction behavior are the presentation baseline.

A deviation requires an explicit Product reason and a minimum discriminating test.

This authority never admits Source Code, arbitrary execution, source-control mechanics, code review, CI/CD, a second collaboration Container, or weakened authorization. URL vocabulary and Domain vocabulary may differ: `/wiki` remains presentation vocabulary while Page/Knowledge remains the Domain family.

The Repository shell may use route-specific supporting regions such as `@sidebar`, `@activity`, and `@modal` only when independent data, loading, recovery, or canonical soft-navigation behavior proves necessity. Slots never appear in URLs and never own Domain or authorization semantics.

## Canonical URLs

| Surface | Canonical URL | Nature |
| --- | --- | --- |
| Dashboard | `/dashboard` | Authenticated personal discovery |
| Repository discovery | `/repos` | Authenticated Repository discovery Projection |
| Assigned Issue inbox | `/issues/assigned` | Cross-Repository responsibility Projection; `/issues` is an entry alias |
| Project discovery | `/projects` | Planning Projection |
| Discussion discovery | `/discussions` | Cross-Repository Discussion Projection |
| Notifications | `/notifications` | Actor delivery Projection |
| Global search | `/search?...` | Authorized query Projection |
| Explore | `/explore?...` | Public discovery Projection |
| Marketplace | `/marketplace?...` | Reviewed catalog Projection |
| Owner profile | `/{ownerSlug}` | Shared User/Organization identity Projection |
| Owner tabs | `/{ownerSlug}?tab=repositories\|stars\|projects` | Context over the same Owner identity |
| Repository | `/{ownerSlug}/{repositorySlug}` | Collaboration Container human identity |
| Issues | `/{ownerSlug}/{repositorySlug}/issues[/{issueNumber}]` | Repository Artifact collection/detail |
| Discussions | `/{ownerSlug}/{repositorySlug}/discussions[/{discussionNumber}]` | Repository Artifact collection/detail |
| Repository Projects | `/{ownerSlug}/{repositorySlug}/projects` | Planning/attachment Projection |
| Wiki | `/{ownerSlug}/{repositorySlug}/wiki[/{pageId}]` | Page/Knowledge presentation |
| Activity | `/{ownerSlug}/{repositorySlug}/activity` | Evidence Projection |
| Security | `/{ownerSlug}/{repositorySlug}/security` | Governance/access-posture Projection |
| Repository Settings | `/{ownerSlug}/{repositorySlug}/settings` | Repository administration |
| Organization operations | `/orgs/{organizationSlug}/...` | Organization operational Projection |
| Organization settings | `/organizations/{organizationSlug}/settings/...` | Organization governance |
| Personal settings | `/settings/...` | Actor settings family |

`/organizations/new` is an explicit deviation from GitHub's commercial plan-selection path because Billing/Licensing is deferred.

## App Router projection

```text
apps/web/src/app/
├─ (public)/
├─ (auth)/
├─ (authenticated)/
│  ├─ dashboard/
│  ├─ repos/
│  ├─ issues/assigned/
│  ├─ projects/
│  ├─ discussions/
│  ├─ notifications/
│  ├─ orgs/[organizationSlug]/
│  └─ organizations/[organizationSlug]/settings/
└─ (owner)/
   └─ [ownerSlug]/
      ├─ page.tsx
      └─ [repositorySlug]/
         ├─ layout.tsx
         ├─ page.tsx
         ├─ wiki/
         ├─ issues/
         ├─ projects/
         ├─ discussions/
         ├─ activity/
         ├─ security/
         ├─ settings/
         ├─ @sidebar/
         └─ @modal/
```

Route Group names do not appear in Product URLs. `(authenticated)` is access composition. `(owner)` owns the shared public Owner namespace and nested Repository delivery. Neither creates a Domain boundary.

## Non-confusion laws

```text
GitHub URL vocabulary ≠ Domain vocabulary

Route Group / Parallel Route / Intercepting Route
= delivery mechanism
≠ Product identity
≠ Container
≠ Artifact
≠ authority source

Query / tab / selected Context
= presentation state
≠ Membership
≠ Grant
≠ Capability

/wiki
= mature presentation URL

Page / Knowledge
= Domain semantic family
```

Public Owner and Repository reads cannot inherit an authenticated-only wrapper. Hard navigation and soft navigation must resolve the same stable identity and authorization.

## Supporting-region necessity

A supporting slot survives only when a removal test proves independent responsibility.

- `@sidebar`: route-specific navigation or metadata with independent loading/recovery.
- `@modal`: soft-navigation presentation over one canonical full-page URL.
- `@activity`: retain only if independently loaded, privacy-safe summary proves value.

Every retained slot requires deterministic unmatched behavior so hard navigation cannot produce stale content or framework errors.

## Alternatives rejected

- Rewriting admitted URLs merely to match internal Domain names.
- Restoring permanent multi-pane workspace structure.
- Treating a framework slot as Product identity or authority.
- Duplicating modal and full-page resource identities.
- Deriving Owner kind or Repository authority from URL shape.

## Minimum discriminating tests

1. `/dashboard`, `/repos`, `/issues/assigned`, `/marketplace`, `/orgs/{slug}/...`, and `/organizations/{slug}/settings/...` remain stable after Domain renaming.
2. `/{ownerSlug}` resolves User or Organization from persisted kind, not URL shape.
3. `/{ownerSlug}/{repositorySlug}` hard-loads with the same authorization as soft navigation.
4. `/wiki/{pageId}` presents Page/Knowledge without introducing another aggregate or data-history model.
5. Query/tab changes leave effective authorization unchanged.
6. Every retained supporting slot reconstructs or clears safely on hard and unmatched soft navigation.
7. A proposed deviation from benchmark URL/IA fails review without an independent Product reason and discriminating test.
