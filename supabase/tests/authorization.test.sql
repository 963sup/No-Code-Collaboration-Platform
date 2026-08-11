begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(12);

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

insert into public.repositories (id, organization_id, slug, name, created_by)
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
  (select count(*)::integer from public.organization_memberships where role = 'owner'),
  1,
  'organization creation establishes exactly one owner relationship'
);

select is(
  (select count(*)::integer from public.activity_events),
  2,
  'repository and resource creation emit historical facts'
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

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

with changed as (
  update public.resources
  set title = 'Owner mutation'
  where id = '30000000-0000-0000-0000-000000000001'
  returning 1
)
select is((select count(*)::integer from changed), 1, 'organization owner receives repository admin capability');

update public.repositories
set visibility = 'public'
where id = '20000000-0000-0000-0000-000000000001';

select is(
  (select count(*)::integer from public.activity_events),
  2,
  'ordinary updates do not fabricate creation events'
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
