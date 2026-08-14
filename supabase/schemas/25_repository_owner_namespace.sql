create schema if not exists private;

create table private.repository_owner_namespaces (
  slug text primary key,
  user_id uuid unique references auth.users (id) on delete cascade,
  organization_id uuid unique references public.organizations (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint repository_owner_namespaces_slug_format check (
    char_length(slug) between 2 and 64
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint repository_owner_namespaces_exactly_one_owner check (
    (user_id is not null and organization_id is null)
    or (user_id is null and organization_id is not null)
  )
);

comment on table private.repository_owner_namespaces is
  'Private routing-integrity registry reserving one globally unambiguous Repository owner slug for either a User or Organization.';
