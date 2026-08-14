alter table public.repositories
  drop constraint repositories_exactly_one_owner,
  drop constraint repositories_legacy_organization_projection;

alter table public.repositories
  add constraint repositories_exactly_one_owner check (
    (
      owner_user_id is not null
      and owner_organization_id is null
      and organization_id is null
    )
    or (
      owner_user_id is null
      and (owner_organization_id is not null or organization_id is not null)
    )
  ),
  add constraint repositories_legacy_organization_projection check (
    owner_organization_id is null
    or organization_id is null
    or organization_id = owner_organization_id
  );
