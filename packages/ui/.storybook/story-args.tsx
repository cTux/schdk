import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { LOCALIZATION_COPY } from '../src/localization';
import { DEFAULT_SCHDK_DICTIONARIES } from '@schdk/common';
import {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  DEFAULT_GAME_LAYOUT,
  DEFAULT_GAME_OPTIONS,
} from '../src/options/types';
import {
  aiOptions,
  aiQuestion,
  componentValues,
  confirm,
  customElement,
  gamePackage,
  gameQuestion,
  noop,
  position,
  questionDatabaseRows,
  recent,
} from './story-fixtures';

const booleans = new Set([
  'apiKeyConfigured',
  'canGoBack',
  'checked',
  'controlsDisabled',
  'danger',
  'disabled',
  'dragging',
  'dropTarget',
  'duplicate',
  'editable',
  'enabled',
  'entering',
  'failed',
  'finished',
  'fitTextToHeight',
  'globalFailed',
  'globalLoading',
  'hasPackage',
  'hasSummary',
  'hidden',
  'invalid',
  'isGlobalAdmin',
  'loading',
  'open',
  'opening',
  'optional',
  'pressed',
  'preview',
  'recentPackagesLoading',
  'selected',
  'showBackButton',
  'showTooltip',
  'showValidation',
]);
const numbers = new Set([
  'backgroundOpacity',
  'currentPartIndex',
  'index',
  'musicVolume',
  'questionCount',
  'questionNumber',
  'seconds',
  'selectedIndex',
  'value',
  'volume',
]);
const arrays = new Set([
  'answers',
  'customElements',
  'globalQuestions',
  'packages',
  'parts',
  'questions',
  'recentPackages',
  'templates',
]);
const callbacksReturningConfirmation = new Set([
  'onAdd',
  'onAddGlobal',
  'onDelete',
  'onRemove',
  'onRemoveGlobal',
  'onUpdate',
  'onUpdateGlobal',
]);

interface StoryEvent {
  args: unknown[];
  component: string;
  prop: string;
}

function recordStoryEvent(component: string, prop: string) {
  return (...args: unknown[]) => {
    const scope = globalThis as typeof globalThis & {
      __SCHDK_STORY_EVENTS__?: StoryEvent[];
    };
    (scope.__SCHDK_STORY_EVENTS__ ??= []).push({ args, component, prop });
  };
}

function getValue(component: string, prop: string): unknown {
  const componentValue = componentValues[component]?.[prop];
  if (componentValue !== undefined) return componentValue;
  if (prop === 'getPromptPreview') return () => 'System prompt\n\nUser prompt';
  if (prop === 'apiKeyConfigured') return true;
  if (component === 'AIQuestionForm' && prop === 'draft') return aiQuestion;
  const isCallbackProp =
    prop.startsWith('on') || prop === 'addElement' || prop === 'chooseImage';
  if (isCallbackProp) {
    if (component === 'VisualEditor') return recordStoryEvent(component, prop);
    if (prop === 'onGenerate') return async () => gameQuestion;
    if (callbacksReturningConfirmation.has(prop)) return confirm;
    return noop;
  }
  if (prop === 'pointerPosition') return () => ({ x: 50, y: 50 });
  if (prop === 'removeCustom' || prop.startsWith('update')) return noop;
  if (booleans.has(prop)) return prop === 'open';
  if (numbers.has(prop)) return prop === 'backgroundOpacity' ? 1 : 1;
  if (prop === 'difficulties' || prop === 'recognizabilities') {
    return DEFAULT_SCHDK_DICTIONARIES[prop === 'difficulties' ? 0 : 1].items;
  }
  if (arrays.has(prop)) {
    if (prop === 'questions' || prop === 'globalQuestions') return [aiQuestion];
    if (prop === 'templates') return [aiQuestion];
    if (prop === 'packages') {
      return [
        {
          name: 'Standard',
          context: 'Package context',
          questions: [],
          enabled: true,
          favorite: true,
        },
      ];
    }
    if (prop === 'parts') return ['Перша частина', 'Друга частина'];
    return [];
  }

  const values: Record<string, unknown> = {
    ai: aiOptions,
    aiGeneration: {
      apiKeyConfigured: true,
      difficulties: DEFAULT_SCHDK_DICTIONARIES[0].items,
      recognizabilities: DEFAULT_SCHDK_DICTIONARIES[1].items,
      templates: [aiQuestion],
      packages: [
        {
          name: 'Standard',
          context: 'Package context',
          questions: [],
          enabled: true,
          favorite: true,
        },
      ],
      onGenerate: async () => gameQuestion,
    },
    aiOptions,
    aiQuestions: {
      questions: [aiQuestion],
      globalQuestions: [aiQuestion],
      failed: false,
      globalFailed: false,
      loading: false,
      globalLoading: false,
      isGlobalAdmin: true,
      addQuestion: confirm,
      addGlobalQuestion: confirm,
      removeQuestion: confirm,
      removeGlobalQuestion: confirm,
      updateQuestion: confirm,
      updateGlobalQuestion: confirm,
    },
    backgroundImage: null,
    children: 'Storybook content',
    content: 'Storybook content',
    copy: LOCALIZATION_COPY.uk,
    details: {
      fileName: 'example.schdk',
      title: 'Приклад гри',
      roundCount: 3,
      questionCount: 36,
      handoutCount: 2,
    },
    editor: DEFAULT_EDITOR_TEXT_OPTIONS,
    editorApp: <div>Редактор</div>,
    editorOptions: DEFAULT_EDITOR_TEXT_OPTIONS,
    element: customElement,
    game: DEFAULT_GAME_OPTIONS,
    font: 'comfortable',
    gameOptions: DEFAULT_GAME_OPTIONS,
    gamePackage,
    googleDriveAccount: 'storybook@example.com',
    googleDriveState: 'connected',
    handout: { kind: 'text', text: 'Текст роздаткового матеріалу' },
    hostApp: <div>Проведення гри</div>,
    icon: faPlay,
    item: {
      id: 'host',
      icon: faPlay,
      label: 'Провести гру',
      description: 'Відкрити пакет і провести гру.',
    },
    labels: Object.fromEntries(
      Object.keys(DEFAULT_GAME_LAYOUT).map((id) => [id, id]),
    ),
    layout: DEFAULT_GAME_LAYOUT,
    legend: 'Варіанти відповідей',
    loadedViews: {
      home: true,
      questionDatabase: true,
      visualEditor: true,
      artificialIntelligence: true,
      packageRules: true,
      editor: true,
      host: true,
      options: true,
    },
    musicBreak: null,
    openingPackageId: null,
    openingRecentPackageId: null,
    options: aiOptions,
    packageDetails: null,
    position,
    preloading: false,
    question: gameQuestion,
    questionDatabaseRows,
    recent,
    remark: 'Коментар редактора',
    saveStatus: 'saved',
    selectedCustom: customElement,
    selectedPosition: position,
    selection: { kind: 'built-in', id: 'question' },
    settingsGroup: 'app',
    side: 'top',
    src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
    state: 'disconnected',
    status: 'saved',
    theme: 'dark',
    tooltipSide: 'top',
    trigger: <span>Наведи курсор</span>,
    variant: 'default',
    view: 'home',
  };

  return values[prop] ?? prop.replace(/([A-Z])/gu, ' $1').trim();
}

export function getStoryArgs(component: string, props: string[]) {
  const names = new Set(props);
  const extraProps: Record<string, string[]> = {
    Button: ['children', 'disabled', 'type', 'variant'],
    Checkbox: ['checked', 'disabled'],
    Dropdown: ['children', 'disabled', 'value'],
    FileButton: ['children', 'disabled'],
    Input: ['disabled', 'placeholder', 'value'],
    RangeInput: ['disabled', 'max', 'min', 'value'],
    Textarea: ['disabled', 'placeholder', 'value'],
  };
  extraProps[component]?.forEach((prop) => names.add(prop));

  return Object.fromEntries(
    [...names].map((prop) => [prop, getValue(component, prop)]),
  );
}
