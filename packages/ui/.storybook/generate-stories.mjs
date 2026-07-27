import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const storybookDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(storybookDirectory, '../src');
const generatedDirectory = path.join(storybookDirectory, 'generated');

async function findSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory()
        ? findSourceFiles(entryPath)
        : entry.name.endsWith('.tsx') &&
            !entry.name.includes('.test.') &&
            !entry.name.includes('.stories.')
          ? [entryPath]
          : [];
    }),
  );
  return files.flat();
}

function findClosingCharacter(source, start, open, close) {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === open) depth += 1;
    if (source[index] === close && --depth === 0) return index;
  }
  throw new Error(`Unclosed ${open} in component source`);
}

function getPropNames(parameters) {
  const trimmed = parameters.trim();
  if (!trimmed.startsWith('{')) return [];
  const end = findClosingCharacter(trimmed, 0, '{', '}');
  return trimmed
    .slice(1, end)
    .split(',')
    .map((part) => part.trim().split(/[\s=:]/u)[0])
    .filter((name) => name && !name.startsWith('...'));
}

function getComponents(source) {
  const components = [];
  const exports = /export function ([A-Z]\w*)\s*\(/gu;
  let match;
  while ((match = exports.exec(source))) {
    const open = exports.lastIndex - 1;
    const close = findClosingCharacter(source, open, '(', ')');
    components.push({
      name: match[1],
      props: getPropNames(source.slice(open + 1, close)),
    });
    exports.lastIndex = close + 1;
  }
  return components;
}

function createStory(relativeSource, component) {
  const importPath = `../../src/${relativeSource.replaceAll('\\', '/').replace(/\.tsx$/u, '')}`;
  const area = relativeSource.split(path.sep)[0];
  const title = `${area[0].toUpperCase()}${area.slice(1)}/${component.name}`;
  const needsToolbar = [
    'ActionToolbarButton',
    'ActionToolbarPopover',
    'ActionToolbarSeparator',
    'ImagePositionSettings',
    'TextSettings',
  ].includes(component.name);
  return `import type { Meta, StoryObj } from '@storybook/react-vite';
import { getStoryArgs } from '../story-args';
${needsToolbar ? "import { ToolbarStory } from '../story-decorators';\n" : ''}import { ${component.name} } from '${importPath}';

const meta = {
  title: '${title}',
  component: ${component.name},
  tags: ['autodocs'],
${needsToolbar ? '  decorators: [(Story) => <ToolbarStory><Story /></ToolbarStory>],\n' : ''}} satisfies Meta<typeof ${component.name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  args: getStoryArgs('${component.name}', ${JSON.stringify(component.props)}),
} as Story;
`;
}

await rm(generatedDirectory, { recursive: true, force: true });
await mkdir(generatedDirectory, { recursive: true });

let storyCount = 0;
for (const sourceFile of await findSourceFiles(sourceDirectory)) {
  const source = await readFile(sourceFile, 'utf8');
  const relativeSource = path.relative(sourceDirectory, sourceFile);
  for (const component of getComponents(source)) {
    const storyName = `${relativeSource.replaceAll(path.sep, '-').replace(/\.tsx$/u, '')}-${component.name}.stories.tsx`;
    await writeFile(
      path.join(generatedDirectory, storyName),
      createStory(relativeSource, component),
    );
    storyCount += 1;
  }
}

console.log(`Generated ${storyCount} Storybook stories.`);
