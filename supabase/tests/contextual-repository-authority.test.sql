begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(9);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000801', 'context-owner@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000802', 'context-read-collaborator@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000803', 'context-public-participant@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000804', 'context-other-participant@example.com', '{}'::jsonb);

insert into public.organizations (id, slug, name, created_by)
values (
  '10000000-0000-0000-0000-000000000801',
  'context-organization',
  'Context Organization',
  '00000000-0000-0000-0000-000000000801'
);

insert into public.repositories (
  id,
  owner_organization_id,
  slug,
  name,
  visibility,
  created_by
)
values
  (
    '20000000-0000-0000-0000-000000000801',
    '10000000-0000-0000-0000-000000000801',
    'public-context',
    'Public Context',
    'public',
    '00000000-0000-0000-0000-000000000801'
  ),
  (
    '20000000-0000-0000-0000-000000000802',
    '10000000-0000-0000-0000-000000000801',
    'private-context',
    'Private Context',
    'private',
    '00000000-0000-0000-0000-000000000801'
  );

insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
values
  (
    '20000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000802',
    'read',
    '00000000-0000-0000-0000-000000000801'
  ),
  (
    '20000000-0000-0000-0000-000000000802',
    '00000000-0000-0000-0000-000000000802',
    'read',
    '00000000-0000-0000-0000-000000000801'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000803', true);

select results_eq(
  $$
    select issue_number
    from public.create_issue(
      '20000000-0000-0000-0000-000000000801',
      'Public authored Issue',
      'Created through public authenticated participation'
    )
  $$,
  $$ values (1::bigint) $$,
  'public authenticated Actor can create an Issue without a Direct Grant'
);

select ok(
  (select private.current_repository_role('20000000-0000-0000-0000-000000000801')) is null,
  'public participation does not fabricate a Repository Role'
);

select results_eq(
  $$
    select discussion_number
    from public.create_discussion(
      '20000000-0000-0000-0000-000000000801',
      'general',
      'Public Discussion',
      'Created without a Direct Grant'
    )
  $$,
  $$ values (1::bigint) $$,
  'public authenticated Actor can create an ordinary Discussion without a Direct Grant'
);

select throws_ok(
  $$
    select *
    from public.create_page(
      '20000000-0000-0000-0000-000000000801',
      'No public anonymous-style write'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "resources"',
  'public authenticated Actor without collaborator Role cannot create a Page'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000802', true);

select is(
  (
    select count(*)::integer
    from public.create_page(
      '20000000-0000-0000-0000-000000000801',
      'Public Wiki collaborator Page'
    )
  ),
  1,
  'public Read collaborator can create a Page through Wiki collaborator authority'
);

select throws_ok(
  $$
    select *
    from public.create_page(
      '20000000-0000-0000-0000-000000000802',
      'Private Read must not write'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "resources"',
  'private Read collaborator cannot create a Page'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000803', true);

select is(
  (
    select count(*)::integer
    from public.edit_issue(
      '20000000-0000-0000-0000-000000000801',
      (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000801' and issue_number = 1),
      'Public authored Issue edited',
      'Author edit',
      1
    )
  ),
  1,
  'Issue author can edit their own Issue without Triage or Write'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000804', true);

select is(
  (
    select count(*)::integer
    from public.edit_issue(
      '20000000-0000-0000-0000-000000000801',
      (select id from public.issues where repository_id = '20000000-0000-0000-0000-000000000801' and issue_number = 1),
      'Unauthorized edit',
      'Not the author',
      2
    )
  ),
  0,
  'non-author public participant cannot edit another Actor Issue without issue.edit'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000803', true);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where repository_id = '20000000-0000-0000-0000-000000000801'
  ),
  0,
  'public participation does not expose raw Activity Evidence without a Repository Role'
);

select * from finish();
rollback;
