import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';

const moduleExtensions = [
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
];

async function listModules(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const url = new URL(entry.name, directory);
      return entry.isDirectory()
        ? listModules(new URL(`${entry.name}/`, directory))
        : moduleExtensions.some((extension) => entry.name.endsWith(extension))
          ? [url]
          : [];
    }),
  );
  return files.flat();
}

function resolveImport(importer, specifier, modules) {
  const target = new URL(specifier, importer);
  const extension = moduleExtensions.find((item) =>
    target.pathname.endsWith(item),
  );
  const base = extension
    ? target.href.slice(0, -extension.length)
    : target.href;
  const candidates = extension
    ? moduleExtensions.map((item) => `${base}${item}`)
    : moduleExtensions
        .map((item) => `${target.href}${item}`)
        .concat(moduleExtensions.map((item) => `${target.href}/index${item}`));
  return candidates.find(
    (candidate) => modules.has(candidate) && existsSync(new URL(candidate)),
  );
}

function getRuntimeSpecifiers(source) {
  const specifiers = [];
  for (const match of source.matchAll(
    /(?:import|export)\s+([^;]*?)\s+from\s*["'](\.[^"']+)["']/gu,
  )) {
    const clause = match[1].trim();
    const named = clause.match(/^\{([\s\S]*)\}$/u);
    const isTypeOnly =
      clause.startsWith('type ') ||
      (named &&
        named[1]
          .split(',')
          .filter(Boolean)
          .every((item) => item.trim().startsWith('type ')));
    if (!isTypeOnly) specifiers.push(match[2]);
  }
  for (const match of source.matchAll(
    /import\s*(?:\(\s*)?["'](\.[^"']+)["']/gu,
  )) {
    specifiers.push(match[1]);
  }
  return specifiers;
}

async function findImportCycles(sourceDirectories) {
  const files = (await Promise.all(sourceDirectories.map(listModules))).flat();
  const modules = new Set(files.map(({ href }) => href));
  const graph = new Map();
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const dependencies = getRuntimeSpecifiers(source)
      .map((specifier) => resolveImport(file, specifier, modules))
      .filter(Boolean);
    graph.set(file.href, dependencies);
  }

  const state = new Map();
  const stack = [];
  const cycles = [];
  function visit(module) {
    if (state.get(module) === 1) {
      cycles.push([...stack.slice(stack.indexOf(module)), module]);
      return;
    }
    if (state.get(module) === 2) return;
    state.set(module, 1);
    stack.push(module);
    for (const dependency of graph.get(module) ?? []) visit(dependency);
    stack.pop();
    state.set(module, 2);
  }
  for (const module of graph.keys()) visit(module);
  return cycles;
}

export { findImportCycles };
