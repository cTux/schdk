import {
  createEmptyGamePackage,
  createEmptyGameQuestion,
  type AIQuestion,
} from '@schdk/common';
import {
  DEFAULT_GAME_LAYOUT,
  DEFAULT_GAME_OPTIONS,
} from '../src/options/types';

export const gamePackage = createEmptyGamePackage();
export const gameQuestion = {
  ...createEmptyGameQuestion(),
  questionParts: ['Яке питання показати?'],
  answer: 'Приклад відповіді',
  alternativeAnswers: ['Альтернатива'],
};
export const aiQuestion: AIQuestion = {
  name: 'Логічне питання',
  description: 'Створюй короткі питання з однозначною відповіддю.',
  goodExamples: 'Питання з непрямою підказкою.',
  badExamples: 'Питання, що прямо називає відповідь.',
  enabled: true,
  favorite: false,
  generalRule: false,
};
export const position = DEFAULT_GAME_LAYOUT.question;
export const customElement = {
  id: 'story-element',
  kind: 'text' as const,
  text: 'Власний елемент',
  position,
};
const hostGame = {
  question: gameQuestion,
  questionNumber: 1,
  questionCount: 36,
  currentQuestionPartIndex: 0,
  currentStage: 'question' as const,
  visibleStages: ['question', 'timer'] as const,
  remainingSeconds: 42,
  transition: {
    phase: 'idle' as const,
    direction: 'forward' as const,
    questionChanging: false,
  },
  controlsDisabled: false,
  canGoBack: true,
  musicBreak: null,
  musicVolume: 0.05,
};
export const aiOptions = {
  providers: [
    {
      id: 'openai',
      name: 'OpenAI',
      models: [{ id: 'gpt-5', name: 'GPT-5' }],
    },
  ],
  provider: 'openai',
  model: 'gpt-5',
  apiKeyConfigured: true,
};
export const recent = {
  id: 'story-package',
  name: 'example.schdk',
  title: 'Приклад гри',
  ready: true,
};
export const noop = () => undefined;
export const confirm = async () => true;

export const componentValues: Record<string, Record<string, unknown>> = {
  AIQuestionCard: { question: aiQuestion },
  AIQuestionCollection: { questions: [aiQuestion] },
  AIQuestionsPage: {
    questions: [aiQuestion],
    globalQuestions: [aiQuestion],
  },
  AIQuestionsPackageContexts: {
    questionRules: [aiQuestion],
    value: [
      { questionNumber: 11, context: 'Футбольне питання' },
      { questionNumber: 2, context: 'Питання про Київ' },
    ],
  },
  GameMusicBreak: {
    musicBreak: {
      name: 'Музична пауза',
      mimeType: 'audio/mpeg',
      data: new Uint8Array(),
    },
  },
  GameWizard: { game: hostGame },
  HostView: { game: null },
  MusicBreakField: { musicBreak: null },
  ShellView: {
    game: DEFAULT_GAME_OPTIONS,
    googleDriveAccount: {
      displayName: 'Storybook',
      emailAddress: 'storybook@example.com',
    },
  },
  VisualEditorToolbar: {
    selected: { kind: 'built-in', id: 'question' },
  },
};
