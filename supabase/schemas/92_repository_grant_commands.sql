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

create function private.repository_grant_target_exists(
  target_repository_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_repository_capability(
    target_repository_id,
    'repository.access.manage'
  ) and exists (
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
  if not private.has_repository_capability(
    target_repository_id,
    'repository.access.manage'
  ) then
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
  if not private.has_repository_capability(
    target_repository_id,
    'repository.access.manage'
  ) then
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
revoke all on function private.repository_grant_target_exists(uuid, uuid)
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
grant execute on function private.repository_grant_target_exists(uuid, uuid) to authenticated;
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
  changed_rows integer;
  previous_command text;
begin
  actor_id := (select auth.uid());
  if actor_id is null then
    raise exception 'Repository Grant mutation requires an authenticated Actor'
      using errcode = '42501';
  end if;

  if not private.has_repository_capability(
    target_repository_id,
    'repository.access.manage'
  ) then
    return 'forbidden';
  end if;

  if actor_id = target_user_id then
    return 'forbidden';
  end if;

  if not private.repository_grant_target_exists(target_repository_id, target_user_id) then
    return 'target-unavailable';
  end if;

  if expected_role is null and proposed_role is null then
    return 'target-unavailable';
  end if;

  if expected_role is not null
    and not private.can_manage_repository_grant(target_repository_id, expected_role) then
    return 'forbidden';
  end if;

  if proposed_role is not null
    and not private.can_manage_repository_grant(target_repository_id, proposed_role) then
    return 'forbidden';
  end if;

  if expected_role is not distinct from proposed_role then
    if exists (
      select 1
      from public.repository_user_grants as direct_grant
      where direct_grant.repository_id = target_repository_id
        and direct_grant.user_id = target_user_id
        and direct_grant.role = expected_role
    ) then
      return 'unchanged';
    end if;
    return 'state-changed';
  end if;

  previous_command := pg_catalog.current_setting('app.repository_grant_command', true);
  perform pg_catalog.set_config('app.repository_grant_command', 'mutate', true);

  if expected_role is null then
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
    )
    on conflict (repository_id, user_id) do nothing;
    get diagnostics changed_rows = row_count;
  elsif proposed_role is null then
    delete from public.repository_user_grants as direct_grant
    where direct_grant.repository_id = target_repository_id
      and direct_grant.user_id = target_user_id
      and direct_grant.role = expected_role;
    get diagnostics changed_rows = row_count;
  else
    update public.repository_user_grants as direct_grant
    set role = proposed_role
    where direct_grant.repository_id = target_repository_id
      and direct_grant.user_id = target_user_id
      and direct_grant.role = expected_role;
    get diagnostics changed_rows = row_count;
  end if;

  if changed_rows <> 1 then
    perform pg_catalog.set_config(
      'app.repository_grant_command',
      coalesce(previous_command, ''),
      true
    );
    return 'state-changed';
  end if;

  perform private.record_repository_grant_event(
    target_repository_id,
    actor_id,
    target_user_id,
    expected_role,
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
grant execute on function public.find_repository_grant_target_by_username(uuid, text) to authenticated;
grant execute on function public.execute_repository_grant_command(
  uuid,
  uuid,
  public.repository_role,
  public.repository_role
) to authenticated;

comment on function public.list_repository_direct_grants(uuid) is
  'Direct User Grant management projection, available only to a Repository Admin.';
comment on function public.find_repository_grant_target_by_username(uuid, text) is
  'Admin-only exact User-username resolution for Repository Grant management; returns only public-safe profile fields.';
comment on function public.execute_repository_grant_command(
  uuid,
  uuid,
  public.repository_role,
  public.repository_role
) is
  'Admin-only compare-and-swap Direct Repository Grant command; Activity Evidence is written only after exactly one accepted state transition.';
