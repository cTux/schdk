import { AppIcon } from '../atoms/AppIcon';
import { Button } from '../atoms/Button';
import '../styles/shell.scss';

export type ShellViewName = 'home' | 'host' | 'editor';

const ITEMS = [
  {
    id: 'home',
    icon: '⌂',
    label: 'Домашня',
    description: 'Огляд інструментів для підготовки та проведення гри.',
  },
  {
    id: 'host',
    icon: '▶',
    label: 'ЩДК Хост',
    description: 'Запускайте готовий пакет і проводьте гру для команд.',
  },
  {
    id: 'editor',
    icon: '✎',
    label: 'ЩДК Редактор',
    description: 'Створюйте та редагуйте пакети запитань у форматі .schdk.',
  },
] as const;

interface ShellViewProps {
  appUrls: { host: string; editor: string };
  loadedApps: { host: boolean; editor: boolean };
  view: ShellViewName;
  onShowView(view: ShellViewName): void;
}

export function ShellView({
  appUrls,
  loadedApps,
  view,
  onShowView,
}: ShellViewProps) {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <AppIcon />
          <div>
            <strong>Що? Де? Коли?</strong>
            <span>Інструменти</span>
          </div>
        </div>

        <nav aria-label="Інструменти">
          {ITEMS.map((item) => (
            <Button
              variant="ghost"
              className={item.id === view ? 'active' : ''}
              type="button"
              key={item.id}
              onClick={() => onShowView(item.id)}
              aria-current={item.id === view ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Button>
          ))}
        </nav>

        <p className="sidebar-note">SCHDK</p>
      </aside>

      <section className="workspace">
        <div className="home" hidden={view !== 'home'}>
          <header>
            <p className="eyebrow">Домашня</p>
            <h1>Усе для гри в одному місці</h1>
            <p>
              Створіть пакет запитань у редакторі, а потім відкрийте його в
              хості для проведення гри.
            </p>
          </header>

          <div className="tool-list">
            {ITEMS.slice(1).map((item) => (
              <Button
                type="button"
                key={item.id}
                onClick={() => onShowView(item.id)}
              >
                <span className="tool-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Button>
            ))}
          </div>
        </div>
        {loadedApps.host && (
          <iframe
            className="embedded-app"
            src={appUrls.host}
            title={ITEMS[1].label}
            hidden={view !== 'host'}
          />
        )}
        {loadedApps.editor && (
          <iframe
            className="embedded-app"
            src={appUrls.editor}
            title={ITEMS[2].label}
            hidden={view !== 'editor'}
          />
        )}
      </section>
    </main>
  );
}
