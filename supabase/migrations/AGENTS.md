# Migration History Scope

This directory contains the replay contract derived from reviewed declarative schema changes. It is a single replaceable local-development baseline until an identified persistent environment records that baseline as Applied; from that application boundary onward, the frozen baseline and later accepted transitions are append-only.

## Inviolable invariants

- Never edit or delete a migration that an identified persistent environment has applied.
- Every migration MUST move an empty or previously applied database toward the state declared in `supabase/schemas`.
- A migration file proves that a transition is versioned. It does not prove that any persistent environment applied that transition.
- Accepted migrations MUST pass local/CI replay. Applied status MUST be established separately for each environment through its migration ledger and direct provider evidence.
- Security-sensitive migrations MUST include all policy, function privilege, trigger, and grant changes needed to close the boundary; partial deployment states are not acceptable.
- `SECURITY DEFINER` functions introduced by a migration MUST have public execution revoked before selective grants are applied.
- Migration SQL MUST be reviewed as code and replayed by local/CI `supabase db reset --local`.
- No migration workflow may invoke, bind to, or mutate a linked or remote Supabase project without explicit separate user intent and an accepted deployment boundary.
- `20260814190012_local_development_baseline.sql` is the only current replay file and is compiled in `schema_paths` order from `supabase/schemas`.
- Before any persistent application, reviewed local-only changes MUST be consolidated into that one baseline; Git retains development provenance without making every disposable transition part of deployment history.
- Rebaseline is forbidden after any persistent environment applies the baseline or a later migration. From that evidence-backed cutoff forward, accepted migrations are append-only.
- Hosted-project existence alone does not freeze the baseline. The cutoff is an identified environment's Applied migration-ledger evidence.

## State model

```text
Draft
→ generated or written, still under review

Accepted
→ committed and verified through local/CI replay

Applied
→ recorded in one identified environment's migration ledger
```

Applied state is environment-specific and cannot be inferred from Git history or provider-resource existence.

## `LocalOnly` and the baseline

- `LocalOnly` means no identified persistent environment has recorded the repository baseline as Applied. A hosted provider project may exist independently without changing this state.
- `20260814190012_local_development_baseline.sql` is the sole local replay candidate. Empty replay, drift comparison, pgTAP, lint, and generated-type consistency are required before it is Accepted; these checks do not make it remotely Applied.
- Do not manufacture a remote ledger, link an otherwise unclassified hosted project, or create a project merely to validate a migration. Local shadow databases and `db reset --local` are the verification boundary.
- The first accepted persistent application must pass the Runbook/ADR-005 gate. Once its ledger records the baseline as Applied, that baseline timestamp and contents become immutable everywhere.

## Transition workflow

1. Start from an accepted change in `supabase/schemas`.
2. Use the pinned CLI to create/generate a descriptively named Draft migration; never invent timestamps manually.
3. Review destructive statements, lock impact, DML, grants, RLS policies, function security, triggers, view properties, and other diff caveats.
4. Keep a transition atomic across its security boundary. A migration must not expose an intermediate permissive state.
5. Replay from empty local state, run pgTAP and lint, regenerate/check types, then require an empty substantive drift against the declared schemas.
6. Before persistent application, replace the sole baseline with the newly reviewed consolidated state. After persistent application, correct current truth in schemas and append a forward migration without rewriting applied history.

Remote `pull`, `push`, `repair`, linked reset, or MCP migration application is outside this scope until an identified persistent environment and explicit mutation intent exist.
