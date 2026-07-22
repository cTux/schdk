import { cp, mkdir, readdir, rm } from 'node:fs/promises';

const packages = await readdir('packages', { withFileTypes: true });

await rm('dist', { force: true, recursive: true });
await mkdir('dist');

await Promise.all(
  packages
    .filter((entry) => entry.isDirectory())
    .map((entry) =>
      cp(`packages/${entry.name}/dist`, `dist/${entry.name}`, {
        recursive: true,
      }),
    ),
);
