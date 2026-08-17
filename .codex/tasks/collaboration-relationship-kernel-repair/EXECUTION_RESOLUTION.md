# Collaboration Relationship Kernel Repair — Execution Resolution

## Status

Active on `first-principles/collaboration-relationship-kernel-repair`. No additional development line is created.

## Input precedence

1. `input/collaboration-relationship-kernel-repair-v2.toml` — authoritative behavior and convergence requirements
2. `input/collaboration-relationship-kernel-repair-v2.md` — human-readable v2 mirror
3. `input/collaboration-relationship-kernel-repair-v1.toml` — superseded historical input

## First-principles resolution of repository conflicts

The repository must have one GitHub-derived Product semantic Skill owner, not two. The existing single owner invariant remains; this round changes that owner's canonical identity instead of adding a peer. The earlier cycle satisfied the invariant by keeping `.agents/skills/github-semantic-reverse/` and treating the v2 path as retired. The current task explicitly requires a reusable Skill at the v2 canonical location plus a paired Codex implementation agent.

The root correction is therefore an atomic owner migration rather than an additive second Skill:

- canonical Skill: `.agents/skills/github-semantics-first-principles/SKILL.md`
- locked evidence: `.agents/skills/github-semantics-first-principles/REFERENCE_SNAPSHOT.md`
- single translation authority: `.agents/skills/github-semantics-first-principles/GLOSSARY.md`
- benchmark matrix and executable semantic evidence remain inside the same canonical Skill root
- convergence reports: `.agents/skills/github-semantics-first-principles/audit-reports/`
- paired repository-local implementation specialist: `.codex/agents/github-semantics-first-principles.toml`

The old `.agents/skills/github-semantic-reverse/SKILL.md` discovery path must not remain after migration. Historical Git evidence may show the former name; current Skill routing must not.

## Runtime classification

The preserved v1/v2 TOML and Markdown files are repair specifications, not executable Codex subagent definitions. They remain unchanged under `input/` and must not appear as `.codex/agents/*.toml` roles.

The paired implementation agent is a separate, purpose-built Codex role using the current supported agent schema. It explicitly selects the canonical Skill by name and receives workspace-write only for repository-local root correction.

Workspace-write is not publication authority. The agent must not independently commit, push, merge, deploy, promote, mutate a remote Supabase project, change production flags, or write external mirrors.

## Source-of-truth arbitration

- Repository code and documentation are authoritative.
- Linear and Notion are mirrors.
- A mirror marked complete cannot make incomplete repository work complete.
- When mirrors disagree with the repository, correct the mirrors after repository truth is repaired.
- Every mismatch and correction direction is recorded in the dated audit report.

## Continuous execution sequence

1. Read the locked snapshot, glossary, benchmark matrix, latest audit, and narrow current repository contracts.
2. Reverse the underlying GitHub collaboration problem from the locked evidence.
3. Remove every code/source-control/execution assumption and rebuild the minimum no-code model.
4. Admit or reject the concept with an explicit falsifying scenario and Repository authority/containment proof.
5. Record confirmed violations in the audit and required mirrors before repair.
6. Correct the earliest wrong repository truth boundary, then only the affected downstream projections.
7. Run the narrowest deterministic falsifier, then required Codex/repository/database/browser checks by impact.
8. Run Codex Security when authority, trust, secret, provider, telemetry, or tool/agent write boundaries change.
9. Classify the latest audit as `newly_passed`, `maintained_passed`, `revoked`, and `not_passed`.
10. Synchronize Linear then Notion from actual code/docs state.
11. Integrate only when the latest audit is converged and exact-candidate verification has no blocking failure.

## Completion condition

The latest audit report must cover every required benchmark/excluded concept, both `revoked` and `not_passed` must be empty, required deterministic verification must pass, and required mirrors must match code/docs. Passing a string scan, changing a mirror, renaming an old mental model, or granting a local agent write access is insufficient by itself.
