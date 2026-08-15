---
name: plugin-development-workflow
description: Use when a task needs connected external coordination, provider, documentation, security, deployment, or production evidence. This is a tool and evidence router, not a domain decision skill.
---

# Plugin Development Workflow

1. Apply this skill only when the task needs a connected external tool or evidence surface. It does not select or replace the task's domain or decision skill. Preserve relevant task/session context, then ground it through applicable `AGENTS.md`, `docs/README.md`, the narrowest current contract, the current gap when relevant, and executable evidence. Plugins never override that order.
2. Classify the task before choosing tools. Never invoke every connected plugin ceremonially.
3. Use **Notion** for durable human knowledge, research synthesis, or accepted semantic/decision summaries. Do not treat Notion as current code/schema/CI truth.
4. Use **Linear** for the executable work graph: issue scope, dependencies, priority, acceptance criteria, and progress. Link to canonical repository contracts/gaps instead of copying them.
5. Use **Context7** only for current external library/framework/provider mechanisms that materially affect the task. Resolve the library first, query narrowly, and keep the result as external evidence.
6. Use **GitHub** for exact repository/PR/diff/commit/CI evidence and authorized publication. Repository code and tests remain executable truth.
7. Trigger **Codex Security** diff review for authentication, authorization, ownership, membership, grants/delegation, RLS, SQL/RPC, privileged functions, secrets, routing disclosure, destructive lifecycle, telemetry capture of sensitive data, or external trust-boundary changes. Use a repository scan for major security-boundary/release work when supported.
8. Use **Supabase** for database/Auth/RLS documentation and local/provider evidence. `supabase/schemas` is desired database truth; local/CI success is not remote application evidence. Remote mutation requires explicit intent.
9. Use **Vercel** for exact web preview/deployment/runtime/log/promotion/rollback evidence. Do not duplicate an existing Git integration deployment path without an accepted delivery decision.
10. Use **Sentry** for production engineering evidence: errors, exceptions, traces/performance, affected scope, and release regressions. It does not prove product value or replace deterministic tests.
11. Use **PostHog** for production product evidence: usage events, funnels, cohorts, session behavior, and accepted feature/experiment outcomes. It does not replace transactional data, audit evidence, authorization, or Product/Domain truth.
12. Minimize production telemetry. Never intentionally capture credentials, auth tokens, secrets, or raw private Repository content merely for observability or analytics; anchor observations to environment, release/deployment when available, and time window.
13. Read before external writes. Never commit connector credentials, tokens, live project references, private production data, or `.env` files.
14. Implement the smallest sufficient reversible change, then use `verify-change`. Provider, telemetry, and security evidence supplement deterministic tests; they never replace them.
15. Build the merge evidence packet from the exact head: Linear issue if tracked, canonical contract/gap, GitHub PR/SHA/CI, Codex Security when required, Supabase when required, Vercel when required, and explicit remaining unknowns. Sentry/PostHog become merge evidence only when an explicit acceptance criterion depends on already deployed observation.
16. After accepted integration, use Sentry for engineering regressions and PostHog for product outcome evidence when those observation surfaces exist; update Linear execution state and Notion only when durable knowledge changed. Close gaps only from declared closure evidence.
17. When a plugin is unavailable, continue with repository-local evidence if safe, report the unavailable evidence surface, and never fabricate external state or provision infrastructure merely to satisfy the workflow.

## Routing shortcuts

```text
Product / Domain / Architecture
-> GitHub current contracts
-> active decision Skill selected by narrowest ownership
-> github-semantics-first-principles for GitHub-derived Product decisions
-> first-principles-architecture for broader or non-GitHub decisions
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

Production engineering observation
-> Vercel deployment/release identity
-> Sentry errors/traces/performance/regressions
-> GitHub/Linear follow-up when action is required

Production product observation
-> accepted product hypothesis/capability
-> PostHog usage/funnel/session/experiment evidence
-> prediction error
-> Notion/Linear/repository-gap update when action is required

Release / integration
-> exact-head GitHub evidence
-> required Codex Security / Supabase / Vercel evidence
-> Sentry/PostHog only for explicit deployed-observation criteria
-> Linear close
-> Notion durable update only when warranted
```

Full human-readable contract: `docs/PLUGIN_DEVELOPMENT_WORKFLOW.md`.
