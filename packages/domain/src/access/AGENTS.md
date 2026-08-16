# Access Domain Scope

This directory owns the canonical business decisions for Repository authorization, Repository Role bundles, Direct Grant mutation, and authority-preserving transitions. It does not own persistence, RLS syntax, framework delivery, or provider behavior.

## GitHub reverse-engineering rule

Repository access semantics start from GitHub's mature Repository Role and access-management behavior, then remove Code/Git-specific permissions. Do not rename or extend the surviving Role model merely to preserve an existing target abstraction.

Current Repository Roles are exactly:

```text
read | triage | write | maintain | admin
```

Their differences must come from accepted no-code Repository actions that survive the GitHub subtraction test. Current accepted action families are Repository read/settings/access management, Page knowledge, Issue work, and Discussion conversation/moderation.

## Inviolable invariants

- `Role` is a named bundle; `Capability` is the authorization decision vocabulary.
- Capability names describe accepted actions on concrete no-code surfaces. Do not collapse Page, Issue, Discussion, and Repository access mutation into generic `resource.create` / `resource.update` / `member.manage` shortcuts.
- `read` may participate in accepted Issue/Discussion collaboration but cannot mutate Page state or Repository administration.
- `triage` may manage accepted Issue/Discussion state but cannot mutate Page state or Repository access.
- `write` adds Page/content mutation and the GitHub-surviving ability to comment on locked Discussions.
- `maintain` adds accepted non-sensitive Repository maintenance such as Announcement creation; it does not manage Repository access or sensitive settings.
- `admin` alone owns sensitive Repository settings and Direct Repository access management.
- Direct Repository Grant create/change/revoke is an Admin operation. `read`, `triage`, `write`, and `maintain` may not manage Direct Grants.
- Every Grant mutation evaluates the actor Role, current target Role, proposed Role, stable Repository, authenticated Actor attribution, and self-target rule.
- Direct Grant delegation cannot target the acting User itself. A future self-leave lifecycle is a different Product operation.
- A successful Grant transition must use the observed current Role as a real persistence precondition. A stale precondition changes no authority and produces no success Evidence.
- Organization `owner` remains a protected governance role. An Organization `admin` may manage only `member` and `admin` relationships.
- An Organization that still exists MUST retain at least one owner.
- Domain decisions remain deterministic, provider-neutral, and independent of Next.js, Supabase, generated database types, and UI state.
- Repository Role bundles, Organization delegation, Repository access management, and ownership continuity remain separate concepts; do not reduce them to one rank comparison.

## Change contract

Any change to a Repository Role, Capability, or access-management rule must:

1. identify the GitHub behavior that survives removal of Code/Git assumptions, or independently prove a no-code Product necessity;
2. update Domain positive/negative decision tests;
3. update Application use-case authorization;
4. update PostgreSQL capability/RLS/RPC enforcement independently;
5. update current Domain/ADR documentation in place rather than appending a correction layer; and
6. add a discriminating test that would fail if the old semantic returned.

A database policy may project these rules, but it may not redefine them.
