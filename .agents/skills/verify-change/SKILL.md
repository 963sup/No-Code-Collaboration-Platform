---
name: verify-change
description: Use after repository changes or before a PR to choose and run the narrowest sufficient deterministic checks, bound output, and report evidence without overstating validation.
---

# Verify Change

1. Identify changed files, affected contracts, and the highest-risk behavior.
2. Run `pnpm codex:check` when Codex configuration, agents, skills, environments, hooks, rules, or scoped instructions change.
3. Run `pnpm verify:fast` after normal TypeScript or configuration changes when dependencies are installed.
4. Add `pnpm verify:full` when exports, dependencies, entry points, build output, or dead-code reachability may have changed, and before proposing a merge.
5. Run Playwright, Supabase, or ast-grep checks only when the change touches their real behavioral boundary.
6. Narrow noisy commands before execution. Redirect complete logs when output may exceed 100 lines, preserve the exit code, and report only the earliest useful failure plus the log path.
7. Finish with `git diff`, `git diff --check`, `git status --short`, and untracked-file inspection when available.
8. Report unavailable checks explicitly. Never convert an unrun check into a passing claim.
