create type public.repository_visibility as enum ('private', 'organization', 'public');

create table public.repositories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  visibility public.repository_visibility not null default 'private',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint repositories_slug_format check (
    char_length(slug) between 2 and 64
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint repositories_name_length check (char_length(name) between 1 and 160),
  constraint repositories_organization_slug_unique unique (organization_id, slug)
);

create index repositories_organization_id_idx
  on public.repositories (organization_id, id);

comment on table public.repositories is
  'No-code collaboration containers and the primary resource/authorization boundary.';
