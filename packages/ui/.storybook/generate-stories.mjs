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
      if (entry.isDirectory()) return findSourceFiles(entryPath);
      const isComponentSource =
        entry.name.endsWith('.tsx') &&
        !entry.name.includes('.test.') &&
        !entry.name.includes('.stories.');
      return isComponentSource ? [entryPath] : [];
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
  const groupedExports = new Set(
    [...source.matchAll(/export\s*\{([\s\S]*?)\};/gu)].flatMap((match) =>
      match[1]
        .split(',')
        .map(
          (name) =>
            name
              .trim()
              .replace(/^type\s+/u, '')
              .split(/\s+as\s+/u)[0],
        )
        .filter(Boolean),
    ),
  );
  const components = [];
  const functions = /(export\s+)?function ([A-Z]\w*)\s*\(/gu;
  let match;
  while ((match = functions.exec(source))) {
    const name = match[2];
    const isExported = Boolean(match[1]) || groupedExports.has(name);
    if (!isExported) continue;
    const open = functions.lastIndex - 1;
    const close = findClosingCharacter(source, open, '(', ')');
    components.push({
      name,
      props: getPropNames(source.slice(open + 1, close)),
    });
    functions.lastIndex = close + 1;
  }
  return components;
}

function createStory(relativeSource, component) {
  const importPath = `../../src/${relativeSource.replaceAll('\\', '/').replace(/\.tsx$/u, '')}`;
  const area = relativeSource.split(path.sep)[0];
  const title = `${area[0].toUpperCase()}${area.slice(1)}/${component.name}`;
  const areaContext = {
    editor: {
      wrapper: 'editor',
      styles: ['editor'],
    },
    host: {
      wrapper: 'host',
      styles: ['host'],
    },
    options: {
      styles: ['shell'],
    },
    shell: {
      styles: ['shell'],
    },
    'visual-editor': {
      wrapper: 'visual-editor',
      styles: ['shell', 'host'],
    },
  }[area];
  const needsToolbar = [
    'ActionToolbarButton',
    'ActionToolbarPopover',
    'ActionToolbarSeparator',
    'ImagePositionSettings',
    'TextSettings',
  ].includes(component.name);
  const needsDecorator = needsToolbar || areaContext?.wrapper;
  const styleImports =
    areaContext?.styles
      .map((style) => `import '../../src/styles/${style}.scss';`)
      .join('\n') ?? '';
  return `import type { Meta, StoryObj } from '@storybook/react-vite';
import { getStoryArgs } from '../story-args';
${needsDecorator ? "import { ProductionStory } from '../story-decorators';\n" : ''}${styleImports ? `${styleImports}\n` : ''}import { ${component.name} } from '${importPath}';

const meta = {
  title: '${title}',
  component: ${component.name},
  tags: ['autodocs'],
${needsDecorator ? `  decorators: [(Story) => <ProductionStory${areaContext?.wrapper ? ` area="${areaContext.wrapper}"` : ''}${needsToolbar ? ' toolbar' : ''}><Story /></ProductionStory>],\n` : ''}} satisfies Meta<typeof ${component.name}>;

type Story = StoryObj<typeof meta>;

const Default = {
  args: getStoryArgs('${component.name}', ${JSON.stringify(component.props)}),
} as Story;

export { meta as default, Default };
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
