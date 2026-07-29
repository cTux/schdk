import { safeStorage } from 'electron';

export function canPersistApiKey() {
  return (
    safeStorage.isEncryptionAvailable() &&
    !(
      process.platform === 'linux' &&
      safeStorage.getSelectedStorageBackend() === 'basic_text'
    )
  );
}
