import { aiPackageRulesCopy } from './ai-package-rules';
import { questionDatabaseCopy } from './question-database';

const shellCopy = {
  en: {
    brand: 'What? Where? When?',
    toolsLabel: 'Tools',
    groupLabel: 'WWW',
    settingsLabel: 'Settings',
    preloading: 'Loading Google Drive data',
    loginTitle: 'SCHDK',
    loginDescription:
      'Create, edit, and host What? Where? When? question packages with Google Drive autosave and optional AI-assisted authoring.',
    loginAction: 'Continue with Google',
    privacyPolicy: 'Privacy policy',
    homeTitle: 'Everything for the game in one place',
    homeDescription:
      'Set up the layout in the visual editor, then create a question package, then start the game.',
    home: {
      label: 'Home',
      description: 'Tools for preparing and hosting a game.',
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
    groupLabel: 'ЩДК',
    settingsLabel: 'Налаштування',
    preloading: 'Завантаження даних із Google Диска',
    loginTitle: 'SCHDK',
    loginDescription:
      'Створюйте, редагуйте та проводьте ігри «Що? Де? Коли?» з автозбереженням на Google Диску та необов’язковими інструментами ШІ.',
    loginAction: 'Продовжити з Google',
    privacyPolicy: 'Політика конфіденційності',
    homeTitle: 'Усе для гри в одному місці',
    homeDescription:
      'Налаштуйте макет у візуальному редакторі, потім створіть пакет питань, потім розпочніть гру.',
    home: {
      label: 'Домашня',
      description: 'Огляд інструментів для підготовки та проведення гри.',
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
