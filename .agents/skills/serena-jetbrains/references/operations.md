# Serena JetBrains Operations

Use this reference only when exact tool selection, startup diagnosis, or memory maintenance matters.

## Contents

- [Project contract](#project-contract)
- [Install or update only on request](#install-or-update-only-on-request)
- [Start and verify](#start-and-verify)
- [Choose tools by question](#choose-tools-by-question)
- [Trace behavior](#trace-behavior)
- [Refactor safely](#refactor-safely)
- [Inspections and debugging](#inspections-and-debugging)
- [Maintain memories](#maintain-memories)
- [Plan complex work and use worktrees](#plan-complex-work-and-use-worktrees)
- [Evaluate the complete workflow](#evaluate-the-complete-workflow)
- [Troubleshoot](#troubleshoot)
- [Current official references](#current-official-references)

## Project contract

- Treat `.codex/config.toml` as the committed Serena MCP launch contract.
- Treat `.serena/project.yml` as versionable project configuration and `.serena/project.local.yml` as its ignored workstation-specific override.
- Keep Serena optional. Do not block safe repository work merely because the local IDE integration is unavailable.
- Keep machine-specific JetBrains launch paths and personal configuration outside the repository.
- Re-check current official Serena documentation before changing configuration or relying on a newly introduced tool.
- Treat global Serena configuration as user-owned machine state. Do not change it for an ordinary repository task.
- The context is fixed at server startup; modes are composable additions. A backend change also requires a restart.
- A single-project context may deliberately disable `activate_project`.
- In JetBrains mode, the IDE and installed plugins determine language/framework support. The `language_servers` setting is irrelevant to this backend.

## Install or update only on request

When the user explicitly asks to install or update the workstation integration, current official commands include:

```powershell
uv tool install -p 3.13 serena-agent
serena init -b JetBrains
uv tool upgrade serena-agent
```

These are operator procedures, not automatic task setup. Re-check the current official installation page before running them because commands and prerequisites can change.

## Start and verify

1. Open the exact repository root in a supported JetBrains IDE and wait for indexing to complete.
2. Ensure the Serena JetBrains plugin is installed, enabled, and serving the open project.
3. Start Serena from the repository root so its startup project can determine the JetBrains backend.
4. Read `initial_instructions` unless the client already injected or read them in this session.
5. Call `get_current_config` and verify the active project, backend, context, modes, and exposed tools.
6. Call `activate_project` only when the intended project is not already active and the context permits it.

The backend is fixed when Serena starts. If activation reports a backend conflict, restart Serena with the intended project at startup or use a separate MCP server instance for the other backend. Do not attempt an in-session backend switch.

The IDE root, Serena root, shell working directory, and target worktree must identify the same source tree. Correct a mismatch before interpreting empty symbol results. JetBrains owns its index; allow indexing to finish and, after external edits, keep plugin synchronization enabled or use **Reload from Disk** before semantic inspection.

## Choose tools by question

Only call tools exposed by `get_current_config`; optional and beta tools may be absent.

| Question | Preferred Serena operation |
| --- | --- |
| Which project and backend are active? | `get_current_config` |
| What symbols does this large source file own? | `jet_brains_get_symbols_overview` or its exposed canonical equivalent |
| Where is this project symbol? | `jet_brains_find_symbol` or its exposed canonical equivalent |
| Where is a dependency symbol? | `jet_brains_find_symbol` with `search_deps=True` |
| Where is it declared? | `jet_brains_find_declaration` |
| Which symbols implement it? | `jet_brains_find_implementations` |
| Which symbols depend on it? | `jet_brains_find_referencing_symbols` |
| What are its parent or child types? | `jet_brains_type_hierarchy` |
| Which IDE inspections are relevant? | `jet_brains_list_inspections` |
| What inspection findings exist in this file? | `jet_brains_run_inspections` |
| Can this symbol, file, or directory be renamed safely? | `jet_brains_rename` |
| Can this symbol be removed without live usages? | `jet_brains_safe_delete` |
| Is the target a literal, prose, config key, generated text, or unknown name? | Built-in repository search/edit |
| Is this a tiny known-location hunk? | Built-in patch |
| What changed, and does it pass? | Built-in Git, formatter, build, and test tools |
| Which project memories exist? | `list_memories` |
| What durable context does a memory contain? | `read_memory` |
| Has stable project knowledge changed? | `write_memory`, `edit_memory`, or `rename_memory` after evidence review |

Do not broaden a search simply because a tool supports it. Constrain relative paths and symbol names whenever the question permits. Canonical LSP tools can be replaced by `jet_brains_*` effective tools; use the names actually exposed by `get_current_config`. See [tool-catalog.md](tool-catalog.md) for the complete inventory.

## Trace behavior

1. Locate the owning symbol without retrieving unrelated bodies.
2. Read the owner and the smallest necessary surrounding contract.
3. Follow incoming references to identify callers and observable behavior.
4. Follow declarations, implementations, or hierarchy only when polymorphism or dependency ownership matters.
5. Compare semantic results with types, tests, configuration, and repository contracts.
6. Record unknowns when indexing or generated-code boundaries prevent proof.

Additional retrieval rules:

- Serena line numbers are 0-based. Translate deliberately when another UI reports 1-based lines.
- Use a stable `relative_path` plus `name_path` to identify symbols. Overloads can have generated name-path indexes, so rediscover targets after structural edits instead of guessing.
- Retrieve symbol bodies only after locating the relevant candidates; avoid dumping a large file by default.
- Batch independent read-only calls when the client permits it. Keep dependent calls ordered even though Serena may serialize execution internally.

## Refactor safely

1. Establish the intended semantic change and invariants before mutation.
2. Find references and implementations before rename, move, inline, or deletion.
3. Use JetBrains-aware refactors when relationship propagation is essential.
4. Treat beta operations such as move, inline, debug, or safe delete as unavailable unless exposed and justified.
5. For `replace_in_files`, start with a dry run or per-occurrence review, or provide an exact expected count.
6. Inspect every changed file, including imports, generated projections, tests, and documentation affected by a changed contract.
7. Inspect both unstaged and staged diffs. JetBrains move and delete refactors may stage changes even when the surrounding workflow did not explicitly stage files.
8. Run the repository's narrowest deterministic check, then expand verification only when risk or failures justify it.

Never use a semantic refactor to conceal an ownership or architecture mistake. Correct the causal boundary first.

If a semantic operation is unavailable, use a supported alternative only when its correctness boundary is clear. Otherwise report the missing capability and safest next action instead of presenting blind text replacement as a semantic refactor.

## Inspections and debugging

- Use inspections or diagnostics only when the exact tool is exposed and its output answers a concrete question.
- `jet_brains_debug` is optional and BETA. Confirm exposure and read the relevant `serena_info` topic before using it.
- Do not infer debugger availability from generic documentation or a previous session.
- Inspection and debugger output are evidence, not repository validation; correlate them with source, diffs, tests, and runtime behavior.

## Maintain memories

Use memories as progressive-discovery notes, not as another canonical documentation set.

- Prefer terse invariants and durable conventions over narrative.
- Store only facts that are expensive to rediscover and likely to remain useful.
- Use meaningful topic paths and link related memories with `mem:` references when supported by the existing memory graph.
- List memories first and read only the relevant entries. Before any write, edit, rename, deletion, or consolidation, read `memory_maintenance` when present.
- Preserve `mem:` links with `rename_memory` rather than deleting and recreating a memory.
- Respect configured ignored and read-only memory patterns. Do not bypass them through direct filesystem writes.
- Avoid duplicating quick-read facts from repository files; reference the authoritative path instead.
- Run the repository-approved integrity check, commonly `serena memories check .`, after authorized structural memory changes.
- Never copy secrets, private repository content, telemetry dumps, temporary errors, or speculative conclusions into memory.

## Plan complex work and use worktrees

- For complex work, it can be useful to finish evidence gathering and planning before implementation. Persist a plan to memory only when authorized and useful beyond the current session.
- When the project is derived from the current directory, the nearest `.git` boundary wins. Start from the intended worktree root so a parent checkout is not activated accidentally.
- Keep versionable `.serena` configuration available across worktrees when repository policy permits, and keep workstation-only differences in local overrides.
- Re-run root and config checks after changing worktrees, reopening the IDE, restarting Serena, or changing context or modes.
- Serena works with one active project per context. Use cross-project query tools only when exposed and appropriate; do not assume one session can safely mutate multiple roots.

## Evaluate the complete workflow

Choose tools from evidence, not promotion. Compare the complete call chain: discovery operations, returned payload, semantic reach, failure handling, diff review, validation cost, and correctness. Serena tends to provide the most leverage for symbol identity, references, hierarchy, external dependencies, and cross-file refactors. Built-in tools can be clearer and cheaper for configuration, prose, Git, tests, unrestricted literals, and tiny local edits.

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
- [Programming languages](https://oraios.github.io/serena/01-about/020_programming-languages.html)
- [Features](https://oraios.github.io/serena/01-about/025_features.html)
- [Tool catalog](https://oraios.github.io/serena/01-about/035_tools.html)
- [Installation](https://oraios.github.io/serena/02-usage/010_installation.html)
- [Workflow](https://oraios.github.io/serena/02-usage/040_workflow.html)
- [Memories and onboarding](https://oraios.github.io/serena/02-usage/045_memories.html)
- [Configuration](https://oraios.github.io/serena/02-usage/050_configuration.html)
- [Additional usage pointers](https://oraios.github.io/serena/02-usage/999_additional-usage.html)
- [Serena security considerations](https://oraios.github.io/serena/02-usage/070_security.html)
- [Evaluation methodology](https://oraios.github.io/serena/04-evaluation/010_methodology.html)
- [Evaluation prompt](https://oraios.github.io/serena/04-evaluation/020_prompts/010_evaluation-prompt.html)
- [Summary prompt](https://oraios.github.io/serena/04-evaluation/020_prompts/020_summary-prompt.html)
- [Codex on the JetBrains plugin](https://oraios.github.io/serena/04-evaluation/030_results/020_codex_on_jbplugin.html)
