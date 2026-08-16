# GitHub Docs Reference Snapshot

## Locked benchmark

- Upstream repository: `github/docs`
- Comparison commit: `81ade08c26f13325c0cde8a23cd3bfb85bd0778e`
- Locked date: `2026-08-16`
- Coverage: `content/`, `src/`
- Update condition: the benchmark may be changed only after the current repair cycle has passed its convergence condition. It must not move during the cycle.

## Evidence boundary

This snapshot is evidence for mature product mechanisms, terminology, relationships, and documentation structure. It is not implementation authority and cannot override this repository's Product, Domain, Architecture, or executable contracts.

The benchmark is used to answer:

- What problem does the GitHub concept solve?
- Which part depends on software development or source control?
- Which mechanism survives for an arbitrary no-code Repository?
- Which target concept should be rejected rather than renamed?

## Audited upstream areas

- `content/get-started/learning-about-github/types-of-github-accounts.md`
- `content/organizations/organizing-members-into-teams/about-teams.md`
- `content/organizations/managing-user-access-to-your-organizations-repositories/managing-outside-collaborators/adding-outside-collaborators-to-repositories-in-your-organization.md`
- `content/repositories/creating-and-managing-repositories/about-repositories.md`
- `content/communities/documenting-your-project-with-wikis/about-wikis.md`
- `content/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects.md`
- `content/issues/tracking-your-work-with-issues/learning-about-issues/about-issues.md`
- `content/discussions/collaborating-with-your-community-using-discussions/about-discussions.md`
- `content/README.md`
- `src/README.md`

## Locked benchmark conclusions

- User, Organization, and Enterprise are different account semantics; only a User signs in as the human actor.
- Organization is a shared ownership and administration scope; Enterprise centrally governs organizations and does not directly own collaborative resources.
- Team is an organization-member group and access subject, not a collaboration container or authenticated actor.
- Outside collaborator is a repository-access relationship for a non-member, not another identity type.
- Repository is GitHub's fundamental collaboration resource. The target keeps the collaboration boundary and removes code/source-control assumptions.
- Wiki is a repository documentation surface; Project is a planning surface over work rather than a replacement ownership boundary.
- `content/` establishes product documentation semantics; `src/` contains documentation-platform implementation. Target product conclusions must be derived from the former and must never inherit the latter as product behavior.

## Integrity rule

If this file is missing, changed to another upstream revision, or loses its locked date or coverage, the semantic repair process is invalid until the file is restored and the change is explicitly recorded in a new repair cycle.
