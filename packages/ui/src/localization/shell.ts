import { aiPackageRulesCopy } from './ai-package-rules';
import { questionDatabaseCopy } from './question-database';

const shellCopy = {
  en: {
    brand: 'What? Where? When?',
    toolsLabel: 'Tools',
    settingsLabel: 'Settings',
    collapseLabel: 'Collapse navigation',
    expandLabel: 'Expand navigation',
    preloading: 'Loading Google Drive data',
    moduleLoading: 'Loading…',
    moduleLoadFailed: 'This section could not be loaded.',
    retry: 'Reload',
    loginTitle: 'SCHDK',
    loginDescription:
      'Create, edit, and host What? Where? When? question packages with Google Drive autosave and optional AI-assisted authoring.',
    loginAction: 'Continue with Google',
    privacyPolicy: 'Privacy policy',
    homeTitle: 'Getting started',
    homeDescription:
      'Follow the tools in order: prepare questions and visuals, assemble a package, then host the game.',
    home: {
      label: 'Getting started',
      description:
        'The preparation and hosting workflow in chronological order.',
    },
    host: {
      label: 'Host a game',
      description: 'Open a ready package and host a game for teams.',
    },
    editor: {
      label: 'Edit question packages',
      description: 'Create and edit question packages in the .schdk format.',
    },
    visualEditor: {
      label: 'Visual editor',
      description: 'Create a custom layout for the game screen.',
    },
    artificialIntelligence: {
      label: 'Artificial intelligence',
      description: 'Configure question-generation rules.',
    },
    packageRules: {
      label: aiPackageRulesCopy.en.navigationLabel,
      description: aiPackageRulesCopy.en.navigationDescription,
    },
    dictionaries: {
      label: 'Technical term dictionaries',
      description: 'Edit shared question-generation values.',
    },
    questionDatabase: questionDatabaseCopy.en.navigation,
  },
  uk: {
    brand: 'Що? Де? Коли?',
    toolsLabel: 'Інструменти',
    settingsLabel: 'Налаштування',
    collapseLabel: 'Згорнути навігацію',
    expandLabel: 'Розгорнути навігацію',
    preloading: 'Завантаження даних із Google Диска',
    moduleLoading: 'Завантаження…',
    moduleLoadFailed: 'Не вдалося завантажити цей розділ.',
    retry: 'Перезавантажити',
    loginTitle: 'SCHDK',
    loginDescription:
      'Створюйте, редагуйте та проводьте ігри «Що? Де? Коли?» з автозбереженням на Google Диску та необов’язковими інструментами ШІ.',
    loginAction: 'Продовжити з Google',
    privacyPolicy: 'Політика конфіденційності',
    homeTitle: 'З чого почати?',
    homeDescription:
      'Рухайтеся інструментами за порядком: підготуйте питання й оформлення, зберіть пакет, а потім проведіть гру.',
    home: {
      label: 'З чого почати?',
      description: 'Послідовність підготовки та проведення гри.',
    },
    host: {
      label: 'Провести гру',
      description: 'Запускайте готовий пакет і проводьте гру для команд.',
    },
    editor: {
      label: 'Редагувати пакети питань',
      description: 'Створюйте та редагуйте пакети запитань у форматі .schdk.',
    },
    visualEditor: {
      label: 'Візуальний редактор',
      description: 'Створюйте власний макет екрана проведення гри.',
    },
    artificialIntelligence: {
      label: 'Правила створення питань',
      description: 'Налаштовуйте правила створення запитань.',
    },
    packageRules: {
      label: aiPackageRulesCopy.uk.navigationLabel,
      description: aiPackageRulesCopy.uk.navigationDescription,
    },
    dictionaries: {
      label: 'Словники технічних термінів',
      description: 'Редагуйте спільні значення генерації питань.',
    },
    questionDatabase: questionDatabaseCopy.uk.navigation,
  },
};

export { shellCopy };
