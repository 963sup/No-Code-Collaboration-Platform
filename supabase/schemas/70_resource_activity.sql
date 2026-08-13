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
