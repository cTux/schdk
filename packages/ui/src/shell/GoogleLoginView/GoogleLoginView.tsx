import './styles.scss';

import { AppIcon } from '../../atoms/AppIcon';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import type { GoogleDriveState } from '../../options/OptionsPage';

export interface GoogleLoginViewProps {
  state: GoogleDriveState;
  onConnect(): void;
}

export function GoogleLoginView({ state, onConnect }: GoogleLoginViewProps) {
  const { copy } = useLocalization();
  const unavailable = state === 'unavailable';
  const connecting = state === 'connecting';
  const failed = state === 'error' || state === 'reauthorization-required';

  return (
    <main className="google-login-screen">
      <section className="google-login-card">
        <AppIcon />
        <p className="eyebrow">{copy.shell.brand}</p>
        <h1>{copy.shell.loginTitle}</h1>
        <p>{copy.shell.loginDescription}</p>
        {(failed || unavailable) && (
          <small role="alert">
            {unavailable
              ? copy.settings.googleDriveUnavailable
              : copy.settings.googleDriveError}
          </small>
        )}
        <Button
          type="button"
          variant="primary"
          disabled={unavailable || connecting}
          onClick={onConnect}
        >
          {connecting
            ? copy.settings.googleDriveConnecting
            : copy.shell.loginAction}
        </Button>
      </section>
    </main>
  );
}
