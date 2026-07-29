import { type EditorTextOptions } from './editor-text-options';
import { type AiModelOption } from './ai-model-option';
import { type AiProviderOption } from './ai-provider-option';
import { type AiOptions } from './ai-options';
import { type AppTheme } from './app-theme';
import { type SettingsGroup } from './settings-group';
import { GAME_LAYOUT_ELEMENT_IDS } from './game-layout-element-ids';
import { type GameLayoutElementId } from './game-layout-element-id';
import { GAME_IMAGE_POSITIONS } from './game-image-positions';
import { type GameImagePosition } from './game-image-position';
import { type GameTextGrowDirection } from './game-text-grow-direction';
import { type GameLayoutPosition } from './game-layout-position';
import { type GameLayout } from './game-layout';
import { type CustomTextElement } from './custom-text-element';
import { type CustomImageElement } from './custom-image-element';
import { type CustomGameElement } from './custom-game-element';
import { MAX_CUSTOM_GAME_ELEMENTS } from './max-custom-game-elements';
import { MAX_CUSTOM_IMAGE_DATA_LENGTH } from './max-custom-image-data-length';
import { type GameOptions } from './game-options';
import { DEFAULT_EDITOR_TEXT_OPTIONS } from './default-editor-text-options';
import { DEFAULT_GAME_OPTIONS } from './default-game-options';
import { DEFAULT_GAME_LAYOUT } from './default-game-layout';
import { getDefaultCustomElementPosition } from './get-default-custom-element-position';

const SETTINGS_GROUPS = ['app', 'schdk', 'artificialIntelligence'] as const;

export {
  type EditorTextOptions,
  type AiModelOption,
  type AiProviderOption,
  type AiOptions,
  type AppTheme,
  SETTINGS_GROUPS,
  type SettingsGroup,
  GAME_LAYOUT_ELEMENT_IDS,
  type GameLayoutElementId,
  GAME_IMAGE_POSITIONS,
  type GameImagePosition,
  type GameTextGrowDirection,
  type GameLayoutPosition,
  type GameLayout,
  type CustomTextElement,
  type CustomImageElement,
  type CustomGameElement,
  MAX_CUSTOM_GAME_ELEMENTS,
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
  type GameOptions,
  DEFAULT_EDITOR_TEXT_OPTIONS,
  DEFAULT_GAME_OPTIONS,
  DEFAULT_GAME_LAYOUT,
  getDefaultCustomElementPosition,
};
