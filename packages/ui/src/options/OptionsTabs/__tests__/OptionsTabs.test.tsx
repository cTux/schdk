import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { OptionsTabs } from '..';

describe('OptionsTabs', () => {
  it('keeps the tab group classes and marks the selected tab', () => {
    const tabs = OptionsTabs({
      selected: 'editor',
      onSelect: () => undefined,
    });
    const buttons = tabs.props.children as ReactElement<{
      className: string;
    }>[];

    expect(tabs.props.className).toMatchInlineSnapshot(
      `"options-tabs options-secondary-tabs"`,
    );
    expect(buttons.map((button) => button.props.className))
      .toMatchInlineSnapshot(`
        [
          "",
          "active",
        ]
      `);
  });
});
