begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(22);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000301', 'page-owner@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000302', 'page-contributor@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000303', 'page-viewer@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000304', 'page-outsider@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000305', 'page-admin@example.com', '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000306', 'page-member@example.com', '{}'::jsonb);

insert into public.organizations (id, slug, name, created_by)
values (
  '10000000-0000-0000-0000-000000000301',
  'page-organization',
  'Page Organization',
  '00000000-0000-0000-0000-000000000301'
);

insert into public.organization_memberships (organization_id, user_id, role)
values
  (
    '10000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000305',
    'admin'
  ),
  (
    '10000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000306',
    'member'
  );

insert into public.repositories (id, organization_id, slug, name, created_by)
values (
  '20000000-0000-0000-0000-000000000301',
  '10000000-0000-0000-0000-000000000301',
  'page-repository',
  'Page Repository',
  '00000000-0000-0000-0000-000000000301'
);

insert into public.repository_user_grants (repository_id, user_id, role, granted_by)
values
  (
    '20000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000302',
    'contributor',
    '00000000-0000-0000-0000-000000000301'
  ),
  (
    '20000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000303',
    'viewer',
    '00000000-0000-0000-0000-000000000301'
  );

select is(
  has_column_privilege('authenticated', 'public.resources', 'updated_at', 'UPDATE'),
  false,
  'authenticated clients cannot assign Page concurrency evidence directly'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000305', true);

select is(
  (select private.current_repository_role('20000000-0000-0000-0000-000000000301')),
  'admin'::public.repository_role,
  'Organization admin derives Repository admin authority without a direct grant'
);

select is(
  (select private.has_repository_capability(
    '20000000-0000-0000-0000-000000000301',
    'resource.create'
  )),
  true,
  'Organization admin governance authority expands to Repository capabilities'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000306', true);

select ok(
  (select private.current_repository_role('20000000-0000-0000-0000-000000000301')) is null,
  'ordinary Organization membership does not create Repository authority'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000302', true);

select lives_ok(
  $$
    insert into public.resources (id, repository_id, kind, title, content, created_by)
    values (
      '30000000-0000-0000-0000-000000000301',
      '20000000-0000-0000-0000-000000000301',
      'page',
      'First Page',
      '{"body": "Initial collaboration content."}'::jsonb,
      '00000000-0000-0000-0000-000000000302'
    )
  $$,
  'a Contributor can create a typed Page Resource'
);

select is(
  (select content ->> 'body' from public.resources where id = '30000000-0000-0000-0000-000000000301'),
  'Initial collaboration content.',
  'Page content is persisted through the explicit body shape'
);

select is(
  (select count(*)::integer from public.activity_events where event_type = 'resource.created' and subject_id = '30000000-0000-0000-0000-000000000301'),
  1,
  'Page creation emits exactly one immutable creation fact'
);

select is(
  (select actor_id from public.activity_events where event_type = 'resource.created' and subject_id = '30000000-0000-0000-0000-000000000301'),
  '00000000-0000-0000-0000-000000000302'::uuid,
  'Page creation fact attributes the authenticated creator'
);

select lives_ok(
  $$
    update public.resources
    set title = 'Updated Page', content = '{"body": "Updated collaboration content."}'::jsonb
    where id = '30000000-0000-0000-0000-000000000301'
  $$,
  'a Contributor can update Page title and content'
);

select is(
  (select count(*)::integer from public.activity_events where event_type = 'resource.updated' and subject_id = '30000000-0000-0000-0000-000000000301'),
  1,
  'a meaningful Page update emits exactly one immutable update fact'
);

select is(
  (select actor_id from public.activity_events where event_type = 'resource.updated' and subject_id = '30000000-0000-0000-0000-000000000301'),
  '00000000-0000-0000-0000-000000000302'::uuid,
  'Page update fact attributes the current authenticated actor'
);

select is(
  (select (payload ->> 'title_changed')::boolean and (payload ->> 'content_changed')::boolean from public.activity_events where event_type = 'resource.updated' and subject_id = '30000000-0000-0000-0000-000000000301'),
  true,
  'Page update fact explains which state dimensions changed'
);

select set_config(
  'test.page_updated_at',
  (select updated_at::text from public.resources where id = '30000000-0000-0000-0000-000000000301'),
  true
);
select pg_sleep(0.02);

update public.resources
set title = title
where id = '30000000-0000-0000-0000-000000000301';

select is(
  (select updated_at::text from public.resources where id = '30000000-0000-0000-0000-000000000301'),
  current_setting('test.page_updated_at'),
  'a no-op Page update preserves concurrency evidence'
);

select is(
  (select count(*)::integer from public.activity_events where event_type = 'resource.updated' and subject_id = '30000000-0000-0000-0000-000000000301'),
  1,
  'a no-op Page update does not fabricate a historical fact'
);

select throws_ok(
  $$
    insert into public.resources (repository_id, kind, title, content, created_by)
    values (
      '20000000-0000-0000-0000-000000000301',
      'page',
      'Malformed Page',
      '{"body": 42}'::jsonb,
      '00000000-0000-0000-0000-000000000302'
    )
  $$,
  '23514',
  'new row for relation "resources" violates check constraint "resources_page_content_shape"',
  'database shape enforcement rejects malformed Page content'
);

select throws_ok(
  $$
    insert into public.resources (repository_id, kind, title, created_by)
    values (
      '20000000-0000-0000-0000-000000000301',
      'page',
      E' \t\n ',
      '00000000-0000-0000-0000-000000000302'
    )
  $$,
  '23514',
  'new row for relation "resources" violates check constraint "resources_title_length"',
  'database title enforcement rejects a whitespace-only Page title'
);

select throws_ok(
  $$
    insert into public.resources (repository_id, kind, title, created_by)
    values (
      '20000000-0000-0000-0000-000000000301',
      'page',
      'Forged Page',
      '00000000-0000-0000-0000-000000000301'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "resources"',
  'Page creator attribution cannot be forged'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000303', true);

select is((select count(*)::integer from public.resources), 1, 'a Viewer can read the Page through Repository authority');

with changed as (
  update public.resources
  set title = 'Viewer mutation'
  where id = '30000000-0000-0000-0000-000000000301'
  returning 1
)
select is((select count(*)::integer from changed), 0, 'a Viewer cannot update the Page');

select throws_ok(
  $$
    insert into public.resources (repository_id, kind, title, created_by)
    values (
      '20000000-0000-0000-0000-000000000301',
      'page',
      'Viewer Page',
      '00000000-0000-0000-0000-000000000303'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "resources"',
  'a Viewer cannot create a Page'
);

select is(
  (select count(*)::integer from public.activity_events where repository_id = '20000000-0000-0000-0000-000000000301'),
  3,
  'a Viewer can read Repository activity facts without mutating them'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000304', true);

select is((select count(*)::integer from public.resources), 0, 'an unrelated actor cannot read the private Page');

select * from finish();
rollback;
