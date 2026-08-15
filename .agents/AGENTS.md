# Project Skill Scope

- `.agents/skills` owns repository-pinned operating workflows. A Skill routes work; it does not become Product, Domain, architecture, or implementation truth.
- Give each Skill one narrow owner and a discriminating trigger. Do not create overlapping Skills merely to obtain consensus.
- Keep `SKILL.md` concise and move optional detail into references, scripts, templates, or examples that are loaded only when needed.
- Reference canonical repository contracts instead of copying them into Skill prose. Resolve disagreements in favor of the current task and applicable repository contracts.
- Scripts must be deterministic, bounded, and secret-safe. They must not perform hidden network, remote mutation, or destructive filesystem work.
- When adding or changing a Skill, update its metadata and directly affected validation, then run `pnpm codex:check`.
