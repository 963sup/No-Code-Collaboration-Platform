# Collaboration Relationship Kernel Repair — Execution Resolution

## Status

Active on `first-principles/collaboration-relationship-kernel-repair`. No additional development line is created.

## Input precedence

1. `input/collaboration-relationship-kernel-repair-v2.toml` — authoritative behavior and convergence requirements
2. `input/collaboration-relationship-kernel-repair-v2.md` — human-readable v2 mirror
3. `input/collaboration-relationship-kernel-repair-v1.toml` — superseded historical input

## First-principles resolution of repository conflicts

The v2 input names `.agents/skills/github-semantics-first-principles/` as a new Skill location. The current repository already has one narrow GitHub Product semantic owner, `.agents/skills/github-semantic-reverse/`; `.agents/AGENTS.md` forbids overlapping Skills, and the executable validator explicitly records the proposed second name as retired.

The essential requirement is not a folder name. It is a locked benchmark, one glossary, source-of-truth arbitration, dated audit reports, and bounded convergence. Those mechanisms are therefore integrated into the existing single owner:

- `.agents/skills/github-semantic-reverse/SKILL.md`
- `.agents/skills/github-semantic-reverse/REFERENCE_SNAPSHOT.md`
- `.agents/skills/github-semantic-reverse/GLOSSARY.md`
- `.agents/skills/github-semantic-reverse/audit-reports/`

This is a replacement of the requested path implementation, not a weakening of v2 behavior.

## Runtime classification

The uploaded TOML and Markdown files are repair task specifications, not executable Codex subagent definitions. They do not satisfy the repository's `.codex/agents/*.toml` schema and would make `pnpm codex:check` fail. They are preserved unchanged in `input/` and removed from executable agent discovery.

## Source-of-truth arbitration

- Repository code and documentation are authoritative.
- Linear and Notion are mirrors.
- A mirror marked complete cannot make incomplete repository work complete.
- When mirrors disagree with the repository, correct the mirrors after the repository truth is repaired.
- Every mismatch and correction direction is recorded in the dated audit report.

## Execution sequence

1. Establish snapshot, glossary, audit workflow, convergence report, and executable validation.
2. Correct canonical Product and Ontology semantics.
3. Correct architecture decisions, routers, gap register, and documentation validators.
4. Audit and repair code, schema, API, routes, and UI by semantic context.
5. Run repository verification and inspect remote checks.
6. Synchronize Linear and Notion to the resulting code/docs authority.
7. Repeat only unresolved audit items unless a prior pass is formally revoked.

## Completion condition

The latest audit report must cover every excluded concept, and both `revoked` and `not_passed` must be empty. Passing a string scan, changing a mirror, or renaming an old mental model is insufficient.
