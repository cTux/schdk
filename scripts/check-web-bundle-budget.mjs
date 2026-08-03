import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../packages/web/dist/', import.meta.url));
const manifest = JSON.parse(
  await readFile(path.join(output, '.vite/manifest.json'), 'utf8'),
);
const files = new Set(
  Object.values(manifest).flatMap(({ file, css = [] }) => [file, ...css]),
);
const sizes = await Promise.all(
  [...files].map(async (file) => ({
    file,
    bytes: (await stat(path.join(output, file))).size,
  })),
);
const javascript = sizes.filter(({ file }) => file.endsWith('.js'));
const styles = sizes.filter(({ file }) => file.endsWith('.css'));
assert.ok(
  javascript.length && styles.length,
  'Build @schdk/web before checking its bundle budget',
);
const largest = javascript.sort((left, right) => right.bytes - left.bytes)[0];
const limit = 300 * 1024;
assert.ok(
  largest.bytes <= limit,
  `${largest.file} is ${largest.bytes} bytes; web chunks must stay within ${limit} bytes`,
);
const visualEditor = javascript.find(({ file }) =>
  path.basename(file).startsWith('VisualEditor-'),
);
const visualEditorLimit = 40 * 1024;
assert.ok(visualEditor, 'Visual editor must stay in its own lazy chunk');
assert.ok(
  visualEditor.bytes <= visualEditorLimit,
  `${visualEditor.file} is ${visualEditor.bytes} bytes; visual editor must stay within ${visualEditorLimit} bytes`,
);
console.log(`Largest web chunk: ${largest.file} (${largest.bytes} bytes)`);
console.log(
  `Visual editor chunk: ${visualEditor.file} (${visualEditor.bytes} bytes)`,
);
const largestStyles = styles.sort((left, right) => right.bytes - left.bytes)[0];
const cssLimit = 64 * 1024;
assert.ok(
  largestStyles.bytes <= cssLimit,
  `${largestStyles.file} is ${largestStyles.bytes} bytes; web CSS chunks must stay within ${cssLimit} bytes`,
);
const visualEditorStyles = styles.find(({ file }) =>
  path.basename(file).startsWith('VisualEditor-'),
);
const visualEditorCssLimit = 24 * 1024;
assert.ok(visualEditorStyles, 'Visual editor styles must stay in a lazy chunk');
assert.ok(
  visualEditorStyles.bytes <= visualEditorCssLimit,
  `${visualEditorStyles.file} is ${visualEditorStyles.bytes} bytes; visual editor CSS must stay within ${visualEditorCssLimit} bytes`,
);
console.log(
  `Largest CSS chunk: ${largestStyles.file} (${largestStyles.bytes} bytes)`,
);
console.log(
  `Visual editor CSS: ${visualEditorStyles.file} (${visualEditorStyles.bytes} bytes)`,
);
