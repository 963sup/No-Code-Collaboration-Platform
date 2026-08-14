# Authenticated dashboard

## Resource and context

- GitHub serves the signed-in personal dashboard at `/` and links to the same projection as `/dashboard` from the global menu.
- The stable subject is the signed-in actor's dashboard projection, not the `Home` tab component.
- The active context is shown by the account control (`369sup`). Switching to `ac-sup` changes both the governance context and URL.

## Layout and responsive behavior

- Desktop and laptop use a three-region shell: repository discovery at left, feed/content in the center, contextual/changelog content at right.
- Tablet preserves the global header and condenses peripheral content.
- Mobile moves `Top repositories` below the main content and keeps menu, notifications, and avatar as compact header actions.
- The global header stays visually separate from the dashboard body; context selection is not hidden inside page content.

## Captured states

- Default personal dashboard: Desktop 1440x900, Laptop 1280x800, Tablet 768x1024, Mobile 390x844.
- Organization dashboard is filed separately under `github/organizations/ac-sup/dashboard/` because it has its own URL and ownership context.
