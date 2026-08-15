create function private.get_current_repository_access_sources(target_repository_id uuid)
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

create function private.can_create_repository_for_owner(
  target_owner_user_id uuid,
  target_owner_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when (select auth.uid()) is null then false
      when target_owner_user_id = (select auth.uid())
        and target_owner_organization_id is null then true
      when target_owner_user_id is null
        and target_owner_organization_id is not null then exists (
          select 1
          from public.organization_memberships as membership
          where membership.organization_id = target_owner_organization_id
            and membership.user_id = (select auth.uid())
            and membership.role in ('admin', 'owner')
        )
      else false
    end;
$$;

revoke all on function private.can_create_repository_for_owner(uuid, uuid)
  from public, anon, authenticated;
grant execute on function private.can_create_repository_for_owner(uuid, uuid) to authenticated;

create function public.get_current_repository_access_sources(target_repository_id uuid)
returns table (
  direct_role public.repository_role,
  governance_role public.repository_role
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_current_repository_access_sources(target_repository_id);
$$;

revoke all on function public.get_current_repository_access_sources(uuid)
  from public, anon, authenticated;
grant execute on function public.get_current_repository_access_sources(uuid) to authenticated;
