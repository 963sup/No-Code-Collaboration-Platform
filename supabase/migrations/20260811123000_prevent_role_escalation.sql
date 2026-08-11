create or replace function private.current_organization_role(
  target_organization_id uuid
)
returns public.organization_role
language sql
stable
security definer
set search_path = ''
as $$
  select membership.role
  from public.organization_memberships as membership
  where membership.organization_id = target_organization_id
    and membership.user_id = (select auth.uid())
  limit 1;
$$;

create or replace function private.is_organization_admin(
  target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.current_organization_role(target_organization_id) in ('admin', 'owner'),
    false
  );
$$;

create or replace function private.is_organization_owner(
  target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.current_organization_role(target_organization_id) = 'owner',
    false
  );
$$;

create or replace function private.can_manage_organization_membership(
  target_organization_id uuid,
  target_role public.organization_role
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role public.organization_role;
begin
  if (select auth.uid()) is null or target_role is null then
    return false;
  end if;

  actor_role := private.current_organization_role(target_organization_id);

  return case actor_role
    when 'owner' then true
    when 'admin' then target_role in ('member', 'admin')
    else false
  end;
end;
$$;

create or replace function private.can_manage_repository_grant(
  target_repository_id uuid,
  target_role public.repository_role
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role public.repository_role;
begin
  if (select auth.uid()) is null or target_role is null then
    return false;
  end if;

  actor_role := private.current_repository_role(target_repository_id);

  if not private.has_repository_capability(target_repository_id, 'member.manage') then
    return false;
  end if;

  return case actor_role
    when 'admin' then true
    when 'manager' then target_role in ('viewer', 'contributor')
    else false
  end;
end;
$$;

create or replace function private.ensure_organization_owner_continuity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role <> 'owner' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' and new.role = 'owner' then
    return new;
  end if;

  perform 1
  from public.organizations as organization
  where organization.id = old.organization_id
  for update;

  if not found then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if not exists (
    select 1
    from public.organization_memberships as membership
    where membership.organization_id = old.organization_id
      and membership.user_id <> old.user_id
      and membership.role = 'owner'
  ) then
    raise exception 'organization must retain at least one owner'
      using errcode = '23514';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists organization_owner_continuity_update
on public.organization_memberships;
create trigger organization_owner_continuity_update
before update of role on public.organization_memberships
for each row execute function private.ensure_organization_owner_continuity();

drop trigger if exists organization_owner_continuity_delete
on public.organization_memberships;
create trigger organization_owner_continuity_delete
before delete on public.organization_memberships
for each row execute function private.ensure_organization_owner_continuity();

revoke all on function private.current_organization_role(uuid)
from public, anon, authenticated;
revoke all on function private.is_organization_owner(uuid)
from public, anon, authenticated;
revoke all on function private.can_manage_organization_membership(
  uuid,
  public.organization_role
) from public, anon, authenticated;
revoke all on function private.can_manage_repository_grant(
  uuid,
  public.repository_role
) from public, anon, authenticated;
revoke all on function private.ensure_organization_owner_continuity()
from public, anon, authenticated;

grant execute on function private.is_organization_owner(uuid)
to authenticated;
grant execute on function private.can_manage_organization_membership(
  uuid,
  public.organization_role
) to authenticated;
grant execute on function private.can_manage_repository_grant(
  uuid,
  public.repository_role
) to authenticated;

drop policy if exists organizations_delete_admin on public.organizations;
drop policy if exists organizations_delete_owner on public.organizations;
create policy organizations_delete_owner
on public.organizations
for delete
to authenticated
using ((select private.is_organization_owner(id)));

drop policy if exists organization_memberships_insert_admin
on public.organization_memberships;
drop policy if exists organization_memberships_insert_delegated
on public.organization_memberships;
create policy organization_memberships_insert_delegated
on public.organization_memberships
for insert
to authenticated
with check (
  (select private.can_manage_organization_membership(organization_id, role))
);

drop policy if exists organization_memberships_update_admin
on public.organization_memberships;
drop policy if exists organization_memberships_update_delegated
on public.organization_memberships;
create policy organization_memberships_update_delegated
on public.organization_memberships
for update
to authenticated
using (
  (select private.can_manage_organization_membership(organization_id, role))
)
with check (
  (select private.can_manage_organization_membership(organization_id, role))
);

drop policy if exists organization_memberships_delete_admin
on public.organization_memberships;
drop policy if exists organization_memberships_delete_delegated
on public.organization_memberships;
create policy organization_memberships_delete_delegated
on public.organization_memberships
for delete
to authenticated
using (
  (select private.can_manage_organization_membership(organization_id, role))
);

drop policy if exists repository_user_grants_insert_manager
on public.repository_user_grants;
drop policy if exists repository_user_grants_insert_delegated
on public.repository_user_grants;
create policy repository_user_grants_insert_delegated
on public.repository_user_grants
for insert
to authenticated
with check (
  (select auth.uid()) = granted_by
  and (select private.can_manage_repository_grant(repository_id, role))
);

drop policy if exists repository_user_grants_update_manager
on public.repository_user_grants;
drop policy if exists repository_user_grants_update_delegated
on public.repository_user_grants;
create policy repository_user_grants_update_delegated
on public.repository_user_grants
for update
to authenticated
using (
  (select private.can_manage_repository_grant(repository_id, role))
)
with check (
  (select private.can_manage_repository_grant(repository_id, role))
);

drop policy if exists repository_user_grants_delete_manager
on public.repository_user_grants;
drop policy if exists repository_user_grants_delete_delegated
on public.repository_user_grants;
create policy repository_user_grants_delete_delegated
on public.repository_user_grants
for delete
to authenticated
using (
  (select private.can_manage_repository_grant(repository_id, role))
);
