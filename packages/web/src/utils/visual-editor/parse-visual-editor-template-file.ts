import { type GameOptions } from '@schdk/common';
import { MAX_VISUAL_TEMPLATE_BYTES } from '../../storage/options/game-options-storage';
import { parseVisualEditorTemplate } from './parse-visual-editor-template';

export async function parseVisualEditorTemplateFile(
  file: File,
  options: Pick<GameOptions, 'autoFullscreen' | 'soundVolume' | 'musicVolume'>,
): Promise<GameOptions | null> {
  const content = await file
    .slice(0, MAX_VISUAL_TEMPLATE_BYTES + 1)
    .arrayBuffer();
  return parseVisualEditorTemplate(new Uint8Array(content), options);
}
