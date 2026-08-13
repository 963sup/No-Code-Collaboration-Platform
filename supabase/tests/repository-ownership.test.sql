begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;

select plan(2);

select has_table(
  'private',
  'repository_owner_namespaces',
  'User and Organization Repository owners share one private globally unique URL namespace registry'
);

select is(
  array(
    select enumlabel
    from pg_catalog.pg_enum
    where enumtypid = 'public.repository_visibility'::regtype
    order by enumsortorder
  ),
  array['private', 'public']::name[],
  'Repository visibility exposes only states with accepted effective-access semantics'
);

select * from finish();
rollback;
