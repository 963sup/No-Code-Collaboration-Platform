begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(28);

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

select throws_ok(
  $$
    insert into public.resources (repository_id, kind, title, content, created_by)
    values (
      '20000000-0000-0000-0000-000000000301',
      'page',
      'Raw Page',
      '{"body": "bypass"}'::jsonb,
      '00000000-0000-0000-0000-000000000302'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "resources"',
  'a Contributor cannot bypass CreatePage through raw Resource INSERT'
);

select results_eq(
  $$
    select title, content ->> 'body'
    from public.create_page(
      '20000000-0000-0000-0000-000000000301',
      '  First Page  '
    )
  $$,
  $$ values ('First Page'::text, ''::text) $$,
  'CreatePage RPC normalizes the title and creates the accepted blank Page state'
);

select set_config(
  'test.page_id',
  (
    select id::text
    from public.resources
    where repository_id = '20000000-0000-0000-0000-000000000301'
      and title = 'First Page'
    limit 1
  ),
  true
);
select set_config(
  'test.created_updated_at',
  (
    select updated_at::text
    from public.resources
    where id = current_setting('test.page_id')::uuid
  ),
  true
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where event_type = 'resource.created'
      and subject_id = current_setting('test.page_id')::uuid
  ),
  1,
  'CreatePage emits exactly one immutable creation fact'
);

select is(
  (
    select actor_id
    from public.activity_events
    where event_type = 'resource.created'
      and subject_id = current_setting('test.page_id')::uuid
  ),
  '00000000-0000-0000-0000-000000000302'::uuid,
  'CreatePage fact attributes the authenticated creator'
);

with changed as (
  update public.resources
  set title = 'Raw mutation', content = '{"body": "raw mutation"}'::jsonb
  where id = current_setting('test.page_id')::uuid
  returning 1
)
select is(
  (select count(*)::integer from changed),
  0,
  'a Contributor cannot bypass UpdatePage through raw Resource UPDATE'
);

select is(
  (select title from public.resources where id = current_setting('test.page_id')::uuid),
  'First Page',
  'denied raw UPDATE preserves Page state'
);

select is(
  pg_catalog.current_setting('app.page_command', true),
  '',
  'CreatePage restores command context before returning'
);

select results_eq(
  $$
    select title, content ->> 'body'
    from public.update_page(
      '20000000-0000-0000-0000-000000000301',
      current_setting('test.page_id')::uuid,
      '  Updated Page  ',
      'Updated collaboration content.',
      current_setting('test.created_updated_at')::timestamptz
    )
  $$,
  $$ values ('Updated Page'::text, 'Updated collaboration content.'::text) $$,
  'UpdatePage RPC applies a valid transition with matching concurrency evidence'
);

select set_config(
  'test.updated_updated_at',
  (
    select updated_at::text
    from public.resources
    where id = current_setting('test.page_id')::uuid
  ),
  true
);

select isnt(
  current_setting('test.updated_updated_at'),
  current_setting('test.created_updated_at'),
  'a meaningful UpdatePage transition advances concurrency evidence'
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where event_type = 'resource.updated'
      and subject_id = current_setting('test.page_id')::uuid
  ),
  1,
  'a meaningful UpdatePage transition emits exactly one immutable update fact'
);

select is(
  (
    select actor_id
    from public.activity_events
    where event_type = 'resource.updated'
      and subject_id = current_setting('test.page_id')::uuid
  ),
  '00000000-0000-0000-0000-000000000302'::uuid,
  'UpdatePage fact attributes the current authenticated actor'
);

select is(
  (
    select
      (payload ->> 'title_changed')::boolean
      and (payload ->> 'content_changed')::boolean
    from public.activity_events
    where event_type = 'resource.updated'
      and subject_id = current_setting('test.page_id')::uuid
  ),
  true,
  'UpdatePage fact explains which state dimensions changed'
);

select is(
  pg_catalog.current_setting('app.page_command', true),
  '',
  'UpdatePage restores command context before returning'
);

select is(
  (
    select count(*)::integer
    from public.update_page(
      '20000000-0000-0000-0000-000000000301',
      current_setting('test.page_id')::uuid,
      'Stale Page',
      'stale content',
      current_setting('test.created_updated_at')::timestamptz
    )
  ),
  0,
  'stale UpdatePage concurrency evidence cannot overwrite newer state'
);

select is(
  (select title from public.resources where id = current_setting('test.page_id')::uuid),
  'Updated Page',
  'a stale UpdatePage attempt preserves the accepted Page state'
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where event_type = 'resource.updated'
      and subject_id = current_setting('test.page_id')::uuid
  ),
  1,
  'a stale UpdatePage attempt emits no success fact'
);

select is(
  (
    select count(*)::integer
    from public.update_page(
      '20000000-0000-0000-0000-000000000301',
      current_setting('test.page_id')::uuid,
      'Updated Page',
      'Updated collaboration content.',
      current_setting('test.updated_updated_at')::timestamptz
    )
  ),
  1,
  'a no-op UpdatePage request returns the existing accepted Page'
);

select is(
  (
    select updated_at::text
    from public.resources
    where id = current_setting('test.page_id')::uuid
  ),
  current_setting('test.updated_updated_at'),
  'a no-op UpdatePage request preserves concurrency evidence'
);

select is(
  (
    select count(*)::integer
    from public.activity_events
    where event_type = 'resource.updated'
      and subject_id = current_setting('test.page_id')::uuid
  ),
  1,
  'a no-op UpdatePage request does not fabricate a historical fact'
);

select throws_ok(
  $$
    select *
    from public.create_page(
      '20000000-0000-0000-0000-000000000301',
      E' \t\n '
    )
  $$,
  '23514',
  'new row for relation "resources" violates check constraint "resources_title_length"',
  'CreatePage command still reaches database title-shape enforcement'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000303', true);

select is(
  (select count(*)::integer from public.resources),
  1,
  'a Viewer can read the Page through Repository authority'
);

select is(
  (
    select count(*)::integer
    from public.update_page(
      '20000000-0000-0000-0000-000000000301',
      current_setting('test.page_id')::uuid,
      'Viewer mutation',
      'viewer mutation',
      current_setting('test.updated_updated_at')::timestamptz
    )
  ),
  0,
  'a Viewer cannot update a Page through the command RPC'
);

select throws_ok(
  $$
    select *
    from public.create_page(
      '20000000-0000-0000-0000-000000000301',
      'Viewer Page'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "resources"',
  'a Viewer cannot create a Page through the command RPC'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000304', true);

select is(
  (select count(*)::integer from public.resources),
  0,
  'an unrelated actor cannot read the private Page'
);

select * from finish();
rollback;
