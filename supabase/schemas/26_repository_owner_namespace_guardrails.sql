alter table private.repository_owner_namespaces
  add constraint repository_owner_namespaces_reserved_slug check (
    slug not in (
      'account',
      'auth',
      'dashboard',
      'discussions',
      'explore',
      'forgot-password',
      'issues',
      'marketplace',
      'new',
      'notifications',
      'organizations',
      'orgs',
      'projects',
      'recover-password',
      'repos',
      'reset-password',
      'search',
      'settings',
      'sign-in',
      'sign-up',
      'verify-email'
    )
  );
