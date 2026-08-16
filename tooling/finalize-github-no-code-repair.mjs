import { readFileSync, writeFileSync } from 'node:fs';

function read(path) {
  return readFileSync(path, 'utf8');
}

function write(path, content) {
  writeFileSync(path, content, 'utf8');
}

function replaceOnce(path, before, after) {
  const content = read(path);
  const first = content.indexOf(before);
  if (first === -1) throw new Error(`${path}: expected block not found`);
  if (content.indexOf(before, first + before.length) !== -1) {
    throw new Error(`${path}: expected block is not unique`);
  }
  write(path, `${content.slice(0, first)}${after}${content.slice(first + before.length)}`);
}

replaceOnce(
  'supabase/schemas/65_notification.sql',
  `begin\n  if (select auth.uid()) is null\n    or target_artifact_type not in ('issue', 'discussion')\n    or not private.has_repository_capability(target_repository_id, 'resource.create') then\n    raise exception 'artifact numbering requires resource.create'\n      using errcode = '42501';\n  end if;\n\n  insert into public.repository_artifact_counters as counter (`,
  `begin\n  if (select auth.uid()) is null\n    or target_artifact_type not in ('issue', 'discussion') then\n    raise exception 'artifact numbering requires an authenticated accepted artifact type'\n      using errcode = '42501';\n  end if;\n\n  if target_artifact_type = 'issue'\n    and not private.has_repository_capability(target_repository_id, 'issue.create') then\n    raise exception 'Issue numbering requires issue.create'\n      using errcode = '42501';\n  end if;\n\n  if target_artifact_type = 'discussion'\n    and not private.has_repository_capability(target_repository_id, 'discussion.create') then\n    raise exception 'Discussion numbering requires discussion.create'\n      using errcode = '42501';\n  end if;\n\n  insert into public.repository_artifact_counters as counter (`
);

replaceOnce(
  'supabase/tests/page-resource.test.sql',
  `'resource.create'\n  )),\n  true,\n  'Organization admin governance authority expands to Repository capabilities'`,
  `'page.create'\n  )),\n  true,\n  'Organization admin governance authority expands to Page creation capability'`
);

replaceOnce(
  'apps/web/e2e/repository-grant-lifecycle.spec.ts',
  'Viewer must not be allowed to save this mutation.',
  'Read must not be allowed to save this mutation.'
);

replaceOnce(
  'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/settings/access/page.tsx',
  `          Effective authority is derived from ownership/governance, Direct Grants, and the public\n          read baseline. Direct Grant changes use the same Domain delegation policy and independent\n          database enforcement.`,
  `          Effective authority is derived from ownership/governance, Direct Grants, and the public\n          read baseline. Direct Repository access management is Admin-only and is independently\n          enforced by Application policy and PostgreSQL.`
);

replaceOnce(
  'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/settings/access/page.tsx',
  `              Direct Grants are explicit User → Repository authority relationships. They are\n              independent from Organization Membership and cannot target the acting User itself.`,
  `              Direct Grants are explicit User → Repository authority relationships. Repository\n              Admin manages them; Organization Membership remains independent, and delegation cannot\n              target the acting User itself.`
);

process.stdout.write(`${JSON.stringify({ ok: true })}\n`);
