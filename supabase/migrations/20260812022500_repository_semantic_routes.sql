create function public.get_accessible_repository_route_by_id(target_repository_id uuid)
returns table (
  id uuid,
  organization_id uuid,
  organization_slug text,
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
    repository.organization_id,
    organization.slug as organization_slug,
    repository.slug,
    repository.name,
    repository.description,
    repository.visibility
  from public.repositories as repository
  join public.organizations as organization
    on organization.id = repository.organization_id
  where repository.id = target_repository_id
    and private.can_view_repository(repository.id)
  limit 1;
$$;

create function public.get_accessible_repository_route_by_key(
  target_organization_slug text,
  target_repository_slug text
)
returns table (
  id uuid,
  organization_id uuid,
  organization_slug text,
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
    repository.organization_id,
    organization.slug as organization_slug,
    repository.slug,
    repository.name,
    repository.description,
    repository.visibility
  from public.repositories as repository
  join public.organizations as organization
    on organization.id = repository.organization_id
  where organization.slug = target_organization_slug
    and repository.slug = target_repository_slug
    and private.can_view_repository(repository.id)
  limit 1;
$$;

create function public.list_accessible_repository_routes()
returns table (
  id uuid,
  organization_id uuid,
  organization_slug text,
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
    repository.organization_id,
    organization.slug as organization_slug,
    repository.slug,
    repository.name,
    repository.description,
    repository.visibility
  from public.repositories as repository
  join public.organizations as organization
    on organization.id = repository.organization_id
  where private.can_view_repository(repository.id)
  order by organization.slug, repository.slug, repository.id;
$$;

revoke all on function public.get_accessible_repository_route_by_id(uuid)
  from public, anon, authenticated;
revoke all on function public.get_accessible_repository_route_by_key(text, text)
  from public, anon, authenticated;
revoke all on function public.list_accessible_repository_routes()
  from public, anon, authenticated;

grant execute on function public.get_accessible_repository_route_by_id(uuid) to authenticated;
grant execute on function public.get_accessible_repository_route_by_key(text, text) to authenticated;
grant execute on function public.list_accessible_repository_routes() to authenticated;
