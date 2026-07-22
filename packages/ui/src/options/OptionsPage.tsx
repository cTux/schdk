import { useState } from 'react';
import { OptionToggle } from './OptionToggle';
import { OptionsTabs, type OptionsTab } from './OptionsTabs';
import type { EditorTextOptions } from './types';

interface OptionsPageProps {
  editor: EditorTextOptions;
  hidden: boolean;
  onEditorChange(options: EditorTextOptions): void;
}

export function OptionsPage({
  editor,
  hidden,
  onEditorChange,
}: OptionsPageProps) {
  const [tab, setTab] = useState<OptionsTab>('editor');

  return (
    <div className="options-page" hidden={hidden}>
      <header>
        <p className="eyebrow">Options</p>
        <h1>Налаштування</h1>
      </header>
      <OptionsTabs selected={tab} onSelect={setTab} />

      <section
        id="options-panel-editor"
        role="tabpanel"
        aria-labelledby="options-tab-editor"
        hidden={tab !== 'editor'}
      >
        <h2>Автоматичне коригування тексту</h2>
        <OptionToggle
          checked={editor.correctQuestionText}
          label="Текст питання"
          description="Капіталізувати перше слово та додавати крапку, якщо наприкінці немає розділового знака."
          onChange={(correctQuestionText) =>
            onEditorChange({ ...editor, correctQuestionText })
          }
        />
        <OptionToggle
          checked={editor.correctAnswers}
          label="Відповіді"
          description="Капіталізувати перше слово основної та альтернативних відповідей."
          onChange={(correctAnswers) =>
            onEditorChange({ ...editor, correctAnswers })
          }
        />
        <OptionToggle
          checked={editor.correctAnswerComment}
          label="Коментар до відповіді"
          description="Капіталізувати перше слово та додавати крапку, якщо наприкінці немає розділового знака."
          onChange={(correctAnswerComment) =>
            onEditorChange({ ...editor, correctAnswerComment })
          }
        />
      </section>

      <section
        id="options-panel-game"
        role="tabpanel"
        aria-labelledby="options-tab-game"
        hidden={tab !== 'game'}
      >
        <h2>Game</h2>
        <p className="options-empty">Налаштувань гри поки немає.</p>
      </section>
    </div>
  );
}
