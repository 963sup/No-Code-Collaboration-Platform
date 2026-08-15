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
