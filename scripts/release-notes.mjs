import { readFile, writeFile } from 'node:fs/promises';

const [version, outputPath] = process.argv.slice(2);

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
  throw new Error('Release version must be valid SemVer without a v prefix.');
}
if (!outputPath) throw new Error('Release notes output path is required.');

const changelog = await readFile(
  new URL('../CHANGELOG.md', import.meta.url),
  'utf8',
);
const lines = changelog.replaceAll('\r\n', '\n').split('\n');
const headingIndex = lines.indexOf(`## ${version}`);
const nextHeadingIndex = lines.findIndex(
  (line, index) => index > headingIndex && line.startsWith('## '),
);
const notes = lines
  .slice(
    headingIndex + 1,
    nextHeadingIndex === -1 ? undefined : nextHeadingIndex,
  )
  .join('\n')
  .trim();

if (headingIndex === -1 || !notes) {
  throw new Error(`CHANGELOG.md has no notes for version ${version}.`);
}
if (!/[А-ЩЬЮЯЄІЇҐа-щьюяєіїґ]/u.test(notes)) {
  throw new Error(`Release notes for ${version} must be written in Ukrainian.`);
}

await writeFile(outputPath, `${notes}\n`);
