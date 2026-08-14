begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(26);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000001', 'owner@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'viewer@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'outsider@example.com', '{}'::jsonb);

insert into public.organizations (id, slug, name, created_by)
values (
  '10000000-0000-0000-0000-000000000001',
  'example-organization',
  'Example Organization',
  '00000000-0000-0000-0000-000000000001'
);

insert into public.repositories (
  id,
  owner_organization_id,
  slug,
  name,
  created_by
)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'example-repository',
  'Example Repository',
  '00000000-0000-0000-0000-000000000001'
);

insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'viewer',
  '00000000-0000-0000-0000-000000000001'
);

insert into public.resources (id, repository_id, kind, title, created_by)
values (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'page',
  'Example Page',
  '00000000-0000-0000-0000-000000000001'
);

select is(
  (
    select count(*)::integer
    from public.organization_memberships
    where organization_id = '10000000-0000-0000-0000-000000000001'
      and role = 'owner'
  ),
  1,
  'organization creation establishes exactly one owner relationship'
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where repository_id = '20000000-0000-0000-0000-000000000001'
  ),
  2,
  'repository and resource creation emit historical facts'
);

select is(
  (
    select procedure.prosecdef
    from pg_catalog.pg_proc as procedure
    join pg_catalog.pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'get_accessible_repository_route_by_id'
  ),
  false,
  'public route-by-id RPC is an invoker facade, not an exposed privilege boundary'
);

select is(
  (
    select procedure.prosecdef
    from pg_catalog.pg_proc as procedure
    join pg_catalog.pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'get_accessible_repository_route_by_key'
  ),
  false,
  'public route-by-key RPC is an invoker facade, not an exposed privilege boundary'
);

select is(
  (
    select procedure.prosecdef
    from pg_catalog.pg_proc as procedure
    join pg_catalog.pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'list_accessible_repository_routes'
  ),
  false,
  'public route-list RPC is an invoker facade, not an exposed privilege boundary'
);

select is(
  (
    select procedure.prosecdef
    from pg_catalog.pg_proc as procedure
    join pg_catalog.pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'private'
      and procedure.proname = 'get_accessible_repository_route_by_id'
  ),
  true,
  'route-by-id privilege implementation is isolated in the private schema'
);

select is(
  (
    select procedure.prosecdef
    from pg_catalog.pg_proc as procedure
    join pg_catalog.pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'private'
      and procedure.proname = 'get_accessible_repository_route_by_key'
  ),
  true,
  'route-by-key privilege implementation is isolated in the private schema'
);

select is(
  (
    select procedure.prosecdef
    from pg_catalog.pg_proc as procedure
    join pg_catalog.pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'private'
      and procedure.proname = 'list_accessible_repository_routes'
  ),
  true,
  'route-list privilege implementation is isolated in the private schema'
);

select is(
  has_function_privilege(
    'anon',
    'private.get_accessible_repository_route_by_id(uuid)',
    'EXECUTE'
  ),
  true,
  'anonymous public-route facade may delegate to the private access-aware route resolver'
);

select is(
  has_function_privilege(
    'authenticated',
    'private.get_accessible_repository_route_by_id(uuid)',
    'EXECUTE'
  ),
  true,
  'authenticated invoker facade can delegate to the constrained private implementation'
);

select is_empty(
  $$
    select grantee, table_name, privilege_type
    from information_schema.table_privileges
    where table_schema = 'public'
      and grantee in ('anon', 'authenticated')
      and table_name in (
        'activity_events',
        'organization_memberships',
        'organizations',
        'profiles',
        'repositories',
        'repository_user_grants',
        'resources'
      )
      and privilege_type in ('MAINTAIN', 'REFERENCES', 'TRIGGER', 'TRUNCATE')
  $$,
  'Data API roles cannot bypass row authorization through table maintenance privileges'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);

select is(
  (select count(*)::integer from public.repositories),
  1,
  'viewer can read a directly granted private repository'
);

select is(
  (select count(*)::integer from public.resources),
  1,
  'viewer can read resources in the granted repository'
);

select is(
  (select count(*)::integer from public.organizations),
  0,
  'outside collaborator does not gain broad Organization row visibility'
);

select is(
  (
    select id
    from public.get_accessible_repository_route_by_key(
      'example-organization',
      'example-repository'
    )
  ),
  '20000000-0000-0000-0000-000000000001'::uuid,
  'outside collaborator resolves the Repository namespace through access-aware route projection'
);

select is(
  (
    select owner_slug
    from public.get_accessible_repository_route_by_id(
      '20000000-0000-0000-0000-000000000001'
    )
  ),
  'example-organization',
  'stable Repository identity resolves to its canonical Owner namespace'
);

select is(
  (select count(*)::integer from public.list_accessible_repository_routes()),
  1,
  'route listing exposes only Repository namespaces visible to the current actor'
);

with changed as (
  update public.resources
  set title = 'Viewer mutation'
  where id = '30000000-0000-0000-0000-000000000001'
  returning 1
)
select is((select count(*)::integer from changed), 0, 'viewer cannot update resources');

select is(
  (select private.has_repository_capability(
    '20000000-0000-0000-0000-000000000001',
    'resource.update'
  )),
  false,
  'viewer capability projection remains read-only'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);

select is(
  (select count(*)::integer from public.repositories),
  0,
  'unrelated authenticated actor cannot read a private repository'
);

select is(
  (select count(*)::integer from public.resources),
  0,
  'unrelated authenticated actor cannot read private resources'
);

select is(
  (
    select count(*)::integer
    from public.get_accessible_repository_route_by_key(
      'example-organization',
      'example-repository'
    )
  ),
  0,
  'semantic route resolver does not reveal a private Repository to an unrelated actor'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

select is(
  (
    select count(*)::integer
    from public.update_page(
      '20000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000001',
      'Owner mutation',
      '',
      (
        select updated_at
        from public.resources
        where id = '30000000-0000-0000-0000-000000000001'
      )
    )
  ),
  1,
  'Organization owner receives Repository admin capability through the accepted Page command'
);

update public.repositories
set visibility = 'public'
where id = '20000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::integer from public.activity_events),
  3,
  'accepted Resource updates emit one update fact without fabricating creation facts'
);

reset role;
reset request.jwt.claim.sub;
set local role anon;

select is(
  (select count(*)::integer from public.repositories),
  1,
  'anonymous actor can read a public repository'
);

select is(
  (select count(*)::integer from public.resources),
  1,
  'anonymous actor can read resources in a public repository'
);

select * from finish();
rollback;
