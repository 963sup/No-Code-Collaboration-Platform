# Serena Tool Catalog

This is a capability catalog, not a promise that every tool is callable. `get_current_config` is always the authority for the tools exposed by the current backend, context, modes, and configuration.

Source: [Serena Tools](https://oraios.github.io/serena/01-about/035_tools.html), checked 2026-08-15.

## Contents

- [Availability and naming](#availability-and-naming)
- [symbol_tools (13)](#symbol_tools-13)
- [jetbrains_tools (13)](#jetbrains_tools-13)
- [cmd_tools (1)](#cmd_tools-1)
- [config_tools (4)](#config_tools-4)
- [file_tools (10)](#file_tools-10)
- [memory_tools (6)](#memory_tools-6)
- [query_project_tools (2)](#query_project_tools-2)
- [workflow_tools (3)](#workflow_tools-3)

## Availability and naming

- **Default** means the official catalog does not mark the tool optional; contexts or configuration can still hide it.
- **Optional** means disabled by default in the official catalog and available only when enabled and supported.
- **BETA** means the official catalog marks the tool experimental; require current exposure and a stronger verification boundary.
- Canonical LSP-backed tools such as `find_symbol` may be replaced in an effective JetBrains toolset by `jet_brains_*` equivalents. Choose from the names returned by `get_current_config`, not from catalog expectation.

## symbol_tools (13)

| Tool | Status | Purpose |
| --- | --- | --- |
| `find_declaration` | Default | Find a symbol's declaration location. |
| `find_implementations` | Default | Find implementations of a symbol. |
| `find_referencing_symbols` | Default | Find symbols that reference the target symbol. |
| `find_symbol` | Default | Locate symbols by name path, optionally with bodies and local filters. |
| `get_diagnostics_for_file` | Default | Return language-server diagnostics for a file. |
| `get_diagnostics_for_symbol` | Optional | Return diagnostics scoped to a symbol. |
| `get_symbols_overview` | Default | Summarize the top-level symbol structure of a file. |
| `insert_after_symbol` | Default | Insert content after a symbol definition. |
| `insert_before_symbol` | Default | Insert content before a symbol definition. |
| `rename_symbol` | Default | Rename a symbol through semantic references. |
| `replace_symbol_body` | Default | Replace the complete body of a symbol definition. |
| `restart_language_server` | Optional | Restart the active language server. |
| `safe_delete_symbol` | Default | Delete a symbol after checking semantic usages. |

## jetbrains_tools (13)

All tools in this category are optional and require the JetBrains backend.

| Tool | Status | Purpose |
| --- | --- | --- |
| `jet_brains_debug` | Optional, BETA | Control a JetBrains debugger session through the documented BETA workflow. |
| `jet_brains_find_declaration` | Optional | Find a symbol declaration through the IDE index. |
| `jet_brains_find_implementations` | Optional | Find implementations through the IDE index. |
| `jet_brains_find_referencing_symbols` | Optional | Find semantic references through the IDE index. |
| `jet_brains_find_symbol` | Optional | Search project symbols and, when requested, dependency symbols. |
| `jet_brains_get_symbols_overview` | Optional | Summarize symbols in a file using JetBrains structure data. |
| `jet_brains_inline_symbol` | Optional, BETA | Inline a supported symbol with the JetBrains refactoring engine. |
| `jet_brains_list_inspections` | Optional | List available JetBrains inspections. |
| `jet_brains_move` | Optional, BETA | Move a symbol or file with JetBrains refactoring support. |
| `jet_brains_rename` | Optional | Rename a symbol with the JetBrains refactoring engine. |
| `jet_brains_run_inspections` | Optional | Run selected JetBrains inspections. |
| `jet_brains_safe_delete` | Optional, BETA | Safely delete a supported symbol or file through JetBrains. |
| `jet_brains_type_hierarchy` | Optional | Return supertypes or subtypes from the IDE index. |

## cmd_tools (1)

| Tool | Status | Purpose |
| --- | --- | --- |
| `execute_shell_command` | Default | Execute a shell command in the active project environment. |

## config_tools (4)

| Tool | Status | Purpose |
| --- | --- | --- |
| `activate_project` | Default | Activate a project when the current context permits project switching. |
| `get_current_config` | Default | Report active project, backend, context, modes, and exposed tools. |
| `open_dashboard` | Optional | Open Serena's local dashboard. |
| `remove_project` | Optional | Remove a project from Serena's known project configuration. |

## file_tools (10)

| Tool | Status | Purpose |
| --- | --- | --- |
| `create_text_file` | Default | Create or overwrite a UTF-8 text file. |
| `delete_lines` | Optional | Delete an inclusive 0-based line range. |
| `find_file` | Default | Find files by name pattern within a relative path. |
| `insert_at_line` | Optional | Insert content at a 0-based line position. |
| `list_dir` | Default | List entries in a project-relative directory. |
| `read_file` | Default | Read all or part of a text file. |
| `replace_content` | Default | Replace literal or regular-expression content in one file. |
| `replace_in_files` | Default | Replace literal or regular-expression content across matching files. |
| `replace_lines` | Optional | Replace an inclusive 0-based line range. |
| `search_for_pattern` | Default | Search project files for a text or regular-expression pattern. |

## memory_tools (6)

| Tool | Status | Purpose |
| --- | --- | --- |
| `delete_memory` | Default | Delete a project memory. |
| `edit_memory` | Default | Edit content inside an existing memory. |
| `list_memories` | Default | List memories available to the active project. |
| `read_memory` | Default | Read a project memory. |
| `rename_memory` | Default | Rename a memory and update supported `mem:` references. |
| `write_memory` | Default | Create or replace a project memory. |

## query_project_tools (2)

| Tool | Status | Purpose |
| --- | --- | --- |
| `list_queryable_projects` | Optional | List projects available for cross-project querying. |
| `query_project` | Optional | Ask a read-only question of another configured project. |

## workflow_tools (3)

| Tool | Status | Purpose |
| --- | --- | --- |
| `initial_instructions` | Default | Load Serena's current operational instructions. |
| `onboarding` | Default | Inspect a project and create initial project memories. |
| `serena_info` | Optional | Retrieve detailed help for a Serena topic or advanced workflow. |
