# Codex Runtime Scope

- This subtree owns repository-local Codex context, agents, hooks, execution-policy rules, and environment declarations. It does not own Product or architecture truth.
- Follow `docs/CODEX_DESKTOP.md` for the context and trust model. Keep compact/session context derived from canonical repository contracts and within the enforced byte budgets.
- Hooks and rules must be deterministic, bounded, machine-verifiable, and fail with actionable messages. They must not print secrets or make hidden network, repository, or remote mutations.
- Grant the least execution authority required. Read-only discovery and mutating commands must remain distinguishable in policy.
- Never embed credentials, tokens, private repository content, or workstation-specific secret values in checked-in configuration.
- Run `pnpm codex:check` after changing this subtree.
