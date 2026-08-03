import classNames from 'classnames';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { useLocalization } from '../../localization';
import { Page } from '../../shell/Page';
import { AiOptionsPanel } from '../AiOptionsPanel';
import { OptionSlider } from '../OptionSlider';
import { OptionToggle } from '../OptionToggle';
import { SETTINGS_GROUPS, type AppFont, type AppTheme } from '../types';
import { getGoogleDriveMessage } from './utils/google-drive-message';
import type { OptionsPageProps } from './types';

export function OptionsPage({
  hidden,
  artificialIntelligence: {
    options: ai,
    onApiKeySave: onAiApiKeySave,
    onModelChange: onAiModelChange,
    onProviderChange: onAiProviderChange,
  },
  application: {
    font,
    googleDriveAccount,
    googleDriveState,
    theme,
    uiAnimations,
    onFontChange,
    onGoogleDriveConnect,
    onGoogleDriveDisconnect,
    onThemeChange,
    onUiAnimationsChange,
  },
  navigation: { settingsGroup, onBack, onSettingsGroupChange },
  schdk: { editor, game, onEditorChange, onGameChange },
}: OptionsPageProps) {
  const { copy, locale, onLocaleChange } = useLocalization();

  return (
    <Page
      className="options-page"
      hidden={hidden}
      title={copy.settings.title}
      headerContent={<p>{copy.settings.description}</p>}
      onBack={onBack}
    >
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
        <label className="option-select">
          <span>
            <strong>{copy.settings.fontLabel}</strong>
          </span>
          <Dropdown
            value={font}
            onChange={(event) => onFontChange(event.target.value as AppFont)}
          >
            <option value="comfortable">{copy.settings.comfortableFont}</option>
            <option value="system">{copy.settings.systemFont}</option>
            <option value="verdana">Verdana</option>
            <option value="georgia">Georgia</option>
          </Dropdown>
        </label>
        <OptionToggle
          checked={uiAnimations}
          label={copy.settings.uiAnimations}
          description={copy.settings.uiAnimationsDescription}
          onChange={onUiAnimationsChange}
        />
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
              className="google-drive-action"
              onClick={onGoogleDriveDisconnect}
            >
              {copy.settings.googleDriveDisconnect}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
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
    </Page>
  );
}
