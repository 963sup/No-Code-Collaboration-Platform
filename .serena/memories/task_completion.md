# Task Completion

- Always inspect the complete diff, run `git diff --check`, and review `git status --short`; preserve unrelated pre-existing work.
- Codex configuration, rules, hooks, skills, environments, or scoped instructions: `pnpm codex:check`.
- Normal code/configuration change: `pnpm verify:fast` (Codex and architecture contracts, format, lint, strict typecheck, tests).
- Exports, dependencies, entry points, build output, reachability, or pre-integration evidence: `pnpm verify:full` (fast verification, build, Knip).
- Supabase/schema/RLS change: start the disposable local stack and run `pnpm supabase:verify`; this proves local reconstruction only, never remote deployment.
- Run `pnpm test:e2e` only when browser-observable behavior changed and prerequisites are available.
- Stop when requested behavior and relevant invariants are proven and no known task-related regression remains.
