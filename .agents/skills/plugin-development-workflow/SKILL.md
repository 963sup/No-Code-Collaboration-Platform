---
name: plugin-development-workflow
description: Use for non-trivial product, implementation, review, release, or provider-validation work to route Linear, GitHub, Notion, Context7, Codex Security, Vercel, and Supabase by truth class without creating duplicate sources of truth.
---

# Plugin Development Workflow

1. Start from the current task, applicable `AGENTS.md`, `docs/README.md`, the narrowest current contract, current gap when relevant, then executable evidence. Plugins never override that order.
2. Classify the task before choosing tools. Never invoke all seven plugins ceremonially.
3. Use **Notion** for durable human knowledge, research synthesis, or accepted semantic/decision summaries. Do not treat Notion as current code/schema/CI truth.
4. Use **Linear** for the executable work graph: issue scope, dependencies, priority, acceptance criteria, and progress. Link to canonical repository contracts/gaps instead of copying them.
5. Use **Context7** only for current external library/framework/provider mechanisms that materially affect the task. Resolve the library first, query narrowly, and keep the result as external evidence.
6. Use **GitHub** for exact repository/PR/diff/commit/CI evidence and authorized publication. Repository code and tests remain executable truth.
7. Trigger **Codex Security** diff review for authentication, authorization, ownership, membership, grants/delegation, RLS, SQL/RPC, privileged functions, secrets, routing disclosure, destructive lifecycle, or external trust-boundary changes. Use a repository scan for major security-boundary/release work when supported.
8. Use **Supabase** for database/Auth/RLS documentation and local/provider evidence. `supabase/schemas` is desired database truth; local/CI success is not remote application evidence. Remote mutation requires explicit intent.
9. Use **Vercel** for exact web preview/deployment/runtime/log/promotion/rollback evidence. Do not duplicate an existing Git integration deployment path without an accepted delivery decision.
10. Read before external writes. Never commit connector credentials, tokens, live project references, private production data, or `.env` files.
11. Implement the smallest sufficient reversible change, then use `verify-change`. Provider and security evidence supplement deterministic tests; they never replace them.
12. Build the merge evidence packet from the exact head: Linear issue if tracked, canonical contract/gap, GitHub PR/SHA/CI, Codex Security when required, Supabase when required, Vercel when required, and explicit remaining unknowns.
13. After accepted integration, update Linear execution state; update Notion only when a durable human knowledge/decision summary changed and that write is intended. Close gaps only from their declared closure evidence.
14. When a plugin is unavailable, continue with repository-local evidence if safe, report the unavailable evidence surface, and never fabricate external state or provision infrastructure merely to satisfy the workflow.

## Routing shortcuts

```text
Product / Domain / Architecture
-> GitHub current contracts
-> first-principles-architecture
-> Notion if durable knowledge is needed
-> Context7 only for external mechanisms

Feature / Bug / Gap
-> Linear if tracked
-> GitHub implementation
-> verify-change
-> Draft PR / exact-head CI

Auth / RLS / SQL / Authority
-> GitHub contracts
-> Supabase docs/local evidence
-> Codex Security diff review

Web delivery
-> GitHub CI
-> Vercel exact deployment evidence

Release / integration
-> exact-head GitHub evidence
-> required Codex Security / Supabase / Vercel evidence
-> Linear close
-> Notion durable update only when warranted
```

Full human-readable contract: `docs/PLUGIN_DEVELOPMENT_WORKFLOW.md`.
