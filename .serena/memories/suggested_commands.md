# Suggested Commands

- Deterministic setup: `corepack enable`, `pnpm install --frozen-lockfile`, `pnpm hooks:install`, `pnpm env:check`.
- Web development/build: `pnpm dev`; `pnpm build`.
- Focused checks: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm codex:check`, `pnpm architecture:check`.
- Workspace discovery before cross-package changes: `pnpm turbo:graph`.
- Disposable local database: `pnpm supabase:start`, `pnpm supabase:verify`, `pnpm supabase:stop`; regenerate the accepted local database projection with `pnpm supabase:types:local`.
- Browser acceptance: install Chromium once with `pnpm browser:install`; run `pnpm test:e2e` only when the changed boundary requires it.
- Windows PowerShell: use `pnpm.cmd` when execution policy blocks the PowerShell shim; prefer native PowerShell or `rg.exe -n "<pattern>" <path>` for bounded discovery.
- Serena memory graph check after structural memory maintenance: `serena memories check .`.
