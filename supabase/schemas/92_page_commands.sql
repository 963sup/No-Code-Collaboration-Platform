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
