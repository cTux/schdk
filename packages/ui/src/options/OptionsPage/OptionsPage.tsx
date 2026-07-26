import classNames from 'classnames';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { useLocalization } from '../../localization';
import { AiOptionsPanel } from '../AiOptionsPanel';
import { OptionSlider } from '../OptionSlider';
import { OptionToggle } from '../OptionToggle';
import { SETTINGS_GROUPS, type AppTheme } from '../types';
import { getGoogleDriveMessage } from './google-drive-message';
import type { OptionsPageProps } from './types';

export function OptionsPage({
  ai,
  editor,
  game,
  googleDriveAccount,
  googleDriveState,
  hidden,
  settingsGroup,
  theme,
  onAiApiKeySave,
  onAiModelChange,
  onAiProviderChange,
  onEditorChange,
  onGameChange,
  onGoogleDriveConnect,
  onGoogleDriveDisconnect,
  onSettingsGroupChange,
  onThemeChange,
}: OptionsPageProps) {
  const { copy, locale, onLocaleChange } = useLocalization();

  return (
    <div className="options-page" hidden={hidden}>
      <header>
        <h1>{copy.settings.title}</h1>
      </header>
      <div
        className={classNames('options-tabs', 'options-primary-tabs')}
        role="tablist"
        aria-label={copy.settings.groupsLabel}
      >
        {SETTINGS_GROUPS.map((item) => (
          <Button
            key={item}
            type="button"
            role="tab"
            id={`options-group-tab-${item}`}
            aria-controls={`options-group-panel-${item}`}
            aria-selected={settingsGroup === item}
            className={settingsGroup === item ? 'active' : ''}
            onClick={() => onSettingsGroupChange(item)}
          >
            {copy.settings[`${item}Tab`]}
          </Button>
        ))}
      </div>

      <section
        id="options-group-panel-app"
        role="tabpanel"
        aria-labelledby="options-group-tab-app"
        hidden={settingsGroup !== 'app'}
      >
        <label className="option-select">
          <span>
            <strong>{copy.settings.languageLabel}</strong>
          </span>
          <Dropdown
            value={locale}
            onChange={(event) =>
              onLocaleChange(event.target.value as 'uk' | 'en')
            }
          >
            <option value="uk">{copy.settings.ukrainian}</option>
            <option value="en">{copy.settings.english}</option>
          </Dropdown>
        </label>
        <label className="option-select">
          <span>
            <strong>{copy.settings.themeLabel}</strong>
          </span>
          <Dropdown
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as AppTheme)}
          >
            <option value="system">{copy.settings.systemTheme}</option>
            <option value="light">{copy.settings.lightTheme}</option>
            <option value="dark">{copy.settings.darkTheme}</option>
          </Dropdown>
        </label>
        <div className="option-select">
          <span>
            <strong>{copy.settings.googleDriveHeading}</strong>
            <small aria-live="polite">
              {getGoogleDriveMessage(
                googleDriveState,
                googleDriveAccount,
                copy,
              )}
            </small>
          </span>
          {googleDriveState === 'connected' ? (
            <Button
              type="button"
              className={classNames(
                'google-drive-action',
                'google-drive-disconnect',
              )}
              onClick={onGoogleDriveDisconnect}
            >
              {copy.settings.googleDriveDisconnect}
            </Button>
          ) : (
            <Button
              type="button"
              className="google-drive-action"
              disabled={
                googleDriveState === 'unavailable' ||
                googleDriveState === 'connecting'
              }
              onClick={onGoogleDriveConnect}
            >
              {googleDriveState === 'reauthorization-required'
                ? copy.settings.googleDriveReconnectAction
                : copy.settings.googleDriveConnect}
            </Button>
          )}
        </div>
        <section
          className="options-shortcuts"
          aria-labelledby="options-shortcuts-title"
        >
          <h2 id="options-shortcuts-title">{copy.settings.shortcutsTitle}</h2>
          {copy.settings.shortcutGroups.map((shortcutGroup) => (
            <div key={shortcutGroup.heading}>
              <h3>{shortcutGroup.heading}</h3>
              <dl>
                {shortcutGroup.items.map((shortcut) => (
                  <div key={shortcut.label}>
                    <dt>{shortcut.label}</dt>
                    <dd>
                      <kbd>{shortcut.keys}</kbd>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </section>
      </section>

      <div
        id="options-group-panel-schdk"
        role="tabpanel"
        aria-labelledby="options-group-tab-schdk"
        hidden={settingsGroup !== 'schdk'}
      >
        <fieldset className="options-fieldset">
          <legend>{copy.settings.gameTab}</legend>
          <OptionToggle
            checked={game.autoFullscreen}
            label={copy.settings.autoFullscreen}
            description={copy.settings.autoFullscreenDescription}
            onChange={(autoFullscreen) =>
              onGameChange({ ...game, autoFullscreen })
            }
          />
          <OptionSlider
            label={copy.settings.signalVolume}
            description={copy.settings.signalVolumeDescription}
            value={game.soundVolume}
            onChange={(soundVolume) => onGameChange({ ...game, soundVolume })}
          />
          <OptionSlider
            label={copy.settings.musicVolume}
            description={copy.settings.musicVolumeDescription}
            value={game.musicVolume}
            onChange={(musicVolume) => onGameChange({ ...game, musicVolume })}
          />
        </fieldset>

        <fieldset className="options-fieldset">
          <legend>{copy.settings.editorTab}</legend>
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
        </fieldset>
      </div>
      <div
        id="options-group-panel-artificialIntelligence"
        role="tabpanel"
        aria-labelledby="options-group-tab-artificialIntelligence"
        hidden={settingsGroup !== 'artificialIntelligence'}
      >
        <AiOptionsPanel
          options={ai}
          onApiKeySave={onAiApiKeySave}
          onModelChange={onAiModelChange}
          onProviderChange={onAiProviderChange}
        />
      </div>
    </div>
  );
}
