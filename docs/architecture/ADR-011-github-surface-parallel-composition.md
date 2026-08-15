# ADR-011: GitHub surface constitution and responsive Parallel Route composition

- Status: Accepted
- Date: 2026-08-14
- Last reviewed: 2026-08-16
- Decision owner: Product and Web architecture
- Affected scopes: Product benchmark rule, canonical Owner/Repository Web presentation, App Router composition, Issue/Discussion delivery

## Refinement

ADR-013 promotes the no-code Data semantic envelope referenced here from conditional Product admission to accepted meaning. Concrete identity, lifecycle, Capability, persistence, route, API, and UI remain Candidate; ADR-011's presentation decisions are otherwise unchanged.

The 2026-08-16 review removes an earlier target-normalization mistake. Once a GitHub concept passes no-code semantic admission, observed GitHub URL/IA is the presentation baseline. Domain renaming is not permission to replace `/dashboard` with `/app`, `/repos` with `/repositories`, `/issues/assigned` with query-only identity, `/wiki` with `/pages`, or to collapse GitHub's Organization operational and settings URL families.

## Decision

For a GitHub-derived surface that passes the no-code semantic admission test, GitHub's observed public and read-only authenticated test-account URL hierarchy, information architecture, navigation, responsive composition, and interaction behavior are the constitutional presentation baseline. A deviation requires an explicit target Product reason and a discriminating test.

This authority never admits Source Code, arbitrary execution, Git refs/merge, code review, CI/CD, Git-backed history, a second collaboration Container, or a weakened authorization boundary. URL terminology and Domain terminology may differ: GitHub `/wiki` remains presentation vocabulary while Page/Knowledge remains the Domain family.

The Repository shell may use route-specific supporting regions through `@sidebar`, `@activity`, and `@modal` Parallel Route slots when independent data/loading/recovery or canonical soft-navigation behavior proves their necessity. Slots never appear in the URL and never own Domain or authorization semantics.

## Problem and success condition

A purely monolithic Repository surface loses mature collaboration behavior where navigation, metadata, activity, or modal presentation has independent loading/recovery needs. A framework-shaped permanent multi-pane model creates the opposite error by turning delivery slots into Product structure.

The decision succeeds when:

- canonical URLs survive direct load, refresh, Back, Forward, and soft navigation;
- supporting regions reconstruct safely on hard navigation;
- responsive layouts preserve the same information without permanent rails;
- no slot, tab, filter, or selected UI state changes Repository authorization; and
- admitted GitHub URL/IA is not rewritten merely to match internal target terminology.

## Evidence ledger

### Observations

- GitHub Issues uses route-specific navigation/metadata composition that changes responsively without changing resource identity.
- Issue detail may use supporting metadata beside a canonical main timeline.
- Issue search/filter state can be query Context without changing Issue identity.
- Repository Projects behaves as a planning/attachment Projection rather than a Repository-owned Project detail identity.
- GitHub public/read-only authenticated evidence establishes distinct global, Owner, Repository, Organization operational, Organization settings, and personal settings URL families.
- Next.js Parallel Routes are layout composition; Route Group and slot folder names do not appear in URLs.
- Intercepting Routes can preserve one canonical URL while changing soft-navigation presentation.

### Constraints

- Repository remains the only No-Code Collaboration Container.
- Public Owner and Repository reads cannot inherit an authenticated-only layout.
- Route Groups, Parallel slots, Dialogs, Sheets, Tabs, and selected Context cannot create Product identity or authority.
- Every named slot has an explicit hard-navigation fallback so stale soft-navigation state cannot survive unmatched routes.
- Domain/Application authorization targets stable Actor and Repository identities; URL labels and slot state are not authorization inputs.
- Server Components remain the default; client state is limited to real interaction islands.

### Unknowns

- Whether every existing slot continues to justify its independent responsibility as presentation evolves.
- Whether additional modal behavior is valuable enough to justify a deviation from observed GitHub navigation for any specific admitted Resource.

## Canonical URL decisions

| Surface | Canonical URL | Nature |
| --- | --- | --- |
| Public home | `/` | Public product entry point |
| Dashboard | `/dashboard` | Authenticated personal discovery |
| Repository discovery | `/repos` | Authenticated Repository discovery Projection |
| Assigned Issue inbox | `/issues/assigned` | Cross-Repository responsibility Projection; `/issues` is an entry alias |
| Project discovery | `/projects` | Planning Projection |
| Discussion discovery | `/discussions` | Cross-Repository Discussion Projection |
| Notifications | `/notifications` | Actor delivery Projection |
| Global search | `/search?...` | Authorized query Projection; Code Search excluded |
| Explore | `/explore?...` | Public discovery Projection |
| Marketplace | `/marketplace?...` | Reviewed catalog Projection; no installation authority |
| Owner profile | `/{ownerSlug}` | Shared User/Organization identity projection |
| Owner profile tabs | `/{ownerSlug}?tab=repositories\|stars\|projects` | Presentation Context over same Owner identity |
| Repository | `/{ownerSlug}/{repositorySlug}` | Stable collaboration Container human identity |
| Issues | `/{ownerSlug}/{repositorySlug}/issues[/{issueNumber}]` | Repository Artifact collection/detail |
| Discussions | `/{ownerSlug}/{repositorySlug}/discussions[/{discussionNumber}]` | Repository Artifact collection/detail |
| Repository Projects | `/{ownerSlug}/{repositorySlug}/projects` | Planning/attachment Projection only |
| Wiki | `/{ownerSlug}/{repositorySlug}/wiki[/{pageId}]` | Page/Knowledge presentation; no Git-backed history |
| Activity | `/{ownerSlug}/{repositorySlug}/activity` | Repository Evidence Projection |
| Security | `/{ownerSlug}/{repositorySlug}/security` | Governance/access-posture Projection |
| Repository Settings | `/{ownerSlug}/{repositorySlug}/settings` | Repository administration |
| Organization operational dashboard | `/orgs/{organizationSlug}/dashboard` | Organization operational Projection |
| Organization people | `/orgs/{organizationSlug}/people` | Membership administration Projection |
| Organization teams | `/orgs/{organizationSlug}/teams` | Deferred Team/group presentation |
| Organization settings | `/organizations/{organizationSlug}/settings/...` | Organization administration/governance |
| Personal settings | `/settings/...` | Actor-account settings family |

`/organizations/new` remains a target-specific creation entry instead of GitHub's commercial `/organizations/plan`, because Billing/Licensing is deferred. This is an explicit Product reason for deviation rather than route normalization.

## Target App Router tree

```text
apps/web/src/app/
├─ (public)/
│  ├─ page.tsx
│  └─ marketplace/page.tsx
├─ (auth)/
│  └─ ...identity/protocol routes...
├─ (authenticated)/
│  ├─ dashboard/page.tsx
│  ├─ repos/page.tsx
│  ├─ issues/
│  │  ├─ page.tsx
│  │  └─ assigned/page.tsx
│  ├─ projects/page.tsx
│  ├─ discussions/page.tsx
│  ├─ notifications/page.tsx
│  ├─ orgs/[organizationSlug]/...
│  └─ organizations/[organizationSlug]/settings/...
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

Route Group names do not appear in Product URLs. `(authenticated)` is an access-composition group, and `(owner)` owns the shared top-level Owner namespace plus nested Repository delivery; neither creates a Domain boundary.

## Parallel Route necessity

A supporting slot is retained only when it has independent responsibility that survives a removal test.

- `@sidebar`: route-specific navigation or metadata whose loading/recovery differs from the active child surface.
- `@modal`: soft-navigation presentation over a canonical full-page URL.
- `@activity`: retain only if an independently loaded, privacy-safe summary proves value; otherwise remove it rather than preserving symmetry.

Every retained slot requires `default.tsx` or equivalent unmatched behavior so hard navigation cannot produce stale content or framework 404s.

## First-principles non-confusion laws

```text
GitHub URL terminology
≠ Domain terminology

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

Repository Project attachment
= Projection
≠ Project ownership

/wiki
= mature presentation URL
Page / Knowledge
= Domain semantic family
```

## Rejected alternatives

### Re-normalize admitted GitHub URLs into target vocabulary

Rejected. It destroys benchmark evidence, creates arbitrary translation rules, and makes future agents treat internal naming preference as Product truth.

### Restore the former four persistent workspace panes

Rejected. It makes framework slots permanent Product regions and creates a second presentation taxonomy unrelated to actual responsibilities.

### One monolithic Repository Client Component

Rejected when independently recoverable supporting regions are proven. It couples data, loading, error, and responsive state unnecessarily.

### Duplicate modal/full-page resource identities

Rejected. Presentation mode cannot create a second resource URL or authorization target.

## Consequences

Benefits:

- current Web URLs remain directly comparable with mature benchmark evidence;
- Domain vocabulary can stay provider-neutral without rewriting presentation URLs;
- responsive composition can evolve without changing Product identity;
- authorization remains stable-ID based and independent from route composition; and
- machine checkers can reject reintroduction of `/app`, `/repositories`, `/issues?scope=assigned`, `/pages`, or collapsed Organization URL families as current truth.

Costs:

- current contracts and tests must distinguish URL vocabulary from Domain vocabulary;
- root Owner slugs require reserved-route integrity; and
- historical ADRs that describe former route decisions must remain clearly historical rather than being copied into current truth.

## Minimum discriminating tests

1. `/dashboard`, `/repos`, `/issues/assigned`, `/marketplace`, `/orgs/{slug}/...`, and `/organizations/{slug}/settings/...` remain stable after unrelated Domain renaming.
2. `/{ownerSlug}` resolves both User and Organization from persisted kind rather than URL shape.
3. `/{ownerSlug}/{repositorySlug}` hard-loads with the same Repository authorization as soft navigation.
4. `/wiki/{pageId}` presents Page/Knowledge without introducing Git-backed history or a second Domain aggregate.
5. Query/tab changes do not alter effective authorization when Actor, Repository, and persisted relationships remain unchanged.
6. Every retained Parallel slot reconstructs or clears safely on hard navigation and unmatched soft navigation.
7. A proposed deviation from observed GitHub URL/IA fails review unless its independent Product reason and discriminating test are recorded.
