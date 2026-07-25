import { describe, expect, it } from 'vitest';
import { Button } from '..';

describe('Button', () => {
  it('composes variant and consumer classes', () => {
    expect(
      Button({ variant: 'primary', className: 'wide' }).props.className,
    ).toMatchInlineSnapshot(`"ui-button primary wide"`);
    expect(Button({}).props.className).toBe('ui-button');
  });
});
