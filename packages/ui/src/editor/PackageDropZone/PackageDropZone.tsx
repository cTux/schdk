import { useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';

export interface PackageDropZoneProps {
  disabled?: boolean;
  hidden: boolean;
  onCreate?(): void;
  onOpen(file: File): void;
}

export function PackageDropZone({
  disabled = false,
  hidden,
  onCreate,
  onOpen,
}: PackageDropZoneProps) {
  const { copy } = useLocalization();
  const openFileInput = useRef<HTMLInputElement>(null);

  function selectPackage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!disabled && file) onOpen(file);
    event.target.value = '';
  }

  function dropPackage(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    if (disabled) return;
    const file = event.dataTransfer.files[0];
    if (file) onOpen(file);
  }

  return (
    <>
      <section
        className="package-drop-zone"
        hidden={hidden}
        aria-disabled={disabled}
        onDragOver={(event) => event.preventDefault()}
        onDrop={dropPackage}
      >
        <h2>{copy.editor.openPackage}</h2>
        <p>{copy.editor.dropPackage}</p>
        <div className="drop-actions">
          <Button
            type="button"
            disabled={disabled}
            onClick={() => openFileInput.current?.click()}
          >
            {copy.shared.chooseFile}
          </Button>
          {onCreate && (
            <>
              <span>{copy.shared.or}</span>
              <Button
                variant="primary"
                type="button"
                disabled={disabled}
                onClick={onCreate}
              >
                {copy.editor.newPackage}
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
        disabled={disabled}
        onChange={selectPackage}
      />
    </>
  );
}
