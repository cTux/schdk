import { AppUpdateButton as UpdateButton } from '@schdk/ui';
import { useAppUpdate } from './use-app-update';

export function AppUpdateButton() {
  const { activateUpdate, updateAvailable } = useAppUpdate();

  if (!updateAvailable) return null;
  return <UpdateButton onClick={activateUpdate} />;
}
