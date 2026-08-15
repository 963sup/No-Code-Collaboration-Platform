# Suggested commands

- Deterministic setup: `corepack enable`, `pnpm install --frozen-lockfile`, `pnpm hooks:install`, `pnpm env:check`.
- Web development: `pnpm dev`; full build: `pnpm build`.
- Focused checks: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm codex:check`, `pnpm architecture:check`.
- Workspace discovery: `pnpm turbo:graph` before cross-package changes.
- Local database lifecycle: `pnpm supabase:start`, `pnpm supabase:verify`, `pnpm supabase:stop`; regenerate accepted local schema types with `pnpm supabase:types:local`.
- Browser acceptance: install once with `pnpm browser:install`, then run `pnpm test:e2e` when the changed boundary requires it.
- Windows PowerShell: use `pnpm.cmd` when the PowerShell shim is blocked. Use ripgrep with an explicit search pattern, e.g. `rg.exe -n "Repository" AGENTS.md`; repository `.codex/rules` owns its sandbox-execution policy.
