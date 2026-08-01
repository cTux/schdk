import './styles.scss';
import { useRef, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import type { GamePackageActionsProps } from './types';

function GamePackageActions({
  disabled = false,
  hidden,
  compact = false,
  onCreate,
  onOpen,
}: GamePackageActionsProps) {
  const { copy } = useLocalization();
  const input = useRef<HTMLInputElement>(null);
  function select(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!disabled && file) onOpen(file);
    event.target.value = '';
  }
  function drop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!disabled && file) onOpen(file);
  }
  const openButton = (
    <Button
      disabled={disabled}
      type="button"
      onClick={() => input.current?.click()}
    >
      {copy.shared.chooseFile}
    </Button>
  );
  const createButton = onCreate && (
    <Button
      disabled={disabled}
      type="button"
      variant="primary"
      onClick={onCreate}
    >
      {copy.editor.newPackage}
    </Button>
  );
  return (
    <>
      {compact ? (
        <div className="package-actions">
          {openButton}
          {createButton}
        </div>
      ) : (
        <section
          aria-disabled={disabled}
          className="package-drop-zone"
          hidden={hidden}
          onDragOver={(event) => event.preventDefault()}
          onDrop={drop}
        >
          <h2>{copy.editor.openPackage}</h2>
          <p>{copy.editor.dropPackage}</p>
          <div className="drop-actions">
            {openButton}
            {createButton && <span>{copy.shared.or}</span>}
            {createButton}
          </div>
        </section>
      )}
      <input
        ref={input}
        accept=".schdk"
        className="open-file-input"
        disabled={disabled}
        type="file"
        onChange={select}
      />
    </>
  );
}

export { GamePackageActions };
