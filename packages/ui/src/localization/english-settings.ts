import { ukrainianSettings } from './ukrainian-settings';

export const englishSettings: typeof ukrainianSettings = {
  title: 'Settings',
  groupsLabel: 'Settings groups',
  appTab: 'App',
  schdkTab: 'WWW',
  artificialIntelligenceTab: 'Artificial intelligence',
  languageLabel: 'Language',
  ukrainian: 'Українська',
  english: 'English',
  themeLabel: 'Theme',
  systemTheme: 'System',
  lightTheme: 'Light',
  darkTheme: 'Dark',
  googleDriveHeading: 'Google Drive',
  googleDriveUnavailable:
    'Add an OAuth client ID to the application configuration.',
  googleDriveDisconnected: 'Not connected.',
  googleDriveConnecting: 'Connecting…',
  googleDriveConnected: (account) =>
    account ? `Connected: ${account}` : 'Connected.',
  googleDriveReconnect: 'Access must be granted again.',
  googleDriveError: 'Could not synchronize settings.',
  googleDriveConnect: 'Connect',
  googleDriveReconnectAction: 'Reconnect',
  googleDriveDisconnect: 'Disconnect',
  aiProviderModel: 'AI provider and model',
  aiProviderModelDescription:
    'Choose an AI service and model for question generation.',
  aiProvider: 'Provider',
  aiModel: 'Model',
  aiApiKey: 'API key',
  aiApiKeyDescription:
    "The key is stored in the current account's Google Drive app data.",
  aiApiKeyPlaceholder: 'Paste an API key',
  aiApiKeyConfigured: 'API key saved.',
  aiApiKeyMissing: 'No API key saved.',
  aiApiKeySave: 'Save',
  aiApiKeyRemove: 'Remove',
  aiApiKeySaveFailed: 'Could not save the API key.',
  shortcutsTitle: 'Keyboard shortcuts',
  shortcutGroups: [
    {
      heading: 'Game hosting',
      items: [
        { label: 'Next stage', keys: 'Space · PgDn · →' },
        { label: 'Previous stage', keys: 'Backspace · PgUp · ←' },
        { label: 'Exit game', keys: 'Alt + Q' },
      ],
    },
    {
      heading: 'Visual editor',
      items: [
        { label: 'Select element', keys: 'Enter · Space' },
        { label: 'Move element by 1%', keys: 'Arrow keys' },
        { label: 'Move element by 5%', keys: 'Shift + arrow keys' },
        { label: 'Delete custom element', keys: 'Delete' },
        { label: 'Select canvas', keys: 'Escape' },
      ],
    },
  ],
  gameTab: 'Hosting',
  editorTab: 'Question editing',
  questionText: 'Question text',
  sentenceCorrection:
    'Capitalize the first word and add a period when no punctuation ends the text.',
  answers: 'Answers',
  answersCorrection:
    'Capitalize the first word of the main, alternative, and wrong answers.',
  answerComment: 'Answer comment',
  autoFullscreen: 'Enter fullscreen automatically',
  autoFullscreenDescription: 'Enter fullscreen when the game starts.',
  signalVolume: 'Signal volume',
  signalVolumeDescription: 'Main signal and timer warning.',
  musicVolume: 'Music volume',
  musicVolumeDescription: 'Music during breaks between rounds.',
};
