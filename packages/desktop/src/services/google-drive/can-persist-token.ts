import { safeStorage } from 'electron';

export function canPersistToken() {
  return (
    safeStorage.isEncryptionAvailable() &&
    !(
      process.platform === 'linux' &&
      safeStorage.getSelectedStorageBackend() === 'basic_text'
    )
  );
}
