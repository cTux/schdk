import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('unified desktop preload', () => {
  it('stays self-contained for the sandboxed renderer', () => {
    const electronDir = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(electronDir, 'preload.cts'), 'utf8');

    expect(source).not.toMatch(/from ['"]\.\//u);
  });
});
