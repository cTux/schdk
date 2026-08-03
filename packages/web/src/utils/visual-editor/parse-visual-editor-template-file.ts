import {
  MAX_VISUAL_TEMPLATE_BYTES,
  parseVisualEditorTemplate,
} from '@schdk/common/visual-editor-template';
import type { GameOptions } from '@schdk/common/game-options';

export async function parseVisualEditorTemplateFile(
  file: File,
  options: Pick<GameOptions, 'autoFullscreen' | 'soundVolume' | 'musicVolume'>,
): Promise<GameOptions | null> {
  const content = await file
    .slice(0, MAX_VISUAL_TEMPLATE_BYTES + 1)
    .arrayBuffer();
  return await parseVisualEditorTemplate(new Uint8Array(content), options);
}
