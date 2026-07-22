import { AppIcon } from '../atoms/AppIcon';
import '../styles/host.scss';

export function HostView() {
  return (
    <main className="host-app">
      <header>
        <AppIcon />
        <h1>Що? Де? Коли?</h1>
      </header>
      <p>Вебклієнт для проведення гри.</p>
    </main>
  );
}
