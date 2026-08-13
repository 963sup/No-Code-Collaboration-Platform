# Migration History Scope

This directory is append-only accepted replayable database transition history derived from reviewed declarative schema changes.

## Inviolable invariants

- Never edit an already accepted migration to redefine current truth.
- Every migration MUST move an empty or previously applied database toward the state declared in `supabase/schemas`.
- A migration file proves that a transition is versioned. It does not prove that any persistent environment applied it.
- Accepted migrations MUST pass local/CI replay. Applied status MUST be established separately for each environment through its migration ledger and direct provider evidence.
- Security-sensitive migrations MUST include all policy, function privilege, trigger, and grant changes needed to close the boundary; partial deployment states are not acceptable.
- `SECURITY DEFINER` functions introduced by a migration MUST have public execution revoked before selective grants are applied.
- Migration SQL MUST be reviewed as code and replayed by local/CI `supabase db reset --local`.
- No migration workflow may invoke, bind to, or mutate a linked or remote Supabase project without explicit separate user intent and an accepted deployment boundary.
- `20260813145001_initial_collaboration_baseline.sql` is the immutable initial deployment cutoff. Earlier local/CI-only transitions remain available through Git history but are not part of current replay.
- Rebaseline is forbidden after any persistent environment has applied the current baseline or a later migration. From this cutoff forward, accepted migrations are append-only.

## State model

```text
Draft
→ generated or written, still under review

Accepted
→ committed and verified through local/CI replay

Applied
→ recorded in one identified environment's migration ledger
```

Applied state is environment-specific and cannot be inferred from Git history.

## `projects: []` and the baseline

- With no discovered Cloud project and no linked project reference, this directory describes deployment intent and local/CI replay only.
- `20260813145001_initial_collaboration_baseline.sql` is Accepted because empty local replay, drift comparison, pgTAP, lint, and generated types pass. It is not remotely Applied.
- Do not manufacture a remote ledger or create/link a project to validate a migration. Local shadow databases and `db reset --local` are the verification boundary.
- The first persistent environment must begin from this baseline through the separately approved provisioning workflow. After any persistent environment applies it, its timestamp and contents are immutable everywhere.

## Transition workflow

1. Start from an accepted change in `supabase/schemas`.
2. Use the pinned CLI to create/generate a descriptively named Draft migration; never invent timestamps manually.
3. Review destructive statements, lock impact, DML, grants, RLS policies, function security, triggers, view properties, and other diff caveats.
4. Keep a transition atomic across its security boundary. A migration must not expose an intermediate permissive state.
5. Replay from empty local state, run pgTAP and lint, regenerate/check types, then require an empty substantive drift against the declared schemas.
6. Once Accepted, append the next migration. Correct current truth in schemas and add a forward migration; do not rewrite the baseline or earlier accepted files.

Remote `pull`, `push`, `repair`, linked reset, or MCP migration application is outside this scope until an identified persistent environment and explicit mutation intent exist.
