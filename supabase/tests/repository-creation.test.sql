begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(10);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '00000000-0000-0000-0000-00000000c001',
    'personal-owner@example.com',
    '{"username":"personal-owner"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-00000000c002',
    'organization-owner@example.com',
    '{"username":"organization-owner-user"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-00000000c003',
    'organization-admin@example.com',
    '{"username":"organization-admin-user"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-00000000c004',
    'organization-member@example.com',
    '{"username":"organization-member-user"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-00000000c005',
    'outsider@example.com',
    '{"username":"repository-outsider"}'::jsonb
  );

insert into public.organizations (id, slug, name, created_by)
values (
  '10000000-0000-0000-0000-00000000c001',
  'creation-org',
  'Creation Organization',
  '00000000-0000-0000-0000-00000000c002'
);

insert into public.organization_memberships (organization_id, user_id, role)
values
  (
    '10000000-0000-0000-0000-00000000c001',
    '00000000-0000-0000-0000-00000000c003',
    'admin'
  ),
  (
    '10000000-0000-0000-0000-00000000c001',
    '00000000-0000-0000-0000-00000000c004',
    'member'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c001', true);

select lives_ok(
  $$
    insert into public.repositories (
      id,
      owner_user_id,
      slug,
      name,
      created_by
    )
    values (
      '20000000-0000-0000-0000-00000000c001',
      '00000000-0000-0000-0000-00000000c001',
      'personal-repository',
      'Personal Repository',
      '00000000-0000-0000-0000-00000000c001'
    )
  $$,
  'a User can create a Repository owned by itself'
);

select is(
  (
    select owner_user_id
    from public.repositories
    where id = '20000000-0000-0000-0000-00000000c001'
  ),
  '00000000-0000-0000-0000-00000000c001'::uuid,
  'personal Repository persists the authenticated User as its typed Owner'
);

select is(
  (
    select count(*)::integer
    from public.repository_user_grants
    where repository_id = '20000000-0000-0000-0000-00000000c001'
  ),
  0,
  'personal ownership does not fabricate a direct Repository Grant'
);

select throws_ok(
  $$
    insert into public.repositories (
      owner_user_id,
      slug,
      name,
      created_by
    )
    values (
      '00000000-0000-0000-0000-00000000c005',
      'forged-personal-owner',
      'Forged Personal Owner',
      '00000000-0000-0000-0000-00000000c001'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "repositories"',
  'a User cannot create a personal Repository owned by another User'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c002', true);

select lives_ok(
  $$
    insert into public.repositories (
      id,
      owner_organization_id,
      slug,
      name,
      created_by
    )
    values (
      '20000000-0000-0000-0000-00000000c002',
      '10000000-0000-0000-0000-00000000c001',
      'owner-created-repository',
      'Owner Created Repository',
      '00000000-0000-0000-0000-00000000c002'
    )
  $$,
  'Organization owner can create an Organization-owned Repository'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c003', true);

select lives_ok(
  $$
    insert into public.repositories (
      id,
      owner_organization_id,
      slug,
      name,
      created_by
    )
    values (
      '20000000-0000-0000-0000-00000000c003',
      '10000000-0000-0000-0000-00000000c001',
      'admin-created-repository',
      'Admin Created Repository',
      '00000000-0000-0000-0000-00000000c003'
    )
  $$,
  'Organization admin can create an Organization-owned Repository'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c004', true);

select throws_ok(
  $$
    insert into public.repositories (
      owner_organization_id,
      slug,
      name,
      created_by
    )
    values (
      '10000000-0000-0000-0000-00000000c001',
      'member-created-repository',
      'Member Created Repository',
      '00000000-0000-0000-0000-00000000c004'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "repositories"',
  'ordinary Organization member cannot create an Organization-owned Repository'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c005', true);

select throws_ok(
  $$
    insert into public.repositories (
      owner_organization_id,
      slug,
      name,
      created_by
    )
    values (
      '10000000-0000-0000-0000-00000000c001',
      'outsider-created-repository',
      'Outsider Created Repository',
      '00000000-0000-0000-0000-00000000c005'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "repositories"',
  'unrelated actor cannot create an Organization-owned Repository'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c003', true);

select throws_ok(
  $$
    insert into public.repositories (
      owner_organization_id,
      slug,
      name,
      created_by
    )
    values (
      '10000000-0000-0000-0000-00000000c001',
      'forged-creator',
      'Forged Creator',
      '00000000-0000-0000-0000-00000000c002'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "repositories"',
  'Organization admin cannot forge Repository creator attribution'
);

select is(
  (
    select count(*)::integer
    from public.repositories
    where owner_organization_id = '10000000-0000-0000-0000-00000000c001'
  ),
  2,
  'only the accepted Organization owner/admin creation paths persisted Repositories'
);

select * from finish();
rollback;
