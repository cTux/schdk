import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { LOCALIZATION_COPY } from '../src/localization';
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
  recent,
} from './story-fixtures';

const booleans = new Set([
  'apiKeyConfigured',
  'canGoBack',
  'checked',
  'connected',
  'controlsDisabled',
  'danger',
  'disabled',
  'dragging',
  'dropTarget',
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

function getValue(component: string, prop: string): unknown {
  const componentValue = componentValues[component]?.[prop];
  if (componentValue !== undefined) return componentValue;
  if (
    prop.startsWith('on') ||
    prop === 'addElement' ||
    prop === 'chooseImage'
  ) {
    if (prop === 'onGenerate') return async () => gameQuestion;
    if (callbacksReturningConfirmation.has(prop)) return confirm;
    return noop;
  }
  if (prop === 'pointerPosition') return () => ({ x: 50, y: 50 });
  if (prop === 'removeCustom' || prop.startsWith('update')) return noop;
  if (booleans.has(prop)) return prop === 'open';
  if (numbers.has(prop)) return prop === 'backgroundOpacity' ? 1 : 1;
  if (arrays.has(prop)) {
    if (prop === 'questions' || prop === 'globalQuestions') return [aiQuestion];
    if (prop === 'templates') return [aiQuestion];
    if (prop === 'parts') return ['Перша частина', 'Друга частина'];
    return [];
  }

  const values: Record<string, unknown> = {
    account: {
      displayName: 'Storybook',
      emailAddress: 'storybook@example.com',
    },
    ai: aiOptions,
    aiGeneration: {
      apiKeyConfigured: true,
      templates: [aiQuestion],
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
    loadedApps: { host: true, editor: true },
    musicBreak: null,
    openingPackageId: null,
    openingRecentPackageId: null,
    options: aiOptions,
    packageDetails: null,
    position,
    question: gameQuestion,
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
