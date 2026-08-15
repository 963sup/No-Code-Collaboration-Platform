# Contract: Collaboration Projections

- Status: Accepted target; executable evidence tracked separately
- Contract owner: Product and Application
- Last reviewed: 2026-08-15

These projections organize or deliver already-authorized Repository state. None is a collaboration Container, Artifact owner, Principal, Grant, or authorization source.

## Projects

`/projects` aggregates planning rows from Repositories the Actor may read. `/{owner}/{repository}/projects` derives Open Issues, Assigned Issues, Active Discussions, Recently updated Pages, and All work. Query state is `type`, `status`, `assignee`, `label`, `sort`, and `page`. There is no Project entity, table, create command, saved view, or `projects/{id}` identity. Reordering, filtering, and disappearance never mutate Artifacts, authority, or Evidence.

## Notifications

Notification is Actor-specific delivery over source Evidence. A recipient exists only because the Actor explicitly watches the Repository/Resource, is assigned an Issue, is mentioned, or previously participated in the Issue/Discussion without muting it. The initiating Actor never receives their own notification.

Threads aggregate by `(recipient, Repository, Artifact)`. New source Evidence updates the thread and makes it unread. Delivery state is `unread | read | archived`; read/unread/archive/mark-all-read and watch/mute change only delivery state. Each read revalidates Repository access before title, snippet, count, or URL is produced. Lost access yields no content or existence leak. v1 is in-app only.

## Search

Search covers only authorized Repository metadata, Page, Issue, Discussion, and Project-style derived views. Canonical query state is `q`, `type`, `owner`, `repository`, `status`, `sort`, and `page`; page size is 20. Empty `q` returns the entry state, not all data. Sort is `relevance | updated | created`.

Authorization filters rows before ranking, count, or snippet generation. Default relevance is exact title phrase, title token, description/body token, newer `updated_at`, then stable ID. v1 uses PostgreSQL full-text search. Code Search, file trees, Git refs, diffs, secrets, vectors, LLM ranking, and personalized inference are excluded.

## Explore

Explore discovers public Repository metadata only. Sort is `recent | new`; `recent` uses the latest allowed public Activity time and `new` uses Repository creation time. Page size is 20. Filters are Owner type and publicly present Artifact kind. Private Repository existence, counts, and activity never influence results, ranking, or statistics. Explore is not recommendation authority and v1 is not personalized.

## Integrations

`/integrations` is a provider-neutral reviewed catalog. `?category=mcp` displays connector metadata, purpose, data direction, and required scopes only. v1 has no install/connect/OAuth, credential storage, App Principal, Repository binding, arbitrary endpoint, package download, server startup, script execution, or user-defined transform. `/settings/integrations` presents the catalog with an explicit deferred connection state.

## Deferred governance projections

Team and Enterprise are explicit milestone exclusions. Organization Teams shows deferred status without Team identity, membership, grants, detail route, or persistence. `/settings/enterprises` explains possible cross-Organization governance without Enterprise identity, ownership, policy engine, or Repository access. Team may be reconsidered only for proven durable group authority; Enterprise only for a proven cross-Organization constraint that grants no Repository content access.

## Availability contract

Presentation declares `live | preview | deferred` for each Surface. Preview may own canonical routing, responsive composition, form shape, URL state, and control intent, but it cannot fabricate data, authorization, persistence, or success. The manifest controls navigation/presentation only and never accepts Role, Capability, or authorization results as mutable UI context.
