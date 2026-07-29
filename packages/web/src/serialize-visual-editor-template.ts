import { type GameOptions } from '@schdk/ui/options';
import { strToU8, zipSync } from 'fflate';
import { VISUAL_TEMPLATE_ENTRY } from './visual-template-entry';

type VisualEditorTemplate = Omit<
  GameOptions,
  'autoFullscreen' | 'soundVolume' | 'musicVolume'
>;

export function serializeVisualEditorTemplate(
  options: GameOptions,
): Uint8Array {
  const template: VisualEditorTemplate & { version: 1 } = {
    version: 1,
    layout: options.layout,
    customElements: options.customElements,
    backgroundImage: options.backgroundImage,
    backgroundOpacity: options.backgroundOpacity,
  };
  return zipSync(
    {
      [VISUAL_TEMPLATE_ENTRY]: strToU8(JSON.stringify(template, null, 2)),
    },
    { level: 9 },
  );
}
