-- Correct Repository ownership from Organization-only to typed User-or-Organization ownership.
-- supabase/schemas remains the canonical desired database state; this file is replayable transition history.

alter table public.profiles
  add column username text;

update public.profiles
set username = 'user-' || replace(id::text, '-', '')
where username is null;

alter table public.profiles
  alter column username set not null,
  add constraint profiles_username_format check (
    char_length(username) between 2 and 64
    and username ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  add constraint profiles_username_unique unique (username);

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

insert into private.repository_owner_namespaces (slug, user_id)
select profile.username, profile.id
from public.profiles as profile;

insert into private.repository_owner_namespaces (slug, organization_id)
select organization.slug, organization.id
from public.organizations as organization;

alter table public.repositories
  add column owner_user_id uuid references auth.users (id) on delete restrict,
  add column owner_organization_id uuid references public.organizations (id) on delete restrict;

update public.repositories
set owner_organization_id = organization_id;

alter table public.repositories
  alter column organization_id drop not null,
  add constraint repositories_exactly_one_owner check (
    (owner_user_id is not null and owner_organization_id is null)
    or (owner_user_id is null and owner_organization_id is not null)
  ),
  add constraint repositories_legacy_organization_projection check (
    organization_id is not distinct from owner_organization_id
  );

alter table public.repositories
  drop constraint repositories_organization_slug_unique;

drop index public.repositories_organization_id_idx;

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

comment on column public.repositories.organization_id is
  'Deprecated compatibility projection constrained to equal owner_organization_id; NULL for User-owned Repositories and never the canonical ownership source.';

-- Route RPCs expose repository_visibility in their return type, so drop them before replacing
-- the enum with the corrected private/public target vocabulary.
drop function public.get_accessible_repository_route_by_id(uuid);
drop function public.get_accessible_repository_route_by_key(text, text);
drop function public.list_accessible_repository_routes();
drop function private.get_accessible_repository_route_by_id(uuid);
drop function private.get_accessible_repository_route_by_key(text, text);
drop function private.list_accessible_repository_routes();

-- Remove the old enum literal from executable state. Existing organization-visible rows, if any,
-- are conservatively migrated to private because ordinary Organization Membership never granted a
-- Repository read baseline.
create or replace function private.can_view_repository(target_repository_id uuid)
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
      and repository.visibility::text = 'public'
  ) or private.has_repository_capability(target_repository_id, 'repository.view');
$$;

alter table public.repositories
  alter column visibility drop default;

alter type public.repository_visibility rename to repository_visibility_old;
create type public.repository_visibility as enum ('private', 'public');

alter table public.repositories
  alter column visibility type public.repository_visibility
  using (
    case
      when visibility::text = 'organization' then 'private'
      else visibility::text
    end
  )::public.repository_visibility;

alter table public.repositories
  alter column visibility set default 'private'::public.repository_visibility;

drop type public.repository_visibility_old;

create or replace function private.current_repository_role(target_repository_id uuid)
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

create or replace function private.create_profile_for_auth_user()
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

create or replace function private.add_organization_owner()
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

create trigger profile_username_owner_namespace
before update of username on public.profiles
for each row execute function private.sync_user_owner_namespace();

create trigger organization_owner_namespace_update
before update of slug on public.organizations
for each row execute function private.sync_organization_owner_namespace();

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

revoke all on function private.get_accessible_repository_route_by_id(uuid)
  from public, anon, authenticated;
revoke all on function private.get_accessible_repository_route_by_key(text, text)
  from public, anon, authenticated;
revoke all on function private.list_accessible_repository_routes()
  from public, anon, authenticated;

grant execute on function private.get_accessible_repository_route_by_id(uuid) to anon, authenticated;
grant execute on function private.get_accessible_repository_route_by_key(text, text) to anon, authenticated;
grant execute on function private.list_accessible_repository_routes() to authenticated;

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

revoke all on function public.get_accessible_repository_route_by_id(uuid)
  from public, anon, authenticated;
revoke all on function public.get_accessible_repository_route_by_key(text, text)
  from public, anon, authenticated;
revoke all on function public.list_accessible_repository_routes()
  from public, anon, authenticated;

grant execute on function public.get_accessible_repository_route_by_id(uuid) to anon, authenticated;
grant execute on function public.get_accessible_repository_route_by_key(text, text) to anon, authenticated;
grant execute on function public.list_accessible_repository_routes() to authenticated;

create policy repositories_insert_personal_owner
on public.repositories
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and owner_user_id = (select auth.uid())
  and owner_organization_id is null
  and organization_id is null
);

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
grant execute on function private.get_accessible_repository_route_by_id(uuid) to anon, authenticated;
grant execute on function private.get_accessible_repository_route_by_key(text, text) to anon, authenticated;
grant execute on function private.list_accessible_repository_routes() to authenticated;
