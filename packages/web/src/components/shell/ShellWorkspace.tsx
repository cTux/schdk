import '@schdk/ui/shell/styles';
import { TooltipProvider } from '@schdk/ui';
import { AsyncBoundary, AsyncLoading } from '@schdk/ui/shell';
import { ShellNavigation } from '@schdk/ui/shell/navigation';
import { lazy, Suspense } from 'react';
import type { ShellWorkspaceProps } from './shell-workspace-props';

const ShellHome = lazy(() =>
  import('@schdk/ui/shell/home').then(({ ShellHome }) => ({
    default: ShellHome,
  })),
);
const QuestionDatabasePage = lazy(() =>
  import('@schdk/ui/shell/question-database').then(
    ({ QuestionDatabasePage }) => ({
      default: QuestionDatabasePage,
    }),
  ),
);
const OptionsPage = lazy(() =>
  import('@schdk/ui/options/page').then(({ OptionsPage }) => ({
    default: OptionsPage,
  })),
);
const VisualEditor = lazy(() =>
  import('@schdk/ui/visual-editor').then(({ VisualEditor }) => ({
    default: VisualEditor,
  })),
);
const AIQuestionsPage = lazy(() =>
  import('@schdk/ui/shell/ai-questions').then(({ AIQuestionsPage }) => ({
    default: AIQuestionsPage,
  })),
);
const AIQuestionsPackagesPage = lazy(() =>
  import('@schdk/ui/shell/ai-question-packages').then(
    ({ AIQuestionsPackagesPage }) => ({
      default: AIQuestionsPackagesPage,
    }),
  ),
);
const DictionariesPage = lazy(() =>
  import('@schdk/ui/shell/dictionaries').then(({ DictionariesPage }) => ({
    default: DictionariesPage,
  })),
);
const SIDEBAR_COLLAPSED_KEY = 'schdk.shell.sidebar-collapsed';

export function ShellWorkspace({
  apps,
  data,
  navigation,
  settings,
}: ShellWorkspaceProps) {
  const { editTarget, loadedViews, view } = navigation;
  return (
    <TooltipProvider>
      <main className="app-shell" data-theme={settings.theme}>
        <ShellNavigation
          initialCollapsed={
            localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
          }
          preloading={data.preloading}
          view={view}
          onCollapsedChange={(collapsed) =>
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
          }
          onSelect={navigation.showView}
        />
        <section className="workspace">
          <AsyncBoundary onRetry={() => window.location.reload()}>
            <Suspense fallback={<AsyncLoading />}>
              {loadedViews.home && (
                <ShellHome
                  hidden={view !== 'home'}
                  onOpen={navigation.showView}
                />
              )}
              {loadedViews.questionDatabase && (
                <QuestionDatabasePage
                  {...data.questionDatabase}
                  hidden={view !== 'questionDatabase'}
                  onBack={() => navigation.showView('home')}
                />
              )}
              {loadedViews.options && (
                <OptionsPage
                  {...settings.options}
                  hidden={view !== 'options'}
                  onBack={() => navigation.showView('home')}
                />
              )}
              {loadedViews.visualEditor && (
                <VisualEditor
                  {...settings.visualEditor}
                  hidden={view !== 'visualEditor'}
                />
              )}
              {loadedViews.artificialIntelligence && (
                <AIQuestionsPage
                  {...data.aiQuestions}
                  hidden={view !== 'artificialIntelligence'}
                  editTarget={
                    editTarget?.kind === 'question' ? editTarget : null
                  }
                  onBack={() => navigation.showView('home')}
                  onCloseEditor={navigation.closeEditor}
                  onShowEditor={navigation.showEditor}
                />
              )}
              {loadedViews.packageRules && (
                <AIQuestionsPackagesPage
                  {...data.aiQuestionPackages}
                  hidden={view !== 'packageRules'}
                  editTarget={
                    editTarget?.kind === 'package' ? editTarget : null
                  }
                  onBack={() => navigation.showView('home')}
                  onCloseEditor={navigation.closeEditor}
                  onShowEditor={navigation.showEditor}
                />
              )}
              {loadedViews.dictionaries && (
                <DictionariesPage
                  {...data.dictionaries}
                  editId={
                    editTarget?.kind === 'dictionary' ? editTarget.id : null
                  }
                  hidden={view !== 'dictionaries'}
                  onBack={() => navigation.showView('home')}
                  onCloseEditor={navigation.closeEditor}
                  onShowEditor={(id) =>
                    navigation.showEditor({ kind: 'dictionary', id })
                  }
                />
              )}
              {loadedViews.host && (
                <div className="embedded-app" hidden={view !== 'host'}>
                  {apps.host}
                </div>
              )}
              {loadedViews.editor && (
                <div className="embedded-app" hidden={view !== 'editor'}>
                  {apps.editor}
                </div>
              )}
            </Suspense>
          </AsyncBoundary>
        </section>
      </main>
    </TooltipProvider>
  );
}
