# Serena JetBrains Operations

Use this reference only when exact tool selection, startup diagnosis, or memory maintenance matters.

## Project contract

- Treat `.codex/config.toml` as the committed Serena MCP launch contract.
- Treat `.serena/project.yml` as the project-specific backend and tool-selection contract.
- Keep Serena optional. Do not block safe repository work merely because the local IDE integration is unavailable.
- Keep machine-specific JetBrains launch paths and personal configuration outside the repository.
- Re-check current official Serena documentation before changing configuration or relying on a newly introduced tool.

## Start and verify

1. Open the exact repository root in a supported JetBrains IDE and wait for indexing to complete.
2. Ensure the Serena JetBrains plugin is installed, enabled, and serving the open project.
3. Start Serena from the repository root so its startup project can determine the JetBrains backend.
4. Call `get_current_config` and verify the active project, backend, context, modes, and exposed tools.
5. Call `activate_project` only when the intended project is not already active.

The backend is fixed when Serena starts. If activation reports a backend conflict, restart Serena with the intended project at startup or use a separate MCP server instance for the other backend. Do not attempt an in-session backend switch.

The IDE root and Serena root must be one-to-one. Correct a root mismatch before interpreting empty symbol results. If files changed outside JetBrains, keep plugin synchronization enabled or use **Reload from Disk** before semantic inspection.

## Choose tools by question

Only call tools exposed by `get_current_config`; optional and beta tools may be absent.

| Question | Preferred Serena operation |
| --- | --- |
| Which project and backend are active? | `get_current_config` |
| What symbols does this file own? | `jet_brains_get_symbols_overview` |
| Where is this symbol? | `jet_brains_find_symbol` |
| Where is it declared? | `jet_brains_find_declaration` |
| Which symbols implement it? | `jet_brains_find_implementations` |
| Which symbols depend on it? | `jet_brains_find_referencing_symbols` |
| What are its parent or child types? | `jet_brains_type_hierarchy` |
| Which IDE inspections are relevant? | `jet_brains_list_inspections` |
| What inspection findings exist in this file? | `jet_brains_run_inspections` |
| Can this symbol, file, or directory be renamed safely? | `jet_brains_rename` |
| Can this symbol be removed without live usages? | `jet_brains_safe_delete` |
| Is the target a literal, prose, config key, or unknown name? | `search_for_pattern`, then repository-native search if needed |
| Which project memories exist? | `list_memories` |
| What durable context does a memory contain? | `read_memory` |
| Has stable project knowledge changed? | `write_memory`, `edit_memory`, or `rename_memory` after evidence review |

Do not broaden a search simply because a tool supports it. Constrain relative paths and symbol names whenever the question permits.

## Trace behavior

1. Locate the owning symbol without retrieving unrelated bodies.
2. Read the owner and the smallest necessary surrounding contract.
3. Follow incoming references to identify callers and observable behavior.
4. Follow declarations, implementations, or hierarchy only when polymorphism or dependency ownership matters.
5. Compare semantic results with types, tests, configuration, and repository contracts.
6. Record unknowns when indexing or generated-code boundaries prevent proof.

## Refactor safely

1. Establish the intended semantic change and invariants before mutation.
2. Find references and implementations before rename, move, inline, or deletion.
3. Use JetBrains-aware refactors when relationship propagation is essential.
4. Treat beta operations such as move, inline, debug, or safe delete as unavailable unless exposed and justified.
5. Inspect every changed file, including imports, generated projections, tests, and documentation affected by a changed contract.
6. Run the repository's narrowest deterministic check, then expand verification only when risk or failures justify it.

Never use a semantic refactor to conceal an ownership or architecture mistake. Correct the causal boundary first.

## Maintain memories

Use memories as progressive-discovery notes, not as another canonical documentation set.

- Prefer terse invariants and durable conventions over narrative.
- Store only facts that are expensive to rediscover and likely to remain useful.
- Use meaningful topic paths and link related memories with `mem:` references when supported by the existing memory graph.
- Avoid duplicating quick-read facts from repository files; reference the authoritative path instead.
- Run `serena memories check` from the project root after structural memory changes when the CLI is available.
- Never copy secrets, private repository content, telemetry dumps, temporary errors, or speculative conclusions into memory.

## Troubleshoot

| Symptom | Response |
| --- | --- |
| Serena tools are absent | Confirm the MCP server is enabled and started; continue with repository-native tools if it is optional. |
| Backend mismatch error | Restart Serena with the intended project/backend at startup. |
| Project cannot be found | Activate by exact project path or name and confirm the configured root. |
| Symbols are missing | Wait for IDE indexing, verify the root, reload external edits, then retry a narrowly scoped lookup. |
| JetBrains operation is unavailable | Check `get_current_config`; use the closest safe read-only operation or repository-native fallback. |
| Refactor changes too much | Stop, inspect the diff, and restore only task-owned changes through a safe targeted edit. |
| Memory conflicts with code or contracts | Treat the current contract and executable evidence as authoritative, then update the stale memory if authorized. |

## Current official references

- [Serena JetBrains plugin](https://oraios.github.io/serena/02-usage/025_jetbrains_plugin.html)
- [Serena tool catalog](https://oraios.github.io/serena/01-about/035_tools.html)
- [Serena memories](https://oraios.github.io/serena/02-usage/045_memories.html)
- [Serena security considerations](https://oraios.github.io/serena/02-usage/070_security.html)
