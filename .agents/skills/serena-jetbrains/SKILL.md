---
name: serena-jetbrains
description: Use the local Serena MCP server backed by JetBrains for semantic code navigation, reference tracing, diagnostics, external-dependency lookup, and relationship-aware refactoring. Use when a repository task benefits from symbol identity, type or implementation relationships, or cross-file semantic changes; combine it with built-in file, Git, and test tools when those are the more precise surface.
---

# Serena JetBrains

Use Serena as a semantic repository interface backed by the open and indexed JetBrains project. Keep repository contracts, executable code, tests, and the current task authoritative.

## Workflow

1. Read the current task, applicable `AGENTS.md` chain, and the narrowest repository contract before using semantic results.
2. Inspect the worktree before any write. Preserve pre-existing changes and keep the task scope explicit.
3. Read Serena's `initial_instructions` before a coding task unless the client already injected or read them in the current session. Then call `get_current_config` and confirm the active project, backend, context, modes, and tools actually exposed.
4. Activate the intended project when needed. Require the JetBrains IDE root and Serena project root to match exactly, and allow IDE indexing to finish before trusting missing-symbol results.
5. Start with the cheapest reliable operation that can answer the question:
   - Use a file outline for an unfamiliar code file.
   - Find a symbol before reading its body or broad surrounding files.
   - Trace declarations, implementations, references, or type hierarchy only when the relationship affects the decision.
   - Use built-in text search for prose, configuration, generated text, unknown symbol names, or exact literals.
6. Build the minimum sufficient causal model: owner, inputs, outputs, callers, dependencies, affected contracts, and invariants. Stop exploring when more retrieval is unlikely to change the implementation.
7. Make the smallest correct change. Prefer JetBrains-aware rename or safe-delete operations when relationship propagation is the reason for the edit; use ordinary patches for simple local text changes. Treat beta tools as higher risk and inspect their full diff.
8. Run narrowly relevant JetBrains inspections when they can expose IDE-level problems, then run repository-defined deterministic checks. IDE results supplement tests and never replace them.
9. Review both unstaged and staged diffs plus status. Report Serena or IDE limitations instead of presenting fallback text search as equivalent semantic proof.

## Choose the right surface

Prefer Serena when the operation depends on semantic identity: symbols, declarations, implementations, references, type hierarchy, diagnostics, external dependencies, or relationship-aware cross-file refactors. Prefer built-in repository tools for file inventory, unrestricted literal search, configuration and prose, Git state, tests, formatting, builds, and tiny known-location edits.

Mixed workflows are normal. Use the lowest-cost reliable tool for discovery, Serena for the relationship-sensitive core, and built-in tools for repository-wide verification. Compare the full call chain, payload, correctness, and validation cost; do not assume either surface is universally better. Batch independent read-only requests when useful, but keep dependent calls ordered.

## Memory discipline

- List and read only the memories relevant to the current question. Before memory writes or restructuring, read `memory_maintenance` when present.
- Write or edit memory only for stable, non-obvious project knowledge that prevents costly rediscovery.
- Point memory toward current repository contracts and executable evidence; never let memory override them.
- Update or remove stale memory only after current evidence proves it wrong.
- Never store credentials, tokens, private content, transient logs, speculative conclusions, or task-status narration.
- Keep workstation-wide habits outside project memory.

## Safety and fallback

- Keep write-capable Serena operations approval-gated and within the user-requested scope.
- Do not silently install or upgrade Serena, change its global configuration, switch its backend, or edit project configuration merely to complete a repository task. Those are user-controlled machine or project operations.
- Do not commit machine-local IDE paths, plugin credentials, personal settings, or network exposure changes.
- Do not change Serena's backend during a running session. Restart the server with the intended project/backend when they conflict.
- If Serena, the plugin, or the IDE index is unavailable, continue with `rg`, bounded file reads, repository-native edits, and deterministic verification when safe.
- If external edits appear stale in JetBrains, keep plugin file synchronization enabled or reload the project from disk before using semantic results.

Read [references/operations.md](references/operations.md) when selecting exact operations, diagnosing JetBrains startup or indexing problems, working across worktrees, or maintaining project memories. Read [references/tool-catalog.md](references/tool-catalog.md) only when the complete canonical inventory, category counts, optional/BETA status, or canonical-to-JetBrains tool mapping is needed.
