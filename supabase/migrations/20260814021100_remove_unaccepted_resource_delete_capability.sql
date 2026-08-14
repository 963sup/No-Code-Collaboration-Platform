-- Resource hard deletion is not an accepted Product operation. Align the replayed authorization
-- vocabulary with Domain truth instead of carrying an unusable Role capability behind RLS denial.

create or replace function private.has_repository_capability(
  target_repository_id uuid,
  requested_capability text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  effective_role public.repository_role;
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  effective_role := private.current_repository_role(target_repository_id);

  return case effective_role
    when 'viewer' then requested_capability in (
      'repository.view',
      'resource.view'
    )
    when 'contributor' then requested_capability in (
      'repository.view',
      'resource.view',
      'resource.create',
      'resource.update'
    )
    when 'manager' then requested_capability in (
      'repository.view',
      'resource.view',
      'resource.create',
      'resource.update',
      'member.manage'
    )
    when 'admin' then requested_capability in (
      'repository.view',
      'repository.manage',
      'resource.view',
      'resource.create',
      'resource.update',
      'member.manage'
    )
    else false
  end;
end;
$$;

revoke all on function private.has_repository_capability(uuid, text)
  from public, anon, authenticated;
grant execute on function private.has_repository_capability(uuid, text) to authenticated;
