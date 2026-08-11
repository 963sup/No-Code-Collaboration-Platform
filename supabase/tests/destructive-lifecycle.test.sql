begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(8);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-000000000201',
  'lifecycle-owner@example.com',
  '{}'::jsonb
);

insert into public.organizations (id, slug, name, created_by)
values (
  '10000000-0000-0000-0000-000000000201',
  'lifecycle-organization',
  'Lifecycle Organization',
  '00000000-0000-0000-0000-000000000201'
);

insert into public.repositories (id, organization_id, slug, name, created_by)
values (
  '20000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000201',
  'lifecycle-repository',
  'Lifecycle Repository',
  '00000000-0000-0000-0000-000000000201'
);

insert into public.resources (id, repository_id, kind, title, created_by)
values (
  '30000000-0000-0000-0000-000000000201',
  '20000000-0000-0000-0000-000000000201',
  'page',
  'Lifecycle Page',
  '00000000-0000-0000-0000-000000000201'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);

with changed as (
  update public.organizations
  set name = 'Lifecycle Organization Updated'
  where id = '10000000-0000-0000-0000-000000000201'
  returning 1
)
select is(
  (select count(*)::integer from changed),
  1,
  'organization owner retains non-destructive administration'
);

with changed as (
  update public.repositories
  set description = 'Non-destructive administration remains available.'
  where id = '20000000-0000-0000-0000-000000000201'
  returning 1
)
select is(
  (select count(*)::integer from changed),
  1,
  'repository administrator retains non-destructive administration'
);

select throws_ok(
  $$
    delete from public.repositories
    where id = '20000000-0000-0000-0000-000000000201'
  $$,
  '42501',
  'permission denied for table repositories',
  'repository hard deletion is unavailable to authenticated actors'
);

select is(
  (
    select count(*)::integer
    from public.repositories
    where id = '20000000-0000-0000-0000-000000000201'
  ),
  1,
  'denied repository deletion preserves the collaboration container'
);

select is(
  (
    select count(*)::integer
    from public.resources
    where id = '30000000-0000-0000-0000-000000000201'
  ),
  1,
  'denied repository deletion preserves contained resources'
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where repository_id = '20000000-0000-0000-0000-000000000201'
  ),
  2,
  'denied repository deletion preserves historical facts'
);

select throws_ok(
  $$
    delete from public.organizations
    where id = '10000000-0000-0000-0000-000000000201'
  $$,
  '42501',
  'permission denied for table organizations',
  'organization hard deletion is unavailable to authenticated actors'
);

select is(
  (
    select count(*)::integer
    from public.organizations
    where id = '10000000-0000-0000-0000-000000000201'
  ),
  1,
  'denied organization deletion preserves the ownership boundary'
);

select * from finish();
rollback;
