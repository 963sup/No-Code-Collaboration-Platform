# Parallel Route Truth Consolidation Design

- Status: Accepted for implementation
- Date: 2026-08-13
- Scope: documentation routing, App Router instructions, repository contract checks

## Goal

Preserve the canonical Next.js App Router Parallel Route architecture while reducing AI drift caused by historical route identities and overlapping architecture prose.

## External framework facts

Current Next.js documentation defines Parallel Routes as named `@slot` props rendered by a shared layout. Slots do not change the URL. Soft navigation preserves active slot state; hard navigation uses `default.tsx` for unmatched slots or fails when no fallback exists.

This repository intentionally applies a stricter product rule than the generic framework minimum: persistent Repository surfaces use meaningful `default.tsx` recovery rather than silently returning `null`.

Supabase remains an infrastructure and authorization-enforcement boundary. Parallel Route selection is presentation state and must not alter authenticated identity, Repository UUID authorization targets, or RLS facts.

## Current repository fact

The canonical Repository Web workspace is:

```text
/app/[organizationSlug]/[repositorySlug]/
├── page.tsx                 # implicit children / Repository header
├── layout.tsx               # shared Parallel Route composition
├── default.tsx
├── @navigation/
├── @workspace/
│   ├── pages/
│   └── activity/
├── @context/
└── @activity/
```

The legacy `/app/repositories/[repositoryId]/...` namespace is compatibility-only and must not own a second Parallel Route tree.

## Drift source

ADR-003 correctly records the accepted Parallel Route composition mechanism, but its original URL examples use `/app/repositories/[repositoryId]` and `/resources`. ADR-008 later changed current route identity to the Organization/Repository slug namespace and concrete `/pages` surface.

Without an explicit status relation, AI can read ADR-003 as current route truth and resurrect the old UUID/Resource navigation model.

## Approaches considered

### A — Status-indexed ADRs plus current Parallel Route contract — selected

- Keep ADR-003 as historical decision evidence.
- Mark its composition decision as still accepted while identifying route identity as partially superseded by ADR-008.
- Add a compact ADR index that tells AI which decisions are current, partially superseded, or historical context.
- Strengthen current App Router instructions and machine checks around the canonical semantic Parallel Route tree.

Benefits: minimal, preserves history, keeps one current architecture source, and makes drift machine-detectable.

### B — Rewrite ADR-003 to use only current paths — rejected

This makes the document look cleaner but rewrites decision history and hides why ADR-008 existed.

### C — Move all ADRs out of the architecture subtree — deferred

This would reduce default search noise further but is more invasive than needed for the current drift source.

## Invariants

1. Canonical Repository composition remains `children + @navigation + @workspace + @context + @activity`.
2. Parallel Route slots are presentation responsibilities, not Domain or authorization boundaries.
3. Every persistent slot and implicit `children` has a meaningful hard-navigation fallback.
4. `/app/[organizationSlug]/[repositorySlug]` is the current human-facing namespace.
5. `/app/repositories/[repositoryId]/**` remains redirect-only compatibility input.
6. `/pages` is the current concrete Page surface; `Resource` is not user-facing route vocabulary.
7. No Supabase schema, migration, RLS, grant, or hosted-project mutation is part of this change.
8. ADR history is preserved; current truth is routed through architecture README + ADR index before reading individual ADR bodies.

## Verification

- Documentation contracts require the ADR index and ADR-003 partial-supersession marker.
- Instruction contracts require the canonical semantic Parallel Route path and four named slots.
- Architecture contracts continue to require layout slot rendering, persistent defaults, nested `/pages` routes, and redirect-only legacy UUID routing.
- Existing repository, Supabase, browser, and Vercel preview gates remain unchanged.
