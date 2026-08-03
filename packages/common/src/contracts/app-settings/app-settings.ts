interface EditorTextOptions {
  correctQuestionText: boolean;
  correctAnswers: boolean;
  correctAnswerComment: boolean;
}

interface AiModelOption {
  id: string;
  name: string;
}

interface AiProviderOption {
  id: string;
  name: string;
  models: AiModelOption[];
}

interface AiOptions {
  providers: AiProviderOption[];
  provider: string;
  model: string;
  apiKeyConfigured: boolean;
}

type AppTheme = 'system' | 'light' | 'dark';
type AppFont = 'comfortable' | 'system' | 'verdana' | 'georgia';
type AppLocale = 'uk' | 'en';
type EditorNotice =
  | 'copied'
  | 'created'
  | 'deleted'
  | 'downloaded'
  | 'imported'
  | 'opened'
  | 'pasted'
  | 'saved';
const SETTINGS_GROUPS = ['app', 'schdk', 'artificialIntelligence'] as const;
type SettingsGroup = (typeof SETTINGS_GROUPS)[number];

const DEFAULT_EDITOR_TEXT_OPTIONS: EditorTextOptions = {
  correctQuestionText: false,
  correctAnswers: false,
  correctAnswerComment: false,
};

export {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  SETTINGS_GROUPS,
  type AiModelOption,
  type AiOptions,
  type AiProviderOption,
  type AppFont,
  type AppLocale,
  type AppTheme,
  type EditorTextOptions,
  type EditorNotice,
  type SettingsGroup,
};
