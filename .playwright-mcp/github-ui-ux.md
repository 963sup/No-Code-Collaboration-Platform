# GitHub non-Code collaboration reverse analysis

Captured 2026-08-14. GitHub was observed read-only. Test-account names and test Repository names are intentionally retained; cookies, session state, request headers, CSRF values, authorization data, and credential material are not stored.

## MCP availability and evidence classes

- Chrome DevTools MCP: connected in isolated context `github-public-benchmark`; used for DOM landmarks, computed CSS, design tokens, responsive layout, console/network summaries, and performance trace.
- Playwright MCP: connected with the authorized test account; used for URL discovery, four-viewport screenshots, menus, dialogs, context switching, hover/focus/filter/sort/loading/empty/error states, and navigation behavior.
- Next DevTools MCP: connected to Next.js 16.3.0 on port 3000; route inventory and runtime error state were read successfully.
- shadcn MCP: connected; `components.json` and existing primitives were inspected. Required candidates were found individually in `@shadcn`; nothing was installed and `add --all` was not used.

Evidence labels used below:

- **Observed**: directly supported by GitHub DOM, URL, screenshots, or official documentation.
- **Derived**: first-principles target decision based on observed behavior and the Repository axiom.
- **Deferred**: meaningful candidate whose discriminating Product/Ontology tests are not yet satisfied.
- **Rejected**: value depends on Source Code, git refs/merge, code review, arbitrary execution, or CI/CD. Commit/Branch/Diff/Pull Request/Actions/Gist names remain only as conditional target structured-data candidates; observed GitHub mechanics do not admit them.

## Storage convention and screenshot index

Resource evidence is grouped by target product semantics rather than by GitHub's overloaded first pathname segment. Personal-account User identity lives under `github/account/users/{username}/`, Organization identity and administration under `github/organizations/{organizationSlug}/`, and Repository collaboration evidence under `github/repositories/{ownerSlug}/{repositorySlug}/`. Every `urls.json` retains the observed and canonical GitHub URLs, so semantic grouping does not lose external URL traceability. Host-level resources such as `/dashboard` keep their stable resource directory, while UI-only state lives under `github/components/{component}/` and never creates a fake URL resource.

There are **294 screenshots** across 55 URL resource inventories and 11 component groups. Authenticated and anonymous views of the same URL are distinguished by filenames, not by extra path hierarchy.

This separation is intentional: `github/organizations/github/` and `github/organizations/ac-sup/` are Organization Scope evidence, `github/account/users/369sup/` is Personal Account/User identity evidence, and `github/repositories/{github/docs|vercel/next.js|369sup/support|gollum/gollum}/` is Repository Container evidence. Owner type is established from the observed resource, not guessed from the ambiguous `/{slug}` URL shape. Redirect-only command/alias paths retain their requested URL inventory and point to the canonical screenshot rather than duplicating files.

## Visual system

Observed light tokens:

| Semantic token | Value |
| --- | --- |
| Default background | `#fff` |
| Muted background | `#f6f8fa` |
| Neutral muted | `#818b981f` |
| Default border | `#d1d9e0` |
| Default foreground | `#1f2328` |
| Muted foreground | `#59636e` |
| Accent foreground | `#0969da` |
| Primary action | `#1f883d` |
| Spacing scale | 4, 8, 12, 16, 24 px |
| Radius scale | 3, 6, 12 px |

Observed dark tokens: default background `#0d1117`, muted background `#151b23`, border `#3d444d`, default foreground `#f0f6fc`, muted foreground `#9198a1`, accent `#4493f8`, primary action `#238636`.

Typography is `Mona Sans VF` with a 14px/21px body rhythm. Repository navigation is a 48px horizontal region with an inset divider. Buttons are predominantly 32px high with a 6px radius. Menus and dialogs use anchored or modal overlays, clear selected states, icons plus labels, grouped separators, and keyboard-close behavior.

At 390px, the Issues supporting sidebar changes from a visible 256px region to `display: none`; Repository navigation becomes horizontally constrained and controls collapse. The authenticated Dashboard moves `Top repositories` below primary content rather than preserving the desktop three-region layout.

Chrome lab observation for `/github/docs/issues` at 1440x900, without throttling: LCP 2016ms, TTFB 593ms, render delay 1423ms, CLS 0.25. This is benchmark evidence, not a target performance budget.

## Component and interaction model

| Component | Trigger | Presentation | URL behavior | Context behavior |
| --- | --- | --- | --- | --- |
| Global menu | top-left menu button | modal side drawer | no URL change until item selection | preserves current actor context; exposes global resource discovery |
| User menu | avatar button | anchored dialog | no URL change until navigation item selection | identity, settings, presentation, plan, and session commands |
| Create new | header plus; nested in user menu on mobile | anchored action menu | command URLs or modal state; not stable resources | `New issue` chooses a Repository context before identity exists |
| Account switcher | dashboard context button | modal selector | personal `/dashboard`; org `/orgs/{org}/dashboard` | changes governance/discovery context, never the acting User |
| Status editor | `Set status` | modal dialog | no URL change | actor presence and visibility scope; never authority |
| Notification indicator | inbox icon hover/link | tooltip plus unread dot | stable `/notifications` target | user-specific projection and preference-driven delivery |
| Issue create | `New issue` | modal form | current URL remains until creation | Repository context shown explicitly; no Issue identity before submit |
| Top repositories | Dashboard Account region | responsive discovery region | local filter has no URL; links use canonical Repository URLs | Mobile moves it into the main flow and omits the inline New action; account switch changes context, not actor or authority |
| Profile tabs | profile navigation | selected tab strip | `?tab=` selects a projection of the same User | query state does not create a new owner identity |
| Repository navigation | owner/Repository breadcrumbs | horizontal responsive tab strip | stable child-resource paths; overflow has no URL | mobile `More` changes presentation only |
| Repository settings navigation | permission-gated Settings entry | grouped vertical navigation | settings stays under the governed Repository | selected context never grants access |

## Redirect, command and exclusion ledger

| Requested URL | Observed result | Classification |
| --- | --- | --- |
| `/issues` | `/issues/assigned` | authenticated inbox entry alias to a user-scoped Issue projection |
| `/pulls` | `/pulls/inbox` | observed GitHub Pull Request inbox; source-code meaning excluded, while any target Change Proposal requires its independent structured-data contract |
| `/account/organizations/new` | `/organizations/plan` | creation command entry to plan-selection process |
| `/gist` | `gist.github.com/` | excluded code-snippet creation surface |
| `gist.github.com/mine` | `gist.github.com/369sup` | authenticated alias to GitHub's code-snippet Gist collection; not a target URL, while a future Repository-contained Data Capsule remains a separate candidate |
| `/logout` | not executed | destructive session command, not a bookmarkable resource |
| `/369sup/support/discussions` | HTTP 404 | structurally valid Repository child unavailable for this Repository |

## Product and domain semantic map

The non-negotiable target invariant is **Repository = No-Code Collaboration Container**.

| Concepts | Semantic role in target | Admission decision |
| --- | --- | --- |
| User, Personal Account | User is Actor/Principal/possible Owner; personal account is the human identity/account envelope | Admit; actions are always attributed to a User actor |
| Organization | governance Scope, Membership administrator, possible Repository Owner | Admit; never acts as the authenticated actor |
| Enterprise Account | higher governance/policy/billing Scope over Organizations | Deferred entity; admit semantics, require discriminating tests before implementation |
| Team | Organization-scoped Principal composed from members | Deferred entity; admit semantics for group authority/mentions, not a Container |
| Member, Organization Membership, Team Membership | Relationships between User, Organization, and Team | Admit; belonging does not imply Repository access |
| Role, Permission/Capability, Policy, Ruleset, Access Grant | authorization bundle, decision primitive, constraint, rule collection, explicit authority Relationship | Admit with strict separation; selected UI context never grants authority |
| Profile, Dashboard, News Feed | projections of identity, discovery, and activity | Admit; not authority or ownership |
| Repository shell | stable no-code collaboration Container owned by User or Organization | Admit; reject all source-control assumptions |
| Issue, Assignee, Mention, Comment, Reaction | work Artifact plus responsibility/attention/conversation Relationships and Events | Admit |
| Label, Milestone, Status | classification, planning horizon, and Artifact/Process state | Admit; do not turn temporary view state into identity |
| Project, Project Item, Field, View | owner-scoped planning projection, reference item, typed projection metadata, saved presentation | Admit carefully; Repository page is an attachment projection, not ownership proof |
| Discussion, Category, Answer | conversation Artifact, classification/format, selected response Relationship/state | Admit |
| Wiki Page | collaborative Page Artifact | Map to the existing Page concept; reject Git-backed storage/history semantics |
| Follow, Watch, Subscription, Notification Preference | attention and delivery Relationships/preferences | Admit; none confer access |
| Notification | user-specific delivery projection | Admit; derived from events plus subscriptions/preferences |
| Activity, Timeline, Event | scoped projections and historical evidence | Admit while keeping evidence distinct from feed/notification/audit/analytics |
| Audit Event, Security Event | immutable governance/security evidence projections | Admit; redact sensitive credential data |
| Custom Property, Template | scoped metadata definition/value and creation convention | Admit only when a concrete lifecycle/consumer proves the concept; avoid generic-framework abstractions |
| Integration, GitHub App, OAuth App | external machine Principal/authorization Relationship and integration registration | Admit management semantics only |
| Webhook | event-delivery subscription/endpoint Relationship | Admit management and delivery evidence; never expose secrets |
| Token / Programmatic Access | credential lifecycle and access-management semantics | Admit metadata/status/revocation semantics only; never store secret material |
| Billing, Plan, Subscription | commercial Scope, offering, and entitlement/payment Relationship | Admit outside Repository ownership semantics |
| Enterprise/Organization/Repository Settings | scope-specific management projections | Admit; `settings` is meaningful only beneath the governed resource/scope |
| Import, Export, Migration, Archive | bounded lifecycle Processes and Container state | Admit if provider-neutral and no Code domain is imported |
| Search | query projection over admitted resources | Admit; Code Search rejected |
| Insight, Metric | analytical projection and measured definition/value | Admit; never become Domain truth by themselves |
| Source Code, Tag/git refs, git merge, code review, executable Actions, CI/CD, Package, Release source capability, Code Search | software-development-specific mechanics | Reject entirely, including renamed analogies |
| Commit, Branch, Diff, Pull Request | structured-data change candidates | Admit only as Repository-scoped typed change Evidence/Context/Projection/Proposal under the Candidate contract; no Git or code mechanics |
| Actions, Gist | controlled data-exchange candidates | Admit only as allowlisted typed Data Transfer and Repository-contained Data Capsule; no execution, secrets, or standalone visibility |

## URL first-principles model

For every target URL:

1. Identify the Domain Resource and owner/scope.
2. Require stable identity for bookmark/share/refresh.
3. Put ownership and resource hierarchy in the path.
4. Put search, filter, sort, page, and temporary view in the query string.
5. Use fragments only for in-page location.
6. Keep modal/sidebar/tab/drawer/component names out of the URL.
7. Keep one canonical URL for the same Issue or Discussion whether rendered as a full page or intercepted dialog.

Derived target resource URLs after no-code admission and alias normalization:

```text
/app
/{ownerSlug}
/{ownerSlug}?tab=repositories|projects
/{ownerSlug}/{repositorySlug}
/{ownerSlug}/{repositorySlug}/issues
/{ownerSlug}/{repositorySlug}/issues/{issueNumber}
/{ownerSlug}/{repositorySlug}/projects
/{ownerSlug}/{repositorySlug}/discussions
/{ownerSlug}/{repositorySlug}/discussions/{discussionNumber}
/{ownerSlug}/{repositorySlug}/pages
/{ownerSlug}/{repositorySlug}/pages/{pageId}
/{ownerSlug}/{repositorySlug}/activity
/{ownerSlug}/{repositorySlug}/security
/{ownerSlug}/{repositorySlug}/settings
/repositories
/issues?scope=assigned&q=&status=&sort=&page=
/projects
/discussions
/notifications
/search?q=&type=&sort=&page=
/organizations/{organizationSlug}/members
/organizations/{organizationSlug}/teams
/organizations/{organizationSlug}/settings
/organizations/{organizationSlug}/audit-log
/organizations/{organizationSlug}/custom-properties
/settings/profile
/settings/organizations
/settings/enterprises
/settings/appearance
/settings/accessibility
/settings/billing
/settings/integrations
/settings/applications
/settings/programmatic-access
```

Creation/import entry points are Processes or Commands (`/repositories/new`, `/repositories/import`, `/organizations/new`), not canonical resource identities. Sign-out is an authenticated command rather than a bookmarkable `/logout` resource. Project detail, Team detail, and Enterprise identity routes remain unaccepted until their stable identity and lifecycle are proven.

`/app` remains the project's authenticated Repository discovery/dashboard entry under the current canonical contract. GitHub's `/dashboard` is mirrored in benchmark storage but is not copied automatically into the target URL model.

## Proposed App Router tree

```text
app/
├─ (public)/
│  └─ page.tsx
├─ (app)/
│  └─ app/page.tsx
├─ (global)/
│  ├─ repositories/page.tsx
│  ├─ issues/page.tsx
│  ├─ projects/page.tsx
│  ├─ discussions/page.tsx
│  ├─ notifications/page.tsx
│  └─ search/page.tsx
├─ (owners)/
│  └─ [ownerSlug]/page.tsx
├─ (repository)/
│  └─ [ownerSlug]/[repositorySlug]/
│     ├─ layout.tsx
│     ├─ page.tsx
│     ├─ issues/page.tsx
│     ├─ issues/[issueNumber]/page.tsx
│     ├─ projects/page.tsx
│     ├─ discussions/page.tsx
│     ├─ discussions/[discussionNumber]/page.tsx
│     ├─ pages/page.tsx
│     ├─ pages/[pageId]/page.tsx
│     ├─ activity/page.tsx
│     ├─ security/page.tsx
│     ├─ settings/page.tsx
│     ├─ @sidebar/default.tsx
│     ├─ @activity/default.tsx
│     └─ @modal/
│        ├─ default.tsx
│        ├─ (.)issues/[issueNumber]/page.tsx
│        └─ (.)discussions/[discussionNumber]/page.tsx
├─ (governance)/organizations/[organizationSlug]/...
├─ (commands)/...
└─ (settings)/...
```

Route groups and slot names never appear in public URLs. Every slot must have `default.tsx`.

## Parallel Route requirement

Parallel Routes are a delivery requirement only where the region has independent data, navigation, loading, or error behavior:

- `@modal` is required for the MVP Issue intercepting flow: soft navigation opens the dialog, direct URL/refresh opens the full page, and close uses `router.back()`.
- `@sidebar` is justified for the Repository/Issues supporting navigation only if it owns independent data/loading/error behavior; responsive hiding alone is insufficient.
- `@activity` is justified on the Repository overview only if its feed loads/fails/navigates independently. Otherwise it stays a Server Component, not a slot.

## Existing architecture conflicts

Next DevTools reported current routes for `/app`, `/{owner}/{repository}`, `/activity`, `/pages`, and `/pages/{pageId}`. No Parallel Route slots currently exist.

- Correct and preserved: `/{ownerSlug}/{repositorySlug}` matches stable owner/Container identity; `/app` matches the current Product contract; `/activity` and Page identity are admitted.
- Missing, not yet implemented: Issue collection/detail, Discussion collection/detail, Project projections, admitted Organization governance surfaces, notifications, search, and settings route families. Enterprise identity remains deferred rather than appearing as a target route.
- The legacy `/app/repositories/{repositoryId}/...` route is a compatibility redirect/projection and must not become a second canonical Repository identity.
- There is no current URL collision that requires an immediate destructive rewrite. The conflict is incomplete information architecture, so the next correct change is to add the admitted canonical resources and justified slots after model approval.

## Runtime and shadcn checkpoint

Next DevTools found no compilation issues, config errors, or connected-browser session errors. Current App Router metadata confirms Server Component layouts/pages at the public root.

Existing UI primitives are Button, Card, Input, and Label with CSS variables enabled. shadcn candidates found and inspected individually: Sidebar, Tabs, Dialog, Table, Command, Dropdown Menu, Badge, Avatar, Sheet, and Skeleton. None were installed during analysis; installation must wait for an implemented, demonstrated need.
