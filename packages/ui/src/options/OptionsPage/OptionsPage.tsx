import classNames from 'classnames';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import { OptionToggle } from '../OptionToggle';
import { OptionsTabs, type OptionsTab } from '../OptionsTabs';
import type { AppTheme, EditorTextOptions, GameOptions } from '../types';

export interface OptionsPageProps {
  editor: EditorTextOptions;
  game: GameOptions;
  hidden: boolean;
  theme: AppTheme;
  onEditorChange(options: EditorTextOptions): void;
  onGameChange(options: GameOptions): void;
  onThemeChange(theme: AppTheme): void;
}

export function OptionsPage({
  editor,
  game,
  hidden,
  theme,
  onEditorChange,
  onGameChange,
  onThemeChange,
}: OptionsPageProps) {
  const { copy, locale, onLocaleChange } = useLocalization();
  const [group, setGroup] = useState<'app' | 'schdk'>('app');
  const [tab, setTab] = useState<OptionsTab>('editor');

  return (
    <div className="options-page" hidden={hidden}>
      <header>
        <p className="eyebrow">{copy.settings.title}</p>
        <h1>{copy.settings.title}</h1>
      </header>
      <div
        className={classNames('options-tabs', 'options-primary-tabs')}
        role="tablist"
        aria-label={copy.settings.groupsLabel}
      >
        <Button
          type="button"
          role="tab"
          id="options-group-tab-app"
          aria-controls="options-group-panel-app"
          aria-selected={group === 'app'}
          className={group === 'app' ? 'active' : ''}
          onClick={() => setGroup('app')}
        >
          {copy.settings.appTab}
        </Button>
        <Button
          type="button"
          role="tab"
          id="options-group-tab-schdk"
          aria-controls="options-group-panel-schdk"
          aria-selected={group === 'schdk'}
          className={group === 'schdk' ? 'active' : ''}
          onClick={() => setGroup('schdk')}
        >
          {copy.settings.schdkTab}
        </Button>
      </div>

      <section
        id="options-group-panel-app"
        role="tabpanel"
        aria-labelledby="options-group-tab-app"
        hidden={group !== 'app'}
      >
        <h2>{copy.settings.languageHeading}</h2>
        <label className="option-select">
          <span>
            <strong>{copy.settings.languageLabel}</strong>
          </span>
          <select
            value={locale}
            onChange={(event) =>
              onLocaleChange(event.target.value as 'uk' | 'en')
            }
          >
            <option value="uk">{copy.settings.ukrainian}</option>
            <option value="en">{copy.settings.english}</option>
          </select>
        </label>
        <label className="option-select">
          <span>
            <strong>{copy.settings.themeLabel}</strong>
          </span>
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as AppTheme)}
          >
            <option value="system">{copy.settings.systemTheme}</option>
            <option value="light">{copy.settings.lightTheme}</option>
            <option value="dark">{copy.settings.darkTheme}</option>
          </select>
        </label>
      </section>

      <div
        id="options-group-panel-schdk"
        role="tabpanel"
        aria-labelledby="options-group-tab-schdk"
        hidden={group !== 'schdk'}
      >
        <OptionsTabs copy={copy} selected={tab} onSelect={setTab} />

        <section
          id="options-panel-editor"
          role="tabpanel"
          aria-labelledby="options-tab-editor"
          hidden={tab !== 'editor'}
        >
          <h2>{copy.settings.textCorrection}</h2>
          <OptionToggle
            checked={editor.correctQuestionText}
            label={copy.settings.questionText}
            description={copy.settings.sentenceCorrection}
            onChange={(correctQuestionText) =>
              onEditorChange({ ...editor, correctQuestionText })
            }
          />
          <OptionToggle
            checked={editor.correctAnswers}
            label={copy.settings.answers}
            description={copy.settings.answersCorrection}
            onChange={(correctAnswers) =>
              onEditorChange({ ...editor, correctAnswers })
            }
          />
          <OptionToggle
            checked={editor.correctAnswerComment}
            label={copy.settings.answerComment}
            description={copy.settings.sentenceCorrection}
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
          <h2>{copy.settings.game}</h2>
          <label className="option-slider">
            <span>
              <strong>{copy.settings.signalVolume}</strong>
              <small>{copy.settings.signalVolumeDescription}</small>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(game.soundVolume * 100)}
              onChange={(event) =>
                onGameChange({
                  ...game,
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
