import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('host desktop preload', () => {
  it('uses CommonJS in the isolated renderer', () => {
    const electronDir = dirname(fileURLToPath(import.meta.url));

    expect(existsSync(join(electronDir, 'preload.cts'))).toBe(true);
    expect(readFileSync(join(electronDir, 'main.ts'), 'utf8')).toContain(
      "new URL('./preload.cjs', import.meta.url)",
    );
  });
});
