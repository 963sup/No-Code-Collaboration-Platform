# GitHub public and read-only authenticated UI/UX evidence

- Evidence status: External benchmark
- Observed: 2026-08-14
- Conditions: sanitized public browsing plus an authorized read-only test account at desktop, laptop, tablet, and mobile viewports
- Scope: GitHub URL hierarchy, information architecture, navigation, responsive composition, and interaction behavior
- Excludes: Product admission, target architecture, implementation status, credentials, session material, and raw private Repository content

## Provenance and inventory

The detailed evidence lives under [`.playwright-mcp/github/`](../../.playwright-mcp/github/) and is summarized by [`.playwright-mcp/github-ui-ux.md`](../../.playwright-mcp/github-ui-ux.md). [`.playwright-mcp/github-urls.json`](../../.playwright-mcp/github-urls.json) is the authoritative resource/component/screenshot inventory.

Inventory totals are derived by `tooling/check-documentation-contracts.mjs`. This document intentionally carries no handwritten totals; every manifest resource path, component path, and referenced screenshot must resolve to a present evidence file.

Each narrow sidecar records its observed URL or component, capture condition, and direct behavior. Directory grouping is an evidence index, not a claim about target Product or Domain ownership.

## Representative observed surfaces

- public landing, pricing, search, explore, topics, collections, marketplace, and customer-story surfaces;
- authenticated dashboard, repositories, assigned Issues, Projects, Discussions, Notifications, Settings, and creation/import entry points;
- User profile/account and Organization profile, membership, governance, and settings surfaces;
- Repository overview, Issues, Projects, Discussions, Pulse, Security, Settings, and Wiki surfaces;
- global/user/create menus, account switcher, status editor, notifications indicator, profile tabs, Repository navigation, and Repository settings navigation.

These names describe GitHub observations only. Whether the underlying collaboration problem is admitted is decided by [`../PRODUCT.md`](../PRODUCT.md) and [`../ONTOLOGY.md`](../ONTOLOGY.md).

## Stable direct observations

### URL and command behavior

- GitHub used owner/Repository paths for Repository identity and child paths for many Repository surfaces.
- Query strings selected profile tabs, filters, sorting, and other temporary projections.
- `/issues` redirected to `/issues/assigned`; `/pulls` redirected to `/pulls/inbox`.
- `/account/organizations/new` redirected to `/organizations/plan`.
- `/gist` transferred to the separate `gist.github.com` host.
- `/logout` was intentionally not executed because it terminates a Session.
- `/369sup/support/discussions` returned HTTP 404 under the captured test conditions.

### Responsive composition

- Repository primary navigation remained tied to the same observed URLs while narrower viewports constrained the tab strip and moved overflow behind presentation controls.
- Issues used supporting navigation/metadata regions on wider screens and collapsed or hid them on narrow screens.
- The authenticated Dashboard reordered the `Top repositories` region below primary content on mobile.
- Menus and dialogs preserved explicit triggers, selected states, focus/keyboard behavior, and clear close behavior.

### Visual system

- Observed light defaults included white background, `#d1d9e0` borders, `#1f2328` foreground, `#0969da` accent, and `#1f883d` primary action.
- Observed dark defaults included `#0d1117` background, `#3d444d` border, `#f0f6fc` foreground, `#4493f8` accent, and `#238636` primary action.
- The observed body rhythm was 14px/21px with `Mona Sans VF`; common spacing steps were 4, 8, 12, 16, and 24px.

## Evidence interpretation rules

1. A screenshot or URL proves only the directly observed GitHub behavior and capture conditions.
2. An unavailable or permission-gated surface is recorded as such; its hidden content is not inferred.
3. GitHub terminology, route aliases, and implementation mechanics carry no target authority.
4. Product mappings, canonical target URLs, architecture decisions, and executable status belong only in their owning current contracts.
5. A later recapture updates the manifest and narrow sidecar; it does not silently rewrite Product or implementation truth.
