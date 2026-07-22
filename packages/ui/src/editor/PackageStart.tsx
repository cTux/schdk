import { useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '../atoms/Button';
import type { RecentPackageItem } from './types';

interface PackageStartProps {
  hidden: boolean;
  isDesktop: boolean;
  recentPackages: RecentPackageItem[];
  onCreatePackage(): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
}

export function PackageStart({
  hidden,
  isDesktop,
  recentPackages,
  onCreatePackage,
  onOpenPackage,
  onOpenRecentPackage,
}: PackageStartProps) {
  const openFileInput = useRef<HTMLInputElement>(null);

  function selectPackage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onOpenPackage(file);
    event.target.value = '';
  }

  function dropPackage(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) onOpenPackage(file);
  }

  return (
    <>
      <section
        className="package-drop-zone"
        hidden={hidden}
        onDragOver={(event) => event.preventDefault()}
        onDrop={dropPackage}
      >
        <h2>Відкрийте пакет</h2>
        <p>Перетягніть сюди файл .schdk</p>
        <div className="drop-actions">
          <Button type="button" onClick={() => openFileInput.current?.click()}>
            Вибрати файл
          </Button>
          <span>або</span>
          <Button variant="primary" type="button" onClick={onCreatePackage}>
            Новий пакет
          </Button>
        </div>
      </section>

      {recentPackages.length > 0 && (
        <section className="recent-packages" hidden={hidden}>
          <div className="recent-packages-heading">
            <h2>Недавні пакети</h2>
            {!isDesktop && <p>Збережені копії в цьому браузері</p>}
          </div>
          <div className="recent-package-list">
            {recentPackages.map((recent) => (
              <Button
                key={recent.id}
                type="button"
                onClick={() => onOpenRecentPackage(recent)}
                title={recent.name}
              >
                <span>{recent.name}</span>
                <span className="recent-package-arrow" aria-hidden="true">
                  →
                </span>
              </Button>
            ))}
          </div>
        </section>
      )}

      <input
        ref={openFileInput}
        className="open-file-input"
        type="file"
        accept=".schdk"
        onChange={selectPackage}
      />
    </>
  );
}
