import {
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { useRef, useState, type PointerEvent } from 'react';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from './constants';

export function clampImageZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export interface ZoomableImageProps {
  alt: string;
  openLabel: string;
  src: string;
  title: string;
}

export function ZoomableImage({
  alt,
  openLabel,
  src,
  title,
}: ZoomableImageProps) {
  const { copy } = useLocalization();
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
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <>
      <Button
        className="handout-thumbnail"
        type="button"
        onClick={open}
        aria-label={openLabel}
      >
        <img src={src} alt={alt} />
      </Button>
      <dialog
        className="handout-dialog"
        ref={dialog}
        aria-label={title}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <header>
          <strong>{title}</strong>
          <div className="handout-dialog-actions">
            <IconButton
              icon={faMagnifyingGlassMinus}
              label={copy.shared.zoomOut}
              disabled={zoom === MIN_ZOOM}
              onClick={() =>
                setZoom((current) => clampImageZoom(current - ZOOM_STEP))
              }
            />
            <span aria-live="polite">{zoom * 100}%</span>
            <IconButton
              icon={faMagnifyingGlassPlus}
              label={copy.shared.zoomIn}
              disabled={zoom === MAX_ZOOM}
              onClick={() =>
                setZoom((current) => clampImageZoom(current + ZOOM_STEP))
              }
            />
            <IconButton
              icon={faXmark}
              label={copy.shared.close}
              onClick={close}
            />
          </div>
        </header>
        <div
          className={classNames('handout-dialog-viewport', {
            pannable: zoom > MIN_ZOOM,
          })}
          ref={viewport}
          onPointerDown={startPanning}
          onPointerMove={pan}
          onPointerUp={stopPanning}
          onPointerCancel={stopPanning}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            style={{ width: `${zoom * 100}%` }}
          />
        </div>
      </dialog>
    </>
  );
}
