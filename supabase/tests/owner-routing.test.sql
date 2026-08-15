begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(6);

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_proc as procedure
    join pg_catalog.pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'get_owner_profile_by_slug'
  ),
  1,
  'Owner profile resolution is exposed through one allowlisted public RPC'
);

select is(
  (
    select count(*)::integer
    from pg_catalog.pg_proc as procedure
    join pg_catalog.pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'list_owner_repository_routes'
  ),
  1,
  'Owner Repository projection is exposed through one allowlisted public RPC'
);

select is(
  (select owner_kind from public.get_owner_profile_by_slug('sup-demo')),
  'user',
  'Shared Owner namespace resolves a User without a User-specific URL prefix'
);

select is(
  (select owner_kind from public.get_owner_profile_by_slug('demo-organization')),
  'organization',
  'Shared Owner namespace resolves an Organization without an Organization-specific profile URL prefix'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-00000000d001',
  true
);

select is(
  (select count(*)::integer from public.list_owner_repository_routes('demo-organization')),
  1,
  'Owner Repository projection includes private Repositories only when the current Actor may view them'
);

select is(
  (select owner_slug from public.list_owner_repository_routes('demo-organization') limit 1),
  'demo-organization',
  'Owner Repository projection preserves the stable shared Owner slug'
);

select * from finish();
rollback;
