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
    join public.organization_memberships as membership
      on membership.organization_id = repository.organization_id
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
      'resource.delete',
      'member.manage'
    )
    when 'admin' then requested_capability in (
      'repository.view',
      'repository.manage',
      'resource.view',
      'resource.create',
      'resource.update',
      'resource.delete',
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
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
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
  insert into public.organization_memberships (organization_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (organization_id, user_id) do update set role = 'owner';
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
  insert into public.activity_events (
    repository_id,
    actor_id,
    event_type,
    subject_type,
    subject_id,
    payload
  )
  values (
    new.id,
    new.created_by,
    'repository.created',
    'repository',
    new.id,
    jsonb_build_object('name', new.name)
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
    new.created_by,
    'resource.created',
    'resource',
    new.id,
    jsonb_build_object('kind', new.kind, 'title', new.title)
  );
  return new;
end;
$$;

create trigger auth_user_created_profile
after insert on auth.users
for each row execute function private.create_profile_for_auth_user();

create trigger organization_created_owner
after insert on public.organizations
for each row execute function private.add_organization_owner();

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
before update on public.resources
for each row execute function private.touch_updated_at();

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
