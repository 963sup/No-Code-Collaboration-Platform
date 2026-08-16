begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(19);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000101', 'owner-one@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000102', 'owner-two@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000103', 'organization-admin@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000104', 'repository-manager@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000105', 'repository-viewer@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000106', 'ordinary-member@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000107', 'contributor-target@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000108', 'viewer-target@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000109', 'admin-target@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000110', 'forged-target@example.com', '{}'::jsonb);

insert into public.organizations (id, slug, name, created_by)
values
  (
    '10000000-0000-0000-0000-000000000101',
    'delegation-organization',
    'Delegation Organization',
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    '10000000-0000-0000-0000-000000000102',
    'single-owner-organization',
    'Single Owner Organization',
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    '10000000-0000-0000-0000-000000000103',
    'cascade-mechanics-organization',
    'Cascade Mechanics Organization',
    '00000000-0000-0000-0000-000000000101'
  );

insert into public.organization_memberships (organization_id, user_id, role)
values
  (
    '10000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102',
    'owner'
  ),
  (
    '10000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000103',
    'admin'
  ),
  (
    '10000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000104',
    'member'
  ),
  (
    '10000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000105',
    'member'
  );

insert into public.repositories (id, owner_organization_id, slug, name, created_by)
values (
  '20000000-0000-0000-0000-000000000101',
  '10000000-0000-0000-0000-000000000101',
  'delegation-repository',
  'Delegation Repository',
  '00000000-0000-0000-0000-000000000101'
);

insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
values
  (
    '20000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000104',
    'maintain',
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    '20000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000105',
    'read',
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    '20000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102',
    'admin',
    '00000000-0000-0000-0000-000000000101'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);

select throws_ok(
  $$
    insert into public.organization_memberships (organization_id, user_id, role)
    values (
      '10000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000109',
      'owner'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "organization_memberships"',
  'organization admin cannot create an owner relationship'
);

select throws_ok(
  $$
    update public.organization_memberships
    set role = 'owner'
    where organization_id = '10000000-0000-0000-0000-000000000101'
      and user_id = '00000000-0000-0000-0000-000000000103'
  $$,
  '42501',
  'new row violates row-level security policy for table "organization_memberships"',
  'organization admin cannot promote itself to owner'
);

with changed as (
  update public.organization_memberships
  set role = 'admin'
  where organization_id = '10000000-0000-0000-0000-000000000101'
    and user_id = '00000000-0000-0000-0000-000000000101'
  returning 1
)
select is((select count(*)::integer from changed), 0, 'organization admin cannot demote an existing owner');

with changed as (
  delete from public.organization_memberships
  where organization_id = '10000000-0000-0000-0000-000000000101'
    and user_id = '00000000-0000-0000-0000-000000000101'
  returning 1
)
select is((select count(*)::integer from changed), 0, 'organization admin cannot delete an owner relationship');

select throws_ok(
  $$ delete from public.organizations where id = '10000000-0000-0000-0000-000000000101' $$,
  '42501',
  'permission denied for table organizations',
  'organization admin cannot invoke an unaccepted destructive lifecycle'
);

select lives_ok(
  $$
    insert into public.organization_memberships (organization_id, user_id, role)
    values (
      '10000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000106',
      'admin'
    )
  $$,
  'organization admin can delegate administrator authority'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);

with changed as (
  update public.organization_memberships
  set role = 'owner'
  where organization_id = '10000000-0000-0000-0000-000000000101'
    and user_id = '00000000-0000-0000-0000-000000000103'
  returning 1
)
select is((select count(*)::integer from changed), 1, 'organization owner can delegate owner authority');

with changed as (
  update public.organization_memberships
  set role = 'admin'
  where organization_id = '10000000-0000-0000-0000-000000000101'
    and user_id = '00000000-0000-0000-0000-000000000102'
  returning 1
)
select is((select count(*)::integer from changed), 1, 'organization owner can demote another owner when ownership remains');

select throws_ok(
  $$
    update public.organization_memberships
    set role = 'admin'
    where organization_id = '10000000-0000-0000-0000-000000000102'
      and user_id = '00000000-0000-0000-0000-000000000101'
  $$,
  '23514',
  'organization must retain at least one owner',
  'last organization owner cannot be demoted'
);

select throws_ok(
  $$
    delete from public.organization_memberships
    where organization_id = '10000000-0000-0000-0000-000000000102'
      and user_id = '00000000-0000-0000-0000-000000000101'
  $$,
  '23514',
  'organization must retain at least one owner',
  'last organization owner cannot be deleted'
);

reset role;

with changed as (
  delete from public.organizations
  where id = '10000000-0000-0000-0000-000000000103'
  returning 1
)
select is((select count(*)::integer from changed), 1, 'owner-continuity trigger permits privileged parent cascade mechanics');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000104', true);

select throws_ok(
  $$
    insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
    values (
      '20000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000109',
      'admin',
      '00000000-0000-0000-0000-000000000104'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "repository_user_grants"',
  'raw Data API cannot bypass the Repository Grant command boundary'
);

with changed as (
  update public.repository_user_grants
  set role = 'admin'
  where repository_id = '20000000-0000-0000-0000-000000000101'
    and user_id = '00000000-0000-0000-0000-000000000104'
  returning 1
)
select is((select count(*)::integer from changed), 0, 'repository manager cannot promote its own manager grant');

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000109',
    null,
    'admin'
  ),
  'forbidden',
  'repository manager cannot create an admin grant through the accepted command'
);

with changed as (
  delete from public.repository_user_grants
  where repository_id = '20000000-0000-0000-0000-000000000101'
    and user_id = '00000000-0000-0000-0000-000000000102'
  returning 1
)
select is((select count(*)::integer from changed), 0, 'repository manager cannot delete an admin grant');

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000107',
    null,
    'write'
  ),
  'applied',
  'repository manager can create a contributor grant through the accepted command'
);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000108',
    null,
    'read'
  ),
  'applied',
  'repository manager can create a viewer grant through the accepted command'
);

select throws_ok(
  $$
    insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
    values (
      '20000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000110',
      'read',
      '00000000-0000-0000-0000-000000000101'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "repository_user_grants"',
  'raw Repository Grant mutation cannot forge attribution or skip Activity Evidence'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000109',
    null,
    'admin'
  ),
  'applied',
  'repository admin can create an admin grant through the accepted command'
);

select * from finish();
rollback;
