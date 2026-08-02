import { type EditorTextOptions } from './editor-text-options';
import { type AiModelOption } from './ai-model-option';
import { type AiProviderOption } from './ai-provider-option';
import { type AiOptions } from './ai-options';
import { type AppTheme } from './app-theme';
import { type AppFont } from './app-font';
import { type SettingsGroup } from './settings-group';
import { DEFAULT_EDITOR_TEXT_OPTIONS } from './default-editor-text-options';
import {
  DEFAULT_GAME_LAYOUT,
  DEFAULT_GAME_OPTIONS,
  GAME_IMAGE_POSITIONS,
  GAME_LAYOUT_ELEMENT_IDS,
  MAX_CUSTOM_GAME_ELEMENTS,
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
  getDefaultCustomElementPosition,
  type CustomGameElement,
  type CustomImageElement,
  type CustomTextElement,
  type GameImagePosition,
  type GameLayout,
  type GameLayoutElementId,
  type GameLayoutPosition,
  type GameOptions,
  type GamePresentationOptions,
  type GameTextGrowDirection,
} from '@schdk/common';

const SETTINGS_GROUPS = ['app', 'schdk', 'artificialIntelligence'] as const;

export {
  type EditorTextOptions,
  type AiModelOption,
  type AiProviderOption,
  type AiOptions,
  type AppTheme,
  type AppFont,
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
  type GamePresentationOptions,
  DEFAULT_EDITOR_TEXT_OPTIONS,
  DEFAULT_GAME_OPTIONS,
  DEFAULT_GAME_LAYOUT,
  getDefaultCustomElementPosition,
};
