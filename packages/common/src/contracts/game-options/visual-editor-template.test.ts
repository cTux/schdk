import { zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GAME_LAYOUT,
  DEFAULT_GAME_OPTIONS,
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
  MAX_VISUAL_TEMPLATE_BYTES,
  VISUAL_TEMPLATE_ENTRY,
  normalizeGameOptions,
  parseVisualEditorTemplate,
  serializeVisualEditorTemplate,
} from '../../index.js';

describe('visual editor template contract', () => {
  it('round-trips presentation without replacing unrelated options', () => {
    const presentation = {
      ...DEFAULT_GAME_OPTIONS,
      layout: DEFAULT_GAME_LAYOUT,
      backgroundImage: 'data:image/png;base64,AA==',
      backgroundOpacity: 0.4,
      backgroundGradientFrom: '#101015',
      backgroundGradientTo: '#303048',
      backgroundGradientDirection: 45,
    };
    const unrelated = {
      autoFullscreen: false,
      soundVolume: 0.7,
      musicVolume: 0.3,
    };

    expect(
      parseVisualEditorTemplate(
        serializeVisualEditorTemplate(presentation),
        unrelated,
      ),
    ).toEqual({ ...presentation, ...unrelated });
  });

  it('rejects oversized archive entries before extraction', () => {
    const oversized = zipSync(
      {
        [VISUAL_TEMPLATE_ENTRY]: new Uint8Array(MAX_VISUAL_TEMPLATE_BYTES + 1),
      },
      { level: 9 },
    );

    expect(
      parseVisualEditorTemplate(oversized, DEFAULT_GAME_OPTIONS),
    ).toBeNull();
  });
});

describe('visual editor image contract', () => {
  it('accepts embedded images and rejects external or oversized payloads', () => {
    expect(
      normalizeGameOptions({
        ...DEFAULT_GAME_OPTIONS,
        backgroundImage: 'https://example.com/background.png',
      }),
    ).toBeNull();
    expect(
      normalizeGameOptions({
        ...DEFAULT_GAME_OPTIONS,
        backgroundImage: `data:image/png;base64,${'A'.repeat(MAX_CUSTOM_IMAGE_DATA_LENGTH)}`,
      }),
    ).toBeNull();
    expect(
      normalizeGameOptions({
        ...DEFAULT_GAME_OPTIONS,
        backgroundImage: 'data:image/png;base64,AA==',
      }),
    ).not.toBeNull();
    expect(
      normalizeGameOptions({
        ...DEFAULT_GAME_OPTIONS,
        customElements: [
          {
            id: 'image',
            kind: 'image',
            image: `data:image/png;base64,${'A'.repeat(MAX_CUSTOM_IMAGE_DATA_LENGTH)}`,
            position: DEFAULT_GAME_LAYOUT.handout,
          },
        ],
      }),
    ).toBeNull();
  });
});
