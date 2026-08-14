begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(10);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '00000000-0000-0000-0000-00000000e001',
    'organization-founder@example.com',
    '{"username":"organization-founder"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-00000000e002',
    'organization-outsider@example.com',
    '{"username":"organization-outsider"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-00000000e003',
    'claimed-namespace@example.com',
    '{"username":"claimed-namespace"}'::jsonb
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e001', true);

select lives_ok(
  $$
    insert into public.organizations (id, slug, name, created_by)
    values (
      '10000000-0000-0000-0000-00000000e001',
      'actor-created-organization',
      'Actor Created Organization',
      '00000000-0000-0000-0000-00000000e001'
    )
  $$,
  'an authenticated Actor can create an Organization attributed to itself'
);

select is(
  (
    select role
    from public.organization_memberships
    where organization_id = '10000000-0000-0000-0000-00000000e001'
      and user_id = '00000000-0000-0000-0000-00000000e001'
  ),
  'owner'::public.organization_role,
  'Organization creation atomically establishes the Actor as founder owner'
);

select is(
  (
    select name
    from public.organizations
    where id = '10000000-0000-0000-0000-00000000e001'
  ),
  'Actor Created Organization',
  'the founder can read the Organization after the creation statement completes'
);

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
      '20000000-0000-0000-0000-00000000e001',
      '10000000-0000-0000-0000-00000000e001',
      'founder-repository',
      'Founder Repository',
      '00000000-0000-0000-0000-00000000e001'
    )
  $$,
  'the founder-owner relationship authorizes a later Organization-owned Repository creation'
);

select throws_ok(
  $$
    insert into public.organizations (id, slug, name, created_by)
    values (
      '10000000-0000-0000-0000-00000000e002',
      'forged-organization',
      'Forged Organization',
      '00000000-0000-0000-0000-00000000e002'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "organizations"',
  'an Actor cannot forge the Organization creator attribution'
);

select throws_ok(
  $$
    insert into public.organizations (id, slug, name, created_by)
    values (
      '10000000-0000-0000-0000-00000000e003',
      'claimed-namespace',
      'Colliding Organization',
      '00000000-0000-0000-0000-00000000e001'
    )
  $$,
  '23505',
  null,
  'Organization creation cannot claim an existing User Owner namespace'
);

select is(
  (
    select count(*)::integer
    from public.organizations
    where id = '10000000-0000-0000-0000-00000000e003'
  ),
  0,
  'a namespace-trigger failure rolls back the Organization row atomically'
);

select throws_ok(
  $$
    insert into public.organizations (id, slug, name, created_by)
    values (
      '10000000-0000-0000-0000-00000000e004',
      'organizations',
      'Reserved Route Organization',
      '00000000-0000-0000-0000-00000000e001'
    )
  $$,
  '23514',
  null,
  'Organization creation cannot occupy the reserved creation-route Owner segment'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e002', true);

select is(
  (
    select count(*)::integer
    from public.organizations
    where id = '10000000-0000-0000-0000-00000000e001'
  ),
  0,
  'an unrelated Actor cannot read the new Organization'
);

select throws_ok(
  $$
    insert into public.repositories (owner_organization_id, slug, name, created_by)
    values (
      '10000000-0000-0000-0000-00000000e001',
      'outsider-repository',
      'Outsider Repository',
      '00000000-0000-0000-0000-00000000e002'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "repositories"',
  'Organization creation grants no Repository authority to an unrelated Actor'
);

select * from finish();
rollback;
