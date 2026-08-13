# Codex Desktop History Epoch Design

## Objective

Replace the process-heavy `main` history with one verified current-state root commit so a normal Codex Desktop cold start sees current repository truth rather than formatter, diagnostic, generated-projection, temporary-CI, merge-fix, and superseded implementation steps.

This is a history operation, not a product or architecture change.

## Established facts

- Before this design commit, local and remote `main` both pointed to `e61144d` and contained 115 commits.
- The same history had 38 first-parent commits and many implementation-detail commits whose final effects are already represented by current files, tests, contracts, and instructions.
- The repository instruction chain already declares commits, pull requests, migration history, ADR rationale, and closed-gap archives to be opt-in historical evidence rather than normal current truth.
- There were no tags preserving the pre-epoch history when this design was accepted.
- Old remote feature branches exist. They are separate historical evidence and are not part of this operation.

## Selected approach

Create a new history epoch for `main`:

1. Preserve the complete old graph, including this design, under the annotated tag `archive/pre-current-baseline-2026-08-13` and push that tag before rewriting `main`.
2. Construct one parentless root commit from the exact tree object of `e61144d`. The design file itself is intentionally excluded from the new tree because it is execution history, not current repository truth.
3. Give the new root commit the subject `feat: establish no-code collaboration platform baseline` and a body that identifies the archive tag as opt-in history.
4. Move local `main` to the new root only after the archive tag is confirmed on the remote.
5. Push `main` with an exact `--force-with-lease` expectation for the previously fetched remote SHA. Never use an unconditional force push.

The result is one current baseline commit on `main`. Future changes resume as small semantic commits organized by observable behavior or contract.

## Preserved and discarded information

Preserved:

- Every file and byte in the accepted `e61144d` tree.
- The complete prior commit DAG through the archive tag.
- Existing old remote branches and closed pull-request records.
- Historical commit URLs while the archive tag retains their objects.
- Authorship and timestamps inside the archived graph.

Removed from normal `main` traversal:

- Intermediate formatter and generated-output corrections.
- Temporary diagnostic and CI instrumentation commits.
- Merge-resolution commits and superseded implementation sequences.
- Old commit ancestry and its SHA-based causal ordering.

No old remote branch is deleted. No product file is rewritten merely to make the new history appear cleaner.

## Safety invariants

- The working tree must be clean before the operation.
- Fetch `origin/main` immediately before tagging and again immediately before the force-with-lease push.
- Abort if remote `main` changes after the expected SHA is recorded.
- Check open pull requests and the protected-branch state before rewriting; abort if an active integration depends on the old `main` ancestry or policy rejects the operation.
- Push and verify the archive tag before changing remote `main`.
- The new root tree ID must equal `e61144d^{tree}` exactly.
- `git diff e61144d <new-root>` must be empty.
- Do not delete branches, tags, releases, pull requests, or GitHub Actions evidence.
- Do not rewrite any Supabase Cloud environment. This operation affects Git history only.

## Verification

Before rewriting local `main`:

- Confirm local `main`, `origin/main`, worktree cleanliness, total commit count, and expected old SHA.
- Run `pnpm supabase:verify`.
- Run `pnpm verify:full`.
- Verify the local demo account through a real password grant without printing tokens.

After constructing the root and before pushing:

- Prove tree-ID equality and an empty old-to-new diff.
- Repeat `pnpm supabase:verify` and `pnpm verify:full` on the new root checkout.
- Repeat the password grant.
- Confirm new `main` has exactly one reachable commit and the archive tag still reaches the complete old graph.

After pushing:

- Fetch the remote refs.
- Confirm local `HEAD` equals `origin/main`.
- Confirm `origin/main` has exactly one reachable commit.
- Confirm the remote archive tag resolves to the archived design commit and still reaches `e61144d`.
- Report the old SHA, archive tag SHA, new root SHA, tree equality, verification results, and recovery command.

## Recovery

If rollback is explicitly requested, fetch the archive tag and restore `main` with another exact force-with-lease operation. The archive tag must not be moved or deleted as part of normal development.

Clones retaining the old ancestry must fetch and explicitly align to the new `origin/main`; ordinary pulls across the unrelated histories are not a supported migration path.

## Codex operating rule after the epoch

Normal Codex tasks use the current task, applicable `AGENTS.md` chain, current documentation router, executable code, declarative schemas, and tests. The archive tag, old branches, pull requests, and historical SHA links are consulted only when the task explicitly asks for provenance, regression archaeology, or why a decision changed.
