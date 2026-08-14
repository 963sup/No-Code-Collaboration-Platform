# GitHub Public URL/UI/UX Benchmark

- Evidence state: External public benchmark
- Observed: 2026-08-14
- Account context: Anonymous, isolated browser contexts
- Target decision supported: No-code Repository shell, URL identity, responsive supporting regions, and collaboration-surface admission

This document records public GitHub evidence. It is not Product, Domain, Architecture, provider, or implementation truth for this repository.

## 1. Research scope

Observed public surfaces:

- `https://github.com/`
- `https://github.com/github/docs`
- `https://github.com/github/docs/issues`
- `https://github.com/github/docs/issues/45464`
- `https://github.com/github/docs/projects`
- `https://github.com/vercel/next.js/discussions`
- `https://github.com/gollum/gollum/wiki`

Chrome DevTools MCP supplied DOM, computed-style, token, responsive, console, and request-URL/status evidence. Playwright MCP supplied navigation, search/filter, history, accessibility-tree, and viewport evidence. No Cookie, token, request header, private content, or authenticated page was captured.

Saved Playwright evidence follows the information architecture from the public home page inward:

```text
.playwright-mcp/github-reference/desktop/00-home.png
.playwright-mcp/github-reference/desktop/01-organization.png
.playwright-mcp/github-reference/desktop/02-repository-overview.png
.playwright-mcp/github-reference/desktop/03-issues-list.png
.playwright-mcp/github-reference/desktop/04-issue-detail.png
.playwright-mcp/github-reference/desktop/05-repository-projects.png
.playwright-mcp/github-reference/desktop/06-discussions.png
.playwright-mcp/github-reference/desktop/07-wiki.png

.playwright-mcp/github-reference/mobile/00-home.png
.playwright-mcp/github-reference/mobile/01-organization.png
.playwright-mcp/github-reference/mobile/02-repository-overview.png
.playwright-mcp/github-reference/mobile/03-issues-list.png
.playwright-mcp/github-reference/mobile/04-issue-detail.png
```

Additional Issues-only responsive evidence:

```text
.playwright-mcp/github-issues-desktop-1440x900.png
.playwright-mcp/github-issues-compact-1024x768.png
.playwright-mcp/github-issues-tablet-768x1024.png
.playwright-mcp/github-issues-mobile-390x844.png
```

## 2. Product model

| GitHub surface | Publicly observed problem | Stable identity | Supporting UI |
| --- | --- | --- | --- |
| Owner / Repository shell | Preserve owner and Repository context while changing collaboration surfaces | `/{owner}/{repository}` | Global header, owner/Repository header, horizontal Repository navigation |
| Issues | Find and track actionable items | Repository-scoped issue number | Filter/search query, state tabs, labels, assignees, sorting, pagination |
| Issue detail | Discuss and progress one actionable item | `/{owner}/{repository}/issues/{number}` | Timeline plus metadata rail |
| Projects attachment | Discover planning views associated with a Repository | Repository attachment list; project detail has separate owner identity | Search, state filter, sort |
| Discussions | Hold category-based conversations distinct from actionable work | Repository-scoped discussion number | Category rail, search, state/answer filters, sort |
| Wiki | Navigate and edit long-form linked knowledge pages | Repository-scoped page slug | Page index/sidebar, edit/history actions |
| Activity | Inspect Repository activity | Repository-scoped projection URL | Link from Repository metadata region |

GitHub's public Repository surface also contains Code, Pull requests, Actions, branches, commits, diffs, and other software-development mechanisms. Those observations are explicitly inadmissible for the target Product.

The public home screenshot establishes the outer navigation and entry-point hierarchy only. Its developer/code marketing content is not an admitted Product model.

## 3. Semantic model

- Owner identity and Repository identity are visible together but remain distinct.
- Repository navigation changes the active collaboration surface without changing Owner/Repository identity.
- Issue is a Repository-contained actionable Artifact with its own lifecycle and conversation.
- Discussion is a Repository-contained conversation Artifact whose primary purpose is shared understanding.
- Repository `Projects` is an attachment/list Projection: observed project links resolve to `/orgs/{organization}/projects/{number}`, not `/{owner}/{repository}/projects/{number}`.
- Wiki exposes stable page slugs, but the target must first prove behavior not already owned by Page before admitting a second Resource family.
- Filters, sort order, state selection, and pagination are query state, not child resources.
- Activity, Notification, Search, and Audit are Projections over source facts; they do not become collaboration Containers.

## 4. Interaction and state design model

### Repository shell

- Owner and Repository appear in a dedicated identity row with visibility and Repository actions.
- Repository navigation is horizontal and remains inside the Owner/Repository shell.
- At narrow widths, navigation is horizontally constrained and secondary entries move behind an overflow control.

### Issues list

- Desktop uses a `256px` sticky Issues navigation rail plus an independently scrolling main list.
- At observed widths `1440`, `1024`, and `768`, the rail remains visible.
- At `390px`, the rail is absent, the page becomes one column, secondary filters collapse, and list rows reflow vertically.
- Search submission changed the URL to:

```text
/github/docs/issues?q=is%3Aissue%20state%3Aclosed%20label%3Acontent
```

- Open/Closed, author, label, project, milestone, assignee, type, and sort controls are query refinements rather than resource paths.

### Issue detail

- Soft navigation from the list changed the URL to `/github/docs/issues/45464` and rendered a full detail page.
- Browser Back returned to the list route.
- The primary column contains title, state, body, events, and comments.
- A separate metadata rail contains assignees, labels, type, projects, milestone, relationships, and development information.
- GitHub did not display the observed Issue detail as a modal. A target Issue modal is therefore an explicit target interaction choice, not copied GitHub behavior.

### Discussions, Projects, and Wiki

- Discussions use a category rail plus a searchable/sortable conversation list. Category URLs remain under the Repository discussion namespace.
- Repository Projects lists attached planning views, but detail links leave the Repository namespace for an owner-scoped project identity.
- Wiki uses `/wiki/{slug}` with a page rail and history/edit actions. `Home` has a shortened `/wiki` presentation URL.

## 5. Design tokens and layout evidence

Observed light tokens:

```text
font-family: "Mona Sans VF", system UI fallbacks
body font-size: 14px
body line-height: 21px
--bgColor-default: #fff
--bgColor-muted: #f6f8fa
--bgColor-neutral-muted: #818b981f
--borderColor-default: #d1d9e0
--fgColor-default: #1f2328
--fgColor-muted: #59636e
--fgColor-accent: #0969da
--button-primary-bgColor-rest: #1f883d
space scale: 4 / 8 / 12 / 16 / 24px
radius scale: 3 / 6 / 12px
```

Observed dark tokens:

```text
--bgColor-default: #0d1117
--bgColor-muted: #151b23
--borderColor-default: #3d444d
--fgColor-default: #f0f6fc
--fgColor-muted: #9198a1
```

These values are evidence for semantic token roles and density. The target should express them through its own CSS variables rather than scatter literal GitHub colors through components.

## 6. Documentation structure model

Official GitHub documentation separates:

- Organization Membership and Organization roles;
- Repository roles and Team access;
- Issues, Discussions, Projects, and Wiki mechanisms;
- Repository settings;
- Notifications inbox and filters; and
- Organization audit-log access, search, and export.

Public documentation describes supported mechanisms and permissions but is not a complete internal product specification. Relevant official entry points:

- <https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles>
- <https://docs.github.com/en/account-and-profile/concepts/organization-membership>
- <https://docs.github.com/en/issues/tracking-your-work-with-issues>
- <https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions>
- <https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/quickstart-for-projects>
- <https://docs.github.com/en/communities/documenting-your-project-with-wikis/about-wikis>
- <https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox>
- <https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization>

## 7. Differences and mappings between models

| GitHub observation | Target mapping | Reason |
| --- | --- | --- |
| `/{owner}/{repository}` shell | Preserve | Same ownership and collaboration-container problem |
| Desktop Issues sidebar | Preserve responsively | Independent navigation/filter region observed across desktop/tablet widths |
| Issue metadata rail | Preserve responsively | Independent data and layout responsibility |
| Repository project detail candidate | Correct to owner-scoped identity | Live Repository Projects links prove attachment is not ownership |
| Wiki as separate Git-backed system | Do not copy | Git storage/history mechanics are excluded; Page must first prove insufficient |
| Organization or Team conversation space | Reject | Would create a second collaboration Container |
| Code, Commit, Branch, Diff, Actions | Reject completely | Value depends on software-development mechanics |

The ordered journey matters: it proves that Owner and Repository identity are established before a collaboration surface is selected. A feature-first screenshot cannot by itself establish that hierarchy.

## 8. Assumptions, contradictions, and unknowns

- Authenticated Settings, Notification, and Audit screens were not opened; their interaction model is supported only by official public documentation.
- GitHub's own Issue-list navigation produced a full page, while the requested target includes an intercepting modal. That deviation must remain explicit and reversible.
- The exact responsive breakpoint was bounded between the observed `768px` rail and `390px` single-column layouts; implementation must determine it by visual comparison rather than assume a GitHub source breakpoint.
- Public GitHub returned an anonymous `401` for an in-product messaging request. This was not required for the observed page and no response headers/body were retained.

## 9. Documentation gaps and coverage limitations

- No private Organization, Team, Membership administration, Repository Settings, Notification inbox, or Audit data was accessed.
- No claim is made about GitHub's internal React architecture, data model, authorization implementation, or use of framework Parallel Routes.
- Public DOM and CSS may change; target semantics and tests must not depend on GitHub class names or private endpoints.

## 10. Confidence

- High: public URL hierarchy, Repository shell, Issues list/detail layout, query behavior, responsive rail behavior, Discussions category rail, Repository Projects attachment behavior, Wiki page URL.
- Medium: exact breakpoint and authenticated interaction details.
- Low/unproven: internal GitHub implementation architecture.

## 11. Benchmark handoff

Preserve the Owner/Repository identity shell, responsive supporting rails, stable detail URLs, query-driven list state, and canonical full-page resource identity. Reject software-development mechanics and any Organization/Team/Project/Wiki interpretation that becomes a second collaboration Container. Treat Parallel and Intercepting Routes as target delivery mechanisms whose necessity must be demonstrated independently from GitHub's internal implementation.
