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
const noteLines = notes.split('\n');
const technicalHeadingIndex = noteLines.indexOf('### Технічні рішення');
const productNotes = noteLines.slice(1, technicalHeadingIndex).filter(Boolean);
const technicalNotes = noteLines
  .slice(technicalHeadingIndex + 1)
  .filter(Boolean);
const notePattern = /^- \[(?:NEW|CHANGE|FIX|DELETE|SECURITY)\] \S/u;

if (
  noteLines[0] !== '### Продуктові рішення' ||
  technicalHeadingIndex === -1 ||
  !productNotes.length ||
  !technicalNotes.length ||
  [...productNotes, ...technicalNotes].some((line) => !notePattern.test(line))
) {
  throw new Error(
    `Release notes for ${version} must separate product and technical decisions and prefix every item.`,
  );
}
if (!/[А-ЩЬЮЯЄІЇҐа-щьюяєіїґ]/u.test(notes)) {
  throw new Error(`Release notes for ${version} must be written in Ukrainian.`);
}

await writeFile(outputPath, `${notes}\n`);
