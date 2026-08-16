begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(18);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '00000000-0000-0000-0000-000000000201',
    'grant-owner@example.com',
    '{"username":"grant-owner"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'grant-collaborator@example.com',
    '{"username":"grant-collaborator"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'grant-maintain@example.com',
    '{"username":"grant-maintain"}'::jsonb
  );

insert into public.organizations (id, slug, name, created_by)
values (
  '10000000-0000-0000-0000-000000000201',
  'grant-organization',
  'Grant Organization',
  '00000000-0000-0000-0000-000000000201'
);

insert into public.repositories (id, owner_organization_id, slug, name, created_by)
values (
  '20000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000201',
  'grant-repository',
  'Grant Repository',
  '00000000-0000-0000-0000-000000000201'
);

insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
values (
  '20000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000203',
  'maintain',
  '00000000-0000-0000-0000-000000000201'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);

select is(
  (
    select user_id
    from public.find_repository_grant_target_by_username(
      '20000000-0000-0000-0000-000000000201',
      'grant-collaborator'
    )
  ),
  '00000000-0000-0000-0000-000000000202'::uuid,
  'Repository Admin resolves an exact User username without exposing email'
);

select is(
  (select count(*)::integer from public.list_repository_direct_grants('20000000-0000-0000-0000-000000000201')),
  1,
  'Admin management projection initially contains the seeded Maintain Grant'
);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000202',
    null,
    'write'
  ),
  'applied',
  'Repository Admin creates a Write Direct Grant'
);

select is(
  (
    select role::text
    from public.repository_user_grants
    where repository_id = '20000000-0000-0000-0000-000000000201'
      and user_id = '00000000-0000-0000-0000-000000000202'
  ),
  'write',
  'accepted command persists the Write Grant'
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where repository_id = '20000000-0000-0000-0000-000000000201'
      and event_type = 'repository_grant.created'
      and subject_id = '00000000-0000-0000-0000-000000000202'
  ),
  1,
  'Grant creation records one same-transaction Activity fact'
);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000202',
    'read',
    'admin'
  ),
  'state-changed',
  'stale expected Role fails the persistence compare-and-swap'
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where repository_id = '20000000-0000-0000-0000-000000000201'
      and event_type = 'repository_grant.role_changed'
      and subject_id = '00000000-0000-0000-0000-000000000202'
  ),
  0,
  'stale Grant command records no false role-change Evidence'
);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000201',
    null,
    'admin'
  ),
  'forbidden',
  'Actor cannot manufacture a Direct Grant to itself'
);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000202',
    'write',
    'read'
  ),
  'applied',
  'Repository Admin changes Write to Read'
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where repository_id = '20000000-0000-0000-0000-000000000201'
      and event_type = 'repository_grant.role_changed'
      and subject_id = '00000000-0000-0000-0000-000000000202'
  ),
  1,
  'actual Role change records exactly one Activity fact'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000202', true);

select is(
  private.has_repository_capability(
    '20000000-0000-0000-0000-000000000201',
    'repository.view'
  ),
  true,
  'Read Grant provides Repository read authority'
);

select is(
  private.has_repository_capability(
    '20000000-0000-0000-0000-000000000201',
    'page.update'
  ),
  false,
  'Read Grant does not provide Page write authority'
);

select throws_ok(
  $$ select * from public.list_repository_direct_grants('20000000-0000-0000-0000-000000000201') $$,
  '42501',
  'Repository Grant management is unavailable',
  'Read cannot call the Direct Grant management projection'
);

select is(
  (
    select count(*)::integer
    from public.repository_user_grants
    where repository_id = '20000000-0000-0000-0000-000000000201'
  ),
  0,
  'Read cannot enumerate raw Direct Grant rows through RLS'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000202',
    'read',
    null
  ),
  'applied',
  'Repository Admin revokes the Read Grant'
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where repository_id = '20000000-0000-0000-0000-000000000201'
      and event_type = 'repository_grant.revoked'
      and subject_id = '00000000-0000-0000-0000-000000000202'
  ),
  1,
  'Grant revocation records one Activity fact'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000202', true);

select is(
  private.can_view_repository('20000000-0000-0000-0000-000000000201'),
  false,
  'revocation immediately removes private Repository read authority'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000203', true);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000202',
    null,
    'read'
  ),
  'forbidden',
  'Maintain cannot manage Direct Repository Grants'
);

select * from finish();
rollback;
