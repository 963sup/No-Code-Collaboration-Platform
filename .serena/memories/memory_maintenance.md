# Memory Maintenance

## Discovery Model

- Core principle: progressive discovery through references, building a graph of memories.
- Initially, agents are provided with the list of all memories (names only).
- Agents should read `mem:core` as the top-level entry point (graph root).
  This memory should contain references to other memories covering major project domains.
  The referenced memories shall, in turn, shall contain references to even more specific memories, and so on.
  The depth of the graph shall depend on the project complexity.
- Use topics/folders to group related memories in order to make the content structure explicit.
  Folders can mirror project structure (e.g. modules like frontend/backend) or topics like debugging, architecture, etc.
- Memory references must use a mem: prefix inside backticks, e.g. `mem:frontend/core`.
  The surrounding text should clearly indicate when to read the memory/which content to expect.
  The text should provide more precise guidance than the memory name alone, 
  i.e. avoid a reference like "frontend debugging: `mem:frontend/debugging` and instead make clear which aspects of frontend debugging are covered.
- Memories themselves should not contain information about when to read them; this is the responsibility of the referring memory.

## Style

Dense agent notes, not prose docs. Prefer invariants, terse bullets. 
Avoid obvious context, rationale, and examples unless they prevent likely mistakes. 
Keep guidance durable and generalizable, not task-local.

## Add/update threshold

Add or update memories only with stable, non-obvious project conventions that avoid complex rediscovery in the future.
Do not add: quick-read facts; generic language/framework knowledge; one-off task notes; volatile line-level details; behavior likely to change soon.

## Maintenance Actions

- Renaming memories: References are updated automatically if handled via Serena's memory rename tool.
- Checking for stale memories (e.g. after deletion): Call `serena memories check` for a report.

## Ownership and Scope

- Global memories are only for durable cross-project conventions. Project memories are only for durable, expensive-to-reconstruct facts owned by this repository.
- Keep repository truth in current contracts and executable evidence; memories are routing and continuity aids, never a competing source of truth.
- Never store secrets, credentials, private content, transient logs, branch/task status, or speculative conclusions.

## Worktree Discipline

- Tracked project memories and `.serena/project.yml` are shared through Git; `.serena/project.local.yml`, cache, and logs remain worktree-local and untracked.
- In every worktree, resolve the nearest `.git`/`.serena` boundary and revalidate the current contracts before relying on memory.
