import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { promisify } from 'node:util';

const repositoryRoot = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, repositoryRoot), 'utf8');
const execFileAsync = promisify(execFile);
const sourceExtensions = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.mjs',
  '.scss',
  '.ts',
  '.tsx',
]);

const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryUrl = new URL(entry.name, directory);
      return entry.isDirectory()
        ? listFiles(new URL(`${entry.name}/`, directory))
        : [entryUrl];
    }),
  );
  return files.flat();
};

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
  assert.match(workflow, /pnpm fmt:check/);
  assert.match(workflow, /pnpm lint/);
  assert.match(workflow, /pnpm typecheck/);
  assert.match(workflow, /pnpm test/);
  assert.match(workflow, /runs-on: windows-latest/);
  assert.match(workflow, /pnpm build/);
  assert.doesNotMatch(preCommit, /\bpnpm test\b/);
});

test('development prompts end with a clean commit', async () => {
  const skill = await read('.codex/skills/schdk-development/SKILL.md');

  assert.match(skill, /After every prompt that changes repository files/);
  assert.match(skill, /stage and commit all task changes/);
  assert.match(skill, /confirm the worktree is clean/);
});

test('tracked source files stay within 256 physical lines', async () => {
  const { stdout } = await execFileAsync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: repositoryRoot, encoding: 'utf8' },
  );
  const sourceFiles = stdout
    .split('\0')
    .filter(Boolean)
    .filter((path) => existsSync(new URL(path, repositoryRoot)))
    .filter((path) =>
      sourceExtensions.has(path.slice(path.lastIndexOf('.')).toLowerCase()),
    );
  const violations = [];

  for (const path of sourceFiles) {
    const content = await read(path);
    const lineCount = content
      .replace(/(?:\r\n|\r|\n)$/u, '')
      .split(/\r\n|\r|\n/u).length;
    if (lineCount > 256) violations.push(`${path}: ${lineCount}`);
  }

  assert.deepEqual(violations, []);
});

test('UI components follow the directory and class composition contracts', async () => {
  const uiSource = new URL('packages/ui/src/', repositoryRoot);
  const files = await listFiles(uiSource);
  const componentFiles = files.filter(
    (file) =>
      file.pathname.endsWith('.tsx') &&
      !file.pathname.includes('/__tests__/') &&
      !file.pathname.includes('.test.'),
  );
  const testFiles = files.filter((file) => file.pathname.includes('.test.'));
  const packageJson = await read('packages/ui/package.json').then(JSON.parse);

  assert.equal(typeof packageJson.dependencies.classnames, 'string');
  assert.ok(componentFiles.length > 0);

  for (const componentFile of componentFiles) {
    const componentName = componentFile.pathname.split('/').at(-1).slice(0, -4);
    const componentDirectory = new URL('./', componentFile);
    const directoryName = componentDirectory.pathname.split('/').at(-2);

    assert.equal(directoryName, componentName, componentFile.pathname);
    await Promise.all(
      ['index.ts', 'types.ts'].map((name) =>
        access(new URL(name, componentDirectory)),
      ),
    );

    const source = await readFile(componentFile, 'utf8');
    const stylesheet = files.find(
      (file) => file.href === new URL('styles.scss', componentDirectory).href,
    );
    const importsStylesheet = source.includes("import './styles.scss';");

    assert.equal(importsStylesheet, stylesheet !== undefined);
    if (stylesheet) {
      const styles = (await readFile(stylesheet, 'utf8')).trim();
      assert.doesNotMatch(styles, /^(?:\/\/[^\r\n]*|\/\*[^\r\n]*\*\/)$/);
    }

    assert.doesNotMatch(source, /className="[^"]+\s+[^"]+"/);
    assert.doesNotMatch(source, /className=\{`/);
    assert.doesNotMatch(source, /\.filter\(Boolean\)\s*\.join\(['"] ['"]\)/);
  }

  assert.ok(
    testFiles.every((file) => file.pathname.includes('/__tests__/')),
    'UI component tests must be colocated under __tests__',
  );
});
