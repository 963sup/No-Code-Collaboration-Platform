begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(4);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000701', 'personal-owner@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000702', 'personal-collaborator@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000703', 'personal-invalid-target@example.com', '{}'::jsonb);

insert into public.repositories (id, owner_user_id, slug, name, visibility, created_by)
values (
  '20000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000701',
  'personal-collaboration',
  'Personal Collaboration',
  'private',
  '00000000-0000-0000-0000-000000000701'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000701', true);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000701',
    '00000000-0000-0000-0000-000000000702',
    null,
    'read'
  ),
  'forbidden',
  'personal Repository rejects a Read Direct Grant'
);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000701',
    '00000000-0000-0000-0000-000000000702',
    null,
    'write'
  ),
  'applied',
  'personal Repository accepts a Write collaborator'
);

select is(
  (
    select role
    from public.repository_user_grants
    where repository_id = '20000000-0000-0000-0000-000000000701'
      and user_id = '00000000-0000-0000-0000-000000000702'
  ),
  'write'::public.repository_role,
  'personal Repository persists collaborator authority as Write'
);

reset role;

select throws_ok(
  $$
    insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
    values (
      '20000000-0000-0000-0000-000000000701',
      '00000000-0000-0000-0000-000000000703',
      'maintain',
      '00000000-0000-0000-0000-000000000701'
    )
  $$,
  '23514',
  'Repository owner kind does not allow this Direct Grant role',
  'personal Repository owner-kind invariant rejects privileged raw role insertion'
);

select * from finish();
rollback;
