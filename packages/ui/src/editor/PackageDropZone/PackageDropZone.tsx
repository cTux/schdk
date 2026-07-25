import './styles.scss';

import { useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '../../atoms/Button';

export interface PackageDropZoneProps {
  hidden: boolean;
  onCreate?(): void;
  onOpen(file: File): void;
}

export function PackageDropZone({
  hidden,
  onCreate,
  onOpen,
}: PackageDropZoneProps) {
  const openFileInput = useRef<HTMLInputElement>(null);

  function selectPackage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onOpen(file);
    event.target.value = '';
  }

  function dropPackage(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) onOpen(file);
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
          {onCreate && (
            <>
              <span>або</span>
              <Button variant="primary" type="button" onClick={onCreate}>
                Новий пакет
              </Button>
            </>
          )}
        </div>
      </section>
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
