# GitHub collaboration observation index

- Observed: 2026-08-14
- Subject: sanitized GitHub public and read-only authenticated UI/UX
- Conditions: isolated public Chrome context plus an authorized test account
- Authority: external evidence only; not Product admission, target architecture, or implementation status

Cookies, session state, request headers, CSRF values, authorization data, credentials, and raw private Repository content are not stored. Test-account and test-Repository names are retained only where required to identify the observed public/test resource.

## Evidence sources

- Chrome DevTools observations cover DOM landmarks, computed CSS, responsive layout, console/network summaries, and one performance trace.
- Playwright observations cover URL discovery, four-viewport screenshots, menus, dialogs, context switching, hover/focus/filter/sort/loading/empty/error states, and navigation behavior.
- Every resource or component directory contains its narrow `urls.json` and/or `ui-ux.md` provenance. Redirect aliases retain the requested and final GitHub URL instead of creating a target URL.

[`github-urls.json`](./github-urls.json) is the authoritative inventory. Resource, component, and referenced-screenshot totals are derived from that manifest by the documentation checker; prose does not duplicate those counts.

## Storage convention

Evidence is grouped by the observed subject: personal-account User surfaces under `github/account/users/{username}/`, Organization administration under `github/organizations/{organizationSlug}/`, Repository surfaces under `github/repositories/{ownerSlug}/{repositorySlug}/`, host-level resources under their stable resource names, and UI-only state under `github/components/{component}/`.

Every `urls.json` retains the observed and canonical GitHub URLs, so directory grouping does not erase URL provenance. Authenticated and anonymous views of one URL are distinguished by filenames rather than a second path hierarchy.

## Direct visual observations

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

Observed dark tokens: default background `#0d1117`, muted background `#151b23`, border `#3d444d`, default foreground `#f0f6fc`, muted foreground `#9198a1`, accent `#4493f8`, and primary action `#238636`.

Typography was `Mona Sans VF` with a 14px/21px body rhythm. Repository navigation was a 48px horizontal region with an inset divider. Buttons were predominantly 32px high with a 6px radius. Menus and dialogs used anchored or modal overlays, selected states, icons plus labels, grouped separators, and keyboard-close behavior.

At 390px, the observed Issues supporting sidebar changed from a visible 256px region to `display: none`; Repository navigation became horizontally constrained and controls collapsed. The authenticated Dashboard moved `Top repositories` below primary content rather than preserving the desktop layout.

Chrome lab observation for `/github/docs/issues` at 1440x900 without throttling: LCP 2016ms, TTFB 593ms, render delay 1423ms, CLS 0.25. These values are one benchmark observation, not a performance budget.

## Direct interaction observations

| Observed component | Trigger | Presentation | URL behavior |
| --- | --- | --- | --- |
| Global menu | top-left menu button | modal side drawer | no URL change until item selection |
| User menu | avatar button | anchored dialog | no URL change until navigation item selection |
| Create new | header plus; nested in user menu on mobile | anchored action menu | command URL or modal state |
| Account switcher | dashboard context button | modal selector | personal `/dashboard`; Organization `/orgs/{org}/dashboard` |
| Status editor | `Set status` | modal dialog | no URL change |
| Notification indicator | inbox icon hover/link | tooltip plus unread dot | links to `/notifications` |
| Issue create | `New issue` | modal form | current URL remained until creation |
| Top repositories | Dashboard account region | responsive discovery region | local filtering produced no URL change |
| Profile tabs | profile navigation | selected tab strip | `?tab=` selected visible content |
| Repository navigation | owner/Repository breadcrumbs | horizontal responsive tab strip | child paths changed; overflow itself had no URL |
| Repository settings navigation | Settings entry | grouped vertical navigation | remained beneath the observed Repository path |

## Redirect and availability observations

| Requested URL | Observed result |
| --- | --- |
| `/issues` | redirected to `/issues/assigned` |
| `/pulls` | redirected to `/pulls/inbox` |
| `/account/organizations/new` | redirected to `/organizations/plan` |
| `/gist` | transferred to `gist.github.com/` |
| `gist.github.com/mine` | redirected to `gist.github.com/369sup` for the test account |
| `/logout` | not executed because it is a destructive session command |
| `/369sup/support/discussions` | returned HTTP 404 under the observed conditions |

Interpretation, Product admission, canonical target URLs, App Router composition, implementation gaps, local runtime state, and UI-library choices belong in their respective current contracts or executable evidence, not in this benchmark index.
