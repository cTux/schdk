import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { promisify } from 'node:util';
import { findImportCycles } from './source-import-graph.mjs';

const repositoryRoot = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, repositoryRoot), 'utf8');
const execFileAsync = promisify(execFile);
const objectEntries = (source, name) => {
  const body = source.match(
    new RegExp(
      `(?:const|export const) ${name} = \\{([\\s\\S]*?)\\} as const`,
      'u',
    ),
  )?.[1];
  assert.ok(body, `${name} must remain a const object`);
  return Object.fromEntries(
    [...body.matchAll(/(\w+): '([^']+)'/gu)].map(([, key, value]) => [
      key,
      value,
    ]),
  );
};
const sourceExtensions = new Set([
  '.cjs',
  '.css',
  '.cts',
  '.html',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.scss',
  '.ts',
  '.tsx',
]);
const allowedWorkspaceDependencies = new Map([
  ['@schdk/common', new Set()],
  ['@schdk/ai', new Set(['@schdk/common'])],
  ['@schdk/google-drive', new Set(['@schdk/common'])],
  ['@schdk/ui', new Set(['@schdk/common'])],
  [
    '@schdk/web',
    new Set(['@schdk/ai', '@schdk/common', '@schdk/google-drive', '@schdk/ui']),
  ],
  [
    '@schdk/desktop',
    new Set([
      '@schdk/ai',
      '@schdk/common',
      '@schdk/google-drive',
      '@schdk/web',
    ]),
  ],
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

test('test creation stays prompt-driven and pre-commit only formats staged files', async () => {
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
  assert.match(
    preCommit,
    /git diff --cached --name-only --diff-filter=ACMR -z/,
  );
  assert.match(preCommit, /pnpm exec oxfmt --write/);
  assert.match(preCommit, /git add --/);
  assert.doesNotMatch(preCommit, /\bpnpm lint\b/);
  assert.doesNotMatch(preCommit, /\bpnpm test\b/);
});

test('development prompts end with a clean commit', async () => {
  const skill = await read('.codex/skills/schdk-development/SKILL.md');

  assert.match(skill, /After every prompt that changes repository files/);
  assert.match(skill, /stage and commit all task changes/);
  assert.match(skill, /confirm the worktree is clean/);
});

test('workspace imports respect package boundaries and manifests', async () => {
  const packageDirectories = (
    await readdir(new URL('packages/', repositoryRoot), {
      withFileTypes: true,
    })
  ).filter((entry) => entry.isDirectory());

  for (const directory of packageDirectories) {
    const packageRoot = new URL(`packages/${directory.name}/`, repositoryRoot);
    const manifest = JSON.parse(
      await readFile(new URL('package.json', packageRoot), 'utf8'),
    );
    const allowed = allowedWorkspaceDependencies.get(manifest.name);
    assert.ok(allowed, `${manifest.name} needs an explicit dependency policy`);
    const declared = new Set([
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
    ]);
    const files = (await listFiles(new URL('src/', packageRoot))).filter(
      (file) =>
        sourceExtensions.has(
          file.pathname.slice(file.pathname.lastIndexOf('.')),
        ),
    );

    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const imports = source.matchAll(
        /(?:from\s*|import\s*(?:\(\s*)?)["'](@schdk\/[^/"']+)/gu,
      );
      for (const [, dependency] of imports) {
        assert.ok(
          allowed.has(dependency),
          `${manifest.name} must not import ${dependency}: ${file.pathname}`,
        );
        assert.ok(
          declared.has(dependency),
          `${manifest.name} must declare ${dependency}: ${file.pathname}`,
        );
      }
    }
  }
});

test('shared packages expose stable domain entry points', async () => {
  const [common, drive] = await Promise.all([
    read('packages/common/package.json').then(JSON.parse),
    read('packages/google-drive/package.json').then(JSON.parse),
  ]);

  assert.deepEqual(Object.keys(common.exports).sort(), [
    '.',
    './ai-question',
    './ai-question-package',
    './game-question',
    './visual-editor-template',
  ]);
  assert.deepEqual(Object.keys(drive.exports).sort(), [
    '.',
    './ai-questions',
    './game-packages',
    './question-database',
  ]);
});

test('workspace source modules have no relative import cycles', async () => {
  const packageDirectories = (
    await readdir(new URL('packages/', repositoryRoot), { withFileTypes: true })
  ).filter((entry) => entry.isDirectory());
  const cycles = await findImportCycles(
    packageDirectories.map(
      ({ name }) => new URL(`packages/${name}/src/`, repositoryRoot),
    ),
  );

  assert.deepEqual(
    cycles.map((cycle) => cycle.map((url) => new URL(url).pathname)),
    [],
  );
});

test('UI feature areas use neutral game presentation ownership', async () => {
  const visualEditorFiles = await listFiles(
    new URL('packages/ui/src/visual-editor/', repositoryRoot),
  );
  const forbiddenImports = [];
  const forbiddenScopes = [];

  for (const file of visualEditorFiles) {
    if (
      !sourceExtensions.has(file.pathname.slice(file.pathname.lastIndexOf('.')))
    ) {
      continue;
    }
    const source = await readFile(file, 'utf8');
    if (/from\s+["'][^"']*host\//u.test(source)) {
      forbiddenImports.push(file.pathname);
    }
    if (/host-app/u.test(source)) forbiddenScopes.push(file.pathname);
  }

  assert.deepEqual(forbiddenImports, []);
  assert.deepEqual(forbiddenScopes, []);
});

test('application source respects internal ownership boundaries', async () => {
  const uiSource = new URL('packages/ui/src/', repositoryRoot);
  const webSource = new URL('packages/web/src/', repositoryRoot);
  const uiFiles = (await listFiles(uiSource)).filter((file) =>
    ['.ts', '.tsx'].some((extension) => file.pathname.endsWith(extension)),
  );
  const webFiles = (await listFiles(webSource)).filter((file) =>
    ['.ts', '.tsx'].some((extension) => file.pathname.endsWith(extension)),
  );

  for (const file of uiFiles) {
    const source = await readFile(file, 'utf8');
    assert.doesNotMatch(
      source,
      /\b(?:indexedDB|localStorage|sessionStorage)\b|window\.desktop|(?:from\s*|import\s*(?:\(\s*)?|require\(\s*)['"](?:electron|node:)/u,
      `@schdk/ui must not own application persistence or platform bridges: ${file.pathname}`,
    );
  }

  for (const file of webFiles.filter((file) =>
    file.pathname.endsWith('.tsx'),
  )) {
    assert.doesNotMatch(
      await readFile(file, 'utf8'),
      /<(?:a|button|input|option|select|textarea)\b/u,
      `@schdk/web must compose exported UI controls: ${file.pathname}`,
    );
  }

  const featureGroups = [
    { root: uiSource, areas: ['editor', 'host', 'visual-editor'] },
    { root: webSource, areas: ['editor', 'host'] },
  ];
  for (const { root, areas } of featureGroups) {
    for (const area of areas) {
      const areaRoot = new URL(`${area}/`, root);
      const files = (await listFiles(areaRoot)).filter((file) =>
        ['.ts', '.tsx'].some((extension) => file.pathname.endsWith(extension)),
      );
      for (const file of files) {
        const source = await readFile(file, 'utf8');
        const imports = [
          ...source.matchAll(
            /(?:from\s*|import\s*(?:\(\s*)?)['"]([^'"]+)['"]/gu,
          ),
        ].map(([, specifier]) => specifier);
        for (const otherArea of areas.filter(
          (candidate) => candidate !== area,
        )) {
          const importsOtherArea = imports.some((specifier) => {
            const resolved = specifier.startsWith('.')
              ? new URL(specifier, file).pathname
              : specifier;
            return (
              resolved.includes(`/src/${otherArea}/`) ||
              specifier.startsWith(`@schdk/ui/${otherArea}`)
            );
          });
          assert.equal(
            importsOtherArea,
            false,
            `${area} must use neutral domains instead of importing ${otherArea}: ${file.pathname}`,
          );
        }
      }
    }
  }
});

test('critical architecture boundaries remain enforced', async () => {
  const [channels, preload, history] = await Promise.all([
    read('packages/desktop/src/ipc/google-drive/google-drive-ipc-channels.ts'),
    read('packages/desktop/src/preload.cts'),
    read('packages/web/src/utils/visual-editor/visual-editor-history.ts'),
  ]);

  assert.deepEqual(
    objectEntries(preload, 'googleDriveIpcChannels'),
    objectEntries(channels, 'GOOGLE_DRIVE_IPC_CHANNELS'),
  );
  await assert.rejects(
    access(
      new URL(
        'packages/web/src/storage/options/options-storage.ts',
        repositoryRoot,
      ),
    ),
  );
  await assert.rejects(
    access(
      new URL(
        'packages/web/src/storage/options/game-options-storage.ts',
        repositoryRoot,
      ),
    ),
  );
  assert.match(history, /MAX_HISTORY_ENTRIES = 100/);
  assert.match(history, /MAX_HISTORY_BYTES = 32 \* 1024 \* 1024/);
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
    await access(new URL('index.ts', componentDirectory));

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
