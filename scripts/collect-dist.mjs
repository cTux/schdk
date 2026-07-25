import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const packages = await readdir('packages', { withFileTypes: true });
const dist = resolve('dist');

console.log('Collecting package artifacts...');
try {
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `import { rm } from 'node:fs/promises'; await rm(${JSON.stringify(dist)}, { force: true, maxRetries: 10, recursive: true, retryDelay: 100 });`,
    ],
    { stdio: 'inherit', timeout: 10_000 },
  );
} catch (error) {
  if (error?.code === 'ETIMEDOUT')
    throw new Error(
      'Timed out cleaning dist because another process is using it.',
    );
  throw error;
}
await mkdir(dist);

await Promise.all(
  packages
    .filter((entry) => entry.isDirectory())
    .map((entry) =>
      cp(`packages/${entry.name}/dist`, `dist/${entry.name}`, {
        recursive: true,
      }),
    ),
);
console.log('Package artifacts collected in dist.');
