import { useEffect, useState } from 'react';

type View = 'home' | 'host' | 'editor';

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

const APP_URLS = import.meta.env.DEV
  ? {
      host: 'http://127.0.0.1:5174',
      editor: 'http://127.0.0.1:5175',
    }
  : { host: './apps/host/index.html', editor: './apps/editor/index.html' };

export function App() {
  const [view, setView] = useState<View>('home');
  const [loadedApps, setLoadedApps] = useState({ host: false, editor: false });

  useEffect(() => {
    if (loadedApps.editor) return;
    return window.desktop?.onCloseRequested((attempt) => {
      window.desktop!.finishCloseAttempt(attempt, true);
    });
  }, [loadedApps.editor]);

  function showView(nextView: View) {
    if (nextView !== 'home') {
      setLoadedApps((current) => ({ ...current, [nextView]: true }));
    }
    setView(nextView);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="./owl.svg" alt="" />
          <div>
            <strong>Що? Де? Коли?</strong>
            <span>Інструменти</span>
          </div>
        </div>

        <nav aria-label="Інструменти">
          {ITEMS.map((item) => (
            <button
              className={item.id === view ? 'active' : ''}
              type="button"
              key={item.id}
              onClick={() => showView(item.id)}
              aria-current={item.id === view ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </button>
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
              <button
                type="button"
                key={item.id}
                onClick={() => showView(item.id)}
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
              </button>
            ))}
          </div>
        </div>
        {loadedApps.host && (
          <iframe
            className="embedded-app"
            src={APP_URLS.host}
            title={ITEMS[1].label}
            hidden={view !== 'host'}
          />
        )}
        {loadedApps.editor && (
          <iframe
            className="embedded-app"
            src={APP_URLS.editor}
            title={ITEMS[2].label}
            hidden={view !== 'editor'}
          />
        )}
      </section>
    </main>
  );
}
