begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(11);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000401', 'issue-owner@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000402', 'issue-viewer@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000403', 'issue-outsider@example.com', '{}'::jsonb);

insert into public.organizations (id, slug, name, created_by)
values (
  '10000000-0000-0000-0000-000000000401',
  'issue-organization',
  'Issue Organization',
  '00000000-0000-0000-0000-000000000401'
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
    '20000000-0000-0000-0000-000000000401',
    '10000000-0000-0000-0000-000000000401',
    'private-issues',
    'Private Issues',
    'private',
    '00000000-0000-0000-0000-000000000401'
  ),
  (
    '20000000-0000-0000-0000-000000000402',
    '10000000-0000-0000-0000-000000000401',
    'public-issues',
    'Public Issues',
    'public',
    '00000000-0000-0000-0000-000000000401'
  );

insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
values (
  '20000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000402',
  'viewer',
  '00000000-0000-0000-0000-000000000401'
);

insert into public.issues (
  repository_id,
  issue_number,
  title,
  body,
  created_by
)
values
  (
    '20000000-0000-0000-0000-000000000401',
    1,
    'Private issue',
    'Private collaboration content.',
    '00000000-0000-0000-0000-000000000401'
  ),
  (
    '20000000-0000-0000-0000-000000000402',
    1,
    'Public issue',
    'Public collaboration content.',
    '00000000-0000-0000-0000-000000000401'
  );

select is(
  has_table_privilege('authenticated', 'public.issues', 'INSERT'),
  false,
  'authenticated actors cannot bypass the unaccepted CreateIssue command'
);

select is(
  has_table_privilege('authenticated', 'public.issues', 'UPDATE'),
  false,
  'authenticated actors cannot bypass unaccepted Issue state transitions'
);

select is(
  has_table_privilege('authenticated', 'public.issues', 'DELETE'),
  false,
  'authenticated actors cannot invoke an undefined destructive Issue lifecycle'
);

select throws_ok(
  $$
    insert into public.issues (repository_id, issue_number, title, created_by)
    values (
      '20000000-0000-0000-0000-000000000401',
      0,
      'Invalid identity',
      '00000000-0000-0000-0000-000000000401'
    )
  $$,
  '23514',
  'new row for relation "issues" violates check constraint "issues_number_positive"',
  'Issue number must remain a positive Repository-scoped identity'
);

select throws_ok(
  $$
    insert into public.issues (repository_id, issue_number, title, created_by)
    values (
      '20000000-0000-0000-0000-000000000401',
      2,
      E' \t\n ',
      '00000000-0000-0000-0000-000000000401'
    )
  $$,
  '23514',
  'new row for relation "issues" violates check constraint "issues_title_length"',
  'Issue title rejects whitespace-only input independently of UI validation'
);

select throws_ok(
  $$
    insert into public.issues (
      repository_id,
      issue_number,
      title,
      status,
      created_by
    )
    values (
      '20000000-0000-0000-0000-000000000401',
      2,
      'Incomplete close state',
      'closed',
      '00000000-0000-0000-0000-000000000401'
    )
  $$,
  '23514',
  'new row for relation "issues" violates check constraint "issues_closed_state_consistent"',
  'closed Issue state requires actor attribution and time evidence'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000402', true);

select is(
  (select count(*)::integer from public.issues),
  2,
  'a Viewer sees Issues in the granted private Repository and the public Repository'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000403', true);

select is(
  (select count(*)::integer from public.issues),
  1,
  'an unrelated actor sees public Issue content but not private Repository Issues'
);

reset role;
reset request.jwt.claim.sub;
set local role anon;

select is(
  (select count(*)::integer from public.issues),
  1,
  'anonymous reads inherit the public Repository visibility boundary'
);

select is(
  (select issue_number from public.issues),
  1::bigint,
  'the public read projection preserves the Repository-local Issue number'
);

select is(
  (select title from public.issues),
  'Public issue',
  'the public projection returns only the authorized Issue'
);

select * from finish();
rollback;
