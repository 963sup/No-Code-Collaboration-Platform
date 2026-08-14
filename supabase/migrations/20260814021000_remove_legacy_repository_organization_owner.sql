-- Finalize Repository ownership as exactly one typed User-or-Organization Owner.
-- Earlier migrations retain the historical transition; the replayed final state contains no
-- Organization-only compatibility ownership column.

update public.repositories
set owner_organization_id = organization_id
where owner_user_id is null
  and owner_organization_id is null
  and organization_id is not null;

create or replace function private.get_current_repository_access_sources(target_repository_id uuid)
returns table (
  direct_role public.repository_role,
  governance_role public.repository_role
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      select direct_grant.role
      from public.repository_user_grants as direct_grant
      where direct_grant.repository_id = target_repository_id
        and direct_grant.user_id = (select auth.uid())
      limit 1
    ) as direct_role,
    case
      when exists (
        select 1
        from public.repositories as repository
        where repository.id = target_repository_id
          and repository.owner_user_id = (select auth.uid())
      ) then 'admin'::public.repository_role
      when exists (
        select 1
        from public.repositories as repository
        join public.organization_memberships as membership
          on membership.organization_id = repository.owner_organization_id
        where repository.id = target_repository_id
          and membership.user_id = (select auth.uid())
          and membership.role in ('admin', 'owner')
      ) then 'admin'::public.repository_role
      else null
    end as governance_role
  where (select auth.uid()) is not null;
$$;

revoke all on function private.get_current_repository_access_sources(uuid)
  from public, anon, authenticated;
grant execute on function private.get_current_repository_access_sources(uuid) to authenticated;

drop policy if exists repositories_insert_admin on public.repositories;
drop policy if exists repositories_insert_personal_owner on public.repositories;
drop policy if exists repositories_insert_organization_admin on public.repositories;

alter table public.repositories
  drop constraint if exists repositories_exactly_one_owner,
  drop constraint if exists repositories_legacy_organization_projection;

alter table public.repositories
  drop column organization_id;

alter table public.repositories
  add constraint repositories_exactly_one_owner check (
    (owner_user_id is not null and owner_organization_id is null)
    or (owner_user_id is null and owner_organization_id is not null)
  );

create policy repositories_insert_personal_owner
on public.repositories
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and owner_user_id = (select auth.uid())
  and owner_organization_id is null
);

create policy repositories_insert_organization_admin
on public.repositories
for insert
to authenticated
with check (
  (select auth.uid()) = created_by
  and owner_user_id is null
  and owner_organization_id is not null
  and (select private.is_organization_admin(owner_organization_id))
);
