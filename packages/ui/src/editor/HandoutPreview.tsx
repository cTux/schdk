import type { Handout } from '@schdk/common';
import {
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef, useState, type PointerEvent } from 'react';
import { Button } from '../atoms/Button';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export function clampHandoutZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

interface HandoutPreviewProps {
  handout: Handout;
  onRemove(): void;
}

export function HandoutPreview({ handout, onRemove }: HandoutPreviewProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  function open() {
    setZoom(MIN_ZOOM);
    viewport.current?.scrollTo(0, 0);
    dialog.current?.showModal();
  }

  function close() {
    dialog.current?.close();
  }

  function startPanning(event: PointerEvent<HTMLDivElement>) {
    if (zoom === MIN_ZOOM) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
    };
  }

  function pan(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    event.currentTarget.scrollLeft =
      drag.current.scrollLeft - (event.clientX - drag.current.x);
    event.currentTarget.scrollTop =
      drag.current.scrollTop - (event.clientY - drag.current.y);
  }

  function stopPanning(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === event.pointerId) {
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  }

  return (
    <div className="handout-preview">
      <Button
        className="handout-thumbnail"
        type="button"
        onClick={open}
        aria-label="Відкрити роздатку у повному розмірі"
      >
        <img src={handout.dataUrl} alt="Роздатка до питання" />
      </Button>
      <Button className="handout-remove" type="button" onClick={onRemove}>
        Видалити
      </Button>

      <dialog
        className="handout-dialog"
        ref={dialog}
        aria-label="Перегляд роздатки"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <header>
          <strong>Роздатка</strong>
          <div className="handout-dialog-actions">
            <Button
              type="button"
              disabled={zoom === MIN_ZOOM}
              onClick={() =>
                setZoom((current) => clampHandoutZoom(current - ZOOM_STEP))
              }
              aria-label="Зменшити"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassMinus} aria-hidden />
            </Button>
            <span aria-live="polite">{zoom * 100}%</span>
            <Button
              type="button"
              disabled={zoom === MAX_ZOOM}
              onClick={() =>
                setZoom((current) => clampHandoutZoom(current + ZOOM_STEP))
              }
              aria-label="Збільшити"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassPlus} aria-hidden />
            </Button>
            <Button type="button" onClick={close} aria-label="Закрити">
              <FontAwesomeIcon icon={faXmark} aria-hidden />
            </Button>
          </div>
        </header>
        <div
          className={`handout-dialog-viewport${zoom > MIN_ZOOM ? ' pannable' : ''}`}
          ref={viewport}
          onPointerDown={startPanning}
          onPointerMove={pan}
          onPointerUp={stopPanning}
          onPointerCancel={stopPanning}
        >
          <img
            src={handout.dataUrl}
            alt="Роздатка до питання"
            draggable={false}
            style={{ width: `${zoom * 100}%` }}
          />
        </div>
      </dialog>
    </div>
  );
}
