---
name: serena-jetbrains
description: Use the local Serena MCP server with its JetBrains language backend for repository activation, semantic code discovery, symbol and dependency navigation, reference and implementation tracing, IDE inspections, relationship-aware refactoring, and durable project-memory maintenance. Use for non-trivial codebase exploration, root-cause analysis, rename or safe-delete work, cross-file changes, and project onboarding or memory updates when Serena is available; fall back to repository-native search and patching when it is not.
---

# Serena JetBrains

Use Serena as a semantic repository interface backed by the open and indexed JetBrains project. Keep repository contracts, executable code, tests, and the current task authoritative.

## Workflow

1. Read the current task, applicable `AGENTS.md` chain, and the narrowest repository contract before using semantic results.
2. Inspect the worktree before any write. Preserve pre-existing changes and keep the task scope explicit.
3. Call `get_current_config` when Serena state is unknown. Confirm that the active project is the intended root, the backend is JetBrains, and the required tools are exposed.
4. Activate the intended project when needed. Require the JetBrains IDE root and Serena project root to match exactly, and allow IDE indexing to finish before trusting missing-symbol results.
5. Start with the cheapest semantic operation that can answer the question:
   - Use a file outline for an unfamiliar code file.
   - Find a symbol before reading its body or broad surrounding files.
   - Trace declarations, implementations, references, or type hierarchy only when the relationship affects the decision.
   - Use text search for prose, configuration, generated text, unknown symbol names, or exact literals.
6. Build the minimum sufficient causal model: owner, inputs, outputs, callers, dependencies, affected contracts, and invariants. Stop exploring when more retrieval is unlikely to change the implementation.
7. Make the smallest correct change. Prefer JetBrains-aware rename or safe-delete operations when relationship propagation is the reason for the edit; use ordinary patches for simple local text changes. Treat beta tools as higher risk and inspect their full diff.
8. Run narrowly relevant JetBrains inspections when they can expose IDE-level problems, then run repository-defined deterministic checks. IDE results supplement tests and never replace them.
9. Review the complete diff and status. Report Serena or IDE limitations instead of presenting fallback text search as equivalent semantic proof.

## Memory discipline

- List and read only the memories relevant to the current question.
- Write or edit memory only for stable, non-obvious project knowledge that prevents costly rediscovery.
- Point memory toward current repository contracts and executable evidence; never let memory override them.
- Update or remove stale memory only after current evidence proves it wrong.
- Never store credentials, tokens, private content, transient logs, speculative conclusions, or task-status narration.
- Keep workstation-wide habits outside project memory.

## Safety and fallback

- Keep write-capable Serena operations approval-gated and within the user-requested scope.
- Do not commit machine-local IDE paths, plugin credentials, personal settings, or network exposure changes.
- Do not change Serena's backend during a running session. Restart the server with the intended project/backend when they conflict.
- If Serena, the plugin, or the IDE index is unavailable, continue with `rg`, bounded file reads, repository-native edits, and deterministic verification when safe.
- If external edits appear stale in JetBrains, keep plugin file synchronization enabled or reload the project from disk before using semantic results.

Read [references/operations.md](references/operations.md) when selecting exact Serena tools, diagnosing JetBrains startup or indexing problems, or maintaining project memories.
