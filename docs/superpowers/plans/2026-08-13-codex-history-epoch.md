# Codex Desktop History Epoch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the process-heavy `main` graph with one verified current-state root commit while preserving the complete old graph under a remote archive tag.

**Architecture:** Treat Git objects as the boundary: archive the complete pre-epoch graph, then create a parentless commit directly from the already accepted `e61144d^{tree}` object. Prove identical tree content before an exact force-with-lease update of `origin/main`; never rebuild the snapshot by copying files or replaying selected commits.

**Tech Stack:** Git object database and refs, GitHub CLI/API, PowerShell, pnpm, Supabase CLI, pgTAP.

## Global Constraints

- Preserve every byte in `e61144d^{tree}` in the new `main` root.
- Preserve the full old DAG under annotated tag `archive/pre-current-baseline-2026-08-13` before rewriting remote `main`.
- Keep the design and this plan in the archive only; neither belongs in the new current-state tree.
- Never use unconditional `--force`; use `--force-with-lease=refs/heads/main:e61144dd4b787d45b47b134622d631ef6539e370`.
- Abort on a dirty worktree, unexpected remote movement, an open integration depending on old ancestry, failed verification, tree mismatch, or unverified archive tag.
- Do not delete or rewrite old remote branches, pull requests, releases, Actions evidence, or any Supabase Cloud environment.
- Do not print Supabase access or refresh tokens.

---

### Task 1: Freeze the source and integration boundary

**Files:**
- Read: `docs/superpowers/specs/2026-08-13-codex-history-epoch-design.md`
- Read: repository Git refs and GitHub pull-request/protection state

**Interfaces:**
- Consumes: accepted baseline SHA `e61144d`, remote `origin/main`, repository `963sup/No-Code-Collaboration-Platform`
- Produces: exact `expectedRemoteMain`, clean-worktree proof, no-open-integration proof, and protection-state evidence

- [ ] **Step 1: Confirm the local source state**

Run:

```powershell
git status --short
git branch --show-current
git rev-parse e61144d^{commit}
git rev-parse e61144d^{tree}
git log -2 --oneline
```

Expected: clean output from `status`, branch `main`, baseline resolves, and the design/plan commits are the only local commits above `e61144d`.

- [ ] **Step 2: Fetch and freeze the remote lease value**

Run:

```powershell
git fetch origin main
git rev-parse origin/main
git rev-list --left-right --count origin/main...HEAD
```

Expected: `origin/main` is exactly `e61144d`; local-only commits are the design and this plan. Record the full remote SHA as `expectedRemoteMain`. Abort if it differs.

- [ ] **Step 3: Check active GitHub integration state**

Run:

```powershell
gh pr list --repo 963sup/No-Code-Collaboration-Platform --state open --json number,headRefName,baseRefName,title
gh api repos/963sup/No-Code-Collaboration-Platform/branches/main/protection
```

Expected: no open PR targets `main` with work that depends on its current ancestry. Record whether protection permits the approved rewrite; a `404` means no protection resource. Abort rather than bypass an unexpected policy.

### Task 2: Verify the accepted source tree

**Files:**
- Verify: all tracked files in `e61144d^{tree}`
- Verify: `supabase/seed.sql`

**Interfaces:**
- Consumes: current local Supabase stack and the accepted source tree
- Produces: fresh repository, database, pgTAP, generated-type, and login evidence

- [ ] **Step 1: Run the complete database boundary**

Run:

```powershell
pnpm.cmd supabase:verify
```

Expected: local reset succeeds, DB lint reports no errors, all 4 pgTAP files and 86 assertions pass, and generated database types are current.

- [ ] **Step 2: Run the complete repository boundary**

Run:

```powershell
pnpm.cmd verify:full
```

Expected: exit code 0 with repository contracts, architecture, formatting, lint, typecheck, tests, build, and reachability checks successful according to the pinned script.

- [ ] **Step 3: Verify the seeded login contract**

Read local `API_URL` and `ANON_KEY` from the pinned CLI status output, request `/auth/v1/token?grant_type=password` with `sup@a-i.tw` / `Aa12341234`, and print only:

```json
{
  "email": "sup@a-i.tw",
  "userId": "00000000-0000-0000-0000-00000000d001",
  "accessTokenPresent": true,
  "refreshTokenPresent": true
}
```

Expected: exact email/user ID and both booleans true; token strings remain undisclosed.

### Task 3: Publish the recovery anchor

**Files:**
- Archive only: `docs/superpowers/specs/2026-08-13-codex-history-epoch-design.md`
- Archive only: `docs/superpowers/plans/2026-08-13-codex-history-epoch.md`

**Interfaces:**
- Consumes: the plan commit at the complete old-graph tip
- Produces: immutable remote tag `archive/pre-current-baseline-2026-08-13`

- [ ] **Step 1: Create the annotated archive tag**

Run:

```powershell
git tag -a archive/pre-current-baseline-2026-08-13 HEAD -m "Archive main before Codex current-state history epoch"
git rev-parse archive/pre-current-baseline-2026-08-13^{commit}
git merge-base --is-ancestor e61144d archive/pre-current-baseline-2026-08-13^{commit}
```

Expected: the tag resolves to the plan commit and reaches `e61144d`.

- [ ] **Step 2: Push and independently verify the archive tag**

Run:

```powershell
git push origin refs/tags/archive/pre-current-baseline-2026-08-13
git ls-remote --tags origin refs/tags/archive/pre-current-baseline-2026-08-13 refs/tags/archive/pre-current-baseline-2026-08-13^{}
```

Expected: the peeled remote tag SHA equals the local archived plan commit. Stop if the tag is missing or resolves elsewhere.

### Task 4: Construct the parentless current-state root

**Files:**
- Remove from new current tree: `docs/superpowers/specs/2026-08-13-codex-history-epoch-design.md`
- Remove from new current tree: `docs/superpowers/plans/2026-08-13-codex-history-epoch.md`
- Preserve unchanged: every path in `e61144d^{tree}`

**Interfaces:**
- Consumes: immutable tree object `e61144d^{tree}` and verified archive tag
- Produces: one parentless commit with an identical tree

- [ ] **Step 1: Remove archive-only planning files from the worktree**

Use `apply_patch` to delete the design and plan files. Do not commit their deletion to the old graph; the archive tag already preserves both.

Expected: the only worktree changes are deletion of those two files.

- [ ] **Step 2: Create the root directly from the accepted tree**

Run the equivalent of:

```powershell
$baselineTree = git rev-parse e61144d^{tree}
$newRoot = git commit-tree $baselineTree -m "feat: establish no-code collaboration platform baseline" -m "Current repository truth begins here. Full pre-epoch history is preserved at archive/pre-current-baseline-2026-08-13 and is opt-in for provenance or regression archaeology only."
```

Expected: `$newRoot` resolves to a commit with no parent and tree `$baselineTree`.

- [ ] **Step 3: Prove object-level equivalence before moving the branch**

Run:

```powershell
git rev-parse e61144d^{tree}
git rev-parse $newRoot^{tree}
git diff --exit-code e61144d $newRoot
git rev-list --parents -n 1 $newRoot
```

Expected: tree IDs are identical, diff is empty, and the final line contains only `$newRoot` with no parent SHA.

- [ ] **Step 4: Move local `main` with a compare-and-swap ref update**

Run:

```powershell
$archivedTip = git rev-parse HEAD
git update-ref refs/heads/main $newRoot $archivedTip
git status --short
git rev-list --count main
```

Expected: clean worktree and exactly one commit reachable from local `main`.

### Task 5: Re-verify the new epoch

**Files:**
- Verify: the complete new root tree

**Interfaces:**
- Consumes: local parentless `main`
- Produces: fresh proof that history replacement did not alter behavior

- [ ] **Step 1: Repeat database verification**

Run `pnpm.cmd supabase:verify`.

Expected: the same reset/lint/86-pgTAP/types result as Task 2.

- [ ] **Step 2: Repeat full repository verification**

Run `pnpm.cmd verify:full`.

Expected: exit code 0.

- [ ] **Step 3: Repeat the token-safe password grant**

Use the Task 2 request and print only the four safe fields.

Expected: the exact same successful result.

- [ ] **Step 4: Recheck archive and tree invariants**

Run:

```powershell
git diff --exit-code e61144d main
git rev-parse e61144d^{tree}
git rev-parse main^{tree}
git rev-list --count main
git merge-base --is-ancestor e61144d archive/pre-current-baseline-2026-08-13^{commit}
```

Expected: no diff, identical tree IDs, one `main` commit, and archived old history reachable.

### Task 6: Lease-guarded remote replacement and audit

**Files:**
- Mutate: remote ref `refs/heads/main`
- Preserve: remote tag `refs/tags/archive/pre-current-baseline-2026-08-13`

**Interfaces:**
- Consumes: verified `expectedRemoteMain` and verified local one-commit `main`
- Produces: remote one-commit current epoch plus recovery evidence

- [ ] **Step 1: Fetch without merging and revalidate the lease**

Run:

```powershell
git fetch origin main
git rev-parse origin/main
```

Expected: remote SHA still equals `expectedRemoteMain`. Abort on any movement.

- [ ] **Step 2: Push with the exact lease**

Run:

```powershell
git push --force-with-lease=refs/heads/main:e61144dd4b787d45b47b134622d631ef6539e370 origin main
```

Expected: remote reports a forced update from the expected old SHA to the new root. Do not retry with a weaker force option if rejected.

- [ ] **Step 3: Fetch and audit remote truth**

Run:

```powershell
git fetch origin main refs/tags/archive/pre-current-baseline-2026-08-13
git rev-parse HEAD
git rev-parse origin/main
git rev-list --count origin/main
git ls-remote --tags origin refs/tags/archive/pre-current-baseline-2026-08-13 refs/tags/archive/pre-current-baseline-2026-08-13^{}
git status --short
```

Expected: `HEAD == origin/main`, remote `main` count is 1, the archive tag still peels to the archived plan commit, and the worktree is clean.

- [ ] **Step 4: Report recovery information**

Report:

- old remote main SHA `e61144d`;
- archived plan-tip SHA;
- new root SHA;
- archive tag name;
- identical old/new tree SHA;
- verification results;
- explicit warning that old clones must fetch and realign rather than merge unrelated histories;
- recovery requires an explicit request and an exact force-with-lease push from the archive tag.
