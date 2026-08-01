import assert from 'node:assert/strict';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const assets = fileURLToPath(
  new URL('../packages/web/dist/assets/', import.meta.url),
);
const files = (await readdir(assets)).filter((file) => file.endsWith('.js'));
assert.ok(files.length, 'Build @schdk/web before checking its bundle budget');
const sizes = await Promise.all(
  files.map(async (file) => ({
    file,
    bytes: (await stat(path.join(assets, file))).size,
  })),
);
const largest = sizes.sort((left, right) => right.bytes - left.bytes)[0];
const limit = 300 * 1024;
assert.ok(
  largest.bytes <= limit,
  `${largest.file} is ${largest.bytes} bytes; web chunks must stay within ${limit} bytes`,
);
const visualEditor = sizes.find(({ file }) => file.startsWith('VisualEditor-'));
const visualEditorLimit = 24 * 1024;
assert.ok(visualEditor, 'Visual editor must stay in its own lazy chunk');
assert.ok(
  visualEditor.bytes <= visualEditorLimit,
  `${visualEditor.file} is ${visualEditor.bytes} bytes; visual editor must stay within ${visualEditorLimit} bytes`,
);
console.log(`Largest web chunk: ${largest.file} (${largest.bytes} bytes)`);
console.log(
  `Visual editor chunk: ${visualEditor.file} (${visualEditor.bytes} bytes)`,
);
