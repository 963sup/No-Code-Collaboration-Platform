# Account and organization switcher

- Trigger: the dashboard context control labeled `Go to 369sup dashboard`; the compact user-dialog switch action provides an equivalent entry.
- Presentation: native open `dialog`, title `Go to organization dashboard`, close action, selectable contexts, and management commands.
- Selected state uses a check mark next to `369sup`; `ac-sup` has organization avatar semantics.
- Context switch is URL-significant: personal dashboard resolves to `/dashboard`, organization dashboard to `/orgs/ac-sup/dashboard`.
- `Manage organizations` is navigation; `Create organization` is a command. Neither was activated.
