import { useState } from 'react';
import { Button } from '../atoms/Button';
import { OptionToggle } from './OptionToggle';
import { OptionsTabs, type OptionsTab } from './OptionsTabs';
import type { EditorTextOptions, GameOptions } from './types';

interface OptionsPageProps {
  editor: EditorTextOptions;
  game: GameOptions;
  hidden: boolean;
  onEditorChange(options: EditorTextOptions): void;
  onGameChange(options: GameOptions): void;
}

export function OptionsPage({
  editor,
  game,
  hidden,
  onEditorChange,
  onGameChange,
}: OptionsPageProps) {
  const [tab, setTab] = useState<OptionsTab>('editor');

  return (
    <div className="options-page" hidden={hidden}>
      <header>
        <p className="eyebrow">Налаштування</p>
        <h1>Налаштування</h1>
      </header>
      <div
        className="options-tabs options-primary-tabs"
        role="tablist"
        aria-label="Групи налаштувань"
      >
        <Button
          type="button"
          role="tab"
          id="options-group-tab-schdk"
          aria-controls="options-group-panel-schdk"
          aria-selected="true"
          className="active"
        >
          ЩДК
        </Button>
      </div>

      <div
        id="options-group-panel-schdk"
        role="tabpanel"
        aria-labelledby="options-group-tab-schdk"
      >
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
          <h2>Гра</h2>
          <label className="option-slider">
            <span>
              <strong>Гучність звукових сигналів</strong>
              <small>Головний сигнал і попередження таймера.</small>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(game.soundVolume * 100)}
              onChange={(event) =>
                onGameChange({
                  soundVolume: Number(event.target.value) / 100,
                })
              }
            />
            <output>{Math.round(game.soundVolume * 100)}%</output>
          </label>
        </section>
      </div>
    </div>
  );
}
