# ADR-011: GitHub surface constitution and responsive Parallel Route composition

- Status: Accepted
- Date: 2026-08-14
- Decision owner: Product and Web architecture
- Affected scopes: Product benchmark rule, canonical Repository Web presentation, App Router composition, future Issue delivery slice

## Decision

For a GitHub-derived surface that passes the no-code semantic admission test, GitHub's public URL hierarchy, information architecture, navigation, responsive composition, and interaction behavior are the constitutional presentation baseline. A deviation requires an explicit target Product reason and a discriminating test. This authority never admits Code, Commit, Branch, Diff, Actions, Git-backed history, a second collaboration Container, or a weakened authorization boundary.

The Repository shell will support responsive, route-specific supporting regions through `@sidebar`, `@activity`, and `@modal` Parallel Route slots. Slots never appear in the URL and never own Domain or authorization semantics. The current executable Page routes remain valid while the future Issue route enters implementation only after its Domain lifecycle and authorization contract is accepted.

## Problem and success condition

The current architecture over-corrected an earlier framework-driven multi-pane design by declaring every Repository page to have only one active content surface. Public GitHub evidence shows that this rule loses mature collaboration behavior: Issues uses an independent sticky navigation rail and Issue detail uses an independent metadata rail, while mobile collapses those regions without changing the resource URL.

The decision succeeds when canonical URLs survive direct load, refresh, Back, Forward, and soft navigation; supporting regions reconstruct safely on hard navigation; mobile retains the same information without permanent rails; and no slot or selected UI state changes Repository authorization.

## Evidence ledger

### Observations

- Public GitHub Issues renders a `256px` sticky navigation rail at observed `1440`, `1024`, and `768` widths and a single-column surface at `390`.
- Public Issue detail uses one main timeline plus a separate metadata rail.
- Issue search/filter state is encoded in the query string.
- Repository Projects is an attachment list whose detail links resolve to owner-scoped project identity.
- GitHub Issue list navigation rendered a full detail page, not a modal.
- Next.js 16 Parallel Routes render named slots through layout props; unmatched hard-navigation slots require `default.tsx` or produce a 404.
- Next.js Intercepting Routes preserve a canonical full page on direct/hard navigation while allowing a soft-navigation modal; `@slot` folders do not count as route-segment levels.

### Constraints

- Repository remains the only No-Code Collaboration Container.
- Canonical Repository reads cannot inherit the authenticated-only `/app` layout.
- Route Groups, Parallel slots, Dialogs, Sheets, and Tabs are presentation mechanisms and cannot appear in public URLs.
- Every named slot has `default.tsx` and an explicit unmatched-route behavior so soft navigation cannot retain stale content.
- Domain/Application authorization targets stable Actor and Repository identities; URL labels and slot state are not authorization inputs.
- Server Components are the default. Only modal dismissal, responsive Sheet state, menus, and similar interaction islands are Client Components.

### Assumptions

- Issue is the next independently useful Repository-contained Artifact after Page once its Domain contract is accepted.
- A summarized Activity region can load and fail independently from Repository Overview without exposing raw private historical evidence.
- The requested Issue modal improves list-context preservation enough to justify a deliberate deviation from observed GitHub Issue navigation.

### Unknowns

- The accepted Issue state machine, assignment semantics, comment model, numbering allocation, and evidence contract.
- Whether the Activity summary belongs on Overview after privacy/redaction requirements are tested.
- Whether Discussion detail benefits from the same modal behavior after the Issue modal is validated.

### Value choices

- Preserve public GitHub surface semantics after admission.
- Prefer stable resource URLs over component-shaped paths.
- Prefer independently recoverable supporting regions over one monolithic Client Component.
- Keep deviations explicit and reversible.

## Minimum sufficient model

```text
Owner (User | Organization)
  └─ owns Repository                          # Container
       ├─ Page                                # accepted Artifact
       ├─ Issue                               # next Artifact after Domain acceptance
       ├─ Discussion                          # deferred candidate Artifact
       ├─ supporting navigation/metadata      # Projection/UI
       └─ Activity summary                    # Evidence Projection

Actor + stable Repository + persisted authority
  └─ Capability decision

URL / query / slot / selected tab
  └─ Presentation only
```

Canonical URL decisions:

| Surface | Canonical URL | Nature |
| --- | --- | --- |
| Public home | `/` | Public product entry point; not a Domain resource |
| Repository discovery | `/app` | Authenticated actor dashboard; not Repository identity |
| Owner profile | `/{ownerSlug}` | User or Organization human identity projection |
| Repository | `/{ownerSlug}/{repositorySlug}` | Stable collaboration Container identity |
| Issues list | `/{ownerSlug}/{repositorySlug}/issues` | Repository Artifact collection |
| Issue detail | `/{ownerSlug}/{repositorySlug}/issues/{issueNumber}` | Stable Repository-scoped Artifact |
| Discussions list/detail | `/{ownerSlug}/{repositorySlug}/discussions[/{discussionNumber}]` | Deferred Repository Artifact collection/detail |
| Repository Projects | `/{ownerSlug}/{repositorySlug}/projects` | Attachment/list Projection only |
| Organization Project detail | `/organizations/{organizationSlug}/projects/{projectNumber}` | Deferred owner-scoped planning Projection |
| User Project detail | `/users/{username}/projects/{projectNumber}` | Deferred owner-scoped planning Projection |
| Existing Page | `/{ownerSlug}/{repositorySlug}/pages/{pageId}` | Accepted Artifact; remains Wiki-admission baseline |
| Repository Activity | `/{ownerSlug}/{repositorySlug}/activity` | Repository evidence Projection |
| Repository Settings | `/{ownerSlug}/{repositorySlug}/settings` | Repository management surface |
| Organization Team | `/organizations/{organizationSlug}/teams/{teamSlug}` | Deferred Organization-scoped Principal |
| Organization Memberships | `/organizations/{organizationSlug}/members` | Membership collection Projection |
| Organization Audit | `/organizations/{organizationSlug}/audit-log` | Governance Evidence Projection |
| Notifications | `/notifications` | Actor-specific Projection |
| Global search | `/search` | Cross-resource Projection |

The candidate `/{owner}/{repository}/projects/{projectNumber}` is rejected because live GitHub behavior and the target ontology both show that a Project-style planning view is not owned by one Repository. The candidate `/wiki/{slug}` remains deferred because Page is the only accepted knowledge Artifact and two canonical URLs for one Page would violate stable resource identity.

Query state:

```text
?q=
&status=
&sort=
&page=
&tab=
```

Fragments locate content inside the same resource. Paths named `modal`, `sidebar`, `tab`, `drawer`, `detail`, or `list` are forbidden unless independently proven Domain concepts.

## Target App Router tree

```text
apps/web/src/app/
├─ (public)/
│  └─ page.tsx                    # `/` public entry point
├─ (app)/
│  └─ app/page.tsx
├─ (owner)/
│  └─ [ownerSlug]/page.tsx
├─ (repository)/
│  └─ [ownerSlug]/
│     └─ [repositorySlug]/
│        ├─ layout.tsx
│        ├─ page.tsx
│        ├─ pages/
│        │  ├─ page.tsx
│        │  └─ [pageId]/page.tsx
│        ├─ issues/
│        │  ├─ page.tsx
│        │  └─ [issueNumber]/page.tsx
│        ├─ activity/page.tsx
│        ├─ settings/page.tsx
│        ├─ @sidebar/
│        │  ├─ default.tsx
│        │  ├─ page.tsx              # explicit null at Repository Overview
│        │  ├─ [...catchAll]/page.tsx
│        │  └─ issues/
│        │     ├─ page.tsx
│        │     └─ [issueNumber]/page.tsx
│        ├─ @activity/
│        │  ├─ default.tsx
│        │  ├─ page.tsx
│        │  └─ [...catchAll]/page.tsx
│        └─ @modal/
│           ├─ default.tsx
│           ├─ page.tsx              # explicit null at Repository Overview
│           ├─ [...catchAll]/page.tsx
│           └─ (.)issues/[issueNumber]/page.tsx
└─ (settings)/
   ├─ settings/page.tsx
   └─ organizations/[organizationSlug]/settings/page.tsx
```

Deferred `projects`, `discussions`, and Wiki/knowledge presentation routes are not added to the executable tree merely to fill the structure.

## Parallel Route necessity

| Slot | Necessary responsibility | Hard-navigation fallback | Mobile behavior |
| --- | --- | --- | --- |
| `@sidebar` | Route-specific Issues navigation or Issue metadata with independently resolved data | `default.tsx`, root `page.tsx`, and catch-all render no stale route-specific rail; explicit matching pages reconstruct supported rails | Same content is exposed through Sheet/inline metadata, not discarded |
| `@activity` | Independently loaded, privacy-safe Repository Overview summary | `default.tsx` and catch-all return no summary outside supported routes | Moves below Overview or into a disclosure |
| `@modal` | Requested soft-navigation Issue detail overlay while preserving canonical URL; Discussion may reuse it only after acceptance | Direct URL is rendered by `children`; default, root page, and catch-all clear modal state | Full-screen Dialog/Sheet while retaining canonical URL |

`@activity` must be removed if the Activity summary cannot prove independent loading/failure value or a safe redacted projection. It cannot exist only to satisfy a symmetric folder tree.

## First-principles semantic correction

| 校正前（GitHub 名稱／候選理解） | 校正後（本產品語意） | 依據（第一性原理） | 影響範圍（URL／Domain／UI） |
| --- | --- | --- | --- |
| Account as one generic entity | User and Organization are distinct owner-capable identities | They have different lifecycle and governance; a shared route segment does not erase type | `/{ownerSlug}` resolves a typed Owner; no generic Account aggregate |
| Organization as mandatory Repository parent | Organization is Membership/admin Scope and optional Owner | User-owned Repository solves the same Container problem without Organization | Canonical Repository URL remains owner-neutral |
| Team as workspace | Team is deferred Organization-scoped Principal | Its retained value is shared authority assignment, not content containment | Future `/organizations/{org}/teams/{team}`; no Team collaboration Container |
| Membership implies Repository access | Membership records belonging only | Authority must remain an explicit Role/Capability relationship | Domain authorization and UI explanations remain separate from membership lists |
| Repository as code store | Repository is the only No-Code Collaboration Container | Ownership, containment, authority, navigation, and collaboration remain useful without code | Preserve shell and `/{owner}/{repository}`; reject code mechanics |
| Issue as developer ticket | Issue is a candidate actionable Repository Artifact | Actionable work has independent lifecycle and conversation in arbitrary collaboration | Future `/issues/{issueNumber}` after Domain acceptance |
| Project under one Repository | Project-style view is an owner-scoped planning Projection attached to Repositories | One planning view can span work; attachment does not establish ownership | Repository `/projects` is a list; detail uses owner-scoped URL |
| Discussion as forum Container | Discussion is a candidate Repository-contained shared-understanding Artifact | Conversation remains useful, but cannot create another primary Container | Future Repository discussion URLs after Domain acceptance |
| Wiki as Git-backed knowledge system | Existing Page is the admission baseline | Git storage/history is excluded and duplicate canonical identity is invalid | Keep `/pages/{pageId}` until distinct Wiki behavior is proven |
| Notification/Activity/Audit as source truth | They are actor/repository/governance Projections over facts and Evidence | Delivery, summaries, and audit views have different consumers and retention from source facts | Stable projection URLs; no authority or Artifact ownership |
| Parallel Route as Product region | Parallel Route is a delivery mechanism for independently recoverable supporting UI | Framework composition has no Domain identity | `@sidebar`, `@activity`, `@modal` stay out of public URLs |
| Modal URL | Modal and full page share one canonical resource URL | Presentation mode cannot create a second resource identity | Intercepting Route only; direct load renders the full page |

Semantic roles retained by this decision are explicit: User is Actor and possible Owner; Organization is Scope and possible Owner; Team is a deferred Principal; Membership and Grant are Relationships; Repository is Container; Page is the accepted Artifact; Issue and Discussion are candidate Artifacts; Activity, Notification, Audit, Search, and Project-style planning are Projections; Role/Capability/Policy remain authorization semantics rather than content entities.

## Alternatives and counterfactuals

### Keep the single-surface architecture

Rejected. It predicts continued divergence from observed GitHub Issues and forces route-specific navigation/metadata into monolithic page components.

### Restore the former four persistent workspace panes

Rejected. It makes framework slots permanent Product regions and conflicts with GitHub's route-specific and responsive composition.

### Use ordinary component composition only

Viable for small surfaces, but rejected for the required sidebar/activity/modal regions because hard-navigation recovery, independent loading, and modal canonical-URL behavior are explicit requirements.

### Copy every GitHub path and feature

Rejected by the Product axiom and no-code admission rule.

## Consequences

- Product and App Router instructions must stop claiming that a Repository always has only one content region.
- The Web layout gains explicit slot props but no Domain authority.
- Mobile requires Sheet/Dialog interaction islands while data loading remains server-owned.
- Issue implementation is blocked until the Issue Domain contract defines identity, lifecycle, authorization, and evidence.
- Project and Wiki candidate URLs are corrected before implementation, avoiding false ownership and duplicate canonical identity.

## Falsification conditions

Reopen this decision if supporting regions cannot recover without stale slot state, if accessibility or mobile behavior is worse than ordinary composition, if the modal breaks canonical Back/Forward/direct-load behavior, or if the Activity summary cannot meet privacy/authorization requirements.

## Minimum discriminating test

For one accepted Issue fixture:

1. `/app` navigates to `/{owner}/{repository}`.
2. Issues list filters update only query state.
3. Soft navigation from Issues list opens the requested modal at the canonical Issue URL.
4. Back closes it; Forward reopens it.
5. Direct navigation and refresh at the same URL render the full page.
6. Desktop/tablet render the appropriate rail; mobile exposes identical information without a permanent rail.
7. Actor/Repository authorization results remain identical across modal/full-page and viewport states.
8. Next DevTools reports no compilation, runtime, hydration, or server-log errors.

Stop and reopen the earliest invalid model layer on the first failed invariant.

## Follow-up contract changes

- Update `docs/PRODUCT.md`, `docs/ONTOLOGY.md`, `docs/architecture/README.md`, `docs/architecture/ADR_INDEX.md`, and `apps/web/src/app/AGENTS.md`.
- Add an Issue Domain contract before implementing Issue persistence or Application use cases.
- Add only the shadcn primitives selected after inspecting existing UI exports; do not use `add --all`.
- Add Playwright coverage for direct, soft, refresh, Back, Forward, query, responsive rail, and authorization-equivalence behavior.

## Semantic self-check

1. No retained concept depends on Source Code, Commit, Branch, Diff, Actions, or Git-backed version control.
2. Organization, Team, Project, Discussion, Wiki, and Parallel slots do not become a second collaboration Container.
3. Every retained name above has an explicit semantic role or is marked deferred.
4. Historical Evidence remains business evidence; it is not reinterpreted as code-version history.
