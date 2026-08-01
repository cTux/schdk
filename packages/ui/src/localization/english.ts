import { ukrainian } from './ukrainian';
import { englishSettings } from './english-settings';
import { aiQuestionsCopy, questionGenerationCopy } from './ai-questions';
import { aiPackageRulesCopy } from './ai-package-rules';
import { packageGenerationCopy } from './package-generation';
import { englishAllWeb, englishMeta } from './english-misc';
import { questionDatabaseCopy } from './question-database';
import { shellCopy } from './shell';
import { dictionariesCopy } from './dictionaries';
import { editorCopy } from './editor';
import { visualEditorCopy } from './visual-editor';
export const english: typeof ukrainian = {
  shared: {
    confirmation: 'Confirm action',
    confirm: 'Confirm',
    cancel: 'Cancel',
    optional: '(optional)',
    remove: 'Remove',
    chooseFile: 'Choose file',
    or: 'or',
    recentPackages: 'Recent packages',
    downloadPackage: 'Download package',
    deletePackage: 'Delete package from the cloud',
    deletePackageConfirmation: (name) =>
      `Move “${name}” to Google Drive trash?`,
    deletePackageFailed: 'Could not delete the package from Google Drive.',
    ready: 'Ready',
    untitled: 'Untitled',
    question: 'Question',
    questionNumber: (number) => `Question ${number}`,
    answer: 'Answer',
    answerComment: 'Answer comment',
    handout: 'Handout',
    back: 'Back',
    image: 'Image',
    close: 'Close',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
  },
  meta: englishMeta,
  shell: shellCopy.en,
  dictionaries: dictionariesCopy.en,
  questionDatabase: questionDatabaseCopy.en,
  aiQuestions: aiQuestionsCopy.en,
  aiPackageRules: aiPackageRulesCopy.en,
  questionGeneration: questionGenerationCopy.en,
  packageGeneration: packageGenerationCopy.en,
  settings: englishSettings,
  editor: editorCopy.en,
  host: {
    eyebrow: 'Game hosting',
    title: 'Host a game',
    packageReady: 'Package ready',
    tours: 'Tours',
    questions: 'Questions',
    handouts: 'Handouts',
    hiddenContent: 'Questions and answers stay hidden until the game begins.',
    back: 'Go back',
    start: 'Start game',
    gameProgress: 'Game progress',
    questionIntro: (number) => `Question #${number}`,
    tour: (number) => `Tour ${number}`,
    musicBreak: 'Music break',
    handoutAlt: 'Handout material',
    controls: 'Question stage controls',
    previousStage: 'Previous stage',
    nextStage: 'Next stage',
    previousStageKeys: '← · PgUp · Backspace',
    nextStageKeys: 'Space · PgDn · →',
    game: 'Game hosting',
    finished: 'Thank you for playing!',
    returnToGames: 'Return to games',
    exitGameConfirmation:
      'Exit the game? The current hosting progress will be reset.',
    restoreFailed:
      'Could not restore the previous game. The file may have been moved or deleted.',
    invalidFile:
      'Could not open the file because the package is invalid or not ready to play.',
    uploadFailed: 'Could not upload the file to Google Drive.',
    downloadFailed: 'Could not download the file from Google Drive.',
    recentOpenFailed:
      'Could not open the recent file. It may have been moved, deleted, or may not be ready to play.',
  },
  visualEditor: visualEditorCopy.en,
  allWeb: englishAllWeb,
};
