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
