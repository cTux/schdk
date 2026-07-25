import { describe, expect, it } from 'vitest';
import { SaveStatus } from '..';

describe('SaveStatus', () => {
  it('combines the base and state classes', () => {
    expect(
      SaveStatus({ status: 'saving' }).props.className,
    ).toMatchInlineSnapshot(`"save-status saving"`);
  });
});
