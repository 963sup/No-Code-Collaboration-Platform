alter table private.repository_owner_namespaces
  add constraint repository_owner_namespaces_reserved_slug check (
    slug not in (
      'app',
      'auth',
      'forgot-password',
      'new',
      'organizations',
      'recover-password',
      'reset-password',
      'settings',
      'sign-in',
      'sign-up',
      'verify-email'
    )
  );
