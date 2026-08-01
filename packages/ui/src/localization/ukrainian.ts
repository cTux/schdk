import { ukrainianSettings } from './ukrainian-settings';
import { aiQuestionsCopy, questionGenerationCopy } from './ai-questions';
import { aiPackageRulesCopy } from './ai-package-rules';
import { packageGenerationCopy } from './package-generation';
import { ukrainianAllWeb, ukrainianMeta } from './ukrainian-misc';
import { questionDatabaseCopy } from './question-database';
import { shellCopy } from './shell';
import { dictionariesCopy } from './dictionaries';
import { editorCopy } from './editor';
import { visualEditorCopy } from './visual-editor';
export const ukrainian = {
  shared: {
    confirmation: 'Підтвердження дії',
    confirm: 'Підтвердити',
    cancel: 'Скасувати',
    optional: '(необов’язково)',
    remove: 'Видалити',
    chooseFile: 'Вибрати файл',
    or: 'або',
    recentPackages: 'Недавні пакети',
    downloadPackage: 'Завантажити пакет',
    deletePackage: 'Видалити пакет із хмари',
    deletePackageConfirmation: (name: string) =>
      `Перемістити «${name}» у кошик Google Диска?`,
    deletePackageFailed: 'Не вдалося видалити пакет із Google Диска.',
    ready: 'Готовий',
    untitled: 'Без назви',
    question: 'Питання',
    questionNumber: (number: number) => `Питання ${number}`,
    answer: 'Відповідь',
    answerComment: 'Коментар до відповіді',
    handout: 'Роздатка',
    back: 'Назад',
    image: 'Зображення',
    close: 'Закрити',
    zoomOut: 'Зменшити',
    zoomIn: 'Збільшити',
  },
  meta: ukrainianMeta,
  shell: shellCopy.uk,
  dictionaries: dictionariesCopy.uk,
  questionDatabase: questionDatabaseCopy.uk,
  aiQuestions: aiQuestionsCopy.uk,
  aiPackageRules: aiPackageRulesCopy.uk,
  questionGeneration: questionGenerationCopy.uk,
  packageGeneration: packageGenerationCopy.uk,
  settings: ukrainianSettings,
  editor: editorCopy.uk,
  host: {
    eyebrow: 'Проведення гри',
    title: 'Провести гру',
    packageReady: 'Пакет готовий',
    tours: 'Турів',
    questions: 'Питань',
    handouts: 'Роздаткових матеріалів',
    hiddenContent:
      'Питання та відповіді залишаються прихованими до початку гри.',
    back: 'Повернутися назад',
    start: 'Почати гру',
    gameProgress: 'Прогрес гри',
    questionIntro: (number: number) => `Питання №${number}`,
    tour: (number: number) => `Тур ${number}`,
    musicBreak: 'Музична пауза',
    handoutAlt: 'Роздатковий матеріал',
    controls: 'Керування станами питання',
    previousStage: 'Попередній стан',
    nextStage: 'Наступний стан',
    previousStageKeys: '← · PgUp · Backspace',
    nextStageKeys: 'Пробіл · PgDn · →',
    game: 'Проведення гри',
    finished: 'Дякуємо за гру!',
    returnToGames: 'Повернутися до ігор',
    exitGameConfirmation:
      'Вийти з гри? Поточний прогрес проведення буде скинуто.',
    restoreFailed:
      'Не вдалося відновити попередню гру. Можливо, файл переміщено або видалено.',
    invalidFile:
      'Не вдалося відкрити файл: пакет має неправильний формат або ще не готовий до гри.',
    uploadFailed: 'Не вдалося вивантажити файл на Google Диск.',
    downloadFailed: 'Не вдалося завантажити файл із Google Диска.',
    recentOpenFailed:
      'Не вдалося відкрити недавній файл. Можливо, його переміщено, видалено або пакет ще не готовий до гри.',
  },
  visualEditor: visualEditorCopy.uk,
  allWeb: ukrainianAllWeb,
};
