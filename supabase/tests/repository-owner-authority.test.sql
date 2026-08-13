begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(7);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '00000000-0000-0000-0000-00000000a001',
    'alice-owner@example.com',
    '{"username":"alice-owner"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-00000000a002',
    'org-owner@example.com',
    '{"username":"org-owner-user"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-00000000a003',
    'org-member@example.com',
    '{"username":"org-member-user"}'::jsonb
  );

insert into public.organizations (id, slug, name, created_by)
values (
  '10000000-0000-0000-0000-00000000a001',
  'acme-owner-test',
  'Acme Owner Test',
  '00000000-0000-0000-0000-00000000a002'
);

insert into public.organization_memberships (organization_id, user_id, role)
values (
  '10000000-0000-0000-0000-00000000a001',
  '00000000-0000-0000-0000-00000000a003',
  'member'
);

insert into public.repositories (
  id,
  owner_user_id,
  slug,
  name,
  visibility,
  created_by
)
values (
  '20000000-0000-0000-0000-00000000a001',
  '00000000-0000-0000-0000-00000000a001',
  'shared-slug',
  'Personal Shared Slug',
  'private',
  '00000000-0000-0000-0000-00000000a001'
);

insert into public.repositories (
  id,
  owner_organization_id,
  organization_id,
  slug,
  name,
  visibility,
  created_by
)
values (
  '20000000-0000-0000-0000-00000000a002',
  '10000000-0000-0000-0000-00000000a001',
  '10000000-0000-0000-0000-00000000a001',
  'shared-slug',
  'Organization Shared Slug',
  'private',
  '00000000-0000-0000-0000-00000000a002'
);

select is(
  (
    select count(*)::integer
    from public.repositories
    where slug = 'shared-slug'
  ),
  2,
  'the same Repository slug is valid under distinct User and Organization owner namespaces'
);

select throws_ok(
  $$
    insert into public.organizations (id, slug, name, created_by)
    values (
      '10000000-0000-0000-0000-00000000a099',
      'alice-owner',
      'Colliding Owner Namespace',
      '00000000-0000-0000-0000-00000000a002'
    )
  $$,
  '23505',
  null,
  'User and Organization owner slugs cannot collide'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', true);

select is(
  (select private.current_repository_role('20000000-0000-0000-0000-00000000a001')),
  'admin'::public.repository_role,
  'personal Repository owner derives Repository admin authority without a Grant'
);

select is(
  (select private.current_repository_role('20000000-0000-0000-0000-00000000a002')),
  null::public.repository_role,
  'personal ownership of one Repository grants no authority over an Organization-owned Repository'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', true);

select is(
  (select private.current_repository_role('20000000-0000-0000-0000-00000000a002')),
  'admin'::public.repository_role,
  'Organization owner derives Repository admin authority for a Repository owned by that Organization'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a003', true);

select is(
  (select private.current_repository_role('20000000-0000-0000-0000-00000000a002')),
  null::public.repository_role,
  'ordinary Organization membership does not derive a Repository Role'
);

select is(
  (select count(*)::integer from public.repositories),
  0,
  'ordinary Organization member cannot read the private Repository without an accepted authority source'
);

select * from finish();
rollback;
