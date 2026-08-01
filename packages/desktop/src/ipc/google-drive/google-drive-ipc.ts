import { registerGoogleDriveAccountIpc } from './register-google-drive-account-ipc.js';
import { registerGoogleDriveAiContentIpc } from './register-google-drive-ai-content-ipc.js';
import { registerGoogleDriveGamePackageIpc } from './register-google-drive-game-package-ipc.js';
import { registerGoogleDriveSettingsIpc } from './register-google-drive-settings-ipc.js';

export function registerGoogleDriveIpc() {
  registerGoogleDriveAccountIpc();
  registerGoogleDriveSettingsIpc();
  registerGoogleDriveGamePackageIpc();
  registerGoogleDriveAiContentIpc();
}
