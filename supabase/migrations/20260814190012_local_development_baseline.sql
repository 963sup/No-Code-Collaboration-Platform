-- Local-development baseline compiled from the ordered declarative schemas.

-- supabase/schemas is the canonical desired database state.

-- This file becomes immutable only after an identified persistent environment applies it.



-- Source: supabase/schemas/10_identity.sql

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_format check (
    username is null
    or (
      char_length(username) between 2 and 64
      and username ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    )
  ),
  constraint profiles_username_unique unique (username)
);

comment on table public.profiles is
  'Application profile projection for an authenticated User; username becomes the personal Repository owner namespace once established.';

-- Source: supabase/schemas/20_organization.sql

create type public.organization_role as enum ('member', 'admin', 'owner');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organizations_slug_format check (
    char_length(slug) between 2 and 64
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint organizations_name_length check (char_length(name) between 1 and 120),
  constraint organizations_slug_unique unique (slug)
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.organization_role not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (organization_id, user_id)
);

create index organization_memberships_user_id_idx
  on public.organization_memberships (user_id, organization_id);

comment on table public.organizations is
  'Ownership and administration boundary for collaboration repositories.';
comment on table public.organization_memberships is
  'Relationship between an actor and an organization; not an actor type.';

-- Source: supabase/schemas/25_repository_owner_namespace.sql

create schema if not exists private;

create table private.repository_owner_namespaces (
  slug text primary key,
  user_id uuid unique references auth.users (id) on delete cascade,
  organization_id uuid unique references public.organizations (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint repository_owner_namespaces_slug_format check (
    char_length(slug) between 2 and 64
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint repository_owner_namespaces_exactly_one_owner check (
    (user_id is not null and organization_id is null)
    or (user_id is null and organization_id is not null)
  )
);

comment on table private.repository_owner_namespaces is
  'Private routing-integrity registry reserving one globally unambiguous Repository owner slug for either a User or Organization.';

-- Source: supabase/schemas/26_repository_owner_namespace_guardrails.sql

alter table private.repository_owner_namespaces
  add constraint repository_owner_namespaces_reserved_slug check (
    slug not in (
      'account',
      'auth',
      'dashboard',
      'discussions',
      'explore',
      'forgot-password',
      'issues',
      'marketplace',
      'new',
      'notifications',
      'organizations',
      'orgs',
      'projects',
      'recover-password',
      'repos',
      'reset-password',
      'search',
      'settings',
      'sign-in',
      'sign-up',
      'verify-email'
    )
  );

-- Source: supabase/schemas/30_repository.sql

create type public.repository_visibility as enum ('private', 'public');

create table public.repositories (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users (id) on delete restrict,
  owner_organization_id uuid references public.organizations (id) on delete restrict,
  slug text not null,
  name text not null,
  description text,
  visibility public.repository_visibility not null default 'private',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored,
  constraint repositories_exactly_one_owner check (
    (owner_user_id is not null and owner_organization_id is null)
    or (owner_user_id is null and owner_organization_id is not null)
  ),
  constraint repositories_slug_format check (
    char_length(slug) between 2 and 64
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint repositories_name_length check (char_length(name) between 1 and 160)
);

create unique index repositories_user_owner_slug_unique
  on public.repositories (owner_user_id, slug)
  where owner_user_id is not null;

create unique index repositories_organization_owner_slug_unique
  on public.repositories (owner_organization_id, slug)
  where owner_organization_id is not null;

create index repositories_owner_user_id_idx
  on public.repositories (owner_user_id, id)
  where owner_user_id is not null;

create index repositories_owner_organization_id_idx
  on public.repositories (owner_organization_id, id)
  where owner_organization_id is not null;

create index repositories_search_vector_idx on public.repositories using gin (search_vector);

comment on table public.repositories is
  'No-code collaboration containers and the primary Resource/authorization/history boundary; each Repository is owned by exactly one User or Organization.';

-- Source: supabase/schemas/40_access.sql

create type public.repository_role as enum ('viewer', 'contributor', 'manager', 'admin');

create table public.repository_user_grants (
  repository_id uuid not null references public.repositories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.repository_role not null,
  granted_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (repository_id, user_id)
);

create index repository_user_grants_user_id_idx
  on public.repository_user_grants (user_id, repository_id);

comment on table public.repository_user_grants is
  'Direct principal-to-repository grants. Collaborator is derived from this relationship.';

-- Source: supabase/schemas/50_resource.sql

create type public.resource_kind as enum ('page');

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  kind public.resource_kind not null,
  title text not null,
  content jsonb not null default '{"body": ""}'::jsonb,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(content ->> 'body', '')), 'B')
  ) stored,
  constraint resources_title_length check (
    char_length(title) between 1 and 240
    and title ~ '[^[:space:]]'
  ),
  constraint resources_page_content_shape check (
    kind <> 'page'
    or (
      jsonb_typeof(content) = 'object'
      and jsonb_typeof(content -> 'body') = 'string'
      and content = jsonb_build_object('body', content ->> 'body')
    )
  )
);

create index resources_repository_id_idx
  on public.resources (repository_id, created_at desc);

create index resources_search_vector_idx on public.resources using gin (search_vector);

comment on table public.resources is
  'Repository-scoped work units. The shared envelope is relational; subtype content remains explicit.';

-- Source: supabase/schemas/55_issue.sql

create type public.issue_status as enum ('open', 'closed');
create type public.issue_close_reason as enum ('completed', 'cancelled');

create table public.repository_artifact_counters (
  repository_id uuid not null references public.repositories (id) on delete cascade,
  artifact_type text not null,
  last_number bigint not null default 0,
  primary key (repository_id, artifact_type),
  constraint repository_artifact_counters_type check (
    artifact_type in ('issue', 'discussion')
  ),
  constraint repository_artifact_counters_number check (last_number >= 0)
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  issue_number bigint not null,
  title text not null,
  body text not null default '',
  status public.issue_status not null default 'open',
  close_reason public.issue_close_reason,
  version bigint not null default 1,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  closed_by uuid references auth.users (id),
  closed_at timestamptz,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(body, '')), 'B')
  ) stored,
  constraint issues_repository_number_unique unique (repository_id, issue_number),
  constraint issues_repository_id_unique unique (repository_id, id),
  constraint issues_number_positive check (issue_number > 0),
  constraint issues_version_positive check (version > 0),
  constraint issues_title_length check (
    char_length(title) between 1 and 240
    and title ~ '[^[:space:]]'
  ),
  constraint issues_closed_state_consistent check (
    (
      status = 'open'
      and close_reason is null
      and closed_by is null
      and closed_at is null
    )
    or (
      status = 'closed'
      and close_reason is not null
      and closed_by is not null
      and closed_at is not null
    )
  )
);

create table public.repository_labels (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint repository_labels_name_length check (
    char_length(name) between 1 and 64 and name ~ '[^[:space:]]'
  ),
  constraint repository_labels_color_format check (color ~ '^[0-9a-fA-F]{6}$'),
  constraint repository_labels_repository_name_unique unique (repository_id, name),
  constraint repository_labels_repository_id_unique unique (repository_id, id)
);

create table public.issue_assignees (
  issue_id uuid not null references public.issues (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid not null references auth.users (id),
  assigned_at timestamptz not null default timezone('utc', now()),
  primary key (issue_id, user_id),
  constraint issue_assignees_issue_repository_fk
    foreign key (repository_id, issue_id)
    references public.issues (repository_id, id)
    on delete cascade
);

create table public.issue_labels (
  issue_id uuid not null references public.issues (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  label_id uuid not null references public.repository_labels (id) on delete cascade,
  applied_by uuid not null references auth.users (id),
  applied_at timestamptz not null default timezone('utc', now()),
  primary key (issue_id, label_id),
  constraint issue_labels_issue_repository_fk
    foreign key (repository_id, issue_id)
    references public.issues (repository_id, id)
    on delete cascade,
  constraint issue_labels_label_repository_fk
    foreign key (repository_id, label_id)
    references public.repository_labels (repository_id, id)
    on delete cascade
);

create table public.issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  body text not null,
  version bigint not null default 1,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint issue_comments_body_nonempty check (body ~ '[^[:space:]]'),
  constraint issue_comments_version_positive check (version > 0),
  constraint issue_comments_issue_repository_fk
    foreign key (repository_id, issue_id)
    references public.issues (repository_id, id)
    on delete cascade
);

create index issues_repository_status_updated_idx
  on public.issues (repository_id, status, updated_at desc, issue_number desc);
create index issues_search_vector_idx on public.issues using gin (search_vector);
create index issue_assignees_user_repository_idx
  on public.issue_assignees (user_id, repository_id, issue_id);
create index issue_labels_label_repository_idx
  on public.issue_labels (label_id, repository_id, issue_id);
create index issue_comments_issue_created_idx
  on public.issue_comments (issue_id, created_at, id);

comment on table public.issues is
  'Repository-contained actionable Artifacts with optimistic concurrency and no hard-delete lifecycle.';
comment on table public.issue_assignees is
  'Responsibility Relationships only; assignment never grants Repository access.';
comment on table public.repository_artifact_counters is
  'Atomic Repository-local numbering state for accepted numbered Artifact kinds.';

-- Source: supabase/schemas/56_discussion.sql

create type public.discussion_category as enum ('general', 'question', 'announcement');
create type public.discussion_status as enum ('open', 'closed');

create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  discussion_number bigint not null,
  category public.discussion_category not null,
  title text not null,
  body text not null default '',
  status public.discussion_status not null default 'open',
  is_locked boolean not null default false,
  answer_comment_id uuid,
  version bigint not null default 1,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  closed_by uuid references auth.users (id),
  closed_at timestamptz,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(body, '')), 'B')
  ) stored,
  constraint discussions_repository_number_unique unique (repository_id, discussion_number),
  constraint discussions_number_positive check (discussion_number > 0),
  constraint discussions_version_positive check (version > 0),
  constraint discussions_title_length check (
    char_length(title) between 1 and 240 and title ~ '[^[:space:]]'
  ),
  constraint discussions_closed_state_consistent check (
    (status = 'open' and closed_by is null and closed_at is null)
    or (status = 'closed' and closed_by is not null and closed_at is not null)
  ),
  constraint discussions_answer_category check (
    answer_comment_id is null or category = 'question'
  ),
  constraint discussions_repository_id_unique unique (repository_id, id)
);

create table public.discussion_comments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  body text not null,
  version bigint not null default 1,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint discussion_comments_body_nonempty check (body ~ '[^[:space:]]'),
  constraint discussion_comments_version_positive check (version > 0),
  constraint discussion_comments_discussion_repository_fk
    foreign key (repository_id, discussion_id)
    references public.discussions (repository_id, id)
    on delete cascade,
  constraint discussion_comments_discussion_id_unique unique (discussion_id, id)
);

alter table public.discussions
  add constraint discussions_answer_comment_fk
  foreign key (id, answer_comment_id)
  references public.discussion_comments (discussion_id, id)
  on delete restrict;

create index discussions_repository_status_updated_idx
  on public.discussions (repository_id, status, updated_at desc, discussion_number desc);
create index discussions_search_vector_idx on public.discussions using gin (search_vector);
create index discussion_comments_discussion_created_idx
  on public.discussion_comments (discussion_id, created_at, id);

comment on table public.discussions is
  'Repository-contained shared-understanding Artifacts; not a Forum Container or Issue alias.';
comment on column public.discussions.is_locked is
  'Moderation state independent from the open/closed lifecycle.';

-- Source: supabase/schemas/60_activity.sql

create table public.activity_events (
  id bigint generated always as identity primary key,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  actor_id uuid not null references auth.users (id),
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint activity_events_event_type_format check (
    event_type ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'
  )
);

create index activity_events_repository_created_at_idx
  on public.activity_events (repository_id, created_at desc, id desc);

comment on table public.activity_events is
  'Immutable historical facts from which activity, audit, notification, and analytics projections may derive.';

-- Source: supabase/schemas/65_notification.sql

create type public.notification_state as enum ('unread', 'read', 'archived');
create type public.notification_reason as enum (
  'watching',
  'assigned',
  'mentioned',
  'participating'
);
create type public.notification_artifact_type as enum (
  'repository',
  'page',
  'issue',
  'discussion'
);

create table public.notification_preferences (
  recipient_id uuid not null references auth.users (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  subject_type public.notification_artifact_type not null,
  subject_id uuid not null,
  is_watched boolean not null default false,
  is_muted boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (recipient_id, repository_id, subject_type, subject_id),
  constraint notification_preferences_exclusive_state check (not (is_watched and is_muted)),
  constraint notification_preferences_repository_subject check (
    subject_type <> 'repository' or subject_id = repository_id
  )
);

create table public.notification_threads (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users (id) on delete cascade,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  artifact_type public.notification_artifact_type not null,
  artifact_id uuid not null,
  reason public.notification_reason not null,
  source_evidence_id bigint not null references public.activity_events (id) on delete restrict,
  state public.notification_state not null default 'unread',
  title text not null,
  event_count bigint not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notification_threads_count_positive check (event_count > 0),
  constraint notification_threads_recipient_artifact_unique unique (
    recipient_id,
    repository_id,
    artifact_type,
    artifact_id
  )
);

create index notification_threads_recipient_state_updated_idx
  on public.notification_threads (recipient_id, state, updated_at desc, id);
create index notification_preferences_subject_idx
  on public.notification_preferences (repository_id, subject_type, subject_id, recipient_id);

create function private.user_can_view_repository(
  target_user_id uuid,
  target_repository_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.repositories as repository
    where repository.id = target_repository_id
      and (
        repository.visibility = 'public'
        or repository.owner_user_id = target_user_id
        or exists (
          select 1
          from public.organization_memberships as membership
          where membership.organization_id = repository.owner_organization_id
            and membership.user_id = target_user_id
            and membership.role in ('admin', 'owner')
        )
        or exists (
          select 1
          from public.repository_user_grants as direct_grant
          where direct_grant.repository_id = repository.id
            and direct_grant.user_id = target_user_id
        )
      )
  );
$$;

create function private.next_artifact_number(
  target_repository_id uuid,
  target_artifact_type text
)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  next_number bigint;
begin
  if (select auth.uid()) is null
    or target_artifact_type not in ('issue', 'discussion')
    or not private.has_repository_capability(target_repository_id, 'resource.create') then
    raise exception 'artifact numbering requires resource.create'
      using errcode = '42501';
  end if;

  insert into public.repository_artifact_counters as counter (
    repository_id,
    artifact_type,
    last_number
  )
  values (target_repository_id, target_artifact_type, 1)
  on conflict (repository_id, artifact_type) do update
    set last_number = counter.last_number + 1
  returning last_number into next_number;

  return next_number;
end;
$$;

create function private.record_collaboration_event(
  target_repository_id uuid,
  event_actor_id uuid,
  target_event_type text,
  target_subject_type text,
  target_subject_id uuid,
  event_payload jsonb,
  notification_type public.notification_artifact_type,
  notification_title text,
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  evidence_id bigint;
begin
  if event_actor_id is null
    or (
      event_actor_id is distinct from (select auth.uid())
      and session_user <> 'postgres'
    ) then
    raise exception 'Evidence attribution must match the authenticated Actor'
      using errcode = '42501';
  end if;

  insert into public.activity_events (
    repository_id,
    actor_id,
    event_type,
    subject_type,
    subject_id,
    payload
  )
  values (
    target_repository_id,
    event_actor_id,
    target_event_type,
    target_subject_type,
    target_subject_id,
    coalesce(event_payload, '{}'::jsonb)
  )
  returning id into evidence_id;

  with candidates as (
    select preference.recipient_id, 'watching'::public.notification_reason as reason
    from public.notification_preferences as preference
    where preference.repository_id = target_repository_id
      and preference.is_watched
      and not preference.is_muted
      and (
        (
          preference.subject_type = 'repository'
          and preference.subject_id = target_repository_id
        )
        or (
          preference.subject_type = notification_type
          and preference.subject_id = target_subject_id
        )
      )

    union all

    select assignee.user_id, 'assigned'::public.notification_reason
    from public.issue_assignees as assignee
    where notification_type = 'issue'
      and assignee.issue_id = target_subject_id

    union all

    select issue.created_by, 'participating'::public.notification_reason
    from public.issues as issue
    where notification_type = 'issue'
      and issue.id = target_subject_id

    union all

    select comment.created_by, 'participating'::public.notification_reason
    from public.issue_comments as comment
    where notification_type = 'issue'
      and comment.issue_id = target_subject_id

    union all

    select discussion.created_by, 'participating'::public.notification_reason
    from public.discussions as discussion
    where notification_type = 'discussion'
      and discussion.id = target_subject_id

    union all

    select comment.created_by, 'participating'::public.notification_reason
    from public.discussion_comments as comment
    where notification_type = 'discussion'
      and comment.discussion_id = target_subject_id

    union all

    select unnest(coalesce(mentioned_user_ids, '{}'::uuid[])),
      'mentioned'::public.notification_reason
  ),
  eligible as (
    select distinct on (candidate.recipient_id)
      candidate.recipient_id,
      candidate.reason
    from candidates as candidate
    where candidate.recipient_id is not null
      and candidate.recipient_id <> event_actor_id
      and private.user_can_view_repository(candidate.recipient_id, target_repository_id)
      and not exists (
        select 1
        from public.notification_preferences as muted
        where muted.recipient_id = candidate.recipient_id
          and muted.repository_id = target_repository_id
          and muted.is_muted
          and (
            (muted.subject_type = 'repository' and muted.subject_id = target_repository_id)
            or (muted.subject_type = notification_type and muted.subject_id = target_subject_id)
          )
      )
    order by candidate.recipient_id,
      case candidate.reason
        when 'mentioned' then 40
        when 'assigned' then 30
        when 'participating' then 20
        when 'watching' then 10
      end desc
  )
  insert into public.notification_threads as notification (
    recipient_id,
    repository_id,
    artifact_type,
    artifact_id,
    reason,
    source_evidence_id,
    state,
    title
  )
  select
    eligible.recipient_id,
    target_repository_id,
    notification_type,
    target_subject_id,
    eligible.reason,
    evidence_id,
    'unread',
    notification_title
  from eligible
  on conflict (recipient_id, repository_id, artifact_type, artifact_id) do update
    set reason = excluded.reason,
      source_evidence_id = excluded.source_evidence_id,
      state = 'unread',
      title = excluded.title,
      event_count = notification.event_count + 1,
      updated_at = timezone('utc', statement_timestamp());

  return evidence_id;
end;
$$;

revoke all on function private.user_can_view_repository(uuid, uuid)
  from public, anon, authenticated;
revoke all on function private.next_artifact_number(uuid, text)
  from public, anon, authenticated;
revoke all on function private.record_collaboration_event(
  uuid,
  uuid,
  text,
  text,
  uuid,
  jsonb,
  public.notification_artifact_type,
  text,
  uuid[]
) from public, anon, authenticated;

grant execute on function private.user_can_view_repository(uuid, uuid) to authenticated;
grant execute on function private.next_artifact_number(uuid, text) to authenticated;
grant execute on function private.record_collaboration_event(
  uuid,
  uuid,
  text,
  text,
  uuid,
  jsonb,
  public.notification_artifact_type,
  text,
  uuid[]
) to authenticated;

comment on table public.notification_threads is
  'Actor-specific delivery Projection over immutable Activity Evidence; access is revalidated on every read.';

-- Source: supabase/schemas/70_resource_activity.sql

create schema if not exists private;

create function private.record_resource_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_actor uuid;
begin
  authenticated_actor := (select auth.uid());
  if authenticated_actor is null then
    raise exception 'resource update requires an authenticated actor'
      using errcode = '42501';
  end if;

  perform private.record_collaboration_event(
    new.repository_id,
    authenticated_actor,
    'resource.updated',
    'resource',
    new.id,
    jsonb_build_object(
      'kind', new.kind,
      'title', new.title,
      'title_changed', old.title is distinct from new.title,
      'content_changed', old.content is distinct from new.content
    ),
    'page',
    new.title
  );
  return new;
end;
$$;

create trigger resource_updated_activity
after update of title, content on public.resources
for each row
when (old.title is distinct from new.title or old.content is distinct from new.content)
execute function private.record_resource_updated();

revoke all on function private.record_resource_updated() from public, anon, authenticated;

-- Source: supabase/schemas/90_private_functions.sql

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create function private.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create function private.touch_resource_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc', statement_timestamp());
  return new;
end;
$$;

create function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
  );
$$;

create function private.current_organization_role(target_organization_id uuid)
returns public.organization_role
language sql
stable
security definer
set search_path = ''
as $$
  select membership.role
  from public.organization_memberships as membership
  where membership.organization_id = target_organization_id
    and membership.user_id = (select auth.uid())
  limit 1;
$$;

create function private.is_organization_admin(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.current_organization_role(target_organization_id) in ('admin', 'owner'),
    false
  );
$$;

create function private.is_organization_owner(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.current_organization_role(target_organization_id) = 'owner',
    false
  );
$$;

create function private.can_manage_organization_membership(
  target_organization_id uuid,
  target_role public.organization_role
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role public.organization_role;
begin
  if (select auth.uid()) is null or target_role is null then
    return false;
  end if;

  actor_role := private.current_organization_role(target_organization_id);

  return case actor_role
    when 'owner' then true
    when 'admin' then target_role in ('member', 'admin')
    else false
  end;
end;
$$;

create function private.repository_role_rank(role public.repository_role)
returns integer
language sql
immutable
security invoker
set search_path = ''
as $$
  select case role
    when 'viewer' then 10
    when 'contributor' then 20
    when 'manager' then 30
    when 'admin' then 40
  end;
$$;

create function private.current_repository_role(target_repository_id uuid)
returns public.repository_role
language sql
stable
security definer
set search_path = ''
as $$
  select candidate.role
  from (
    select 'admin'::public.repository_role as role
    from public.repositories as repository
    where repository.id = target_repository_id
      and repository.owner_user_id = (select auth.uid())

    union all

    select 'admin'::public.repository_role as role
    from public.repositories as repository
    join public.organization_memberships as membership
      on membership.organization_id = repository.owner_organization_id
    where repository.id = target_repository_id
      and membership.user_id = (select auth.uid())
      and membership.role in ('admin', 'owner')

    union all

    select direct_grant.role
    from public.repository_user_grants as direct_grant
    where direct_grant.repository_id = target_repository_id
      and direct_grant.user_id = (select auth.uid())
  ) as candidate
  order by private.repository_role_rank(candidate.role) desc
  limit 1;
$$;

create function private.has_repository_capability(
  target_repository_id uuid,
  requested_capability text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  effective_role public.repository_role;
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  effective_role := private.current_repository_role(target_repository_id);

  return case effective_role
    when 'viewer' then requested_capability in (
      'repository.view',
      'resource.view'
    )
    when 'contributor' then requested_capability in (
      'repository.view',
      'resource.view',
      'resource.create',
      'resource.update'
    )
    when 'manager' then requested_capability in (
      'repository.view',
      'resource.view',
      'resource.create',
      'resource.update',
      'member.manage'
    )
    when 'admin' then requested_capability in (
      'repository.view',
      'repository.manage',
      'resource.view',
      'resource.create',
      'resource.update',
      'member.manage'
    )
    else false
  end;
end;
$$;

create function private.can_manage_repository_grant(
  target_repository_id uuid,
  target_role public.repository_role
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role public.repository_role;
begin
  if (select auth.uid()) is null or target_role is null then
    return false;
  end if;

  actor_role := private.current_repository_role(target_repository_id);

  if not private.has_repository_capability(target_repository_id, 'member.manage') then
    return false;
  end if;

  return case actor_role
    when 'admin' then true
    when 'manager' then target_role in ('viewer', 'contributor')
    else false
  end;
end;
$$;

create function private.can_view_repository(target_repository_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.repositories as repository
    where repository.id = target_repository_id
      and repository.visibility = 'public'
  ) or private.has_repository_capability(target_repository_id, 'repository.view');
$$;

create function private.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_username text;
begin
  candidate_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));

  if candidate_username !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or char_length(candidate_username) < 2
    or char_length(candidate_username) > 64 then
    candidate_username := 'user-' || replace(new.id::text, '-', '');
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    candidate_username,
    nullif(new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do update
    set username = excluded.username;

  insert into private.repository_owner_namespaces (slug, user_id)
  values (candidate_username, new.id)
  on conflict (user_id) do update
    set slug = excluded.slug;

  return new;
end;
$$;

create function private.sync_user_owner_namespace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.username is distinct from old.username then
    update private.repository_owner_namespaces
    set slug = new.username
    where user_id = new.id;
  end if;
  return new;
end;
$$;

create function private.add_organization_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.repository_owner_namespaces (slug, organization_id)
  values (new.slug, new.id);

  insert into public.organization_memberships (organization_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (organization_id, user_id) do update set role = 'owner';
  return new;
end;
$$;

create function private.sync_organization_owner_namespace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.slug is distinct from old.slug then
    update private.repository_owner_namespaces
    set slug = new.slug
    where organization_id = new.id;
  end if;
  return new;
end;
$$;

create function private.ensure_organization_owner_continuity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role <> 'owner' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' and new.role = 'owner' then
    return new;
  end if;

  perform 1
  from public.organizations as organization
  where organization.id = old.organization_id
  for update;

  if not found then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if not exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = old.organization_id
      and membership.user_id <> old.user_id
      and membership.role = 'owner'
  ) then
    raise exception 'organization must retain at least one owner'
      using errcode = '23514';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create function private.record_repository_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.record_collaboration_event(
    new.id,
    new.created_by,
    'repository.created',
    'repository',
    new.id,
    jsonb_build_object('name', new.name),
    'repository',
    new.name
  );
  return new;
end;
$$;

create function private.record_resource_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.record_collaboration_event(
    new.repository_id,
    new.created_by,
    'resource.created',
    'resource',
    new.id,
    jsonb_build_object('kind', new.kind, 'title', new.title),
    'page',
    new.title
  );
  return new;
end;
$$;

create trigger auth_user_created_profile
after insert on auth.users
for each row execute function private.create_profile_for_auth_user();

create trigger profile_username_owner_namespace
before update of username on public.profiles
for each row execute function private.sync_user_owner_namespace();

create trigger organization_created_owner
after insert on public.organizations
for each row execute function private.add_organization_owner();

create trigger organization_owner_namespace_update
before update of slug on public.organizations
for each row execute function private.sync_organization_owner_namespace();

create trigger organization_owner_continuity_update
before update of role on public.organization_memberships
for each row execute function private.ensure_organization_owner_continuity();

create trigger organization_owner_continuity_delete
before delete on public.organization_memberships
for each row execute function private.ensure_organization_owner_continuity();

create trigger organizations_touch_updated_at
before update on public.organizations
for each row execute function private.touch_updated_at();

create trigger repositories_touch_updated_at
before update on public.repositories
for each row execute function private.touch_updated_at();

create trigger resources_touch_updated_at
before update of title, content on public.resources
for each row
when (old.title is distinct from new.title or old.content is distinct from new.content)
execute function private.touch_resource_updated_at();

create trigger repository_created_activity
after insert on public.repositories
for each row execute function private.record_repository_created();

create trigger resource_created_activity
after insert on public.resources
for each row execute function private.record_resource_created();

revoke all on all functions in schema private from public, anon, authenticated;

grant execute on function private.is_organization_member(uuid) to authenticated;
grant execute on function private.is_organization_admin(uuid) to authenticated;
grant execute on function private.is_organization_owner(uuid) to authenticated;
grant execute on function private.can_manage_organization_membership(
  uuid,
  public.organization_role
) to authenticated;
grant execute on function private.current_repository_role(uuid) to authenticated;
grant execute on function private.has_repository_capability(uuid, text) to authenticated;
grant execute on function private.can_manage_repository_grant(
  uuid,
  public.repository_role
) to authenticated;
grant execute on function private.can_view_repository(uuid) to anon, authenticated;
grant execute on function private.user_can_view_repository(uuid, uuid) to authenticated;
grant execute on function private.next_artifact_number(uuid, text) to authenticated;
grant execute on function private.record_collaboration_event(
  uuid,
  uuid,
  text,
  text,
  uuid,
  jsonb,
  public.notification_artifact_type,
  text,
  uuid[]
) to authenticated;

-- Source: supabase/schemas/91_repository_access_projection.sql

create function private.get_current_repository_access_sources(target_repository_id uuid)
returns table (
  direct_role public.repository_role,
  governance_role public.repository_role
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      select direct_grant.role
      from public.repository_user_grants as direct_grant
      where direct_grant.repository_id = target_repository_id
        and direct_grant.user_id = (select auth.uid())
      limit 1
    ) as direct_role,
    case
      when exists (
        select 1
        from public.repositories as repository
        where repository.id = target_repository_id
          and repository.owner_user_id = (select auth.uid())
      ) then 'admin'::public.repository_role
      when exists (
        select 1
        from public.repositories as repository
        join public.organization_memberships as membership
          on membership.organization_id = repository.owner_organization_id
        where repository.id = target_repository_id
          and membership.user_id = (select auth.uid())
          and membership.role in ('admin', 'owner')
      ) then 'admin'::public.repository_role
      else null
    end as governance_role
  where (select auth.uid()) is not null;
$$;

revoke all on function private.get_current_repository_access_sources(uuid)
  from public, anon, authenticated;
grant execute on function private.get_current_repository_access_sources(uuid) to authenticated;

create function private.can_create_repository_for_owner(
  target_owner_user_id uuid,
  target_owner_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when (select auth.uid()) is null then false
      when target_owner_user_id = (select auth.uid())
        and target_owner_organization_id is null then true
      when target_owner_user_id is null
        and target_owner_organization_id is not null then exists (
          select 1
          from public.organization_memberships as membership
          where membership.organization_id = target_owner_organization_id
            and membership.user_id = (select auth.uid())
            and membership.role in ('admin', 'owner')
        )
      else false
    end;
$$;

revoke all on function private.can_create_repository_for_owner(uuid, uuid)
  from public, anon, authenticated;
grant execute on function private.can_create_repository_for_owner(uuid, uuid) to authenticated;

create function public.get_current_repository_access_sources(target_repository_id uuid)
returns table (
  direct_role public.repository_role,
  governance_role public.repository_role
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_current_repository_access_sources(target_repository_id);
$$;

revoke all on function public.get_current_repository_access_sources(uuid)
  from public, anon, authenticated;
grant execute on function public.get_current_repository_access_sources(uuid) to authenticated;

-- Source: supabase/schemas/92_page_commands.sql

create function public.create_page(
  target_repository_id uuid,
  page_title text
)
returns table (
  id uuid,
  repository_id uuid,
  kind public.resource_kind,
  title text,
  content jsonb,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  normalized_title text;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'page creation requires an authenticated actor'
      using errcode = '42501';
  end if;

  normalized_title := pg_catalog.regexp_replace(
    page_title,
    '^[[:space:]]+|[[:space:]]+$',
    '',
    'g'
  );
  previous_command := pg_catalog.current_setting('app.page_command', true);
  perform pg_catalog.set_config('app.page_command', 'create', true);

  return query
    insert into public.resources as resource (
      repository_id,
      kind,
      title,
      content,
      created_by
    )
    values (
      target_repository_id,
      'page',
      normalized_title,
      pg_catalog.jsonb_build_object('body', ''),
      actor_id
    )
    returning
      resource.id,
      resource.repository_id,
      resource.kind,
      resource.title,
      resource.content,
      resource.created_by,
      resource.created_at,
      resource.updated_at;

  perform pg_catalog.set_config('app.page_command', coalesce(previous_command, ''), true);
end;
$$;

create function public.update_page(
  target_repository_id uuid,
  page_id uuid,
  page_title text,
  page_body text,
  expected_updated_at timestamptz
)
returns table (
  id uuid,
  repository_id uuid,
  kind public.resource_kind,
  title text,
  content jsonb,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  normalized_title text;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'page update requires an authenticated actor'
      using errcode = '42501';
  end if;

  normalized_title := pg_catalog.regexp_replace(
    page_title,
    '^[[:space:]]+|[[:space:]]+$',
    '',
    'g'
  );
  previous_command := pg_catalog.current_setting('app.page_command', true);
  perform pg_catalog.set_config('app.page_command', 'update', true);

  return query
    update public.resources as resource
    set
      title = normalized_title,
      content = pg_catalog.jsonb_build_object('body', page_body)
    where resource.id = page_id
      and resource.repository_id = target_repository_id
      and resource.kind = 'page'
      and resource.updated_at = expected_updated_at
    returning
      resource.id,
      resource.repository_id,
      resource.kind,
      resource.title,
      resource.content,
      resource.created_by,
      resource.created_at,
      resource.updated_at;

  perform pg_catalog.set_config('app.page_command', coalesce(previous_command, ''), true);
end;
$$;

revoke all on function public.create_page(uuid, text) from public, anon, authenticated;
revoke all on function public.update_page(uuid, uuid, text, text, timestamptz)
  from public, anon, authenticated;

grant execute on function public.create_page(uuid, text) to authenticated;
grant execute on function public.update_page(uuid, uuid, text, text, timestamptz)
  to authenticated;

-- Source: supabase/schemas/92_repository_grant_commands.sql

create function private.record_repository_grant_event(
  target_repository_id uuid,
  target_actor_id uuid,
  target_user_id uuid,
  previous_role public.repository_role,
  resulting_role public.repository_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_name text;
begin
  if target_actor_id is null or target_actor_id <> (select auth.uid()) then
    raise exception 'Repository Grant event attribution must match the authenticated Actor'
      using errcode = '42501';
  end if;

  if (select pg_catalog.current_setting('app.repository_grant_command', true)) <> 'mutate' then
    raise exception 'Repository Grant event requires the accepted command boundary'
      using errcode = '42501';
  end if;

  event_name := case
    when previous_role is null and resulting_role is not null then 'repository_grant.created'
    when previous_role is not null and resulting_role is null then 'repository_grant.revoked'
    else 'repository_grant.role_changed'
  end;

  insert into public.activity_events (
    repository_id,
    actor_id,
    event_type,
    subject_type,
    subject_id,
    payload
  )
  values (
    target_repository_id,
    target_actor_id,
    event_name,
    'repository_grant',
    target_user_id,
    jsonb_build_object(
      'previous_role', previous_role,
      'resulting_role', resulting_role
    )
  );
end;
$$;

create function private.repository_grant_target_exists(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as target_user
    where target_user.id = target_user_id
  );
$$;

create function private.list_repository_direct_grants(target_repository_id uuid)
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  role public.repository_role
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_repository_capability(target_repository_id, 'member.manage') then
    raise exception 'Repository Grant management is unavailable' using errcode = '42501';
  end if;

  return query
  select
    direct_grant.user_id,
    profile.username,
    profile.display_name,
    profile.avatar_url,
    direct_grant.role
  from public.repository_user_grants as direct_grant
  join public.profiles as profile on profile.id = direct_grant.user_id
  where direct_grant.repository_id = target_repository_id
  order by profile.username, direct_grant.user_id;
end;
$$;

create function private.find_repository_grant_target_by_username(
  target_repository_id uuid,
  target_username text
)
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_repository_capability(target_repository_id, 'member.manage') then
    raise exception 'Repository Grant management is unavailable' using errcode = '42501';
  end if;

  return query
  select
    profile.id,
    profile.username,
    profile.display_name,
    profile.avatar_url
  from public.profiles as profile
  where profile.username = target_username
  limit 1;
end;
$$;

revoke all on function private.record_repository_grant_event(
  uuid,
  uuid,
  uuid,
  public.repository_role,
  public.repository_role
) from public, anon, authenticated;
revoke all on function private.repository_grant_target_exists(uuid)
  from public, anon, authenticated;
revoke all on function private.list_repository_direct_grants(uuid)
  from public, anon, authenticated;
revoke all on function private.find_repository_grant_target_by_username(uuid, text)
  from public, anon, authenticated;

grant execute on function private.record_repository_grant_event(
  uuid,
  uuid,
  uuid,
  public.repository_role,
  public.repository_role
) to authenticated;
grant execute on function private.repository_grant_target_exists(uuid) to authenticated;
grant execute on function private.list_repository_direct_grants(uuid) to authenticated;
grant execute on function private.find_repository_grant_target_by_username(uuid, text)
  to authenticated;

create function public.list_repository_direct_grants(target_repository_id uuid)
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  role public.repository_role
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from private.list_repository_direct_grants(target_repository_id);
$$;

create function public.find_repository_grant_target_by_username(
  target_repository_id uuid,
  target_username text
)
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from private.find_repository_grant_target_by_username(
    target_repository_id,
    target_username
  );
$$;

create function public.execute_repository_grant_command(
  target_repository_id uuid,
  target_user_id uuid,
  expected_role public.repository_role,
  proposed_role public.repository_role
)
returns text
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  stored_role public.repository_role;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Repository Grant mutation requires an authenticated Actor'
      using errcode = '42501';
  end if;

  if actor_id = target_user_id then
    return 'forbidden';
  end if;

  if not private.repository_grant_target_exists(target_user_id) then
    return 'target-unavailable';
  end if;

  select direct_grant.role
  into stored_role
  from public.repository_user_grants as direct_grant
  where direct_grant.repository_id = target_repository_id
    and direct_grant.user_id = target_user_id;

  if stored_role is distinct from expected_role then
    return 'state-changed';
  end if;

  if stored_role is null and proposed_role is null then
    return 'target-unavailable';
  end if;

  if stored_role is not null
    and not private.can_manage_repository_grant(target_repository_id, stored_role) then
    return 'forbidden';
  end if;

  if proposed_role is not null
    and not private.can_manage_repository_grant(target_repository_id, proposed_role) then
    return 'forbidden';
  end if;

  if stored_role is not distinct from proposed_role then
    return 'unchanged';
  end if;

  previous_command := pg_catalog.current_setting('app.repository_grant_command', true);
  perform pg_catalog.set_config('app.repository_grant_command', 'mutate', true);

  if stored_role is null then
    insert into public.repository_user_grants (
      repository_id,
      user_id,
      role,
      granted_by
    )
    values (
      target_repository_id,
      target_user_id,
      proposed_role,
      actor_id
    );
  elsif proposed_role is null then
    delete from public.repository_user_grants as direct_grant
    where direct_grant.repository_id = target_repository_id
      and direct_grant.user_id = target_user_id;
  else
    update public.repository_user_grants as direct_grant
    set role = proposed_role
    where direct_grant.repository_id = target_repository_id
      and direct_grant.user_id = target_user_id;
  end if;

  perform private.record_repository_grant_event(
    target_repository_id,
    actor_id,
    target_user_id,
    stored_role,
    proposed_role
  );

  perform pg_catalog.set_config(
    'app.repository_grant_command',
    coalesce(previous_command, ''),
    true
  );
  return 'applied';
end;
$$;

revoke all on function public.list_repository_direct_grants(uuid)
  from public, anon, authenticated;
revoke all on function public.find_repository_grant_target_by_username(uuid, text)
  from public, anon, authenticated;
revoke all on function public.execute_repository_grant_command(
  uuid,
  uuid,
  public.repository_role,
  public.repository_role
) from public, anon, authenticated;

grant execute on function public.list_repository_direct_grants(uuid) to authenticated;
grant execute on function public.find_repository_grant_target_by_username(uuid, text)
  to authenticated;
grant execute on function public.execute_repository_grant_command(
  uuid,
  uuid,
  public.repository_role,
  public.repository_role
) to authenticated;

comment on function public.list_repository_direct_grants(uuid) is
  'Direct User Grant management projection, available only to an Actor with member.manage on the Repository.';
comment on function public.find_repository_grant_target_by_username(uuid, text) is
  'Exact User-username resolution for Repository Grant management; returns only public-safe profile fields.';
comment on function public.execute_repository_grant_command(
  uuid,
  uuid,
  public.repository_role,
  public.repository_role
) is
  'Optimistic create/change/revoke Direct Repository Grant command with independent delegation enforcement and same-transaction Activity Evidence.';

-- Source: supabase/schemas/93_collaboration_commands.sql

create function public.create_issue(
  target_repository_id uuid,
  issue_title text,
  issue_body text default '',
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  created_issue public.issues%rowtype;
  normalized_title text;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue creation requires an authenticated Actor' using errcode = '42501';
  end if;
  normalized_title := pg_catalog.btrim(issue_title);
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'create', true);

  insert into public.issues (
    repository_id,
    issue_number,
    title,
    body,
    created_by
  )
  values (
    target_repository_id,
    private.next_artifact_number(target_repository_id, 'issue'),
    normalized_title,
    coalesce(issue_body, ''),
    actor_id
  )
  returning * into created_issue;

  perform private.record_collaboration_event(
    created_issue.repository_id,
    actor_id,
    'issue.created',
    'issue',
    created_issue.id,
    jsonb_build_object('issue_number', created_issue.issue_number, 'title', created_issue.title),
    'issue',
    created_issue.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next created_issue;
end;
$$;

create function public.edit_issue(
  target_repository_id uuid,
  issue_id uuid,
  issue_title text,
  issue_body text,
  expected_version bigint,
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue edit requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'edit', true);
  update public.issues as issue
  set title = pg_catalog.btrim(issue_title),
      body = coalesce(issue_body, ''),
      version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
    and (
      issue.title is distinct from pg_catalog.btrim(issue_title)
      or issue.body is distinct from coalesce(issue_body, '')
    )
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    'issue.edited',
    'issue',
    changed_issue.id,
    jsonb_build_object('version', changed_issue.version, 'title', changed_issue.title),
    'issue',
    changed_issue.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.add_issue_comment(
  target_repository_id uuid,
  issue_id uuid,
  comment_body text,
  expected_version bigint,
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  comment_id uuid;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue comment requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'comment', true);
  update public.issues as issue
  set version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  insert into public.issue_comments (issue_id, repository_id, body, created_by)
  values (changed_issue.id, changed_issue.repository_id, comment_body, actor_id)
  returning id into comment_id;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    'issue.commented',
    'issue',
    changed_issue.id,
    jsonb_build_object('comment_id', comment_id, 'version', changed_issue.version),
    'issue',
    changed_issue.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.set_issue_assignee(
  target_repository_id uuid,
  target_issue_id uuid,
  assignee_id uuid,
  should_assign boolean,
  expected_version bigint
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue assignment requires an authenticated Actor' using errcode = '42501';
  end if;
  if not private.has_repository_capability(target_repository_id, 'resource.update')
    or not exists (
      select 1
      from public.issues as issue
      where issue.id = target_issue_id
        and issue.repository_id = target_repository_id
        and issue.version = expected_version
    ) then
    return;
  end if;
  if should_assign and not private.user_can_view_repository(assignee_id, target_repository_id) then
    raise exception 'Assignee cannot access the Repository' using errcode = 'P0002';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'assign', true);
  update public.issues as issue
  set version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = target_issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
    and (
      (should_assign and not exists (
        select 1
        from public.issue_assignees as assignment
        where assignment.issue_id = target_issue_id
          and assignment.user_id = assignee_id
      ))
      or (not should_assign and exists (
        select 1
        from public.issue_assignees as assignment
        where assignment.issue_id = target_issue_id
          and assignment.user_id = assignee_id
      ))
    )
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  if should_assign then
    insert into public.issue_assignees (issue_id, repository_id, user_id, assigned_by)
    values (changed_issue.id, changed_issue.repository_id, assignee_id, actor_id)
    on conflict (issue_id, user_id) do nothing;
  else
    delete from public.issue_assignees as assignment
    where assignment.issue_id = changed_issue.id and assignment.user_id = assignee_id;
  end if;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    case when should_assign then 'issue.assigned' else 'issue.unassigned' end,
    'issue',
    changed_issue.id,
    jsonb_build_object('assignee_id', assignee_id, 'version', changed_issue.version),
    'issue',
    changed_issue.title
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.set_issue_label(
  target_repository_id uuid,
  issue_id uuid,
  label_id uuid,
  should_apply boolean,
  expected_version bigint
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue labeling requires an authenticated Actor' using errcode = '42501';
  end if;
  if should_apply and not exists (
    select 1 from public.repository_labels as label
    where label.id = set_issue_label.label_id and label.repository_id = target_repository_id
  ) then
    raise exception 'Label is unavailable in this Repository' using errcode = 'P0002';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'label', true);
  update public.issues as issue
  set version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = set_issue_label.issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
    and (
      (should_apply and not exists (
        select 1
        from public.issue_labels as applied
        where applied.issue_id = set_issue_label.issue_id
          and applied.label_id = set_issue_label.label_id
      ))
      or (not should_apply and exists (
        select 1
        from public.issue_labels as applied
        where applied.issue_id = set_issue_label.issue_id
          and applied.label_id = set_issue_label.label_id
      ))
    )
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  if should_apply then
    insert into public.issue_labels (issue_id, repository_id, label_id, applied_by)
    values (changed_issue.id, changed_issue.repository_id, set_issue_label.label_id, actor_id)
    on conflict on constraint issue_labels_pkey do nothing;
  else
    delete from public.issue_labels as applied
    where applied.issue_id = changed_issue.id and applied.label_id = set_issue_label.label_id;
  end if;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    case when should_apply then 'issue.labeled' else 'issue.unlabeled' end,
    'issue',
    changed_issue.id,
    jsonb_build_object('label_id', set_issue_label.label_id, 'version', changed_issue.version),
    'issue',
    changed_issue.title
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.transition_issue(
  target_repository_id uuid,
  issue_id uuid,
  target_status public.issue_status,
  expected_version bigint,
  target_close_reason public.issue_close_reason default null
)
returns setof public.issues
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_issue public.issues%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Issue transition requires an authenticated Actor' using errcode = '42501';
  end if;
  if (target_status = 'closed' and target_close_reason is null)
    or (target_status = 'open' and target_close_reason is not null) then
    raise exception 'Issue close reason is inconsistent with target status' using errcode = '22023';
  end if;
  previous_command := pg_catalog.current_setting('app.issue_command', true);
  perform pg_catalog.set_config('app.issue_command', 'transition', true);
  update public.issues as issue
  set status = target_status,
      close_reason = target_close_reason,
      closed_by = case when target_status = 'closed' then actor_id else null end,
      closed_at = case when target_status = 'closed' then timezone('utc', statement_timestamp()) else null end,
      version = issue.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where issue.id = issue_id
    and issue.repository_id = target_repository_id
    and issue.version = expected_version
    and issue.status <> target_status
  returning issue.* into changed_issue;
  if not found then
    perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_issue.repository_id,
    actor_id,
    case when target_status = 'closed' then 'issue.closed' else 'issue.reopened' end,
    'issue',
    changed_issue.id,
    jsonb_build_object('close_reason', changed_issue.close_reason, 'version', changed_issue.version),
    'issue',
    changed_issue.title
  );
  perform pg_catalog.set_config('app.issue_command', coalesce(previous_command, ''), true);
  return next changed_issue;
end;
$$;

create function public.create_discussion(
  target_repository_id uuid,
  discussion_category public.discussion_category,
  discussion_title text,
  discussion_body text default '',
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  created_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion creation requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'create', true);
  insert into public.discussions (
    repository_id,
    discussion_number,
    category,
    title,
    body,
    created_by
  )
  values (
    target_repository_id,
    private.next_artifact_number(target_repository_id, 'discussion'),
    discussion_category,
    pg_catalog.btrim(discussion_title),
    coalesce(discussion_body, ''),
    actor_id
  )
  returning * into created_discussion;
  perform private.record_collaboration_event(
    created_discussion.repository_id,
    actor_id,
    'discussion.created',
    'discussion',
    created_discussion.id,
    jsonb_build_object(
      'category', created_discussion.category,
      'discussion_number', created_discussion.discussion_number,
      'title', created_discussion.title
    ),
    'discussion',
    created_discussion.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next created_discussion;
end;
$$;

create function public.edit_discussion(
  target_repository_id uuid,
  discussion_id uuid,
  discussion_title text,
  discussion_body text,
  expected_version bigint,
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion edit requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'edit', true);
  update public.discussions as discussion
  set title = pg_catalog.btrim(discussion_title),
      body = coalesce(discussion_body, ''),
      version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and (
      discussion.title is distinct from pg_catalog.btrim(discussion_title)
      or discussion.body is distinct from coalesce(discussion_body, '')
    )
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    'discussion.edited',
    'discussion',
    changed_discussion.id,
    jsonb_build_object('version', changed_discussion.version, 'title', changed_discussion.title),
    'discussion',
    changed_discussion.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.add_discussion_comment(
  target_repository_id uuid,
  discussion_id uuid,
  comment_body text,
  expected_version bigint,
  mentioned_user_ids uuid[] default '{}'::uuid[]
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  comment_id uuid;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion comment requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'comment', true);
  update public.discussions as discussion
  set version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and discussion.status = 'open'
    and not discussion.is_locked
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  insert into public.discussion_comments (discussion_id, repository_id, body, created_by)
  values (changed_discussion.id, changed_discussion.repository_id, comment_body, actor_id)
  returning id into comment_id;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    'discussion.commented',
    'discussion',
    changed_discussion.id,
    jsonb_build_object('comment_id', comment_id, 'version', changed_discussion.version),
    'discussion',
    changed_discussion.title,
    mentioned_user_ids
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.transition_discussion(
  target_repository_id uuid,
  discussion_id uuid,
  target_status public.discussion_status,
  expected_version bigint
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion transition requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'transition', true);
  update public.discussions as discussion
  set status = target_status,
      closed_by = case when target_status = 'closed' then actor_id else null end,
      closed_at = case when target_status = 'closed' then timezone('utc', statement_timestamp()) else null end,
      version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and discussion.status <> target_status
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    case when target_status = 'closed' then 'discussion.closed' else 'discussion.reopened' end,
    'discussion',
    changed_discussion.id,
    jsonb_build_object('version', changed_discussion.version),
    'discussion',
    changed_discussion.title
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.set_discussion_lock(
  target_repository_id uuid,
  discussion_id uuid,
  should_lock boolean,
  expected_version bigint
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion moderation requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'moderate', true);
  update public.discussions as discussion
  set is_locked = should_lock,
      version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and discussion.is_locked <> should_lock
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    case when should_lock then 'discussion.locked' else 'discussion.unlocked' end,
    'discussion',
    changed_discussion.id,
    jsonb_build_object('version', changed_discussion.version),
    'discussion',
    changed_discussion.title
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.set_discussion_answer(
  target_repository_id uuid,
  target_discussion_id uuid,
  target_answer_comment_id uuid,
  expected_version bigint
)
returns setof public.discussions
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  changed_discussion public.discussions%rowtype;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Discussion answer selection requires an authenticated Actor'
      using errcode = '42501';
  end if;
  if target_answer_comment_id is not null and not exists (
    select 1
    from public.discussion_comments as comment
    where comment.id = target_answer_comment_id
      and comment.discussion_id = target_discussion_id
  ) then
    raise exception 'Answer comment is unavailable in this Discussion' using errcode = 'P0002';
  end if;
  previous_command := pg_catalog.current_setting('app.discussion_command', true);
  perform pg_catalog.set_config('app.discussion_command', 'answer', true);
  update public.discussions as discussion
  set answer_comment_id = target_answer_comment_id,
      version = discussion.version + 1,
      updated_at = timezone('utc', statement_timestamp())
  where discussion.id = target_discussion_id
    and discussion.repository_id = target_repository_id
    and discussion.version = expected_version
    and discussion.category = 'question'
    and discussion.answer_comment_id is distinct from target_answer_comment_id
  returning discussion.* into changed_discussion;
  if not found then
    perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
    return;
  end if;
  perform private.record_collaboration_event(
    changed_discussion.repository_id,
    actor_id,
    case when target_answer_comment_id is null then 'discussion.answer_cleared'
      else 'discussion.answer_selected' end,
    'discussion',
    changed_discussion.id,
    jsonb_build_object('answer_comment_id', target_answer_comment_id, 'version', changed_discussion.version),
    'discussion',
    changed_discussion.title
  );
  perform pg_catalog.set_config('app.discussion_command', coalesce(previous_command, ''), true);
  return next changed_discussion;
end;
$$;

create function public.clear_discussion_answer(
  target_repository_id uuid,
  discussion_id uuid,
  expected_version bigint
)
returns setof public.discussions
language sql
volatile
security invoker
set search_path = ''
as $$
  select *
  from public.set_discussion_answer(
    target_repository_id,
    discussion_id,
    null::uuid,
    expected_version
  );
$$;

revoke all on function public.create_issue(uuid, text, text, uuid[]) from public, anon, authenticated;
revoke all on function public.edit_issue(uuid, uuid, text, text, bigint, uuid[]) from public, anon, authenticated;
revoke all on function public.add_issue_comment(uuid, uuid, text, bigint, uuid[]) from public, anon, authenticated;
revoke all on function public.set_issue_assignee(uuid, uuid, uuid, boolean, bigint) from public, anon, authenticated;
revoke all on function public.set_issue_label(uuid, uuid, uuid, boolean, bigint) from public, anon, authenticated;
revoke all on function public.transition_issue(uuid, uuid, public.issue_status, bigint, public.issue_close_reason) from public, anon, authenticated;
revoke all on function public.create_discussion(uuid, public.discussion_category, text, text, uuid[]) from public, anon, authenticated;
revoke all on function public.edit_discussion(uuid, uuid, text, text, bigint, uuid[]) from public, anon, authenticated;
revoke all on function public.add_discussion_comment(uuid, uuid, text, bigint, uuid[]) from public, anon, authenticated;
revoke all on function public.transition_discussion(uuid, uuid, public.discussion_status, bigint) from public, anon, authenticated;
revoke all on function public.set_discussion_lock(uuid, uuid, boolean, bigint) from public, anon, authenticated;
revoke all on function public.set_discussion_answer(uuid, uuid, uuid, bigint) from public, anon, authenticated;
revoke all on function public.clear_discussion_answer(uuid, uuid, bigint) from public, anon, authenticated;

grant execute on function public.create_issue(uuid, text, text, uuid[]) to authenticated;
grant execute on function public.edit_issue(uuid, uuid, text, text, bigint, uuid[]) to authenticated;
grant execute on function public.add_issue_comment(uuid, uuid, text, bigint, uuid[]) to authenticated;
grant execute on function public.set_issue_assignee(uuid, uuid, uuid, boolean, bigint) to authenticated;
grant execute on function public.set_issue_label(uuid, uuid, uuid, boolean, bigint) to authenticated;
grant execute on function public.transition_issue(uuid, uuid, public.issue_status, bigint, public.issue_close_reason) to authenticated;
grant execute on function public.create_discussion(uuid, public.discussion_category, text, text, uuid[]) to authenticated;
grant execute on function public.edit_discussion(uuid, uuid, text, text, bigint, uuid[]) to authenticated;
grant execute on function public.add_discussion_comment(uuid, uuid, text, bigint, uuid[]) to authenticated;
grant execute on function public.transition_discussion(uuid, uuid, public.discussion_status, bigint) to authenticated;
grant execute on function public.set_discussion_lock(uuid, uuid, boolean, bigint) to authenticated;
grant execute on function public.set_discussion_answer(uuid, uuid, uuid, bigint) to authenticated;
grant execute on function public.clear_discussion_answer(uuid, uuid, bigint) to authenticated;

-- Source: supabase/schemas/95_repository_routing.sql

create function private.get_owner_profile_by_slug(target_owner_slug text)
returns table (
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  display_name text,
  avatar_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    'user'::text,
    profile.id,
    owner_namespace.slug,
    profile.display_name,
    profile.avatar_url
  from private.repository_owner_namespaces as owner_namespace
  join public.profiles as profile on profile.id = owner_namespace.user_id
  where owner_namespace.slug = target_owner_slug
    and owner_namespace.user_id is not null

  union all

  select
    'organization'::text,
    organization.id,
    owner_namespace.slug,
    organization.name,
    null::text
  from private.repository_owner_namespaces as owner_namespace
  join public.organizations as organization on organization.id = owner_namespace.organization_id
  where owner_namespace.slug = target_owner_slug
    and owner_namespace.organization_id is not null
  limit 1;
$$;

create function private.list_owner_repository_routes(target_owner_slug text)
returns table (
  id uuid,
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  slug text,
  name text,
  description text,
  visibility public.repository_visibility
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    repository.id,
    case
      when repository.owner_user_id is not null then 'user'
      else 'organization'
    end as owner_kind,
    coalesce(repository.owner_user_id, repository.owner_organization_id) as owner_id,
    owner_namespace.slug as owner_slug,
    repository.slug,
    repository.name,
    repository.description,
    repository.visibility
  from public.repositories as repository
  join private.repository_owner_namespaces as owner_namespace
    on owner_namespace.user_id = repository.owner_user_id
    or owner_namespace.organization_id = repository.owner_organization_id
  where owner_namespace.slug = target_owner_slug
    and private.can_view_repository(repository.id)
  order by repository.slug, repository.id;
$$;

create function private.get_accessible_repository_route_by_id(target_repository_id uuid)
returns table (
  id uuid,
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  slug text,
  name text,
  description text,
  visibility public.repository_visibility
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    repository.id,
    case
      when repository.owner_user_id is not null then 'user'
      else 'organization'
    end as owner_kind,
    coalesce(repository.owner_user_id, repository.owner_organization_id) as owner_id,
    owner_namespace.slug as owner_slug,
    repository.slug,
    repository.name,
    repository.description,
    repository.visibility
  from public.repositories as repository
  join private.repository_owner_namespaces as owner_namespace
    on owner_namespace.user_id = repository.owner_user_id
    or owner_namespace.organization_id = repository.owner_organization_id
  where repository.id = target_repository_id
    and private.can_view_repository(repository.id)
  limit 1;
$$;

create function private.get_accessible_repository_route_by_key(
  target_owner_slug text,
  target_repository_slug text
)
returns table (
  id uuid,
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  slug text,
  name text,
  description text,
  visibility public.repository_visibility
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    repository.id,
    case
      when repository.owner_user_id is not null then 'user'
      else 'organization'
    end as owner_kind,
    coalesce(repository.owner_user_id, repository.owner_organization_id) as owner_id,
    owner_namespace.slug as owner_slug,
    repository.slug,
    repository.name,
    repository.description,
    repository.visibility
  from public.repositories as repository
  join private.repository_owner_namespaces as owner_namespace
    on owner_namespace.user_id = repository.owner_user_id
    or owner_namespace.organization_id = repository.owner_organization_id
  where owner_namespace.slug = target_owner_slug
    and repository.slug = target_repository_slug
    and private.can_view_repository(repository.id)
  limit 1;
$$;

create function private.list_accessible_repository_routes()
returns table (
  id uuid,
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  slug text,
  name text,
  description text,
  visibility public.repository_visibility
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    repository.id,
    case
      when repository.owner_user_id is not null then 'user'
      else 'organization'
    end as owner_kind,
    coalesce(repository.owner_user_id, repository.owner_organization_id) as owner_id,
    owner_namespace.slug as owner_slug,
    repository.slug,
    repository.name,
    repository.description,
    repository.visibility
  from public.repositories as repository
  join private.repository_owner_namespaces as owner_namespace
    on owner_namespace.user_id = repository.owner_user_id
    or owner_namespace.organization_id = repository.owner_organization_id
  where private.can_view_repository(repository.id)
  order by owner_namespace.slug, repository.slug, repository.id;
$$;

revoke all on function private.get_owner_profile_by_slug(text)
  from public, anon, authenticated;
revoke all on function private.list_owner_repository_routes(text)
  from public, anon, authenticated;
revoke all on function private.get_accessible_repository_route_by_id(uuid)
  from public, anon, authenticated;
revoke all on function private.get_accessible_repository_route_by_key(text, text)
  from public, anon, authenticated;
revoke all on function private.list_accessible_repository_routes()
  from public, anon, authenticated;

grant execute on function private.get_owner_profile_by_slug(text) to anon, authenticated;
grant execute on function private.list_owner_repository_routes(text) to anon, authenticated;
grant execute on function private.get_accessible_repository_route_by_id(uuid) to anon, authenticated;
grant execute on function private.get_accessible_repository_route_by_key(text, text) to anon, authenticated;
grant execute on function private.list_accessible_repository_routes() to authenticated;

create function public.get_owner_profile_by_slug(target_owner_slug text)
returns table (
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  display_name text,
  avatar_url text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from private.get_owner_profile_by_slug(target_owner_slug);
$$;

create function public.list_owner_repository_routes(target_owner_slug text)
returns table (
  id uuid,
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  slug text,
  name text,
  description text,
  visibility public.repository_visibility
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from private.list_owner_repository_routes(target_owner_slug);
$$;

create function public.get_accessible_repository_route_by_id(target_repository_id uuid)
returns table (
  id uuid,
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  slug text,
  name text,
  description text,
  visibility public.repository_visibility
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from private.get_accessible_repository_route_by_id(target_repository_id);
$$;

create function public.get_accessible_repository_route_by_key(
  target_owner_slug text,
  target_repository_slug text
)
returns table (
  id uuid,
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  slug text,
  name text,
  description text,
  visibility public.repository_visibility
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from private.get_accessible_repository_route_by_key(
    target_owner_slug,
    target_repository_slug
  );
$$;

create function public.list_accessible_repository_routes()
returns table (
  id uuid,
  owner_kind text,
  owner_id uuid,
  owner_slug text,
  slug text,
  name text,
  description text,
  visibility public.repository_visibility
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from private.list_accessible_repository_routes();
$$;

revoke all on function public.get_owner_profile_by_slug(text)
  from public, anon, authenticated;
revoke all on function public.list_owner_repository_routes(text)
  from public, anon, authenticated;
revoke all on function public.get_accessible_repository_route_by_id(uuid)
  from public, anon, authenticated;
revoke all on function public.get_accessible_repository_route_by_key(text, text)
  from public, anon, authenticated;
revoke all on function public.list_accessible_repository_routes()
  from public, anon, authenticated;

grant execute on function public.get_owner_profile_by_slug(text) to anon, authenticated;
grant execute on function public.list_owner_repository_routes(text) to anon, authenticated;
grant execute on function public.get_accessible_repository_route_by_id(uuid) to anon, authenticated;
grant execute on function public.get_accessible_repository_route_by_key(text, text) to anon, authenticated;
grant execute on function public.list_accessible_repository_routes() to authenticated;

comment on function public.get_owner_profile_by_slug(text) is
  'Public-safe Owner identity projection resolving one shared User-or-Organization slug without exposing private namespace storage.';
comment on function public.list_owner_repository_routes(text) is
  'Owner profile Repository projection filtered through current Repository visibility/authority.';

-- Source: supabase/schemas/96_collaboration_projections.sql

create function public.update_notification_state(
  notification_id uuid,
  target_state public.notification_state
)
returns boolean
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  changed_count integer;
  previous_command text;
begin
  if (select auth.uid()) is null then
    raise exception 'Notification state requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.notification_command', true);
  perform pg_catalog.set_config('app.notification_command', 'state', true);
  update public.notification_threads as notification
  set state = target_state,
      updated_at = timezone('utc', statement_timestamp())
  where notification.id = notification_id
    and notification.recipient_id = (select auth.uid());
  get diagnostics changed_count = row_count;
  perform pg_catalog.set_config('app.notification_command', coalesce(previous_command, ''), true);
  return changed_count = 1;
end;
$$;

create function public.mark_all_notifications_read()
returns bigint
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  changed_count bigint;
  previous_command text;
begin
  if (select auth.uid()) is null then
    raise exception 'Notification state requires an authenticated Actor' using errcode = '42501';
  end if;
  previous_command := pg_catalog.current_setting('app.notification_command', true);
  perform pg_catalog.set_config('app.notification_command', 'state', true);
  update public.notification_threads as notification
  set state = 'read',
      updated_at = timezone('utc', statement_timestamp())
  where notification.recipient_id = (select auth.uid())
    and notification.state = 'unread';
  get diagnostics changed_count = row_count;
  perform pg_catalog.set_config('app.notification_command', coalesce(previous_command, ''), true);
  return changed_count;
end;
$$;

create function public.set_notification_preference(
  target_repository_id uuid,
  target_subject_type public.notification_artifact_type,
  target_subject_id uuid,
  target_mode text
)
returns boolean
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  actor_id uuid;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Notification preference requires an authenticated Actor' using errcode = '42501';
  end if;
  if target_mode not in ('watch', 'mute') then
    raise exception 'Unsupported notification preference' using errcode = '22023';
  end if;
  if not private.user_can_view_repository(actor_id, target_repository_id) then
    raise exception 'Repository is unavailable' using errcode = '42501';
  end if;
  if not (
    (target_subject_type = 'repository' and target_subject_id = target_repository_id)
    or (target_subject_type = 'page' and exists (
      select 1 from public.resources as resource
      where resource.id = target_subject_id and resource.repository_id = target_repository_id
    ))
    or (target_subject_type = 'issue' and exists (
      select 1 from public.issues as issue
      where issue.id = target_subject_id and issue.repository_id = target_repository_id
    ))
    or (target_subject_type = 'discussion' and exists (
      select 1 from public.discussions as discussion
      where discussion.id = target_subject_id and discussion.repository_id = target_repository_id
    ))
  ) then
    raise exception 'Notification subject is unavailable' using errcode = 'P0002';
  end if;
  previous_command := pg_catalog.current_setting('app.notification_command', true);
  perform pg_catalog.set_config('app.notification_command', 'preference', true);
  insert into public.notification_preferences as preference (
    recipient_id,
    repository_id,
    subject_type,
    subject_id,
    is_watched,
    is_muted
  )
  values (
    actor_id,
    target_repository_id,
    target_subject_type,
    target_subject_id,
    target_mode = 'watch',
    target_mode = 'mute'
  )
  on conflict (recipient_id, repository_id, subject_type, subject_id) do update
    set is_watched = excluded.is_watched,
      is_muted = excluded.is_muted,
      updated_at = timezone('utc', statement_timestamp());
  perform pg_catalog.set_config('app.notification_command', coalesce(previous_command, ''), true);
  return true;
end;
$$;

create function public.list_notifications(
  requested_state text default 'all',
  requested_page integer default 1
)
returns table (
  id uuid,
  repository_id uuid,
  artifact_type public.notification_artifact_type,
  artifact_id uuid,
  reason public.notification_reason,
  source_evidence_id bigint,
  state public.notification_state,
  title text,
  event_count bigint,
  updated_at timestamptz,
  href text,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with authorized as materialized (
    select
      notification.id,
      notification.repository_id,
      notification.artifact_type,
      notification.artifact_id,
      notification.reason,
      notification.source_evidence_id,
      notification.state,
      notification.title,
      notification.event_count,
      notification.updated_at,
      namespace.slug as owner_slug,
      repository.slug as repository_slug,
      issue.issue_number,
      discussion.discussion_number
    from public.notification_threads as notification
    join public.repositories as repository on repository.id = notification.repository_id
    join private.repository_owner_namespaces as namespace
      on namespace.user_id = repository.owner_user_id
      or namespace.organization_id = repository.owner_organization_id
    left join public.issues as issue
      on notification.artifact_type = 'issue' and issue.id = notification.artifact_id
    left join public.discussions as discussion
      on notification.artifact_type = 'discussion' and discussion.id = notification.artifact_id
    where notification.recipient_id = (select auth.uid())
      and private.user_can_view_repository((select auth.uid()), notification.repository_id)
  ),
  filtered as (
    select *
    from authorized
    where requested_state = 'all' or state::text = requested_state
  )
  select
    filtered.id,
    filtered.repository_id,
    filtered.artifact_type,
    filtered.artifact_id,
    filtered.reason,
    filtered.source_evidence_id,
    filtered.state,
    filtered.title,
    filtered.event_count,
    filtered.updated_at,
    case filtered.artifact_type
      when 'repository' then '/' || filtered.owner_slug || '/' || filtered.repository_slug
      when 'page' then '/' || filtered.owner_slug || '/' || filtered.repository_slug || '/wiki/' || filtered.artifact_id::text
      when 'issue' then '/' || filtered.owner_slug || '/' || filtered.repository_slug || '/issues/' || filtered.issue_number::text
      when 'discussion' then '/' || filtered.owner_slug || '/' || filtered.repository_slug || '/discussions/' || filtered.discussion_number::text
    end as href,
    count(*) over () as total_count
  from filtered
  order by filtered.updated_at desc, filtered.id
  limit 20
  offset (greatest(coalesce(requested_page, 1), 1) - 1) * 20;
$$;

create function public.search_collaboration(
  search_query text,
  requested_type text default 'all',
  requested_owner text default '',
  requested_repository text default '',
  requested_status text default '',
  requested_sort text default 'relevance',
  requested_page integer default 1
)
returns table (
  result_type text,
  stable_id uuid,
  repository_id uuid,
  title text,
  body_snippet text,
  created_at timestamptz,
  updated_at timestamptz,
  href text,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with normalized as (
    select
      pg_catalog.btrim(coalesce(search_query, '')) as query_text,
      plainto_tsquery('simple', pg_catalog.btrim(coalesce(search_query, ''))) as parsed_query
  ),
  authorized as materialized (
    select
      'repository'::text as candidate_type,
      repository.id as stable_id,
      repository.id as repository_id,
      repository.name as title,
      coalesce(repository.description, '') as body,
      null::text as artifact_status,
      repository.search_vector,
      repository.created_at,
      repository.updated_at,
      namespace.slug as owner_slug,
      repository.slug as repository_slug,
      null::bigint as artifact_number
    from public.repositories as repository
    join private.repository_owner_namespaces as namespace
      on namespace.user_id = repository.owner_user_id
      or namespace.organization_id = repository.owner_organization_id
    where private.user_can_view_repository((select auth.uid()), repository.id)

    union all

    select
      'page', resource.id, resource.repository_id, resource.title,
      coalesce(resource.content ->> 'body', ''), null, resource.search_vector,
      resource.created_at, resource.updated_at, namespace.slug, repository.slug, null
    from public.resources as resource
    join public.repositories as repository on repository.id = resource.repository_id
    join private.repository_owner_namespaces as namespace
      on namespace.user_id = repository.owner_user_id
      or namespace.organization_id = repository.owner_organization_id
    where resource.kind = 'page'
      and private.user_can_view_repository((select auth.uid()), resource.repository_id)

    union all

    select
      'issue', issue.id, issue.repository_id, issue.title, issue.body, issue.status::text,
      issue.search_vector, issue.created_at, issue.updated_at, namespace.slug,
      repository.slug, issue.issue_number
    from public.issues as issue
    join public.repositories as repository on repository.id = issue.repository_id
    join private.repository_owner_namespaces as namespace
      on namespace.user_id = repository.owner_user_id
      or namespace.organization_id = repository.owner_organization_id
    where private.user_can_view_repository((select auth.uid()), issue.repository_id)

    union all

    select
      'discussion', discussion.id, discussion.repository_id, discussion.title,
      discussion.body, discussion.status::text, discussion.search_vector,
      discussion.created_at, discussion.updated_at, namespace.slug,
      repository.slug, discussion.discussion_number
    from public.discussions as discussion
    join public.repositories as repository on repository.id = discussion.repository_id
    join private.repository_owner_namespaces as namespace
      on namespace.user_id = repository.owner_user_id
      or namespace.organization_id = repository.owner_organization_id
    where private.user_can_view_repository((select auth.uid()), discussion.repository_id)
  ),
  matched as (
    select
      case when requested_type = 'project' then 'project' else candidate.candidate_type end as result_type,
      candidate.*,
      case
        when lower(candidate.title) = lower(normalized.query_text) then 100::real
        when pg_catalog.strpos(lower(candidate.title), lower(normalized.query_text)) > 0 then 80::real
        else 0::real
      end
      + case when to_tsvector('simple', candidate.title) @@ normalized.parsed_query then 60::real else 0::real end
      + case when to_tsvector('simple', candidate.body) @@ normalized.parsed_query then 40::real else 0::real end
      + ts_rank(candidate.search_vector, normalized.parsed_query) as relevance
    from authorized as candidate
    cross join normalized
    where normalized.query_text <> ''
      and candidate.search_vector @@ normalized.parsed_query
      and (
        requested_type = 'all'
        or candidate.candidate_type = requested_type
        or (requested_type = 'project' and candidate.candidate_type in ('page', 'issue', 'discussion'))
      )
      and (requested_owner = '' or candidate.owner_slug = lower(requested_owner))
      and (requested_repository = '' or candidate.repository_slug = lower(requested_repository))
      and (requested_status = '' or candidate.artifact_status = requested_status)
  )
  select
    matched.result_type,
    matched.stable_id,
    matched.repository_id,
    matched.title,
    ts_headline(
      'simple',
      matched.body,
      normalized.parsed_query,
      'MaxWords=24, MinWords=8'
    ) as body_snippet,
    matched.created_at,
    matched.updated_at,
    case
      when matched.result_type = 'project' then '/' || matched.owner_slug || '/' || matched.repository_slug || '/projects'
      when matched.candidate_type = 'repository' then '/' || matched.owner_slug || '/' || matched.repository_slug
      when matched.candidate_type = 'page' then '/' || matched.owner_slug || '/' || matched.repository_slug || '/wiki/' || matched.stable_id::text
      when matched.candidate_type = 'issue' then '/' || matched.owner_slug || '/' || matched.repository_slug || '/issues/' || matched.artifact_number::text
      when matched.candidate_type = 'discussion' then '/' || matched.owner_slug || '/' || matched.repository_slug || '/discussions/' || matched.artifact_number::text
    end as href,
    count(*) over () as total_count
  from matched
  cross join normalized
  order by
    case when requested_sort = 'relevance' then matched.relevance end desc,
    case when requested_sort = 'updated' then matched.updated_at end desc,
    case when requested_sort = 'created' then matched.created_at end desc,
    matched.updated_at desc,
    matched.stable_id
  limit 20
  offset (greatest(coalesce(requested_page, 1), 1) - 1) * 20;
$$;

create function public.explore_public_repositories(
  requested_sort text default 'recent',
  requested_owner_type text default 'all',
  requested_artifact_type text default 'all',
  requested_page integer default 1
)
returns table (
  id uuid,
  owner_slug text,
  owner_type text,
  slug text,
  name text,
  description text,
  created_at timestamptz,
  last_public_activity_at timestamptz,
  href text,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with public_repositories as materialized (
    select
      repository.id,
      namespace.slug as owner_slug,
      case when repository.owner_user_id is not null then 'user' else 'organization' end as owner_type,
      repository.slug,
      repository.name,
      repository.description,
      repository.created_at,
      coalesce(max(activity.created_at), repository.created_at) as last_public_activity_at
    from public.repositories as repository
    join private.repository_owner_namespaces as namespace
      on namespace.user_id = repository.owner_user_id
      or namespace.organization_id = repository.owner_organization_id
    left join public.activity_events as activity on activity.repository_id = repository.id
    where repository.visibility = 'public'
    group by repository.id, namespace.slug
  ),
  filtered as (
    select public_repository.*
    from public_repositories as public_repository
    where (requested_owner_type = 'all' or public_repository.owner_type = requested_owner_type)
      and (
        requested_artifact_type = 'all'
        or (requested_artifact_type = 'page' and exists (
          select 1 from public.resources as resource
          where resource.repository_id = public_repository.id and resource.kind = 'page'
        ))
        or (requested_artifact_type = 'issue' and exists (
          select 1 from public.issues as issue where issue.repository_id = public_repository.id
        ))
        or (requested_artifact_type = 'discussion' and exists (
          select 1 from public.discussions as discussion where discussion.repository_id = public_repository.id
        ))
      )
  )
  select
    filtered.id,
    filtered.owner_slug,
    filtered.owner_type,
    filtered.slug,
    filtered.name,
    filtered.description,
    filtered.created_at,
    filtered.last_public_activity_at,
    '/' || filtered.owner_slug || '/' || filtered.slug as href,
    count(*) over () as total_count
  from filtered
  order by
    case when requested_sort = 'recent' then filtered.last_public_activity_at end desc,
    case when requested_sort = 'new' then filtered.created_at end desc,
    filtered.id
  limit 20
  offset (greatest(coalesce(requested_page, 1), 1) - 1) * 20;
$$;

create function public.list_project_items(
  target_repository_id uuid default null,
  requested_type text default 'all',
  requested_status text default '',
  requested_assignee_id uuid default null,
  requested_label_id uuid default null,
  requested_sort text default 'updated',
  requested_page integer default 1
)
returns table (
  item_type text,
  id uuid,
  repository_id uuid,
  title text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  href text,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with authorized as materialized (
    select 'page'::text as item_type, resource.id, resource.repository_id,
      resource.title, 'active'::text as status, resource.created_at, resource.updated_at,
      namespace.slug as owner_slug, repository.slug as repository_slug,
      null::bigint as artifact_number
    from public.resources as resource
    join public.repositories as repository on repository.id = resource.repository_id
    join private.repository_owner_namespaces as namespace
      on namespace.user_id = repository.owner_user_id
      or namespace.organization_id = repository.owner_organization_id
    where (select auth.uid()) is not null
      and private.user_can_view_repository((select auth.uid()), resource.repository_id)

    union all

    select 'issue', issue.id, issue.repository_id, issue.title, issue.status::text,
      issue.created_at, issue.updated_at, namespace.slug, repository.slug, issue.issue_number
    from public.issues as issue
    join public.repositories as repository on repository.id = issue.repository_id
    join private.repository_owner_namespaces as namespace
      on namespace.user_id = repository.owner_user_id
      or namespace.organization_id = repository.owner_organization_id
    where (select auth.uid()) is not null
      and private.user_can_view_repository((select auth.uid()), issue.repository_id)
      and (requested_assignee_id is null or exists (
        select 1 from public.issue_assignees as assignee
        where assignee.issue_id = issue.id and assignee.user_id = requested_assignee_id
      ))
      and (requested_label_id is null or exists (
        select 1 from public.issue_labels as applied
        where applied.issue_id = issue.id and applied.label_id = requested_label_id
      ))

    union all

    select 'discussion', discussion.id, discussion.repository_id, discussion.title,
      discussion.status::text, discussion.created_at, discussion.updated_at,
      namespace.slug, repository.slug, discussion.discussion_number
    from public.discussions as discussion
    join public.repositories as repository on repository.id = discussion.repository_id
    join private.repository_owner_namespaces as namespace
      on namespace.user_id = repository.owner_user_id
      or namespace.organization_id = repository.owner_organization_id
    where (select auth.uid()) is not null
      and private.user_can_view_repository((select auth.uid()), discussion.repository_id)
  ),
  filtered as (
    select * from authorized
    where (target_repository_id is null or repository_id = target_repository_id)
      and (requested_type = 'all' or item_type = requested_type)
      and (
        requested_status in ('', 'all')
        or (requested_status = 'active' and status in ('active', 'open'))
        or status = requested_status
      )
      and (
        (requested_assignee_id is null and requested_label_id is null)
        or item_type = 'issue'
      )
  )
  select
    filtered.item_type,
    filtered.id,
    filtered.repository_id,
    filtered.title,
    filtered.status,
    filtered.created_at,
    filtered.updated_at,
    case filtered.item_type
      when 'page' then '/' || filtered.owner_slug || '/' || filtered.repository_slug || '/wiki/' || filtered.id::text
      when 'issue' then '/' || filtered.owner_slug || '/' || filtered.repository_slug || '/issues/' || filtered.artifact_number::text
      when 'discussion' then '/' || filtered.owner_slug || '/' || filtered.repository_slug || '/discussions/' || filtered.artifact_number::text
    end,
    count(*) over ()
  from filtered
  order by
    case when requested_sort = 'created' then filtered.created_at end desc,
    filtered.updated_at desc,
    filtered.id
  limit 20
  offset (greatest(coalesce(requested_page, 1), 1) - 1) * 20;
$$;

revoke all on function public.update_notification_state(uuid, public.notification_state) from public, anon, authenticated;
revoke all on function public.mark_all_notifications_read() from public, anon, authenticated;
revoke all on function public.set_notification_preference(uuid, public.notification_artifact_type, uuid, text) from public, anon, authenticated;
revoke all on function public.list_notifications(text, integer) from public, anon, authenticated;
revoke all on function public.search_collaboration(text, text, text, text, text, text, integer) from public, anon, authenticated;
revoke all on function public.explore_public_repositories(text, text, text, integer) from public, anon, authenticated;
revoke all on function public.list_project_items(uuid, text, text, uuid, uuid, text, integer) from public, anon, authenticated;

grant execute on function public.update_notification_state(uuid, public.notification_state) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.set_notification_preference(uuid, public.notification_artifact_type, uuid, text) to authenticated;
grant execute on function public.list_notifications(text, integer) to authenticated;
grant execute on function public.search_collaboration(text, text, text, text, text, text, integer) to anon, authenticated;
grant execute on function public.explore_public_repositories(text, text, text, integer) to anon, authenticated;
grant execute on function public.list_project_items(uuid, text, text, uuid, uuid, text, integer) to authenticated;

comment on function public.search_collaboration(text, text, text, text, text, text, integer) is
  'Authorization-materialized no-code search; ranking, count, and snippet generation occur only after access filtering.';
comment on function public.list_project_items(uuid, text, text, uuid, uuid, text, integer) is
  'Derived planning Projection only; it owns no Artifact, identity, persistence, or authority.';

-- Source: supabase/schemas/99_rls.sql

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.repositories enable row level security;
alter table public.repository_user_grants enable row level security;
alter table public.resources enable row level security;
alter table public.repository_labels enable row level security;
alter table public.issues enable row level security;
alter table public.issue_assignees enable row level security;
alter table public.issue_labels enable row level security;
alter table public.issue_comments enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_comments enable row level security;
alter table public.activity_events enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_threads enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_memberships from anon, authenticated;
revoke all on table public.repositories from anon, authenticated;
revoke all on table public.repository_user_grants from anon, authenticated;
revoke all on table public.resources from anon, authenticated;
revoke all on table public.repository_artifact_counters from anon, authenticated;
revoke all on table public.repository_labels from anon, authenticated;
revoke all on table public.issues from anon, authenticated;
revoke all on table public.issue_assignees from anon, authenticated;
revoke all on table public.issue_labels from anon, authenticated;
revoke all on table public.issue_comments from anon, authenticated;
revoke all on table public.discussions from anon, authenticated;
revoke all on table public.discussion_comments from anon, authenticated;
revoke all on table public.activity_events from anon, authenticated;
revoke all on table public.notification_preferences from anon, authenticated;
revoke all on table public.notification_threads from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url, updated_at) on table public.profiles to authenticated;

grant select, insert on table public.organizations to authenticated;
grant update (slug, name, updated_at) on table public.organizations to authenticated;

grant select, insert, delete on table public.organization_memberships to authenticated;
grant update (role) on table public.organization_memberships to authenticated;

grant select on table public.repositories to anon, authenticated;
grant insert on table public.repositories to authenticated;
grant update (slug, name, description, visibility, updated_at) on table public.repositories to authenticated;

grant select, insert, delete on table public.repository_user_grants to authenticated;
grant update (role) on table public.repository_user_grants to authenticated;

grant select on table public.resources to anon, authenticated;
grant insert on table public.resources to authenticated;
grant update (title, content) on table public.resources to authenticated;

grant select on table public.repository_labels to anon, authenticated;
grant select on table public.issues to anon, authenticated;
grant insert on table public.issues to authenticated;
grant update (
  title,
  body,
  status,
  close_reason,
  version,
  updated_at,
  closed_by,
  closed_at
) on table public.issues to authenticated;
grant select, insert, delete on table public.issue_assignees to authenticated;
grant select, insert, delete on table public.issue_labels to authenticated;
grant select on table public.issue_assignees to anon;
grant select on table public.issue_labels to anon;
grant select on table public.issue_comments to anon, authenticated;
grant insert on table public.issue_comments to authenticated;

grant select on table public.discussions to anon, authenticated;
grant insert on table public.discussions to authenticated;
grant update (
  title,
  body,
  status,
  is_locked,
  answer_comment_id,
  version,
  updated_at,
  closed_by,
  closed_at
) on table public.discussions to authenticated;
grant select on table public.discussion_comments to anon, authenticated;
grant insert on table public.discussion_comments to authenticated;

grant select on table public.activity_events to authenticated;

grant select, insert, delete on table public.notification_preferences to authenticated;
grant update (is_watched, is_muted, updated_at)
  on table public.notification_preferences to authenticated;
grant select on table public.notification_threads to authenticated;
grant update (state, updated_at) on table public.notification_threads to authenticated;

-- Organization, Repository, and Resource hard deletion deliberately have no end-user DELETE grant
-- or RLS policy until an accepted lifecycle defines retention, restore, and historical continuity.
-- Resource INSERT/UPDATE table privileges support SECURITY INVOKER Page command RPCs. Raw Data API
-- mutations fail closed because the policies below require transaction-local command context set by
-- those RPCs in addition to the ordinary Actor and Capability checks.

create policy profiles_select_self
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_self
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy organizations_select_member
on public.organizations
for select
to authenticated
using ((select private.is_organization_member(id)));

create policy organizations_insert_actor
on public.organizations
for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy organizations_update_admin
on public.organizations
for update
to authenticated
using ((select private.is_organization_admin(id)))
with check ((select private.is_organization_admin(id)));

create policy organization_memberships_select_member
on public.organization_memberships
for select
to authenticated
using ((select private.is_organization_member(organization_id)));

create policy organization_memberships_insert_delegated
on public.organization_memberships
for insert
to authenticated
with check (
  (select private.can_manage_organization_membership(organization_id, role))
);

create policy organization_memberships_update_delegated
on public.organization_memberships
for update
to authenticated
using (
  (select private.can_manage_organization_membership(organization_id, role))
)
with check (
  (select private.can_manage_organization_membership(organization_id, role))
);

create policy organization_memberships_delete_delegated
on public.organization_memberships
for delete
to authenticated
using (
  (select private.can_manage_organization_membership(organization_id, role))
);

create policy repositories_select_visible
on public.repositories
for select
to anon, authenticated
using ((select private.can_view_repository(id)));

create policy repositories_insert_access_policy
on public.repositories
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and (
    select private.can_create_repository_for_owner(
      owner_user_id,
      owner_organization_id
    )
  )
);

create policy repositories_update_manager
on public.repositories
for update
to authenticated
using ((select private.has_repository_capability(id, 'repository.manage')))
with check ((select private.has_repository_capability(id, 'repository.manage')));

create policy repository_user_grants_select_viewer
on public.repository_user_grants
for select
to authenticated
using ((select private.has_repository_capability(repository_id, 'repository.view')));

create policy repository_user_grants_insert_delegated
on public.repository_user_grants
for insert
to authenticated
with check (
  (select auth.uid()) = granted_by
  and (select private.can_manage_repository_grant(repository_id, role))
);

create policy repository_user_grants_update_delegated
on public.repository_user_grants
for update
to authenticated
using (
  (select private.can_manage_repository_grant(repository_id, role))
)
with check (
  (select private.can_manage_repository_grant(repository_id, role))
);

create policy repository_user_grants_delete_delegated
on public.repository_user_grants
for delete
to authenticated
using (
  (select private.can_manage_repository_grant(repository_id, role))
);

create policy resources_select_visible
on public.resources
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy resources_insert_contributor
on public.resources
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.page_command', true)) = 'create'
  and (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'resource.create'))
);

create policy resources_update_contributor
on public.resources
for update
to authenticated
using (
  (select pg_catalog.current_setting('app.page_command', true)) = 'update'
  and (select private.has_repository_capability(repository_id, 'resource.update'))
)
with check (
  (select pg_catalog.current_setting('app.page_command', true)) = 'update'
  and (select private.has_repository_capability(repository_id, 'resource.update'))
);

create policy repository_labels_select_visible
on public.repository_labels
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issues_select_visible
on public.issues
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issues_insert_command
on public.issues
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'create'
  and (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'resource.create'))
);

create policy issues_update_command
on public.issues
for update
to authenticated
using (
  case (select pg_catalog.current_setting('app.issue_command', true))
    when 'comment' then (select private.has_repository_capability(repository_id, 'resource.create'))
    when 'edit' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'assign' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'label' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'transition' then (select private.has_repository_capability(repository_id, 'resource.update'))
    else false
  end
)
with check (
  case (select pg_catalog.current_setting('app.issue_command', true))
    when 'comment' then (select private.has_repository_capability(repository_id, 'resource.create'))
    when 'edit' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'assign' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'label' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'transition' then (select private.has_repository_capability(repository_id, 'resource.update'))
    else false
  end
);

create policy issue_assignees_select_visible
on public.issue_assignees
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issue_assignees_insert_command
on public.issue_assignees
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'assign'
  and (select auth.uid()) = assigned_by
  and (select private.has_repository_capability(repository_id, 'resource.update'))
  and (select private.user_can_view_repository(user_id, repository_id))
);

create policy issue_assignees_delete_command
on public.issue_assignees
for delete
to authenticated
using (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'assign'
  and (select private.has_repository_capability(repository_id, 'resource.update'))
);

create policy issue_labels_select_visible
on public.issue_labels
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issue_labels_insert_command
on public.issue_labels
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'label'
  and (select auth.uid()) = applied_by
  and (select private.has_repository_capability(repository_id, 'resource.update'))
);

create policy issue_labels_delete_command
on public.issue_labels
for delete
to authenticated
using (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'label'
  and (select private.has_repository_capability(repository_id, 'resource.update'))
);

create policy issue_comments_select_visible
on public.issue_comments
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy issue_comments_insert_command
on public.issue_comments
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.issue_command', true)) = 'comment'
  and (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'resource.create'))
);

create policy discussions_select_visible
on public.discussions
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy discussions_insert_command
on public.discussions
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.discussion_command', true)) = 'create'
  and (select auth.uid()) = created_by
  and (
    (category <> 'announcement' and (select private.has_repository_capability(repository_id, 'resource.create')))
    or (category = 'announcement' and (select private.has_repository_capability(repository_id, 'repository.manage')))
  )
);

create policy discussions_update_command
on public.discussions
for update
to authenticated
using (
  case (select pg_catalog.current_setting('app.discussion_command', true))
    when 'comment' then (select private.has_repository_capability(repository_id, 'resource.create'))
    when 'moderate' then (select private.has_repository_capability(repository_id, 'repository.manage'))
    when 'edit' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'transition' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'answer' then (select private.has_repository_capability(repository_id, 'resource.update'))
    else false
  end
)
with check (
  case (select pg_catalog.current_setting('app.discussion_command', true))
    when 'comment' then (select private.has_repository_capability(repository_id, 'resource.create'))
    when 'moderate' then (select private.has_repository_capability(repository_id, 'repository.manage'))
    when 'edit' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'transition' then (select private.has_repository_capability(repository_id, 'resource.update'))
    when 'answer' then (select private.has_repository_capability(repository_id, 'resource.update'))
    else false
  end
);

create policy discussion_comments_select_visible
on public.discussion_comments
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy discussion_comments_insert_command
on public.discussion_comments
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.discussion_command', true)) = 'comment'
  and (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'resource.create'))
  and exists (
    select 1
    from public.discussions as discussion
    where discussion.id = discussion_id
      and discussion.status = 'open'
      and not discussion.is_locked
  )
);

create policy notification_preferences_select_self
on public.notification_preferences
for select
to authenticated
using (
  (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

create policy notification_preferences_insert_command
on public.notification_preferences
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'preference'
  and (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

create policy notification_preferences_update_command
on public.notification_preferences
for update
to authenticated
using (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'preference'
  and (select auth.uid()) = recipient_id
)
with check (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'preference'
  and (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

create policy notification_preferences_delete_command
on public.notification_preferences
for delete
to authenticated
using (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'preference'
  and (select auth.uid()) = recipient_id
);

create policy notification_threads_select_self_with_current_access
on public.notification_threads
for select
to authenticated
using (
  (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

create policy notification_threads_update_command
on public.notification_threads
for update
to authenticated
using (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'state'
  and (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
)
with check (
  (select pg_catalog.current_setting('app.notification_command', true)) = 'state'
  and (select auth.uid()) = recipient_id
  and (select private.user_can_view_repository(recipient_id, repository_id))
);

-- Activity Event payload is historical Evidence, not part of the anonymous public-read baseline.
-- A future public Activity projection requires its own privacy/redaction contract instead of
-- exposing the raw evidence envelope through public Repository visibility.
create policy activity_events_select_authorized_viewer
on public.activity_events
for select
to authenticated
using ((select private.has_repository_capability(repository_id, 'repository.view')));

-- Source: supabase/schemas/99_zz_repository_grant_command_guardrails.sql

drop policy if exists repository_user_grants_insert_delegated
on public.repository_user_grants;
drop policy if exists repository_user_grants_update_delegated
on public.repository_user_grants;
drop policy if exists repository_user_grants_delete_delegated
on public.repository_user_grants;

create policy repository_user_grants_insert_delegated
on public.repository_user_grants
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.repository_grant_command', true)) = 'mutate'
  and (select auth.uid()) = granted_by
  and user_id <> (select auth.uid())
  and (select private.can_manage_repository_grant(repository_id, role))
);

create policy repository_user_grants_update_delegated
on public.repository_user_grants
for update
to authenticated
using (
  (select pg_catalog.current_setting('app.repository_grant_command', true)) = 'mutate'
  and user_id <> (select auth.uid())
  and (select private.can_manage_repository_grant(repository_id, role))
)
with check (
  (select pg_catalog.current_setting('app.repository_grant_command', true)) = 'mutate'
  and user_id <> (select auth.uid())
  and (select private.can_manage_repository_grant(repository_id, role))
);

create policy repository_user_grants_delete_delegated
on public.repository_user_grants
for delete
to authenticated
using (
  (select pg_catalog.current_setting('app.repository_grant_command', true)) = 'mutate'
  and user_id <> (select auth.uid())
  and (select private.can_manage_repository_grant(repository_id, role))
);
