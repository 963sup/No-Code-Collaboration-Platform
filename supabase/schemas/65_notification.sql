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
