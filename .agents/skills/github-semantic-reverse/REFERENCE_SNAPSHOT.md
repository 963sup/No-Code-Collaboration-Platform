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

`content/` supplies GitHub product documentation evidence. `src/` supplies evidence about how the documentation site is implemented and generated; it never becomes target Product semantics.

## Locked Product benchmark sources

The v2 repair input says “seven concepts” but enumerates eight names. No listed concept is omitted; all eight are covered in `BENCHMARK_CONCEPT_MATRIX.md`.

| Benchmark concept | Locked `github/docs` source |
| --- | --- |
| Enterprise | `content/get-started/learning-about-github/types-of-github-accounts.md` |
| Organization | `content/get-started/learning-about-github/types-of-github-accounts.md` |
| Team | `content/organizations/organizing-members-into-teams/about-teams.md` |
| Collaborator | `content/organizations/managing-user-access-to-your-organizations-repositories/managing-outside-collaborators/adding-outside-collaborators-to-repositories-in-your-organization.md` |
| User / Social | `content/get-started/learning-about-github/types-of-github-accounts.md`; `content/account-and-profile/tutorials/personalize-your-profile.md` |
| Wiki | `content/communities/documenting-your-project-with-wikis/about-wikis.md` |
| Projects | `content/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects.md` |
| Issues | `content/issues/tracking-your-work-with-issues/learning-about-issues/about-issues.md` |

Additional Repository and documentation-architecture evidence:

- `content/repositories/creating-and-managing-repositories/about-repositories.md`
- `content/discussions/collaborating-with-your-community-using-discussions/about-discussions.md`
- `content/README.md`
- `src/README.md`

## Locked source-control exclusion sources

These sources establish the external assumptions that must be subtracted before target admission.

| Excluded external concept | Locked `github/docs` source | External mechanism that does not transfer to the target |
| --- | --- | --- |
| `commit` | `content/get-started/using-git/about-git.md`; `content/pull-requests/reference/commits.md` | A snapshot stored in project history with author/time/message/ancestry semantics |
| `branch` | `content/pull-requests/reference/branches.md` | An isolated line of development created from another line, normally compared and later combined |
| `diff` | `content/pull-requests/reference/branches.md`; `content/pull-requests/how-tos/commit-changes/comparing-commits.md` | A comparison over Git references, commits, merge bases, and changed files/lines |
| `merge` | `content/get-started/using-git/about-git.md`; `content/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request.md` | Combining distinct development lines and their histories |
| `fork` | `content/pull-requests/get-started/about-forks.md` | A Repository copy connected to an upstream Repository so changes can flow back |
| `rebase` | `content/get-started/using-git/about-git-rebase.md` | Reordering, editing, combining, or otherwise rewriting commit history |
| `cherry-pick` | `content/desktop/managing-commits/cherry-picking-a-commit-in-github-desktop.md` | Selecting a commit on one branch and copying it to another branch |
| `tag` | `content/desktop/managing-commits/managing-tags-in-github-desktop.md` | A named reference attached to a commit point in Repository history |
| `HEAD` | `content/get-started/using-git/about-git-rebase.md`; `content/rest/guides/using-the-rest-api-to-interact-with-your-git-database.md` | A Git reference used to address the current branch/commit position in history |

## Locked benchmark conclusions

- User, Organization, and Enterprise are different account semantics; only a User signs in as the human actor.
- Organization is a shared ownership and administration scope; Enterprise centrally governs organizations and does not directly own collaborative resources.
- Team is an organization-member group and access subject, not a collaboration Container or authenticated Actor.
- Outside collaborator is a Repository-access relationship for a non-member, not another identity type.
- Repository is GitHub's fundamental collaboration resource. The target keeps the collaboration boundary and removes code/source-control assumptions.
- User profile and social details are Presentation over User identity; they create no Repository authority.
- Wiki is a Repository documentation surface. The target keeps the Repository-contained knowledge problem but not Git-backed file/history mechanics.
- Projects is a planning surface over work. The target currently keeps planning as a non-owning Projection rather than importing GitHub's separate project object model.
- Issues is a Repository-scoped actionable-work surface. The target keeps the collaboration problem and removes code-line, pull-request, and source-control coupling.

## Integrity rule

If this file is missing, changed to another upstream revision, loses its locked date or coverage, or is rewritten to omit a required concept, the semantic repair process is invalid until the file is restored and the change is explicitly recorded in a new repair cycle.
