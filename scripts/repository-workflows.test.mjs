import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const repositoryRoot = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, repositoryRoot), 'utf8');

test('new worktrees start on a prompt-based branch with dependencies installed', async () => {
  const skill = await read('.codex/skills/schdk-start-session/SKILL.md');

  assert.match(skill, /codex\/<prompt-slug>/);
  assert.match(skill, /git switch -c/);
  assert.match(skill, /pnpm install/);
});

test('dependency updates use local ncu, refresh the lockfile, and audit overrides', async () => {
  const [skill, packageJson] = await Promise.all([
    read('.codex/skills/schdk-update-dependencies/SKILL.md'),
    read('package.json').then(JSON.parse),
  ]);

  assert.equal(
    typeof packageJson.devDependencies['npm-check-updates'],
    'string',
  );
  assert.match(skill, /pnpm self-update/);
  assert.match(skill, /pnpm ncu --workspaces --packageManager pnpm -u/);
  assert.match(skill, /pnpm install/);
  assert.match(skill, /pnpm audit/);
  assert.match(skill, /overrides.*pnpm-workspace\.yaml/s);
});

test('test creation stays prompt-driven and PR tests stay outside pre-commit', async () => {
  const [skill, workflow, preCommit] = await Promise.all([
    read('.codex/skills/schdk-add-missing-tests/SKILL.md'),
    read('.github/workflows/tests.yml'),
    read('.githooks/pre-commit'),
  ]);

  assert.match(skill, /explicitly says "add missing tests"/);
  assert.match(skill, /git log -1/);
  assert.match(skill, /unit tests/);
  assert.match(skill, /integration tests/);
  assert.match(skill, /snapshots/);
  assert.match(skill, /end-to-end tests/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /name: tests/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /pnpm test/);
  assert.doesNotMatch(preCommit, /\bpnpm test\b/);
});

test('development prompts end with a clean commit', async () => {
  const skill = await read('.codex/skills/schdk-development/SKILL.md');

  assert.match(skill, /After every prompt that changes repository files/);
  assert.match(skill, /stage and commit all task changes/);
  assert.match(skill, /confirm the worktree is clean/);
});
