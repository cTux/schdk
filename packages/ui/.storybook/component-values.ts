import { DEFAULT_GAME_OPTIONS } from '../src/options/types';
import { gameQuestion } from './game-question';
import { aiQuestion } from './ai-question';
import { gamePackage } from './story-fixtures';
import { questionDatabaseRows } from './question-database-rows';

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
  EditorView: {
    gamePackage,
    hasPackage: true,
    selectedIndex: 1,
  },
  PackageGenerationOptions: {
    activePackages: [
      {
        name: 'Улюблений пакет',
        context: 'Улюблений контекст',
        questions: [],
        enabled: true,
        favorite: true,
      },
      {
        name: 'Звичайний пакет',
        context: 'Звичайний контекст',
        questions: [],
        enabled: true,
        favorite: false,
      },
    ],
    canGenerate: true,
    difficulty: 'medium',
    recognizability: 'medium',
    hasRandomTemplates: true,
    progress: [3, 36],
    ruleSet: 'all',
    scope: 'missing',
    selected: 0,
    targetsMissing: true,
    thinking: false,
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
    questionDatabase: {
      failed: false,
      loading: false,
      progress: { current: 1, total: 1 },
      rows: questionDatabaseRows,
    },
    googleDriveAccount: {
      displayName: 'Storybook',
      emailAddress: 'storybook@example.com',
    },
  },
  QuestionDatabasePage: {
    failed: false,
    loading: false,
    progress: { current: 1, total: 1 },
    rows: questionDatabaseRows,
  },
  VisualEditorToolbar: {
    selected: { kind: 'built-in', id: 'question' },
  },
};
