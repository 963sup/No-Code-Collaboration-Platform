import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = path.join(repositoryRoot, 'supabase', 'schemas');
const migrationDirectory = path.join(repositoryRoot, 'supabase', 'migrations');

const schemaFiles = (await readdir(schemaDirectory))
  .filter((file) => file.endsWith('.sql'))
  .toSorted((left, right) => left.localeCompare(right, 'en'));
const migrationFiles = (await readdir(migrationDirectory)).filter((file) => file.endsWith('.sql'));

if (
  migrationFiles.length !== 1 ||
  !migrationFiles[0]?.endsWith('_local_development_baseline.sql')
) {
  throw new Error(
    'LocalOnly baseline compilation requires exactly one local-development migration.'
  );
}

const sections = await Promise.all(
  schemaFiles.map(async (file) => {
    const source = await readFile(path.join(schemaDirectory, file), 'utf8');
    return `-- Source: supabase/schemas/${file}\n\n${source.trimEnd()}`;
  })
);

const baseline = [
  '-- Local-development baseline compiled from the ordered declarative schemas.',
  '-- supabase/schemas is the canonical desired database state.',
  '-- This file becomes immutable only after an identified persistent environment applies it.',
  '',
  ...sections
].join('\n\n');

await writeFile(path.join(migrationDirectory, migrationFiles[0]), `${baseline}\n`, 'utf8');
