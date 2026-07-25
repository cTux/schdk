import { ukrainianSettings } from './ukrainian-settings';

export const englishSettings: typeof ukrainianSettings = {
  title: 'Settings',
  groupsLabel: 'Settings groups',
  appTab: 'App',
  schdkTab: 'WWW',
  languageHeading: 'App language',
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
  schdkTabsLabel: 'WWW settings',
  gameTab: 'Hosting',
  editorTab: 'Question editing',
  textCorrection: 'Automatic text correction',
  questionText: 'Question text',
  sentenceCorrection:
    'Capitalize the first word and add a period when no punctuation ends the text.',
  answers: 'Answers',
  answersCorrection:
    'Capitalize the first word of the main, alternative, and wrong answers.',
  answerComment: 'Answer comment',
  game: 'Game',
  signalVolume: 'Signal volume',
  signalVolumeDescription: 'Main signal and timer warning.',
};
