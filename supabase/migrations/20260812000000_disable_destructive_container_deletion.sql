revoke delete on table public.organizations from authenticated;
revoke delete on table public.repositories from authenticated;

drop policy if exists organizations_delete_owner on public.organizations;
drop policy if exists repositories_delete_manager on public.repositories;
