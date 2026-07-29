import { type CloseController } from './close-controller.js';
import { type ClosableWindow } from './closable-window.js';
import { requestSaveBeforeClose } from './request-save-before-close.js';

const CLOSE_TIMEOUT_MS = 10_000;

export {
  CLOSE_TIMEOUT_MS,
  type CloseController,
  type ClosableWindow,
  requestSaveBeforeClose,
};
