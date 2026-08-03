import type { ReactNode } from 'react';
import type { AppTheme } from '@schdk/common/app-settings';
import type { OptionsPageProps } from '@schdk/ui/options/page';
import type { VisualEditorProps } from '@schdk/ui/visual-editor';
import type { QuestionDatabasePageProps } from '@schdk/ui/shell/question-database';
import type { AIQuestionsPageProps } from '@schdk/ui/shell/ai-questions';
import type { AIQuestionsPackagesPageProps } from '@schdk/ui/shell/ai-question-packages';
import type { DictionariesPageProps } from '@schdk/ui/shell/dictionaries';
import type { useShellNavigation } from '../../hooks/shell/use-shell-navigation';

export interface ShellWorkspaceProps {
  apps: { editor: ReactNode; host: ReactNode };
  data: {
    preloading: boolean;
    questionDatabase: Omit<QuestionDatabasePageProps, 'hidden' | 'onBack'>;
    aiQuestions: Omit<
      AIQuestionsPageProps,
      'hidden' | 'editTarget' | 'onBack' | 'onCloseEditor' | 'onShowEditor'
    >;
    aiQuestionPackages: Omit<
      AIQuestionsPackagesPageProps,
      'hidden' | 'editTarget' | 'onBack' | 'onCloseEditor' | 'onShowEditor'
    >;
    dictionaries: Omit<
      DictionariesPageProps,
      'hidden' | 'editId' | 'onBack' | 'onCloseEditor' | 'onShowEditor'
    >;
  };
  navigation: ReturnType<typeof useShellNavigation>;
  settings: {
    theme: AppTheme;
    options: Omit<OptionsPageProps, 'hidden' | 'onBack'>;
    visualEditor: Omit<VisualEditorProps, 'hidden'>;
  };
}
