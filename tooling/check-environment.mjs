import { spawnSync } from 'node:child_process';

const tools = [
  {
    name: 'node',
    command: process.execPath,
    args: ['--version'],
    required: true,
    expected: '24.x',
    validate: (value) => value.startsWith('v24.')
  },
  {
    name: 'pnpm',
    command: 'pnpm',
    args: ['--version'],
    required: true,
    expected: '11.20.0',
    validate: (value) => value === '11.20.0'
  },
  { name: 'git', command: 'git', args: ['--version'], required: true },
  { name: 'rg', command: 'rg', args: ['--version'], required: true },
  { name: 'jq', command: 'jq', args: ['--version'], required: true },
  {
    name: 'supabase',
    command: 'supabase',
    args: ['--version'],
    required: true,
    expected: '2.111.0',
    validate: (value) => value === '2.111.0'
  },
  { name: 'gh', command: 'gh', args: ['--version'], required: false },
  { name: 'serena', command: 'serena', args: ['--help'], required: false }
];

function firstLine(value) {
  return value.trim().split(/\r?\n/, 1)[0] ?? '';
}

function inspectTool(tool) {
  const result = spawnSync(tool.command, tool.args, {
    encoding: 'utf8',
    windowsHide: true
  });

  if (result.error || result.status !== 0) {
    return {
      name: tool.name,
      required: tool.required,
      status: 'missing'
    };
  }

  const output = firstLine(result.stdout || result.stderr || '');
  const valid = tool.validate ? tool.validate(output) : true;

  return {
    name: tool.name,
    required: tool.required,
    status: valid ? 'ok' : 'version-mismatch',
    version: output,
    ...(tool.expected ? { expected: tool.expected } : {})
  };
}

function inspectContainerRuntime() {
  const candidates = [
    { name: 'docker', command: 'docker', args: ['info', '--format', '{{.ServerVersion}}'] },
    { name: 'podman', command: 'podman', args: ['info', '--format', '{{.Version.Version}}'] }
  ];

  for (const candidate of candidates) {
    const result = spawnSync(candidate.command, candidate.args, {
      encoding: 'utf8',
      windowsHide: true
    });

    if (!result.error && result.status === 0) {
      return {
        name: 'container-runtime',
        required: true,
        status: 'ok',
        provider: candidate.name,
        version: firstLine(result.stdout || result.stderr || '')
      };
    }
  }

  return {
    name: 'container-runtime',
    required: true,
    status: 'missing',
    expected: 'running Docker-compatible runtime'
  };
}

const results = [...tools.map(inspectTool), inspectContainerRuntime()];
const requiredFailures = results.filter((result) => result.required && result.status !== 'ok');

console.log(
  JSON.stringify(
    {
      ok: requiredFailures.length === 0,
      requiredFailures: requiredFailures.map((result) => result.name),
      tools: results
    },
    null,
    2
  )
);

process.exitCode = requiredFailures.length === 0 ? 0 : 1;
