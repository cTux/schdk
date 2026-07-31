import { loadGameOptions } from './load-game-options';
import { parseVisualEditorTemplate } from '../../utils/visual-editor/parse-visual-editor-template';
import { parseVisualEditorTemplateFile } from '../../utils/visual-editor/parse-visual-editor-template-file';
import { serializeVisualEditorTemplate } from '../../utils/visual-editor/serialize-visual-editor-template';
import { saveGameOptions } from './save-game-options';

const MAX_VISUAL_TEMPLATE_BYTES = 16 * 1024 * 1024;

export {
  MAX_VISUAL_TEMPLATE_BYTES,
  loadGameOptions,
  parseVisualEditorTemplate,
  parseVisualEditorTemplateFile,
  serializeVisualEditorTemplate,
  saveGameOptions,
};
