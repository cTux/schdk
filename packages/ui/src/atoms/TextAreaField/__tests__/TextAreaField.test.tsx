import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { TextAreaField } from '..';

describe('TextAreaField', () => {
  it('composes validation and consumer classes', () => {
    const field = TextAreaField({
      className: 'question-text',
      invalid: true,
      label: 'Питання',
      value: '',
      onValueChange: () => undefined,
    });
    const children = field.props.children as ReactElement[];
    const textarea = children[children.length - 1] as ReactElement<{
      'aria-invalid': boolean;
      className?: string;
    }>;

    expect(textarea?.props.className).toMatchInlineSnapshot(
      `"question-text invalid"`,
    );
    expect(textarea?.props['aria-invalid']).toBe(true);
  });
});
