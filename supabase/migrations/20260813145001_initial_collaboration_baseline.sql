-- Initial collaboration baseline compiled from the ordered declarative schema.
-- supabase/schemas remains the canonical desired database state.

-- Source: supabase/schemas/10_identity.sql

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.profiles is
  'Application profile projection for an authenticated actor.';

-- Source: supabase/schemas/20_organization.sql

create type public.organization_role as enum ('member', 'admin', 'owner');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organizations_slug_format check (
    char_length(slug) between 2 and 64
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint organizations_name_length check (char_length(name) between 1 and 120),
  constraint organizations_slug_unique unique (slug)
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.organization_role not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (organization_id, user_id)
);

create index organization_memberships_user_id_idx
  on public.organization_memberships (user_id, organization_id);

comment on table public.organizations is
  'Ownership and administration boundary for collaboration repositories.';
comment on table public.organization_memberships is
  'Relationship between an actor and an organization; not an actor type.';

-- Source: supabase/schemas/30_repository.sql

create type public.repository_visibility as enum ('private', 'organization', 'public');

create table public.repositories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  visibility public.repository_visibility not null default 'private',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint repositories_slug_format check (
    char_length(slug) between 2 and 64
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint repositories_name_length check (char_length(name) between 1 and 160),
  constraint repositories_organization_slug_unique unique (organization_id, slug)
);

create index repositories_organization_id_idx
  on public.repositories (organization_id, id);

comment on table public.repositories is
  'No-code collaboration containers and the primary resource/authorization boundary.';

-- Source: supabase/schemas/40_access.sql

create type public.repository_role as enum ('viewer', 'contributor', 'manager', 'admin');

create table public.repository_user_grants (
  repository_id uuid not null references public.repositories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.repository_role not null,
  granted_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (repository_id, user_id)
);

create index repository_user_grants_user_id_idx
  on public.repository_user_grants (user_id, repository_id);

comment on table public.repository_user_grants is
  'Direct principal-to-repository grants. Collaborator is derived from this relationship.';

-- Source: supabase/schemas/50_resource.sql

create type public.resource_kind as enum ('page');

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references public.repositories (id) on delete cascade,
  kind public.resource_kind not null,
  title text not null,
  content jsonb not null default '{"body": ""}'::jsonb,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint resources_title_length check (
    char_length(title) between 1 and 240
    and title ~ '[^[:space:]]'
  ),
  constraint resources_page_content_shape check (
    kind <> 'page'
    or (
      jsonb_typeof(content) = 'object'
      and jsonb_typeof(content -> 'body') = 'string'
      and content = jsonb_build_object('body', content ->> 'body')
    )
  )
);

create index resources_repository_id_idx
  on public.resources (repository_id, created_at desc);

comment on table public.resources is
  'Repository-scoped work units. The shared envelope is relational; subtype content remains explicit.';

-- Source: supabase/schemas/60_activity.sql

create table public.activity_events (
  id bigint generated always as identity primary key,
  repository_id uuid not null references public.repositories (id) on delete cascade,
  actor_id uuid not null references auth.users (id),
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint activity_events_event_type_format check (
    event_type ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'
  )
);

create index activity_events_repository_created_at_idx
  on public.activity_events (repository_id, created_at desc, id desc);

comment on table public.activity_events is
  'Immutable historical facts from which activity, audit, notification, and analytics projections may derive.';

-- Source: supabase/schemas/70_resource_activity.sql

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

-- Source: supabase/schemas/90_private_functions.sql

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

create function private.touch_resource_updated_at()
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
before update of title, content on public.resources
for each row
when (old.title is distinct from new.title or old.content is distinct from new.content)
execute function private.touch_resource_updated_at();

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

-- Source: supabase/schemas/92_page_commands.sql

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

-- Source: supabase/schemas/95_repository_routing.sql

create function private.get_accessible_repository_route_by_id(target_repository_id uuid)
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

create function private.get_accessible_repository_route_by_key(
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

create function private.list_accessible_repository_routes()
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

revoke all on function private.get_accessible_repository_route_by_id(uuid)
  from public, anon, authenticated;
revoke all on function private.get_accessible_repository_route_by_key(text, text)
  from public, anon, authenticated;
revoke all on function private.list_accessible_repository_routes()
  from public, anon, authenticated;

grant execute on function private.get_accessible_repository_route_by_id(uuid) to authenticated;
grant execute on function private.get_accessible_repository_route_by_key(text, text) to authenticated;
grant execute on function private.list_accessible_repository_routes() to authenticated;

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
security invoker
set search_path = ''
as $$
  select *
  from private.get_accessible_repository_route_by_id(target_repository_id);
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
security invoker
set search_path = ''
as $$
  select *
  from private.get_accessible_repository_route_by_key(
    target_organization_slug,
    target_repository_slug
  );
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

grant execute on function public.get_accessible_repository_route_by_id(uuid) to authenticated;
grant execute on function public.get_accessible_repository_route_by_key(text, text) to authenticated;
grant execute on function public.list_accessible_repository_routes() to authenticated;

-- Source: supabase/schemas/99_rls.sql

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.repositories enable row level security;
alter table public.repository_user_grants enable row level security;
alter table public.resources enable row level security;
alter table public.activity_events enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_memberships from anon, authenticated;
revoke all on table public.repositories from anon, authenticated;
revoke all on table public.repository_user_grants from anon, authenticated;
revoke all on table public.resources from anon, authenticated;
revoke all on table public.activity_events from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url, updated_at) on table public.profiles to authenticated;

grant select, insert on table public.organizations to authenticated;
grant update (slug, name, updated_at) on table public.organizations to authenticated;

grant select, insert, delete on table public.organization_memberships to authenticated;
grant update (role) on table public.organization_memberships to authenticated;

grant select on table public.repositories to anon, authenticated;
grant insert on table public.repositories to authenticated;
grant update (slug, name, description, visibility, updated_at) on table public.repositories to authenticated;

grant select, insert, delete on table public.repository_user_grants to authenticated;
grant update (role) on table public.repository_user_grants to authenticated;

grant select on table public.resources to anon, authenticated;
grant insert on table public.resources to authenticated;
grant update (title, content) on table public.resources to authenticated;

grant select on table public.activity_events to authenticated;

-- Organization, Repository, and Resource hard deletion deliberately have no end-user DELETE grant
-- or RLS policy until an accepted lifecycle defines retention, restore, and historical continuity.
-- Resource INSERT/UPDATE table privileges support SECURITY INVOKER Page command RPCs. Raw Data API
-- mutations fail closed because the policies below require transaction-local command context set by
-- those RPCs in addition to the ordinary actor and Capability checks.

create policy profiles_select_self
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_self
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy organizations_select_member
on public.organizations
for select
to authenticated
using ((select private.is_organization_member(id)));

create policy organizations_insert_actor
on public.organizations
for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy organizations_update_admin
on public.organizations
for update
to authenticated
using ((select private.is_organization_admin(id)))
with check ((select private.is_organization_admin(id)));

create policy organization_memberships_select_member
on public.organization_memberships
for select
to authenticated
using ((select private.is_organization_member(organization_id)));

create policy organization_memberships_insert_delegated
on public.organization_memberships
for insert
to authenticated
with check (
  (select private.can_manage_organization_membership(organization_id, role))
);

create policy organization_memberships_update_delegated
on public.organization_memberships
for update
to authenticated
using (
  (select private.can_manage_organization_membership(organization_id, role))
)
with check (
  (select private.can_manage_organization_membership(organization_id, role))
);

create policy organization_memberships_delete_delegated
on public.organization_memberships
for delete
to authenticated
using (
  (select private.can_manage_organization_membership(organization_id, role))
);

create policy repositories_select_visible
on public.repositories
for select
to anon, authenticated
using ((select private.can_view_repository(id)));

create policy repositories_insert_admin
on public.repositories
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and (select private.is_organization_admin(organization_id))
);

create policy repositories_update_manager
on public.repositories
for update
to authenticated
using ((select private.has_repository_capability(id, 'repository.manage')))
with check ((select private.has_repository_capability(id, 'repository.manage')));

create policy repository_user_grants_select_viewer
on public.repository_user_grants
for select
to authenticated
using ((select private.has_repository_capability(repository_id, 'repository.view')));

create policy repository_user_grants_insert_delegated
on public.repository_user_grants
for insert
to authenticated
with check (
  (select auth.uid()) = granted_by
  and (select private.can_manage_repository_grant(repository_id, role))
);

create policy repository_user_grants_update_delegated
on public.repository_user_grants
for update
to authenticated
using (
  (select private.can_manage_repository_grant(repository_id, role))
)
with check (
  (select private.can_manage_repository_grant(repository_id, role))
);

create policy repository_user_grants_delete_delegated
on public.repository_user_grants
for delete
to authenticated
using (
  (select private.can_manage_repository_grant(repository_id, role))
);

create policy resources_select_visible
on public.resources
for select
to anon, authenticated
using ((select private.can_view_repository(repository_id)));

create policy resources_insert_contributor
on public.resources
for insert
to authenticated
with check (
  (select pg_catalog.current_setting('app.page_command', true)) = 'create'
  and (select auth.uid()) = created_by
  and (select private.has_repository_capability(repository_id, 'resource.create'))
);

create policy resources_update_contributor
on public.resources
for update
to authenticated
using (
  (select pg_catalog.current_setting('app.page_command', true)) = 'update'
  and (select private.has_repository_capability(repository_id, 'resource.update'))
)
with check (
  (select pg_catalog.current_setting('app.page_command', true)) = 'update'
  and (select private.has_repository_capability(repository_id, 'resource.update'))
);

create policy activity_events_select_viewer
on public.activity_events
for select
to authenticated
using ((select private.has_repository_capability(repository_id, 'repository.view')));
