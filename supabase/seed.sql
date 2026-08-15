-- LOCAL/CI DEMO ONLY. These checked-in credentials are public test data, not secrets.
-- Never reuse them or run this seed against preview, staging, production, or another
-- persistent environment.

begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000d001',
    'authenticated',
    'authenticated',
    'sup@a-i.tw',
    extensions.crypt('Aa12341234', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Sup Demo", "username": "sup-demo"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000d010',
    'authenticated',
    'authenticated',
    'collaborator@a-i.tw',
    extensions.crypt('Bb12341234', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Collaborator Demo", "username": "collaborator-demo"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  );

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-00000000d002',
    '00000000-0000-0000-0000-00000000d001',
    '00000000-0000-0000-0000-00000000d001',
    jsonb_build_object(
      'sub', '00000000-0000-0000-0000-00000000d001',
      'email', 'sup@a-i.tw',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000d011',
    '00000000-0000-0000-0000-00000000d010',
    '00000000-0000-0000-0000-00000000d010',
    jsonb_build_object(
      'sub', '00000000-0000-0000-0000-00000000d010',
      'email', 'collaborator@a-i.tw',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    timezone('utc', now()),
    timezone('utc', now())
  );

update public.profiles
set display_name = 'Sup Demo'
where id = '00000000-0000-0000-0000-00000000d001';

update public.profiles
set display_name = 'Collaborator Demo'
where id = '00000000-0000-0000-0000-00000000d010';

-- Activity Evidence keeps the same Actor attribution contract in fixtures as in Product commands.
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-00000000d001',
  true
);

-- Demo data relies on the same organization_created_owner trigger as an authenticated Product
-- insert; no Demo-only Membership or Owner bootstrap is permitted.
insert into public.organizations (id, slug, name, created_by)
values (
  '10000000-0000-0000-0000-00000000d001',
  'demo-organization',
  'Demo Organization',
  '00000000-0000-0000-0000-00000000d001'
);

insert into public.repositories (
  id,
  owner_organization_id,
  slug,
  name,
  description,
  visibility,
  created_by
)
values (
  '20000000-0000-0000-0000-00000000d001',
  '10000000-0000-0000-0000-00000000d001',
  'demo-repository',
  'Demo Repository',
  'A deterministic local workspace for exercising collaboration flows.',
  'private',
  '00000000-0000-0000-0000-00000000d001'
);

insert into public.resources (
  id,
  repository_id,
  kind,
  title,
  content,
  created_by
)
values (
  '30000000-0000-0000-0000-00000000d001',
  '20000000-0000-0000-0000-00000000d001',
  'page',
  'Welcome to the Demo',
  '{"body": "This Page is recreated by supabase/seed.sql after every local reset."}'::jsonb,
  '00000000-0000-0000-0000-00000000d001'
);

insert into public.issues (
  id,
  repository_id,
  issue_number,
  title,
  body,
  status,
  created_by
)
values (
  '40000000-0000-0000-0000-00000000d001',
  '20000000-0000-0000-0000-00000000d001',
  1,
  'Clarify the customer onboarding handoff',
  'Document the owner, acceptance criteria, and next step for the onboarding handoff.',
  'open',
  '00000000-0000-0000-0000-00000000d001'
);

insert into public.repository_artifact_counters (
  repository_id,
  artifact_type,
  last_number
)
values (
  '20000000-0000-0000-0000-00000000d001',
  'issue',
  1
);

commit;
