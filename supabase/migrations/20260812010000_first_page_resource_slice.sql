create or replace function private.touch_updated_at()
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

do $$
begin
  if exists (
    select 1
    from public.resources
    where kind = 'page'
      and not (
        content = '{}'::jsonb
        or (
          jsonb_typeof(content) = 'object'
          and jsonb_typeof(content -> 'body') = 'string'
          and content = jsonb_build_object('body', content ->> 'body')
        )
      )
  ) then
    raise exception 'existing Page content does not satisfy the accepted migration inputs'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.resources
    where kind = 'page'
      and not (title ~ '[^[:space:]]')
  ) then
    raise exception 'existing Page title contains only whitespace'
      using errcode = '23514';
  end if;
end;
$$;

update public.resources
set content = '{"body": ""}'::jsonb
where kind = 'page'
  and content = '{}'::jsonb;

alter table public.resources
  alter column content set default '{"body": ""}'::jsonb;

alter table public.resources
  drop constraint resources_title_length;

alter table public.resources
  add constraint resources_title_length check (
    char_length(title) between 1 and 240
    and title ~ '[^[:space:]]'
  );

alter table public.resources
  add constraint resources_page_content_shape check (
    kind <> 'page'
    or (
      jsonb_typeof(content) = 'object'
      and jsonb_typeof(content -> 'body') = 'string'
      and content = jsonb_build_object('body', content ->> 'body')
    )
  );

revoke update (updated_at) on public.resources from authenticated;

drop trigger resources_touch_updated_at on public.resources;

create trigger resources_touch_updated_at
before update of title, content on public.resources
for each row
when (old.title is distinct from new.title or old.content is distinct from new.content)
execute function private.touch_updated_at();

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

  insert into public.activity_events (
    repository_id,
    actor_id,
    event_type,
    subject_type,
    subject_id,
    payload
  )
  values (
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
    )
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
